import json
import re
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException

from .auth import require_auth

from .config import DATA_DIR

DIRS_FILE = DATA_DIR / "dirs.json"

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".avif", ".tiff", ".jfif"}
VIDEO_EXT = {".mp4", ".mkv", ".webm", ".avi", ".mov", ".m4v", ".mpg", ".mpeg", ".ts", ".flv", ".wmv", ".3gp"}
AUDIO_EXT = {".mp3", ".flac", ".wav", ".ogg", ".m4a", ".aac", ".opus", ".wma", ".aiff"}

router = APIRouter(prefix="/api/dirs", dependencies=[Depends(require_auth)])


def _load() -> list[dict]:
    if not DIRS_FILE.exists():
        return []
    try:
        data = json.loads(DIRS_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _save(dirs: list[dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DIRS_FILE.write_text(json.dumps(dirs, ensure_ascii=False, indent=2), encoding="utf-8")


def get_dirs() -> list[dict]:
    return _load()


def get_dir(dir_id: str) -> dict:
    for d in _load():
        if d["id"] == dir_id:
            return d
    raise HTTPException(404, "Директория не найдена")


def safe_resolve(dir_id: str, rel_path: str) -> Path:
    entry = get_dir(dir_id)
    base = Path(entry["path"]).resolve()
    rel = (rel_path or "").strip()
    if rel in ("", ".", "/"):
        return base
    target = (base / rel).resolve()
    if target != base and base not in target.parents:
        raise HTTPException(403, "Путь вне директории запрещён")
    return target


def media_type(ext: str) -> str:
    ext = ext.lower()
    if ext in IMAGE_EXT:
        return "image"
    if ext in VIDEO_EXT:
        return "video"
    if ext in AUDIO_EXT:
        return "audio"
    return "file"


@router.get("")
def list_dirs():
    return get_dirs()


@router.post("")
def add_dir(body: dict):
    name = (body.get("name") or "").strip()
    raw_path = (body.get("path") or "").strip()
    if not raw_path:
        raise HTTPException(400, "Путь обязателен")
    expanded = Path(raw_path).expanduser()
    if not expanded.is_absolute():
        raise HTTPException(
            400,
            f"Путь должен быть абсолютным — начинаться с «/» (это путь на сервере, "
            f"а не на вашем компьютере). Например: /data/SomeFiles/DWN. Вы ввели: {raw_path}",
        )
    path = expanded.resolve()

    if not path.exists():
        if body.get("create_if_missing"):
            try:
                path.mkdir(parents=True, exist_ok=True)
            except OSError as exc:
                raise HTTPException(400, f"Не удалось создать {path}: {exc.strerror or exc}")
        else:
            raise HTTPException(
                400,
                f"Пути нет на сервере: {path}. Проверьте точное имя или включите "
                f"«Создать папку, если не существует».",
            )
    if not path.is_dir():
        raise HTTPException(400, "Это не директория")
    if not name:
        name = path.name or str(path)

    dirs = _load()
    if any(Path(d["path"]).resolve() == path for d in dirs):
        raise HTTPException(400, "Эта директория уже добавлена")

    entry = {"id": uuid.uuid4().hex[:8], "name": name, "path": str(path), "added": time.time()}
    dirs.append(entry)
    _save(dirs)
    return entry


@router.patch("/{dir_id}")
def update_dir(dir_id: str, body: dict):
    dirs = _load()
    entry = next((d for d in dirs if d["id"] == dir_id), None)
    if not entry:
        raise HTTPException(404, "Директория не найдена")

    name = (body.get("name") or "").strip()
    raw_path = (body.get("path") or "").strip()
    if raw_path:
        expanded = Path(raw_path).expanduser()
        if not expanded.is_absolute():
            raise HTTPException(
                400,
                f"Путь должен быть абсолютным — начинаться с «/». Вы ввели: {raw_path}",
            )
        path = expanded.resolve()
        if not path.is_dir():
            raise HTTPException(400, f"Пути нет на сервере: {path}")
        dup = any(d["id"] != dir_id and Path(d["path"]).resolve() == path for d in dirs)
        if dup:
            raise HTTPException(400, "Эта директория уже добавлена")
        entry["path"] = str(path)
    if name:
        entry["name"] = name
    _save(dirs)
    return entry


@router.delete("/{dir_id}")
def remove_dir(dir_id: str):
    dirs = _load()
    remaining = [d for d in dirs if d["id"] != dir_id]
    if len(remaining) == len(dirs):
        raise HTTPException(404, "Директория не найдена")
    _save(remaining)
    return {"ok": True}


SAFE_NAME_RE = re.compile(r'[<>:"\\|?*\x00-\x1f]')


def sanitize_filename(name: str) -> str:
    name = SAFE_NAME_RE.sub("_", name).strip(" .")
    return name[:200] or "file"
