"use strict";

/* ================= i18n ================= */

const I18N = {
  ru: {
    login_sub: "Личное медиахранилище",
    login_password_ph: "Пароль",
    login_btn: "Войти",
    login_required: "Требуется вход",
    tab_media: "Медиа",
    tab_downloads: "Загрузки",
    logout: "Выйти",
    sidebar_title: "Директории",
    add_dir_title: "Подключить директорию",
    edit_dir_title: "Изменить",
    disconnect_dir_title: "Отключить",
    dirs_empty: "Пока пусто. Нажмите ＋ чтобы подключить папку с медиа.",
    no_dirs_title: "Нет подключённых директорий",
    no_dirs_hint: "Нажмите «＋» на панели слева и укажите путь к папке с медиа.",
    folder_empty: "Папка пуста",
    mkdir_btn: "📁 +",
    mkdir_prompt: "Имя новой папки:",
    mkdir_first: "Сначала подключите директорию",
    folder_word: "папка",
    viewer_type: "Тип",
    viewer_size: "Размер",
    viewer_modified: "Изменён",
    type_dir: "папка", type_image: "изображение", type_video: "видео",
    type_audio: "аудио", type_file: "файл",
    download_btn: "⬇ Скачать",
    delete_btn: "🗑 Удалить",
    deleted: "Удалено",
    delete_confirm: (n) => `Удалить «${n}»? Действие необратимо.`,
    dir_modal_add: "Подключить директорию",
    dir_modal_edit: "Изменить директорию",
    dir_name_label: "Название",
    dir_path_label: "Абсолютный путь на сервере",
    dir_path_hint: 'Путь к папке на сервере, где запущен MediaVault, начиная с «/». Пример: <code>/data/SomeFiles/DWN</code>',
    create_if_missing: "Создать папку, если не существует",
    pin_folder: "Добавить эту папку в список директорий",
    cancel: "Отмена",
    save: "Сохранить",
    saved: "Сохранено",
    dir_connected: "Директория подключена",
    dir_disconnected: "Директория отключена",
    dir_disconnect_confirm: (n) => `Отключить директорию «${n}»? Файлы удалены не будут.`,
    search_ph: "Поиск в папке…",
    sort_title: "Сортировка",
    sort_name_asc: "Имя А→Я",
    sort_name_desc: "Имя Я→А",
    sort_date_desc: "Сначала новые",
    sort_date_asc: "Сначала старые",
    sort_size_desc: "Больше размер",
    sort_size_asc: "Меньше размер",
    layout_grid: "Сетка",
    layout_list: "Список",
    load_more: "Показать ещё",
    found_label: "Найдено",
    shown_of: (a, b) => `показано ${a} из ${b}`,
    nothing_found: "Ничего не найдено",
    nothing_found_hint: "Измените запрос или очистите поиск",
    nav_prev: "Предыдущий (←)",
    nav_next: "Следующий (→)",
    yt_card_title: "⬇️ Видео через yt-dlp",
    yt_url_label: "Ссылка на видео (YouTube, TikTok, VK и др.)",
    fetch_info: "Получить информацию",
    fetching: "Получаем…",
    info_fetched: "Информация получена",
    quality_best: "Лучшее качество",
    quality_audio: "Только аудио (MP3)",
    quality_manual: "Выбрать вручную",
    save_to: "Куда сохранить",
    proxy_for_download: "Прокси для этой загрузки",
    proxy_as_settings: "Как в настройках",
    proxy_none: "Без прокси",
    no_audio: "без звука",
    audio_only: "только аудио",
    direct_card_title: "🔗 Файл по прямой ссылке",
    direct_url_label: "URL файла",
    direct_filename_label: "Имя файла (необязательно)",
    direct_filename_ph: "Как сохранить",
    download_started: "Загрузка началась",
    enter_url: "Введите ссылку",
    no_dirs_select: "— нет директорий —",
    jobs_queue: "Очередь загрузок",
    jobs_empty: "Пока нет загрузок",
    st_queued: "ожидает", st_running: "загружается", st_done: "готово",
    st_error: "ошибка", st_canceled: "отменено",
    stop: "Стоп",
    remove_job: "Убрать из списка",
    of: "из",
    remaining: "осталось",
    settings_title: "⚙️ Настройки",
    proxy_default_label: "Прокси по умолчанию (Tor, HTTP, SOCKS)",
    proxy_mode_none: "Без прокси (напрямую)",
    proxy_mode_custom: "Свой прокси…",
    proxy_addr_label: "Адрес прокси",
    tor_ok: "🧅 Tor: запущен и доступен (порт 9050)",
    tor_fail: "🧅 Tor: не найден на 127.0.0.1:9050. Установите и запустите: apk add tor (или apt install tor && systemctl start tor)",
    cookies_label: "Cookies.txt для yt-dlp (необязательно)",
    proxy_hint: 'Если сайты заблокированы (YouTube и т.п.) — установите Tor: <code>apk add tor</code> / <code>apt install tor</code> и выберите его выше.',
    specify_proxy: "Укажите адрес прокси",
    settings_saved: "Настройки сохранены",
    change_password_title: "🔑 Смена пароля",
    current_password: "Текущий пароль",
    new_password: "Новый пароль",
    repeat_password: "Повторите новый пароль",
    change_password_btn: "Сменить пароль",
    pw_changed: "Пароль изменён",
    pw_mismatch: "Пароли не совпадают",
    pw_too_short: "Минимум 8 символов, буквы и цифры",
    error_prefix: (c) => `Ошибка ${c}`,
    units: ["Б", "КиБ", "МиБ", "ГиБ"],
    date_locale: "ru-RU",
  },
  en: {
    login_sub: "Personal media vault",
    login_password_ph: "Password",
    login_btn: "Sign in",
    login_required: "Sign in required",
    tab_media: "Media",
    tab_downloads: "Downloads",
    logout: "Sign out",
    sidebar_title: "Directories",
    add_dir_title: "Connect directory",
    edit_dir_title: "Edit",
    disconnect_dir_title: "Disconnect",
    dirs_empty: "Nothing here yet. Press ＋ to connect a media folder.",
    no_dirs_title: "No directories connected",
    no_dirs_hint: "Press “＋” in the sidebar and enter a path to your media folder.",
    folder_empty: "Folder is empty",
    mkdir_btn: "📁 +",
    mkdir_prompt: "New folder name:",
    mkdir_first: "Connect a directory first",
    folder_word: "folder",
    viewer_type: "Type",
    viewer_size: "Size",
    viewer_modified: "Modified",
    type_dir: "folder", type_image: "image", type_video: "video",
    type_audio: "audio", type_file: "file",
    download_btn: "⬇ Download",
    delete_btn: "🗑 Delete",
    deleted: "Deleted",
    delete_confirm: (n) => `Delete “${n}”? This cannot be undone.`,
    dir_modal_add: "Connect directory",
    dir_modal_edit: "Edit directory",
    dir_name_label: "Name",
    dir_path_label: "Absolute path on the server",
    dir_path_hint: 'Path to a folder on the server running MediaVault, starting with “/”. Example: <code>/data/SomeFiles/DWN</code>',
    create_if_missing: "Create the folder if it doesn't exist",
    pin_folder: "Pin this folder to the sidebar",
    cancel: "Cancel",
    save: "Save",
    saved: "Saved",
    dir_connected: "Directory connected",
    dir_disconnected: "Directory disconnected",
    dir_disconnect_confirm: (n) => `Disconnect “${n}”? Files will not be deleted.`,
    search_ph: "Search in folder…",
    sort_title: "Sort",
    sort_name_asc: "Name A→Z",
    sort_name_desc: "Name Z→A",
    sort_date_desc: "Newest first",
    sort_date_asc: "Oldest first",
    sort_size_desc: "Largest first",
    sort_size_asc: "Smallest first",
    layout_grid: "Grid",
    layout_list: "List",
    load_more: "Load more",
    found_label: "Found",
    shown_of: (a, b) => `showing ${a} of ${b}`,
    nothing_found: "Nothing found",
    nothing_found_hint: "Try a different query or clear the search",
    nav_prev: "Previous (←)",
    nav_next: "Next (→)",
    yt_card_title: "⬇️ Video via yt-dlp",
    yt_url_label: "Video link (YouTube, TikTok, VK, etc.)",
    fetch_info: "Fetch info",
    fetching: "Fetching…",
    info_fetched: "Info fetched",
    quality_best: "Best quality",
    quality_audio: "Audio only (MP3)",
    quality_manual: "Pick manually",
    save_to: "Save to",
    proxy_for_download: "Proxy for this download",
    proxy_as_settings: "Use settings",
    proxy_none: "No proxy",
    no_audio: "no audio",
    audio_only: "audio only",
    direct_card_title: "🔗 File by direct URL",
    direct_url_label: "File URL",
    direct_filename_label: "File name (optional)",
    direct_filename_ph: "Save as",
    download_started: "Download started",
    enter_url: "Enter a URL",
    no_dirs_select: "— no directories —",
    jobs_queue: "Download queue",
    jobs_empty: "No downloads yet",
    st_queued: "queued", st_running: "downloading", st_done: "done",
    st_error: "error", st_canceled: "canceled",
    stop: "Stop",
    remove_job: "Remove from list",
    of: "of",
    remaining: "ETA",
    settings_title: "⚙️ Settings",
    proxy_default_label: "Default proxy (Tor, HTTP, SOCKS)",
    proxy_mode_none: "No proxy (direct)",
    proxy_mode_custom: "Custom proxy…",
    proxy_addr_label: "Proxy address",
    tor_ok: "🧅 Tor: running and reachable (port 9050)",
    tor_fail: "🧅 Tor: not found on 127.0.0.1:9050. Install and start it: apk add tor (or apt install tor && systemctl start tor)",
    cookies_label: "cookies.txt for yt-dlp (optional)",
    proxy_hint: 'If sites are blocked (YouTube etc.) — install Tor: <code>apk add tor</code> / <code>apt install tor</code> and select it above.',
    specify_proxy: "Enter a proxy address",
    settings_saved: "Settings saved",
    change_password_title: "🔑 Change password",
    current_password: "Current password",
    new_password: "New password",
    repeat_password: "Repeat new password",
    change_password_btn: "Change password",
    pw_changed: "Password changed",
    pw_mismatch: "Passwords do not match",
    pw_too_short: "At least 8 characters, letters and digits",
    error_prefix: (c) => `Error ${c}`,
    units: ["B", "KiB", "MiB", "GiB"],
    date_locale: "en-GB",
  },
};

