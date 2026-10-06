// src/ui/graph.js
// Graph mode — plots a function y = f(x) on a canvas.

import { compileFunction, sampleFunction, robustYRange } from '../engine/graphMath.js';

const X_MIN_DEFAULT = -10;
const X_MAX_DEFAULT = 10;

export function mountGraph(container) {
  container.innerHTML = `
    <div class="panel graph-panel">
      <h2 class="panel-title">📊 Graph</h2>
      <div class="graph-controls">
        <label for="graph-input" class="graph-label">y =</label>
        <input
          id="graph-input"
          class="graph-input"
          type="text"
          value="sin(x)"
          spellcheck="false"
          autocomplete="off"
          placeholder="e.g. sin(x), x^2 - 3, 2sin(x), 1/x"
        />
        <button type="button" class="graph-btn graph-btn--plot">Plot</button>
      </div>
      <div class="graph-hint">
        <strong>Try:</strong>
        <code>x^2</code> <code>2x+1</code> <code>2sin(x)</code> <code>sin(x)cos(x)</code>
        <code>1/x</code> <code>tan(x)</code> <code>sqrt(x)</code> <code>log(x)</code>
        <code>exp(-x^2)</code> <code>3(x+1)</code> <code>(x+1)(x-1)</code>
      </div>
      <div class="graph-canvas-wrap">
        <canvas class="graph-canvas" width="600" height="400"></canvas>
        <div class="graph-error" hidden></div>
      </div>
      <div class="graph-actions">
        <button type="button" class="graph-btn" data-zoom="in">Zoom +</button>
        <button type="button" class="graph-btn" data-zoom="out">Zoom −</button>
        <button type="button" class="graph-btn" data-zoom="reset">Reset</button>
        <span class="graph-range"></span>
      </div>
    </div>
  `;

  const input    = container.querySelector('.graph-input');
  const plotBtn  = container.querySelector('.graph-btn--plot');
  const canvas   = container.querySelector('.graph-canvas');
  const errEl    = container.querySelector('.graph-error');
  const rangeEl  = container.querySelector('.graph-range');
  const ctx      = canvas.getContext('2d');

  let xMin = X_MIN_DEFAULT;
  let xMax = X_MAX_DEFAULT;
  let currentFn = null;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function plot() {
    errEl.hidden = true;
    const src = input.value.trim();
    if (!src) { currentFn = null; drawEmpty(); return; }

    try {
      currentFn = compileFunction(src);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.hidden = false;
      currentFn = null;
      drawEmpty();
      return;
    }

    resizeCanvas();
    draw();
  }

  function drawEmpty() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h, 0, 1);
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    if (!currentFn) { drawEmpty(); return; }

    const samples = Math.max(400, Math.floor(w * 2));
    const pts = sampleFunction(currentFn, xMin, xMax, samples);

    const { yMin, yMax } = robustYRange(pts, 0.05);

    rangeEl.textContent = `x: [${xMin.toFixed(1)}, ${xMax.toFixed(1)}]  •  y: [${yMin.toFixed(2)}, ${yMax.toFixed(2)}]`;

    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h, yMin, yMax);

    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#ff9500';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let drawing = false;
    ctx.beginPath();
    let prevY = null;
    for (const p of pts) {
      if (!Number.isFinite(p.y)) { drawing = false; prevY = null; continue; }
      const px = mapX(p.x, xMin, xMax, 0, w);
      const py = mapY(p.y, yMin, yMax, h, 0);
      if (prevY != null && Math.abs(py - prevY) > h * 1.5) drawing = false;
      const clamped = Math.max(-h * 3, Math.min(h * 4, py));
      if (!drawing) { ctx.moveTo(px, clamped); drawing = true; }
      else { ctx.lineTo(px, clamped); }
      prevY = py;
    }
    ctx.stroke();
  }

  function drawGrid(w, h, yMin, yMax) {
    const isDark = document.documentElement.dataset.theme !== 'light';
    const gridColor  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const axisColor  = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    const labelColor = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.5)';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    const xStep = niceStep(xMin, xMax, 10);
    const firstX = Math.ceil(xMin / xStep) * xStep;
    ctx.fillStyle = labelColor;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let xv = firstX; xv <= xMax; xv += xStep) {
      const px = mapX(xv, xMin, xMax, 0, w);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
      ctx.fillText(formatTick(xv), px, h - 14);
    }

    const yStep = niceStep(yMin, yMax, 8);
    const firstY = Math.ceil(yMin / yStep) * yStep;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let yv = firstY; yv <= yMax; yv += yStep) {
      const py = mapY(yv, yMin, yMax, h, 0);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
      ctx.fillText(formatTick(yv), 4, py - 6);
    }

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    if (xMin <= 0 && xMax >= 0) {
      const x0 = mapX(0, xMin, xMax, 0, w);
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, h); ctx.stroke();
    }
    if (yMin <= 0 && yMax >= 0) {
      const y0 = mapY(0, yMin, yMax, h, 0);
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke();
    }
  }

  function mapX(xv, x0, x1, p0, p1) { return p0 + ((xv - x0) / (x1 - x0)) * (p1 - p0); }
  function mapY(yv, y0, y1, p0, p1) { return p0 + ((yv - y0) / (y1 - y0)) * (p1 - p0); }

  function niceStep(min, max, target) {
    const raw = (max - min) / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    let nice;
    if (norm < 1.5) nice = 1;
    else if (norm < 3) nice = 2;
    else if (norm < 7) nice = 5;
    else nice = 10;
    return nice * mag;
  }

  function formatTick(v) {
    if (Math.abs(v) < 1e-9) return '0';
    if (Math.abs(v) >= 1000 || Math.abs(v) < 0.01) return v.toExponential(0);
    return Number(v.toFixed(2)).toString();
  }

  plotBtn.addEventListener('click', plot);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); plot(); }
  });

  container.querySelectorAll('[data-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.zoom;
      const span = xMax - xMin;
      if (mode === 'in') { xMin += span * 0.15; xMax -= span * 0.15; }
      else if (mode === 'out') { xMin -= span * 0.15; xMax += span * 0.15; }
      else if (mode === 'reset') { xMin = X_MIN_DEFAULT; xMax = X_MAX_DEFAULT; }
      plot();
    });
  });

  const resizeObserver = new ResizeObserver(() => {
    if (currentFn) { resizeCanvas(); draw(); }
    else { resizeCanvas(); drawEmpty(); }
  });
  resizeObserver.observe(canvas);

  requestAnimationFrame(() => { resizeCanvas(); plot(); });

  return {
    refresh: () => { if (currentFn) plot(); },
    focus: () => input.focus(),
  };
}