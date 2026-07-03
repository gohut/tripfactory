export function injectPanelDOM() {
  const panel = document.createElement('div');
  panel.id = 'editor-panel';
  panel.innerHTML = `
    <div id="panel-header"></div>
    <div id="panel-tabs">
      <div class="ptab active" data-tab="elements">Elements</div>
      <div class="ptab" data-tab="props">Props</div>
      <div class="ptab" data-tab="add">Add</div>
    </div>
    <div id="panel-body">
      <div class="tab-pane active" id="tab-elements">
        <div class="psection">
          <div class="psection-head" style="cursor:default">
            <span class="psection-head-label">Page Elements</span>
          </div>
          <div class="psection-body">
            <div class="el-list" id="el-list"></div>
          </div>
        </div>
      </div>
      <div class="tab-pane" id="tab-props">
        <div id="no-selection" class="panel-empty-state">Click an element on the canvas to edit</div>
        <div id="props-body" style="display:none">
          <div class="psection">
            <div class="psection-head">
              <span class="psection-head-label">Identity</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <div class="prow">
                <span class="plabel">ID</span>
                <input class="pinput" id="prop-id" type="text" />
              </div>
              <div class="prow" id="prop-content-row">
                <span class="plabel" id="prop-content-label">Content</span>
                <input class="pinput" id="prop-content" type="text" />
              </div>
              <div class="prow" id="prop-options-row" style="display:none">
                <span class="plabel">Options</span>
                <input class="pinput" id="prop-options" type="text" placeholder="Option 1, Option 2, Option 3" />
              </div>
              <div class="prow" id="prop-font-row">
                <span class="plabel">Font Style</span>
                <input class="pinput" id="prop-font-path" type="text" placeholder="path/to/font.ttf (optional)" />
              </div>
              <div class="prow" id="prop-format-row">
                <div class="seg-control" id="text-format-seg">
                  <button class="seg-btn" data-fmt="bold" title="Bold" style="font-weight:800">B</button>
                  <button class="seg-btn" data-fmt="italic" title="Italic" style="font-style:italic">I</button>
                  <button class="seg-btn" data-fmt="underline" title="Underline" style="text-decoration:underline">U</button>
                  <button class="seg-btn" data-fmt="strike" title="Strikethrough" style="text-decoration:line-through">S</button>
                </div>
                <span style="flex:1"></span>
                <button type="button" class="panel-icon-btn" id="fontsize-dec" title="Decrease font size" style="font-size:11px;font-weight:700">A&#8722;</button>
                <input class="pinput" id="prop-fontsize-val" type="number" min="1" max="400" step="1" value="16" style="width:48px;flex:none;text-align:center;font-size:11px;padding:4px" />
                <button type="button" class="panel-icon-btn" id="fontsize-inc" title="Increase font size" style="font-size:11px;font-weight:700">A&#43;</button>
              </div>
              <div class="prow" id="prop-case-row" style="flex-wrap:wrap;row-gap:6px">
                <button type="button" class="paction muted case-btn" data-case="upper" style="flex:1 1 auto;margin:0;min-height:26px;padding:4px 6px;font-size:10px">UPPERCASE</button>
                <button type="button" class="paction muted case-btn" data-case="lower" style="flex:1 1 auto;margin:0;min-height:26px;padding:4px 6px;font-size:10px">lowercase</button>
                <button type="button" class="paction muted case-btn" data-case="capitalize" style="flex:1 1 auto;margin:0;min-height:26px;padding:4px 6px;font-size:10px">Capitalize Words</button>
                <button type="button" class="paction muted case-btn" data-case="camel" style="flex:1 1 auto;margin:0;min-height:26px;padding:4px 6px;font-size:10px">camelCase</button>
              </div>
              <div class="prow" id="prop-src-row" style="display:none">
                <span class="plabel">Src</span>
                <input class="pinput" id="prop-src" type="text" placeholder="https://…" />
              </div>
              <div class="prow" id="prop-href-row" style="display:none">
                <span class="plabel">Navigate</span>
                <select class="pselect" id="prop-navigate-page">
                  <option value="">— none —</option>
                </select>
              </div>
              <div class="prow" id="prop-navloc-row" style="display:none">
                <span class="plabel">Location</span>
                <select class="pselect" id="prop-navigate-location">
                  <option value="">— top of page —</option>
                </select>
              </div>
              <div class="prow" id="prop-navloc-capture-row" style="display:none">
                <span class="plabel"></span>
                <button type="button" class="advanim-set-btn" id="prop-navloc-capture-btn" style="width:100%;margin:0">+ Capture current scroll position</button>
              </div>
              <div class="prow" id="prop-navloc-speed-row" style="display:none">
                <span class="plabel">Scroll Speed</span>
                <input class="pinput" id="prop-navloc-speed" type="number" min="0.1" max="10" step="0.1" value="1" style="width:70px;flex:none;text-align:right" />
                <span style="font-size:10px;color:var(--ed-text-faint);flex-shrink:0">x</span>
              </div>
            </div>
          </div>
          <div class="psection">
            <div class="psection-head">
              <span class="psection-head-label">Position &amp; Size</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <div class="geom-grid">
                <div class="geom-cell"><label>X</label><input type="number" id="prop-x" /></div>
                <div class="geom-cell"><label>Y</label><input type="number" id="prop-y" /></div>
                <div class="geom-cell"><label>W</label><input type="number" id="prop-w" /></div>
                <div class="geom-cell"><label>H</label><input type="number" id="prop-h" /></div>
                <div class="geom-cell"><label>Rotate&#176;</label><input type="number" id="prop-rotation" step="1" value="0" /></div>
              </div>
            </div>
          </div>
          <div class="psection" id="section-colors">
            <div class="psection-head">
              <span class="psection-head-label">Color</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <div class="prow" id="row-bgcolor">
                <span class="plabel">BG</span>
                <div class="color-row">
                  <div class="color-swatch-wrap" id="swatch-bg">
                    <div class="color-swatch-preview" id="swatch-bg-preview"></div>
                    <input type="color" id="color-bg" />
                  </div>
                  <input class="color-hex" id="color-bg-hex" type="text" maxlength="400" placeholder="#000, rgba(), or linear-gradient()" />
                </div>
              </div>
              <div class="prow" id="row-textcolor">
                <span class="plabel">Text</span>
                <div class="color-row">
                  <div class="color-swatch-wrap" id="swatch-text">
                    <div class="color-swatch-preview" id="swatch-text-preview"></div>
                    <input type="color" id="color-text" />
                  </div>
                  <input class="color-hex" id="color-text-hex" type="text" maxlength="9" placeholder="#ffffff" />
                </div>
              </div>
              <div class="prow">
                <span class="plabel">Opacity</span>
                <input class="pinput" id="prop-opacity" type="number" min="0" max="1" step="0.05" style="width:60px;flex:none;text-align:right" />
              </div>
              <div class="ptoggle-row">
                <span class="ptoggle-label">Position Fixed</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="prop-position-fixed" />
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>
          </div>
          <div class="psection" id="section-border">
            <div class="psection-head">
              <span class="psection-head-label">Border &amp; Shadow</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <div class="ptoggle-row" id="row-border-toggle">
                <span class="ptoggle-label">Border</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="prop-border-enabled" />
                  <span class="toggle-track"></span>
                </label>
              </div>
              <div id="border-fields" style="display:none">
                <div class="prow">
                  <span class="plabel">Style</span>
                  <select class="pselect" id="prop-border-style">
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                </div>
                <div class="prow">
                  <span class="plabel">Width</span>
                  <input class="pinput" id="prop-border-width" type="number" min="0" max="40" step="1" style="width:70px;flex:none;text-align:right" />
                  <span style="font-size:10px;color:var(--ed-text-faint);flex-shrink:0">px</span>
                </div>
                <div class="prow" id="row-bordercolor">
                  <span class="plabel">Color</span>
                  <div class="color-row">
                    <div class="color-swatch-wrap" id="swatch-border">
                      <div class="color-swatch-preview" id="swatch-border-preview"></div>
                      <input type="color" id="color-border" />
                    </div>
                    <input class="color-hex" id="color-border-hex" type="text" maxlength="9" placeholder="#000000" />
                  </div>
                </div>
                <div class="prow">
                  <span class="plabel">Opacity</span>
                  <input class="pinput" id="prop-border-opacity" type="number" min="0" max="1" step="0.05" style="width:60px;flex:none;text-align:right" />
                </div>
              </div>
              <div class="ptoggle-row" style="margin-top:4px">
                <span class="ptoggle-label" id="shadow-toggle-label">Box Shadow</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="prop-shadow-enabled" />
                  <span class="toggle-track"></span>
                </label>
              </div>
              <div id="shadow-fields" style="display:none">
                <div class="prow" id="row-shadowcolor">
                  <span class="plabel">Color</span>
                  <div class="color-row">
                    <div class="color-swatch-wrap" id="swatch-shadow">
                      <div class="color-swatch-preview" id="swatch-shadow-preview"></div>
                      <input type="color" id="color-shadow" />
                    </div>
                    <input class="color-hex" id="color-shadow-hex" type="text" maxlength="9" placeholder="#000000" />
                  </div>
                </div>
                <div class="prow">
                  <span class="plabel">Intensity</span>
                  <input type="range" id="prop-shadow-intensity" min="0" max="100" step="1" style="flex:1" />
                  <span class="ptoggle-label" id="prop-shadow-intensity-val" style="width:32px;text-align:right;flex:none">50%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="psection" id="section-container-opts" style="display:none">
            <div class="psection-head">
              <span class="psection-head-label">Container</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <div class="prow" id="row-container-shape">
                <span class="plabel">Shape</span>
                <select class="pselect" id="prop-shape">
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
              <div class="prow" id="row-container-radius" style="display:none">
                <span class="plabel">Radius</span>
                <input class="pinput" id="prop-shape-radius" type="number" min="5" step="1" style="width:70px;flex:none;text-align:right" />
                <span style="font-size:10px;color:var(--ed-text-faint);flex-shrink:0">px</span>
              </div>
              <div class="prow">
                <span class="plabel">Overflow</span>
                <select class="pselect" id="prop-overflow">
                  <option value="">None (visible)</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
          </div>
          <div class="psection">
            <div class="psection-head">
              <span class="psection-head-label">Animate</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <div class="prow" style="align-items:flex-start">
                <div class="seg-control" id="anim-seg">
                  <button class="seg-btn" data-anim="none">Off</button>
                  <button class="seg-btn" data-anim="fadeIn">Fade</button>
                  <button class="seg-btn" data-anim="slideUp">↑</button>
                  <button class="seg-btn" data-anim="slideIn">→</button>
                  <button class="seg-btn" data-anim="zoomIn">Zoom</button>
                </div>
              </div>
              <div class="prow" id="anim-extra-row" style="display:none">
                <span class="plabel">Duration</span>
                <input class="pinput" id="prop-anim-duration" type="number" min="0.1" max="30" step="0.1" style="width:70px;flex:none;text-align:right" />
                <span style="font-size:10px;color:var(--ed-text-faint);flex-shrink:0">s</span>
                <span style="flex:1"></span>
                <span class="ptoggle-label" style="width:auto;flex:none">Loop</span>
                <label class="toggle-switch" style="margin-left:6px">
                  <input type="checkbox" id="prop-anim-loop" />
                  <span class="toggle-track"></span>
                </label>
              </div>
              <div class="ptoggle-row" id="anim-smooth-row" style="display:none;padding:0 0 2px">
                <span class="ptoggle-label" title="Plays the animation forward then in reverse, so a looping animation never snaps back to its start frame">Smooth</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="prop-anim-smooth" />
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>
              <div class="advanim-section" id="section-advanim">
                <div class="advanim-header" id="advanim-header">
                  <span class="advanim-title">&#9660; Advanced Animation</span>
                  <button class="advanim-toggle-btn" id="advanim-toggle">OFF</button>
                </div>
                <div class="advanim-body" id="advanim-body">
                  <div class="advanim-row">
                    <span class="advanim-label">Type</span>
                    <div class="advanim-type-group" id="advanim-type-group">
                      <button class="advanim-type-btn active" data-advtype="loop">Loop</button>
                      <button class="advanim-type-btn" data-advtype="once">Once</button>
                      <button class="advanim-type-btn" data-advtype="trigger">On Click</button>
                      <button class="advanim-type-btn" data-advtype="scroll">On Scroll</button>
                      <button class="advanim-type-btn" data-advtype="hover">On Hover</button>
                    </div>
                  </div>
                  <div class="ptoggle-row" style="padding:0 0 2px" id="advanim-smooth-row">
                    <span class="ptoggle-label" style="color:var(--ed-text-faint);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700" title="Loops the animation forward then in reverse so it never jumps back to the start frame">Smooth Loop</span>
                    <label class="toggle-switch">
                      <input type="checkbox" id="advanim-smooth-toggle" />
                      <span class="toggle-track"></span>
                    </label>
                  </div>
                  <div class="ptoggle-row" style="padding:0 0 2px" id="advanim-appear-row">
                    <span class="ptoggle-label" style="color:var(--ed-text-faint);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700">Animate When Appeared</span>
                    <label class="toggle-switch">
                      <input type="checkbox" id="advanim-appear-toggle" />
                      <span class="toggle-track"></span>
                    </label>
                  </div>
                  <div class="advanim-row" id="advanim-trigger-row" style="display:none">
                    <span class="advanim-label">Button</span>
                    <select class="pselect" id="advanim-trigger-btn">
                      <option value="">&#8212; select &#8212;</option>
                    </select>
                  </div>
                  <div class="advanim-row" id="advanim-hover-row" style="display:none">
                    <span class="advanim-label">Hover Over</span>
                    <select class="pselect" id="advanim-hover-el">
                      <option value="">This element — itself</option>
                    </select>
                  </div>
                  <div class="advanim-row">
                    <span class="advanim-label" id="advanim-speed-label">Speed</span>
                    <input class="pinput" id="advanim-speed" type="number" min="0.1" max="60" step="0.1" value="1.5" style="width:70px;flex:none;text-align:right" />
                    <span style="font-size:10px;color:var(--ed-text-faint);flex-shrink:0" id="advanim-speed-unit">s/cycle</span>
                    <span style="flex:1"></span>
                    <span class="advanim-label" id="advanim-delay-label" style="width:auto;flex:none">Delay</span>
                    <input class="pinput" id="advanim-delay" type="number" min="0" max="60" step="0.1" value="0" style="width:52px;flex:none;text-align:right;margin-left:6px" />
                    <span style="font-size:10px;color:var(--ed-text-faint);flex-shrink:0" id="advanim-delay-unit">s</span>
                  </div>
                  <div class="advanim-playhead">
                    <button class="advanim-play-btn" id="advanim-play-btn">&#9654;</button>
                    <input type="range" id="advanim-scrub" min="0" max="1" step="0.001" value="0" />
                    <span class="advanim-playhead-val" id="advanim-scrub-val">0%</span>
                  </div>
                  <div class="frame-list" id="advanim-frame-list"></div>
                  <button class="fc-add-mid" id="advanim-add-mid">+ Add Mid Frame</button>
                  <button class="advanim-set-btn" id="advanim-set-btn">&#9889; Set Animation</button>
                </div>
              </div>
          </div>
          <div class="psection media-opts-section" id="section-image-opts" style="display:none">
            <div class="psection-head">
              <span class="psection-head-label">Image Options</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <div class="prow">
                <span class="plabel">Fit</span>
                <select class="pselect" id="prop-object-fit" title="Cover/Contain/Fill scale the photo to match the box when you resize it. None and Scale Down keep the photo at its original resolution and only ever shrink it — never enlarge it — so the box can grow bigger than the visible photo.">
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                  <option value="scale-down">Scale Down</option>
                </select>
              </div>
            </div>
          </div>
          <div class="psection media-opts-section" id="section-video-opts" style="display:none">
            <div class="psection-head">
              <span class="psection-head-label">Video Options</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <div class="ptoggle-row">
                <span class="ptoggle-label">Disable Player</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="prop-video-noctrl" />
                  <span class="toggle-track"></span>
                </label>
              </div>
              <div class="prow">
                <span class="plabel">Play</span>
                <select class="pselect" id="prop-video-play-mode">
                  <option value="loop">Loop</option>
                  <option value="once">One Time</option>
                  <option value="button">Trigger by Button</option>
                  <option value="scroll">On Scroll</option>
                </select>
              </div>
              <div class="prow" id="prop-video-trigger-row" style="display:none">
                <span class="plabel">Button</span>
                <select class="pselect" id="prop-video-trigger-btn">
                  <option value="">-- select --</option>
                </select>
              </div>
              <div class="prow" id="prop-video-scroll-row" style="display:none">
                <span class="plabel">Speed</span>
                <input class="pinput" id="prop-video-scroll-speed" type="number" min="0.1" max="10" step="0.1" value="1" style="width:70px;flex:none;text-align:right" />
                <span style="font-size:10px;color:var(--ed-text-faint);flex-shrink:0">x</span>
                <span style="flex:1"></span>
                <span class="plabel" style="width:auto;flex:none">Delay</span>
                <input class="pinput" id="prop-video-scroll-delay" type="number" min="0" max="30" step="0.1" value="0" style="width:52px;flex:none;text-align:right;margin-left:6px" />
                <span style="font-size:10px;color:var(--ed-text-faint);flex-shrink:0">s</span>
              </div>
            </div>
          </div>
          <div class="psection">
            <div class="psection-head">
              <span class="psection-head-label">Actions</span>
              <span class="psection-head-arrow">▼</span>
            </div>
            <div class="psection-body">
              <button class="paction muted" id="btn-to-button">Convert to Button</button>
              <button class="paction muted" id="btn-group-sel">Wrap in Group</button>
              <button class="paction danger" id="btn-delete">Delete Element</button>
            </div>
          </div>
        </div>
      </div>
      <div class="tab-pane" id="tab-add">
        <div class="psection">
          <div class="psection-head" style="cursor:default">
            <span class="psection-head-label">Insert Element</span>
          </div>
          <div class="psection-body">
            <div class="add-grid">
              <button class="add-btn" data-add="container">Box</button>
              <button class="add-btn" data-add="text">Text</button>
              <button class="add-btn" data-add="image">Image</button>
              <button class="add-btn" data-add="video">Video</button>
              <button class="add-btn" data-add="audio">Audio</button>
              <button class="add-btn" data-add="button">Button</button>
            </div>
          </div>
        </div>
        <div class="psection">
          <div class="psection-head" style="cursor:default">
            <span class="psection-head-label">Form Elements</span>
          </div>
          <div class="psection-body">
            <div class="add-grid">
              <button class="add-btn" data-add="input">Input</button>
              <button class="add-btn" data-add="textarea">Textarea</button>
              <button class="add-btn" data-add="checkbox">Checkbox</button>
              <button class="add-btn" data-add="radio">Radio</button>
              <button class="add-btn" data-add="select">Select</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="save-section"></div>
  `;
  document.body.appendChild(panel);

  const ov = document.createElement('div');
  ov.id = 'drag-overlay';
  document.body.appendChild(ov);

  const toast = document.createElement('div');
  toast.id = 'panel-toast';
  document.body.appendChild(toast);
}

export function showToast(msg, ms = 2600) {
  const t = document.getElementById('panel-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

let _idc = Date.now();
export function genId(type) { return `${type}_${(++_idc).toString(36)}`; }

export function toHex(color) {
  if (!color) return '#000000';
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
  const d = document.createElement('div');
  d.style.color = color;
  document.body.appendChild(d);
  const cs = getComputedStyle(d).color;
  document.body.removeChild(d);
  const m = cs.match(/\d+/g);
  if (!m || m.length < 3) return '#000000';
  return '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
}

export function isValidColor(str) {
  const s = new Option().style;
  s.color = str;
  return s.color !== '';
}

// Like isValidColor, but for fields backing `background` (element BG, page
// BG): validates against the `background` shorthand instead of `color`, so
// it accepts everything a solid-color check does (#hex, rgb(), rgba(),
// hsl(), named colors) *plus* gradients (linear-gradient, radial-gradient,
// conic-gradient, and multi-stop/multi-layer combinations of these).
export function isValidBackground(str) {
  if (!str) return false;
  const s = new Option().style;
  s.background = str;
  return s.background !== '';
}