let lang = localStorage.getItem("mv_lang") || "ru";
if (!I18N[lang]) lang = "ru";

const t = (key) => {
  const val = I18N[lang][key];
  return val === undefined ? I18N.ru[key] ?? key : val;
};

/* ================= Утилиты ================= */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

function fmtSize(bytes) {
  if (bytes == null) return "";
  const u = t("units");
  if (bytes < 1024) return bytes + " " + u[0];
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " " + u[1];
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " " + u[2];
  return (bytes / 1073741824).toFixed(2) + " " + u[3];
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
  return new Date(ts * 1000).toLocaleString(t("date_locale"), { dateStyle: "short", timeStyle: "short" });
}

const TYPE_ICONS = { dir: "📁", image: "🖼️", video: "🎬", audio: "🎵", file: "📄" };
const PAGE_SIZE = 120;

/* ================= API ================= */

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) {
    showLogin();
    throw new Error(t("login_required"));
  }
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).detail || ""; } catch {}
    throw new Error(detail || t("error_prefix")(res.status));
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
  layout: localStorage.getItem("mv_layout") || "grid",
  sort: localStorage.getItem("mv_sort") || "name_asc",
  search: "",
  page: 1,
  lastData: { dirs: [], files: [] },
  viewFiles: [],
  viewerIndex: -1,
};

