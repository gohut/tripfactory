// panel-core.js
// Main editor panel — page management, element list, props, drag, add/group, save.
// Depends on: panel-styles.js, panel-dom.js, panel-mobile.js

import {
  PANEL_MIN_HEIGHT,
  PANEL_MIN_WIDTH,
  injectStyles,
  loadPanelState,
  savePanelState,
  waitForPageData
} from './panel-styles.js';
import {
  genId,
  injectPanelDOM,
  isValidBackground,
  isValidColor,
  showToast,
  toHex
} from './panel-dom.js';
import { setupMobileMode } from './panel-mobile.js';

function initPanel() {
  injectStyles();
  injectPanelDOM();

  const panel = document.getElementById('editor-panel');

  const header = document.getElementById('panel-header');
  header.innerHTML = `
    <div class="ph-row">
      <div>
        <div class="ph-kicker">Layout Editor</div>
        <div class="ph-title">WebEditor</div>
      </div>
      <div class="ph-tools">
        <button type="button" id="panel-mobile-btn" class="panel-icon-btn" title="Toggle mobile view" aria-label="Toggle mobile view" style="font-size:15px;">📱</button>
        <button type="button" id="panel-move-btn" class="panel-icon-btn" title="Drag panel" aria-label="Drag panel">&#10021;</button>
        <button type="button" id="panel-close-btn" class="panel-icon-btn" title="Hide panel" aria-label="Hide panel">&times;</button>
      </div>
    </div>
    <div class="panel-header-meta" style="gap:6px;flex-wrap:nowrap;align-items:center">
      <select id="ph-page-select" class="ph-page-select" title="Switch page"></select>
      <input id="ph-canvas-height" class="ph-height-input" type="number" min="100" step="10" title="Canvas height (px)" placeholder="H" />
      <span style="font-size:9px;color:var(--ed-text-faint);flex-shrink:0">px</span>
      <button type="button" id="ph-add-page-btn" class="panel-icon-btn" title="New page" style="flex-shrink:0;font-size:15px;font-weight:700">+</button>
      <span style="flex:1"></span>
      <span class="ph-sub" id="ph-elcount">0 elements</span>
    </div>
    <div class="panel-header-meta" id="ph-bg-row" style="gap:8px;flex-wrap:nowrap;align-items:center;margin-top:8px;">
      <span class="ph-sub" style="flex-shrink:0;">Page BG</span>
      <div class="color-row" style="flex:1;justify-content:flex-end;">
        <div class="color-swatch-wrap" id="swatch-page-bg" title="Page background color">
          <div class="color-swatch-preview" id="swatch-page-bg-preview"></div>
          <input type="color" id="color-page-bg" />
        </div>
        <input class="color-hex" id="color-page-bg-hex" type="text" maxlength="400" placeholder="#f0f0f5, rgba(), or gradient()" style="max-width:150px;" />
      </div>
    </div>
    <div class="panel-header-meta" id="ph-font-row" style="gap:8px;flex-wrap:nowrap;align-items:center;margin-top:8px;">
      <span class="ph-sub" style="flex-shrink:0;" title="Sets the .ttf/.otf font for every text-capable element at once">Base Font</span>
      <input class="color-hex" id="ph-global-font" type="text" maxlength="300" placeholder="./asset/Poppins-Black.ttf" style="flex:1;" />
      <button type="button" id="ph-global-font-apply" class="panel-icon-btn" title="Apply to every text element" style="flex-shrink:0;font-size:13px;">↻</button>
    </div>
    <div id="ph-new-page-popup" style="display:none;position:absolute;right:12px;top:88px;z-index:10010;background:var(--ed-surface);border:1px solid var(--ed-border);border-radius:var(--ed-radius);padding:12px;box-shadow:0 8px 24px rgba(0,0,0,0.5);min-width:200px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--ed-text-faint);margin-bottom:8px;">New Page Name</div>
      <input id="ph-new-page-name" type="text" class="pinput" placeholder="e.g. about" style="width:100%;margin-bottom:8px;" />
      <div style="display:flex;gap:6px;">
        <button type="button" id="ph-new-page-confirm" class="paction save" style="flex:1;margin:0;min-height:28px;padding:6px 8px;">Create</button>
        <button type="button" id="ph-new-page-cancel" class="paction muted" style="flex:1;margin:0;min-height:28px;padding:6px 8px;">Cancel</button>
      </div>
    </div>
  `;

  const saveSection = document.getElementById('save-section');
  saveSection.innerHTML = `
    <button type="button" class="paction save" id="btn-save">Save JSON</button>
  `;

  let peek = document.getElementById('panel-peek');
  if (!peek) {
    peek = document.createElement('button');
    peek.id = 'panel-peek';
    peek.type = 'button';
    peek.hidden = true;
    peek.setAttribute('aria-label', 'Open editor panel');
    peek.innerHTML = `<span>&gt;</span><span>WebEditor</span>`;
    document.body.appendChild(peek);
  }

  const toast = document.getElementById('panel-toast');
  const storedState = loadPanelState();
  const panelState = {
    x: Number.isFinite(storedState.x) ? storedState.x : Math.max(16, window.innerWidth - 380 - 24),
    y: Number.isFinite(storedState.y) ? storedState.y : 20,
    width: Number.isFinite(storedState.width) ? storedState.width : 380,
    height: Number.isFinite(storedState.height) ? storedState.height : Math.min(680, Math.max(PANEL_MIN_HEIGHT, window.innerHeight - 40)),
    collapsed: !!storedState.collapsed
  };

  function clampPanelState() {
    const viewportLeft = 8;
    const viewportTop = 8;
    const maxWidth = Math.max(PANEL_MIN_WIDTH, window.innerWidth - 16);
    const maxHeight = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - 16);

    panelState.width = Math.min(Math.max(panelState.width, PANEL_MIN_WIDTH), maxWidth);
    panelState.height = Math.min(Math.max(panelState.height, PANEL_MIN_HEIGHT), maxHeight);

    const viewportRight = window.innerWidth - panelState.width - 8;
    const viewportBottom = window.innerHeight - panelState.height - 8;

    panelState.x = Math.min(Math.max(panelState.x, viewportLeft), Math.max(viewportLeft, viewportRight));
    panelState.y = Math.min(Math.max(panelState.y, viewportTop), Math.max(viewportTop, viewportBottom));
  }

  function syncPanelSizeFromDom() {
    if (panelState.collapsed) return;
    panelState.width = Math.max(PANEL_MIN_WIDTH, Math.round(panel.offsetWidth));
    panelState.height = Math.max(PANEL_MIN_HEIGHT, Math.round(panel.offsetHeight));
    clampPanelState();
  }

  function syncToastPosition() {
    toast.style.left = '50%';
    toast.style.right = '';
    toast.style.top = '';
    toast.style.bottom = '20px';
    toast.style.transform = 'translateX(-50%)';
  }

  function applyPanelState() {
    clampPanelState();
    panel.classList.toggle('is-collapsed', panelState.collapsed);
    panel.style.left = panelState.x + 'px';
    panel.style.top = panelState.y + 'px';
    panel.style.width = panelState.width + 'px';
    panel.style.height = panelState.height + 'px';

    peek.hidden = !panelState.collapsed;
    peek.style.left = Math.min(panelState.x, window.innerWidth - 170) + 'px';
    peek.style.top = Math.min(panelState.y, window.innerHeight - 54) + 'px';

    syncToastPosition();
    savePanelState(panelState);
  }

  function onPanelMoveMouseDown(e) {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = panelState.x;
    const originY = panelState.y;
    const overlay = document.getElementById('drag-overlay');

    panel.classList.add('is-moving');
    overlay.classList.add('panel-drag');

    function onMove(ev) {
      panelState.x = originX + (ev.clientX - startX);
      panelState.y = originY + (ev.clientY - startY);
      applyPanelState();
    }

    function onUp() {
      panel.classList.remove('is-moving');
      overlay.classList.remove('panel-drag');
      syncPanelSizeFromDom();
      applyPanelState();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  document.getElementById('panel-move-btn').addEventListener('mousedown', onPanelMoveMouseDown);

  document.getElementById('panel-close-btn').addEventListener('click', () => {
    syncPanelSizeFromDom();
    panelState.collapsed = true;
    applyPanelState();
  });

  peek.addEventListener('click', () => {
    panelState.collapsed = false;
    applyPanelState();
  });

  window.addEventListener('resize', () => {
    syncPanelSizeFromDom();
    applyPanelState();
  });

  document.addEventListener('mouseup', () => {
    syncPanelSizeFromDom();
    applyPanelState();
  });

  applyPanelState();

  // ─── Page Management ────────────────────────────────────────────────────────
  // Pages are stored as localStorage keys: 'webeditor-page-<name>' = JSON string.
  // 'main' maps to page.json (the default); others map to <name>.json.
  // The registry of known pages lives in 'webeditor-pages-registry' = JSON array of names.

  const PAGE_REGISTRY_KEY = 'webeditor-pages-registry';
  const PAGE_DATA_PREFIX   = 'webeditor-page-';
  const DEFAULT_PAGE       = 'main';

  // Converts a pageData object (whose elements may be Proxied) into a plain
  // serialisable structure with raw `layouts` intact for both modes.
  function serializePageData(pd) {
    if (!pd) return pd;
    const out = Object.assign({}, pd);
    out.elements = (pd.elements || []).map(el => {
      const serialized = {};
      for (const k of Object.keys(el)) {
        serialized[k] = el[k]; // Proxy passthrough for non-layout keys
      }
      // Pull raw layouts directly (bypasses Proxy interception)
      if (el.layouts) {
        serialized.layouts = JSON.parse(JSON.stringify(el.layouts));
      }
      return serialized;
    });
    return out;
  }

  function getRegistry() {
    try { return JSON.parse(localStorage.getItem(PAGE_REGISTRY_KEY)) || [DEFAULT_PAGE]; }
    catch(e) { return [DEFAULT_PAGE]; }
  }
  function saveRegistry(list) {
    try { localStorage.setItem(PAGE_REGISTRY_KEY, JSON.stringify(list)); } catch(e) {}
  }
  function getPageData(name) {
    try {
      const raw = localStorage.getItem(PAGE_DATA_PREFIX + name);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return null;
  }
  function savePageData(name, data) {
    try { localStorage.setItem(PAGE_DATA_PREFIX + name, JSON.stringify(data)); } catch(e) {}
  }

  // Determine current page from URL ?page= param
  function currentPageName() {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page');
    return (p && p !== 'page') ? p : DEFAULT_PAGE;
  }

  let _activePage = currentPageName();

  // On first load, if there's no stored data for 'main', snapshot the live pageData
  if (!getPageData(DEFAULT_PAGE) && window.pageData) {
    savePageData(DEFAULT_PAGE, serializePageData(window.pageData));
  }
  // Ensure registry has at least main
  {
    const reg = getRegistry();
    if (!reg.includes(DEFAULT_PAGE)) { reg.unshift(DEFAULT_PAGE); saveRegistry(reg); }
  }

  function buildPageSelect() {
    const sel = document.getElementById('ph-page-select');
    if (!sel) return;
    const reg = getRegistry();
    sel.innerHTML = '';
    reg.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name === DEFAULT_PAGE ? 'main (default)' : name;
      if (name === _activePage) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function switchToPage(name) {
    // Save current page state before leaving
    savePageData(_activePage, serializePageData(window.pageData));
    _activePage = name;

    // Update URL without reload to reflect current page
    const url = new URL(window.location.href);
    if (name === DEFAULT_PAGE) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', name);
    }
    window.history.replaceState({}, '', url.toString());

    // Load stored page data or create empty page
    let data = getPageData(name);
    if (!data) {
      data = { pageName: name, elements: [] };
      savePageData(name, data);
    }
    window.renderPage(data);
    buildElementList();
    updateElCount();
    // Update canvas height field
    syncHeightInput();
    // Update page background color field
    syncPageBgInput();
    syncGlobalFontInput();
    showToast('Switched to page: ' + name);
  }

  function syncHeightInput() {
    const canvas = document.getElementById('canvas');
    const inp = document.getElementById('ph-canvas-height');
    if (!canvas || !inp) return;
    const mode = window._getLayoutMode ? window._getLayoutMode() : 'desktop';
    // Prefer stored canvasHeight/mobileCanvasHeight in pageData, fall back
    // to current DOM height. Mobile falls back to the desktop height if it
    // has no height of its own set yet.
    const stored = mode === 'mobile'
      ? (window.pageData.mobileCanvasHeight || window.pageData.canvasHeight)
      : window.pageData.canvasHeight;
    const h = stored || parseInt(canvas.style.minHeight) || canvas.offsetHeight || 640;
    inp.value = h;
    canvas.style.minHeight = h + 'px';
  }

  const DEFAULT_PAGE_BG = '#f0f0f5';

  // Applies + persists the page background color, and keeps the header
  // swatch/hex inputs in sync with whatever value is active.
  function applyPageBg(value) {
    if (!window.pageData) return;
    window.pageData.bgColor = value;
    document.body.style.background = value;
    const preview = document.getElementById('swatch-page-bg-preview');
    if (preview) preview.style.background = value;
    const picker = document.getElementById('color-page-bg');
    if (picker) picker.value = toHex(value);
    const hexInput = document.getElementById('color-page-bg-hex');
    if (hexInput) hexInput.value = value;
  }

  // Reflects window.pageData.bgColor (or the default) into the swatch/hex
  // inputs without marking it as a user edit — used on load/page-switch.
  function syncPageBgInput() {
    const v = (window.pageData && window.pageData.bgColor) || DEFAULT_PAGE_BG;
    document.body.style.background = v;
    const preview = document.getElementById('swatch-page-bg-preview');
    if (preview) preview.style.background = v;
    const picker = document.getElementById('color-page-bg');
    if (picker) picker.value = toHex(v);
    const hexInput = document.getElementById('color-page-bg-hex');
    if (hexInput) hexInput.value = v;
  }

  document.getElementById('color-page-bg').addEventListener('input', function() {
    applyPageBg(this.value);
  });
  document.getElementById('color-page-bg-hex').addEventListener('change', function() {
    const v = this.value.trim();
    if (isValidBackground(v)) applyPageBg(v);
  });

  // ── Base (global) font ───────────────────────────────────────────────────
  // A single .ttf/.otf path that gets stamped onto every text-capable
  // element's fontFilePath in one shot, instead of setting it one element at
  // a time via the per-element "Font File" field in Props. Newly-added text
  // elements pick this up automatically too (see the .add-btn handler),
  // mirroring whatever is currently in this field — empty stays empty,
  // filled carries the same base font forward.
  const TEXT_CAPABLE_TYPES = ['text', 'button', 'input', 'textarea', 'checkbox', 'radio'];

  function applyGlobalFont(rawPath) {
    if (!window.pageData) return;
    const path = (rawPath || '').trim();
    window.pageData.globalFontPath = path;
    (window.pageData.elements || []).forEach(el => {
      if (TEXT_CAPABLE_TYPES.includes(el.type)) el.fontFilePath = path;
    });
    rerender();
    // Keep the Props panel's own Font File field in sync if it's currently
    // showing the element we just touched.
    if (selectedId) {
      const sel = getEl(selectedId);
      const fp = document.getElementById('prop-font-path');
      if (sel && fp) fp.value = sel.fontFilePath || '';
    }
  }

  function syncGlobalFontInput() {
    const inp = document.getElementById('ph-global-font');
    if (inp) inp.value = (window.pageData && window.pageData.globalFontPath) || '';
  }

  document.getElementById('ph-global-font-apply').addEventListener('click', () => {
    applyGlobalFont(document.getElementById('ph-global-font').value);
    showToast('Base font applied to all text');
  });
  document.getElementById('ph-global-font').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      applyGlobalFont(this.value);
      showToast('Base font applied to all text');
    }
  });

  // Init select
  buildPageSelect();
  syncHeightInput();
  syncPageBgInput();
  syncGlobalFontInput();

  document.getElementById('ph-page-select').addEventListener('change', function() {
    if (this.value !== _activePage) switchToPage(this.value);
  });

  document.getElementById('ph-canvas-height').addEventListener('input', function() {
    const h = parseInt(this.value);
    if (!h || h < 100) return;
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.style.minHeight = h + 'px';
    // Persist into pageData so it's included when saving JSON — desktop and
    // mobile heights are tracked separately so switching modes doesn't
    // clobber the other one.
    if (window.pageData) {
      const mode = window._getLayoutMode ? window._getLayoutMode() : 'desktop';
      if (mode === 'mobile') window.pageData.mobileCanvasHeight = h;
      else window.pageData.canvasHeight = h;
    }
  });

  // + button / popup logic
  const addPageBtn  = document.getElementById('ph-add-page-btn');
  const newPagePop  = document.getElementById('ph-new-page-popup');
  const newPageName = document.getElementById('ph-new-page-name');

  addPageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = newPagePop.style.display !== 'none';
    newPagePop.style.display = open ? 'none' : 'block';
    if (!open) { newPageName.value = ''; newPageName.focus(); }
  });

  document.getElementById('ph-new-page-cancel').addEventListener('click', () => {
    newPagePop.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (!newPagePop.contains(e.target) && e.target !== addPageBtn) {
      newPagePop.style.display = 'none';
    }
  });

  newPageName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('ph-new-page-confirm').click();
    if (e.key === 'Escape') newPagePop.style.display = 'none';
  });

  document.getElementById('ph-new-page-confirm').addEventListener('click', () => {
    let name = newPageName.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
    if (!name) { showToast('Enter a valid page name'); return; }
    if (name === 'page') { showToast('"page" is reserved — use a different name'); return; }
    const reg = getRegistry();
    if (reg.includes(name)) { showToast('Page "' + name + '" already exists'); return; }
    reg.push(name);
    saveRegistry(reg);
    savePageData(name, { pageName: name, elements: [] });
    newPagePop.style.display = 'none';
    buildPageSelect();
    switchToPage(name);
  });

  // Also patch the Save button to save to localStorage AND download
  // (override happens below after original btn-save listener is attached)
  // We store page whenever save is clicked — this is done by wrapping the existing listener.
  // We'll do it via a 'webeditor-presave' custom event dispatched before download.

  // ─── End Page Management ────────────────────────────────────────────────────

  let selectedId = null;

  // ─── Mobile view toggle (from panel-mobile.js) ───────────────────────────
  const { applyMobileMode, getMobileMode } = setupMobileMode({ rerender });
  requestAnimationFrame(() => {
    const mobileBtn = document.getElementById('panel-mobile-btn');
    if (mobileBtn) mobileBtn.addEventListener('click', () => applyMobileMode(!getMobileMode()));
  });
  // ────────────────────────────────────────────────────────────────────────────


  document.querySelectorAll('.ptab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  document.querySelectorAll('.psection-head').forEach(head => {
    if (head.style.cursor === 'default') return;
    head.addEventListener('click', () => {
      head.closest('.psection').classList.toggle('collapsed');
    });
  });

  function getEl(id) {
    return (window.pageData.elements || []).find(e => e.id === id);
  }

  function currentFontSize(el) {
    const n = parseInt(el?.styles?.fontSize) || 16;
    return n;
  }

  function updateFormatButtonsActive(el) {
    const styles = el.styles || {};
    const isBold = styles.fontWeight === 'bold' || styles.fontWeight === 'bolder' || parseInt(styles.fontWeight) >= 600;
    const isItalic = styles.fontStyle === 'italic';
    const decos = String(styles.textDecoration || '').split(' ');
    const seg = document.getElementById('text-format-seg');
    if (!seg) return;
    seg.querySelector('[data-fmt="bold"]')?.classList.toggle('active', isBold);
    seg.querySelector('[data-fmt="italic"]')?.classList.toggle('active', isItalic);
    seg.querySelector('[data-fmt="underline"]')?.classList.toggle('active', decos.includes('underline'));
    seg.querySelector('[data-fmt="strike"]')?.classList.toggle('active', decos.includes('line-through'));
  }

  function toTitleCase(s) {
    return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
  }

  function toCamelCase(s) {
    return s
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^[A-Z]/, c => c.toLowerCase());
  }

  function applyContentToNode(el, value) {
    const node = document.querySelector(`[data-id="${el.id}"]`);
    if (!node) return;
    if (['text', 'button'].includes(el.type)) {
      node.textContent = value;
    } else if (['input', 'textarea'].includes(el.type)) {
      const ctrl = node.querySelector('input, textarea');
      if (ctrl) ctrl.placeholder = value;
    } else if (['checkbox', 'radio'].includes(el.type)) {
      const label = node.querySelector('span');
      if (label) label.textContent = value;
    }
  }

  function updateElCount() {
    const n = (window.pageData.elements || []).length;
    document.getElementById('ph-elcount').textContent = n + ' element' + (n === 1 ? '' : 's');
  }

  function rerender() {
    window.renderPage(window.pageData);
    buildElementList();
    updateElCount();
    syncHeightInput();
    if (selectedId) {
      const el = getEl(selectedId);
      if (el) {
        // Every layout-mode-specific field (x/y/w/h, border, advAnim,
        // navigateTo, etc.) reads through the same el proxy that
        // window._layoutMode now resolves against, so re-populating the
        // props panel here is what actually makes the desktop/mobile toggle
        // show (and let you edit) that mode's own values instead of leaving
        // whatever was on-screen before the toggle.
        showProps(el);
        attachHandles(selectedId);
        document.querySelector(`[data-id="${selectedId}"]`)?.classList.add('psel-outline');
      }
    }
  }

  function patchNodeGeom(id, x, y, w, h) {
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!node) return;
    if (x !== undefined) node.style.left = x + 'px';
    if (y !== undefined) node.style.top = y + 'px';
    if (w !== undefined) node.style.width = w + 'px';
    if (h !== undefined) node.style.height = h + 'px';
  }

  function patchNodeBg(id, color) {
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!node) return;
    node.style.background = color;
  }

  function patchNodeTextColor(id, color) {
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!node) return;
    node.style.color = color;
  }

  // `switchTab` controls whether selecting the element also jumps the panel
  // over to the Props tab. Single-clicking a row in the Elements list only
  // highlights/selects it (switchTab: false); double-clicking a row — or
  // selecting an element directly on the canvas — opens its props (switchTab: true).
  function selectEl(id, { switchTab = true } = {}) {
    clearHandles();
    selectedId = id;
    buildElementList();

    const el = getEl(id);
    if (!el) { hideProps(); return; }

    const node = document.querySelector(`[data-id="${id}"]`);
    if (node) node.classList.add('psel-outline');

    showProps(el);
    attachHandles(id);

    if (switchTab) {
      document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.querySelector('.ptab[data-tab="props"]').classList.add('active');
      document.getElementById('tab-props').classList.add('active');
    }
  }

  function deselectAll() {
    clearHandles();
    selectedId = null;
    buildElementList();
    hideProps();
  }

  function clearHandles() {
    document.querySelectorAll('.psel-outline').forEach(n => n.classList.remove('psel-outline'));
    document.querySelectorAll('.psel-move,.psel-resize,.psel-rotate').forEach(n => n.remove());
  }

  function attachHandles(id) {
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!node) return;

    node.classList.add('psel-outline');

    // Locked elements stay selected/outlined but never get move/resize/
    // rotate handles — that's the whole point of locking.
    const lockedEl = getEl(id);
    if (lockedEl && lockedEl.locked) return;

    const mh = document.createElement('div');
    mh.className = 'psel-move';
    mh.title = 'Drag to move';
    mh.innerHTML = '⠿';
    node.appendChild(mh);

    const rh = document.createElement('div');
    rh.className = 'psel-resize';
    rh.title = 'Drag to resize';
    rh.innerHTML = '↔';
    node.appendChild(rh);

    // Rotate handle — floats above the element (rotates together with it,
    // since it's a child of the rotated node) so it always reads as "the
    // element's own top", the same way move/resize sit at its own corners.
    const roth = document.createElement('div');
    roth.className = 'psel-rotate';
    roth.title = 'Drag to rotate (hold Shift to snap to 15°)';
    roth.innerHTML = '⟳';
    node.appendChild(roth);

    mh.addEventListener('mousedown', onMoveMouseDown);
    rh.addEventListener('mousedown', onResizeMouseDown);
    roth.addEventListener('mousedown', onRotateMouseDown);
  }

  function startMoveDrag(id, e) {
    const el = getEl(id);
    if (!el) return;

    const startX = e.clientX, startY = e.clientY;
    const origX = el.x, origY = el.y;
    const ov = document.getElementById('drag-overlay');

    function onMove(e2) {
      ov.classList.add('move');
      el.x = Math.round(origX + e2.clientX - startX);
      el.y = Math.round(origY + e2.clientY - startY);
      patchNodeGeom(id, el.x, el.y);
      const ix = document.getElementById('prop-x');
      const iy = document.getElementById('prop-y');
      if (ix) ix.value = el.x;
      if (iy) iy.value = el.y;
    }

    function onUp() {
      ov.classList.remove('move');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function onMoveMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    startMoveDrag(selectedId, e);
  }

  function onResizeMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    const el = getEl(selectedId);
    if (!el) return;

    const startX = e.clientX, startY = e.clientY;
    const origW = el.w, origH = el.h;
    // Text elements previously "resized" only their (invisible) bounding
    // box — the letters themselves never changed size, so dragging the
    // handle looked like it did nothing. Now the font size scales along
    // with the box, averaging the width/height ratios so a diagonal drag
    // (the only direction this single corner handle supports) feels like a
    // uniform resize instead of stretching the glyphs unevenly.
    const isText = el.type === 'text';
    const origFontSize = isText ? currentFontSize(el) : null;
    const ov = document.getElementById('drag-overlay');
    ov.classList.add('resize');

    function onMove(e2) {
      el.w = Math.max(40, Math.round(origW + e2.clientX - startX));
      el.h = Math.max(20, Math.round(origH + e2.clientY - startY));
      patchNodeGeom(selectedId, undefined, undefined, el.w, el.h);
      const iw = document.getElementById('prop-w');
      const ih = document.getElementById('prop-h');
      if (iw) iw.value = el.w;
      if (ih) ih.value = el.h;

      if (isText && origFontSize) {
        const scale = ((el.w / origW) + (el.h / origH)) / 2;
        const newSize = Math.max(1, Math.round(origFontSize * scale));
        if (!el.styles) el.styles = {};
        el.styles.fontSize = newSize + 'px';
        const node = document.querySelector(`[data-id="${selectedId}"]`);
        if (node) node.style.fontSize = newSize + 'px';
        const fsInput = document.getElementById('prop-fontsize-val');
        if (fsInput) fsInput.value = newSize;
      }
    }

    function onUp() {
      ov.classList.remove('resize');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function onRotateMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    startRotateDrag(selectedId, e);
  }

  function startRotateDrag(id, e) {
    const el = getEl(id);
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!el || !node) return;

    const ov = document.getElementById('drag-overlay');

    function angleOf(clientX, clientY) {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
    }

    const startAngle    = angleOf(e.clientX, e.clientY);
    const origRotation  = el.rotation || 0;

    function onMove(e2) {
      ov.classList.add('move');
      let rotation = origRotation + (angleOf(e2.clientX, e2.clientY) - startAngle);
      // Normalize to -180..180 so the value shown/stored stays readable
      // instead of climbing past 360 on multiple spins.
      rotation = ((rotation + 180) % 360 + 360) % 360 - 180;
      if (e2.shiftKey) rotation = Math.round(rotation / 15) * 15;
      rotation = Math.round(rotation);
      el.rotation = rotation;
      if (window._applyElementTransform) window._applyElementTransform(node, rotation);
      else node.style.transform = `rotate(${rotation}deg)`;
      const ir = document.getElementById('prop-rotation');
      if (ir) ir.value = rotation;
    }

    function onUp() {
      ov.classList.remove('move');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // Native interactive controls keep their normal click behavior (typing,
  // focus, playback, navigation) instead of starting a drag — the small ⠿
  // handle is still there for moving those specific element types.
  const NO_BODY_DRAG_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'VIDEO', 'AUDIO']);

  document.getElementById('canvas').addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('psel-move') ||
        e.target.classList.contains('psel-resize')) return;

    const node = e.target.closest('[data-id]');
    if (node) {
      const id = node.dataset.id;
      if (selectedId !== id) selectEl(id);
      // A slider's direct children are carousel slides whose position is
      // driven by the slider's own runtime (see main.js) — letting the
      // normal move-drag touch them would fight that positioning until the
      // next render. They're still selectable/editable via the props panel
      // and the Elements list, just not draggable from the canvas.
      const isSliderSlide = node.parentElement && node.parentElement.dataset && node.parentElement.dataset.type === 'slider';
      const clickedEl = getEl(id);
      const isLocked = !!(clickedEl && clickedEl.locked);
      // Anchors/buttons never get to run their native navigation while
      // editing — a button element's own click handler (slider nav, page
      // nav, etc.) still runs, but a placeholder href="#" must never be
      // allowed to jump the page to the top just because it was clicked
      // to select it.
      if (e.target.tagName === 'A' || e.target.closest('a')) e.preventDefault();
      if (!isLocked && !NO_BODY_DRAG_TAGS.has(e.target.tagName) && !isSliderSlide) {
        e.preventDefault();
        startMoveDrag(id, e);
      }
    } else {
      deselectAll();
    }
  });

  const expandedIds = new Set();
  let dragId = null;

  const TYPE_ICON = {
    container: '▢', group: '▣', text: 'T', image: '▤',
    video: '▶', audio: '♪', button: '◉', slider: '⇄'
  };

  function getChildren(id) {
    return (window.pageData.elements || []).filter(e => e.parent === id);
  }

  function getRoots() {
    return (window.pageData.elements || []).filter(e => !e.parent || !getEl(e.parent));
  }

  function isDescendant(ancestorId, candidateId) {
    let cur = getEl(candidateId);
    while (cur && cur.parent) {
      if (cur.parent === ancestorId) return true;
      cur = getEl(cur.parent);
    }
    return false;
  }

  // Absolute (canvas-space) top-left of an element: its own x/y plus every
  // ancestor's x/y, walking up the *current* mode's parent chain. Used so
  // reparenting can compensate for the coordinate-space change instead of
  // silently shifting the element on screen.
  function getAbsoluteXY(id) {
    let x = 0, y = 0;
    let cur = getEl(id);
    while (cur) {
      x += cur.x || 0;
      y += cur.y || 0;
      cur = cur.parent ? getEl(cur.parent) : null;
    }
    return { x, y };
  }

  function setParent(childId, newParentId, index) {
    const child = getEl(childId);
    if (!child) return;
    const oldParentId = child.parent;

    // Reparenting is a structural move (drag in the element list, adding to
    // a slider, ungrouping, etc.) — it should never relocate the element
    // visually. x/y are stored relative to the parent, so switching parents
    // changes the coordinate space; capture the child's absolute position
    // before the move and re-derive its relative x/y afterwards so it stays
    // exactly where it was on screen.
    const oldAbs = getAbsoluteXY(childId);

    if (oldParentId) {
      const oldParent = getEl(oldParentId);
      if (oldParent && oldParent.children) {
        oldParent.children = oldParent.children.filter(c => c !== childId);
      }
    }

    if (newParentId) {
      child.parent = newParentId;
      const newParent = getEl(newParentId);
      if (newParent) {
        if (!newParent.children) newParent.children = [];
        newParent.children = newParent.children.filter(c => c !== childId);
        const at = index === undefined ? newParent.children.length : index;
        newParent.children.splice(at, 0, childId);
        expandedIds.add(newParentId);
      }
    } else {
      delete child.parent;
    }

    const newParentAbs = newParentId ? getAbsoluteXY(newParentId) : { x: 0, y: 0 };
    child.x = oldAbs.x - newParentAbs.x;
    child.y = oldAbs.y - newParentAbs.y;
  }

  function reorderRoot(childId, index) {
    const roots = getRoots().filter(r => r.id !== childId);
    const child = getEl(childId);
    delete child.parent;
    const at = index === undefined ? roots.length : Math.min(index, roots.length);
    roots.splice(at, 0, child);

    const others = (window.pageData.elements || []).filter(e => e.parent && getEl(e.parent));
    window.pageData.elements = [...roots, ...others];
  }

  function buildElementList() {
    const list = document.getElementById('el-list');
    list.innerHTML = '';
    list.classList.remove('drag-over-root');

    function renderNode(el, depth) {
      const children = getChildren(el.id);
      const hasChildren = children.length > 0;
      const expanded = expandedIds.has(el.id);

      const row = document.createElement('div');
      row.className = 'el-row' + (el.id === selectedId ? ' selected' : '');
      row.draggable = true;
      row.dataset.id = el.id;
      row.style.paddingLeft = (8 + depth * 16) + 'px';

      const twirl = document.createElement('span');
      twirl.className = 'el-twirl' + (hasChildren ? (expanded ? ' expanded' : '') : ' spacer');
      twirl.textContent = '▸';
      if (hasChildren) {
        twirl.addEventListener('click', ev => {
          ev.stopPropagation();
          if (expandedIds.has(el.id)) expandedIds.delete(el.id);
          else expandedIds.add(el.id);
          buildElementList();
        });
      }

      const icon = document.createElement('span');
      icon.className = 'el-icon';
      icon.textContent = TYPE_ICON[el.type] || '▢';

      const id = document.createElement('span');
      id.className = 'el-item-id';
      id.textContent = el.id;

      const del = document.createElement('button');
      del.className = 'el-item-del';
      del.textContent = '×';
      del.title = 'Delete';
      del.addEventListener('click', ev => { ev.stopPropagation(); deleteEl(el.id); });

      // Eye / visibility toggle — scoped to the current active layout only
      const eye = document.createElement('button');
      eye.className = 'el-item-del'; // reuse same style: hover-reveal, same sizing
      const isHidden = !!el.hidden; // reads through the Proxy → active layout
      eye.textContent = isHidden ? '🙈' : '👁';
      eye.title = isHidden ? 'Show in ' + (window._getLayoutMode?.() || 'desktop') : 'Hide in ' + (window._getLayoutMode?.() || 'desktop');
      eye.style.opacity = isHidden ? '1' : ''; // keep always visible when hidden so user can re-show
      eye.style.fontSize = '11px';
      eye.addEventListener('click', ev => {
        ev.stopPropagation();
        el.hidden = !el.hidden; // writes through Proxy → active layout only
        rerender();
      });

      // Lock toggle — a locked element stays fully selectable/editable via
      // the Props panel, but loses its move/resize/rotate handles on the
      // canvas so it can't be nudged or reshaped by accident. Lock state is
      // a plain top-level field (not per-layout) since it's about
      // protecting the element while editing, not about how it displays.
      const lock = document.createElement('button');
      lock.className = 'el-item-del'; // reuse same style: hover-reveal, same sizing
      const isLocked = !!el.locked;
      lock.textContent = isLocked ? '🔒' : '🔓';
      lock.title = isLocked ? 'Unlock element' : 'Lock element';
      lock.style.opacity = isLocked ? '1' : '';
      lock.style.fontSize = '11px';
      lock.addEventListener('click', ev => {
        ev.stopPropagation();
        el.locked = !el.locked;
        if (selectedId === el.id) {
          // Refresh the on-canvas handles immediately to reflect the new state.
          clearHandles();
          const node = document.querySelector(`[data-id="${el.id}"]`);
          if (node) node.classList.add('psel-outline');
          if (!el.locked) attachHandles(el.id);
        }
        buildElementList();
        showToast(el.locked ? 'Locked' : 'Unlocked');
      });

      row.append(twirl, icon, id, lock, eye, del);
      row.addEventListener('click', ev => { ev.stopPropagation(); selectEl(el.id, { switchTab: false }); });
      row.addEventListener('dblclick', ev => { ev.stopPropagation(); selectEl(el.id, { switchTab: true }); });

      row.addEventListener('dragstart', ev => {
        dragId = el.id;
        row.classList.add('dragging');
        ev.dataTransfer.effectAllowed = 'move';
        ev.dataTransfer.setData('text/plain', el.id);
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        dragId = null;
        document.querySelectorAll('.el-row-dropline').forEach(n => n.remove());
        document.querySelectorAll('.drag-over-nest').forEach(n => n.classList.remove('drag-over-nest'));
      });

      row.addEventListener('dragover', ev => {
        if (!dragId || dragId === el.id) return;
        ev.preventDefault();
        ev.stopPropagation();

        document.querySelectorAll('.el-row-dropline').forEach(n => n.remove());
        document.querySelectorAll('.drag-over-nest').forEach(n => n.classList.remove('drag-over-nest'));

        const rect = row.getBoundingClientRect();
        const offsetY = ev.clientY - rect.top;
        const zone = offsetY < rect.height * 0.28 ? 'before'
                   : offsetY > rect.height * 0.72 ? 'after'
                   : 'nest';

        if (zone === 'nest') {
          if (!isDescendant(dragId, el.id) && el.id !== dragId) {
            row.classList.add('drag-over-nest');
            row.dataset.dropZone = 'nest';
          } else {
            row.dataset.dropZone = '';
          }
        } else {
          const line = document.createElement('div');
          line.className = 'el-row-dropline ' + (zone === 'before' ? 'top' : 'bottom');
          row.appendChild(line);
          row.dataset.dropZone = zone;
        }
      });

      row.addEventListener('dragleave', ev => {
        if (!row.contains(ev.relatedTarget)) {
          row.classList.remove('drag-over-nest');
          row.querySelectorAll('.el-row-dropline').forEach(n => n.remove());
        }
      });

      row.addEventListener('drop', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const sourceId = dragId;
        const zone = row.dataset.dropZone;
        row.classList.remove('drag-over-nest');
        row.querySelectorAll('.el-row-dropline').forEach(n => n.remove());
        if (!sourceId || sourceId === el.id) return;
        if (isDescendant(sourceId, el.id)) return;

        if (zone === 'nest') {
          setParent(sourceId, el.id);
        } else if (zone === 'before' || zone === 'after') {
          const targetParentId = el.parent && getEl(el.parent) ? el.parent : null;
          if (targetParentId) {
            const targetParent = getEl(targetParentId);
            let idx = targetParent.children.indexOf(el.id);
            if (zone === 'after') idx += 1;
            setParent(sourceId, targetParentId, idx);
          } else {
            const roots = getRoots();
            let idx = roots.findIndex(r => r.id === el.id);
            if (zone === 'after') idx += 1;
            reorderRoot(sourceId, idx);
          }
        }
        rerender();
        // Keep whichever tab the user is already on — dropping an element
        // into a container is a structural action in the Elements list, not
        // a request to jump over to Props every time.
        selectEl(sourceId, { switchTab: false });
      });

      list.appendChild(row);

      if (hasChildren && expanded) {
        children.forEach(child => renderNode(child, depth + 1));
      }
    }

    getRoots().forEach(el => renderNode(el, 0));

    const emptyZone = document.createElement('div');
    emptyZone.className = 'el-list-empty-zone';
    emptyZone.addEventListener('dragover', ev => {
      if (!dragId) return;
      ev.preventDefault();
      list.classList.add('drag-over-root');
    });
    emptyZone.addEventListener('dragleave', () => list.classList.remove('drag-over-root'));
    emptyZone.addEventListener('drop', ev => {
      ev.preventDefault();
      list.classList.remove('drag-over-root');
      const sourceId = dragId;
      if (!sourceId) return;
      reorderRoot(sourceId);
      rerender();
      selectEl(sourceId, { switchTab: false });
    });
    list.appendChild(emptyZone);
  }


  function showProps(el) {
    document.getElementById('no-selection').style.display = 'none';
    document.getElementById('props-body').style.display = '';

    const toButtonBtn = document.getElementById('btn-to-button');
    if (toButtonBtn) toButtonBtn.style.display = el.type === 'button' ? 'none' : '';

    document.getElementById('prop-id').value = el.id;
    document.getElementById('prop-content').value = el.content || '';
    document.getElementById('prop-x').value = el.x ?? 0;
    document.getElementById('prop-y').value = el.y ?? 0;
    document.getElementById('prop-w').value = el.w ?? 100;
    document.getElementById('prop-h').value = el.h ?? 40;
    const rotInput = document.getElementById('prop-rotation');
    if (rotInput) rotInput.value = el.rotation || 0;

    // Scale — only meaningful for elements that actually have children
    // (groups, containers, or anything else nesting child elements). It
    // uniformly scales the visual size of everything nested inside, while
    // W/H above keep controlling only this element's own box.
    const hasChildren = Array.isArray(el.children) && el.children.length > 0;
    const rowScale = document.getElementById('row-group-scale');
    if (rowScale) {
      rowScale.style.display = hasChildren ? '' : 'none';
      if (hasChildren) document.getElementById('prop-scale').value = el.scale ?? 1;
    }

    const hasSrc = ['image', 'video', 'audio'].includes(el.type);
    const hasHref = el.type === 'button';
    const isSelect = el.type === 'select';
    document.getElementById('prop-src-row').style.display = hasSrc ? '' : 'none';
    document.getElementById('prop-href-row').style.display = hasHref ? '' : 'none';
    document.getElementById('prop-navloc-row').style.display = hasHref ? '' : 'none';
    document.getElementById('prop-navloc-capture-row').style.display = 'none'; // populateLocationSelect will reveal if applicable
    document.getElementById('prop-navloc-speed-row').style.display = hasHref ? '' : 'none';
    document.getElementById('prop-content-row').style.display = (hasSrc || isSelect) ? 'none' : '';
    document.getElementById('prop-options-row').style.display = isSelect ? '' : 'none';
    if (hasSrc) document.getElementById('prop-src').value = el.src || './asset/';
    if (isSelect) document.getElementById('prop-options').value = (el.options || []).join(', ');

    const showTextTools = !hasSrc && !isSelect;
    document.getElementById('prop-font-row').style.display = showTextTools ? '' : 'none';
    document.getElementById('prop-format-row').style.display = showTextTools ? '' : 'none';
    document.getElementById('prop-case-row').style.display = showTextTools ? '' : 'none';
    if (showTextTools) {
      document.getElementById('prop-font-path').value = el.fontFilePath || '';
      document.getElementById('prop-fontsize-val').value = currentFontSize(el);
      updateFormatButtonsActive(el);
    }

    const contentLabelMap = {
      input: 'Placeholder', textarea: 'Placeholder',
      checkbox: 'Label', radio: 'Label'
    };
    document.getElementById('prop-content-label').textContent = contentLabelMap[el.type] || 'Content';
    if (hasHref) {
      const navSel = document.getElementById('prop-navigate-page');
      const pages = getRegistry();
      navSel.innerHTML = '<option value="">— none —</option>' +
        pages.map(p => `<option value="${p}"${el.navigateTo === p ? ' selected' : ''}>${p === DEFAULT_PAGE ? 'main (default)' : p}</option>`).join('');
      document.getElementById('prop-navloc-speed').value = el.navigateSpeed ?? 1;
      populateLocationSelect(el);
    }

    const styles = el.styles || {};

    const showBg = ['container', 'group', 'slider', 'button', 'text', 'input', 'textarea', 'select'].includes(el.type);
    document.getElementById('row-bgcolor').style.display = showBg ? '' : 'none';
    document.getElementById('row-bg-blur').style.display = showBg ? '' : 'none';
    if (showBg) {
      const bgRaw = styles.background || styles.backgroundColor || '';
      const isGradient = bgRaw.includes('gradient');
      const bgHex = isGradient ? '' : toHex(bgRaw || '#000000');
      document.getElementById('color-bg').value = isGradient ? '#000000' : bgHex;
      document.getElementById('color-bg-hex').value = isGradient ? bgRaw : bgHex;
      document.getElementById('swatch-bg-preview').style.background = bgRaw || 'transparent';

      // Blur (glass-morphism backdrop-filter) — parse the current px value
      // back out of the raw CSS string so the number field reflects it.
      const blurMatch = /blur\(\s*([\d.]+)px\s*\)/.exec(styles.backdropFilter || '');
      document.getElementById('prop-bg-blur').value = blurMatch ? blurMatch[1] : 0;
    }

    const showTextCol = ['text', 'button', 'input', 'textarea', 'select', 'checkbox', 'radio'].includes(el.type);
    document.getElementById('row-textcolor').style.display = showTextCol ? '' : 'none';
    if (showTextCol) {
      const textRaw = styles.color || '#ffffff';
      const textHex = toHex(textRaw);
      document.getElementById('color-text').value = textHex;
      document.getElementById('color-text-hex').value = textHex;
      document.getElementById('swatch-text-preview').style.background = textRaw;
    }

    document.getElementById('prop-opacity').value = styles.opacity ?? 1;
    document.getElementById('prop-position-fixed').checked = !!el.positionFixed;

    // Border applies to boxy elements only — never to text (a rectangular
    // border/box-shadow around a text node's bounding box looks wrong).
    // Shadow (box-shadow for boxy elements, text-shadow for text) is shown
    // for the same set of types plus 'text'.
    const showBorder = ['container', 'group', 'slider', 'button', 'input', 'textarea', 'select', 'image'].includes(el.type);
    const showShadow = showBorder || el.type === 'text';
    const showBorderShadowSection = showBorder || showShadow;
    document.getElementById('section-border').style.display = showBorderShadowSection ? '' : 'none';

    document.getElementById('row-border-toggle').style.display = showBorder ? '' : 'none';
    if (!showBorder) document.getElementById('border-fields').style.display = 'none';
    if (showBorder) {
      const b = el.borderCfg || {};
      const bEnabled = !!b.enabled;
      document.getElementById('prop-border-enabled').checked = bEnabled;
      document.getElementById('border-fields').style.display = bEnabled ? '' : 'none';
      document.getElementById('prop-border-style').value = b.style || 'solid';
      document.getElementById('prop-border-width').value = b.width ?? 1;
      const bColor = b.color || '#000000';
      document.getElementById('color-border').value = bColor;
      document.getElementById('color-border-hex').value = bColor;
      document.getElementById('swatch-border-preview').style.background = bColor;
      document.getElementById('prop-border-opacity').value = b.opacity ?? 1;
    }

    // Corner radius — independent of whether the border itself is enabled,
    // since rounding the corners is a shape property, not a border one.
    // Hidden for circular containers, since shape=circle drives radius via
    // its own 50% override instead.
    const isCircleContainer = el.type === 'container' && el.shape === 'circle';
    document.getElementById('row-corner-radius').style.display = (showBorder && !isCircleContainer) ? '' : 'none';
    if (showBorder && !isCircleContainer) {
      document.getElementById('prop-corner-radius').value = parseInt(styles.borderRadius) || 0;
    }

    document.getElementById('shadow-toggle-label').textContent = el.type === 'text' ? 'Text Shadow' : 'Box Shadow';
    if (showShadow) {
      const s = el.shadowCfg || {};
      const sEnabled = !!s.enabled;
      document.getElementById('prop-shadow-enabled').checked = sEnabled;
      document.getElementById('shadow-fields').style.display = sEnabled ? '' : 'none';
      const sColor = s.color || '#000000';
      document.getElementById('color-shadow').value = sColor;
      document.getElementById('color-shadow-hex').value = sColor;
      document.getElementById('swatch-shadow-preview').style.background = sColor;
      const sIntensity = s.intensity ?? 50;
      document.getElementById('prop-shadow-intensity').value = sIntensity;
      document.getElementById('prop-shadow-intensity-val').textContent = sIntensity + '%';
    }

    const isContainer = ['container', 'group'].includes(el.type);
    document.getElementById('section-container-opts').style.display = isContainer ? '' : 'none';
    document.getElementById('row-container-shape').style.display = (el.type === 'container') ? '' : 'none';
    if (isContainer) {
      document.getElementById('prop-overflow').value = styles.overflow || '';
    }
    if (el.type === 'container') {
      const shape = el.shape || 'square';
      document.getElementById('prop-shape').value = shape;
      const isCircle = shape === 'circle';
      document.getElementById('row-container-radius').style.display = isCircle ? '' : 'none';
      if (isCircle) {
        document.getElementById('prop-shape-radius').value = Math.round((el.w || 0) / 2);
      }
      // In circle mode the panel exposes a single Radius control instead of
      // independent W/H — canvas dragging can still freely resize both.
      document.getElementById('prop-w').closest('.geom-cell').style.display = isCircle ? 'none' : '';
      document.getElementById('prop-h').closest('.geom-cell').style.display = isCircle ? 'none' : '';
    } else {
      document.getElementById('prop-w').closest('.geom-cell').style.display = '';
      document.getElementById('prop-h').closest('.geom-cell').style.display = '';
    }

    document.getElementById('section-image-opts').style.display = el.type === 'image' ? '' : 'none';

    document.getElementById('section-slider-opts').style.display = el.type === 'slider' ? '' : 'none';
    if (el.type === 'slider') populateSliderProps(el);

    window._selectedAdvId = el.id;
    if (window._advAnimStop) window._advAnimStop();
    if (window._buildAdvAnimUI) window._buildAdvAnimUI(el);
    document.getElementById('section-video-opts').style.display = el.type === 'video' ? '' : 'none';

    if (el.type === 'image') {
      document.getElementById('prop-object-fit').value = el.objectFit || 'cover';
    }

    if (el.type === 'video') {
      document.getElementById('prop-video-noctrl').checked = !!el.noControls;
      const playMode = el.playMode || 'loop';
      document.getElementById('prop-video-play-mode').value = playMode;
      document.getElementById('prop-video-trigger-row').style.display = playMode === 'button' ? '' : 'none';
      document.getElementById('prop-video-scroll-row').style.display = playMode === 'scroll' ? '' : 'none';
      if (playMode === 'scroll') {
        document.getElementById('prop-video-scroll-speed').value = el.scrollPlaySpeed ?? 1;
        document.getElementById('prop-video-scroll-delay').value = el.scrollPlayDelay ?? 0;
      }
      const btnSel = document.getElementById('prop-video-trigger-btn');
      const buttons = (window.pageData.elements || []).filter(e => e.type === 'button');
      btnSel.innerHTML = '<option value="">-- select --</option>' +
        buttons.map(b => `<option value="${b.id}"${el.triggerButtonId === b.id ? ' selected' : ''}>${b.id}${b.content ? ' (' + b.content + ')' : ''}</option>`).join('');
    }
  }

  function hideProps() {
    document.getElementById('no-selection').style.display = '';
    document.getElementById('props-body').style.display = 'none';
    if (window._advAnimStop) window._advAnimStop();
  }

  document.getElementById('prop-id').addEventListener('change', function() {
    const el = getEl(selectedId);
    if (!el) return;
    const nid = this.value.trim();
    if (nid && nid !== el.id) {
      renameId(el.id, nid);
      selectedId = nid;
      buildElementList();
    }
  });

  function renameId(oldId, newId) {
    window.pageData.elements.forEach(e => {
      if (e.id === oldId) e.id = newId;
      if (e.parent === oldId) e.parent = newId;
      if (e.children) e.children = e.children.map(c => c === oldId ? newId : c);
    });
  }

  ['prop-content', 'prop-src'].forEach(pid => {
    document.getElementById(pid).addEventListener('change', function() {
      const el = getEl(selectedId);
      if (!el) return;
      if (pid === 'prop-content') {
        el.content = this.value;
        applyContentToNode(el, this.value);
      } else if (pid === 'prop-src') {
        el.src = this.value;
        const node = document.querySelector(`[data-id="${selectedId}"]`);
        if (node) {
          const media = node.querySelector('img, video, audio') || (node.tagName === 'AUDIO' ? node : null);
          if (media) media.src = this.value;
        }
      }
    });
  });

  document.getElementById('prop-options').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'select') return;
    el.options = this.value.split(',').map(s => s.trim()).filter(Boolean);
    rerender();
  });

  document.getElementById('prop-font-path').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el) return;
    el.fontFilePath = this.value.trim();
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) {
      if (el.fontFilePath && window._applyCustomFont) {
        window._applyCustomFont(node, el.fontFilePath);
      } else {
        node.style.fontFamily = el.styles?.fontFamily || '';
      }
    }
    showToast(el.fontFilePath ? 'Custom font applied' : 'Reverted to default font');
  });

  document.querySelectorAll('#text-format-seg .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = getEl(selectedId); if (!el) return;
      if (!el.styles) el.styles = {};
      const fmt = btn.dataset.fmt;
      if (fmt === 'bold') {
        const isBold = el.styles.fontWeight === 'bold' || parseInt(el.styles.fontWeight) >= 600;
        el.styles.fontWeight = isBold ? '400' : 'bold';
      } else if (fmt === 'italic') {
        el.styles.fontStyle = el.styles.fontStyle === 'italic' ? 'normal' : 'italic';
      } else if (fmt === 'underline' || fmt === 'strike') {
        const decos = new Set(String(el.styles.textDecoration || '').split(' ').filter(Boolean));
        const key = fmt === 'underline' ? 'underline' : 'line-through';
        if (decos.has(key)) decos.delete(key); else decos.add(key);
        el.styles.textDecoration = decos.size ? Array.from(decos).join(' ') : 'none';
      }
      const node = document.querySelector(`[data-id="${selectedId}"]`);
      if (node) {
        Object.assign(node.style, el.styles);
        // el.styles.fontFamily (the base/default family) just got re-applied
        // above and would silently stomp a custom .ttf/.otf font — those are
        // applied separately via _applyCustomFont and live under a generated
        // font-family name, not el.styles.fontFamily. Re-apply it so toggling
        // bold/italic/underline never knocks the element back to the default
        // font. If the custom font doesn't actually have a bold/italic face,
        // the browser will fall back to font-synthesis (or simply show no
        // visible change) instead of losing the font entirely.
        if (el.fontFilePath && window._applyCustomFont) {
          window._applyCustomFont(node, el.fontFilePath);
        }
      }
      updateFormatButtonsActive(el);
    });
  });

  document.getElementById('fontsize-dec').addEventListener('click', () => {
    const el = getEl(selectedId); if (!el) return;
    if (!el.styles) el.styles = {};
    const n = Math.max(1, currentFontSize(el) - 1);
    el.styles.fontSize = n + 'px';
    document.getElementById('prop-fontsize-val').value = n;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) node.style.fontSize = n + 'px';
  });

  document.getElementById('fontsize-inc').addEventListener('click', () => {
    const el = getEl(selectedId); if (!el) return;
    if (!el.styles) el.styles = {};
    const n = currentFontSize(el) + 1;
    el.styles.fontSize = n + 'px';
    document.getElementById('prop-fontsize-val').value = n;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) node.style.fontSize = n + 'px';
  });

  document.getElementById('prop-fontsize-val').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    if (!el.styles) el.styles = {};
    const n = Math.max(1, parseInt(this.value) || 1);
    el.styles.fontSize = n + 'px';
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) node.style.fontSize = n + 'px';
  });

  document.querySelectorAll('.case-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = getEl(selectedId); if (!el) return;
      const src = el.content || '';
      let out = src;
      switch (btn.dataset.case) {
        case 'upper': out = src.toUpperCase(); break;
        case 'lower': out = src.toLowerCase(); break;
        case 'capitalize': out = toTitleCase(src); break;
        case 'camel': out = toCamelCase(src); break;
      }
      el.content = out;
      document.getElementById('prop-content').value = out;
      applyContentToNode(el, out);
      showToast('Applied ' + btn.textContent);
    });
  });

  document.getElementById('prop-navigate-page').addEventListener('change', function() {
    const el = getEl(selectedId);
    if (!el || el.type !== 'button') return;
    el.navigateTo = this.value || null;
    el.navigateLocationId = null; // target page changed — old location no longer applies
    populateLocationSelect(el);
    // Update the live node: wire click to navigate
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) applyButtonNavigation(el, node);
  });

  // Populates the "Location" dropdown with saved scroll-positions for the
  // button's target page (or the current page, if navigating within it),
  // and shows/hides the "capture" button depending on whether the target
  // page is the one currently open in the editor.
  function populateLocationSelect(el) {
    const sel = document.getElementById('prop-navigate-location');
    const captureRow = document.getElementById('prop-navloc-capture-row');
    if (!sel) return;
    const target = el.navigateTo || _activePage;
    const isCurrentPage = target === _activePage;
    const pageData = isCurrentPage ? window.pageData : getPageData(target);
    const locations = (pageData && pageData.locations) || [];
    sel.innerHTML = '<option value="">— top of page —</option>' +
      locations.map(l => `<option value="${l.id}"${el.navigateLocationId === l.id ? ' selected' : ''}>${l.name} (y=${l.y})</option>`).join('');
    if (captureRow) captureRow.style.display = isCurrentPage ? '' : 'none';
  }
  window._populateLocationSelect = populateLocationSelect;

  document.getElementById('prop-navigate-location').addEventListener('change', function() {
    const el = getEl(selectedId);
    if (!el || el.type !== 'button') return;
    el.navigateLocationId = this.value || null;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) applyButtonNavigation(el, node);
  });

  document.getElementById('prop-navloc-speed').addEventListener('change', function() {
    const el = getEl(selectedId);
    if (!el || el.type !== 'button') return;
    el.navigateSpeed = parseFloat(this.value) || 1;
  });

  document.getElementById('prop-navloc-capture-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const el = getEl(selectedId);
    if (!el || el.type !== 'button') return;
    const existing = (window.pageData.locations || []).length;
    const name = prompt('Name this location (e.g. "Pricing section"):', 'Location ' + (existing + 1));
    if (name === null) return; // cancelled
    const y = Math.round(window.scrollY);
    const loc = { id: 'loc_' + Date.now().toString(36), name: name.trim() || ('Location ' + (existing + 1)), y };
    if (!window.pageData.locations) window.pageData.locations = [];
    window.pageData.locations.push(loc);
    savePageData(_activePage, serializePageData(window.pageData));
    el.navigateLocationId = loc.id;
    populateLocationSelect(el);
    const sel = document.getElementById('prop-navigate-location');
    if (sel) sel.value = loc.id;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) applyButtonNavigation(el, node);
    showToast('Captured "' + loc.name + '" at y=' + y);
  });

  function applyButtonNavigation(el, node) {
    // Remove old nav handler
    if (node._navHandler) {
      node.removeEventListener('click', node._navHandler);
      node._navHandler = null;
    }
    if (el.navigateTo || el.navigateLocationId) {
      // Make it behave as a div-link so it doesn't follow href
      node.removeAttribute('href');
      node._navHandler = function(e) {
        e.preventDefault();
        const target = el.navigateTo;
        const locId  = el.navigateLocationId;
        const speed  = el.navigateSpeed || 1;
        if (typeof switchToPage === 'function') {
          if (target && target !== _activePage) {
            switchToPage(target);
            // window.pageData now holds the target page's data
            if (locId && window._resolveAndScrollToLocation) window._resolveAndScrollToLocation(window.pageData, locId, speed);
          } else if (locId) {
            // Same page — no reload, just smooth-scroll to the saved spot
            if (window._resolveAndScrollToLocation) window._resolveAndScrollToLocation(window.pageData, locId, speed);
          }
        } else {
          // Runtime (no panel): navigate via URL, carrying location + speed along
          const url = new URL(window.location.href);
          if (!target) {
            if (locId && window._resolveAndScrollToLocation) window._resolveAndScrollToLocation(window.pageData, locId, speed);
            return;
          }
          if (target === 'main') url.searchParams.delete('page');
          else url.searchParams.set('page', target);
          if (locId) { url.searchParams.set('loc', locId); url.searchParams.set('locSpeed', speed); }
          else { url.searchParams.delete('loc'); url.searchParams.delete('locSpeed'); }
          window.location.href = url.toString();
        }
      };
      node.addEventListener('click', node._navHandler);
    } else {
      // No navigation configured — make sure the button does nothing rather
      // than falling back to a live href="#" (which used to jump the page
      // to the top on click).
      if (node.tagName === 'A') node.removeAttribute('href');
    }
  }

  // Expose so main.js renderPage can wire existing buttons on load
  window._applyButtonNavigation = applyButtonNavigation;



  (function initAdvAnim() {
    let _advAnimRaf = null;
    let _advAnimPlaying = false;
    let _advAnimPlayingTrigger = false;
    let _advAnimT = 0;
    let _advAnimDir = 1;

    function getEl(id) {
      return (window.pageData.elements || []).find(e => e.id === id);
    }

    function fcFieldHTML(label, key, value, step) {
      return `<div class="fc-field"><div class="fc-field-label">${label}</div><input type="number" step="${step}" data-fckey="${key}" value="${value}"></div>`;
    }

    function buildFrameCard(frame, type, index) {
      const typeClass = type === 'start' ? 'fc-start' : type === 'end' ? 'fc-end' : 'fc-mid';
      const typeLabel = type === 'start' ? 'Start Frame' : type === 'end' ? 'End Frame' : `Mid Frame ${index}`;
      const removeBtn = type === 'mid' ? `<button class="fc-btn fc-remove" data-fc-remove title="Remove">✕</button>` : '';
      const card = document.createElement('div');
      card.className = `frame-card ${typeClass}`;
      card.dataset.fcType = type;
      card.innerHTML = `
        <div class="fc-header">
          <span class="fc-title">${typeLabel}</span>
          <div class="fc-btn-row">
            <button class="fc-btn fc-capture" data-fc-capture title="Capture current element state">⊙ Capture</button>
            ${removeBtn}
          </div>
        </div>
        <div class="fc-fields">
          ${fcFieldHTML('X', 'x', frame.x ?? 0, 1)}
          ${fcFieldHTML('Y', 'y', frame.y ?? 0, 1)}
          ${fcFieldHTML('W', 'w', frame.w ?? 100, 1)}
          ${fcFieldHTML('H', 'h', frame.h ?? 100, 1)}
          ${fcFieldHTML('Opacity', 'opacity', frame.opacity ?? 1, 0.05)}
          ${fcFieldHTML('Scale', 'scale', frame.scale ?? 1, 0.01)}
          ${fcFieldHTML('Rotation', 'rotation', frame.rotation ?? 0, 1)}
        </div>`;
      return card;
    }

    function readFrameCard(card) {
      const num = k => { const n = parseFloat(card.querySelector(`[data-fckey="${k}"]`)?.value); return isNaN(n) ? 0 : n; };
      return { x: num('x'), y: num('y'), w: num('w'), h: num('h'), opacity: num('opacity'), scale: num('scale'), rotation: num('rotation') };
    }

    function attachCardEvents(card, getSelectedId) {
      card.addEventListener('click', e => {
        if (e.target.matches('input, button') || e.target.closest('button')) return;
        e.stopPropagation();
        const frame = readFrameCard(card);
        applyFrameToElement(getSelectedId(), frame);
        document.querySelectorAll('#advanim-frame-list .frame-card, #advanim-end-frame').forEach(c => c.classList.remove('frame-active'));
        card.classList.add('frame-active');
      });

      card.querySelectorAll('input[data-fckey]').forEach(inp => {
        inp.addEventListener('input', () => {
          const frame = readFrameCard(card);
          applyFrameToElement(getSelectedId(), frame);
          document.querySelectorAll('#advanim-frame-list .frame-card, #advanim-end-frame').forEach(c => c.classList.remove('frame-active'));
          card.classList.add('frame-active');
        });
      });

      const captureBtn = card.querySelector('[data-fc-capture]');
      if (captureBtn) {
        captureBtn.addEventListener('click', e => {
          e.stopPropagation();
          const el = getEl(getSelectedId());
          if (!el) return;
          const set = (k, v) => { const inp = card.querySelector(`[data-fckey="${k}"]`); if (inp) inp.value = v; };
          set('x', el.x); set('y', el.y); set('w', el.w); set('h', el.h);
          set('opacity', el.styles?.opacity ?? 1); set('scale', el.animScale ?? 1);
          set('rotation', el.rotation ?? 0);
          card.querySelectorAll('#advanim-frame-list .frame-card, #advanim-end-frame').forEach(c => c.classList.remove('frame-active'));
          card.classList.add('frame-active');
        });
      }

      const removeBtn = card.querySelector('[data-fc-remove]');
      if (removeBtn) {
        removeBtn.addEventListener('click', e => { e.stopPropagation(); card.remove(); renumberMidFrames(); });
      }
    }

    function renumberMidFrames() {
      document.querySelectorAll('#advanim-frame-list .frame-card.fc-mid').forEach((c, i) => {
        const t = c.querySelector('.fc-title');
        if (t) t.textContent = `Mid Frame ${i + 1}`;
      });
    }

    function applyFrameToElement(id, frame) {
      const el = getEl(id);
      if (!el) return;
      el.x = frame.x;
      el.y = frame.y;
      el.w = frame.w;
      el.h = frame.h;
      if (!el.styles) el.styles = {};
      el.styles.opacity = frame.opacity;
      el.animScale = frame.scale;
      const rot = frame.rotation ?? 0;
      el.rotation = rot;
      const node = document.querySelector(`[data-id="${id}"]`);
      if (!node) return;
      node.style.left    = frame.x + 'px';
      node.style.top     = frame.y + 'px';
      node.style.width   = frame.w + 'px';
      node.style.height  = frame.h + 'px';
      node.style.opacity = frame.opacity;
      if (window._applyElementTransform) window._applyElementTransform(node, rot, frame.scale);
      else node.style.transform = [rot ? `rotate(${rot}deg)` : '', frame.scale !== 1 ? `scale(${frame.scale})` : ''].filter(Boolean).join(' ');
      document.getElementById('prop-x').value = frame.x;
      document.getElementById('prop-y').value = frame.y;
      document.getElementById('prop-w').value = frame.w;
      document.getElementById('prop-h').value = frame.h;
      const rotInput = document.getElementById('prop-rotation');
      if (rotInput) rotInput.value = rot;
    }

    function lerpFrame(a, b, t) {
      const lerp = (x, y) => x + (y - x) * t;
      return {
        x: lerp(a.x, b.x), y: lerp(a.y, b.y),
        w: lerp(a.w, b.w), h: lerp(a.h, b.h),
        opacity: lerp(a.opacity ?? 1, b.opacity ?? 1),
        scale: lerp(a.scale ?? 1, b.scale ?? 1),
        rotation: lerp(a.rotation ?? 0, b.rotation ?? 0),
      };
    }

    function getAllFrames() {
      const list = document.getElementById('advanim-frame-list');
      const endCard = document.getElementById('advanim-end-frame');
      const frames = [];
      const startCards = list ? list.querySelectorAll('.frame-card.fc-start') : [];
      startCards.forEach(c => frames.push(readFrameCard(c)));
      const midCards = list ? list.querySelectorAll('.frame-card.fc-mid') : [];
      midCards.forEach(c => frames.push(readFrameCard(c)));
      if (endCard) frames.push(readFrameCard(endCard));
      return frames;
    }

    function evalFramesAtT(frames, t) {
      if (frames.length < 2) return frames[0] || {};
      const segments = frames.length - 1;
      const seg = Math.min(Math.floor(t * segments), segments - 1);
      const tSeg = (t * segments) - seg;
      return lerpFrame(frames[seg], frames[seg + 1], tSeg);
    }

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function stopAdvPlay() {
      _advAnimPlaying = false;
      _advAnimPlayingTrigger = false;
      if (_advAnimRaf) { cancelAnimationFrame(_advAnimRaf); _advAnimRaf = null; }
      const btn = document.getElementById('advanim-play-btn');
      if (btn) { btn.textContent = '\u25B6'; btn.classList.remove('playing'); }
      document.querySelectorAll('[data-id]').forEach(node => {
        if (node._advAnimHandler) {
          node.removeEventListener('click', node._advAnimHandler);
          node._advAnimHandler = null;
        }
      });
    }

    function startAdvPlay(id, type, speed, delay, framesOverride, triggerButtonId) {
      stopAdvPlay();
      if (type === 'trigger') {
        const trigBtnId = triggerButtonId || document.getElementById('advanim-trigger-btn')?.value;
        if (!trigBtnId) return;
        const trigNode = document.querySelector(`[data-id="${trigBtnId}"]`);
        if (!trigNode) return;
        const el = getEl(id);
        const frames = framesOverride || getAllFrames();
        if (frames.length < 2) return;
        const handler = function() {
          if (_advAnimPlaying) stopAdvPlay();
          _advAnimPlayingTrigger = true;
          runFrameAnimation(id, 'once', speed, 0, frames);
        };
        trigNode._advAnimHandler = handler;
        trigNode.addEventListener('click', handler);
        return;
      }
      runFrameAnimation(id, type, speed, delay, framesOverride || getAllFrames());
    }

    function runFrameAnimation(id, type, speed, delay, frames) {
      _advAnimPlaying = true;
      const btn = document.getElementById('advanim-play-btn');
      if (btn) { btn.innerHTML = '&#9646;&#9646;'; btn.classList.add('playing'); }
      if (frames.length < 2) { stopAdvPlay(); return; }
      const scrub = document.getElementById('advanim-scrub');
      const scrubVal = document.getElementById('advanim-scrub-val');
      let last = null;
      let delayRemaining = delay;
      let dir = 1;
      let t = parseFloat(scrub?.value || 0);

      function tick(now) {
        if (!_advAnimPlaying) return;
        const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
        last = now;

        if (delayRemaining > 0) { delayRemaining -= dt; _advAnimRaf = requestAnimationFrame(tick); return; }

        if (type === 'loop') {
          const selEl = getEl(id);
          if (selEl?.advAnim?.smooth) {
            t += dir * dt / speed;
            if (t >= 1) { t = 1; dir = -1; }
            if (t <= 0) { t = 0; dir = 1; }
          } else {
            t = (t + dt / speed) % 1;
          }
        } else if (type === 'pingpong') {
          t += dir * dt / speed;
          if (t >= 1) { t = 1; dir = -1; }
          if (t <= 0) { t = 0; dir = 1; }
        } else if (type === 'once') {
          t += dt / speed;
          if (t >= 1) { t = 1; stopAdvPlay(); }
        }

        const frame = evalFramesAtT(frames, easeInOut(t));
        applyFrameToElement(id, frame);
        if (scrub) scrub.value = t;
        if (scrubVal) scrubVal.textContent = Math.round(t * 100) + '%';
        if (_advAnimPlaying) _advAnimRaf = requestAnimationFrame(tick);
      }
      _advAnimRaf = requestAnimationFrame(tick);
    }

    function updateAdvSpeedDelayLabels(type) {
      const speedLabel = document.getElementById('advanim-speed-label');
      const speedUnit  = document.getElementById('advanim-speed-unit');
      const delayLabel = document.getElementById('advanim-delay-label');
      const delayUnit  = document.getElementById('advanim-delay-unit');
      if (!speedLabel) return;
      if (type === 'scroll') {
        speedLabel.textContent = 'Speed';
        speedUnit.textContent  = 'x (higher = slower)';
        delayLabel.textContent = 'Delay';
        delayUnit.textContent  = 's before tracking';
      } else {
        speedLabel.textContent = 'Speed';
        speedUnit.textContent  = 's/cycle';
        delayLabel.textContent = 'Delay';
        delayUnit.textContent  = 's';
      }
    }

    // ── Preset frame generation for "Default" mode ──────────────────────────
    // Default-mode presets (Fade/Slide/Zoom/Rotate/Bounce) are just specific
    // 2-3 frame shapes fed into the same keyframe engine Custom mode uses
    // (see main.js runAdvAnim/evalAdvFrames) — that's what lets both modes
    // share one Trigger/Speed/Delay/Smooth/Appear control set with no
    // duplication, instead of Default needing its own separate CSS-animation
    // machinery like it used to.
    const PRESET_DEFAULTS = {
      fadeIn:  { type: 'once', speed: 0.5  },
      slideUp: { type: 'once', speed: 0.55 },
      slideIn: { type: 'once', speed: 0.5  },
      zoomIn:  { type: 'once', speed: 0.45 },
      rotate:  { type: 'loop', speed: 1.2  },
      bounce:  { type: 'loop', speed: 0.6  },
    };

    function buildPresetFrames(preset, el) {
      const base = { x: el.x, y: el.y, w: el.w, h: el.h, opacity: el.styles?.opacity ?? 1, scale: 1, rotation: el.rotation ?? 0 };
      switch (preset) {
        case 'fadeIn':  return [{ ...base, opacity: 0 }, { ...base }];
        case 'slideUp': return [{ ...base, opacity: 0, y: base.y + 24 }, { ...base }];
        case 'slideIn': return [{ ...base, opacity: 0, x: base.x - 24 }, { ...base }];
        case 'zoomIn':  return [{ ...base, opacity: 0, scale: 0.92 }, { ...base }];
        case 'rotate':  return [{ ...base }, { ...base, rotation: (el.rotation || 0) + 360 }];
        case 'bounce':  return [{ ...base }, { ...base, y: base.y - 18 }, { ...base }];
        default:        return [{ ...base }, { ...base }];
      }
    }

    // Default mode has no "Set Animation" step — its frames are always fully
    // derived from the chosen preset + the element's current geometry, so
    // every shared-control change (trigger, speed, delay, smooth, appear)
    // commits and previews immediately.
    function applyDefaultAnim(el) {
      if (!el.advAnim) el.advAnim = {};
      const adv = el.advAnim;
      adv.mode   = 'default';
      adv.preset = adv.preset || 'fadeIn';
      adv.frames = buildPresetFrames(adv.preset, el);
      adv.type   = document.querySelector('.advanim-type-btn.active')?.dataset.advtype || adv.type || 'loop';
      adv.speed  = parseFloat(document.getElementById('advanim-speed')?.value) || adv.speed || 1.5;
      adv.delay  = parseFloat(document.getElementById('advanim-delay')?.value) || 0;
      adv.smooth = document.getElementById('advanim-smooth-toggle')?.checked || false;
      adv.animateOnAppear = document.getElementById('advanim-appear-toggle')?.checked || false;
      const triggerButtonId = document.getElementById('advanim-trigger-btn')?.value || '';
      const hoverElementId  = document.getElementById('advanim-hover-el')?.value || '';
      if (adv.type === 'trigger' && triggerButtonId) adv.triggerButtonId = triggerButtonId;
      if (adv.type === 'hover' && hoverElementId) adv.hoverElementId = hoverElementId;

      if (adv.enabled && window._runAdvAnim) window._runAdvAnim(el);
    }

    // Only live-applies while Default mode is active — Custom mode still
    // commits its (frame-editing) changes via the "Set Animation" button.
    function liveApplyIfDefault() {
      const mode = document.getElementById('anim-mode-select')?.value || 'default';
      if (mode !== 'default') return;
      const el = getEl(window._selectedAdvId);
      if (el) applyDefaultAnim(el);
    }

    // Builds just the frame-list/playhead cards — used by Custom mode only.
    function buildFrameListUI(el) {
      const adv = el.advAnim || {};
      const frames = adv.frames?.length >= 2 ? adv.frames : [
        { x: el.x, y: el.y, w: el.w, h: el.h, opacity: el.styles?.opacity ?? 1, scale: 1, rotation: el.rotation ?? 0 },
        { x: el.x, y: el.y + 20, w: el.w, h: el.h, opacity: 1, scale: 1, rotation: el.rotation ?? 0 },
      ];

      const frameList = document.getElementById('advanim-frame-list');
      frameList.innerHTML = '';
      document.getElementById('advanim-end-frame')?.remove();

      const startCard = buildFrameCard(frames[0], 'start', 0);
      frameList.appendChild(startCard);
      attachCardEvents(startCard, () => document.querySelector('[data-id].psel-outline')?.dataset.id || window._selectedAdvId);

      frames.slice(1, -1).forEach((f, i) => {
        const c = buildFrameCard(f, 'mid', i + 1);
        frameList.appendChild(c);
        attachCardEvents(c, () => document.querySelector('[data-id].psel-outline')?.dataset.id || window._selectedAdvId);
      });

      const endCard = buildFrameCard(frames[frames.length - 1], 'end', frames.length - 1);
      endCard.id = 'advanim-end-frame';
      frameList.appendChild(endCard);
      attachCardEvents(endCard, () => document.querySelector('[data-id].psel-outline')?.dataset.id || window._selectedAdvId);
    }

    // Populates the whole unified Animate section: the Enabled toggle,
    // Default-vs-Custom fields, and the Trigger/Speed/Delay/Smooth/Appear
    // controls shared by both modes — defined once here, not duplicated
    // per-mode.
    function buildAdvAnimUI(el) {
      const adv = el.advAnim || {};
      const enabled = !!adv.enabled;
      document.getElementById('anim-enabled-toggle').checked = enabled;
      document.getElementById('anim-config').style.display = enabled ? '' : 'none';
      if (!enabled) return;

      const mode = adv.mode || 'default';
      document.getElementById('anim-mode-select').value = mode;
      document.getElementById('anim-default-fields').style.display = mode === 'default' ? '' : 'none';
      document.getElementById('anim-custom-fields').style.display = mode === 'custom' ? '' : 'none';

      if (mode === 'default') {
        const preset = adv.preset || 'fadeIn';
        document.querySelectorAll('#anim-seg .seg-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.anim === preset);
        });
      } else {
        buildFrameListUI(el);
      }

      const type = adv.type || 'loop';
      document.getElementById('advanim-speed').value = adv.speed ?? 1.5;
      document.getElementById('advanim-delay').value = adv.delay ?? 0;

      document.querySelectorAll('.advanim-type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.advtype === type);
      });

      const triggerRow = document.getElementById('advanim-trigger-row');
      triggerRow.style.display = type === 'trigger' ? '' : 'none';
      const hoverRow = document.getElementById('advanim-hover-row');
      if (hoverRow) hoverRow.style.display = type === 'hover' ? '' : 'none';
      document.getElementById('advanim-smooth-row').style.display = type === 'loop' ? '' : 'none';
      const smoothToggle = document.getElementById('advanim-smooth-toggle');
      if (smoothToggle) smoothToggle.checked = !!adv.smooth;
      // Speed/delay are meaningful for scroll too (scroll speed multiplier + px delay)
      updateAdvSpeedDelayLabels(type);
      if (type === 'trigger') {
        populateAdvTriggerButtons();
        const sel = document.getElementById('advanim-trigger-btn');
        if (sel && adv.triggerButtonId) sel.value = adv.triggerButtonId;
      }
      if (type === 'hover') {
        populateAdvHoverElements();
        const hsel = document.getElementById('advanim-hover-el');
        if (hsel) hsel.value = adv.hoverElementId || '';
      }
      // Animate When Appeared toggle
      const appearToggle = document.getElementById('advanim-appear-toggle');
      if (appearToggle) appearToggle.checked = !!adv.animateOnAppear;
    }

    function readAdvAnimData(el) {
      const enabled = document.getElementById('anim-enabled-toggle')?.checked ?? false;
      const mode    = document.getElementById('anim-mode-select')?.value || 'default';
      const type    = document.querySelector('.advanim-type-btn.active')?.dataset.advtype || 'loop';
      const speed   = parseFloat(document.getElementById('advanim-speed')?.value) || 1.5;
      const delay   = parseFloat(document.getElementById('advanim-delay')?.value) || 0;

      let frames, preset;
      if (mode === 'default') {
        preset = document.querySelector('#anim-seg .seg-btn.active')?.dataset.anim || 'fadeIn';
        frames = buildPresetFrames(preset, el);
      } else {
        const frameList = document.getElementById('advanim-frame-list');
        const endCard   = document.getElementById('advanim-end-frame');
        if (!frameList || !endCard) return null;
        const startCards = frameList.querySelectorAll('.frame-card.fc-start');
        const midCards   = frameList.querySelectorAll('.frame-card.fc-mid');
        frames = [];
        startCards.forEach(c => frames.push(readFrameCard(c)));
        midCards.forEach(c => frames.push(readFrameCard(c)));
        frames.push(readFrameCard(endCard));
      }

      const triggerButtonId = document.getElementById('advanim-trigger-btn')?.value || '';
      const hoverElementId  = document.getElementById('advanim-hover-el')?.value || '';
      const animateOnAppear = document.getElementById('advanim-appear-toggle')?.checked || false;
      const smooth = document.getElementById('advanim-smooth-toggle')?.checked || false;
      const result = { enabled, mode, frames, type, speed, delay, animateOnAppear };
      if (mode === 'default') result.preset = preset;
      if (type === 'trigger' && triggerButtonId) result.triggerButtonId = triggerButtonId;
      if (type === 'hover' && hoverElementId) result.hoverElementId = hoverElementId;
      if (type === 'loop') result.smooth = smooth;
      return result;
    }

    document.getElementById('anim-enabled-toggle').addEventListener('change', function() {
      const el = getEl(window._selectedAdvId); if (!el) return;
      const on = this.checked;
      if (!el.advAnim) el.advAnim = {};
      el.advAnim.enabled = on;
      document.getElementById('anim-config').style.display = on ? '' : 'none';
      if (!on) {
        stopAdvPlay();
        if (window._runAdvAnim) window._runAdvAnim(el); // enabled=false makes this cancel any running loop/once/scroll state
        return;
      }
      // First time this element gets an animation — seed sensible defaults
      // instead of leaving mode/trigger/speed blank.
      if (!el.advAnim.mode) el.advAnim.mode = 'default';
      if (el.advAnim.mode === 'default') {
        el.advAnim.preset = el.advAnim.preset || 'fadeIn';
        if (!el.advAnim.type) {
          const d = PRESET_DEFAULTS[el.advAnim.preset] || { type: 'once', speed: 0.5 };
          el.advAnim.type  = d.type;
          el.advAnim.speed = el.advAnim.speed ?? d.speed;
        }
        buildAdvAnimUI(el);
        applyDefaultAnim(el);
      } else {
        buildAdvAnimUI(el);
        if (el.advAnim.frames?.length >= 2 && window._runAdvAnim) window._runAdvAnim(el);
      }
    });

    document.getElementById('anim-mode-select').addEventListener('change', function() {
      const el = getEl(window._selectedAdvId); if (!el) return;
      if (!el.advAnim) el.advAnim = {};
      el.advAnim.mode = this.value;
      document.getElementById('anim-default-fields').style.display = this.value === 'default' ? '' : 'none';
      document.getElementById('anim-custom-fields').style.display = this.value === 'custom' ? '' : 'none';
      if (this.value === 'default') {
        el.advAnim.preset = el.advAnim.preset || 'fadeIn';
        document.querySelectorAll('#anim-seg .seg-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.anim === el.advAnim.preset);
        });
        applyDefaultAnim(el);
      } else {
        // Seed the custom frame builder from whatever frames are already
        // active (e.g. the preset's frames) so switching to Custom gives the
        // user a starting point to edit instead of an empty animation.
        if (!el.advAnim.frames || el.advAnim.frames.length < 2) {
          el.advAnim.frames = buildPresetFrames(el.advAnim.preset || 'fadeIn', el);
        }
        buildFrameListUI(el);
      }
    });

    document.querySelectorAll('#anim-seg .seg-btn').forEach(b => {
      b.addEventListener('click', () => {
        const el = getEl(window._selectedAdvId); if (!el) return;
        document.querySelectorAll('#anim-seg .seg-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        if (!el.advAnim) el.advAnim = {};
        const isFreshAnim = !el.advAnim.type; // no trigger config yet for this element
        el.advAnim.mode   = 'default';
        el.advAnim.preset = b.dataset.anim;
        if (isFreshAnim) {
          const d = PRESET_DEFAULTS[b.dataset.anim] || { type: 'once', speed: 0.5 };
          el.advAnim.type  = d.type;
          el.advAnim.speed = d.speed;
          document.querySelectorAll('.advanim-type-btn').forEach(x => x.classList.toggle('active', x.dataset.advtype === d.type));
          document.getElementById('advanim-speed').value = d.speed;
          document.getElementById('advanim-smooth-row').style.display = d.type === 'loop' ? '' : 'none';
        }
        // Picking a preset implies wanting to see it — turn the section on if it wasn't already.
        if (!el.advAnim.enabled) {
          el.advAnim.enabled = true;
          document.getElementById('anim-enabled-toggle').checked = true;
          document.getElementById('anim-config').style.display = '';
        }
        applyDefaultAnim(el);
      });
    });

    document.querySelectorAll('.advanim-type-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.advanim-type-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const isTrigger = b.dataset.advtype === 'trigger';
        const isHover   = b.dataset.advtype === 'hover';
        document.getElementById('advanim-trigger-row').style.display = isTrigger ? '' : 'none';
        const hoverRow = document.getElementById('advanim-hover-row');
        if (hoverRow) hoverRow.style.display = isHover ? '' : 'none';
        document.getElementById('advanim-smooth-row').style.display = b.dataset.advtype === 'loop' ? '' : 'none';
        updateAdvSpeedDelayLabels(b.dataset.advtype);
        if (isTrigger) populateAdvTriggerButtons();
        if (isHover) populateAdvHoverElements();
        liveApplyIfDefault();
      });
    });

    document.getElementById('advanim-smooth-toggle').addEventListener('change', liveApplyIfDefault);
    document.getElementById('advanim-appear-toggle').addEventListener('change', liveApplyIfDefault);
    document.getElementById('advanim-speed').addEventListener('input', liveApplyIfDefault);
    document.getElementById('advanim-delay').addEventListener('input', liveApplyIfDefault);
    document.getElementById('advanim-trigger-btn').addEventListener('change', liveApplyIfDefault);
    document.getElementById('advanim-hover-el').addEventListener('change', liveApplyIfDefault);

    function populateAdvTriggerButtons() {
      const sel = document.getElementById('advanim-trigger-btn');
      const selId = window._selectedAdvId;
      const el = getEl(selId);
      const currentVal = el?.advAnim?.triggerButtonId || '';
      const buttons = (window.pageData.elements || []).filter(e => e.type === 'button');
      sel.innerHTML = '<option value="">— select —</option>' +
        buttons.map(b => `<option value="${b.id}"${b.id === currentVal ? ' selected' : ''}>${b.content || b.id} (${b.id})</option>`).join('');
    }

    // Lists the element itself (default — "hover over this element to
    // animate it") plus every other element/component on the page, so a
    // hover-triggered animation can be driven by a different element too
    // (e.g. hover a card to animate an icon inside it).
    function populateAdvHoverElements() {
      const sel = document.getElementById('advanim-hover-el');
      if (!sel) return;
      const selId = window._selectedAdvId;
      const el = getEl(selId);
      const currentVal = el?.advAnim?.hoverElementId || '';
      const others = (window.pageData.elements || []).filter(e => e.id !== selId);
      const label = e => `${e.content || e.id} (${e.type || 'element'})`;
      sel.innerHTML = `<option value="">${el ? label(el) : 'This element'} — itself</option>` +
        others.map(e => `<option value="${e.id}"${e.id === currentVal ? ' selected' : ''}>${label(e)}</option>`).join('');
    }

    document.getElementById('advanim-add-mid').addEventListener('click', e => {
      e.stopPropagation();
      const selId = window._selectedAdvId;
      const el = getEl(selId);
      const frame = el ? { x: el.x, y: el.y, w: el.w, h: el.h, opacity: el.styles?.opacity ?? 1, scale: 1, rotation: el.rotation ?? 0 } : { x: 0, y: 0, w: 100, h: 100, opacity: 1, scale: 1, rotation: 0 };
      const frameList = document.getElementById('advanim-frame-list');
      const endCard   = document.getElementById('advanim-end-frame');
      const midCount  = frameList.querySelectorAll('.fc-mid').length + 1;
      const card = buildFrameCard(frame, 'mid', midCount);
      frameList.insertBefore(card, endCard);
      attachCardEvents(card, () => window._selectedAdvId);
      renumberMidFrames();
    });

    const scrub = document.getElementById('advanim-scrub');
    const scrubVal = document.getElementById('advanim-scrub-val');
    scrub.addEventListener('input', () => {
      stopAdvPlay();
      const t = parseFloat(scrub.value);
      if (scrubVal) scrubVal.textContent = Math.round(t * 100) + '%';
      const frames = getAllFrames();
      if (frames.length >= 2) applyFrameToElement(window._selectedAdvId, evalFramesAtT(frames, easeInOut(t)));
    });

    document.getElementById('advanim-play-btn').addEventListener('click', () => {
      if (_advAnimPlaying) {
        stopAdvPlay();
        return;
      }
      const selId = window._selectedAdvId;
      const type  = document.querySelector('.advanim-type-btn.active')?.dataset.advtype || 'loop';
      if (type === 'scroll') { showToast('Scroll animation — preview by scrolling the page'); return; }
      if (type === 'hover') { showToast('Hover animation — preview by hovering the target element on the canvas'); return; }
      const speed = parseFloat(document.getElementById('advanim-speed')?.value) || 1.5;
      const delay = parseFloat(document.getElementById('advanim-delay')?.value) || 0;
      const trigId = document.getElementById('advanim-trigger-btn')?.value || '';
      startAdvPlay(selId, type, speed, delay, null, trigId);
    });

    document.getElementById('advanim-set-btn').addEventListener('click', e => {
      e.stopPropagation();
      const selId = window._selectedAdvId;
      const el = getEl(selId);
      if (!el) return;
      const data = readAdvAnimData(el);
      if (!data || data.frames.length < 2) return;
      el.advAnim = data;
      const btn = e.currentTarget;
      btn.textContent = '\u2713 Saved!'; btn.classList.add('applied');
      setTimeout(() => { btn.textContent = '\u26A1 Set Animation'; btn.classList.remove('applied'); }, 2000);

      stopAdvPlay();
      if (data.enabled && window._runAdvAnim) {
        const el2 = getEl(selId);
        if (el2) window._runAdvAnim(el2);
      } else if (data.enabled) {
        startAdvPlay(selId, data.type, data.speed, data.delay, data.frames, data.triggerButtonId);
      }
    });

    window._applyAllAdvAnims = function() {
      (window.pageData.elements || []).forEach(el => {
        if (el.advAnim?.enabled && el.advAnim.frames?.length >= 2 && window._runAdvAnim) {
          window._runAdvAnim(el);
        }
      });
    };
    window._advAnimInit = true;
    window._advAnimStop = stopAdvPlay;
    window._advAnimStart = startAdvPlay;
    window._buildAdvAnimUI = buildAdvAnimUI;
    window._readAdvAnimData = readAdvAnimData;
    window._evalFramesAtT = evalFramesAtT;
    window._easeInOut = easeInOut;
    window._getAllAdvFrames = getAllFrames;
  })();

  document.getElementById('prop-overflow').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el) return;
    if (!el.styles) el.styles = {};
    el.styles.overflow = this.value || undefined;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) node.style.overflow = this.value || '';
  });

  function patchNodeShape(id, shape) {
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!node) return;
    if (shape === 'circle') {
      node.style.borderRadius = '50%';
    } else {
      // Restore whatever manual corner radius the user had set instead of
      // just clearing it — otherwise switching circle -> square would
      // silently discard a custom border-radius value.
      const el = getEl(id);
      node.style.borderRadius = (el && el.styles && el.styles.borderRadius) || '';
    }
  }

  document.getElementById('prop-shape').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el) return;
    el.shape = this.value;
    const isCircle = this.value === 'circle';
    document.getElementById('row-container-radius').style.display = isCircle ? '' : 'none';
    document.getElementById('row-corner-radius').style.display = isCircle ? 'none' : '';
    document.getElementById('prop-w').closest('.geom-cell').style.display = isCircle ? 'none' : '';
    document.getElementById('prop-h').closest('.geom-cell').style.display = isCircle ? 'none' : '';

    if (isCircle) {
      // Snap to a true circle immediately — largest current side becomes the diameter.
      const d = Math.max(el.w || 0, el.h || 0) || 100;
      el.w = d; el.h = d;
      patchNodeGeom(selectedId, undefined, undefined, el.w, el.h);
      document.getElementById('prop-shape-radius').value = Math.round(d / 2);
    }
    patchNodeShape(selectedId, this.value);
  });

  document.getElementById('prop-shape-radius').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    const r = Math.max(5, parseInt(this.value) || 5);
    const d = r * 2;
    el.w = d; el.h = d;
    patchNodeGeom(selectedId, undefined, undefined, el.w, el.h);
    document.getElementById('prop-w').value = el.w;
    document.getElementById('prop-h').value = el.h;
  });

  // Manual corner-radius control, in the Border toggler section — lets the
  // user round the corners of boxes/buttons directly instead of only being
  // able to do it via the container's circle-shape shortcut.
  document.getElementById('prop-corner-radius').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    if (!el.styles) el.styles = {};
    const r = Math.max(0, parseFloat(this.value) || 0);
    el.styles.borderRadius = r + 'px';
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) node.style.borderRadius = r + 'px';
  });

  document.getElementById('prop-object-fit').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'image') return;
    el.objectFit = this.value;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) {
      const img = node.querySelector('img');
      if (img) img.style.objectFit = this.value;
    }
  });

  document.getElementById('prop-video-noctrl').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'video') return;
    el.noControls = this.checked;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    const vid = node ? node.querySelector('video') : null;
    if (vid) vid.controls = !this.checked;
  });

  document.getElementById('prop-video-play-mode').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'video') return;
    el.playMode = this.value;
    document.getElementById('prop-video-trigger-row').style.display = this.value === 'button' ? '' : 'none';
    document.getElementById('prop-video-scroll-row').style.display = this.value === 'scroll' ? '' : 'none';
    if (this.value === 'scroll') {
      document.getElementById('prop-video-scroll-speed').value = el.scrollPlaySpeed ?? 1;
      document.getElementById('prop-video-scroll-delay').value = el.scrollPlayDelay ?? 0;
    }
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    const vid = node ? node.querySelector('video') : null;
    if (vid) {
      if (this.value === 'scroll') {
        vid.loop = false;
        vid.pause();
        vid.currentTime = 0;
        if (window._runScrollVideo) window._runScrollVideo(el);
      } else {
        if (window._stopScrollVideo) window._stopScrollVideo(el.id);
        vid.loop = this.value === 'loop';
        if (this.value !== 'button') {
          vid.play().catch(() => {});
        } else {
          vid.pause();
          vid.currentTime = 0;
        }
      }
    }
  });

  document.getElementById('prop-video-scroll-speed').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'video') return;
    el.scrollPlaySpeed = parseFloat(this.value) || 1;
  });

  document.getElementById('prop-video-scroll-delay').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'video') return;
    el.scrollPlayDelay = parseFloat(this.value) || 0;
    if (window._runScrollVideo) window._runScrollVideo(el);
  });

  document.getElementById('prop-video-trigger-btn').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'video') return;
    el.triggerButtonId = this.value;
    applyVideoTrigger(el);
  });

  function applyVideoTrigger(el) {
    if (el.playMode !== 'button' || !el.triggerButtonId) return;
    const btnNode = document.querySelector(`[data-id="${el.triggerButtonId}"]`);
    const vidNode = document.querySelector(`[data-id="${el.id}"]`);
    const vid = vidNode ? vidNode.querySelector('video') : null;
    if (btnNode && vid) {
      if (!btnNode._videoTrigger) {
        btnNode._videoTrigger = function() { vid.currentTime = 0; vid.play(); };
        btnNode.addEventListener('click', btnNode._videoTrigger);
      }
    }
  }

  window._applyAllVideoTriggers = function() {
    (window.pageData.elements || []).filter(e => e.type === 'video' && e.playMode === 'button' && e.triggerButtonId).forEach(applyVideoTrigger);
    if (window._runScrollVideo) {
      (window.pageData.elements || []).filter(e => e.type === 'video' && e.playMode === 'scroll').forEach(window._runScrollVideo);
    }
  };

  // ── Slider / Carousel props ─────────────────────────────────────────────
  function defaultSliderCfg() {
    return { carouselType: 'horizontal', duration: 3, gap: 0, autoScroll: true, loop: false, dots: false, buttonNav: false, leftBtnId: '', rightBtnId: '', autoHide: false, groupCarousel: false };
  }

  function renderSliderSlideBox(el) {
    const box = document.getElementById('slider-slide-box');
    if (!box) return;
    const ids = Array.isArray(el.children) ? el.children : [];
    box.innerHTML = '';
    if (!ids.length) {
      const empty = document.createElement('div');
      empty.className = 'slider-slide-empty';
      empty.textContent = 'No components chosen yet';
      box.appendChild(empty);
      return;
    }
    ids.forEach(cid => {
      const child = getEl(cid);
      const chip = document.createElement('div');
      chip.className = 'slider-slide-chip';
      const label = document.createElement('span');
      label.className = 'slider-slide-chip-label';
      label.textContent = (TYPE_ICON[child?.type] || '▢') + ' ' + cid;
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'slider-slide-chip-rm';
      rm.textContent = '×';
      rm.title = 'Remove from slider';
      rm.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setParent(cid, null);
        rerender();
        const freshEl = getEl(el.id);
        if (freshEl) { renderSliderSlideBox(freshEl); showToast('Removed from slider'); }
      });
      chip.append(label, rm);
      box.appendChild(chip);
    });
  }

  function populateSliderButtonSelects(el) {
    const cfg = el.sliderCfg || defaultSliderCfg();
    const buttons = (window.pageData.elements || []).filter(e => e.type === 'button');
    const opts = '<option value="">-- select --</option>' +
      buttons.map(b => `<option value="${b.id}">${b.id}${b.content ? ' (' + b.content + ')' : ''}</option>`).join('');
    const leftSel = document.getElementById('prop-slider-leftbtn');
    const rightSel = document.getElementById('prop-slider-rightbtn');
    leftSel.innerHTML = opts;
    rightSel.innerHTML = opts;
    leftSel.value = cfg.leftBtnId || '';
    rightSel.value = cfg.rightBtnId || '';
  }

  function populateSliderProps(el) {
    const cfg = el.sliderCfg || (el.sliderCfg = defaultSliderCfg());
    renderSliderSlideBox(el);
    document.getElementById('prop-slider-type').value = cfg.carouselType || 'horizontal';
    document.getElementById('prop-slider-groupcarousel').checked = !!cfg.groupCarousel;
    document.getElementById('prop-slider-duration').value = cfg.duration ?? 3;
    document.getElementById('prop-slider-gap').value = cfg.gap ?? 0;
    document.getElementById('prop-slider-autoscroll').checked = cfg.autoScroll !== false;
    document.getElementById('prop-slider-loop').checked = !!cfg.loop;
    document.getElementById('prop-slider-dots').checked = !!cfg.dots;
    document.getElementById('prop-slider-btnnav').checked = !!cfg.buttonNav;
    document.getElementById('slider-btnnav-fields').style.display = cfg.buttonNav ? '' : 'none';
    document.getElementById('prop-slider-autohide').checked = !!cfg.autoHide;
    populateSliderButtonSelects(el);
  }

  function reapplySlider(el) {
    // Live-refresh the canvas preview after a slider config change, without
    // a full rerender() (which would also rebuild the element list / handles).
    if (window._setupSlider) {
      const node = document.querySelector(`[data-id="${el.id}"]`);
      window._setupSlider(el, node);
    }
  }

  document.getElementById('prop-slider-type').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).carouselType = this.value;
    reapplySlider(el);
  });

  document.getElementById('prop-slider-groupcarousel').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).groupCarousel = this.checked;
    reapplySlider(el);
  });

  document.getElementById('prop-slider-autoscroll').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).autoScroll = this.checked;
    reapplySlider(el);
  });

  document.getElementById('prop-slider-duration').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).duration = Math.max(0.5, parseFloat(this.value) || 3);
    reapplySlider(el);
  });

  document.getElementById('prop-slider-gap').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).gap = Math.max(0, parseFloat(this.value) || 0);
    reapplySlider(el);
  });

  document.getElementById('prop-slider-loop').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).loop = this.checked;
    reapplySlider(el);
  });

  document.getElementById('prop-slider-dots').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).dots = this.checked;
    reapplySlider(el);
  });

  document.getElementById('prop-slider-btnnav').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    const cfg = el.sliderCfg || (el.sliderCfg = defaultSliderCfg());
    cfg.buttonNav = this.checked;
    document.getElementById('slider-btnnav-fields').style.display = this.checked ? '' : 'none';
    if (this.checked) populateSliderButtonSelects(el);
    reapplySlider(el);
  });

  document.getElementById('prop-slider-leftbtn').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).leftBtnId = this.value;
    reapplySlider(el);
  });

  document.getElementById('prop-slider-rightbtn').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).rightBtnId = this.value;
    reapplySlider(el);
  });

  document.getElementById('prop-slider-autohide').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el || el.type !== 'slider') return;
    (el.sliderCfg || (el.sliderCfg = defaultSliderCfg())).autoHide = this.checked;
    reapplySlider(el);
  });

  // ── "Choose Components" popup ───────────────────────────────────────────
  // Lists every element on the canvas except the slider itself and its own
  // descendants (so a slider can never be nested inside itself). Ticking a
  // row and confirming reparents that element (single component or a whole
  // group, children and all) into the slider using the same setParent()
  // reparenting logic the element-list drag-and-drop already relies on —
  // unticking / confirming moves it back out to the root.
  const sliderPopup = document.getElementById('slider-picker-popup');
  let _pickerTargetSliderId = null;

  function openSliderPicker(sliderId) {
    _pickerTargetSliderId = sliderId;
    const slider = getEl(sliderId);
    const list = document.getElementById('slider-picker-list');
    list.innerHTML = '';
    const current = new Set(Array.isArray(slider.children) ? slider.children : []);

    // Only offer top-level-selectable items: elements with no parent, or
    // already a direct child of this slider. (Picking a component that
    // lives inside some other group would silently rip it out of that
    // group, which isn't what "choose existing canvas components" implies.)
    // Anything that's an *ancestor* of this slider is excluded too, since
    // making it a slide would nest the slider inside itself.
    const rows = (window.pageData.elements || []).filter(e =>
      e.id !== sliderId &&
      (!e.parent || e.parent === sliderId) &&
      !isDescendant(e.id, sliderId)
    );

    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'slider-slide-empty';
      empty.textContent = 'No available components — add some to the canvas first.';
      list.appendChild(empty);
    }

    rows.forEach(e => {
      const row = document.createElement('label');
      row.className = 'slider-pick-row';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = current.has(e.id);
      cb.dataset.id = e.id;
      const txt = document.createElement('span');
      txt.textContent = (TYPE_ICON[e.type] || '▢') + ' ' + e.id + (e.content ? ' — ' + String(e.content).slice(0, 24) : '');
      row.append(cb, txt);
      list.appendChild(row);
    });

    sliderPopup.style.display = 'flex';
  }

  function closeSliderPicker() {
    sliderPopup.style.display = 'none';
    _pickerTargetSliderId = null;
  }

  const chooseBtn = document.getElementById('btn-choose-components');
  if (chooseBtn) {
    chooseBtn.addEventListener('click', () => {
      const el = getEl(selectedId);
      if (!el || el.type !== 'slider') return;
      openSliderPicker(el.id);
    });
  }

  const pickerCancelBtn = document.getElementById('slider-picker-cancel');
  if (pickerCancelBtn) pickerCancelBtn.addEventListener('click', closeSliderPicker);

  if (sliderPopup) {
    sliderPopup.addEventListener('mousedown', (ev) => {
      if (ev.target === sliderPopup) closeSliderPicker();
    });
  }

  const pickerConfirmBtn = document.getElementById('slider-picker-confirm');
  if (pickerConfirmBtn) {
    pickerConfirmBtn.addEventListener('click', () => {
      const sliderId = _pickerTargetSliderId;
      if (!sliderId) return closeSliderPicker();
      const slider = getEl(sliderId);
      if (!slider) return closeSliderPicker();

      const checked = Array.from(document.querySelectorAll('#slider-picker-list input[type="checkbox"]'));
      checked.forEach(cb => {
        const id = cb.dataset.id;
        if (cb.checked) {
          setParent(id, sliderId);
        } else if (getEl(id)?.parent === sliderId) {
          setParent(id, null);
        }
      });

      closeSliderPicker();
      rerender();
      selectEl(sliderId);
      showToast('Slides updated');
    });
  }

  document.getElementById('prop-x').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    el.x = parseInt(this.value) || 0;
    patchNodeGeom(selectedId, el.x);
  });
  document.getElementById('prop-y').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    el.y = parseInt(this.value) || 0;
    patchNodeGeom(selectedId, undefined, el.y);
  });
  document.getElementById('prop-w').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    el.w = parseInt(this.value) || 40;
    patchNodeGeom(selectedId, undefined, undefined, el.w);
  });
  document.getElementById('prop-h').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    el.h = parseInt(this.value) || 20;
    patchNodeGeom(selectedId, undefined, undefined, undefined, el.h);
  });
  const rotField = document.getElementById('prop-rotation');
  if (rotField) rotField.addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    el.rotation = parseInt(this.value) || 0;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) {
      if (window._applyElementTransform) window._applyElementTransform(node, el.rotation);
      else node.style.transform = `rotate(${el.rotation}deg)`;
    }
  });

  // Group/container Scale — resizes only the visual size of this element's
  // children (via a scaled wrapper main.js inserts between it and them),
  // never this element's own x/y/w/h and never any child's own x/y/w/h.
  // A full rerender is needed (rather than a light DOM patch) since scale
  // changes which wrapper each child lives in.
  const scaleField = document.getElementById('prop-scale');
  if (scaleField) scaleField.addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    let v = parseFloat(this.value);
    if (!isFinite(v) || v <= 0) v = 1;
    el.scale = v;
    rerender();
  });

  function applyBgColor(value) {
    const el = getEl(selectedId); if (!el) return;
    if (!el.styles) el.styles = {};
    el.styles.background = value;
    el.styles.backgroundColor = undefined;
    patchNodeBg(selectedId, value);
    document.getElementById('swatch-bg-preview').style.background = value;
    const hex = toHex(value);
    document.getElementById('color-bg').value = hex;
    document.getElementById('color-bg-hex').value = value;
  }

  document.getElementById('color-bg').addEventListener('input', function() {
    applyBgColor(this.value);
  });
  document.getElementById('color-bg-hex').addEventListener('change', function() {
    const v = this.value.trim();
    if (isValidBackground(v)) applyBgColor(v);
  });

  // Blur — glass-morphism backdrop-filter. 0 (or blank) removes it entirely
  // so elements that never had it keep rendering exactly as before.
  function patchNodeBlur(id, px) {
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!node) return;
    const val = px > 0 ? `blur(${px}px)` : '';
    node.style.backdropFilter = val;
    node.style.WebkitBackdropFilter = val;
  }
  document.getElementById('prop-bg-blur').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    const px = Math.max(0, parseFloat(this.value) || 0);
    if (!el.styles) el.styles = {};
    if (px > 0) {
      el.styles.backdropFilter = `blur(${px}px)`;
      el.styles.WebkitBackdropFilter = `blur(${px}px)`;
    } else {
      el.styles.backdropFilter = undefined;
      el.styles.WebkitBackdropFilter = undefined;
    }
    patchNodeBlur(selectedId, px);
  });

  function applyTextColor(value) {
    const el = getEl(selectedId); if (!el) return;
    if (!el.styles) el.styles = {};
    el.styles.color = value;
    patchNodeTextColor(selectedId, value);
    document.getElementById('swatch-text-preview').style.background = value;
    const hex = toHex(value);
    document.getElementById('color-text').value = hex;
    document.getElementById('color-text-hex').value = value;
  }

  document.getElementById('color-text').addEventListener('input', function() {
    applyTextColor(this.value);
  });
  document.getElementById('color-text-hex').addEventListener('change', function() {
    const v = this.value.trim();
    if (isValidColor(v)) applyTextColor(v);
  });

  document.getElementById('prop-opacity').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    if (!el.styles) el.styles = {};
    el.styles.opacity = parseFloat(this.value);
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) node.style.opacity = el.styles.opacity;
  });

  // ── Border & Shadow toggler ─────────────────────────────────────────────
  function ensureBorderCfg(el) {
    if (!el.borderCfg) el.borderCfg = { enabled: false, style: 'solid', width: 1, color: '#000000', opacity: 1 };
    return el.borderCfg;
  }
  function ensureShadowCfg(el) {
    if (!el.shadowCfg) el.shadowCfg = { enabled: false, color: '#000000', intensity: 50 };
    return el.shadowCfg;
  }
  function patchBorderShadow(id) {
    const node = document.querySelector(`[data-id="${id}"]`);
    const el = getEl(id);
    if (node && el && window._applyBorderShadow) window._applyBorderShadow(node, el);
  }

  document.getElementById('prop-border-enabled').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el) return;
    ensureBorderCfg(el).enabled = this.checked;
    document.getElementById('border-fields').style.display = this.checked ? '' : 'none';
    patchBorderShadow(selectedId);
  });

  document.getElementById('prop-border-style').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el) return;
    ensureBorderCfg(el).style = this.value;
    patchBorderShadow(selectedId);
  });

  document.getElementById('prop-border-width').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    ensureBorderCfg(el).width = Math.max(0, parseFloat(this.value) || 0);
    patchBorderShadow(selectedId);
  });

  function applyBorderColor(value) {
    const el = getEl(selectedId); if (!el) return;
    ensureBorderCfg(el).color = value;
    document.getElementById('swatch-border-preview').style.background = value;
    const hex = toHex(value);
    document.getElementById('color-border').value = hex;
    document.getElementById('color-border-hex').value = value;
    patchBorderShadow(selectedId);
  }
  document.getElementById('color-border').addEventListener('input', function() {
    applyBorderColor(this.value);
  });
  document.getElementById('color-border-hex').addEventListener('change', function() {
    const v = this.value.trim();
    if (isValidColor(v)) applyBorderColor(v);
  });

  document.getElementById('prop-border-opacity').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    ensureBorderCfg(el).opacity = parseFloat(this.value);
    patchBorderShadow(selectedId);
  });

  document.getElementById('prop-shadow-enabled').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el) return;
    ensureShadowCfg(el).enabled = this.checked;
    document.getElementById('shadow-fields').style.display = this.checked ? '' : 'none';
    patchBorderShadow(selectedId);
  });

  function applyShadowColor(value) {
    const el = getEl(selectedId); if (!el) return;
    ensureShadowCfg(el).color = value;
    document.getElementById('swatch-shadow-preview').style.background = value;
    const hex = toHex(value);
    document.getElementById('color-shadow').value = hex;
    document.getElementById('color-shadow-hex').value = value;
    patchBorderShadow(selectedId);
  }
  document.getElementById('color-shadow').addEventListener('input', function() {
    applyShadowColor(this.value);
  });
  document.getElementById('color-shadow-hex').addEventListener('change', function() {
    const v = this.value.trim();
    if (isValidColor(v)) applyShadowColor(v);
  });

  document.getElementById('prop-shadow-intensity').addEventListener('input', function() {
    const el = getEl(selectedId); if (!el) return;
    const n = parseFloat(this.value) || 0;
    ensureShadowCfg(el).intensity = n;
    document.getElementById('prop-shadow-intensity-val').textContent = n + '%';
    patchBorderShadow(selectedId);
  });

  document.getElementById('prop-position-fixed').addEventListener('change', function() {
    const el = getEl(selectedId); if (!el) return;
    el.positionFixed = this.checked;
    const node = document.querySelector(`[data-id="${selectedId}"]`);
    if (node) {
      node.style.position = this.checked ? 'fixed' : 'absolute';
    }
  });

  // New elements should appear wherever the user is currently looking on
  // the canvas (i.e. within the visible viewport), not always up at the
  // very top of the page. We pick a point a little inset from the
  // top-left of the current viewport, then convert that viewport point
  // into canvas-local coordinates (accounting for page scroll and any
  // scale transform — e.g. the mobile preview scaling — applied to
  // #canvas) so el.x/el.y land in the right spot regardless of how far
  // down the page the user has scrolled.
  function getSpawnPosition() {
    const inset = 40;
    const canvasEl = document.getElementById('canvas');
    if (!canvasEl) return { x: inset, y: inset };
    const rect = canvasEl.getBoundingClientRect();
    const scale = (rect.width && canvasEl.offsetWidth) ? (rect.width / canvasEl.offsetWidth) : 1;
    const x = Math.max(20, Math.round((inset - rect.left) / (scale || 1)));
    const y = Math.max(20, Math.round((inset - rect.top) / (scale || 1)));
    return { x, y };
  }

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.add;
      const id = genId(type);
      const { x: spawnX, y: spawnY } = getSpawnPosition();
      const el = { id, type, x: spawnX, y: spawnY, w: 200, h: 80, styles: {}, animation: 'none' };
      if (type === 'text') {
        el.content = 'New text';
        el.styles = { fontSize: '16px', color: '#e4e4e7', fontFamily: 'system-ui, sans-serif' };
        // Inherit whatever Base Font is currently set — empty stays empty,
        // filled carries the same custom font forward onto the new element.
        el.fontFilePath = window.pageData.globalFontPath || '';
      }
      if (type === 'button') { el.content = 'Button'; el.href = ''; el.styles = { background: '#4f46e5', color: '#fff', borderRadius: '6px', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }; }
      if (type === 'image') { el.src = './asset/'; }
      if (type === 'video') { el.src = './asset/'; }
      if (type === 'audio') { el.src = './asset/'; }
      if (['container', 'group'].includes(type)) { el.children = []; el.styles = { background: '#1f2937', borderRadius: '8px' }; }
      if (type === 'slider') {
        el.w = 320; el.h = 220;
        el.children = [];
        el.styles = { background: '#1f2937', borderRadius: '8px' };
        el.borderCfg = { enabled: true, style: 'dashed', width: 1, color: '#6b7280', opacity: 1 };
        el.sliderCfg = { carouselType: 'horizontal', duration: 3, gap: 0, autoScroll: true, loop: false, dots: false, buttonNav: false, leftBtnId: '', rightBtnId: '', autoHide: false, groupCarousel: false };
      }
      if (type === 'input') {
        el.content = 'Placeholder text';
        el.h = 40;
        el.styles = { background: '#ffffff', color: '#111827', borderRadius: '6px', fontSize: '14px', fontFamily: 'system-ui, sans-serif', padding: '0 12px' };
        el.borderCfg = { enabled: true, style: 'solid', width: 1, color: '#d1d5db', opacity: 1 };
      }
      if (type === 'textarea') {
        el.content = 'Placeholder text';
        el.h = 100;
        el.styles = { background: '#ffffff', color: '#111827', borderRadius: '6px', fontSize: '14px', fontFamily: 'system-ui, sans-serif', padding: '10px 12px' };
        el.borderCfg = { enabled: true, style: 'solid', width: 1, color: '#d1d5db', opacity: 1 };
      }
      if (type === 'checkbox') {
        el.content = 'Checkbox label';
        el.w = 180; el.h = 24;
        el.styles = { color: '#111827', fontSize: '14px', fontFamily: 'system-ui, sans-serif' };
      }
      if (type === 'radio') {
        el.content = 'Radio label';
        el.w = 180; el.h = 24;
        el.styles = { color: '#111827', fontSize: '14px', fontFamily: 'system-ui, sans-serif' };
      }
      if (type === 'select') {
        el.options = ['Option 1', 'Option 2', 'Option 3'];
        el.h = 40;
        el.styles = { background: '#ffffff', color: '#111827', borderRadius: '6px', fontSize: '14px', fontFamily: 'system-ui, sans-serif' };
        el.borderCfg = { enabled: true, style: 'solid', width: 1, color: '#d1d5db', opacity: 1 };
      }
      const wrapped = window._wrapNewElement ? window._wrapNewElement(el) : el;
      window.pageData.elements.push(wrapped);
      rerender();
      selectEl(id);
      showToast('Added ' + type);
    });
  });

  document.getElementById('btn-to-button').addEventListener('click', () => {
    const el = getEl(selectedId); if (!el) return;
    el.type = 'button';
    el.href = el.href || '';
    // Converting only adds button behavior (clickable, Navigate To, etc.) —
    // content/state/position are left exactly as they were, so no default
    // "Button" label gets stamped onto elements (e.g. containers) that had
    // no text of their own.
    rerender();
    // rerender() only rebuilds the canvas + element list — it doesn't touch
    // the currently-open Properties panel, so without this the panel kept
    // showing the old element type's fields and the button-only controls
    // (Navigate To page/location, Href, etc.) never appeared after
    // converting. Re-show the props for the (now button-typed) element so
    // those fields show up immediately.
    showProps(el);
    showToast('Converted to button — see Navigate To below');
  });

  document.getElementById('btn-group-sel').addEventListener('click', () => {
    if (!selectedId) return showToast('Select an element first');
    const el = getEl(selectedId); if (!el) return;
    const gid = genId('group');
    // The group box is created at exactly the element's current x/y/w/h,
    // and the element's own x/y are reset to 0,0 (its position *inside*
    // the group). Since the group sits at the same place the element used
    // to be, and the element now sits flush with the group's top-left
    // corner, the element's on-canvas position doesn't move at all —
    // grouping should never reposition anything automatically; only an
    // explicit, manual edit (dragging, or the X/Y fields) should.
    const grpFlat = {
      id: gid, type: 'group', x: el.x, y: el.y, w: el.w, h: el.h,
      styles: { border: '1px dashed #374151', borderRadius: '6px' },
      animation: 'none', children: [selectedId], parent: el.parent
    };
    el.parent = gid; el.x = 0; el.y = 0;
    const grp = window._wrapNewElement ? window._wrapNewElement(grpFlat) : grpFlat;
    window.pageData.elements.push(grp);
    rerender(); selectEl(gid); showToast('Wrapped in group');
  });

  function deleteEl(id) {
    window.pageData.elements = window.pageData.elements.filter(e => e.id !== id);
    window.pageData.elements.forEach(e => {
      if (e.children) e.children = e.children.filter(c => c !== id);
    });
    if (selectedId === id) { selectedId = null; hideProps(); }
    rerender(); showToast('Deleted');
  }
  document.getElementById('btn-delete').addEventListener('click', () => {
    if (selectedId) deleteEl(selectedId);
  });

  // ── Copy / Paste ────────────────────────────────────────────────────────
  // el is a dual-layout Proxy (see main.js), but JSON.stringify(el) still
  // serializes it correctly: layouts/id/type/content/... are all real own
  // properties on the underlying target object — x/y/w/h/styles/etc. just
  // aren't among them (they only exist inside layouts.desktop/mobile), so
  // this naturally captures both layouts in one shot without needing to
  // know about the proxy at all.
  let _clipboardEl = null;

  function copySelected() {
    const el = getEl(selectedId);
    if (!el) return;
    // A group/container's own flat data only *references* its children by
    // id — the actual child elements are separate entries in
    // window.pageData.elements. Copying just the selected element therefore
    // used to copy an empty shell. Walk the (current mode's) child tree and
    // capture every descendant alongside it, so pasting reproduces the
    // whole group, not just the container.
    const subtree = [];
    (function collect(id) {
      const e = getEl(id);
      if (!e) return;
      subtree.push(JSON.parse(JSON.stringify(e)));
      getChildren(id).forEach(child => collect(child.id));
    })(selectedId);
    _clipboardEl = subtree;
    showToast(subtree.length > 1 ? 'Copied group' : 'Copied');
  }

  function pasteClipboard() {
    if (!_clipboardEl || !_clipboardEl.length) return showToast('Nothing to paste');
    const originals = JSON.parse(JSON.stringify(_clipboardEl));
    const rootOldId = originals[0].id;

    // Fresh ids for every element in the subtree up front, so parent/child
    // references between the copied elements can be remapped consistently.
    const idMap = {};
    originals.forEach(o => { idMap[o.id] = genId(o.type); });

    const clones = originals.map(o => {
      const clone = JSON.parse(JSON.stringify(o));
      clone.id = idMap[o.id];
      if (clone.layouts) {
        ['desktop', 'mobile'].forEach(mode => {
          const L = clone.layouts[mode];
          if (!L) return;
          // Point at the *new* parent/children ids so the pasted subtree's
          // internal structure mirrors the original instead of dangling
          // references to the elements that were actually copied, not the
          // originals still sitting in the tree.
          if (L.parent) L.parent = idMap[L.parent] || null;
          if (Array.isArray(L.children)) {
            L.children = L.children.map(c => idMap[c]).filter(Boolean);
          }
        });
      }
      return clone;
    });

    // Detach the copied root from wherever it used to live, and nudge it so
    // the paste doesn't sit exactly on top of the original — descendants
    // keep their relative x/y untouched since they stay nested inside the
    // (also cloned) root.
    const rootClone = clones.find(c => c.id === idMap[rootOldId]);
    if (rootClone && rootClone.layouts) {
      ['desktop', 'mobile'].forEach(mode => {
        const L = rootClone.layouts[mode];
        if (!L) return;
        L.x = (L.x || 0) + 24;
        L.y = (L.y || 0) + 24;
        L.parent = null;
      });
    }

    clones.forEach(clone => {
      const wrapped = window._wrapNewElement ? window._wrapNewElement(clone) : clone;
      window.pageData.elements.push(wrapped);
    });

    rerender();
    selectEl(idMap[rootOldId]);
    showToast(clones.length > 1 ? 'Pasted group' : 'Pasted');
  }

  document.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement && document.activeElement.tagName;
    // Don't hijack normal copy/paste while the user is typing in a field.
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || (document.activeElement && document.activeElement.isContentEditable)) return;

    const isMeta = e.ctrlKey || e.metaKey;
    if (!isMeta) return;

    if (e.key === 'c' || e.key === 'C') {
      if (!selectedId) return;
      copySelected();
    } else if (e.key === 'v' || e.key === 'V') {
      if (!_clipboardEl) return;
      e.preventDefault();
      pasteClipboard();
    }
  });

  document.getElementById('btn-save').addEventListener('click', async () => {
    if (window._readAdvAnimData && window._selectedAdvId) {
      const selEl = (window.pageData.elements || []).find(e => e.id === window._selectedAdvId);
      if (selEl) {
        const data = window._readAdvAnimData(selEl);
        if (data) selEl.advAnim = data;
      }
    }

    const cleanData = serializePageData(window.pageData);

    // Always persist current page state to localStorage
    savePageData(_activePage, cleanData);

    const json = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    const pageName = _activePage === DEFAULT_PAGE ? 'page.json' : (_activePage + '.json');

    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: pageName,
          types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
        });
        const w = await handle.createWritable();
        await w.write(blob);
        await w.close();
        showToast('✔ Saved: ' + handle.name);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[panel.js] Save error:', err);
          showToast('Save failed — see console');
        }
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: pageName });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast('⬇ Downloaded ' + pageName + ' — drop it back into your project folder');
    }
  });

  buildElementList();
  updateElCount();
  if (window._applyAllVideoTriggers) window._applyAllVideoTriggers();

  // ── Eyedropper: pick a color from anywhere on screen/webpage ────────────
  // Uses the browser's native EyeDropper API (Chrome/Edge). Where it isn't
  // supported, the button stays visible but explains itself on click rather
  // than disappearing, since support is expanding browser to browser.
  //
  // The browser only ever allows ONE EyeDropper session at a time. The guard
  // against overlapping calls used to live *inside* attachEyedropper, so each
  // of the 5 buttons (bg, text, border, shadow, page-bg) got its own private
  // `activeController` — that only stopped the *same* button from being
  // clicked twice. Clicking a *different* field's eyedropper while one was
  // still picking fired a second, overlapping EyeDropper.open() call; the
  // browser rejects/ignores it, but the first session's promise is left with
  // nothing to resolve it, so its native picking cursor/overlay stays active
  // and swallows every click on the page indefinitely — which is exactly
  // what "the entire browser freezes after using the color picker" looks
  // like, with no obvious way out short of hitting Escape. Sharing one guard
  // across all buttons means starting a new pick always cancels whichever
  // one is already in flight first, so only one can ever be open.
  let activeEyedrop = null; // { controller, reset }

  function attachEyedropper(hexInputId, applyFn) {
    const hexInput = document.getElementById(hexInputId);
    if (!hexInput || hexInput.parentElement.querySelector('.eyedrop-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'eyedrop-btn';
    btn.title = 'Pick a color from the page';
    btn.setAttribute('aria-label', 'Pick a color from the page');
    btn.innerHTML = '💧';

    const reset = () => {
      btn.innerHTML = '💧';
      btn.title = 'Pick a color from the page';
    };

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!window.EyeDropper) {
        showToast('Eyedropper isn\u2019t supported in this browser');
        return;
      }

      // Something is already picking (this button or any other) — cancel it
      // first rather than letting a second session overlap it.
      if (activeEyedrop) {
        const wasThisButton = activeEyedrop.reset === reset;
        activeEyedrop.controller.abort();
        activeEyedrop.reset();
        activeEyedrop = null;
        if (wasThisButton) return; // same button: this click was just "cancel"
      }

      const controller = new AbortController();
      activeEyedrop = { controller, reset };
      btn.innerHTML = '⏹';
      btn.title = 'Cancel color pick';
      try {
        const result = await new window.EyeDropper().open({ signal: controller.signal });
        if (result && result.sRGBHex) applyFn(result.sRGBHex);
      } catch (err) {
        // AbortError = user cancelled the pick (Escape or a button) — nothing to do.
      } finally {
        reset();
        if (activeEyedrop && activeEyedrop.controller === controller) activeEyedrop = null;
      }
    });

    hexInput.insertAdjacentElement('afterend', btn);
  }

  attachEyedropper('color-page-bg-hex', applyPageBg);
  attachEyedropper('color-bg-hex', applyBgColor);
  attachEyedropper('color-text-hex', applyTextColor);
  attachEyedropper('color-border-hex', applyBorderColor);
  attachEyedropper('color-shadow-hex', applyShadowColor);
} // end initPanel

waitForPageData(initPanel);