# 🎞️ MediaVault

A self-hosted personal media vault with a web UI: browse and stream your collection, download videos via **yt-dlp** (best quality or manual format selection), fetch files by direct URL, and manage multiple storage directories. Built-in **Tor / proxy** support for blocked sites and **RU/EN** interface.

## Features

- **Media browsing** — gallery with thumbnails (video via ffmpeg, images via Pillow), video player with seeking (HTTP Range), image and audio preview, download and delete
- **File explorer** — search within folder, sorting (name/date/size), grid or list view, pagination with infinite scroll for folders with thousands of files
- **Viewer** — flip through photos and videos with ‹ › buttons, keyboard arrows or touch swipes; item counter; quick download from card hover
- **yt-dlp** — fetch video info (title, duration, thumbnail, full format list), pick *Best quality* / *Audio only (MP3)* / a specific format; live progress, speed, ETA, cancel
- **Direct URLs** — download arbitrary files with progress and auto-rename on collision
- **Directories** — connect multiple server folders, navigate, create folders, delete files
- **Tor & proxies** — global default proxy in Settings (Tor `socks5://`, HTTP, SOCKS) plus per-download override; `cookies.txt` support for YouTube bot checks
- **Security** — password login (PBKDF2-SHA256 hashed, 600k iterations), HMAC-signed sessions, brute-force lockout, path-traversal protection
- **Yggdrasil-friendly** — bind the server to your Yggdrasil IPv6 address to keep it reachable from your overlay network only
- **RU / EN interface** — language switcher, preference saved per browser
- `YTDLP_NO_LAZY_EXTRACTORS=1` and yt-dlp EJS remote components enabled out of the box

## Quick start

```bash
git clone https://github.com/KeyspaceDecay/MediaVault.git
cd MediaVault
cp .env.example .env        # edit HOST/PORT (and see password notes below)
./run.sh                    # creates a venv, installs deps, starts the server
```

Then open `http://localhost:8666` (or your custom `HOST:PORT`).

### Password

On first launch MediaVault either takes `MEDIAVAULT_PASSWORD` from `.env` or generates a random one (printed to the console). In both cases it is immediately converted to a **PBKDF2-SHA256 hash** stored in `data/auth.json` and the plaintext line is removed from `.env`.

- Change password anytime: **⚙️ Settings → Change password** (requires the current one)
- Reset: delete `data/auth.json` and set `MEDIAVAULT_PASSWORD` in `.env` again

### System dependencies

- Python 3.10+
- **ffmpeg** — video thumbnails, format merging, MP3 extraction
  - Alpine: `apk add ffmpeg` · Debian/Ubuntu: `apt install ffmpeg`
- **deno** (recommended) — JS runtime used by yt-dlp to solve YouTube challenges
  - Alpine: `apk add deno` · otherwise see [deno.land](https://docs.deno.com/runtime/getting_started/installation/)

## Tor (blocked sites)

1. Install and start Tor:
   ```bash
   # Alpine
   apk add tor && rc-service tor start
   # Debian/Ubuntu
   apt install tor && systemctl enable --now tor
   ```
2. In MediaVault open **⚙️ Settings → Default proxy → Tor**. The status line shows whether a Tor daemon is detected on port `9050`.
3. Any single download can override this (**Tor / No proxy**) in the download form.

HTTP(S) and SOCKS4/5 proxies with auth are also supported: `http://user:pass@host:port`, `socks5://host:port`.

### If YouTube asks you to “confirm you're not a bot”

Export your browser cookies to `cookies.txt` (e.g. the “Get cookies.txt LOCALLY” extension) and point to the file in ⚙️ Settings.

## Yggdrasil

To serve MediaVault exclusively over [Yggdrasil](https://yggdrasil-network.github.io/):

```bash
yggdrasilctl getSelf   # note your IPv6 address, e.g. 202:…:468f
```

Set it as the bind address in `.env`:

```
HOST=202:2542:c440:ce0d:1ca2:998d:b1e0:468f
```

Restart with `./run.sh`. The app is now reachable at `http://[202:…:468f]:8666` from anywhere in your Yggdrasil network — and *not* on LAN/localhost. Use `HOST=0.0.0.0` to listen on all interfaces instead.

## Configuration (`.env`)

| Variable | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Bind address (Yggdrasil IPv6, LAN IP, etc.) |
| `PORT` | `8666` | Port |
| `MEDIAVAULT_PASSWORD` | generated | First-run password (then hashed in `data/auth.json`) |
| `SESSION_TTL` | `604800` | Session lifetime, seconds |

Proxy and cookies are configured in the web UI (⚙️) and stored in `data/settings.json`.

## Structure

```
app/            FastAPI backend (auth, directories, yt-dlp, proxy, streaming)
static/         Web UI (vanilla JS, no build step, RU/EN)
data/           Secret key, password hash, settings, thumbnail cache (not for git)
```

## API (brief)

All `/api/*` routes except `POST /api/auth/login`, `GET /api/auth/status` and `POST /api/logout` require a session cookie.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Sign in (`{"password": "..."}`) |
| POST | `/api/auth/password` | Change password (`{"current": "...", "new": "..."}`) |
| GET/POST/PATCH/DELETE | `/api/dirs` | Manage connected directories |
| GET | `/api/dirs/{id}/list` | List folder contents |
| GET | `/api/dirs/{id}/file` | Stream file (Range, `?dl=1` to force download) |
| GET | `/api/dirs/{id}/thumb` | Thumbnail |
| POST | `/api/ytdlp/formats` | Video info & formats |
| POST | `/api/ytdlp/download` | Download video |
| POST | `/api/direct/download` | Download file by URL |
| GET/PUT | `/api/settings` | Proxy, cookies, Tor status |
| GET | `/api/jobs` | Download queue |

## License

MIT
