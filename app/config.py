import os
import secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
THUMB_DIR = DATA_DIR / "thumbs"
ENV_PATH = ROOT / ".env"


def _parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            values[key] = value
    return values


def _append_env(path: Path, key: str, value: str) -> None:
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    if text and not text.endswith("\n"):
        text += "\n"
    text += f"{key}={value}\n"
    path.write_text(text, encoding="utf-8")


_env = _parse_env_file(ENV_PATH)

# yt-dlp: build extractors eagerly (faster first use per request)
os.environ.setdefault("YTDLP_NO_LAZY_EXTRACTORS", "1")

HOST = _env.get("HOST", "0.0.0.0")
PORT = int(_env.get("PORT", "8666"))
PASSWORD = _env.get("MEDIAVAULT_PASSWORD", "")

if not PASSWORD:
    PASSWORD = secrets.token_urlsafe(12)
    _append_env(ENV_PATH, "MEDIAVAULT_PASSWORD", PASSWORD)
    print(f"\n[MediaVault] Сгенерирован пароль для входа: {PASSWORD}\n"
          f"[MediaVault] Он сохранён в {ENV_PATH}\n")

SESSION_TTL = int(_env.get("SESSION_TTL", str(7 * 24 * 3600)))


def load_secret() -> bytes:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    secret_file = DATA_DIR / "secret.key"
    if secret_file.exists():
        data = secret_file.read_text(encoding="utf-8").strip()
        if data:
            return bytes.fromhex(data)
    key = secrets.token_hex(32)
    secret_file.write_text(key, encoding="utf-8")
    return bytes.fromhex(key)


SECRET = load_secret()
