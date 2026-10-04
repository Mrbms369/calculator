// src/main.js
// Bootstrap: create state, mount UI, wire events + keyboard + theme + copy + persistence.

import './styles/main.css';
import { createInitialState, dispatch } from './state/machine.js';
import { mount, flashButton } from './ui/render.js';
import { copyToClipboard } from './ui/toast.js';

// ─── Storage keys (namespaced to avoid collisions) ───────────────────────
const THEME_KEY   = 'bms-calculator:theme';
const HISTORY_KEY = 'bms-calculator:history';
const MAX_HISTORY = 50;   // cap to prevent localStorage bloat

// ─── Theme (load BEFORE rendering to avoid flash) ────────────────────────
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

let currentTheme = loadTheme();
applyTheme(currentTheme);

// ─── History persistence helpers ─────────────────────────────────────────
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Keep only valid entries, and cap the length
    return parsed
      .filter(h => h && typeof h.expression === 'string' && h.result != null)
      .slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    const capped = history.slice(-MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
  } catch {
    // localStorage might be full or disabled — fail silently
  }
}

// ─── State (single source of truth) — pre-loaded with saved history ─────
let state = createInitialState({ history: loadHistory() });
const root = document.getElementById('app');

// ─── Mount UI ────────────────────────────────────────────────────────────
const ui = mount(root, state, handleEvent);
ui.update(state);

// ─── Theme toggle button ─────────────────────────────────────────────────
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.type = 'button';
themeToggle.setAttribute('aria-label', 'Toggle theme');
themeToggle.title = 'Toggle theme';
themeToggle.innerHTML = `
  <span class="icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
  <span class="label">Mode</span>
`;

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem(THEME_KEY, currentTheme);
  themeToggle.querySelector('.icon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});

document.body.appendChild(themeToggle);

// ─── Copy result: click the display to copy its value ────────────────────
const displayEl = root.querySelector('.display');
if (displayEl) {
  displayEl.setAttribute('title', 'Click to copy');
  displayEl.style.cursor = 'pointer';
  displayEl.addEventListener('click', () => {
    if (state.state === 'ERROR' || state.display === 'Error') return;
    copyToClipboard(state.display);
  });
}

// ─── Central event handler ───────────────────────────────────────────────
function handleEvent(event) {
  const prevHistory = state.history;
  state = dispatch(state, event);
  ui.update(state);

  // Persist history whenever it changed
  if (state.history !== prevHistory) {
    saveHistory(state.history);
  }
}

// ─── Keyboard support ────────────────────────────────────────────────────
const KEY_MAP = {
  '0': { type: 'DIGIT', payload: '0' },
  '1': { type: 'DIGIT', payload: '1' },
  '2': { type: 'DIGIT', payload: '2' },
  '3': { type: 'DIGIT', payload: '3' },
  '4': { type: 'DIGIT', payload: '4' },
  '5': { type: 'DIGIT', payload: '5' },
  '6': { type: 'DIGIT', payload: '6' },
  '7': { type: 'DIGIT', payload: '7' },
  '8': { type: 'DIGIT', payload: '8' },
  '9': { type: 'DIGIT', payload: '9' },
  '.': { type: 'DOT' },
  ',': { type: 'DOT' },
  '+': { type: 'OPERATOR', payload: '+' },
  '-': { type: 'OPERATOR', payload: '-' },
  '*': { type: 'OPERATOR', payload: '×' },
  'x': { type: 'OPERATOR', payload: '×' },
  '/': { type: 'OPERATOR', payload: '÷' },
  'Enter': { type: 'EQUALS' },
  '=': { type: 'EQUALS' },
  'Backspace': { type: 'BACKSPACE' },
  'Escape': { type: 'CLEAR' },
  'c': { type: 'CLEAR' },
  'C': { type: 'CLEAR' },
  '%': { type: 'PERCENT' },
  'r': { type: 'UNARY', payload: '√' },
  'q': { type: 'UNARY', payload: 'x²' },
  's': { type: 'UNARY', payload: '1/x' },
};

function labelFor(event) {
  switch (event.type) {
    case 'DIGIT': return event.payload;
    case 'DOT': return '.';
    case 'OPERATOR': return event.payload === '-' ? '−' : event.payload;
    case 'EQUALS': return '=';
    case 'CLEAR': return 'C';
    case 'BACKSPACE': return '⌫';
    case 'PERCENT': return '%';
    case 'UNARY': return event.payload;
    default: return null;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const event = KEY_MAP[e.key];
  if (!event) return;

  e.preventDefault();
  handleEvent(event);

  const label = labelFor(event);
  if (label) flashButton(root, label);
});