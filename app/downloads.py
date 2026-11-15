import re
import threading
import time
from pathlib import Path

import httpx
import yt_dlp
from fastapi import APIRouter, Depends, HTTPException

from . import jobs, settings as app_settings
from .auth import require_auth
from .manager import get_dir, sanitize_filename

router = APIRouter(prefix="/api", tags=["downloads"], dependencies=[Depends(require_auth)])

BEST_FORMAT = "bestvideo*+bestaudio/best"

YDL_BASE_OPTS = {
    "quiet": True,
    "no_warnings": True,
    "noplaylist": True,
    "socket_timeout": 25,
    "retries": 3,
    "geo_bypass": True,
    "remote_components": ["ejs:github"],
}


def _ydl_opts(proxy: str | None) -> dict:
    opts = {**YDL_BASE_OPTS}
    if proxy:
        opts["proxy"] = proxy
    cookiefile = app_settings.resolve_cookiefile()
    if cookiefile:
        opts["cookiefile"] = cookiefile
    return opts


def _friendly_error(exc: Exception) -> str:
    msg = str(exc) or exc.__class__.__name__
    if "Unsupported URL" in msg:
        return "Сайт не поддерживается yt-dlp"
    if "HTTP Error 404" in msg:
        return "Страница не найдена (404)"
    if "is not a valid URL" in msg:
        return "Некорректный URL"
    if "Sign in to confirm" in msg or "not a bot" in msg:
        return "YouTube требует подтверждение. Укажите cookies.txt в настройках"
    if "Sign in" in msg or "private" in msg.lower():
        return "Видео недоступно: требуется вход или оно приватное"
    if "Confirm your age" in msg:
        return "Видео с возрастным ограничением"
    if "proxy" in msg.lower() or "socks" in msg.lower() or "Connection refused" in msg:
        return "Не удалось подключиться к прокси/Tor. Проверьте, что он запущен"
    if "handshake operation timed out" in msg:
        return "Соединение заблокировано или недоступно. Попробуйте включить прокси/Tor в настройках"
    if "timed out" in msg.lower() or "timeout" in msg.lower():
        return "Превышено время ожидания. Попробуйте ещё раз или включите прокси"
    return msg[:300]


def _check_url(url: str) -> str:
    url = (url or "").strip()
    if not re.match(r"^https?://", url):
        raise HTTPException(400, "URL должен начинаться с http:// или https://")
    return url


@router.post("/ytdlp/formats")
def ytdlp_formats(body: dict):
    url = _check_url(body.get("url", ""))
    proxy = app_settings.resolve_proxy(body.get("proxy"))
    try:
        with yt_dlp.YoutubeDL({**_ydl_opts(proxy), "skip_download": True}) as ydl:
            info = ydl.extract_info(url, download=False)
    except yt_dlp.utils.DownloadError as exc:
        raise HTTPException(422, _friendly_error(exc))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(422, _friendly_error(exc))

    if info and "entries" in info:
        entries = [e for e in info["entries"] if e]
        if not entries:
            raise HTTPException(422, "Не найдено ни одного видео")
        info = entries[0]

    formats = []
    for f in info.get("formats", []):
        if f.get("vcodec") == "none" and f.get("acodec") == "none":
            continue
        if f.get("format_id").startswith("http-") and not f.get("format_id"):
            continue
        height = f.get("height") or 0
        formats.append({
            "format_id": f.get("format_id"),
            "ext": f.get("ext"),
            "resolution": f.get("resolution") or (f"{height}p" if height else None),
            "height": height,
            "fps": f.get("fps"),
            "vcodec": f.get("vcodec"),
            "acodec": f.get("acodec"),
            "filesize": f.get("filesize") or f.get("filesize_approx"),
            "tbr": f.get("tbr"),
            "format_note": f.get("format_note"),
            "language": f.get("language"),
        })
    formats.sort(key=lambda f: (f["height"] or 0, f["tbr"] or 0), reverse=True)

    thumb = None
    for t in info.get("thumbnails", []):
        if t.get("url") and (t.get("preference") or 0) >= 0:
            thumb = t.get("url")
            if t.get("id") in ("hq720", "maxresdefault", "sddefault"):
                break

    return {
        "title": info.get("title"),
        "uploader": info.get("uploader") or info.get("channel"),
        "duration": info.get("duration"),
        "thumbnail": thumb or info.get("thumbnail"),
        "webpage_url": info.get("webpage_url") or url,
        "formats": formats,
    }


