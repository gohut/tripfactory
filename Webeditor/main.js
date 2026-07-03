/**
 * main.js — JSON-driven page renderer
 * Fetches page.json (or ?page=xxx.json) and renders all elements into #canvas.
 * Zero dependency on panel.js — works standalone.
 */

// `window.pageData` holds the live, mutable copy of the loaded JSON.
// panel.js waits for this to be set (non-null/undefined) before initializing.
window.pageData = undefined;

// ─── CSS: animations & base canvas styles ───────────────────────────────────
const styleTag = document.createElement('style');
styleTag.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Hide the scrollbar chrome for the whole site ────────────────────────
     Scrolling itself stays fully functional (wheel/trackpad/keyboard/touch,
     and the JS smooth-scroll-to-location above) — this only removes the
     visible scrollbar track/thumb the browser would otherwise draw. */
  html {
    scrollbar-width: none;      /* Firefox */
    -ms-overflow-style: none;   /* old Edge / IE */
  }
  html::-webkit-scrollbar,
  body::-webkit-scrollbar {
    display: none;              /* Chrome, Safari, new Edge */
    width: 0;
    height: 0;
  }

  body {
    background: #f0f0f5;
    font-family: system-ui, sans-serif;
    min-height: 100vh;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  #canvas {
    position: relative;
    width: 800px;
    min-height: 640px;
    margin: 0 auto;
    padding: 0;
  }
  #canvas.mode-mobile {
    width: 390px;
  }

  /* ── Mobile scale-to-fit wrapper ──────────────────────────────────────────
     Real visitors land on phones of many different widths (360/375/390/414/
     430...), but the mobile layout is always authored against one fixed
     390px design. Rather than reflowing, we keep the 390px canvas as-is and
     scale it as a whole (via CSS transform) up or down to fill whatever the
     actual device width is, so proportions/spacing stay exactly as designed
     on every phone. The wrapper's own box gets an explicit height (set in
     JS, since CSS transform doesn't affect layout) so the rest of the page
     doesn't collapse or overlap the scaled canvas. */
  #canvas-scale-wrap {
    position: relative;
    width: 100%;
    overflow-x: hidden;
  }

  /* ── Animation keyframes ── */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* ── Animation utility classes ── */
  .anim-fadeIn  { animation: fadeIn  0.5s ease both; }
  .anim-slideUp { animation: slideUp 0.55s ease both; }
  .anim-slideIn { animation: slideIn 0.5s ease both; }
  .anim-zoomIn  { animation: zoomIn  0.45s ease both; }

  /* ── Element base ── */
  .page-element {
    position: absolute;
    overflow: visible;
  }

  .page-element[data-type="image"] img,
  .page-element[data-type="video"] video {
    overflow: hidden;
    border-radius: inherit;
  }
  .page-element[data-type="audio"] {
    overflow: hidden;
  }

  /* ── Video mute/unmute toggle ── */
  .video-mute-toggle {
    transition: background 0.15s, transform 0.15s;
  }
  .video-mute-toggle:hover {
    background: rgba(0, 0, 0, 0.75);
    transform: scale(1.08);
  }

  /* ── Button reset ── */
  .page-element[data-type="button"] {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    overflow: visible;
    transition: opacity 0.15s, transform 0.15s;
  }
  .page-element[data-type="button"]:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  /* ── Form elements ──────────────────────────────────────────────────────
     input/textarea/select are rendered inside a wrapper .page-element div
     (same pattern as image/video) so the editor's move/resize handles have
     somewhere to live — native form controls can't render child elements,
     so handles appended directly into an <input>/<textarea>/<select> never
     painted, which is why those types couldn't be dragged or resized. The
     wrapper carries position/size/border/background/shadow; the real
     control just fills it and stays visually transparent so the wrapper's
     styling shows through. */
  .page-element[data-type="input"] input,
  .page-element[data-type="textarea"] textarea,
  .page-element[data-type="select"] select {
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    outline: none;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
  }
  .page-element[data-type="textarea"] textarea {
    resize: none;
  }
  .page-element[data-type="select"] select {
    cursor: pointer;
  }
  .page-element[data-type="checkbox"],
  .page-element[data-type="radio"] {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }
  .page-element[data-type="checkbox"] input,
  .page-element[data-type="radio"] input {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    cursor: pointer;
  }
