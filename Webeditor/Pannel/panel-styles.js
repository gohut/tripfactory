export function waitForPageData(cb, attempts = 60) {
  if (window.pageData !== null && window.pageData !== undefined) return cb();
  if (attempts <= 0) return console.error('[panel.js] pageData never set — is main.js loaded?');
  setTimeout(() => waitForPageData(cb, attempts - 1), 100);
}

const PANEL_STORAGE_KEY = 'webeditor-panel-state-v1';
export const PANEL_MIN_WIDTH = 320;
export const PANEL_MIN_HEIGHT = 320;

// Clear any stale panel state so the panel always opens visible
try {
  localStorage.removeItem('glb-editor-panel-state-v3'); // old key
  localStorage.removeItem(PANEL_STORAGE_KEY);           // current key — always fresh start
} catch(e) {}

export function loadPanelState() {
  const fallback = {
    x: Math.max(16, window.innerWidth - 380 - 16),
    y: 20,
    width: Math.min(380, Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32)),
    height: Math.min(680, Math.max(PANEL_MIN_HEIGHT, window.innerHeight - 40)),
    collapsed: false
  };
  try {
    const raw = localStorage.getItem(PANEL_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Reject stored coords that are outside the current viewport (stale scroll-offset values)
    const xOk = Number.isFinite(parsed.x) && parsed.x >= 0 && parsed.x < window.innerWidth;
    const yOk = Number.isFinite(parsed.y) && parsed.y >= 0 && parsed.y < window.innerHeight;
    return {
      x: xOk ? parsed.x : fallback.x,
      y: yOk ? parsed.y : fallback.y,
      width: Number.isFinite(parsed.width) ? parsed.width : fallback.width,
      height: Number.isFinite(parsed.height) ? parsed.height : fallback.height,
      collapsed: false  // always start expanded so panel is never invisible on load
    };
  } catch (err) {
    return fallback;
  }
}