/* ================= Язык ================= */

function applyLang() {
  document.documentElement.lang = lang;
  localStorage.setItem("mv_lang", lang);
  $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $$("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  $$("[data-layout-title]").forEach((el) => { el.title = t(el.dataset.layoutTitle); });
  $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  $$(".lang-switch button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  renderDirs();
  renderDirSelects();
  renderToolbarState();
  if (state.formatInfo) renderFormatInfo();
  if (state.view === "media") {
    renderGrid(state.lastData);
  } else {
    renderJobs();
  }
}

$$(".lang-switch button").forEach((btn) =>
  btn.addEventListener("click", () => { if (lang !== btn.dataset.lang) { lang = btn.dataset.lang; applyLang(); } }));

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
  $$(".tab").forEach((tb) => tb.classList.toggle("active", tb.dataset.view === view));
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
      ${esc(t("dirs_empty"))}</div>`;
    return;
  }
  wrap.innerHTML = state.dirs.map((d) => `
    <div class="dir-item ${d.id === state.dirId ? "active" : ""}" data-id="${d.id}">
      <span>📂</span>
      <div style="min-width:0;flex:1">
        <div class="dir-name" title="${esc(d.name)}">${esc(d.name)}</div>
        <div class="dir-path" title="${esc(d.path)}">${esc(d.path)}</div>
      </div>
      <button class="icon-btn edit-dir" data-id="${d.id}" title="${esc(t("edit_dir_title"))}">✏️</button>
      <button class="icon-btn rm-dir" data-id="${d.id}" title="${esc(t("disconnect_dir_title"))}">✕</button>
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
      if (!confirm(t("dir_disconnect_confirm")(d.name))) return;
      await api(`/api/dirs/${btn.dataset.id}`, { method: "DELETE" });
      if (state.dirId === btn.dataset.id) { state.dirId = null; state.path = ""; }
      await loadDirs();
      if (!state.dirId && state.dirs.length) openDir(state.dirs[0].id);
      else renderGrid({ dirs: [], files: [] });
      toast(t("dir_disconnected"), "success");
    }));
}