def _run_ytdlp(job_id: str, url: str, fmt: str, audio: bool, out_dir: Path, proxy: str | None) -> None:
    job = jobs.get(job_id)
    if not job:
        return

    def hook(d):
        if jobs.is_canceled(job_id):
            raise yt_dlp.utils.DownloadCancelledError()
        if d["status"] == "downloading":
            downloaded = d.get("downloaded_bytes") or 0
            total = d.get("total_bytes") or d.get("total_bytes_estimate")
            jobs.update(
                job_id,
                status="running",
                downloaded=downloaded,
                total=total,
                speed=d.get("_speed_str"),
                eta=d.get("_eta_str"),
                progress=round(downloaded / total * 100, 1) if total else None,
            )

    opts = {
        **_ydl_opts(proxy),
        "outtmpl": str(out_dir / "%(title).180B [%(id)s].%(ext)s"),
        "progress_hooks": [hook],
        "windowsfilenames": True,
        "overwrites": False,
        "restrictfilenames": False,
    }
    if audio:
        opts["format"] = "bestaudio/best"
        opts["postprocessors"] = [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}
        ]
    else:
        opts["format"] = fmt

    try:
        jobs.update(job_id, status="running", progress=0)
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
        if jobs.is_canceled(job_id):
            jobs.update(job_id, status="canceled", finished=time.time())
            return
        filename = None
        if info:
            if info.get("requested_downloads"):
                filename = info["requested_downloads"][0].get("filepath")
            elif info.get("_filename"):
                filename = info["_filename"]
        jobs.update(job_id, status="done", progress=100, filename=filename, finished=time.time())
    except yt_dlp.utils.DownloadCancelledError:
        jobs.update(job_id, status="canceled", finished=time.time())
    except Exception as exc:  # noqa: BLE001
        if jobs.is_canceled(job_id):
            jobs.update(job_id, status="canceled", finished=time.time())
        else:
            jobs.update(job_id, status="error", error=_friendly_error(exc), finished=time.time())


@router.post("/ytdlp/download")
def ytdlp_download(body: dict):
    url = _check_url(body.get("url", ""))
    dir_id = body.get("dir_id", "")
    fmt = (body.get("format") or BEST_FORMAT).strip() or BEST_FORMAT
    audio = bool(body.get("audio"))
    quality = body.get("quality")

    if quality == "best":
        fmt = BEST_FORMAT

    entry = get_dir(dir_id)
    out_dir = Path(entry["path"])
    if not out_dir.is_dir():
        raise HTTPException(400, "Целевая директория недоступна")

    title = url[:80]
    proxy = app_settings.resolve_proxy(body.get("proxy"))
    job = jobs.create("ytdlp", title, url, dir_id, entry["name"])
    jobs.update(job["id"], title=body.get("title") or title)

    threading.Thread(
        target=_run_ytdlp,
        args=(job["id"], url, fmt, audio, out_dir, proxy),
        daemon=True,
    ).start()
    return {"job_id": job["id"]}


def _unique_path(dest: Path) -> Path:
    if not dest.exists():
        return dest
    stem, suffix = dest.stem, dest.suffix
    for i in range(1, 1000):
        candidate = dest.with_name(f"{stem} ({i}){suffix}")
        if not candidate.exists():
            return candidate
    raise HTTPException(409, "Не удалось подобрать имя файла")


