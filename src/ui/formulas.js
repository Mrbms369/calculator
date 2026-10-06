// src/ui/formulas.js
// Formulas panel — category chips + expandable formula cards.

import { FORMULAS, FORMULA_CATEGORIES, formulasByCategory } from '../engine/formulas.js';

const CATEGORY_KEYS = Object.keys(FORMULA_CATEGORIES);

export function mountFormulas(container) {
  container.innerHTML = `
    <div class="panel formulas-panel">
      <h2 class="panel-title">📐 Formulas</h2>

      <div class="formulas-cats">
        ${CATEGORY_KEYS.map((k, i) => `
          <button type="button" class="formulas-cat${i === 0 ? ' formulas-cat--active' : ''}" data-cat="${k}">
            <span class="formulas-cat-icon">${FORMULA_CATEGORIES[k].icon}</span>
            <span class="formulas-cat-label">${FORMULA_CATEGORIES[k].label}</span>
          </button>
        `).join('')}
      </div>

      <div class="formulas-list"></div>
    </div>
  `;

  const catsEl = container.querySelector('.formulas-cats');
  const listEl = container.querySelector('.formulas-list');

  let currentCat = CATEGORY_KEYS[0];
  let expandedId = null;

  function render() {
    const items = formulasByCategory(currentCat);
    listEl.innerHTML = items.map(f => {
      const isOpen = expandedId === f.id;
      return `
        <div class="formula-card${isOpen ? ' formula-card--open' : ''}" data-id="${f.id}">
          <button type="button" class="formula-head" data-toggle="${f.id}">
            <div class="formula-head-info">
              <div class="formula-name">${escapeHtml(f.name)}</div>
              <div class="formula-eq">${escapeHtml(f.formula)}</div>
            </div>
            <span class="formula-chevron">${isOpen ? '▾' : '▸'}</span>
          </button>
          <div class="formula-body">
            <div class="formula-desc">${escapeHtml(f.description)}</div>
            <div class="formula-inputs">
              ${f.inputs.map(inp => `
                <label class="formula-input-row">
                  <span class="formula-input-symbol">${escapeHtml(inp.symbol)}</span>
                  <input
                    type="text"
                    inputmode="decimal"
                    class="formula-input"
                    data-formula="${f.id}"
                    data-input="${inp.key}"
                    value="${escapeHtml(inp.default ?? '')}"
                  />
                  <span class="formula-input-label">${escapeHtml(inp.label)}</span>
                </label>
              `).join('')}
            </div>
            <div class="formula-actions">
              <button type="button" class="formula-compute" data-compute="${f.id}">Compute</button>
              <div class="formula-result" data-result="${f.id}"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  catsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.formulas-cat');
    if (!btn) return;
    currentCat = btn.dataset.cat;
    catsEl.querySelectorAll('.formulas-cat').forEach(b => {
      b.classList.toggle('formulas-cat--active', b.dataset.cat === currentCat);
    });
    expandedId = null;
    render();
  });

  listEl.addEventListener('click', (e) => {
    // Expand/collapse
    const toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      const id = toggle.dataset.toggle;
      expandedId = expandedId === id ? null : id;
      render();
      return;
    }

    // Compute
    const comp = e.target.closest('[data-compute]');
    if (comp) {
      const id = comp.dataset.compute;
      const f = FORMULAS.find(x => x.id === id);
      if (!f) return;

      const values = {};
      const inputs = listEl.querySelectorAll(`[data-formula="${CSS.escape(id)}"]`);
      for (const inp of inputs) {
        const key = inp.dataset.input;
        const raw = inp.value.trim();
        const n = raw === '' ? NaN : Number(raw);
        values[key] = n;
      }

      const resultEl = listEl.querySelector(`[data-result="${CSS.escape(id)}"]`);
      try {
        const out = f.compute(values);
        resultEl.textContent = `= ${out}`;
        resultEl.classList.remove('formula-result--error');
      } catch (err) {
        resultEl.textContent = err.message;
        resultEl.classList.add('formula-result--error');
      }
    }
  });

  // Initial render
  render();

  return {
    focus: () => {},
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}