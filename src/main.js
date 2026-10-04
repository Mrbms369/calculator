// src/main.js
// Bootstrap: state, UI, keyboard, theme, voice, PWA, persistence.

import './styles/main.css';
import { createInitialState, dispatch } from './state/machine.js';
import { mount, flashButton } from './ui/render.js';
import { copyToClipboard } from './ui/toast.js';
import { isVoiceSupported, listenOnce, parseSpokenExpression, speak } from './ui/voice.js';

// ─── Service worker (PWA) ──────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW:', err));
  });
}

// ─── Storage keys ──────────────────────────────────────────────────────
const THEME_KEY         = 'bms-calculator:theme';
const THEME_MANUAL_KEY  = 'bms-calculator:theme-manual';
const HISTORY_KEY       = 'bms-calculator:history';
const MAX_HISTORY       = 100;

// ─── Theme ─────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return systemTheme();
}

function isThemeManual() {
  return localStorage.getItem(THEME_MANUAL_KEY) === 'true';
}

let currentTheme = loadTheme();
applyTheme(currentTheme);

// ─── History persistence ───────────────────────────────────────────────
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(h => h && typeof h.expression === 'string' && h.result != null)
      .map(h => ({ ...h, ts: Number.isFinite(h.ts) ? h.ts : Date.now() }))
      .slice(-MAX_HISTORY);
  } catch { return []; }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
  } catch {}
}

// ─── State ─────────────────────────────────────────────────────────────
let state = createInitialState({ history: loadHistory() });
const root = document.getElementById('app');

const ui = mount(root, state, handleEvent);
ui.update(state);

// ─── Theme toggle button ───────────────────────────────────────────────
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.type = 'button';
themeToggle.setAttribute('aria-label', 'Toggle theme');
themeToggle.title = 'Toggle theme (auto when untouched)';
themeToggle.innerHTML = `
  <span class="icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
  <span class="label">Mode</span>
`;
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem(THEME_KEY, currentTheme);
  localStorage.setItem(THEME_MANUAL_KEY, 'true');
  themeToggle.querySelector('.icon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});
document.body.appendChild(themeToggle);

// ─── Auto theme: follow OS if user never chose manually ────────────────
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (isThemeManual()) return;
  currentTheme = systemTheme();
  applyTheme(currentTheme);
  themeToggle.querySelector('.icon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});

// ─── Voice input button (if supported) ─────────────────────────────────
if (isVoiceSupported()) {
  const micBtn = document.createElement('button');
  micBtn.className = 'mic-toggle';
  micBtn.type = 'button';
  micBtn.setAttribute('aria-label', 'Voice input');
  micBtn.title = 'Voice input — try "47 times 89" or "twelve plus thirty"';
  micBtn.innerHTML = `
    <span class="icon">🎤</span>
    <span class="label">Voice</span>
  `;

  micBtn.addEventListener('click', async () => {
    if (micBtn.classList.contains('listening')) return;
    micBtn.classList.add('listening');
    try {
      const transcript = await listenOnce();
      if (transcript) {
        const parsed = parseSpokenExpression(transcript);
        if (parsed) {
          handleEvent({ type: 'VOICE_EXPRESSION', payload: parsed });
          speak(`${parsed.expression} equals ${parsed.result}`);
        } else {
          speak('Sorry, I did not understand');
        }
      }
    } catch (err) {
      console.warn('Voice error:', err);
    } finally {
      micBtn.classList.remove('listening');
    }
  });

  document.body.appendChild(micBtn);
}

// ─── Copy result on display click ──────────────────────────────────────
const displayEl = root.querySelector('.display');
if (displayEl) {
  displayEl.setAttribute('title', 'Click to copy');
  displayEl.style.cursor = 'pointer';
  displayEl.addEventListener('click', () => {
    if (state.state === 'ERROR' || state.display === 'Error') return;
    copyToClipboard(state.display);
  });
}

// ─── Central event handler ─────────────────────────────────────────────
function handleEvent(event) {
  const prevHistory = state.history;
  state = dispatch(state, event);
  ui.update(state);
  if (state.history !== prevHistory) saveHistory(state.history);
}

// ─── Keyboard support ──────────────────────────────────────────────────
const KEY_MAP = {
  '0': { type: 'DIGIT', payload: '0' }, '1': { type: 'DIGIT', payload: '1' },
  '2': { type: 'DIGIT', payload: '2' }, '3': { type: 'DIGIT', payload: '3' },
  '4': { type: 'DIGIT', payload: '4' }, '5': { type: 'DIGIT', payload: '5' },
  '6': { type: 'DIGIT', payload: '6' }, '7': { type: 'DIGIT', payload: '7' },
  '8': { type: 'DIGIT', payload: '8' }, '9': { type: 'DIGIT', payload: '9' },
  '.': { type: 'DOT' }, ',': { type: 'DOT' },
  '+': { type: 'OPERATOR', payload: '+' },
  '-': { type: 'OPERATOR', payload: '-' },
  '*': { type: 'OPERATOR', payload: '×' },
  'x': { type: 'OPERATOR', payload: '×' },
  '/': { type: 'OPERATOR', payload: '÷' },
  'Enter': { type: 'EQUALS' }, '=': { type: 'EQUALS' },
  'Backspace': { type: 'BACKSPACE' },
  'Escape': { type: 'CLEAR' }, 'c': { type: 'CLEAR' }, 'C': { type: 'CLEAR' },
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