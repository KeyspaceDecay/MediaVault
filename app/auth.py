import hashlib
import hmac
import time

from fastapi import APIRouter, Cookie, HTTPException, Request, Response

from .config import PASSWORD, SECRET, SESSION_TTL

COOKIE_NAME = "mv_auth"
MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 300

router = APIRouter(prefix="/api/auth", tags=["auth"])

_failed: dict[str, list[float]] = {}
_locks: dict[str, float] = {}


def _sign(payload: str) -> str:
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
    ok = hmac.compare_digest(
        hashlib.sha256(password.encode()).digest(),
        hashlib.sha256(PASSWORD.encode()).digest(),
    )
    if not ok:
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


@router.get("/status")
def status(mv_auth: str | None = Cookie(default=None)):
    return {"authenticated": verify_token(mv_auth)}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


def require_auth(mv_auth: str | None = Cookie(default=None)) -> None:
    if not verify_token(mv_auth):
        raise HTTPException(401, "Не авторизован")
