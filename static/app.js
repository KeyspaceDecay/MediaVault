"use strict";

/* ================= Утилиты ================= */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

function fmtSize(bytes) {
  if (bytes == null) return "";
  if (bytes < 1024) return bytes + " Б";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " КиБ";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " МиБ";
  return (bytes / 1073741824).toFixed(2) + " ГиБ";
}

function fmtDuration(sec) {
  if (sec == null) return "";
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
           : `${m}:${String(s).padStart(2, "0")}`;
}

function fmtDate(ts) {
  return new Date(ts * 1000).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

const TYPE_ICONS = { dir: "📁", image: "🖼️", video: "🎬", audio: "🎵", file: "📄" };

/* ================= API ================= */

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) {
    showLogin();
    throw new Error("Требуется вход");
  }
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).detail || ""; } catch {}
    throw new Error(detail || `Ошибка ${res.status}`);
  }
  return res.json();
}

function toast(message, type = "info") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  $("#toasts").append(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 3600);
  setTimeout(() => el.remove(), 4000);
}

/* ================= Состояние ================= */

const state = {
  dirs: [],
  dirId: null,
  path: "",
  view: "media",
  currentFile: null,
  formatInfo: null,
  formats: [],
  jobsTimer: null,
};

/* ================= Логин ================= */

function showLogin() {
  stopJobsPolling();
  $("#login-view").classList.remove("hidden");
  $("#app-view").classList.add("hidden");
}

function showApp() {
  $("#login-view").classList.add("hidden");
  $("#app-view").classList.remove("hidden");
  startJobsPolling();
  loadDirs().then(() => { if (!state.dirId && state.dirs.length) openDir(state.dirs[0].id); });
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = $("#login-password").value;
  $("#login-error").textContent = "";
  try {
    await api("/api/auth/login", { method: "POST", body: { password } });
    $("#login-password").value = "";
    showApp();
  } catch (err) {
    $("#login-error").textContent = err.message;
  }
});

$("#logout-btn").addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" }).catch(() => {});
  location.reload();
});

/* ================= Переключение вкладок ================= */

$$(".tab").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));

function switchView(view) {
  state.view = view;
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
  $("#view-media").classList.toggle("hidden", view !== "media");
  $("#view-downloads").classList.toggle("hidden", view !== "downloads");
  if (view === "media" && state.dirId) browse();
  if (view === "downloads") renderJobs();
}

/* ================= Директории ================= */

async function loadDirs() {
  state.dirs = await api("/api/dirs");
  renderDirs();
  renderDirSelects();
}

function renderDirs() {
  const wrap = $("#dirs-list");
  if (!state.dirs.length) {
    wrap.innerHTML = `<div style="color:var(--text-dim);padding:10px;font-size:13px">
      Пока пусто. Нажмите ＋ чтобы подключить папку с медиа.</div>`;
    return;
  }
  wrap.innerHTML = state.dirs.map((d) => `
    <div class="dir-item ${d.id === state.dirId ? "active" : ""}" data-id="${d.id}">
      <span>📂</span>
      <div style="min-width:0;flex:1">
        <div class="dir-name" title="${esc(d.name)}">${esc(d.name)}</div>
        <div class="dir-path" title="${esc(d.path)}">${esc(d.path)}</div>
      </div>
      <button class="icon-btn edit-dir" data-id="${d.id}" title="Изменить">✏️</button>
      <button class="icon-btn rm-dir" data-id="${d.id}" title="Отключить">✕</button>
    </div>`).join("");

  wrap.querySelectorAll(".dir-item").forEach((el) =>
    el.addEventListener("click", (e) => {
      if (e.target.closest(".edit-dir, .rm-dir")) return;
      openDir(el.dataset.id);
    }));
  wrap.querySelectorAll(".edit-dir").forEach((btn) =>
    btn.addEventListener("click", () => openDirModal(btn.dataset.id)));
  wrap.querySelectorAll(".rm-dir").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const d = state.dirs.find((x) => x.id === btn.dataset.id);
      if (!confirm(`Отключить директорию «${d.name}»? Файлы удалены не будут.`)) return;
      await api(`/api/dirs/${btn.dataset.id}`, { method: "DELETE" });
      if (state.dirId === btn.dataset.id) { state.dirId = null; state.path = ""; }
      await loadDirs();
      if (!state.dirId && state.dirs.length) openDir(state.dirs[0].id);
      else renderGrid({ dirs: [], files: [] });
      toast("Директория отключена", "success");
    }));
}

