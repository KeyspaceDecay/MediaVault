import hashlib
import mimetypes
import shutil
import subprocess
import time
from pathlib import Path
from urllib.parse import quote

from fastapi import HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image, ImageOps

from .config import THUMB_DIR
from .manager import media_type, router, safe_resolve

THUMB_SIZE = 420
THUMB_TTL = 7 * 24 * 3600


def _thumb_cache_path(path: Path, mtime: int) -> Path:
    key = hashlib.sha1(f"{path}:{mtime}".encode()).hexdigest()
    return THUMB_DIR / f"{key}.jpg"


def _video_thumb(src: Path, out: Path) -> bool:
    for seek in ("3", "0"):
        result = subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-loglevel", "error",
                "-ss", seek, "-i", str(src),
                "-frames:v", "1", "-vf", f"scale={THUMB_SIZE}:-2",
                "-q:v", "5", "-y", str(out),
            ],
            capture_output=True,
            timeout=30,
        )
        if result.returncode == 0 and out.exists() and out.stat().st_size > 0:
            return True
    out.unlink(missing_ok=True)
    return False


def _image_thumb(src: Path, out: Path) -> bool:
    try:
        with Image.open(src) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            img.thumbnail((THUMB_SIZE, THUMB_SIZE))
            img.save(out, "JPEG", quality=80)
        return True
    except Exception:  # noqa: BLE001
        out.unlink(missing_ok=True)
        return False


@router.get("/{dir_id}/thumb")
def thumb(dir_id: str, path: str = ""):
    src = safe_resolve(dir_id, path)
    if not src.is_file():
        raise HTTPException(404, "Файл не найден")
    kind = media_type(src.suffix)
    if kind not in ("image", "video"):
        raise HTTPException(404, "Миниатюра недоступна")

    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    mtime = int(src.stat().st_mtime)
    cached = _thumb_cache_path(src, mtime)
    if cached.exists() and time.time() - cached.stat().st_mtime < THUMB_TTL:
        return FileResponse(cached, media_type="image/jpeg", headers=_cache_headers())
    if kind == "video":
        ok = _video_thumb(src, cached)
    else:
        ok = _image_thumb(src, cached)
    if not ok:
        raise HTTPException(404, "Не удалось создать миниатюру")
    return FileResponse(cached, media_type="image/jpeg", headers=_cache_headers())


def _cache_headers() -> dict[str, str]:
    return {"Cache-Control": f"private, max-age={24 * 3600}"}


@router.get("/{dir_id}/list")
def list_dir(dir_id: str, path: str = ""):
    base = safe_resolve(dir_id, "")
    target = safe_resolve(dir_id, path)
    if not target.is_dir():
        raise HTTPException(404, "Папка не найдена")

    dirs, files = [], []
    try:
        entries = list(target.iterdir())
    except PermissionError:
        raise HTTPException(403, "Нет доступа к папке")

    for entry in entries:
        name = entry.name
        if name.startswith("."):
            continue
        try:
            stat = entry.stat()
        except OSError:
            continue
        if entry.is_dir():
            dirs.append({
                "name": name,
                "type": "dir",
                "mtime": int(stat.st_mtime),
            })
        elif entry.is_file():
            kind = media_type(entry.suffix)
            files.append({
                "name": name,
                "type": kind,
                "size": stat.st_size,
                "mtime": int(stat.st_mtime),
                "has_thumb": kind in ("image", "video"),
            })

    def sort_key(e):
        return e["name"].casefold()

    dirs.sort(key=sort_key)
    files.sort(key=sort_key)

    rel = str(target.relative_to(base)) if target != base else ""
    return {"path": rel, "dirs": dirs, "files": files}


def _content_disposition(filename: str, attachment: bool) -> str:
    from .manager import sanitize_filename

    ascii_name = sanitize_filename(filename.encode("ascii", "ignore").decode() or "file")
    encoded = quote(filename)
    disposition = "attachment" if attachment else "inline"
    return f"{disposition}; filename=\"{ascii_name}\"; filename*=UTF-8''{encoded}"


def _iter_file(path: Path, start: int, end: int):
    remaining = end - start + 1
    with path.open("rb") as fh:
        fh.seek(start)
        while remaining > 0:
            chunk = fh.read(min(remaining, 256 * 1024))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk


@router.get("/{dir_id}/file")
def get_file(dir_id: str, path: str = "", request: Request = None, dl: int = 0):
    src = safe_resolve(dir_id, path)
    if not src.is_file():
        raise HTTPException(404, "Файл не найден")

    stat = src.stat()
    media_type_str = mimetypes.guess_type(src.name)[0] or "application/octet-stream"
    disposition = _content_disposition(src.name, attachment=bool(dl))

    range_header = request.headers.get("range") if request else None
    if range_header:
        import re

        match = re.match(r"bytes=(\d*)-(\d*)", range_header)
        if match:
            start_s, end_s = match.groups()
            start = int(start_s) if start_s else 0
            end = int(end_s) if end_s else stat.st_size - 1
            end = min(end, stat.st_size - 1)
            if start > end or start >= stat.st_size:
                return StreamingResponse(
                    iter(()),
                    status_code=416,
                    headers={"Content-Range": f"bytes */{stat.st_size}"},
                )
            return StreamingResponse(
                _iter_file(src, start, end),
                status_code=206,
                media_type=media_type_str,
                headers={
                    "Content-Range": f"bytes {start}-{end}/{stat.st_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(end - start + 1),
                    "Content-Disposition": disposition,
                },
            )

    return FileResponse(
        src,
        media_type=media_type_str,
        headers={
            "Accept-Ranges": "bytes",
            "Content-Disposition": disposition,
        },
    )


@router.post("/{dir_id}/mkdir")
def mkdir(dir_id: str, body: dict):
    parent = safe_resolve(dir_id, body.get("path", ""))
    if not parent.is_dir():
        raise HTTPException(400, "Родительская папка не найдена")
    name = (body.get("name") or "").strip()
    if not name or "/" in name or name.startswith("."):
        raise HTTPException(400, "Некорректное имя папки")
    target = parent / name
    if target.exists():
        raise HTTPException(400, "Уже существует")
    target.mkdir()
    return {"ok": True}


@router.post("/{dir_id}/delete")
def delete_path(dir_id: str, body: dict):
    target = safe_resolve(dir_id, body.get("path", ""))
    if target == safe_resolve(dir_id, ""):
        raise HTTPException(403, "Нельзя удалить корень директории")
    if not target.exists():
        raise HTTPException(404, "Не найдено")
    if target.is_dir():
        shutil.rmtree(target)
    else:
        target.unlink()
    return {"ok": True}