`;
document.head.appendChild(styleTag);

// ─── Dual-layout (desktop / mobile) data model ──────────────────────────────
// Every element keeps only its identity/content at the top level (id, type,
// content, src, href, ...). Everything structural/positional lives per-mode
// inside el.layouts.desktop / el.layouts.mobile. A Proxy makes el.x, el.styles,
// el.parent, el.children, el.animation, el.advAnim, el.positionFixed, el.hidden
// transparently read/write whichever layout is currently active, so existing
// code throughout main.js and panel.js needs no further changes.
const LAYOUT_KEYS = ['x', 'y', 'w', 'h', 'rotation', 'styles', 'animation', 'animDuration', 'animLoop', 'animScale', 'advAnim', 'parent', 'children', 'positionFixed', 'hidden', 'borderCfg', 'shadowCfg'];
const MOBILE_BREAKPOINT     = 480; // px — real-visitor viewport width that switches to mobile layout
window.MOBILE_CANVAS_WIDTH  = 390; // px — width of the mobile canvas/frame

window._layoutMode       = null; // resolved mode for the current render pass
window._layoutModeForced = null; // set by the editor panel to preview a mode regardless of real viewport

// ─── Zoom-independent effective viewport width ──────────────────────────────
// Browser page-zoom (Ctrl/Cmd + / −) shrinks window.innerWidth expressed in
// CSS px as zoom increases. Before this fix that meant zooming in on an
// ordinary desktop-width window could push innerWidth under
// MOBILE_BREAKPOINT purely from the zoom level, silently flipping a desktop
// visitor into the 390px mobile design (rendered inside a much wider
// window) — which is the "ugly at >100% zoom" bug. window.outerWidth (the
// browser chrome's physical window size) barely moves when you zoom, but
// shrinks together with innerWidth on a genuine window resize — so the
// ratio outerWidth/innerWidth rises specifically when zoom rises, and stays
// flat across ordinary resizes. Comparing that ratio to the one captured
// when the page first loaded (assumed to be the visitor's "no extra zoom"
// baseline) isolates "the user zoomed" from "the window got narrower",
// letting us recover a stable effective width and a scale factor to keep
// the canvas crisp at any zoom level instead of relying on raw CSS reflow.
let _baselineZoomRatio = (window.outerWidth && window.innerWidth) ? (window.outerWidth / window.innerWidth) : 1;
function currentZoomFactor() {
  if (!window.outerWidth || !window.innerWidth || !_baselineZoomRatio) return 1;
  const r = (window.outerWidth / window.innerWidth) / _baselineZoomRatio;
  return Math.max(0.3, Math.min(4, r || 1));
}
function effectiveViewportWidth() {
  return window.innerWidth * currentZoomFactor();
}
window._currentZoomFactor = currentZoomFactor;

function computeLayoutMode() {
  if (window._layoutModeForced) return window._layoutModeForced;
  return effectiveViewportWidth() <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
}

// Splits a flat element object (old-format JSON, or a freshly-built element
// from the "Add" buttons) into { id, type, ...sharedFields, layouts:{desktop,mobile} }.
// Idempotent — already-migrated elements pass through untouched.
function migrateElement(raw) {
  if (raw.layouts && raw.layouts.desktop && raw.layouts.mobile) return raw;
  const core = {};
  const layout = {};
  Object.keys(raw).forEach(k => {
    if (k === 'layouts') return;
    if (LAYOUT_KEYS.includes(k)) layout[k] = raw[k];
    else core[k] = raw[k];
  });
  core.layouts = {
    desktop: layout,
    mobile: JSON.parse(JSON.stringify(layout)) // independent clone — editing one mode never touches the other
  };
  return core;
}

function wrapElementProxy(core) {
  return new Proxy(core, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && LAYOUT_KEYS.includes(prop)) {
        const mode = window._layoutMode || computeLayoutMode();
        return target.layouts[mode][prop];
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      if (typeof prop === 'string' && LAYOUT_KEYS.includes(prop)) {
        const mode = window._layoutMode || computeLayoutMode();
        target.layouts[mode][prop] = value;
        return true;
      }
      return Reflect.set(target, prop, value, receiver);
    },
    has(target, prop) {
      if (typeof prop === 'string' && LAYOUT_KEYS.includes(prop)) {
        return prop in target.layouts[window._layoutMode || computeLayoutMode()];
      }
      return Reflect.has(target, prop);
    },
    deleteProperty(target, prop) {
      if (typeof prop === 'string' && LAYOUT_KEYS.includes(prop)) {
        delete target.layouts[window._layoutMode || computeLayoutMode()][prop];
        return true;
      }
      return Reflect.deleteProperty(target, prop);
    }
  });
}

// Migrates + proxies every element in a page's data, in place.
function ensureDualLayouts(jsonData) {
  if (!jsonData || !Array.isArray(jsonData.elements)) return jsonData;
  jsonData.elements = jsonData.elements.map(raw => wrapElementProxy(migrateElement(raw)));
  return jsonData;
}

// panel.js calls this for every newly-created element (Add button, Group button)
// so new elements get the same dual-layout treatment as loaded ones.
window._wrapNewElement = function(flatObj) {
  return wrapElementProxy(migrateElement(flatObj));
};

// panel.js calls this from the mobile-view toggle to force-preview a mode
// regardless of the real window width. Pass null to release the override.
window._setLayoutMode = function(mode) {
  window._layoutModeForced = mode;
  window._layoutMode = mode || computeLayoutMode();
};
window._getLayoutMode = function() { return window._layoutMode || computeLayoutMode(); };

function animClass(name) {
  const map = { fadeIn: 'anim-fadeIn', slideUp: 'anim-slideUp', slideIn: 'anim-slideIn', zoomIn: 'anim-zoomIn' };
  return map[name] || '';
}

// ─── Custom font-file (.ttf) support ────────────────────────────────────────
// Each distinct font path gets its own @font-face rule (injected once) and a
// generated font-family name that elements referencing that path use.
const _injectedFontPaths = new Set();
function _fontFamilyNameFor(path) {
  let hash = 0;
  for (let i = 0; i < path.length; i++) hash = (hash * 31 + path.charCodeAt(i)) | 0;
  return 'customfont-' + Math.abs(hash).toString(36);
}
function _ensureCustomFont(path) {
  const fam = _fontFamilyNameFor(path);
  if (!_injectedFontPaths.has(path)) {
    const rule = `@font-face { font-family: '${fam}'; src: url('${path}') format('truetype'); font-display: swap; }`;
    const styleEl = document.createElement('style');
    styleEl.textContent = rule;
    document.head.appendChild(styleEl);
    _injectedFontPaths.add(path);
  }
  return fam;
}
// Applies (or clears, if path is empty) a custom .ttf font on a node.
// Exposed on window so the editor panel can preview font changes live.
window._applyCustomFont = function(node, path) {
  if (path) {
    node.style.fontFamily = _ensureCustomFont(path);
  } else {
    node.style.fontFamily = '';
  }
};

// Rotation is layered together with any advanced-animation "scale" transform
// on the SAME node.style.transform, so we stash the current rotation on the
// node (data attribute) as the single source of truth, and every place that
// touches .transform (here, and applyAdvFrame/the first-frame preview below)
// rebuilds the whole string from that stashed value instead of clobbering it.
function applyElementTransform(node, rotationDeg, scale) {
  const rot = rotationDeg || 0;
  node.dataset.rot = rot;
  const parts = [];
  if (rot) parts.push(`rotate(${rot}deg)`);
  if (scale !== undefined && scale !== 1) parts.push(`scale(${scale})`);
  node.style.transform = parts.join(' ');
  node.style.transformOrigin = 'center center';
}
window._applyElementTransform = applyElementTransform;

function applyGeometry(node, el) {
  node.style.left   = el.x + 'px';
  node.style.top    = el.y + 'px';
  node.style.width  = el.w + 'px';
  node.style.height = el.h + 'px';
  applyElementTransform(node, el.rotation);
}

function applyStyles(node, styles = {}) {
  Object.assign(node.style, styles);
}

// ─── Border & Box-Shadow toggler ─────────────────────────────────────────
// el.borderCfg   = { enabled, style('solid'|'dashed'|'dotted'|'double'), width(px), color(hex), opacity(0-1) }
// el.shadowCfg   = { enabled, color(hex), intensity(0-100) }
// Both are optional/additive: if unset, any legacy raw CSS the element already
// had in el.styles.border / el.styles.boxShadow is left completely alone, so
// older page.json files keep rendering exactly as before. Once a cfg object
// exists (the user touched the new Border/Shadow toggle), it becomes the
// single source of truth for that property on that element.
function hexToRgba(hex, alpha) {
  const h = String(hex || '#000000').replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : (h + '000000').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const a = alpha === undefined ? 1 : Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function applyBorderShadow(node, el) {
  const isText = el.type === 'text';

  // Text elements never get a border or a box-shadow (a rectangular halo
  // around a text node's bounding box looks wrong / boxy) — they only ever
  // get a text-shadow, handled below.
  if (isText) {
    node.style.borderStyle = 'none';
    node.style.borderWidth = '0';
    node.style.borderColor = 'transparent';
    node.style.boxShadow = 'none';
  } else {
    const b = el.borderCfg;
    if (b) {
      if (b.enabled) {
        node.style.borderStyle = b.style || 'solid';
        node.style.borderWidth = (b.width ?? 1) + 'px';
        node.style.borderColor = hexToRgba(b.color || '#000000', b.opacity ?? 1);
      } else {
        node.style.borderStyle = 'none';
        node.style.borderWidth = '0';
        node.style.borderColor = 'transparent';
      }
    }
  }

  const s = el.shadowCfg;
  if (s) {
    const intensity = Math.max(0, Math.min(100, s.intensity ?? 50));
    if (isText) {
      if (s.enabled) {
        // Text-shadow has no spread param, so we only carry blur/offset/alpha
        // across from the same intensity mapping used for box-shadow, giving
        // the "Intensity" slider consistent meaning across element types.
        const blur    = Math.round(2 + intensity * 0.3);   // 2–32px
        const offsetY = Math.round(intensity * 0.06);       // 0–6px
        const alpha   = 0.25 + (intensity / 100) * 0.6;     // 0.25–0.85
        node.style.textShadow = `0 ${offsetY}px ${blur}px ${hexToRgba(s.color || '#000000', alpha)}`;
      } else {
        node.style.textShadow = 'none';
      }
    } else {
      if (s.enabled) {
        const blur    = Math.round(4 + intensity * 0.4);  // 4–44px
        const spread  = Math.round(intensity * 0.06);      // 0–6px
        const offsetY = Math.round(intensity * 0.08);      // 0–8px
        const alpha   = 0.12 + (intensity / 100) * 0.55;   // 0.12–0.67
        node.style.boxShadow = `0 ${offsetY}px ${blur}px ${spread}px ${hexToRgba(s.color || '#000000', alpha)}`;
      } else {
        node.style.boxShadow = 'none';
      }
    }
  }
}
window._hexToRgba = hexToRgba;
window._applyBorderShadow = applyBorderShadow;

function createElement(el) {
  let node;
  switch (el.type) {
    case 'text': {
      node = document.createElement('p');
      node.textContent = el.content || '';
      break;
    }
    case 'image': {
      node = document.createElement('div');
      const img = document.createElement('img');
      img.src = el.src || '';
      img.alt = el.alt || '';
      img.style.objectFit = el.objectFit || 'cover';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.display = 'block';
      node.appendChild(img);
      break;
    }
    case 'video': {
      node = document.createElement('div');
      const vid = document.createElement('video');
      vid.src = el.src || '';
      vid.controls = !el.noControls;
      vid.muted = !!el.muted;
      if (el.playMode === 'loop') {
        vid.loop = true;
        vid.autoplay = true;
      } else if (el.playMode === 'once') {
        vid.loop = false;
        vid.autoplay = true;
      } else {
        vid.loop = false;
        vid.autoplay = false;
      }
      if (el.playMode === 'scroll') {
        // Scroll-scrubbed: we drive currentTime by hand, so preload metadata
        // eagerly (need vid.duration ASAP) and never let it autoplay/loop.
        vid.preload = 'auto';
      }
      vid.style.width = '100%';
      vid.style.height = '100%';
      vid.style.display = 'block';
      node.appendChild(vid);

      // ── Mute / Unmute toggle ──────────────────────────────────────────
      // node (.page-element) is already position:absolute, so it's a valid
      // containing block for this button without touching its own layout.
      const muteBtn = document.createElement('button');
      muteBtn.type = 'button';
      muteBtn.className = 'video-mute-toggle';
      const syncMuteBtn = () => {
        muteBtn.textContent = vid.muted ? '🔇' : '🔊';
        muteBtn.title = vid.muted ? 'Unmute' : 'Mute';
      };
      syncMuteBtn();
      muteBtn.style.cssText = [
        'position:absolute',
        'top:8px',
        'right:8px',
        'width:30px',
        'height:30px',
        'border-radius:50%',
        'border:none',
        'background:rgba(0,0,0,0.55)',
        'color:#fff',
        'font-size:14px',
        'line-height:30px',
        'text-align:center',
        'padding:0',
        'cursor:pointer',
        'z-index:5',
      ].join(';');
      muteBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        vid.muted = !vid.muted;
        syncMuteBtn();
      });
      // Keep the icon accurate if muted state changes for any other reason
      // (e.g. browser autoplay policy force-muting it).
      vid.addEventListener('volumechange', syncMuteBtn);
      node.appendChild(muteBtn);
      break;
    }
    case 'audio': {
      node = document.createElement('audio');
      node.src = el.src || '';
      node.controls = true;
      node.style.width = '100%';
      break;
    }
    case 'button': {
      if (el.href) {
        node = document.createElement('a');
        node.href = el.href;
        if (el.target) node.target = el.target;
      } else {
        node = document.createElement('button');
        if (el.onClick) {
          try { node.addEventListener('click', new Function(el.onClick)); } catch(e) {}
        }
      }
      node.textContent = el.content || 'Button';
      break;
    }
    case 'input': {
      // Wrapped in a div (like image/video) so the editor's move/resize
      // handles have a real place to render — an <input> can't host child
      // elements, which is why drag/resize never worked directly on it.
      node = document.createElement('div');
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.placeholder = el.content || '';
      node.appendChild(inp);
      break;
    }
    case 'textarea': {
      node = document.createElement('div');
      const ta = document.createElement('textarea');
      ta.placeholder = el.content || '';
      node.appendChild(ta);
      break;
    }
    case 'checkbox':
    case 'radio': {
      node = document.createElement('label');
      const input = document.createElement('input');
      input.type = el.type;
      if (el.type === 'radio') input.name = el.radioGroup || el.id;
      input.checked = !!el.checked;
      const span = document.createElement('span');
      span.textContent = el.content || (el.type === 'checkbox' ? 'Checkbox' : 'Radio');
      node.appendChild(input);
      node.appendChild(span);
      break;
    }
    case 'select': {
      node = document.createElement('div');
      const sel = document.createElement('select');
      const opts = Array.isArray(el.options) && el.options.length ? el.options : ['Option 1', 'Option 2', 'Option 3'];
      opts.forEach(optText => {
        const opt = document.createElement('option');
        opt.value = optText;
        opt.textContent = optText;
        sel.appendChild(opt);
      });
      node.appendChild(sel);
      break;
    }
    case 'container':
    case 'group':
    default: {
      node = document.createElement('div');
      break;
    }
  }

  node.classList.add('page-element');
  node.dataset.id   = el.id;
  node.dataset.type = el.type;

  applyGeometry(node, el);
  applyStyles(node, el.styles || {});
  applyBorderShadow(node, el);

  // ── Container shape (square/circle) ──────────────────────────────────────
  // A circle is just border-radius:50% applied on top of whatever the
  // element's styles/border already set — resizing (canvas drag or the
  // panel's Radius field) keeps it circular/elliptical automatically since
  // the radius is percentage-based.
  if (el.type === 'container' && el.shape === 'circle') {
    node.style.borderRadius = '50%';
  }

  if (el.fontFilePath) window._applyCustomFont(node, el.fontFilePath);

  const cls = animClass(el.animation);
  if (cls) {
    node.style.animationDuration = (el.animDuration ?? 0.5) + 's';
    node.style.animationIterationCount = el.animLoop ? 'infinite' : '1';
    // "Smooth" plays forward then reverse on alternating iterations, so a
    // looped animation glides back the way it came instead of snapping to
    // its start frame every cycle.
    node.style.animationDirection = (el.animLoop && el.animSmooth) ? 'alternate' : 'normal';
    node.classList.add(cls);
  }

  // If this element has an advanced (keyframe) animation configured, it
  // should render at its first frame's pose from the very first paint —
  // not at the element's raw layout position — even for animation types
  // that don't start moving right away (On Click, On Scroll, or a Loop/Once
  // with a delay). Without this the element flashes at its base position
  // and then jumps to frame 0 once the animation actually kicks in.
  if (el.advAnim?.enabled && el.advAnim.frames?.length >= 2) {
    const f0 = el.advAnim.frames[0];
    node.style.left   = f0.x + 'px';
    node.style.top    = f0.y + 'px';
    node.style.width  = f0.w + 'px';
    node.style.height = f0.h + 'px';
    node.style.opacity = f0.opacity ?? 1;
    applyElementTransform(node, el.rotation, f0.scale ?? 1);
  }

  return node;
}

const _advAnimStates = {};

function lerpVal(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }

function evalAdvFrames(frames, t) {
  const segs = frames.length - 1;
  const seg  = Math.min(Math.floor(t * segs), segs - 1);
  const tSeg = t * segs - seg;
  const a = frames[seg], b = frames[seg + 1];
  return {
    x: lerpVal(a.x, b.x, tSeg),
    y: lerpVal(a.y, b.y, tSeg),
    w: lerpVal(a.w, b.w, tSeg),
    h: lerpVal(a.h, b.h, tSeg),
    opacity: lerpVal(a.opacity ?? 1, b.opacity ?? 1, tSeg),
    scale:   lerpVal(a.scale   ?? 1, b.scale   ?? 1, tSeg),
  };
}

function applyAdvFrame(node, frame) {
  node.style.left    = frame.x + 'px';
  node.style.top     = frame.y + 'px';
  node.style.width   = frame.w + 'px';
  node.style.height  = frame.h + 'px';
  node.style.opacity = frame.opacity;
  applyElementTransform(node, parseFloat(node.dataset.rot) || 0, frame.scale);
}

// Global scroll state tracker for scroll-driven animations
const _scrollAnimElements = new Map(); // id -> { el, frames, state }
// Scroll-driven video scrubbing: play forward on scroll-down, reverse on
// scroll-up. Rides the same rAF/scroll-listener loop as _scrollAnimElements.
const _scrollVideoElements = new Map(); // id -> { el, vid, state }
let _lastScrollY = window.scrollY;
let _scrollRaf = null;
let _scrollStopTimer = null;

function _isElementFullyVisible(node) {
  const rect = node.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  if (rect.height > vh) {
    // Element taller than the viewport can never be "fully" on screen —
    // treat "fills the whole viewport" as the fully-visible condition.
    return rect.top <= 0 && rect.bottom >= vh;
  }
  return rect.top >= 0 && rect.bottom <= vh;
}

function _tickScrollAnims() {
  const currentY = window.scrollY;
  const delta = currentY - _lastScrollY;
  _lastScrollY = currentY;

  if (delta === 0) { _scrollRaf = null; return; }

  _scrollAnimElements.forEach(({ el, frames, state }) => {
    const node = document.querySelector(`[data-id="${el.id}"]`);
    if (!node) return;

    // ── "Animate when appear" + scroll combo: gate on CURRENT full visibility
    // every tick (not a one-time trigger). This is what prevents the element
    // from continuing to animate "in a blind spot" once it has scrolled back
    // out of view in either direction — it simply holds its frame until it's
    // fully back on screen, then resumes from wherever it left off.
    if (el.advAnim.animateOnAppear) {
      const fullyVisible = _isElementFullyVisible(node);
      if (!fullyVisible) {
        state.appeared = false;
        return;
      }
      if (!state.appeared) {
        state.appeared = true;
        if (!state.delayTimerStarted) {
          state.delayTimerStarted = true;
          const delay = el.advAnim.delay ?? 0;
          if (delay > 0) {
            state.ready = false;
            setTimeout(() => { state.ready = true; }, delay * 1000);
          } else {
            state.ready = true;
          }
        }
      }
    }

    // Still inside the configured delay window — element holds at its start frame.
    if (!state.ready) return;

    // ── Speed: higher value = slower (more scrolling needed per 100% progress),
    // same convention as Loop/Once where speed is "time per cycle".
    const speed = el.advAnim.speed ?? 1.5;
    const scrollRange = (el.advAnim.scrollRange ?? 200) * speed;
    const step = delta / scrollRange;
    state.t = Math.max(0, Math.min(1, (state.t || 0) + step));

    const frame = evalAdvFrames(frames, easeInOut(state.t));
    applyAdvFrame(node, frame);
  });

  _scrollVideoElements.forEach(({ el, vid, state }) => {
    if (!state.ready) return;
    // Duration isn't known until metadata loads — skip silently until then.
    if (!vid.duration || !isFinite(vid.duration)) return;

    const dir = delta > 0 ? 1 : delta < 0 ? -1 : 0;
    if (dir === 0) return;

    // Freeze on the current frame a moment after scrolling actually stops,
    // rather than continuing to play forever off the last bit of momentum.
    clearTimeout(state.stopTimer);
    state.stopTimer = setTimeout(() => _pauseScrollVideo(vid, state), 200);

    if (dir === state.direction) return; // already going the right way
    state.direction = dir;

    const speed = el.scrollPlaySpeed ?? 1;
    if (dir === 1) {
      // Scrolling down — real forward playback. This rides the browser's
      // own video clock/decoder, so it's exactly as smooth as a normal
      // playing video instead of us stepping frames by hand.
      _stopReversePlayback(vid, state);
      vid.playbackRate = Math.max(0.0625, Math.min(16, speed));
      vid.play().catch(() => {});
    } else {
      // Scrolling up — browsers don't support negative playbackRate, so we
      // simulate reverse by seeking currentTime backward. See
      // _startReversePlayback for why the seeks are throttled.
      vid.pause();
      _startReversePlayback(vid, state, speed);
    }
  });

  _scrollRaf = requestAnimationFrame(_tickScrollAnims);
}

function _stopReversePlayback(vid, state) {
  if (state.reverseRaf) { cancelAnimationFrame(state.reverseRaf); state.reverseRaf = null; }
  state.reverseLastTs = null;
  if (state.seekedHandler && vid) {
    vid.removeEventListener('seeked', state.seekedHandler);
    state.seekedHandler = null;
  }
  state.seeking = false;
}
function _pauseScrollVideo(vid, state) {
  state.direction = 0;
  clearTimeout(state.stopTimer);
  _stopReversePlayback(vid, state);
  vid.pause();
}
function _startReversePlayback(vid, state, speed) {
  if (state.reverseRaf) return; // already running
  state.reverseLastTs = null;
  state.reverseTarget = vid.currentTime;
  state.seeking = false;

  // Issuing vid.currentTime = ... every animation frame (60x/sec) sounds
  // fine, but most browsers can't actually complete a seek that fast —
  // requests pile up and get silently dropped/stalled, which is what made
  // reverse look like it wasn't playing at all. So instead we track the
  // desired time continuously every frame, but only ever hand a new value
  // to the video once its previous seek has actually finished.
  if (state.seekedHandler) vid.removeEventListener('seeked', state.seekedHandler);
  state.seekedHandler = () => { state.seeking = false; };
  vid.addEventListener('seeked', state.seekedHandler);

  function tick(ts) {
    if (state.direction !== -1) { state.reverseRaf = null; return; }
    const dt = state.reverseLastTs === null ? 0 : Math.min((ts - state.reverseLastTs) / 1000, 0.1);
    state.reverseLastTs = ts;
    state.reverseTarget = Math.max(0, state.reverseTarget - speed * dt);

    if (!state.seeking) {
      state.seeking = true;
      vid.currentTime = state.reverseTarget;
    }

    if (state.reverseTarget <= 0) {
      state.direction = 0;
      state.reverseRaf = null;
      return;
    }
    state.reverseRaf = requestAnimationFrame(tick);
  }
  state.reverseRaf = requestAnimationFrame(tick);
}

// ── Scroll-scrubbed video (On Scroll play mode) ─────────────────────────────
// Registers/re-registers a video element to play forward on scroll-down and
// reverse on scroll-up. Safe to call repeatedly (e.g. when the user tweaks
// speed/delay in the panel) — it just resets and re-arms the delay timer.
function runScrollVideo(el) {
  const existing = _scrollVideoElements.get(el.id);
  if (existing) { _stopReversePlayback(existing.vid, existing.state); clearTimeout(existing.state.stopTimer); }
  _scrollVideoElements.delete(el.id);
  const node = document.querySelector(`[data-id="${el.id}"]`);
  const vid = node ? node.querySelector('video') : null;
  if (!vid || el.playMode !== 'scroll') return;

  vid.loop = false;
  vid.autoplay = false;
  vid.pause();

  const delay = el.scrollPlayDelay ?? 0;
  const state = { ready: false, direction: 0, reverseRaf: null, reverseLastTs: null, stopTimer: null };
  _scrollVideoElements.set(el.id, { el, vid, state });
  if (delay > 0) setTimeout(() => { state.ready = true; }, delay * 1000);
  else state.ready = true;

  // Share the same global scroll listener used by transform scroll-animations.
  if (!window._scrollAnimListenerAttached) {
    window.addEventListener('scroll', _onScroll, { passive: true });
    window._scrollAnimListenerAttached = true;
  }
}
function stopScrollVideo(id) {
  const existing = _scrollVideoElements.get(id);
  if (existing) { _stopReversePlayback(existing.vid, existing.state); clearTimeout(existing.state.stopTimer); }
  _scrollVideoElements.delete(id);
}
window._runScrollVideo = runScrollVideo;
window._stopScrollVideo = stopScrollVideo;

function _onScroll() {
  if (!_scrollRaf) _scrollRaf = requestAnimationFrame(_tickScrollAnims);
  // Stop tick a bit after scroll ends
  clearTimeout(_scrollStopTimer);
  _scrollStopTimer = setTimeout(() => {
    _lastScrollY = window.scrollY; // sync so next scroll starts fresh delta
  }, 150);
}

function runAdvAnim(el) {
  // Clean up any previous state for this element
  if (_advAnimStates[el.id]) {
    cancelAnimationFrame(_advAnimStates[el.id].raf);
    delete _advAnimStates[el.id];
  }
  _scrollAnimElements.delete(el.id);

  const adv = el.advAnim;
  if (!adv || !adv.enabled || !adv.frames || adv.frames.length < 2) return;
  const type   = adv.type   || 'loop';
  const speed  = adv.speed  ?? 1.5;
  const delay  = adv.delay  ?? 0;
  const frames = adv.frames;

  // ── Animate When Appeared gate ──────────────────────────────────────────
  // For all types that support it: wrap the actual start in an IntersectionObserver.
  function startWithAppearGate(startFn) {
    if (!adv.animateOnAppear) { startFn(); return; }
    const node = document.querySelector(`[data-id="${el.id}"]`);
    if (!node) { startFn(); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startFn();
          obs.disconnect();
        }
      });
    }, { threshold: 0.15 });
    obs.observe(node);
  }

  // ── Scroll-driven animation ─────────────────────────────────────────────
  if (type === 'scroll') {
    // appeared/ready are now resolved continuously inside _tickScrollAnims
    // (see _isElementFullyVisible) rather than via a one-shot observer here,
    // so the gate re-engages correctly no matter which way the user scrolls.
    const state = { t: 0, appeared: !adv.animateOnAppear, ready: false, delayTimerStarted: false };
    _scrollAnimElements.set(el.id, { el, frames, state });

    if (!adv.animateOnAppear) {
      // Not gated by visibility — start the delay countdown right away.
      state.delayTimerStarted = true;
      if (delay > 0) setTimeout(() => { state.ready = true; }, delay * 1000);
      else state.ready = true;
    }

    // Ensure global scroll listener is active
    if (!window._scrollAnimListenerAttached) {
      window.addEventListener('scroll', _onScroll, { passive: true });
      window._scrollAnimListenerAttached = true;
    }
    return;
  }

  // ── On Click (trigger) ──────────────────────────────────────────────────
  if (type === 'trigger') {
    if (!adv.triggerButtonId) return;
    const btnNode = document.querySelector(`[data-id="${adv.triggerButtonId}"]`);
    if (!btnNode) return;
    const onClick = function() {
      const node = document.querySelector(`[data-id="${el.id}"]`);
      if (!node) return;
      if (_advAnimStates[el.id]) { cancelAnimationFrame(_advAnimStates[el.id].raf); }
      const state = { t: 0, last: null, raf: null, dir: 1 };
      _advAnimStates[el.id] = state;
      function tick(now) {
        const dt = state.last === null ? 0 : Math.min((now - state.last) / 1000, 0.1);
        state.last = now;
        state.t = Math.min(state.t + dt / speed, 1);
        applyAdvFrame(node, evalAdvFrames(frames, easeInOut(state.t)));
        if (state.t < 1) { state.raf = requestAnimationFrame(tick); }
        else { delete _advAnimStates[el.id]; }
      }
      state.raf = requestAnimationFrame(tick);
    };
    if (btnNode._advClick) btnNode.removeEventListener('click', btnNode._advClick);
    btnNode._advClick = onClick;
    btnNode.addEventListener('click', onClick);
    return;
  }

  // ── On Hover ─────────────────────────────────────────────────────────────
  // Plays forward toward the end frame while the cursor is over the chosen
  // hover-source element (itself by default, or any other element/component
  // on the page — picked in the "On Hover" dropdown), and eases back to the
  // start frame on mouse-leave, instead of a plain loop/once/click trigger.
  if (type === 'hover') {
    const hoverTargetId = adv.hoverElementId || el.id;
    const hoverNode = document.querySelector(`[data-id="${hoverTargetId}"]`);
    const node = document.querySelector(`[data-id="${el.id}"]`);
    if (!hoverNode || !node) return;

    function stepTowards(target) {
      const state = _advAnimStates[el.id] || { t: 0 };
      if (state.raf) cancelAnimationFrame(state.raf);
      state.last = null;
      _advAnimStates[el.id] = state;
      function tick(now) {
        const dt = state.last === null ? 0 : Math.min((now - state.last) / 1000, 0.1);
        state.last = now;
        const dir = target > state.t ? 1 : -1;
        state.t += dir * dt / speed;
        if ((dir === 1 && state.t >= target) || (dir === -1 && state.t <= target)) state.t = target;
        applyAdvFrame(node, evalAdvFrames(frames, easeInOut(state.t)));
        if (state.t !== target) { state.raf = requestAnimationFrame(tick); }
        else { state.raf = null; }
      }
      state.raf = requestAnimationFrame(tick);
    }
    const onEnter = function() { stepTowards(1); };
    const onLeave = function() { stepTowards(0); };
    if (hoverNode._advHoverEnter) hoverNode.removeEventListener('mouseenter', hoverNode._advHoverEnter);
    if (hoverNode._advHoverLeave) hoverNode.removeEventListener('mouseleave', hoverNode._advHoverLeave);
    hoverNode._advHoverEnter = onEnter;
    hoverNode._advHoverLeave = onLeave;
    hoverNode.addEventListener('mouseenter', onEnter);
    hoverNode.addEventListener('mouseleave', onLeave);
    return;
  }

  // ── Loop / Once ─────────────────────────────────────────────────────────
  function startLoopOrOnce() {
    const state = { t: 0, last: null, raf: null, dir: 1, delayLeft: delay };
    _advAnimStates[el.id] = state;
    function tick(now) {
      const node = document.querySelector(`[data-id="${el.id}"]`);
      if (!node) { delete _advAnimStates[el.id]; return; }
      const dt = state.last === null ? 0 : Math.min((now - state.last) / 1000, 0.1);
      state.last = now;
      if (state.delayLeft > 0) { state.delayLeft -= dt; state.raf = requestAnimationFrame(tick); return; }
      if (type === 'loop') {
        if (adv.smooth) {
          // Ping-pong: play forward to the end frame, then back to the start
          // frame, instead of snapping back to t=0. This is seamless
          // regardless of whether the start and end frames match, and is
          // exactly seamless when they do.
          state.t += state.dir * dt / speed;
          if (state.t >= 1) { state.t = 1; state.dir = -1; }
          if (state.t <= 0) { state.t = 0; state.dir = 1; }
        } else {
          state.t = (state.t + dt / speed) % 1;
        }
      } else if (type === 'once') {
        state.t = Math.min(state.t + dt / speed, 1);
      }
      applyAdvFrame(node, evalAdvFrames(frames, easeInOut(state.t)));
      if (type === 'once' && state.t >= 1) { delete _advAnimStates[el.id]; return; }
      state.raf = requestAnimationFrame(tick);
    }
    state.raf = requestAnimationFrame(tick);
  }

  startWithAppearGate(startLoopOrOnce);
}

// ─── Smooth scroll-to-location (used by button "Navigate" → Location) ──────
function findLocationById(pageData, locId) {
  return (pageData && pageData.locations || []).find(l => l.id === locId);
}

// Custom eased smooth-scroll so we can control speed (native smooth-scroll
// has no speed knob). speed is a multiplier: 1 = normal, 2 = twice as fast.
window._smoothScrollToY = function(targetY, speed) {
  speed = speed || 1;
  const startY = window.scrollY;
  const dist = targetY - startY;
  if (Math.abs(dist) < 1) return;
  const duration = Math.max(150, Math.min(2500, Math.abs(dist) / (1.1 * speed)));
  let startTime = null;
  function step(ts) {
    if (startTime === null) startTime = ts;
    const t = Math.min((ts - startTime) / duration, 1);
    const eased = easeInOut(t);
    window.scrollTo(0, startY + dist * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

// Resolves a location id against a page's data and smooth-scrolls to it.
// Waits a couple of frames so layout (and canvas height) has settled,
// e.g. right after a page switch / render.
window._resolveAndScrollToLocation = function(pageData, locId, speed) {
  if (!locId) return;
  const loc = findLocationById(pageData, locId);
  if (!loc) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window._smoothScrollToY(loc.y, speed);
    });
  });
};

// ─── Mobile scale-to-fit ─────────────────────────────────────────────────────
// Wraps #canvas in a sizing div (created once, lazily) so we can give the
// wrapper an explicit height that tracks the scaled canvas — `transform`
// never changes an element's own layout box, so without this the page
// underneath would either collapse (canvas measures 0 extra height) or
// overlap (canvas keeps its full unscaled height).
const MOBILE_SCALE_MIN = 0.55;
const MOBILE_SCALE_MAX = 1.35;

function ensureCanvasScaleWrap(canvas) {
  let wrap = document.getElementById('canvas-scale-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'canvas-scale-wrap';
    canvas.parentNode.insertBefore(wrap, canvas);
    wrap.appendChild(canvas);
  }
  return wrap;
}

// Only scales when the mobile layout is showing because of the *real*
// viewport width (an actual visitor on a phone) — not when the editor
// panel is force-previewing mobile mode, where authors need the true,
// unscaled 390px canvas to position elements accurately.
function updateMobileScale() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const wrap = ensureCanvasScaleWrap(canvas);
  const responsive = window._layoutMode === 'mobile' && !window._layoutModeForced;

  if (!responsive) {
    canvas.style.transform = '';
    canvas.style.transformOrigin = '';
    wrap.style.height = '';
    return;
  }

  // effectiveViewportWidth() undoes browser page-zoom's shrinkage of
  // innerWidth (see currentZoomFactor above), so the mobile fit-to-width
  // ratio tracks the visitor's real device width rather than their zoom level.
  const ratio = Math.max(MOBILE_SCALE_MIN, Math.min(MOBILE_SCALE_MAX, effectiveViewportWidth() / window.MOBILE_CANVAS_WIDTH));
  canvas.style.transformOrigin = 'top center';
  canvas.style.transform = `scale(${ratio})`;
  // offsetHeight reflects the canvas's true (unscaled) box — transform is
  // purely visual — so this is the right value to multiply by the ratio.
  wrap.style.height = Math.round(canvas.offsetHeight * ratio) + 'px';
}
window._updateMobileScale = updateMobileScale;

window.renderPage = function(jsonData) {
  ensureDualLayouts(jsonData);
  window.pageData = jsonData;
  window._layoutMode = computeLayoutMode();

  Object.values(_advAnimStates).forEach(s => { if (s.raf) cancelAnimationFrame(s.raf); });
  Object.keys(_advAnimStates).forEach(k => delete _advAnimStates[k]);
  _scrollAnimElements.clear();
  _scrollVideoElements.clear();

  const canvas = document.getElementById('canvas');
  canvas.innerHTML = '';
  canvas.classList.toggle('mode-mobile', window._layoutMode === 'mobile');

  if (jsonData.pageName) document.title = jsonData.pageName;

  // Restore canvas height from JSON
  if (jsonData.canvasHeight) canvas.style.minHeight = jsonData.canvasHeight + 'px';

  // Restore page background color from JSON (falls back to the CSS default)
  document.body.style.background = jsonData.bgColor || '#f0f0f5';

  const allElements = jsonData.elements || [];
  const byId = {};
  allElements.forEach(el => { byId[el.id] = el; });

  // Elements hidden in the active layout (the "eye" toggle) are skipped
  // entirely for this render pass, but stay in byId so parent lookups for
  // any still-visible descendants don't break.
  const elements = allElements.filter(el => !el.hidden);

  const nodeById = {};
  elements.forEach(el => {
    nodeById[el.id] = createElement(el);
  });

  elements.forEach(el => {
    const node = nodeById[el.id];
    // Apply positionFixed
    if (el.positionFixed) node.style.position = 'fixed';
    const parentEl = el.parent && byId[el.parent];
    if (parentEl && nodeById[el.parent]) {
      nodeById[el.parent].appendChild(node);
    } else {
      canvas.appendChild(node);
    }
  });

  elements.forEach(el => { if (el.advAnim?.enabled) runAdvAnim(el); });
  elements.forEach(el => { if (el.type === 'video' && el.playMode === 'scroll') runScrollVideo(el); });

  // Wire page navigation for buttons with navigateTo or navigateLocationId set
  elements.forEach(el => {
    if (el.type === 'button' && (el.navigateTo || el.navigateLocationId)) {
      const node = nodeById[el.id];
      if (!node) return;
      if (window._applyButtonNavigation) {
        // panel.js is loaded — use its handler (handles switchToPage in editor)
        window._applyButtonNavigation(el, node);
      } else {
        // Standalone (no panel): navigate via URL, carrying the location along
        if (node._navHandler) node.removeEventListener('click', node._navHandler);
        node._navHandler = function(e) {
          e.preventDefault();
          const target = el.navigateTo;
          const locId  = el.navigateLocationId;
          const speed  = el.navigateSpeed || 1;
          if (!target) {
            // Same page — just smooth-scroll, no reload.
            window._resolveAndScrollToLocation(window.pageData, locId, speed);
            return;
          }
          const url = new URL(window.location.href);
          if (target === 'main') url.searchParams.delete('page');
          else url.searchParams.set('page', target);
          if (locId) { url.searchParams.set('loc', locId); url.searchParams.set('locSpeed', speed); }
          else { url.searchParams.delete('loc'); url.searchParams.delete('locSpeed'); }
          window.location.href = url.toString();
        };
        node.addEventListener('click', node._navHandler);
        if (node.tagName === 'A') node.removeAttribute('href');
      }
    }
  });

  if (window._applyAllVideoTriggers) window._applyAllVideoTriggers();

  // The mobile-frame dashed overlay (if the editor's mobile preview is on)
  // was just wiped along with everything else in #canvas above — put it
  // back now that the fresh content is in place.
  if (window._reapplyMobileFrame) window._reapplyMobileFrame();

  updateMobileScale();
};

// Standalone (no editor panel) pages re-render automatically when the real
// viewport crosses the mobile breakpoint, so visitors get the right layout.
// Within the mobile range itself (e.g. rotating a phone, or a foldable/
// resizable window), we don't need a full re-render — just recompute the
// scale-to-fit ratio so the canvas keeps filling the available width.
let _lastAutoMode = null;
window.addEventListener('resize', () => {
  if (window._layoutModeForced) return; // editor panel is in control of the mode
  const m = computeLayoutMode();
  if (m !== _lastAutoMode) {
    _lastAutoMode = m;
    if (window.pageData) window.renderPage(window.pageData);
  } else if (m === 'mobile') {
    updateMobileScale();
  }
});

window._runAdvAnim = runAdvAnim;
window._stopAdvAnim = function(id) {
  if (_advAnimStates[id]) { cancelAnimationFrame(_advAnimStates[id].raf); delete _advAnimStates[id]; }
};

function getPageFile() {
  const params = new URLSearchParams(window.location.search);
  const page   = params.get('page');
  return page ? `${page}.json` : 'page.json';
}

(async function init() {
  const file = getPageFile();
  try {
    const res  = await fetch(file);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${file}`);
    const data = await res.json();
    window.renderPage(data);
    // If we arrived here via a "navigate to location" button, scroll there.
    // This only fires once: the button-navigation code writes ?loc=&locSpeed=
    // into the URL so the destination page knows where to scroll after the
    // full page load, but if we never clean those params back out, the URL
    // (now sitting in the address bar / possibly bookmarked or shared) keeps
    // carrying them forever — so every future reload or revisit of that same
    // link keeps auto-scrolling to that old location too. Stripping them
    // immediately after use (via replaceState, so it doesn't add a history
    // entry or reload the page) makes the scroll a one-time consequence of
    // the navigation click, not a permanent property of the URL.
    const params = new URLSearchParams(window.location.search);
    const locId = params.get('loc');
    if (locId && !window._applyButtonNavigation) {
      const speed = parseFloat(params.get('locSpeed')) || 1;
      window._resolveAndScrollToLocation(data, locId, speed);
      params.delete('loc');
      params.delete('locSpeed');
      const cleanUrl = new URL(window.location.href);
      cleanUrl.search = params.toString();
      window.history.replaceState(null, '', cleanUrl.toString());
    }
  } catch (err) {
    document.getElementById('canvas').innerHTML =
      `<p style="color:red;padding:20px;font-family:monospace">
        Failed to load <strong>${file}</strong>: ${err.message}<br>
        Make sure you're running via a local HTTP server (not file://).
      </p>`;
    console.error('[main.js]', err);
    // Always set pageData so panel.js can still initialize even if JSON load fails
    if (window.pageData === undefined) {
      window.pageData = { pageName: 'home', elements: [] };
    }
  }
})();

import('./Pannel/panel-core.js').catch(err => {
  console.error('[main.js] Failed to load editor panel:', err);
});