function renderDirSelects() {
  const options = state.dirs.map((d) =>
    `<option value="${d.id}">${esc(d.name)}</option>`).join("");
  $("#ytdlp-dir").innerHTML = options || `<option value="">— нет директорий —</option>`;
  $("#direct-dir").innerHTML = options || `<option value="">— нет директорий —</option>`;
  if (state.dirId) {
    $("#ytdlp-dir").value = state.dirId;
    $("#direct-dir").value = state.dirId;
  }
}

function openDir(dirId) {
  state.dirId = dirId;
  state.path = "";
  renderDirs();
  renderDirSelects();
  browse();
}

/* --- модалка директории --- */
let editingDirId = null;

$("#add-dir-btn").addEventListener("click", () => openDirModal(null));

function openDirModal(dirId) {
  editingDirId = dirId;
  const d = dirId ? state.dirs.find((x) => x.id === dirId) : null;
  $("#dir-modal-title").textContent = d ? "Изменить директорию" : "Подключить директорию";
  $("#dir-name").value = d ? d.name : "";
  $("#dir-path").value = d ? d.path : "";
  $("#dir-modal-error").textContent = "";
  $("#dir-modal").classList.remove("hidden");
}

$("#dir-save").addEventListener("click", async () => {
  const body = { name: $("#dir-name").value.trim(), path: $("#dir-path").value.trim() };
  try {
    if (editingDirId) {
      await api(`/api/dirs/${editingDirId}`, { method: "PATCH", body });
    } else {
      const created = await api("/api/dirs", { method: "POST", body });
      state.dirId = created.id;
      state.path = "";
    }
    $("#dir-modal").classList.add("hidden");
    await loadDirs();
    if (state.dirId) browse();
    toast(editingDirId ? "Сохранено" : "Директория подключена", "success");
  } catch (err) {
    $("#dir-modal-error").textContent = err.message;
  }
});

/* ================= Просмотр медиа ================= */

async function browse() {
  if (!state.dirId) { renderGrid({ dirs: [], files: [] }); return; }
  try {
    const data = await api(`/api/dirs/${state.dirId}/list?path=${encodeURIComponent(state.path)}`);
    renderGrid(data);
  } catch (err) {
    toast(err.message, "error");
  }
}

function renderBreadcrumb() {
  const d = state.dirs.find((x) => x.id === state.dirId);
  if (!d) { $("#breadcrumb").innerHTML = ""; return; }
  const parts = state.path ? state.path.split("/").filter(Boolean) : [];
  let html = `<button class="crumb ${parts.length ? "" : "current"}" data-p="">📂 ${esc(d.name)}</button>`;
  parts.forEach((part, i) => {
    const p = parts.slice(0, i + 1).join("/");
    const last = i === parts.length - 1;
    html += `<span class="crumb-sep">/</span>
             <button class="crumb ${last ? "current" : ""}" data-p="${esc(p)}">${esc(part)}</button>`;
  });
  $("#breadcrumb").innerHTML = html;
  $$("#breadcrumb .crumb").forEach((btn) =>
    btn.addEventListener("click", () => { state.path = btn.dataset.p; browse(); }));
}

function renderGrid(data) {
  renderBreadcrumb();
  const grid = $("#grid");
  const empty = $("#empty-state");

  if (!state.dirId) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    empty.innerHTML = `<div class="big">📂</div>
      <div><b>Нет подключённых директорий</b></div>
      <div style="margin-top:6px">Нажмите «＋» на панели слева и укажите путь к папке с медиа.</div>`;
    return;
  }

  const all = [...data.dirs, ...data.files];
  if (!all.length) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    empty.innerHTML = `<div class="big">🗂️</div><div>Папка пуста</div>`;
    return;
  }
  empty.classList.add("hidden");

  grid.innerHTML = all.map((item) => {
    if (item.type === "dir") {
      return `<div class="media-card" data-dir="${esc(item.name)}">
        <div class="card-thumb"><span class="thumb-fallback">${TYPE_ICONS.dir}</span></div>
        <div class="card-name">${esc(item.name)}</div>
        <div class="card-meta">папка · ${fmtDate(item.mtime)}</div>
      </div>`;
    }
    const thumb = item.has_thumb
      ? `<img loading="lazy" src="/api/dirs/${state.dirId}/thumb?path=${encodeURIComponent(state.path ? state.path + "/" + item.name : item.name)}" alt="">`
      : `<span class="thumb-fallback">${TYPE_ICONS[item.type] || TYPE_ICONS.file}</span>`;
    const rel = state.path ? `${state.path}/${item.name}` : item.name;
    return `<div class="media-card" data-file="${esc(item.name)}">
      <div class="card-thumb">${thumb}<span class="type-badge">${TYPE_ICONS[item.type] || TYPE_ICONS.file}</span></div>
      <div class="card-name">${esc(item.name)}</div>
      <div class="card-meta">${fmtSize(item.size)} · ${fmtDate(item.mtime)}</div>
    </div>`;
  }).join("");

  grid.querySelectorAll("[data-dir]").forEach((el) =>
    el.addEventListener("click", () => {
      state.path = state.path ? `${state.path}/${el.dataset.dir}` : el.dataset.dir;
      browse();
    }));
  grid.querySelectorAll("[data-file]").forEach((el) =>
    el.addEventListener("click", () => {
      const item = data.files.find((f) => f.name === el.dataset.file);
      if (item) openViewer(item);
    }));
}