function renderDirSelects() {
  const options = state.dirs.map((d) =>
    `<option value="${d.id}">${esc(d.name)}</option>`).join("");
  const empty = `<option value="">${esc(t("no_dirs_select"))}</option>`;
  $("#ytdlp-dir").innerHTML = options || empty;
  $("#direct-dir").innerHTML = options || empty;
  if (state.dirId) {
    $("#ytdlp-dir").value = state.dirId;
    $("#direct-dir").value = state.dirId;
  }
}

function openDir(dirId) {
  state.dirId = dirId;
  state.path = "";
  state.search = "";
  state.page = 1;
  $("#media-search").value = "";
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
  $("#dir-modal-title").textContent = t(d ? "dir_modal_edit" : "dir_modal_add");
  $("#dir-name").value = d ? d.name : "";
  $("#dir-path").value = d ? d.path : "";
  $("#dir-create-if-missing").checked = false;
  $("#dir-create-if-missing").closest(".radio").style.display = d ? "none" : "";
  $("#dir-modal-error").textContent = "";
  $("#dir-modal").classList.remove("hidden");
}

$("#dir-save").addEventListener("click", async () => {
  const body = {
    name: $("#dir-name").value.trim(),
    path: $("#dir-path").value.trim(),
    create_if_missing: $("#dir-create-if-missing").checked,
  };
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
    toast(t(editingDirId ? "saved" : "dir_connected"), "success");
  } catch (err) {
    $("#dir-modal-error").textContent = err.message;
  }
});

/* ================= Просмотр медиа: браузер ================= */

function renderToolbarState() {
  $("#media-sort").value = state.sort;
  $("#layout-grid").classList.toggle("active", state.layout === "grid");
  $("#layout-list").classList.toggle("active", state.layout === "list");
}

$("#media-search").addEventListener("input", (e) => {
  state.search = e.target.value.trim().toLowerCase();
  state.page = 1;
  renderGrid(state.lastData);
});

$("#media-sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  localStorage.setItem("mv_sort", state.sort);
  renderGrid(state.lastData);
});

$("#layout-grid").addEventListener("click", () => setLayout("grid"));
$("#layout-list").addEventListener("click", () => setLayout("list"));

function setLayout(layout) {
  state.layout = layout;
  localStorage.setItem("mv_layout", layout);
  renderToolbarState();
  renderGrid(state.lastData);
}

$("#grid").addEventListener("scroll", () => {
  const grid = $("#grid");
  if (grid.scrollTop + grid.clientHeight > grid.scrollHeight - 500) {
    const entries = visibleEntries();
    if (entries.length > state.page * PAGE_SIZE) {
      state.page += 1;
      renderGrid(state.lastData);
    }
  }
});

async function browse() {
  if (!state.dirId) { renderGrid({ dirs: [], files: [] }); return; }
  try {
    const data = await api(`/api/dirs/${state.dirId}/list?path=${encodeURIComponent(state.path)}`);
    state.lastData = data;
    state.page = 1;
    renderGrid(data);
  } catch (err) {
    toast(err.message, "error");
  }
}

