// src/main.js
// Bootstrap: tabs, state, UI, keyboard, theme, voice, sound, share, steps, graph, units.

import './styles/main.css';
import './ui/panels.css';

import { createInitialState, dispatch, ACCENTS } from './state/machine.js';
import { mount, flashButton } from './ui/render.js';
import { copyToClipboard } from './ui/toast.js';
import { isVoiceSupported, listenOnce, parseSpokenExpression, speak } from './ui/voice.js';
import { feedback, soundForEvent, setEnabled as setSoundEnabled, isEnabled as isSoundEnabled } from './ui/sound.js';
import { shareResult } from './ui/share.js';
import { mountBranding } from './ui/branding.js';
import { mountAccentPicker } from './ui/accentPicker.js';
import { mountTabs } from './ui/tabs.js';
import { mountSteps } from './ui/steps.js';
import { mountGraph } from './ui/graph.js';
import { mountUnits } from './ui/units.js';

// ─── Service worker ────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW:', err));
  });
}

// ─── Storage keys ──────────────────────────────────────────────────────
const THEME_KEY        = 'bms-calculator:theme';
const THEME_MANUAL_KEY = 'bms-calculator:theme-manual';
const HISTORY_KEY      = 'bms-calculator:history';
const ACCENT_KEY       = 'bms-calculator:accent';
const SOUND_KEY        = 'bms-calculator:sound';
const MAX_HISTORY      = 100;

// ─── Theme ─────────────────────────────────────────────────────────────
function applyTheme(theme) { document.documentElement.dataset.theme = theme; }
function systemTheme() { return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return systemTheme();
}
function isThemeManual() { return localStorage.getItem(THEME_MANUAL_KEY) === 'true'; }

let currentTheme = loadTheme();
applyTheme(currentTheme);

// ─── Accent ────────────────────────────────────────────────────────────
function loadAccent() {
  const stored = localStorage.getItem(ACCENT_KEY);
  return (stored && ACCENTS[stored]) ? stored : 'orange';
}

// ─── Sound ─────────────────────────────────────────────────────────────
function loadSoundEnabled() {
  const stored = localStorage.getItem(SOUND_KEY);
  return stored === null ? true : stored === 'true';
}
setSoundEnabled(loadSoundEnabled());

// ─── History ───────────────────────────────────────────────────────────
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
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY))); } catch {}
}

// ─── Tabs setup ────────────────────────────────────────────────────────
const appRoot = document.getElementById('app');
const tabs = mountTabs(appRoot, appRoot);

// ─── State ─────────────────────────────────────────────────────────────
let state = createInitialState({
  history: loadHistory(),
  accent: loadAccent(),
});

// ─── Mount calculator UI ───────────────────────────────────────────────
const ui = mount(appRoot, state, handleEvent);
ui.update(state);

// ─── Mount Graph panel ─────────────────────────────────────────────────
const graphEl = document.createElement('div');
tabs.registerPanel('graph', graphEl);
const graph = mountGraph(graphEl);

// ─── Mount Units panel ─────────────────────────────────────────────────
const unitsEl = document.createElement('div');
tabs.registerPanel('units', unitsEl);
const units = mountUnits(unitsEl);

// Notify panels on tab focus
tabs.onChange((tabId) => {
  if (tabId === 'graph') graph.refresh();
  if (tabId === 'units') units.focus?.();
});

// ─── Branding footer ───────────────────────────────────────────────────
mountBranding();

// ─── Steps panel ───────────────────────────────────────────────────────
const stepsContainer = document.createElement('div');
document.body.appendChild(stepsContainer);
const steps = mountSteps(stepsContainer);

// ─── Theme toggle ──────────────────────────────────────────────────────
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
  localStorage.setItem(THEME_MANUAL_KEY, 'true');
  themeToggle.querySelector('.icon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  graph.refresh();
});
document.body.appendChild(themeToggle);

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (isThemeManual()) return;
  currentTheme = systemTheme();
  applyTheme(currentTheme);
  themeToggle.querySelector('.icon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  graph.refresh();
});

// ─── Accent picker ─────────────────────────────────────────────────────
const accentPicker = mountAccentPicker(
  document.body,
  () => state.accent,
  (key) => handleEvent({ type: 'SET_ACCENT', payload: key }),
);

// ─── Sound toggle ──────────────────────────────────────────────────────
const soundToggle = document.createElement('button');
soundToggle.className = 'sound-toggle';
soundToggle.type = 'button';
soundToggle.setAttribute('aria-label', 'Toggle sound');
soundToggle.innerHTML = `<span class="icon">${isSoundEnabled() ? '🔊' : '🔇'}</span>`;
soundToggle.addEventListener('click', () => {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  localStorage.setItem(SOUND_KEY, String(next));
  soundToggle.querySelector('.icon').textContent = next ? '🔊' : '🔇';
});
document.body.appendChild(soundToggle);

// ─── Voice ─────────────────────────────────────────────────────────────
if (isVoiceSupported()) {
  const micBtn = document.createElement('button');
  micBtn.className = 'mic-toggle';
  micBtn.type = 'button';
  micBtn.setAttribute('aria-label', 'Voice input');
  micBtn.innerHTML = `<span class="icon">🎤</span><span class="label">Voice</span>`;
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
        } else speak('Sorry, I did not understand');
      }
    } catch (err) { console.warn('Voice error:', err); }
    finally { micBtn.classList.remove('listening'); }
  });
  document.body.appendChild(micBtn);
}

// ─── Share ─────────────────────────────────────────────────────────────
async function handleShare() {
  const last = state.history[state.history.length - 1];
  if (!last) { copyToClipboard('Nothing to share yet'); return; }
  try {
    const outcome = await shareResult({
      expression: last.expression,
      result: last.result,
      theme: currentTheme,
    });
    if (outcome === 'downloaded') copyToClipboard('Image downloaded');
  } catch (err) { console.warn('Share failed:', err); copyToClipboard('Share failed'); }
}

// ─── Central event handler ─────────────────────────────────────────────
function handleEvent(event) {
  if (event.type === '__SHARE__') { handleShare(); return; }
  if (event.type === '__SHOW_STEPS__') {
    const last = state.history[state.history.length - 1];
    if (last) steps.show(last.expression);
    return;
  }

  const kind = soundForEvent(event);
  feedback(kind);

  const prevHistory = state.history;
  const prevAccent = state.accent;
  state = dispatch(state, event);
  ui.update(state);

  if (state.history !== prevHistory) {
    saveHistory(state.history);
    const last = state.history[state.history.length - 1];
    if (last && state.history.length > prevHistory.length) {
      steps.show(last.expression);
    }
  }
  if (state.accent !== prevAccent) {
    localStorage.setItem(ACCENT_KEY, state.accent);
    accentPicker.setActive(state.accent);
    graph.refresh();
  }
}

// ─── Keyboard ──────────────────────────────────────────────────────────
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
  const target = e.target;
  if (target && target.isContentEditable) return;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) return;
  const event = KEY_MAP[e.key];
  if (!event) return;
  e.preventDefault();
  handleEvent(event);
  const label = labelFor(event);
  if (label) flashButton(appRoot, label);
});