/* --- новая папка --- */
$("#mkdir-btn").addEventListener("click", async () => {
  if (!state.dirId) return toast("Сначала подключите директорию", "error");
  const name = prompt("Имя новой папки:");
  if (!name) return;
  try {
    await api(`/api/dirs/${state.dirId}/mkdir`, { method: "POST", body: { path: state.path, name } });
    browse();
  } catch (err) { toast(err.message, "error"); }
});

/* ================= Просмотрщик ================= */

function fileUrl(name, dl = 0) {
  const rel = state.path ? `${state.path}/${name}` : name;
  return `/api/dirs/${state.dirId}/file?path=${encodeURIComponent(rel)}${dl ? "&dl=1" : ""}`;
}

function openViewer(item) {
  state.currentFile = item;
  const url = fileUrl(item.name);
  const content = $("#viewer-content");
  $("#viewer-title").textContent = item.name;
  $("#viewer-download").href = fileUrl(item.name, 1);

  if (item.type === "video") {
    content.innerHTML = `<video controls autoplay src="${esc(url)}"></video>`;
  } else if (item.type === "image") {
    content.innerHTML = `<img src="${esc(url)}" alt="${esc(item.name)}">`;
  } else if (item.type === "audio") {
    content.innerHTML = `<div class="audio-wrap"><audio controls autoplay src="${esc(url)}" style="width:100%"></audio></div>`;
  } else {
    content.innerHTML = `<div style="padding:60px;color:var(--text-dim);font-size:48px">
      ${TYPE_ICONS.file}</div>`;
  }
  $("#viewer-sub").innerHTML = `
    <span>Тип: ${item.type}</span>
    <span>Размер: ${fmtSize(item.size)}</span>
    <span>Изменён: ${fmtDate(item.mtime)}</span>`;

  const video = content.querySelector("video");
  if (video) video.volume = 0.9;
  $("#viewer").classList.remove("hidden");
}

function closeViewer() {
  $("#viewer-content").innerHTML = "";
  $("#viewer").classList.add("hidden");
  state.currentFile = null;
}

$("#viewer-delete").addEventListener("click", async () => {
  const f = state.currentFile;
  if (!f) return;
  if (!confirm(`Удалить «${f.name}»? Действие необратимо.`)) return;
  const rel = state.path ? `${state.path}/${f.name}` : f.name;
  try {
    await api(`/api/dirs/${state.dirId}/delete`, { method: "POST", body: { path: rel } });
    closeViewer();
    browse();
    toast("Удалено", "success");
  } catch (err) { toast(err.message, "error"); }
});

/* ================= yt-dlp ================= */

$("#fetch-formats-btn").addEventListener("click", fetchFormats);
$("#ytdlp-url").addEventListener("keydown", (e) => { if (e.key === "Enter") fetchFormats(); });

async function fetchFormats() {
  const url = $("#ytdlp-url").value.trim();
  if (!url) return toast("Введите ссылку", "error");
  const btn = $("#fetch-formats-btn");
  btn.disabled = true;
  btn.textContent = "Получаем…";
  try {
    const info = await api("/api/ytdlp/formats", {
      method: "POST",
      body: { url, proxy: $("#ytdlp-proxy").value },
    });
    state.formatInfo = info;
    state.formats = info.formats.filter((f) => f.format_id);
    renderFormatInfo();
    toast("Информация получена", "success");
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Получить информацию";
  }
}

