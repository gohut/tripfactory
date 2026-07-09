// panel-mobile.js
// Mobile view toggle logic — imported by panel-core.js
// Call: setupMobileMode(deps) where deps = { rerender }
// Returns: { applyMobileMode, getMobileMode }

import { showToast } from './panel-dom.js';

export function setupMobileMode({ rerender }) {
  const MOBILE_W = window.MOBILE_CANVAS_WIDTH || 390;
  let _mobileMode = false;

  // ─── Mobile-view overlay + toggle ───────────────────────────────────────────
  // Creates (or reuses) a dashed overlay box in #canvas that visually represents
  // the 390 px mobile viewport. The overlay is purely decorative; elements are
  // dragged freely on the full canvas but their positions are saved into
  // layouts.mobile independently of layouts.desktop.

  function getMobileOverlay() {
    let ov = document.getElementById('mobile-frame-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'mobile-frame-overlay';
      // Centered dashed frame — matches the red-box style in the reference screenshot
      ov.style.cssText = [
        'position:absolute',
        'top:0',
        `width:${MOBILE_W}px`,
        'bottom:0',
        // Center it horizontally inside whatever canvas width is set
        'left:50%',
        'transform:translateX(-50%)',
        'border:2px dashed rgba(255,80,80,0.75)',
        'border-radius:4px',
        'pointer-events:none',
        'z-index:9998',
        'box-sizing:border-box',
        'box-shadow:inset 0 0 0 1px rgba(255,80,80,0.10), 0 0 0 9999px rgba(0,0,0,0.10)',
      ].join(';');

      // Top label badge
      const label = document.createElement('div');
      label.style.cssText = [
        'position:absolute',
        'top:8px',
        'left:50%',
        'transform:translateX(-50%)',
        'background:rgba(18,22,34,0.88)',
        'border:1px solid rgba(255,80,80,0.45)',
        'border-radius:20px',
        'padding:3px 12px',
        'font-size:10px',
        'font-weight:700',
        'letter-spacing:0.1em',
        'color:rgba(255,120,120,0.95)',
        'white-space:nowrap',
        'pointer-events:none',
        'font-family:system-ui,sans-serif',
      ].join(';');
      label.textContent = `📱 MOBILE  ${MOBILE_W}px`;
      ov.appendChild(label);

      // Bottom width indicator
      const ruler = document.createElement('div');
      ruler.style.cssText = [
        'position:absolute',
        'bottom:8px',
        'left:50%',
        'transform:translateX(-50%)',
        'background:rgba(18,22,34,0.70)',
        'border:1px solid rgba(255,80,80,0.3)',
        'border-radius:12px',
        'padding:2px 10px',
        'font-size:9px',
        'font-weight:700',
        'letter-spacing:0.08em',
        'color:rgba(255,120,120,0.7)',
        'white-space:nowrap',
        'pointer-events:none',
        'font-family:system-ui,sans-serif',
      ].join(';');
      ruler.textContent = `← ${MOBILE_W}px →`;
      ov.appendChild(ruler);
    }
    return ov;
  }

  // Inserts (or re-inserts) the dashed mobile-frame overlay into #canvas and
  // keeps its height synced. Safe to call repeatedly/idempotently — it's the
  // single source of truth for "is the overlay actually in the DOM right
  // now", which matters because #canvas gets its innerHTML wiped and
  // rebuilt on every rerender() (page switch, add/delete element, undo,
  // etc.), silently detaching whatever was appended into it before —
  // including this overlay. So rather than inserting it once and hoping it
  // survives, we re-insert it after every rebuild via window._reapplyMobileFrame.
  function ensureOverlayInCanvas() {
    if (!_mobileMode) return;
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ov = getMobileOverlay();
    if (ov.parentNode !== canvas) canvas.appendChild(ov);
    ov.style.height = canvas.scrollHeight + 'px';
    if (!ov._resizeObs) {
      ov._resizeObs = new ResizeObserver(() => {
        const ov2 = document.getElementById('mobile-frame-overlay');
        const c = document.getElementById('canvas');
        if (ov2 && c) ov2.style.height = c.scrollHeight + 'px';
      });
    }
    ov._resizeObs.observe(canvas);
  }
  // main.js calls this at the end of every renderPage() pass, so the
  // overlay reliably survives canvas rebuilds instead of vanishing after
  // the first one.
  window._reapplyMobileFrame = ensureOverlayInCanvas;

  // ─── Copy Desktop state into Mobile, on demand ──────────────────────────
  // By default, a newly-added element's mobile layout is just a one-time
  // clone of whatever its desktop layout was at the moment it was created
  // (see migrateElement in main.js) — it never automatically re-syncs after
  // that. So any desktop-side redesigning done afterwards (moving things,
  // resizing, regrouping) never reaches mobile, and mobile keeps showing
  // that original "just spawned" state instead of the current desktop one.
  // That's expected — mobile is meant to be laid out independently — but it
  // means starting a mobile pass from scratch is the only option today.
  // This gives an explicit, opt-in way to instead start mobile from
  // *today's* desktop state: for every element, copy its current desktop
  // x/y/w/h/rotation/scale/styles/etc. over its mobile ones. Whether the
  // parent/child (grouping) structure is included is the caller's choice —
  // it's the one part of "desktop state" that reshapes the element tree
  // itself rather than just how things look, so it's kept as a separate,
  // opt-in flag rather than always bundled in.
  // Per-mode visibility (`hidden`, the eye toggle) is deliberately never
  // copied — that's meant to differ between desktop/mobile by design.
  function syncFromDesktop(includeGrouping) {
    const keys = (window._LAYOUT_KEYS || []).filter(k => {
      if (k === 'hidden') return false;
      if (!includeGrouping && (k === 'parent' || k === 'children')) return false;
      return true;
    });
    const els = (window.pageData && window.pageData.elements) || [];
    els.forEach(el => {
      if (!el.layouts || !el.layouts.desktop || !el.layouts.mobile) return;
      keys.forEach(k => {
        if (k in el.layouts.desktop) {
          el.layouts.mobile[k] = JSON.parse(JSON.stringify(el.layouts.desktop[k]));
        }
      });
    });
    rerender();
    showToast(includeGrouping ? 'Copied desktop layout + grouping to mobile' : 'Copied desktop layout to mobile');
  }

  function applyMobileMode(active) {
    _mobileMode = active;
    const btn = document.getElementById('panel-mobile-btn');
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    if (active) {
      // Tell main.js to read/write layouts.mobile from now on
      window._setLayoutMode('mobile');

      if (btn) {
        btn.style.background = 'rgba(255,80,80,0.15)';
        btn.style.border = '1px solid rgba(255,80,80,0.5)';
        btn.title = 'Exit mobile view (currently editing mobile layout)';
      }

      // Add a thin banner under the panel header so there's a constant reminder,
      // plus two buttons to pull the current desktop state into mobile on demand.
      let banner = document.getElementById('mobile-mode-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'mobile-mode-banner';
        banner.style.cssText = [
          'background:rgba(99,217,255,0.1)',
          'border-bottom:1px solid rgba(99,217,255,0.25)',
          'color:rgba(99,217,255,0.9)',
          'font-size:9px',
          'font-weight:700',
          'letter-spacing:0.05em',
          'text-align:center',
          'padding:5px 8px',
          'text-transform:uppercase',
          'flex-shrink:0',
          'display:flex',
          'flex-wrap:wrap',
          'align-items:center',
          'justify-content:center',
          'gap:6px',
        ].join(';');

        const label = document.createElement('span');
        label.textContent = '📱 Mobile Layout';
        banner.appendChild(label);

        const btnStyle = [
          'background:rgba(99,217,255,0.12)',
          'border:1px solid rgba(99,217,255,0.4)',
          'border-radius:10px',
          'color:rgba(99,217,255,0.95)',
          'font-size:9px',
          'font-weight:700',
          'letter-spacing:0.05em',
          'text-transform:none',
          'padding:3px 8px',
          'cursor:pointer',
        ].join(';');

        const btnLayout = document.createElement('button');
        btnLayout.type = 'button';
        btnLayout.style.cssText = btnStyle;
        btnLayout.textContent = 'Copy Desktop → Mobile';
        btnLayout.title = 'Start mobile from the current desktop layout (position/size/style) — leaves grouping as-is';
        btnLayout.addEventListener('click', () => {
          if (confirm('Overwrite the mobile layout (position, size, style, etc.) with the current desktop layout? This does not change grouping.')) {
            syncFromDesktop(false);
          }
        });

        const btnLayoutGroup = document.createElement('button');
        btnLayoutGroup.type = 'button';
        btnLayoutGroup.style.cssText = btnStyle;
        btnLayoutGroup.textContent = 'Copy Desktop → Mobile (+ Grouping)';
        btnLayoutGroup.title = 'Start mobile from the current desktop layout AND grouping structure';
        btnLayoutGroup.addEventListener('click', () => {
          if (confirm('Overwrite the mobile layout AND grouping structure with the current desktop state? Any mobile-only grouping will be lost.')) {
            syncFromDesktop(true);
          }
        });

        banner.append(btnLayout, btnLayoutGroup);
        const panelEl = document.getElementById('editor-panel');
        const body = document.getElementById('panel-body');
        if (panelEl && body) panelEl.insertBefore(banner, body);
      }
    } else {
      // Restore desktop mode
      window._setLayoutMode('desktop');

      const ov = document.getElementById('mobile-frame-overlay');
      if (ov) {
        if (ov._resizeObs) ov._resizeObs.disconnect();
        ov.remove();
      }
      const banner = document.getElementById('mobile-mode-banner');
      if (banner) banner.remove();

      if (btn) {
        btn.style.background = '';
        btn.style.border = '';
        btn.title = 'Toggle mobile view';
      }
    }

    // Re-render and rebuild list so hidden flags / positions reflect new mode.
    // renderPage() wipes and rebuilds #canvas's contents, so it calls
    // window._reapplyMobileFrame() itself at the end to put the overlay
    // back — no need to insert it here beforehand.
    rerender();
  }

  // Wire the button once the DOM is ready (deferred because header is just now injected)
  // ─── End mobile-view toggle ──────────────────────────────────────────────────

  return { applyMobileMode, getMobileMode: () => _mobileMode };
}