"use strict";

const GITHUB_USER = "hymsoft";
const GITHUB_REPO = "playground-50-preguntas-sobre";
const GITHUB_BRANCH = "main";

const GITHUB_ROOT = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}`;
const STORE_PREFIX = "pg:";

const LEVELS = [
  { id: "basico", label: "Básico", color: "#2E9E5B" },
  { id: "intermedio", label: "Intermedio", color: "#2F6FDF" },
  { id: "avanzado", label: "Avanzado", color: "#8B5CF6" },
];

const BOOKS = [
  { id: "html", label: "HTML", color: "#E34C26", disabled: false },
  { id: "css", label: "CSS", color: "#005A9C", disabled: false },
  { id: "js", label: "JavaScript", color: "#F7DF1E", disabled: true },
];

const FILES = ["index.html", "style.css", "script.js"];
const LANG_BY_FILE = {
  "index.html": "html",
  "style.css": "css",
  "script.js": "javascript",
};

const $ = (id) => document.getElementById(id);

const bookNav = $("book-nav");
const sidebarScroll = $("sidebar-scroll");
const sidebarEmpty = $("sidebar-empty");
const search = $("search");
const tabsEl = $("tabs");
const editorHost = $("editor-host");
const preview = $("preview");
const previewUrl = $("preview-url");
const linkGithub = $("link-github");
const btnReset = $("btn-reset");
const btnOpen = $("btn-open");
const btnRun = $("btn-run");
const btnWrap = $("btn-wrap");
const btnTheme = $("btn-theme");
const toggleAuto = $("toggle-auto");
const btnCollapse = $("btn-collapse");
const sidebar = $("sidebar");
const gutter = $("gutter");
const codePane = document.querySelector(".code-pane");
const layoutEl = document.querySelector(".layout");
const consolePane = $("console-pane");
const consoleBody = $("console-body");
const consoleLog = $("console-log");
const consoleEmpty = $("console-empty");
const consoleCount = $("console-count");
const btnConsoleClear = $("btn-console-clear");
const btnConsoleToggle = $("btn-console-toggle");

let monaco = null;
let editor = null;

const state = {
  book: "html",
  booksData: {},
  current: null,
  openLevel: null,
  files: {}, // name -> texto original (raw)
  contents: {}, // name -> texto actual del modelo
  textModels: {}, // name -> ITextModel
  editing: {}, // name -> dirty
  autoplay: toggleAuto.checked,
  wrap: true,
};

const store = {
  get(book, folder, file) {
    try {
      return localStorage.getItem(`${STORE_PREFIX}${book}:${folder}${file}`);
    } catch {
      return null;
    }
  },
  set(book, folder, file, value) {
    try {
      localStorage.setItem(`${STORE_PREFIX}${book}:${folder}${file}`, value);
    } catch {
      /* sin almacenamiento */
    }
  },
  clear(book, folder) {
    try {
      FILES.forEach((f) => localStorage.removeItem(`${STORE_PREFIX}${book}:${folder}${f}`));
    } catch {
      /* sin almacenamiento */
    }
  },
};

/**
 * Construye una URL relativa para el fetch de archivos de un ejemplo.
 * @param {string} book - Identificador del libro: "html", "css" o "js".
 * @param {string} rel - Ruta relativa dentro del libro (ej: "ejemplos.json").
 * @returns {string} URL formateada como `./{book}/{rel}`.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function rawUrl(book, rel) {
  return `./${book}/${rel}`;
}

/**
 * Obtiene contenido de texto de una URL con reintentos exponenciales.
 * @param {string} url - URL a obtener.
 * @param {number} [retries=2] - Número máximo de reintentos ante fallos de red o servidor (5xx).
 * @returns {Promise<string>} Texto de la respuesta si `res.ok`.
 * @rejects {Error} Si falla después de agotar reintentos o el código de estado es 4xx/5xx definitivo.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
async function fetchText(url, retries = 2) {
  let delay = 400;
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      continue;
    }
    if (res.ok) return res.text();
    if (res.status >= 500 && attempt < retries) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      continue;
    }
    throw new Error(`HTTP ${res.status} ${url}`);
  }
}

/**
 * Carga los datos de todos los libros desde sus archivos JSON y selecciona el primer libro disponible.
 * @fires selectBook - Al terminar, abre el primer libro disponible.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
async function loadBooks() {
  const results = await Promise.all(
    BOOKS.map(async (book) => {
      try {
        const json = await fetchText(rawUrl(book.id, "ejemplos.json"));
        return { book, list: JSON.parse(json) };
      } catch (err) {
        console.warn("[books]", book.id, err);
        return { book, list: null };
      }
    })
  );

  results.forEach(({ book, list }) => {
    state.booksData[book.id] = list;
    book.disabled = !list;
  });

  renderBookNav();

  const available = BOOKS.filter((b) => !b.disabled);
  if (available.length) {
    await selectBook(available[0].id);
  } else {
    $("status").textContent = "No se pudieron cargar los libros.";
  }
}

/**
 * Renderiza los botones de navegación de los libros en el header.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function renderBookNav() {
  bookNav.innerHTML = "";
  BOOKS.forEach((book) => {
    const btn = document.createElement("button");
    btn.className = "book-pill";
    btn.type = "button";
    btn.dataset.book = book.id;
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `<span class="accent-dot" style="--book-color:${book.color}"></span>${book.label}`;
    if (book.disabled) {
      btn.disabled = true;
      btn.title = "Libro no disponible todavía";
    } else {
      btn.addEventListener("click", () => selectBook(book.id));
    }
    bookNav.append(btn);
  });
}

/**
 * Selecciona un libro activo: actualiza el estado, renderiza la sidebar y abre su primer ejemplo.
 * @param {string} bookId - Identificador del libro a seleccionar.
 * @returns {Promise<void>}
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
async function selectBook(bookId) {
  const list = state.booksData[bookId];
  if (!list) return;

  state.book = bookId;
  document.body.dataset.book = bookId;
  bookNav.querySelectorAll(".book-pill").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.book === bookId));
  });

  state.openLevel = null;
  renderSidebar(list);
  destroyEditor();
  tabsEl.innerHTML = "";
  clearConsole();
  setConsoleVisible(false);
  preview.srcdoc = "";
  previewUrl.textContent = "—";
  linkGithub.href = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/tree/${GITHUB_BRANCH}`;

  const first = list[0];
  if (first) await openExample(first);
}

