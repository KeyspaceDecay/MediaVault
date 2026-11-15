import json
import socket

from fastapi import APIRouter, Depends, HTTPException

from .auth import require_auth
from .config import DATA_DIR

SETTINGS_FILE = DATA_DIR / "settings.json"
TOR_SOCKS = "socks5://127.0.0.1:9050"

ALLOWED_PROXY_SCHEMES = ("http://", "https://", "socks5://", "socks5h://", "socks4://")

DEFAULTS = {
    "proxy": "",
    "cookies_file": "",
}

router = APIRouter(prefix="/api/settings", tags=["settings"], dependencies=[Depends(require_auth)])


def load() -> dict:
    settings = dict(DEFAULTS)
    existed = SETTINGS_FILE.exists()
    if existed:
        try:
            data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                settings.update({k: data.get(k, v) for k, v in DEFAULTS.items()})
        except (json.JSONDecodeError, OSError):
            pass
    if not existed and tor_available():
        settings["proxy"] = TOR_SOCKS
        save(settings)
    return settings


def save(settings: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SETTINGS_FILE.write_text(json.dumps(settings, ensure_ascii=False, indent=2), encoding="utf-8")


def tor_available() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", 9050), timeout=0.5):
            return True
    except OSError:
        return False


def resolve_proxy(override: str | None) -> str | None:
    """Перекрытие прокси для конкретной задачи: none | tor | URL | ''(глобальные настройки)."""
    value = (override or "").strip()
    if value == "none":
        return None
    if value == "tor":
        return TOR_SOCKS
    if value:
        return value
    return load()["proxy"] or None


def resolve_cookiefile() -> str | None:
    path = load()["cookies_file"].strip()
    if not path:
        return None
    from pathlib import Path

    p = Path(path).expanduser()
    return str(p) if p.is_file() else None


@router.get("")
def get_settings():
    return {**load(), "tor_available": tor_available(), "tor_proxy": TOR_SOCKS}


@router.put("")
def put_settings(body: dict):
    settings = load()
    proxy = (body.get("proxy") or "").strip()
    if proxy and not proxy.startswith(ALLOWED_PROXY_SCHEMES):
        raise HTTPException(
            400,
            "Прокси должен начинаться с http://, https://, socks5://, socks5h:// или socks4://",
        )
    if proxy == "tor":
        proxy = TOR_SOCKS
    cookies = (body.get("cookies_file") or "").strip()
    if cookies and "://" in cookies:
        raise HTTPException(400, "cookies_file — это путь к локальному файлу cookies.txt")
    settings["proxy"] = proxy
    settings["cookies_file"] = cookies
    save(settings)
    return {**settings, "tor_available": tor_available(), "tor_proxy": TOR_SOCKS}
