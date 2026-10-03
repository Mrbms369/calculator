// src/ui/render.js
// Renders the calculator UI from state. Attaches button listeners.
// This file is "dumb" — it doesn't decide anything, it just paints.

const BUTTONS = [
  // Row 0 — scientific (Tier 3)
  { label: '√',   event: { type: 'UNARY', payload: '√' },       cls: 'sci' },
  { label: 'x²',  event: { type: 'UNARY', payload: 'x²' },      cls: 'sci' },
  { label: '1/x', event: { type: 'UNARY', payload: '1/x' },     cls: 'sci' },
  { label: 'π',   event: { type: 'CONSTANT', payload: 'π' },    cls: 'sci' },

  // Row 1: memory + clear
  { label: 'MC',  event: { type: 'MC' },        cls: 'mem' },
  { label: 'MR',  event: { type: 'MR' },        cls: 'mem' },
  { label: 'M+',  event: { type: 'M_PLUS' },    cls: 'mem' },
  { label: 'M−',  event: { type: 'M_MINUS' },   cls: 'mem' },
  { label: 'C',   event: { type: 'CLEAR' },     cls: 'fn'  },

  // Row 2: backspace + sign + percent + division
  { label: '⌫',   event: { type: 'BACKSPACE' }, cls: 'fn'  },
  { label: '±',   event: { type: 'SIGN' },      cls: 'fn'  },
  { label: '%',   event: { type: 'PERCENT' },   cls: 'fn'  },
  { label: '÷',   event: { type: 'OPERATOR', payload: '÷' }, cls: 'op' },

  // Row 3
  { label: '7',   event: { type: 'DIGIT', payload: '7' },   cls: 'num' },
  { label: '8',   event: { type: 'DIGIT', payload: '8' },   cls: 'num' },
  { label: '9',   event: { type: 'DIGIT', payload: '9' },   cls: 'num' },
  { label: '×',   event: { type: 'OPERATOR', payload: '×' }, cls: 'op' },

  // Row 4
  { label: '4',   event: { type: 'DIGIT', payload: '4' },   cls: 'num' },
  { label: '5',   event: { type: 'DIGIT', payload: '5' },   cls: 'num' },
  { label: '6',   event: { type: 'DIGIT', payload: '6' },   cls: 'num' },
  { label: '−',   event: { type: 'OPERATOR', payload: '-' }, cls: 'op' },

  // Row 5
  { label: '1',   event: { type: 'DIGIT', payload: '1' },   cls: 'num' },
  { label: '2',   event: { type: 'DIGIT', payload: '2' },   cls: 'num' },
  { label: '3',   event: { type: 'DIGIT', payload: '3' },   cls: 'num' },
  { label: '+',   event: { type: 'OPERATOR', payload: '+' }, cls: 'op' },

  // Row 6: 0 spans 2 columns, then dot, then equals
  { label: '0',   event: { type: 'DIGIT', payload: '0' },   cls: 'num span-2' },
  { label: '.',   event: { type: 'DOT' },                   cls: 'num' },
  { label: '=',   event: { type: 'EQUALS' },                cls: 'eq' },
];

/**
 * Build the entire calculator DOM into a container element.
 * @param {HTMLElement} root
 * @param {object} initialState
 * @param {(event: object) => void} onEvent  callback fired on any button press
 * @returns {{ update: (state: object) => void }}
 */
export function mount(root, initialState, onEvent) {
  root.innerHTML = `
    <div class="calculator">
      <h1 class="app-title">BMs Calculator</h1>
      <div class="display" role="status" aria-live="polite">
        <div class="history-preview" aria-hidden="true"></div>
        <div class="current-value">0</div>
      </div>
      <div class="keypad"></div>
      <aside class="history-panel" aria-label="Calculation history">
        <h3>History</h3>
        <ul class="history-list"></ul>
      </aside>
    </div>
  `;

  const keypad = root.querySelector('.keypad');
  const displayValue = root.querySelector('.current-value');
  const historyPreview = root.querySelector('.history-preview');
  const historyList = root.querySelector('.history-list');

  // Build the keypad buttons
  for (const btn of BUTTONS) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `btn ${btn.cls || ''}`;
    el.textContent = btn.label;
    el.dataset.label = btn.label;
    el.addEventListener('click', () => onEvent(btn.event));
    keypad.appendChild(el);
  }

  // ─── EVENT DELEGATION for the history list ──────────────────────────
  historyList.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-result]');
    if (!li) return;
    const value = li.dataset.result;
    onEvent({ type: 'RECALL_HISTORY', payload: value });
  });

  return {
    update(state) {
      displayValue.textContent = state.display;

      // Show preview of pending operation
      if ((state.state === 'OPERATOR_PENDING' || state.state === 'ENTERING_SECOND')
          && state.operand1 != null && state.operator) {
        historyPreview.textContent = `${state.operand1} ${state.operator}`;
      } else {
        historyPreview.textContent = '';
      }

      // Error state → red display
      displayValue.classList.toggle('error', state.state === 'ERROR');

      // Render history (newest first)
      historyList.innerHTML = state.history
        .slice()
        .reverse()
        .map(h => `
          <li data-result="${h.result}" role="button" tabindex="0" title="Click to reuse ${h.result}">
            <span class="expr">${h.expression}</span>
            <span class="res">= ${h.result}</span>
          </li>
        `)
        .join('');
    }
  };
}

/**
 * Flash the button whose label matches — used for keyboard feedback.
 * @param {HTMLElement} root
 * @param {string} label
 */
export function flashButton(root, label) {
  const btn = root.querySelector(`.btn[data-label="${CSS.escape(label)}"]`);
  if (!btn) return;
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 120);
}