/**
 * Renderiza la barra lateral con los ejemplos agrupados por nivel, aplicando filtro de búsqueda.
 * @param {Array} list - Lista de ejemplos del libro actual.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function renderSidebar(list) {
  sidebarScroll.innerHTML = "";
  sidebarEmpty.hidden = true;

  const query = search.value.trim().toLowerCase();
  const filtered = query
    ? list.filter((e) => `${e.titulo} ${e.num} ${e.carpeta}`.toLowerCase().includes(query))
    : list;

  LEVELS.forEach((level) => {
    const items = filtered.filter((e) => e.nivel === level.id);
    if (!items.length) return;

    const group = document.createElement("section");
    group.className = "level-group";
    group.dataset.level = level.id;
    group.style.setProperty("--level-color", level.color);

    const searching = query.length > 0;
    const expanded = searching ? true : state.openLevel === level.id;
    group.classList.toggle("collapsed", !expanded);

    const h = document.createElement("h2");
    h.className = "level-title";

    const toggle = document.createElement("button");
    toggle.className = "level-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.innerHTML = `<span class="level-chevron" aria-hidden="true">▸</span><span class="level-label">${level.label}</span><span class="level-count">(${items.length})</span>`;
    toggle.addEventListener("click", () => {
      state.openLevel = state.openLevel === level.id ? null : level.id;
      sidebarScroll.querySelectorAll(".level-group").forEach((g) => {
        const open = g.dataset.level === state.openLevel;
        g.classList.toggle("collapsed", !open);
        g.querySelector(".level-toggle")?.setAttribute("aria-expanded", String(open));
      });
    });
    h.append(toggle);
    group.append(h);

    const ul = document.createElement("ul");
    ul.className = "example-list";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "example-item";
      li.dataset.url = item.url;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.addEventListener("click", () => openExample(item));

      const num = document.createElement("span");
      num.className = "num";
      num.textContent = item.num;

      const t = document.createElement("span");
      t.className = "titulo";
      t.textContent = item.titulo;

      const r = document.createElement("span");
      r.className = "ruta";
      r.textContent = item.carpeta;

      btn.append(num, t, r);
      li.append(btn);
      ul.append(li);
    });

    group.append(ul);
    sidebarScroll.append(group);
  });

  if (!filtered.length) sidebarEmpty.hidden = false;
}

/**
 * Resalta el ejemplo seleccionado en la barra lateral y lo desplaza a la vista si está colapsado.
 * @param {string} url - URL del ejemplo resaltar.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function highlightSidebar(url) {
  const items = sidebarScroll.querySelectorAll(".example-item");
  let target = null;
  items.forEach((li) => {
    const selected = li.dataset.url === url;
    li.toggleAttribute("aria-selected", selected);
    li.querySelector("button").setAttribute("aria-selected", String(selected));
    if (selected) target = li;
  });
  if (target) {
    const group = target.closest(".level-group");
    if (group && group.classList.contains("collapsed")) {
      state.openLevel = group.dataset.level;
      sidebarScroll.querySelectorAll(".level-group").forEach((g) => {
        const open = g === group;
        g.classList.toggle("collapsed", !open);
        g.querySelector(".level-toggle")?.setAttribute("aria-expanded", String(open));
      });
    }
    target.scrollIntoView({ block: "nearest" });
  }
}

/**
 * Carga los archivos (index.html, y detecta style.css/script.js) de un ejemplo, aplicando contenido guardado si está disponible.
 * @param {string} book - Identificador del libro.
 * @param {string} folder - Carpeta del ejemplo.
 * @param {boolean} useSaved - Si es true, usa el contenido guardado en localStorage.
 * @returns {Promise<{files:Object, contents:Object, available:Array<string>}|null>} Datos de los archivos o null si no hay index.html.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
async function loadFiles(book, folder, useSaved) {
  const files = {};
  const contents = {};
  const available = [];

  try {
    const txt = await fetchText(rawUrl(book, folder + "index.html"));
    files["index.html"] = txt;
    if (useSaved) {
      const saved = store.get(book, folder, "index.html");
      contents["index.html"] = saved != null ? saved : txt;
    } else {
      contents["index.html"] = txt;
    }
    available.push("index.html");
  } catch {
    return null; /* sin index.html no hay ejemplo que mostrar */
  }

  const extras = [];
  if (/style\.css/i.test(files["index.html"])) extras.push("style.css");
  if (/script\.js/i.test(files["index.html"])) extras.push("script.js");

  for (const name of extras) {
    try {
      const txt = await fetchText(rawUrl(book, folder + name));
      files[name] = txt;
      if (useSaved) {
        const saved = store.get(book, folder, name);
        contents[name] = saved != null ? saved : txt;
      } else {
        contents[name] = txt;
      }
      available.push(name);
    } catch {
      /* referenciado pero no existe en este ejemplo */
    }
  }

  return { files, contents, available };
}

