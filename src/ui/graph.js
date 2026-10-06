// src/ui/graph.js
// Graph mode — plots a function y = f(x) on a canvas.

import { compileFunction, sampleFunction } from '../engine/graphMath.js';

const X_MIN_DEFAULT = -10;
const X_MAX_DEFAULT = 10;

/**
 * Mount the graph panel into a container.
 * @param {HTMLElement} container
 * @returns {{ refresh: () => void, focus: () => void }}
 */
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
          value="x^2 - 3"
          spellcheck="false"
          autocomplete="off"
          placeholder="e.g. sin(x), x^2 - 3, 2*x + 1"
        />
        <button type="button" class="graph-btn graph-btn--plot">Plot</button>
      </div>
      <div class="graph-hint">
        Supported: <code>sin cos tan sqrt abs exp log ln ^ PI</code> — use <code>x</code> as the variable.
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
    if (!src) {
      currentFn = null;
      drawEmpty();
      return;
    }

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
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h, 0, 1);
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    if (!currentFn) { drawEmpty(); return; }

    // Sample
    const samples = Math.max(200, Math.floor(w));
    const pts = sampleFunction(currentFn, xMin, xMax, samples);

    // Determine y-range from finite points (with padding)
    const finite = pts.filter(p => Number.isFinite(p.y));
    let yMin, yMax;
    if (finite.length === 0) {
      yMin = -10; yMax = 10;
    } else {
      yMin = Math.min(...finite.map(p => p.y));
      yMax = Math.max(...finite.map(p => p.y));
      if (yMin === yMax) { yMin -= 1; yMax += 1; }
      const pad = (yMax - yMin) * 0.1;
      yMin -= pad; yMax += pad;
    }

    // Update range readout
    rangeEl.textContent = `x: [${xMin.toFixed(1)}, ${xMax.toFixed(1)}]  •  y: [${yMin.toFixed(2)}, ${yMax.toFixed(2)}]`;

    // Clear + grid
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h, yMin, yMax);

    // Plot the curve, splitting on NaN gaps
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#ff9500';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let drawing = false;
    ctx.beginPath();
    for (const p of pts) {
      if (!Number.isFinite(p.y)) {
        drawing = false;
        continue;
      }
      const px = mapX(p.x, xMin, xMax, 0, w);
      const py = mapY(p.y, yMin, yMax, h, 0);
      const clamped = Math.max(-h * 5, Math.min(h * 6, py));
      if (!drawing) {
        ctx.moveTo(px, clamped);
        drawing = true;
      } else {
        ctx.lineTo(px, clamped);
      }
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

    // Vertical gridlines
    const xStep = niceStep(xMin, xMax, 10);
    const firstX = Math.ceil(xMin / xStep) * xStep;
    ctx.fillStyle = labelColor;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let xv = firstX; xv <= xMax; xv += xStep) {
      const px = mapX(xv, xMin, xMax, 0, w);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
      ctx.fillText(formatTick(xv), px, h - 14);
    }

    // Horizontal gridlines
    const yStep = niceStep(yMin, yMax, 8);
    const firstY = Math.ceil(yMin / yStep) * yStep;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let yv = firstY; yv <= yMax; yv += yStep) {
      const py = mapY(yv, yMin, yMax, h, 0);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
      ctx.fillText(formatTick(yv), 4, py - 6);
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    if (xMin <= 0 && xMax >= 0) {
      const x0 = mapX(0, xMin, xMax, 0, w);
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0, h);
      ctx.stroke();
    }
    if (yMin <= 0 && yMax >= 0) {
      const y0 = mapY(0, yMin, yMax, h, 0);
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(w, y0);
      ctx.stroke();
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

  // ─── Events ────────────────────────────────────────────────────────
  plotBtn.addEventListener('click', plot);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      plot();
    }
  });

  container.querySelectorAll('[data-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.zoom;
      const span = xMax - xMin;
      if (mode === 'in') {
        xMin += span * 0.15;
        xMax -= span * 0.15;
      } else if (mode === 'out') {
        xMin -= span * 0.15;
        xMax += span * 0.15;
      } else if (mode === 'reset') {
        xMin = X_MIN_DEFAULT;
        xMax = X_MAX_DEFAULT;
      }
      plot();
    });
  });

  // Handle canvas resize
  const resizeObserver = new ResizeObserver(() => {
    if (currentFn) { resizeCanvas(); draw(); }
    else { resizeCanvas(); drawEmpty(); }
  });
  resizeObserver.observe(canvas);

  // Initial draw
  requestAnimationFrame(() => {
    resizeCanvas();
    plot();
  });

  return {
    refresh: () => { if (currentFn) plot(); },
    focus: () => input.focus(),
  };
}