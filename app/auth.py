import hashlib
import hmac
import json
import secrets
import threading
import time

from fastapi import APIRouter, Cookie, HTTPException, Request, Response

from .config import DATA_DIR, PASSWORD, SESSION_TTL, scrub_env_password

COOKIE_NAME = "mv_auth"
AUTH_FILE = DATA_DIR / "auth.json"
PBKDF2_ITERATIONS = 600_000
MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 300

router = APIRouter(prefix="/api/auth", tags=["auth"])

_failed: dict[str, list[float]] = {}
_locks: dict[str, float] = {}
_io_lock = threading.Lock()


# ---------- Хранение пароля (PBKDF2-SHA256) ----------

def _pbkdf2(password: str, salt: bytes, iterations: int = PBKDF2_ITERATIONS) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations).hex()


def _load_creds() -> dict | None:
    if not AUTH_FILE.exists():
        return None
    try:
        data = json.loads(AUTH_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict) and data.get("salt") and data.get("hash"):
            return data
    except (json.JSONDecodeError, OSError, ValueError):
        pass
    return None


def set_password(password: str) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    salt = secrets.token_bytes(16)
    creds = {
        "algorithm": "pbkdf2-sha256",
        "iterations": PBKDF2_ITERATIONS,
        "salt": salt.hex(),
        "hash": _pbkdf2(password, salt),
    }
    with _io_lock:
        AUTH_FILE.write_text(json.dumps(creds, ensure_ascii=False, indent=2), encoding="utf-8")


def _hash_matches(password: str, creds: dict) -> bool:
    try:
        salt = bytes.fromhex(creds["salt"])
        iterations = int(creds.get("iterations", PBKDF2_ITERATIONS))
        return hmac.compare_digest(_pbkdf2(password, salt, iterations), creds["hash"])
    except (ValueError, TypeError):
        return False


def verify_password(password: str) -> bool:
    creds = _load_creds()
    if creds:
        return _hash_matches(password, creds)
    if PASSWORD:
        ok = hmac.compare_digest(
            hashlib.sha256(password.encode()).digest(),
            hashlib.sha256(PASSWORD.encode()).digest(),
        )
        if ok:
            set_password(password)
            scrub_env_password()
        return ok
    return False


def ensure_credentials() -> str | None:
    """Вызывается на старте: мигрирует пароль из .env в хэш или генерирует новый.
    Возвращает сгенерированный пароль (для вывода в консоль), либо None."""
    if _load_creds():
        return None
    if PASSWORD:
        set_password(PASSWORD)
        scrub_env_password()
        return None
    generated = secrets.token_urlsafe(12)
    set_password(generated)
    return generated


# ---------- Сессии ----------

def _sign(payload: str) -> str:
    from .config import SECRET

    return hmac.new(SECRET, payload.encode(), hashlib.sha256).hexdigest()


def issue_token() -> str:
    exp = str(int(time.time()) + SESSION_TTL)
    return f"{exp}.{_sign(exp)}"


def verify_token(token: str | None) -> bool:
    if not token or "." not in token:
        return False
    exp, _, sig = token.partition(".")
    if not exp.isdigit():
        return False
    if not hmac.compare_digest(sig, _sign(exp)):
        return False
    return int(exp) > time.time()


def require_auth(mv_auth: str | None = Cookie(default=None)) -> None:
    if not verify_token(mv_auth):
        raise HTTPException(401, "Не авторизован")


# ---------- Роуты ----------

def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "?"


def _locked(ip: str) -> float:
    until = _locks.get(ip, 0)
    return max(0.0, until - time.time())


@router.post("/login")
def login(body: dict, request: Request, response: Response):
    ip = _client_ip(request)
    remaining = _locked(ip)
    if remaining > 0:
        raise HTTPException(429, f"Слишком много попыток. Подождите {int(remaining)} с.")

    password = (body or {}).get("password", "")
    if not verify_password(password):
        now = time.time()
        attempts = [t for t in _failed.get(ip, []) if now - t < 600]
        attempts.append(now)
        _failed[ip] = attempts
        if len(attempts) >= MAX_ATTEMPTS:
            _locks[ip] = now + LOCKOUT_SECONDS
            _failed[ip] = []
            raise HTTPException(429, "Слишком много неудачных попыток. Блокировка на 5 минут.")
        raise HTTPException(401, "Неверный пароль")

    _failed.pop(ip, None)
    _locks.pop(ip, None)
    response.set_cookie(
        COOKIE_NAME,
        issue_token(),
        max_age=SESSION_TTL,
        httponly=True,
        samesite="lax",
        path="/",
    )
    return {"ok": True}


@router.post("/password")
def change_password(body: dict, request: Request, mv_auth: str | None = Cookie(default=None)):
    if not verify_token(mv_auth):
        raise HTTPException(401, "Не авторизован")

    ip = _client_ip(request)
    if _locked(ip) > 0:
        raise HTTPException(429, "Слишком много попыток")

    current = (body or {}).get("current", "")
    new = (body or {}).get("new", "")

    if not verify_password(current):
        now = time.time()
        attempts = [t for t in _failed.get(ip, []) if now - t < 600]
        attempts.append(now)
        _failed[ip] = attempts
        if len(attempts) >= MAX_ATTEMPTS:
            _locks[ip] = now + LOCKOUT_SECONDS
            _failed[ip] = []
        raise HTTPException(403, "Текущий пароль неверный")

    if len(new) < 8:
        raise HTTPException(400, "Новый пароль: минимум 8 символов")
    if not any(c.isdigit() for c in new) or not any(c.isalpha() for c in new):
        raise HTTPException(400, "Пароль должен содержать буквы и цифры")

    set_password(new)
    scrub_env_password()
    _failed.pop(ip, None)
    return {"ok": True}


@router.get("/status")
def status(mv_auth: str | None = Cookie(default=None)):
    return {"authenticated": verify_token(mv_auth)}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}