/**
 * Abre un ejemplo: persiste el estado actual, carga sus archivos y los muestra en el editor y preview.
 * @param {Object} item - Objeto del ejemplo con `carpeta`, `url`, `titulo`, etc.
 * @returns {Promise<void>}
 * @fires persistCurrent, highlightSidebar, loadFiles, ensureMonaco, getOjos, schedulePreview
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
async function openExample(item) {
  persistCurrent(true);
  $("status").textContent = `Leyendo ${item.carpeta}…`;
  state.current = item;
  previewUrl.textContent = `${state.book}/${item.url}`;
  linkGithub.href = `${GITHUB_ROOT}/${state.book}/${item.url}`;
  highlightSidebar(item.url);

  const folder = item.carpeta;
  state.files = {};
  state.contents = {};
  state.editing = {};
  for (const name of Object.keys(state.textModels)) {
    state.textModels[name].dispose();
    delete state.textModels[name];
  }

  const loaded = await loadFiles(state.book, folder, true);
  if (!loaded) {
    $("status").textContent = `No se pudo cargar ${item.url}`;
    tabsEl.innerHTML = "";
    destroyEditor();
    clearConsole();
    setConsoleVisible(false);
    preview.srcdoc = "";
    return;
  }
  state.files = loaded.files;
  state.contents = loaded.contents;

  renderTabs(loaded.available);
  await ensureMonaco(() => buildEditor(loaded.available[0]));
  await getOjos();
  schedulePreview(0);
  $("status").textContent = `Leyendo desde ${GITHUB_BRANCH}`;
}

/**
 * Renderiza las pestañas de archivos (index.html, style.css, script.js) en la barra de pestañas.
 * @param {string[]} names - Nombres de los archivos disponibles.
 * @fires refreshTabs - Al finalizar, actualiza estado dirty.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function renderTabs(names) {
  tabsEl.innerHTML = "";
  names.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.dataset.file = name;
    btn.innerHTML = `<span class="tab-name">${name}</span>`;
    btn.addEventListener("click", () => buildEditor(name));
    tabsEl.append(btn);
  });
  refreshTabs();
}

/**
 * Actualiza el estado "dirty" (modificado) de todas las pestañas según el modelo del editor.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function refreshTabs() {
  tabsEl.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("dirty", Boolean(state.editing[btn.dataset.file]));
  });
}

/**
 * Garantiza que el editor Monaco esté cargado antes de ejecutar un callback. Si ya está listo, ejecuta de inmediato.
 * @param {Function} cb - Callback a ejecutar una vez Monaco está disponible.
 * @returns {Promise} Resolución del callback (o null si falla la carga).
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function ensureMonaco(cb) {
  if (monaco) return Promise.resolve(cb());
  return new Promise((resolve) => {
    let settled = false;
    const fail = (msg) => {
      if (settled) return;
      settled = true;
      $("status").textContent = `${msg} Recargá el ejemplo para reintentar.`;
      editorHost.innerHTML =
        "<div class='skeleton' role='status'><span aria-hidden='true'>⚠</span><span>No se pudo cargar el editor. Recargá el ejemplo para reintentar.</span></div>";
      resolve(null);
    };
    const timer = setTimeout(() => fail("No se pudo cargar el editor (timeout)."), 10000);
    try {
      window.require.config({
        paths: {
          vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
        },
      });
      window.require(
        ["vs/editor/editor.main"],
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          monaco = window.monaco;
          monaco.editor.defineTheme("pg-light", {
            base: "vs",
            inherit: true,
            rules: [],
            colors: { "editor.background": "#FFFFFF" },
          });
          monaco.editor.defineTheme("pg-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: { "editor.background": "#1E1D1B" },
          });
          monaco.editor.setTheme(currentTheme() === "dark" ? "pg-dark" : "pg-light");
          resolve(cb());
        },
        () => {
          clearTimeout(timer);
          fail("No se pudo cargar el editor.");
        }
      );
    } catch {
      clearTimeout(timer);
      fail("No se pudo cargar el editor.");
    }
  });
}

/**
 * Crea o reutiliza un modelo de texto de Monaco para un archivo.
 * @param {string} name - Nombre del archivo (determina el lenguaje).
 * @param {string} content - Contenido inicial del modelo.
 * @returns {monaco.editor.ITextModel} Modelo de texto listo para el editor.
 * @fires refreshTabs, schedulePreview - Al cambiar contenido (si autoplay está activo).
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function getModel(name, content) {
  if (state.textModels[name]) return state.textModels[name];
  const model = monaco.editor.createModel(content, LANG_BY_FILE[name] || "html");
  model.updateOptions({ fontFamily: "JetBrains Mono, monospace", fontSize: 13 });
  model.onDidChangeContent(() => {
    state.contents[name] = model.getValue();
    state.editing[name] = model.getValue() !== state.files[name];
    refreshTabs();
    if (state.autoplay) schedulePreview(800);
  });
  state.textModels[name] = model;
  return model;
}

/**
 * Crea o cambia el editor Monaco activo para un archivo específico.
 * @param {string} name - Nombre del archivo a mostrar en el editor.
 * @fires persistCurrent - Al perder foco del editor.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function buildEditor(name) {
  tabsEl.querySelectorAll(".tab").forEach((b) => {
    if (b.dataset.file === name) b.setAttribute("aria-current", "true");
    else b.removeAttribute("aria-current");
  });

  const model = getModel(name, state.contents[name] || "");

  if (!editor) {
    editorHost.innerHTML = "";
    editor = monaco.editor.create(editorHost, {
      model,
      theme: currentTheme() === "dark" ? "pg-dark" : "pg-light",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 13,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      tabSize: 2,
      renderWhitespace: "selection",
      wordWrap: state.wrap ? "on" : "off",
    });
    editor.onDidBlurEditorText(() => persistCurrent(true));
  } else {
    editor.setModel(model);
  }
}

/**
 * Destruye el editor Monaco activo (y sus modelos) y muestra el skeleton de carga.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function destroyEditor() {
  if (editor) {
    editor.dispose();
    editor = null;
  }
  for (const name of Object.keys(state.textModels)) {
    state.textModels[name].dispose();
    delete state.textModels[name];
  }
  editorHost.innerHTML =
    "<div class='skeleton' role='status'><span class='spinner' aria-hidden='true'></span><span>Cargando ejemplo…</span></div>";
}

let debounceTimer = null;

/**
 * Programa una actualización del preview con debounce. Si ya hay una pendiente, la reemplaza.
 * @param {number} delay - Milisegundos de espera antes de ejecutar `updatePreview`.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function schedulePreview(delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => updatePreview(), delay);
}

/**
 * Obtiene el valor actual de un archivo: contenido editado del modelo, o el original si no hay editor.
 * @param {string} name - Nombre del archivo ("index.html", "style.css" o "script.js").
 * @returns {string|undefined} Contenido actual del archivo.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function currentValue(name) {
  const model = state.textModels[name];
  if (model) return model.getValue();
  return state.files[name]; // solo sin editor: original
}

const CONSOLE_MAX = 200;

let consoleTotal = 0;

const CONSOLE_SHIM = `(function(){
try{
var MAX=${CONSOLE_MAX};var n=0;
function fmt(v){
if(typeof v==="string")return v;
if(v==null)return String(v);
if(v instanceof Error)return v.stack||String(v);
if(typeof v==="function")return"[Function "+(v.name||"anonymous")+"]";
if(typeof v==="object"){
try{
if(v.nodeType===1)return"<"+String(v.tagName).toLowerCase()+">";
return JSON.stringify(v);
}catch(e){
try{return String(v);}catch(_){return"[Object]"}}
}
return String(v);
}
function send(level,args){
if(n>=MAX)return;n++;
try{
var text=args.map(fmt).join(" ").slice(0,2000);
parent.postMessage({__pgConsole:true,level:level,text:text}, "*");
}catch(e){}
}
["log","info","warn","error","debug"].forEach(function(m){
var orig=null;
try{orig=console[m]?console[m].bind(console):null;}catch(e){}
console[m]=function(){
try{send(m,Array.prototype.slice.call(arguments));}catch(e){}
if(orig){try{orig.apply(null,arguments);}catch(e){}}
};
});
console.table=function(d){try{send("log",[d]);}catch(e){}};
console.clear=function(){try{parent.postMessage({__pgConsole:true,level:"__clear"}, "*");}catch(e){}};
window.addEventListener("error",function(e){
send("error",[(e.message||"Error")+(e.lineno?" ("+e.lineno+":"+e.colno+")":"")]);
});
window.addEventListener("unhandledrejection",function(e){
var r=e.reason;
send("error",[(r&&r.stack)||(r&&r.message)||String(r)]);
});
}catch(e){}
})();`;

const LOG_BADGE = {
  log: ">",
  info: "i",
  warn: "!",
  error: "×",
  debug: "·",
};

/**
 * Verifica si el libro actual es JavaScript y el ejemplo contiene archivo script.js.
 * @returns {boolean} True si hay un ejemplo con JS cargado.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function hasJsExample() {
  return state.book === "js" && state.files["script.js"] != null;
}

/**
 * Mueststra u oculta el panel de consola JS.
 * @param {boolean} show - True para mostrar, false para ocultar.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function setConsoleVisible(show) {
  if (!consolePane) return;
  consolePane.dataset.visible = show ? "true" : "false";
}

/**
 * Actualiza el estado visual de "consola vacía" y el contador de logs.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function updateConsoleEmpty() {
  const empty = consoleLog.childElementCount === 0;
  consoleEmpty.hidden = !empty;
  consoleCount.hidden = consoleTotal === 0;
  if (consoleTotal > 0) consoleCount.textContent = String(consoleTotal);
}

/**
 * Limpia todos los mensres de la consola de JavaScript y reinicia el contador.
 * @fires updateConsoleEmpty - Al limpiar, actualiza estado visual.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function clearConsole() {
  consoleLog.innerHTML = "";
  consoleTotal = 0;
  updateConsoleEmpty();
}

/**
 * Añade una entrada de log a la consola con sello de tiempo y nivel (log/info/warn/error).
 * @param {string} level - Nivel del log: "log", "info", "warn", "error", "debug" o "__clear".
 * @param {string} text - Mensaje a mostrar.
 * @fires updateConsoleEmpty - Al añadir, actualiza estado visual y contador.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function appendLog(level, text) {
  if (level === "__clear") {
    clearConsole();
    return;
  }
  const safeLevel = LOG_BADGE[level] ? level : "log";
  const line = document.createElement("div");
  line.className = "log-line";
  line.dataset.level = safeLevel;

  const time = document.createElement("span");
  time.className = "log-time";
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  time.textContent = `${hh}:${mm}:${ss}`;

  const badge = document.createElement("span");
  badge.className = "log-badge";
  badge.setAttribute("aria-hidden", "true");
  badge.textContent = LOG_BADGE[safeLevel];

  const msg = document.createElement("span");
  msg.className = "log-text";
  msg.textContent = text || "";

  line.append(time, badge, msg);
  const nearBottom =
    consoleBody.scrollHeight - consoleBody.scrollTop - consoleBody.clientHeight < 60;
  consoleLog.append(line);
  while (consoleLog.childElementCount > CONSOLE_MAX) {
    consoleLog.firstElementChild?.remove();
  }
  consoleTotal += 1;
  updateConsoleEmpty();
  if (nearBottom) consoleBody.scrollTop = consoleBody.scrollHeight;
}

window.addEventListener("message", (event) => {
  if (event.source !== preview.contentWindow) return;
  const data = event.data;
  if (!data || data.__pgConsole !== true) return;
  if (state.book !== "js") return;
  appendLog(data.level, data.text);
});

btnConsoleClear?.addEventListener("click", clearConsole);

btnConsoleToggle?.addEventListener("click", () => {
  const collapsed = consolePane.classList.toggle("collapsed");
  btnConsoleToggle.setAttribute("aria-expanded", String(!collapsed));
  btnConsoleToggle.textContent = collapsed ? "Mostrar" : "Ocultar";
});

let ojosCache = null;
let ojosPromise = null;

/**
 * Carga el helper compartido de "ojos" (js/ojos.js) con caché y promesa única.
 * @returns {Promise<string|null>} Código del helper cacheado, o null si falla.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function getOjos() {
  if (ojosCache != null) return Promise.resolve(ojosCache);
  if (!ojosPromise) {
    ojosPromise = fetchText(rawUrl("js", "ojos.js"))
      .then((txt) => {
        ojosCache = txt;
        return txt;
      })
      .catch(() => null);
  }
  return ojosPromise;
}

/**
 * Construye un documento HTML completo (srcdoc) inyectando el CSS y JS del ejemplo inline.
 * @param {boolean} [includeConsole=true] - Si es true y el libro es JS, inyecta el shim de consola.
 * @returns {string|void} HTML listo para el iframe preview.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function combinedDoc(includeConsole = true) {
  let html = currentValue("index.html") ?? state.files["index.html"] ?? "";
  const css = currentValue("style.css");
  const js = currentValue("script.js");

  if (css != null) {
    const safeCss = css.replace(/<\/style/gi, "<\\/style");
    html = html.replace(
      /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*style\.css(\?[^"']*)?["'][^>]*\/?>/gi,
      `<style>\n/* style.css */\n${safeCss}\n</style>`
    );
  }
  if (js != null) {
    const safeJs = js.replace(/<\/script/gi, "<\\/script");
    const shim =
      includeConsole && state.book === "js"
        ? `<script>\n/* consola playground (solo lectura) */\n${CONSOLE_SHIM}\n</script>\n`
        : "";
    html = html.replace(
      /<script\b[^>]*src=["'][^"']*script\.js(\?[^"']*)?["'][^>]*><\/script>/gi,
      `${shim}<script>\n/* script.js */\n${safeJs}\n</script>`
    );
  }
  if (ojosCache != null) {
    // El srcdoc no resuelve relativos ("../../ojos.js" → 404 contra el portal),
    // así que se inlina el helper compartido de los ojos.
    const safeOjos = ojosCache.replace(/<\/script/gi, "<\\/script");
    html = html.replace(
      /<script\b[^>]*src=["'][^"']*ojos\.js["'][^>]*>\s*<\/script\s*>/gi,
      `<script>\n/* ../../ojos.js */\n${safeOjos}\n</script>`
    );
  }
  return html;
}

/**
 * Actualiza el iframe de preview con el código actual, limpiando y configurando la consola.
 * @fires combinedDoc, clearConsole, setConsoleVisible, persistCurrent
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function updatePreview() {
  const doc = combinedDoc(true);
  if (!doc) return;
  clearConsole();
  setConsoleVisible(hasJsExample());
  preview.srcdoc = doc;
  persistCurrent(false);
}

let lastPersist = 0;

/**
 * Persiste el contenido editado de los archivos actuales en localStorage (con throttle de 2s).
 * @param {boolean} [force=false] - Si es true, fuerza el guardado ignorando el throttle.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function persistCurrent(force = false) {
  if (!state.current) return;
  const now = Date.now();
  if (!force && now - lastPersist < 2000) return;
  lastPersist = now;
  FILES.forEach((name) => {
    if (state.files[name] != null && state.editing[name]) {
      store.set(state.book, state.current.carpeta, name, currentValue(name));
    }
  });
}

/**
 * Restablece el ejemplo actual a su estado original borrando los datos guardados en localStorage.
 * @fires loadFiles, renderTabs, buildEditor, clearConsole, schedulePreview
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
async function resetExample() {
  const item = state.current;
  if (!item) return;

  const folder = item.carpeta;
  const prevTab = tabsEl.querySelector('.tab[aria-current="true"]');
  const prevFile = prevTab ? prevTab.dataset.file : null;
  state.files = {};
  state.contents = {};
  state.editing = {};
  store.clear(state.book, folder);

  for (const name of Object.keys(state.textModels)) {
    state.textModels[name].dispose();
    delete state.textModels[name];
  }

  const loaded = await loadFiles(state.book, folder, false);
  if (!loaded) return;
  state.files = loaded.files;
  state.contents = loaded.contents;

  const names = FILES.filter((n) => state.files[n] != null);
  renderTabs(names);
  buildEditor(prevFile && names.includes(prevFile) ? prevFile : names[0]);
  clearConsole();
  schedulePreview(0);
}

/**
 * Abre el ejemplo actual en una nueva pestaña como archivo HTML descargable.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function openInNewTab() {
  const doc = combinedDoc(false);
  if (!doc) return;
  const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "noopener");
  if (!w) {
    $("status").textContent = "Permití popups para abrir en pestaña nueva";
  } else {
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}

const THEME_KEY = "pg:theme";

const ICON_MOON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

/**
 * Devuelve el tema actual aplicado al documento ("dark" o "light").
 * @returns {string} "dark" o "light".
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function currentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * Actualiza el icono y etiqueta accesible del botón de toggle de tema.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function paintThemeButton() {
  const dark = currentTheme() === "dark";
  btnTheme.innerHTML = dark ? ICON_SUN : ICON_MOON;
  btnTheme.setAttribute("aria-label", dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
}

/**
 * Aplica un tema (claro/oscuro) al documento, al editor Monaco y lo persiste en localStorage.
 * @param {string} theme - "light" o "dark".
 * @param {boolean} [persist=true] - Si es true, guarda la preferencia en localStorage.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function applyTheme(theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* sin almacenamiento */
    }
  }
  if (monaco) monaco.editor.setTheme(theme === "dark" ? "pg-dark" : "pg-light");
  paintThemeButton();
}

btnTheme.addEventListener("click", () => {
  applyTheme(currentTheme() === "dark" ? "light" : "dark");
});

try {
  if (!localStorage.getItem(THEME_KEY)) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      try {
        if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? "dark" : "light", false);
      } catch {
        /* sin almacenamiento */
      }
    };
    if (typeof mql.addEventListener === "function") mql.addEventListener("change", onChange);
    else if (typeof mql.addListener === "function") mql.addListener(onChange);
  }
} catch {
  /* sin almacenamiento */
}
paintThemeButton();

window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    if (e.target === search) return;
    e.preventDefault();
    clearTimeout(debounceTimer);
    updatePreview();
  }
});

toggleAuto.addEventListener("change", () => {
  state.autoplay = toggleAuto.checked;
  btnRun.hidden = state.autoplay;
  if (state.autoplay) schedulePreview(800);
});

btnRun.addEventListener("click", () => {
  clearTimeout(debounceTimer);
  updatePreview();
});

btnReset.addEventListener("click", resetExample);
btnOpen.addEventListener("click", openInNewTab);

btnWrap.addEventListener("click", () => {
  state.wrap = !state.wrap;
  btnWrap.setAttribute("aria-pressed", String(state.wrap));
  if (editor) editor.updateOptions({ wordWrap: state.wrap ? "on" : "off" });
});

let searchTimer = 0;
search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const list = state.booksData[state.book];
    if (list) renderSidebar(list);
  }, 150);
});

window.addEventListener("beforeunload", () => persistCurrent(true));

btnCollapse.addEventListener("click", () => {
  const collapsed = sidebar.classList.toggle("collapsed");
  btnCollapse.setAttribute("aria-expanded", String(!collapsed));
  btnCollapse.innerHTML = `<span aria-hidden="true">${collapsed ? "▶" : "◀"}</span>`;
  if (collapsed) {
    sidebarScroll.setAttribute("inert", "");
    search.disabled = true;
    if (sidebar.contains(document.activeElement) && document.activeElement !== btnCollapse) {
      btnCollapse.focus();
    }
  } else {
    sidebarScroll.removeAttribute("inert");
    search.disabled = false;
  }
});

/**
 * Inicia la interacción de redimensionamiento arrastrando el gripper vertical entre editor y preview.
 * @param {PointerEvent} event - Evento pointerdown del gripper.
 * @author Hugo Segura
 * @company HyM Soft
 * @date 2026
 */
function startResize(event) {
  event.preventDefault();
  gutter.classList.add("active");
  const startX = event.clientX;
  const startPct = (codePane.offsetWidth / layoutEl.offsetWidth) * 100;
  let raf = 0;
  let lastX = startX;

  const apply = () => {
    raf = 0;
    const deltaPct = ((lastX - startX) / layoutEl.offsetWidth) * 100;
    const next = Math.min(85, Math.max(15, startPct + deltaPct));
    codePane.style.flexBasis = `${next}%`;
    gutter.setAttribute("aria-valuenow", String(Math.round(next)));
  };
  const onMove = (ev) => {
    lastX = ev.clientX;
    if (!raf) raf = requestAnimationFrame(apply);
  };
  const onUp = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    gutter.classList.remove("active");
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  try {
    gutter.setPointerCapture(event.pointerId);
  } catch {
    /* navegador sin pointer capture */
  }
}

gutter.addEventListener("pointerdown", startResize);

gutter.addEventListener("keydown", (e) => {
  const step = e.shiftKey ? 10 : 5;
  // No usar getComputedStyle: devuelve px resueltos (ej. "600px") que al
  // compararse con el rango 15-85 saltarían al máximo. Se lee el estado
  // guardado en aria-valuenow, que siempre está en %.
  let basis = parseFloat(gutter.getAttribute("aria-valuenow")) || 50;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    basis = e.key === "ArrowLeft" ? Math.max(15, basis - step) : Math.min(85, basis + step);
    codePane.style.flexBasis = `${basis}%`;
    gutter.setAttribute("aria-valuenow", String(Math.round(basis)));
  } else if (e.key === "Home" || e.key === "End") {
    e.preventDefault();
    basis = e.key === "Home" ? 15 : 85;
    codePane.style.flexBasis = `${basis}%`;
    gutter.setAttribute("aria-valuenow", String(basis));
  }
});

getOjos(); // precarga el helper de los ojos en paralelo
loadBooks().catch((err) => {
  $("status").textContent = "Error inicial al cargar los libros.";
  console.error("[books] init", err);
});