function cmpEntries(a, b) {
  const opts = { numeric: true, sensitivity: "base" };
  switch (state.sort) {
    case "name_desc": return b.name.localeCompare(a.name, undefined, opts);
    case "date_desc": return (b.mtime || 0) - (a.mtime || 0) || a.name.localeCompare(b.name, undefined, opts);
    case "date_asc": return (a.mtime || 0) - (b.mtime || 0) || a.name.localeCompare(b.name, undefined, opts);
    case "size_desc": return (b.size || 0) - (a.size || 0) || a.name.localeCompare(b.name, undefined, opts);
    case "size_asc": return (a.size || 0) - (b.size || 0) || a.name.localeCompare(b.name, undefined, opts);
    default: return a.name.localeCompare(b.name, undefined, opts);
  }
}

function processedEntries(data) {
  const q = state.search;
  const dirs = (data.dirs || []).filter((d) => !q || d.name.toLowerCase().includes(q));
  const files = (data.files || []).filter((f) => !q || f.name.toLowerCase().includes(q));
  dirs.sort(cmpEntries);
  files.sort(cmpEntries);
  return { dirs, files };
}

function visibleEntries(data = state.lastData) {
  const { dirs, files } = processedEntries(data);
  return [...dirs, ...files];
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
    btn.addEventListener("click", () => {
      state.path = btn.dataset.p;
      state.search = "";
      $("#media-search").value = "";
      browse();
    }));
  $("#pin-folder-btn").classList.toggle("hidden", !state.path);
}

$("#pin-folder-btn").addEventListener("click", async () => {
  const root = state.dirs.find((x) => x.id === state.dirId);
  if (!root || !state.path) return;
  const abs = root.path.replace(/\/+$/, "") + "/" + state.path;
  const name = state.path.split("/").filter(Boolean).pop();
  try {
    await api("/api/dirs", { method: "POST", body: { name, path: abs } });
    await loadDirs();
    toast(t("dir_connected"), "success");
  } catch (err) { toast(err.message, "error"); }
});

function fileRel(name) {
  return state.path ? `${state.path}/${name}` : name;
}

function thumbUrl(name) {
  return `/api/dirs/${state.dirId}/thumb?path=${encodeURIComponent(fileRel(name))}`;
}

function fileUrl(name, dl = 0) {
  return `/api/dirs/${state.dirId}/file?path=${encodeURIComponent(fileRel(name))}${dl ? "&dl=1" : ""}`;
}

function renderGrid(data) {
  state.lastData = data;
  renderBreadcrumb();
  const grid = $("#grid");
  const empty = $("#empty-state");
  const status = $("#browser-status");
  grid.className = "grid" + (state.layout === "list" ? " list" : "");

  if (!state.dirId) {
    grid.innerHTML = "";
    status.textContent = "";
    empty.classList.remove("hidden");
    empty.innerHTML = `<div class="big">📂</div>
      <div><b>${esc(t("no_dirs_title"))}</b></div>
      <div style="margin-top:6px">${esc(t("no_dirs_hint"))}</div>`;
    return;
  }

  const { dirs, files } = processedEntries(data);
  const entries = [...dirs, ...files];
  state.viewFiles = files;
  const shown = entries.slice(0, state.page * PAGE_SIZE);
  const more = entries.length - shown.length;

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const counts = [`📁 ${dirs.length}`, `📄 ${files.length}`];
  if (files.length) counts.push(fmtSize(totalSize));
  if (state.search) {
    status.textContent = `${t("found_label")}: ${entries.length}`;
  } else {
    status.textContent = counts.join(" · ");
  }
  if (more > 0) status.textContent += ` · ${t("shown_of")(shown.length, entries.length)}`;

  if (!entries.length) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    if (state.search) {
      empty.innerHTML = `<div class="big">🔍</div>
        <div><b>${esc(t("nothing_found"))}</b></div>
        <div style="margin-top:6px">${esc(t("nothing_found_hint"))}</div>`;
    } else {
      empty.innerHTML = `<div class="big">🗂️</div><div>${esc(t("folder_empty"))}</div>`;
    }
    return;
  }
  empty.classList.add("hidden");

  const rows = shown.map((item) => (state.layout === "list" ? listRow(item) : cardHtml(item)));
  if (more > 0) {
    rows.push(`<div class="load-more-wrap">
      <button class="btn ghost" id="load-more-btn">${esc(t("load_more"))} (${more})</button>
    </div>`);
  }
  grid.innerHTML = rows.join("");

  const loadBtn = $("#load-more-btn");
  if (loadBtn) loadBtn.addEventListener("click", () => {
    state.page += 1;
    renderGrid(state.lastData);
  });

  grid.querySelectorAll("[data-dir]").forEach((el) =>
    el.addEventListener("click", (e) => {
      if (e.target.closest(".lr-dl, .card-dl")) return;
      state.path = fileRel(el.dataset.dir);
      state.search = "";
      $("#media-search").value = "";
      browse();
    }));
  grid.querySelectorAll("[data-file]").forEach((el) =>
    el.addEventListener("click", (e) => {
      if (e.target.closest(".lr-dl, .card-dl")) return;
      const name = el.dataset.file;
      const idx = state.viewFiles.findIndex((f) => f.name === name);
      const item = state.viewFiles[idx];
      if (item) openViewer(item, idx);
    }));
}

