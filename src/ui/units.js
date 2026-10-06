// src/ui/units.js
// Unit converter panel.

import { CATEGORIES } from '../engine/unitData.js';
import { convert, formatNumber } from '../engine/units.js';

const CATEGORY_KEYS = Object.keys(CATEGORIES);

/**
 * Mount the unit converter panel into a container.
 */
export function mountUnits(container) {
  container.innerHTML = `
    <div class="panel units-panel">
      <h2 class="panel-title">🎁 Unit Converter</h2>

      <div class="units-cats">
        ${CATEGORY_KEYS.map(k => `
          <button type="button" class="units-cat" data-cat="${k}">
            ${CATEGORIES[k].label}
          </button>
        `).join('')}
      </div>

      <div class="units-row">
        <div class="units-field">
          <label class="units-label">From</label>
          <select class="units-select units-from"></select>
        </div>
        <button type="button" class="units-swap" title="Swap units">⇄</button>
        <div class="units-field">
          <label class="units-label">To</label>
          <select class="units-select units-to"></select>
        </div>
      </div>

      <div class="units-row">
        <div class="units-field">
          <label class="units-label">Value</label>
          <input type="text" class="units-input" inputmode="decimal" value="1" />
        </div>
        <div class="units-field units-result-field">
          <label class="units-label">Result</label>
          <div class="units-result">—</div>
        </div>
      </div>

      <div class="units-hint">
        Conversion runs live as you type.
      </div>
    </div>
  `;

  const catsEl    = container.querySelector('.units-cats');
  const fromSel   = container.querySelector('.units-from');
  const toSel     = container.querySelector('.units-to');
  const inputEl   = container.querySelector('.units-input');
  const resultEl  = container.querySelector('.units-result');
  const swapBtn   = container.querySelector('.units-swap');

  let currentCat = 'length';

  function populateUnits() {
    const cat = CATEGORIES[currentCat];
    const unitKeys = Object.keys(cat.units);
    fromSel.innerHTML = unitKeys.map(u => `<option value="${u}">${cat.units[u].label} (${u})</option>`).join('');
    toSel.innerHTML = fromSel.innerHTML;
    // Choose sensible defaults: first vs second unit (or same)
    fromSel.value = unitKeys[0];
    toSel.value = unitKeys[1] || unitKeys[0];
  }

  function update() {
    try {
      const raw = inputEl.value.trim();
      const n = raw === '' ? NaN : Number(raw);
      if (!Number.isFinite(n)) {
        resultEl.textContent = '—';
        resultEl.classList.remove('units-result-error');
        return;
      }
      const out = convert(currentCat, fromSel.value, toSel.value, n);
      resultEl.textContent = formatNumber(out);
      resultEl.classList.remove('units-result-error');
    } catch (err) {
      resultEl.textContent = err.message;
      resultEl.classList.add('units-result-error');
    }
  }

  catsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.units-cat');
    if (!btn) return;
    currentCat = btn.dataset.cat;
    catsEl.querySelectorAll('.units-cat').forEach(b => {
      b.classList.toggle('units-cat--active', b.dataset.cat === currentCat);
    });
    populateUnits();
    update();
  });

  fromSel.addEventListener('change', update);
  toSel.addEventListener('change', update);
  inputEl.addEventListener('input', update);

  swapBtn.addEventListener('click', () => {
    const f = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = f;
    update();
  });

  // Initial state
  catsEl.querySelector('.units-cat').classList.add('units-cat--active');
  populateUnits();
  update();

  return {
    focus: () => inputEl.focus(),
  };
}