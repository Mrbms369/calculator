// src/ui/render.js
// Renders the calculator UI from state.

const BUTTONS = [
  { label: '√',   event: { type: 'UNARY', payload: '√' },       cls: 'sci' },
  { label: 'x²',  event: { type: 'UNARY', payload: 'x²' },      cls: 'sci' },
  { label: '1/x', event: { type: 'UNARY', payload: '1/x' },     cls: 'sci' },
  { label: 'π',   event: { type: 'CONSTANT', payload: 'π' },    cls: 'sci' },

  { label: 'MC',  event: { type: 'MC' },        cls: 'mem' },
  { label: 'MR',  event: { type: 'MR' },        cls: 'mem' },
  { label: 'M+',  event: { type: 'M_PLUS' },    cls: 'mem' },
  { label: 'M−',  event: { type: 'M_MINUS' },   cls: 'mem' },
  { label: 'C',   event: { type: 'CLEAR' },     cls: 'fn'  },

  { label: '⌫',   event: { type: 'BACKSPACE' }, cls: 'fn'  },
  { label: '±',   event: { type: 'SIGN' },      cls: 'fn'  },
  { label: '%',   event: { type: 'PERCENT' },   cls: 'fn'  },
  { label: '÷',   event: { type: 'OPERATOR', payload: '÷' }, cls: 'op' },

  { label: '7',   event: { type: 'DIGIT', payload: '7' },   cls: 'num' },
  { label: '8',   event: { type: 'DIGIT', payload: '8' },   cls: 'num' },
  { label: '9',   event: { type: 'DIGIT', payload: '9' },   cls: 'num' },
  { label: '×',   event: { type: 'OPERATOR', payload: '×' }, cls: 'op' },

  { label: '4',   event: { type: 'DIGIT', payload: '4' },   cls: 'num' },
  { label: '5',   event: { type: 'DIGIT', payload: '5' },   cls: 'num' },
  { label: '6',   event: { type: 'DIGIT', payload: '6' },   cls: 'num' },
  { label: '−',   event: { type: 'OPERATOR', payload: '-' }, cls: 'op' },

  { label: '1',   event: { type: 'DIGIT', payload: '1' },   cls: 'num' },
  { label: '2',   event: { type: 'DIGIT', payload: '2' },   cls: 'num' },
  { label: '3',   event: { type: 'DIGIT', payload: '3' },   cls: 'num' },
  { label: '+',   event: { type: 'OPERATOR', payload: '+' }, cls: 'op' },

  { label: '0',   event: { type: 'DIGIT', payload: '0' },   cls: 'num span-2' },
  { label: '.',   event: { type: 'DOT' },                   cls: 'num' },
  { label: '=',   event: { type: 'EQUALS' },                cls: 'eq' },
];

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDayHeader(dayTs) {
  const today = startOfDay(Date.now());
  const yesterday = today - 24 * 60 * 60 * 1000;
  if (dayTs === today) return 'Today';
  if (dayTs === yesterday) return 'Yesterday';
  const d = new Date(dayTs);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = d.getFullYear();
  const thisYear = new Date().getFullYear();
  return year === thisYear
    ? `${monthNames[d.getMonth()]} ${d.getDate()}`
    : `${monthNames[d.getMonth()]} ${d.getDate()}, ${year}`;
}