function cardHtml(item) {
  if (item.type === "dir") {
    return `<div class="media-card" data-dir="${esc(item.name)}" title="${esc(item.name)}">
      <div class="card-thumb"><span class="thumb-fallback">${TYPE_ICONS.dir}</span></div>
      <div class="card-name">${esc(item.name)}</div>
      <div class="card-meta">${esc(t("folder_word"))} · ${fmtDate(item.mtime)}</div>
    </div>`;
  }
  const thumb = item.has_thumb
    ? `<img loading="lazy" src="${thumbUrl(item.name)}" alt="">`
    : `<span class="thumb-fallback">${TYPE_ICONS[item.type] || TYPE_ICONS.file}</span>`;
  return `<div class="media-card" data-file="${esc(item.name)}" title="${esc(item.name)}">
    <div class="card-thumb">${thumb}
      <a class="card-dl" href="${fileUrl(item.name, 1)}" title="${esc(t("download_btn"))}">⬇</a>
      <span class="type-badge">${TYPE_ICONS[item.type] || TYPE_ICONS.file}</span>
    </div>
    <div class="card-name">${esc(item.name)}</div>
    <div class="card-meta">${fmtSize(item.size)} · ${fmtDate(item.mtime)}</div>
  </div>`;
}

function listRow(item) {
  if (item.type === "dir") {
    return `<div class="list-row" data-dir="${esc(item.name)}">
      <span class="lr-icon">${TYPE_ICONS.dir}</span>
      <span class="lr-name" title="${esc(item.name)}">${esc(item.name)}</span>
      <span class="lr-meta">${fmtDate(item.mtime)}</span>
    </div>`;
  }
  return `<div class="list-row" data-file="${esc(item.name)}">
    <span class="lr-icon">${TYPE_ICONS[item.type] || TYPE_ICONS.file}</span>
    <span class="lr-name" title="${esc(item.name)}">${esc(item.name)}</span>
    <span class="lr-meta">${fmtSize(item.size)}</span>
    <span class="lr-meta">${fmtDate(item.mtime)}</span>
    <a class="icon-btn lr-dl" href="${fileUrl(item.name, 1)}" title="${esc(t("download_btn"))}">⬇</a>
  </div>`;
}

/* --- новая папка --- */
$("#mkdir-btn").addEventListener("click", async () => {
  if (!state.dirId) return toast(t("mkdir_first"), "error");
  const name = prompt(t("mkdir_prompt"));
  if (!name) return;
  try {
    await api(`/api/dirs/${state.dirId}/mkdir`, { method: "POST", body: { path: state.path, name } });
    browse();
  } catch (err) { toast(err.message, "error"); }
});

/* ================= Просмотрщик с навигацией ================= */

function openViewer(item, index) {
  state.currentFile = item;
  state.viewerIndex = index;
  renderViewer();
  $("#viewer").classList.remove("hidden");
}

