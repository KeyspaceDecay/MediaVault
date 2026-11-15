from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import auth, downloads, media_routes, settings as settings_module
from .config import ROOT, THUMB_DIR
from .manager import get_dirs

app = FastAPI(title="MediaVault", docs_url=None, redoc_url=None)


@app.on_event("startup")
def startup() -> None:
    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    generated = auth.ensure_credentials()
    if generated:
        print(f"\n[MediaVault] Пароль для входа: {generated}\n"
              f"[MediaVault] Сохранён как хэш в data/auth.json — при утере сменить через сброс.\n")
    if not get_dirs():
        print("[MediaVault] Подключённых директорий пока нет — добавьте их в веб-интерфейсе.")


app.include_router(auth.router)
app.include_router(settings_module.router)
app.include_router(downloads.router)
app.include_router(media_routes.router)

app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")


@app.get("/")
def index():
    return FileResponse(ROOT / "static" / "index.html")
