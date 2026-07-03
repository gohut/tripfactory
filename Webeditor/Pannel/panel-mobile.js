// panel-mobile.js
// Mobile view toggle logic — imported by panel-core.js
// Call: setupMobileMode(deps) where deps = { rerender }
// Returns: { applyMobileMode, getMobileMode }

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

      // Add a thin banner under the panel header so there's a constant reminder
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
          'letter-spacing:0.12em',
          'text-align:center',
          'padding:5px 0',
          'text-transform:uppercase',
          'flex-shrink:0',
        ].join(';');
        banner.textContent = '📱 Mobile Layout — changes only affect mobile';
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