function renderViewer() {
  const item = state.currentFile;
  if (!item) return;
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
    <span>${esc(t("viewer_type"))}: ${esc(t("type_" + item.type) || item.type)}</span>
    <span>${esc(t("viewer_size"))}: ${fmtSize(item.size)}</span>
    <span>${esc(t("viewer_modified"))}: ${fmtDate(item.mtime)}</span>`;

  const n = state.viewFiles.length;
  $("#viewer-counter").textContent = n ? `${state.viewerIndex + 1} / ${n}` : "";
  $("#viewer-prev").disabled = n < 2;
  $("#viewer-next").disabled = n < 2;

  const video = content.querySelector("video");
  if (video) video.volume = 0.9;
}

function navFile(delta) {
  const n = state.viewFiles.length;
  if (!n) return;
  let idx = state.viewerIndex + delta;
  if (idx < 0) idx = n - 1;
  if (idx >= n) idx = 0;
  state.currentFile = state.viewFiles[idx];
  state.viewerIndex = idx;
  renderViewer();
}

$("#viewer-prev").addEventListener("click", () => navFile(-1));
$("#viewer-next").addEventListener("click", () => navFile(1));

document.addEventListener("keydown", (e) => {
  if ($("#viewer").classList.contains("hidden")) {
    if (e.key === "Escape") {
      $("#dir-modal").classList.add("hidden");
      $("#settings-modal").classList.add("hidden");
    }
    return;
  }
  if (e.key === "ArrowLeft") { e.preventDefault(); navFile(-1); }
  else if (e.key === "ArrowRight") { e.preventDefault(); navFile(1); }
  else if (e.key === "Escape") {
    $("#viewer").classList.add("hidden");
    closeViewer();
  }
});

let touchStartX = null;
let touchStartY = null;
$("#viewer-content").addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
$("#viewer-content").addEventListener("touchend", (e) => {
  if (touchStartX == null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  touchStartX = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    navFile(dx > 0 ? -1 : 1);
  }
}, { passive: true });

function closeViewer() {
  $("#viewer-content").innerHTML = "";
  state.currentFile = null;
  state.viewerIndex = -1;
}

$("#viewer-delete").addEventListener("click", async () => {
  const f = state.currentFile;
  if (!f) return;
  if (!confirm(t("delete_confirm")(f.name))) return;
  try {
    await api(`/api/dirs/${state.dirId}/delete`, { method: "POST", body: { path: fileRel(f.name) } });
    const deletedIndex = state.viewerIndex;
    closeViewer();
    $("#viewer").classList.add("hidden");
    await browse();
    if (state.viewFiles.length) {
      const nextIdx = Math.min(deletedIndex, state.viewFiles.length - 1);
      openViewer(state.viewFiles[nextIdx], nextIdx);
    }
    toast(t("deleted"), "success");
  } catch (err) { toast(err.message, "error"); }
});

/* ================= yt-dlp ================= */

$("#fetch-formats-btn").addEventListener("click", fetchFormats);
$("#ytdlp-url").addEventListener("keydown", (e) => { if (e.key === "Enter") fetchFormats(); });

async function fetchFormats() {
  const url = $("#ytdlp-url").value.trim();
  if (!url) return toast(t("enter_url"), "error");
  const btn = $("#fetch-formats-btn");
  btn.disabled = true;
  const started = Date.now();
  const timer = setInterval(() => {
    btn.textContent = `${t("fetching")} ${Math.round((Date.now() - started) / 1000)}…`;
  }, 500);
  btn.textContent = `${t("fetching")} 0…`;
  try {
    const info = await api("/api/ytdlp/formats", {
      method: "POST",
      body: { url, proxy: $("#ytdlp-proxy").value },
    });
    state.formatInfo = info;
    state.formats = info.formats.filter((f) => f.format_id);
    renderFormatInfo();
    toast(t("info_fetched"), "success");
  } catch (err) {
    toast(err.message, "error");
  } finally {
    clearInterval(timer);
    btn.disabled = false;
    btn.textContent = t("fetch_info");
  }
}

function renderFormatInfo() {
  const info = state.formatInfo;
  if (!info) return;
  $("#fi-thumb").src = info.thumbnail
    ? "/api/img?url=" + encodeURIComponent(info.thumbnail)
    : "";
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
    if (hasVideo && !hasAudio) parts.push(t("no_audio"));
    if (!hasVideo && hasAudio) parts.push(t("audio_only"));
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
  if (!url) return toast(t("enter_url"), "error");
  if (!dirId) return toast(t("mkdir_first"), "error");

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
    await api("/api/ytdlp/download", { method: "POST", body });
    toast(t("download_started"), "success");
    switchView("downloads");
  } catch (err) { toast(err.message, "error"); }
});

/* ================= Прямая загрузка ================= */

$("#direct-start").addEventListener("click", async () => {
  const url = $("#direct-url").value.trim();
  const dirId = $("#direct-dir").value;
  if (!url) return toast(t("enter_url"), "error");
  if (!dirId) return toast(t("mkdir_first"), "error");
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
    toast(t("download_started"), "success");
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

function renderJobs() {
  const list = $("#jobs-list");
  api("/api/jobs").then((jobs) => {
    if (!jobs.length) {
      list.innerHTML = `<div style="color:var(--text-dim);padding:20px;text-align:center">
        ${esc(t("jobs_empty"))}</div>`;
      return;
    }
    list.innerHTML = jobs.map((j) => {
      const icon = j.kind === "ytdlp" ? "🎬" : "🔗";
      const runningSub = [
        fmtSize(j.downloaded),
        j.total ? `${t("of")} ${fmtSize(j.total)}` : null,
        j.speed,
        j.eta ? `${t("remaining")} ${j.eta}` : null,
      ].filter(Boolean).join(" · ");
      const sub = [
        j.dir_name,
        j.filename ? j.filename.split("/").pop() : null,
        j.status === "running" ? runningSub : null,
        j.status === "error" ? j.error : null,
        j.finished ? fmtDate(j.finished) : null,
      ].filter(Boolean).join(" · ");

      const progressHtml = ["queued", "running"].includes(j.status)
        ? `<div class="progress"><div class="progress-bar ${j.progress == null ? "indeterminate" : ""}"
             style="width:${j.progress ?? 0}%"></div></div>`
        : "";

      const active = ["queued", "running"].includes(j.status);
      const actions = active
        ? `<button class="btn danger small" data-cancel="${j.id}">${esc(t("stop"))}</button>`
        : `<button class="icon-btn" data-remove="${j.id}" title="${esc(t("remove_job"))}">✕</button>`;

      return `<div class="job">
        <div class="job-icon">${icon}</div>
        <div class="job-main">
          <div class="job-title" title="${esc(j.title)}">${esc(j.title)}</div>
          <div class="job-sub">${esc(sub)}</div>
          ${progressHtml}
        </div>
        <span class="job-status ${j.status}">${esc(t("st_" + j.status) || j.status)}</span>
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

/* ================= Настройки (прокси / Tor / пароль) ================= */

$("#settings-btn").addEventListener("click", openSettings);

function renderTorStatus(available) {
  const el = $("#tor-status");
  el.className = "status-line " + (available ? "ok" : "bad");
  el.textContent = t(available ? "tor_ok" : "tor_fail");
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
    $("#pw-error").textContent = "";
    $("#pw-current").value = "";
    $("#pw-new").value = "";
    $("#pw-repeat").value = "";
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
    $("#settings-error").textContent = t("specify_proxy");
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
    toast(t("settings_saved"), "success");
  } catch (err) {
    $("#settings-error").textContent = err.message;
  }
});