function renderFormatInfo() {
  const info = state.formatInfo;
  $("#fi-thumb").src = info.thumbnail || "";
  $("#fi-thumb").style.display = info.thumbnail ? "" : "none";
  $("#fi-title").textContent = info.title || "";
  $("#fi-sub").textContent = [
    info.uploader,
    fmtDuration(info.duration),
  ].filter(Boolean).join(" · ");

  $("#format-info").classList.remove("hidden");
  $("#quality-block").classList.remove("hidden");

  const select = $("#format-select");
  select.innerHTML = state.formats.map((f) => {
    const parts = [];
    if (f.resolution) parts.push(f.resolution);
    parts.push(f.ext || "");
    if (f.fps) parts.push(`${f.fps}fps`);
    const hasVideo = f.vcodec && f.vcodec !== "none";
    const hasAudio = f.acodec && f.acodec !== "none";
    if (hasVideo && !hasAudio) parts.push("без звука");
    if (!hasVideo && hasAudio) parts.push("только аудио");
    const size = f.filesize ? ` ~${fmtSize(f.filesize)}` : "";
    return `<option value="${esc(f.format_id)}">${esc(parts.join(" · "))}${size}</option>`;
  }).join("");
}

$$("input[name='quality']").forEach((radio) =>
  radio.addEventListener("change", () => {
    $("#format-select-wrap").classList.toggle("hidden", radio.value !== "manual" || !radio.checked);
  }));

$("#ytdlp-start").addEventListener("click", async () => {
  const url = $("#ytdlp-url").value.trim();
  const dirId = $("#ytdlp-dir").value;
  if (!url) return toast("Введите ссылку", "error");
  if (!dirId) return toast("Сначала подключите директорию", "error");

  const mode = $$("input[name='quality']").find((r) => r.checked)?.value || "best";
  const body = {
    url,
    dir_id: dirId,
    audio: false,
    format: "bestvideo*+bestaudio/best",
    proxy: $("#ytdlp-proxy").value,
  };

  if (mode === "audio") {
    body.audio = true;
  } else if (mode === "manual") {
    const fid = $("#format-select").value;
    const f = state.formats.find((x) => x.format_id === fid);
    const needsAudio = f && f.acodec === "none";
    body.format = needsAudio ? `${fid}+bestaudio/${fid}` : fid;
  }

  try {
    const { job_id } = await api("/api/ytdlp/download", { method: "POST", body });
    toast("Загрузка началась", "success");
    if (state.formatInfo?.title) {
      api("/api/jobs").then((jobs) => {
        const job = jobs.find((j) => j.id === job_id);
        if (job) api(`/api/jobs/${job_id}`);
      }).catch(() => {});
    }
    switchView("downloads");
  } catch (err) { toast(err.message, "error"); }
});

/* ================= Прямая загрузка ================= */

$("#direct-start").addEventListener("click", async () => {
  const url = $("#direct-url").value.trim();
  const dirId = $("#direct-dir").value;
  if (!url) return toast("Введите ссылку", "error");
  if (!dirId) return toast("Сначала подключите директорию", "error");
  try {
    await api("/api/direct/download", {
      method: "POST",
      body: {
        url,
        dir_id: dirId,
        filename: $("#direct-filename").value.trim() || null,
        proxy: $("#direct-proxy").value,
      },
    });
    toast("Загрузка началась", "success");
    $("#direct-url").value = "";
    $("#direct-filename").value = "";
  } catch (err) { toast(err.message, "error"); }
});

/* ================= Очередь задач ================= */

async function jobsTick() {
  let jobs;
  try { jobs = await api("/api/jobs"); } catch { return; }
  const active = jobs.filter((j) => ["queued", "running"].includes(j.status)).length;
  const badge = $("#jobs-badge");
  badge.textContent = active;
  badge.classList.toggle("hidden", active === 0);
  if (state.view === "downloads") renderJobs(jobs);
}