export function savePanelState(state) {
  try {
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {}
}

export function injectStyles() {
  const s = document.createElement('style');
  s.id = 'panel-styles';
  s.textContent = `
    :root {
      --ed-bg: #0b1118;
      --ed-bg-soft: #0e1520;
      --ed-surface: #121a26;
      --ed-surface-hover: #16202d;
      --ed-border: #232f3d;
      --ed-border-soft: #1a2531;
      --ed-text: #d3dde6;
      --ed-text-dim: #7b8ba0;
      --ed-text-faint: #4b5b6e;
      --ed-accent: #4da3ff;
      --ed-accent-soft: rgba(77, 163, 255, 0.14);
      --ed-green: #3ddc8a;
      --ed-green-soft: rgba(61, 220, 138, 0.14);
      --ed-red: #ff6b6b;
      --ed-red-soft: rgba(255, 107, 107, 0.12);
      --ed-radius: 10px;
      --ed-radius-sm: 6px;
      --ed-gap: 8px;
      --ed-pad: 12px;
      --ed-panel-width: clamp(300px, 27vw, 380px);
    }

    #editor-panel, #editor-panel *, #editor-panel *::before, #editor-panel *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    }

    /* Kill the native up/down spinner on every number input in the panel —
       covers geom X/Y/W/H fields and any other number input that doesn't
       carry a more specific override below. */
    #editor-panel input[type="number"] {
      -moz-appearance: textfield;
    }
    #editor-panel input[type="number"]::-webkit-inner-spin-button,
    #editor-panel input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    #canvas {
      max-width: 100%;
      transition: margin-left 0.2s ease;
    }

    #editor-panel {
      position: fixed;
      top: 20px;
      left: calc(100vw - var(--ed-panel-width) - 16px);
      width: var(--ed-panel-width);
      height: min(640px, calc(100vh - 40px));
      min-width: ${PANEL_MIN_WIDTH}px;
      min-height: ${PANEL_MIN_HEIGHT}px;
      max-width: calc(100vw - 24px);
      max-height: calc(100vh - 24px);
      display: flex;
      flex-direction: column;
      background: var(--ed-bg);
      color: var(--ed-text);
      font-size: 12px;
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      resize: both;
      user-select: none;
      z-index: 9999;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }
    #editor-panel.is-collapsed {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.98);
    }
    #editor-panel.is-moving {
      transition: none;
    }

    #panel-header {
      flex-shrink: 0;
      padding: 12px var(--ed-pad);
      background: var(--ed-bg-soft);
      border-bottom: 1px solid var(--ed-border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ph-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }
    .ph-kicker {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--ed-text-faint);
    }
    .ph-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--ed-accent);
      margin-top: 2px;
    }
    .ph-tools {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .panel-icon-btn {
      width: 26px;
      height: 26px;
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      background: var(--ed-surface);
      color: var(--ed-text-dim);
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.12s, color 0.12s, background 0.12s;
    }
    .panel-icon-btn:hover {
      color: var(--ed-text);
      border-color: var(--ed-accent);
      background: var(--ed-surface-hover);
    }
    #panel-move-btn { cursor: grab; touch-action: none; }
    #panel-move-btn:active { cursor: grabbing; }

    .panel-header-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .panel-mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ed-green);
    }
    .panel-mode-badge::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--ed-green);
    }
    .ph-sub {
      font-size: 10px;
      color: var(--ed-text-dim);
    }

    #panel-tabs {
      flex-shrink: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      padding: 8px var(--ed-pad);
      background: var(--ed-bg-soft);
      border-bottom: 1px solid var(--ed-border);
    }
    .ptab {
      padding: 7px 4px;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--ed-text-dim);
      border: 1px solid transparent;
      border-radius: var(--ed-radius-sm);
      cursor: pointer;
      transition: color 0.12s, border-color 0.12s, background 0.12s;
    }
    .ptab:hover { color: var(--ed-text); }
    .ptab.active {
      color: var(--ed-green);
      border-color: var(--ed-green-soft);
      background: var(--ed-green-soft);
    }

    #panel-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 14px var(--ed-pad) 18px;
      scrollbar-width: thin;
      scrollbar-color: var(--ed-border) transparent;
    }
    #panel-body::-webkit-scrollbar { width: 6px; }
    #panel-body::-webkit-scrollbar-thumb { background: var(--ed-border); border-radius: 3px; }

    .tab-pane { display: none; }
    .tab-pane.active { display: block; }

    .panel-empty-state {
      padding: 20px 14px;
      border: 1px dashed var(--ed-border);
      border-radius: var(--ed-radius);
      color: var(--ed-text-dim);
      text-align: center;
      font-size: 11px;
      line-height: 1.6;
    }

    .psection {
      padding: 14px 0;
      border-bottom: 1px solid var(--ed-border-soft);
    }
    .psection:first-child { padding-top: 0; }
    .psection:last-child { border-bottom: none; padding-bottom: 0; }
    .psection-head {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      margin-bottom: 12px;
    }
    .psection-head-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ed-text-dim);
      flex: 1;
    }
    .psection-head-arrow {
      font-size: 9px;
      color: var(--ed-text-faint);
      transition: transform 0.12s;
    }
    .psection.collapsed .psection-head-arrow { transform: rotate(-90deg); }
    .psection.collapsed .psection-body { display: none; }

    .prow {
      display: flex;
      align-items: center;
      gap: var(--ed-gap);
      margin-bottom: 10px;
      min-height: 30px;
    }
    .prow:last-child { margin-bottom: 0; }
    .plabel {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ed-text-faint);
      width: 52px;
      flex-shrink: 0;
    }

    .pinput, .color-hex {
      flex: 1;
      min-width: 0;
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      color: var(--ed-text);
      font-size: 11px;
      padding: 7px 8px;
      height: 30px;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.12s;
    }
    .pinput:focus, .color-hex:focus { border-color: var(--ed-accent); }
    .pinput[type="number"] { -moz-appearance: textfield; text-align: right; padding-right: 8px; }
    .pinput[type="number"]::-webkit-inner-spin-button,
    .pinput[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .geom-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .geom-cell { display: flex; flex-direction: column; gap: 3px; }
    .geom-cell label {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ed-text-faint);
      text-align: center;
    }
    .geom-cell input {
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      color: var(--ed-text);
      font-size: 11px;
      padding: 7px 4px;
      height: 30px;
      box-sizing: border-box;
      text-align: center;
      outline: none;
      width: 100%;
    }
    .geom-cell input:focus { border-color: var(--ed-accent); }

    .color-row { display: flex; align-items: center; gap: 6px; flex: 1; }
    .color-swatch-wrap {
      position: relative;
      width: 24px;
      height: 24px;
      border-radius: var(--ed-radius-sm);
      overflow: hidden;
      border: 1px solid var(--ed-border);
      flex-shrink: 0;
      cursor: pointer;
    }
    .color-swatch-wrap input[type="color"] {
      position: absolute;
      inset: -4px;
      width: calc(100% + 8px);
      height: calc(100% + 8px);
      opacity: 0;
      cursor: pointer;
      border: none;
      padding: 0;
    }
    .color-swatch-preview { position: absolute; inset: 0; pointer-events: none; }

    .eyedrop-btn {
      flex-shrink: 0;
      width: 26px;
      height: 26px;
      border-radius: var(--ed-radius-sm);
      border: 1px solid var(--ed-border);
      background: var(--ed-surface);
      color: var(--ed-text);
      cursor: pointer;
      font-size: 13px;
      line-height: 1;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.12s, background 0.12s;
    }
    .eyedrop-btn:hover { border-color: var(--ed-accent); background: var(--ed-bg); }
    .eyedrop-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    .add-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
    .add-btn {
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      color: var(--ed-text-dim);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 8px 4px;
      cursor: pointer;
      text-align: center;
      transition: background 0.12s, color 0.12s, border-color 0.12s;
    }
    .add-btn:hover {
      background: var(--ed-surface-hover);
      color: var(--ed-text);
      border-color: var(--ed-accent);
    }

    .el-list { display: flex; flex-direction: column; }
    .el-list.drag-over-root { background: var(--ed-accent-soft); border-radius: var(--ed-radius-sm); }
    .el-list-empty-zone {
      height: 18px;
      flex-shrink: 0;
    }
    .el-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: var(--ed-radius-sm);
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
      transition: background 0.1s, border-color 0.1s;
      position: relative;
    }
    .el-row:hover { background: var(--ed-surface-hover); }
    .el-row.selected { border-color: var(--ed-accent); background: var(--ed-accent-soft); }
    .el-row.drag-over-nest { outline: 1.5px solid var(--ed-green); outline-offset: -1px; }
    .el-row.dragging { opacity: 0.4; }
    .el-row-dropline {
      position: absolute;
      left: 8px;
      right: 8px;
      height: 2px;
      background: var(--ed-accent);
      border-radius: 1px;
      pointer-events: none;
    }
    .el-row-dropline.top { top: -1px; }
    .el-row-dropline.bottom { bottom: -1px; }
    .el-twirl {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ed-text-faint);
      font-size: 9px;
      cursor: pointer;
      transition: transform 0.12s, color 0.12s;
    }
    .el-twirl:hover { color: var(--ed-text-dim); }
    .el-twirl.expanded { transform: rotate(90deg); }
    .el-twirl.spacer { visibility: hidden; cursor: default; }
    .el-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ed-text-faint);
      font-size: 11px;
    }
    .el-row.selected .el-icon { color: var(--ed-accent); }
    .el-item-id {
      font-size: 11px;
      color: var(--ed-text-dim);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .el-row.selected .el-item-id { color: var(--ed-text); }
    .el-item-del {
      background: none;
      border: none;
      color: var(--ed-text-faint);
      font-size: 13px;
      padding: 2px 5px;
      border-radius: var(--ed-radius-sm);
      line-height: 1;
      cursor: pointer;
      opacity: 0;
      flex-shrink: 0;
      transition: opacity 0.1s, color 0.1s, background 0.1s;
    }
    .el-row:hover .el-item-del { opacity: 1; }
    .el-item-del:hover { color: var(--ed-red); background: var(--ed-red-soft); }

    .seg-control {
      display: flex;
      flex: 1;
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      overflow: hidden;
    }
    .seg-btn {
      flex: 1;
      padding: 7px 3px;
      font-family: inherit;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: none;
      border: none;
      color: var(--ed-text-faint);
      cursor: pointer;
      text-align: center;
      transition: background 0.1s, color 0.1s;
    }
    .seg-btn:hover { color: var(--ed-text-dim); background: var(--ed-surface-hover); }
    .seg-btn.active { background: var(--ed-accent); color: #fff; }

    .paction {
      width: 100%;
      min-height: 36px;
      padding: 10px 12px;
      border-radius: var(--ed-radius-sm);
      border: 1px solid var(--ed-border);
      font-family: inherit;
      font-size: 10px;
      font-weight: 700;
      line-height: 1.4;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      text-align: center;
      transition: opacity 0.12s, border-color 0.12s;
      margin-bottom: 10px;
    }
    .paction:last-child { margin-bottom: 0; }
    .paction:hover { opacity: 0.85; }
    .paction.save { background: var(--ed-green); border-color: var(--ed-green); color: #06241a; }
    .paction.danger { background: var(--ed-red-soft); border-color: var(--ed-red); color: var(--ed-red); }
    .paction.muted { background: var(--ed-surface); color: var(--ed-text-dim); }

    #save-section {
      flex-shrink: 0;
      padding: var(--ed-pad);
      border-top: 1px solid var(--ed-border);
      background: var(--ed-bg-soft);
    }

    #panel-toast {
      position: fixed;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--ed-surface);
      color: var(--ed-text);
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      padding: 8px 14px;
      font-size: 11px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      opacity: 0;
      pointer-events: none;
      z-index: 10001;
      transition: opacity 0.2s;
    }
    #panel-toast.show { opacity: 1; }

    #drag-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9998;
    }
    #drag-overlay.move { display: block; cursor: grabbing; }
    #drag-overlay.resize { display: block; cursor: nwse-resize; }
    #drag-overlay.panel-drag { display: block; cursor: grabbing; z-index: 10002; }

    .psel-outline {
      outline: 2px solid var(--ed-accent) !important;
      outline-offset: 0 !important;
    }
    .psel-move {
      position: absolute !important;
      top: -16px !important;
      left: -1px !important;
      width: 22px !important;
      height: 16px !important;
      background: var(--ed-accent) !important;
      border-radius: 4px 4px 0 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: grab !important;
      z-index: 10000 !important;
      font-size: 9px !important;
      color: #fff !important;
      line-height: 1 !important;
      user-select: none !important;
    }
    .psel-move:active { cursor: grabbing !important; }
    .psel-resize {
      position: absolute !important;
      bottom: -1px !important;
      right: -1px !important;
      width: 16px !important;
      height: 16px !important;
      background: var(--ed-accent) !important;
      border-radius: 4px 0 4px 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: nwse-resize !important;
      z-index: 10000 !important;
      font-size: 9px !important;
      color: #fff !important;
      line-height: 1 !important;
      user-select: none !important;
    }
    .psel-rotate {
      position: absolute !important;
      top: -34px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 18px !important;
      height: 18px !important;
      background: var(--ed-accent) !important;
      border: 2px solid #fff !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: grab !important;
      z-index: 10000 !important;
      font-size: 10px !important;
      color: #fff !important;
      line-height: 1 !important;
      user-select: none !important;
      box-shadow: 0 0 0 1px var(--ed-accent) !important;
    }
    .psel-rotate::before {
      content: '' !important;
      position: absolute !important;
      top: 18px !important;
      left: 50% !important;
      width: 1px !important;
      height: 16px !important;
      background: var(--ed-accent) !important;
      transform: translateX(-50%) !important;
      z-index: -1 !important;
    }
    .psel-rotate:active { cursor: grabbing !important; }

    #panel-peek {
      position: fixed;
      z-index: 9998;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius);
      background: var(--ed-surface);
      color: var(--ed-text-dim);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      transition: color 0.12s, border-color 0.12s;
    }
    #panel-peek:hover { color: var(--ed-text); border-color: var(--ed-accent); }
    #panel-peek[hidden] { display: none; }

    .media-opts-section { margin-top: 2px; }
    .pselect {
      flex: 1;
      min-width: 0;
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      color: var(--ed-text);
      font-size: 11px;
      padding: 0 8px;
      height: 30px;
      box-sizing: border-box;
      outline: none;
      font-family: inherit;
      transition: border-color 0.12s;
      cursor: pointer;
    }
    .pselect:focus { border-color: var(--ed-accent); }
    .ptoggle-row {
      display: flex;
      align-items: center;
      gap: var(--ed-gap);
      margin-bottom: 10px;
      min-height: 32px;
    }
    .ptoggle-row:last-child { margin-bottom: 0; }
    .ptoggle-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ed-text-faint);
      flex: 1;
    }
    .toggle-switch {
      position: relative;
      width: 32px;
      height: 18px;
      flex-shrink: 0;
    }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-track {
      position: absolute;
      inset: 0;
      background: var(--ed-border);
      border-radius: 9px;
      cursor: pointer;
      transition: background 0.18s;
    }
    .toggle-track::after {
      content: '';
      position: absolute;
      left: 2px;
      top: 2px;
      width: 14px;
      height: 14px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.18s;
    }
    .toggle-switch input:checked + .toggle-track { background: var(--ed-accent); }
    .toggle-switch input:checked + .toggle-track::after { transform: translateX(14px); }


    .advanim-section {
      margin-top: 0;
      border-top: 1px solid var(--ed-border);
      padding-top: 0;
    }
    .advanim-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0 10px;
      cursor: pointer;
      user-select: none;
    }
    .advanim-title {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #ff9f63;
    }
    .advanim-toggle-btn {
      background: var(--ed-surface);
      border: 1px solid rgba(255,159,99,0.35);
      border-radius: 4px;
      color: #ff9f63;
      font-size: 9px;
      font-weight: 700;
      padding: 3px 8px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .advanim-toggle-btn.on {
      background: rgba(255,159,99,0.15);
      border-color: rgba(255,159,99,0.6);
      color: #ffbf80;
    }
    .advanim-body { display: none; padding-bottom: 4px; }
    .advanim-body.visible { display: block; }

    .advanim-row {
      display: flex;
      align-items: center;
      gap: var(--ed-gap);
      margin-bottom: 12px;
    }
    .advanim-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ed-text-faint);
      width: 52px;
      flex-shrink: 0;
    }
    .advanim-type-group {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      flex: 1;
    }
    .advanim-type-btn {
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: 4px;
      color: var(--ed-text-faint);
      font-size: 9px;
      font-weight: 700;
      padding: 4px 7px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.12s, color 0.12s, border-color 0.12s;
    }
    .advanim-type-btn.active {
      background: rgba(255,159,99,0.15);
      border-color: rgba(255,159,99,0.55);
      color: #ffbf80;
    }

    .frame-list { display: flex; flex-direction: column; gap: 8px; margin: 8px 0; }

    .frame-card {
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .frame-card:hover { border-color: rgba(99,217,255,0.3); }
    .frame-card.frame-active {
      border-color: rgba(99,217,255,0.8);
      box-shadow: 0 0 10px rgba(99,217,255,0.15);
    }
    .frame-card.fc-start { border-color: rgba(80,220,120,0.25); }
    .frame-card.fc-start:hover { border-color: rgba(80,220,120,0.5); }
    .frame-card.fc-start.frame-active { border-color: rgba(80,220,120,0.9); box-shadow: 0 0 10px rgba(80,220,120,0.2); }
    .frame-card.fc-end { border-color: rgba(255,100,100,0.25); }
    .frame-card.fc-end:hover { border-color: rgba(255,100,100,0.5); }
    .frame-card.fc-end.frame-active { border-color: rgba(255,100,100,0.9); box-shadow: 0 0 10px rgba(255,100,100,0.2); }
    .frame-card.fc-mid { border-color: rgba(99,217,255,0.18); }

    .fc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px 7px;
    }
    .fc-title {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .fc-start .fc-title { color: #50dc78; }
    .fc-end   .fc-title { color: #ff6464; }
    .fc-mid   .fc-title { color: #63d9ff; }

    .fc-btn-row { display: flex; gap: 4px; }
    .fc-btn {
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: 4px;
      color: var(--ed-text-faint);
      font-size: 9px;
      font-weight: 700;
      padding: 3px 6px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.12s;
    }
    .fc-btn:hover { background: rgba(99,217,255,0.1); color: var(--ed-text); }
    .fc-btn.fc-capture { border-color: rgba(255,200,80,0.3); color: #ffc850; }
    .fc-btn.fc-capture:hover { background: rgba(255,200,80,0.12); }
    .fc-btn.fc-remove { border-color: rgba(255,80,80,0.3); color: #ff6464; }
    .fc-btn.fc-remove:hover { background: rgba(255,80,80,0.12); }

    .fc-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 8px;
      padding: 0 8px 10px;
    }
    .fc-field { display: flex; flex-direction: column; gap: 4px; }
    .fc-field-label {
      font-size: 8px;
      color: var(--ed-text-faint);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .fc-field input {
      width: 100%;
      background: var(--ed-bg);
      border: 1px solid var(--ed-border);
      border-radius: 3px;
      color: var(--ed-text);
      font-size: 11px;
      padding: 6px 5px;
      height: 28px;
      box-sizing: border-box;
      font-family: inherit;
      outline: none;
      transition: border-color 0.12s;
      -moz-appearance: textfield;
      text-align: right;
    }
    .fc-field input::-webkit-inner-spin-button,
    .fc-field input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .fc-field input:focus { border-color: var(--ed-accent); }

    .fc-add-mid {
      width: 100%;
      background: var(--ed-bg);
      border: 1px dashed rgba(99,217,255,0.2);
      border-radius: 5px;
      color: var(--ed-text-faint);
      font-family: inherit;
      font-size: 10px;
      font-weight: 700;
      padding: 7px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      margin: 2px 0 6px;
    }
    .fc-add-mid:hover { color: #63d9ff; border-color: rgba(99,217,255,0.4); }

    .advanim-set-btn {
      width: 100%;
      background: linear-gradient(135deg, rgba(80,220,120,0.12) 0%, rgba(80,220,120,0.06) 100%);
      border: 1px solid rgba(80,220,120,0.35);
      border-radius: 5px;
      color: #50dc78;
      font-family: inherit;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 9px;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.15s, border-color 0.15s;
    }
    .advanim-set-btn:hover { background: linear-gradient(135deg, rgba(80,220,120,0.2) 0%, rgba(80,220,120,0.1) 100%); border-color: rgba(80,220,120,0.6); }
    .advanim-set-btn.applied { border-color: rgba(80,220,120,0.9); color: #80ffaa; }

    .advanim-playhead {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .advanim-playhead input[type=range] {
      flex: 1;
      accent-color: #ff9f63;
      cursor: pointer;
    }
    #shadow-fields input[type=range] {
      flex: 1;
      accent-color: var(--ed-accent);
      cursor: pointer;
    }
    .advanim-playhead-val {
      font-size: 9px;
      color: var(--ed-text-faint);
      width: 28px;
      text-align: right;
      flex-shrink: 0;
    }
    .advanim-play-btn {
      background: var(--ed-surface);
      border: 1px solid rgba(255,159,99,0.3);
      border-radius: 4px;
      color: #ff9f63;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      cursor: pointer;
      font-family: inherit;
    }
    .advanim-play-btn:hover { background: rgba(255,159,99,0.12); }
    .advanim-play-btn.playing { border-color: rgba(255,100,100,0.5); color: #ff6464; }

    .ph-page-select {
      flex: 1;
      min-width: 0;
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      color: var(--ed-text);
      font-size: 11px;
      font-family: inherit;
      padding: 0 6px;
      height: 26px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.12s;
    }
    .ph-page-select:focus { border-color: var(--ed-accent); }
    .ph-height-input {
      width: 68px;
      flex-shrink: 0;
      background: var(--ed-surface);
      border: 1px solid var(--ed-border);
      border-radius: var(--ed-radius-sm);
      color: var(--ed-text);
      font-size: 11px;
      font-family: inherit;
      padding: 0 4px 0 6px;
      height: 26px;
      text-align: right;
      outline: none;
      -moz-appearance: textfield;
      transition: border-color 0.12s;
    }
    .ph-height-input::-webkit-inner-spin-button,
    .ph-height-input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .ph-height-input:focus { border-color: var(--ed-accent); }

    @media (max-width: 720px) {
      :root { --ed-panel-width: min(calc(100vw - 24px), 360px); }
    }
  `;
  document.head.appendChild(s);
}