$("#pw-change-btn").addEventListener("click", async () => {
  const current = $("#pw-current").value;
  const newPw = $("#pw-new").value;
  const repeat = $("#pw-repeat").value;
  $("#pw-error").textContent = "";
  if (newPw.length < 8 || !/\d/.test(newPw) || !/[a-zA-Zа-яА-Я]/.test(newPw)) {
    $("#pw-error").textContent = t("pw_too_short");
    return;
  }
  if (newPw !== repeat) {
    $("#pw-error").textContent = t("pw_mismatch");
    return;
  }
  try {
    await api("/api/auth/password", { method: "POST", body: { current, new: newPw } });
    $("#pw-current").value = "";
    $("#pw-new").value = "";
    $("#pw-repeat").value = "";
    toast(t("pw_changed"), "success");
  } catch (err) {
    $("#pw-error").textContent = err.message;
  }
});

/* ================= Модалки: закрытие ================= */

$$("[data-close]").forEach((el) =>
  el.addEventListener("click", () => {
    $(`#${el.dataset.close}`).classList.add("hidden");
    if (el.dataset.close === "viewer") closeViewer();
  }));

/* ================= Старт ================= */

applyLang();
renderToolbarState();
api("/api/auth/status").then((s) => {
  if (s.authenticated) showApp();
  else showLogin();
}).catch(showLogin);
