// src/ui/programmer.js
// Programmer calculator — bases, bitwise ops, bit view.

import {
  parseInBase, formatInBase, formatBinarySpaced, toBits, fromBits,
  toggleBit, applyOp, describeNumber,
} from '../engine/programmer.js';

const BASES = [
  { key: 10, label: 'DEC', prefix: '' },
  { key: 16, label: 'HEX', prefix: '0x' },
  { key: 2,  label: 'BIN', prefix: '0b' },
  { key: 8,  label: 'OCT', prefix: '0o' },
];

export function mountProgrammer(container) {
  container.innerHTML = `
    <div class="panel programmer-panel">
      <h2 class="panel-title">🕹️ Programmer</h2>

      <div class="prog-input-row">
        <input
          class="prog-input"
          type="text"
          spellcheck="false"
          autocomplete="off"
          value="255"
          aria-label="Input value"
        />
        <select class="prog-base-select" aria-label="Input base">
          ${BASES.map(b => `<option value="${b.key}"${b.key === 10 ? ' selected' : ''}>${b.label}</option>`).join('')}
        </select>
      </div>

      <div class="prog-bases">
        ${BASES.map(b => `
          <div class="prog-base-row">
            <span class="prog-base-label">${b.label}</span>
            <span class="prog-base-value" data-base-out="${b.key}">—</span>
            <button type="button" class="prog-copy" data-copy-base="${b.key}" title="Copy">⧉</button>
          </div>
        `).join('')}
      </div>

      <div class="prog-desc"></div>

      <div class="prog-bits-section">
        <div class="prog-bits-label">Bits (click to toggle)</div>
        <div class="prog-bits" data-bits></div>
      </div>

      <div class="prog-ops">
        <div class="prog-ops-label">Bitwise operations</div>
        <div class="prog-ops-grid">
          ${['AND','OR','XOR','NOT','LSHIFT','RSHIFT'].map(op => `
            <button type="button" class="prog-op-btn" data-op="${op}">${op}</button>
          `).join('')}
        </div>
        <div class="prog-op-inputs">
          <label>
            <span>A</span>
            <input class="prog-op-a" type="text" value="12" spellcheck="false" autocomplete="off" />
          </label>
          <label>
            <span>B</span>
            <input class="prog-op-b" type="text" value="10" spellcheck="false" autocomplete="off" />
          </label>
        </div>
        <div class="prog-op-result">
          <span class="prog-op-result-label">Result:</span>
          <span class="prog-op-result-value">—</span>
        </div>
      </div>
    </div>
  `;

  const inputEl   = container.querySelector('.prog-input');
  const baseSel   = container.querySelector('.prog-base-select');
  const descEl    = container.querySelector('.prog-desc');
  const bitsEl    = container.querySelector('.prog-bits');
  const opA       = container.querySelector('.prog-op-a');
  const opB       = container.querySelector('.prog-op-b');
  const opResult  = container.querySelector('.prog-op-result-value');

  let currentValue = 255;

  function updateAll(value) {
    currentValue = value >>> 0;

    // Base outputs
    for (const b of BASES) {
      const out = container.querySelector(`[data-base-out="${b.key}"]`);
      out.textContent = b.prefix + formatInBase(currentValue, b.key);
    }

    // Description
    const desc = describeNumber(currentValue);
    descEl.innerHTML = desc.map(d => `<span class="prog-tag">${escapeHtml(d)}</span>`).join('');

    // Bits
    renderBits();
  }

  function renderBits() {
    const bits = toBits(currentValue);
    bitsEl.innerHTML = bits.map((b, i) => {
      const idx = 31 - i;
      const group = i % 4 === 0 && i > 0 ? ' prog-bit-group-start' : '';
      return `<button type="button" class="prog-bit${b ? ' prog-bit--on' : ''}${group}" data-bit-index="${idx}" title="Bit ${idx}">${b}</button>`;
    }).join('');
  }

  function refreshFromInput() {
    const base = Number(baseSel.value);
    const n = parseInBase(inputEl.value, base);
    if (Number.isNaN(n)) {
      for (const b of BASES) {
        container.querySelector(`[data-base-out="${b.key}"]`).textContent = '—';
      }
      descEl.innerHTML = `<span class="prog-tag prog-tag--error">Invalid input</span>`;
      currentValue = 0;
      renderBits();
      return;
    }
    updateAll(n >>> 0);
  }

  // Events
  inputEl.addEventListener('input', refreshFromInput);
  baseSel.addEventListener('change', refreshFromInput);

  // Copy base
  container.querySelectorAll('[data-copy-base]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const base = Number(btn.dataset.copyBase);
      const b = BASES.find(x => x.key === base);
      const text = b.prefix + formatInBase(currentValue, base);
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = '⧉'; }, 1000);
      } catch {}
    });
  });

  // Toggle bits
  bitsEl.addEventListener('click', (e) => {
    const bit = e.target.closest('[data-bit-index]');
    if (!bit) return;
    const idx = Number(bit.dataset.bitIndex);
    const next = toggleBit(currentValue, idx);
    inputEl.value = formatInBase(next, Number(baseSel.value));
    updateAll(next);
  });

  // Ops
  container.querySelectorAll('[data-op]').forEach(btn => {
    btn.addEventListener('click', () => {
      const opName = btn.dataset.op;
      const base = Number(baseSel.value);
      const a = parseInBase(opA.value, base);
      const b = parseInBase(opB.value, base);
      if (Number.isNaN(a)) { opResult.textContent = 'A invalid'; return; }
      if (opName !== 'NOT' && Number.isNaN(b)) { opResult.textContent = 'B invalid'; return; }
      try {
        const r = applyOp(opName, a, Number.isNaN(b) ? 0 : b);
        opResult.textContent = `${r}  (0x${formatInBase(r, 16)} | 0b${formatInBase(r, 2)})`;
      } catch (err) {
        opResult.textContent = err.message;
      }
    });
  });

  // Initial render
  refreshFromInput();

  return {
    focus: () => inputEl.focus(),
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}