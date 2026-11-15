import threading
import time
import uuid

_lock = threading.Lock()
_jobs: dict[str, dict] = {}
MAX_HISTORY = 100


def create(kind: str, title: str, url: str, dir_id: str, dir_name: str) -> dict:
    job = {
        "id": uuid.uuid4().hex[:12],
        "kind": kind,
        "title": title,
        "url": url,
        "dir_id": dir_id,
        "dir_name": dir_name,
        "status": "queued",
        "progress": None,
        "downloaded": None,
        "total": None,
        "speed": None,
        "eta": None,
        "filename": None,
        "error": None,
        "created": time.time(),
        "finished": None,
        "canceled": False,
    }
    with _lock:
        _jobs[job["id"]] = job
        _prune()
    return job


def update(job_id: str, **fields) -> None:
    with _lock:
        job = _jobs.get(job_id)
        if not job:
            return
        job.update(fields)


def get(job_id: str) -> dict | None:
    with _lock:
        job = _jobs.get(job_id)
        return dict(job) if job else None


def is_canceled(job_id: str) -> bool:
    with _lock:
        job = _jobs.get(job_id)
        return bool(job and job.get("canceled"))


def cancel(job_id: str) -> bool:
    with _lock:
        job = _jobs.get(job_id)
        if not job:
            return False
        if job["status"] in ("done", "error", "canceled"):
            return False
        job["canceled"] = True
        return True


def remove(job_id: str) -> bool:
    with _lock:
        return _jobs.pop(job_id, None) is not None


def list_all() -> list[dict]:
    with _lock:
        return sorted(_jobs.values(), key=lambda j: j["created"], reverse=True)


def _prune() -> None:
    finished = [j for j in _jobs.values() if j["status"] in ("done", "error", "canceled")]
    finished.sort(key=lambda j: j["finished"] or j["created"])
    overflow = len(_jobs) - MAX_HISTORY
    for job in finished[:overflow]:
        _jobs.pop(job["id"], None)