function groupByDay(history) {
  const buckets = new Map();
  for (const entry of history) {
    const dayTs = startOfDay(entry.ts ?? Date.now());
    if (!buckets.has(dayTs)) buckets.set(dayTs, []);
    buckets.get(dayTs).push(entry);
  }
  return Array.from(buckets.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([dayTs, entries]) => ({
      dayTs,
      label: formatDayHeader(dayTs),
      entries: entries.slice().reverse(),
    }));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function mount(root, initialState, onEvent) {
  root.innerHTML = `
    <div class="calculator">
      <h1 class="app-title">BMs Calculator</h1>
      <div class="display" role="status" aria-live="polite" tabindex="0" title="Click or press any key to type an expression">
        <div class="history-preview" aria-hidden="true"></div>
        <div class="current-value" contenteditable="true" spellcheck="false" inputmode="text">0</div>
      </div>
      <div class="keypad"></div>
      <aside class="history-panel" aria-label="Calculation history">
        <header class="history-header">
          <h3>History</h3>
          <div class="history-actions">
            <button type="button" class="history-clear" data-scope="today">Today</button>
            <button type="button" class="history-clear" data-scope="all">All</button>
          </div>
        </header>
        <ul class="history-list"></ul>
      </aside>
    </div>
  `;

  const keypad          = root.querySelector('.keypad');
  const displayValue    = root.querySelector('.current-value');
  const historyPreview  = root.querySelector('.history-preview');
  const historyList     = root.querySelector('.history-list');
  const historyActions  = root.querySelector('.history-actions');
  const displayEl       = root.querySelector('.display');

  for (const btn of BUTTONS) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `btn ${btn.cls || ''}`;
    el.textContent = btn.label;
    el.dataset.label = btn.label;
    el.addEventListener('click', () => onEvent(btn.event));
    keypad.appendChild(el);
  }

  historyActions.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-scope]');
    if (!btn) return;
    if (btn.dataset.scope === 'today') onEvent({ type: 'CLEAR_HISTORY_TODAY' });
    else if (btn.dataset.scope === 'all') onEvent({ type: 'CLEAR_HISTORY' });
  });

  historyList.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-result]');
    if (!li) return;
    onEvent({ type: 'RECALL_HISTORY', payload: li.dataset.result });
  });

  // ─── Expression mode wiring ─────────────────────────────────────────
  let isExpressionMode = false;
  let suppressInputEvent = false;

  displayValue.addEventListener('focus', () => {
    if (!isExpressionMode) {
      isExpressionMode = true;
      onEvent({ type: 'EXPRESSION_INPUT' });
    }
  });

  displayValue.addEventListener('input', () => {
    if (suppressInputEvent) return;
    onEvent({ type: 'EXPRESSION_INPUT', payload: displayValue.textContent || '' });
  });

  displayValue.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEvent({ type: 'EXPRESSION_EVAL' });
      isExpressionMode = false;
      displayValue.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEvent({ type: 'CLEAR' });
      isExpressionMode = false;
      displayValue.blur();
    }
  });

  displayValue.addEventListener('blur', () => {
    isExpressionMode = false;
  });

  displayEl.addEventListener('click', () => {
    displayValue.focus();
  });

  return {
    update(state) {
      // Only update the display text if NOT in expression mode,
      // otherwise we'd overwrite what the user is typing.
      if (!isExpressionMode) {
        const text = state.display;
        if (displayValue.textContent !== text) {
          suppressInputEvent = true;
          displayValue.textContent = text;
          suppressInputEvent = false;
        }
      }

      if ((state.state === 'OPERATOR_PENDING' || state.state === 'ENTERING_SECOND')
          && state.operand1 != null && state.operator) {
        historyPreview.textContent = `${state.operand1} ${state.operator}`;
      } else {
        historyPreview.textContent = '';
      }

      displayValue.classList.toggle('error', state.state === 'ERROR');
      historyActions.classList.toggle('hidden', state.history.length === 0);

      const groups = groupByDay(state.history);
      historyList.innerHTML = groups.map(g => `
        <li class="history-day">
          <div class="history-day-label">${escapeHtml(g.label)}</div>
          <ul class="history-day-list">
            ${g.entries.map(h => `
              <li class="history-item" data-result="${h.result}" role="button" tabindex="0" title="Click to reuse ${h.result}">
                <span class="expr">${escapeHtml(h.expression)}</span>
                <span class="time">${formatTime(h.ts)}</span>
                <span class="res">= ${h.result}</span>
              </li>
            `).join('')}
          </ul>
        </li>
      `).join('');
    }
  };
}

export function flashButton(root, label) {
  const btn = root.querySelector(`.btn[data-label="${CSS.escape(label)}"]`);
  if (!btn) return;
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 120);
}