def _guess_filename(response: httpx.Response, url: str, override: str | None) -> str:
    if override:
        return sanitize_filename(override)
    cd = response.headers.get("content-disposition", "")
    match = re.search(r"filename\*?=(?:UTF-8''|\"?)([^\";]+)", cd)
    if match:
        from urllib.parse import unquote

        return sanitize_filename(unquote(match.group(1).strip('"')))
    from urllib.parse import urlparse, unquote

    name = Path(unquote(urlparse(url).path)).name
    return sanitize_filename(name)


def _run_direct(job_id: str, url: str, out_dir: Path, override_name: str | None, proxy: str | None) -> None:
    downloaded = 0
    total = None
    last_update = 0.0
    window_start = time.time()
    window_bytes = 0

    try:
        jobs.update(job_id, status="running", progress=0, downloaded=0)
        with httpx.Client(follow_redirects=True, timeout=httpx.Timeout(30, read=60), proxy=proxy) as client:
            with client.stream("GET", url) as resp:
                resp.raise_for_status()
                total_header = resp.headers.get("content-length")
                total = int(total_header) if total_header else None
                name = _guess_filename(resp, url, override_name)
                dest = _unique_path(out_dir / name)
                jobs.update(job_id, title=name, filename=str(dest), total=total)

                with dest.open("wb") as fh:
                    for chunk in resp.iter_bytes(chunk_size=256 * 1024):
                        if jobs.is_canceled(job_id):
                            fh.close()
                            dest.unlink(missing_ok=True)
                            jobs.update(job_id, status="canceled", finished=time.time())
                            return
                        fh.write(chunk)
                        downloaded += len(chunk)
                        window_bytes += len(chunk)

                        now = time.time()
                        if now - last_update > 0.3:
                            speed = window_bytes / max(now - window_start, 0.001)
                            if total:
                                eta = (total - downloaded) / speed if speed > 0 else None
                                eta_str = f"{int(eta // 60)}:{int(eta % 60):02d}" if eta else None
                                progress = min(100.0, downloaded / total * 100)
                            else:
                                eta_str = None
                                progress = None
                            jobs.update(
                                job_id,
                                downloaded=downloaded,
                                speed=f"{speed / 1_048_576:.2f} MiB/s",
                                eta=eta_str,
                                progress=progress,
                            )
                            last_update = now
                            window_start = now
                            window_bytes = 0

        jobs.update(job_id, status="done", progress=100, downloaded=downloaded, finished=time.time())
    except jobs.CancelledError:
        jobs.update(job_id, status="canceled", finished=time.time())
    except httpx.HTTPStatusError as exc:
        jobs.update(job_id, status="error", error=f"HTTP {exc.response.status_code}", finished=time.time())
    except Exception as exc:  # noqa: BLE001
        if jobs.is_canceled(job_id):
            jobs.update(job_id, status="canceled", finished=time.time())
        else:
            jobs.update(job_id, status="error", error=_friendly_error(exc), finished=time.time())


@router.post("/direct/download")
def direct_download(body: dict):
    url = _check_url(body.get("url", ""))
    dir_id = body.get("dir_id", "")
    filename = (body.get("filename") or "").strip() or None

    entry = get_dir(dir_id)
    out_dir = Path(entry["path"])
    if not out_dir.is_dir():
        raise HTTPException(400, "Целевая директория недоступна")

    job = jobs.create("direct", filename or url[:80], url, dir_id, entry["name"])
    proxy = app_settings.resolve_proxy(body.get("proxy"))
    threading.Thread(
        target=_run_direct,
        args=(job["id"], url, out_dir, filename, proxy),
        daemon=True,
    ).start()
    return {"job_id": job["id"]}


@router.get("/jobs")
def list_jobs():
    return jobs.list_all()


@router.post("/jobs/{job_id}/cancel")
def cancel_job(job_id: str):
    if not jobs.cancel(job_id):
        raise HTTPException(404, "Задача не найдена или уже завершена")
    return {"ok": True}


@router.delete("/jobs/{job_id}")
def delete_job(job_id: str):
    if not jobs.remove(job_id):
        raise HTTPException(404, "Задача не найдена")
    return {"ok": True}