function renderJobs(jobsOverride) {
  const list = $("#jobs-list");
  api("/api/jobs").then((jobs) => {
    if (!jobs.length) {
      list.innerHTML = `<div style="color:var(--text-dim);padding:20px;text-align:center">
        Пока нет загрузок</div>`;
      return;
    }
    list.innerHTML = jobs.map((j) => {
      const icon = j.kind === "ytdlp" ? "🎬" : "🔗";
      const statusLabels = {
        queued: "ожидает", running: "загружается", done: "готово",
        error: "ошибка", canceled: "отменено",
      };
      const sub = [
        j.dir_name,
        j.filename ? j.filename.split("/").pop() : null,
        j.status === "running" ? [fmtSize(j.downloaded), j.total ? `из ${fmtSize(j.total)}` : null, j.speed, j.eta ? `осталось ${j.eta}` : null].filter(Boolean).join(" · ") : null,
        j.status === "error" ? j.error : null,
        j.finished ? fmtDate(j.finished) : null,
      ].filter(Boolean).join(" · ");

      const progressHtml = ["queued", "running"].includes(j.status)
        ? `<div class="progress"><div class="progress-bar ${j.progress == null ? "indeterminate" : ""}"
             style="width:${j.progress ?? 0}%"></div></div>`
        : "";

      const active = ["queued", "running"].includes(j.status);
      const actions = active
        ? `<button class="btn danger small" data-cancel="${j.id}">Стоп</button>`
        : `<button class="icon-btn" data-remove="${j.id}" title="Убрать из списка">✕</button>`;

      return `<div class="job">
        <div class="job-icon">${icon}</div>
        <div class="job-main">
          <div class="job-title" title="${esc(j.title)}">${esc(j.title)}</div>
          <div class="job-sub">${esc(sub)}</div>
          ${progressHtml}
        </div>
        <span class="job-status ${j.status}">${statusLabels[j.status] || j.status}</span>
        ${actions}
      </div>`;
    }).join("");

    list.querySelectorAll("[data-cancel]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        await api(`/api/jobs/${btn.dataset.cancel}/cancel`, { method: "POST" }).catch((e) => toast(e.message, "error"));
        jobsTick();
      }));
    list.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        await api(`/api/jobs/${btn.dataset.remove}`, { method: "DELETE" }).catch(() => {});
        jobsTick();
      }));
  }).catch(() => {});
}

function startJobsPolling() {
  stopJobsPolling();
  state.jobsTimer = setInterval(jobsTick, 2000);
  jobsTick();
}

function stopJobsPolling() {
  if (state.jobsTimer) clearInterval(state.jobsTimer);
  state.jobsTimer = null;
}

/* ================= Настройки (прокси / Tor) ================= */

$("#settings-btn").addEventListener("click", openSettings);

function renderTorStatus(available) {
  const el = $("#tor-status");
  if (available) {
    el.className = "status-line ok";
    el.textContent = "🧅 Tor: запущен и доступен (порт 9050)";
  } else {
    el.className = "status-line bad";
    el.textContent = "🧅 Tor: не найден на 127.0.0.1:9050. Установите и запустите: apk add tor (или apt install tor && systemctl start tor)";
  }
}

async function openSettings() {
  try {
    const s = await api("/api/settings");
    renderTorStatus(s.tor_available);
    const mode = s.proxy === s.tor_proxy || s.proxy === "tor" ? "tor"
      : s.proxy ? "custom" : "";
    $("#settings-proxy-mode").value = mode;
    $("#settings-proxy-custom-wrap").classList.toggle("hidden", mode !== "custom");
    $("#settings-proxy-custom").value = mode === "custom" ? s.proxy : "";
    $("#settings-cookies").value = s.cookies_file || "";
    $("#settings-error").textContent = "";
    $("#settings-modal").classList.remove("hidden");
  } catch (err) {
    toast(err.message, "error");
  }
}

$("#settings-proxy-mode").addEventListener("change", (e) => {
  $("#settings-proxy-custom-wrap").classList.toggle("hidden", e.target.value !== "custom");
});

$("#settings-save").addEventListener("click", async () => {
  const mode = $("#settings-proxy-mode").value;
  const custom = $("#settings-proxy-custom").value.trim();
  if (mode === "custom" && !custom) {
    $("#settings-error").textContent = "Укажите адрес прокси";
    return;
  }
  const body = {
    proxy: mode === "" ? "" : mode === "tor" ? "socks5://127.0.0.1:9050" : custom,
    cookies_file: $("#settings-cookies").value.trim(),
  };
  try {
    const s = await api("/api/settings", { method: "PUT", body });
    renderTorStatus(s.tor_available);
    $("#settings-modal").classList.add("hidden");
    toast("Настройки сохранены", "success");
  } catch (err) {
    $("#settings-error").textContent = err.message;
  }
});

/* ================= Модалки: закрытие ================= */

$$("[data-close]").forEach((el) =>
  el.addEventListener("click", () => {
    $(`#${el.dataset.close}`).classList.add("hidden");
    if (el.dataset.close === "viewer") closeViewer();
  }));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    $("#viewer").classList.add("hidden");
    closeViewer();
    $("#dir-modal").classList.add("hidden");
    $("#settings-modal").classList.add("hidden");
  }
});

/* ================= Старт ================= */

api("/api/auth/status").then((s) => {
  if (s.authenticated) showApp();
  else showLogin();
}).catch(showLogin);
