// src/ui/languageToggle.js
// Language switcher — a fixed button + popover, similar to the accent picker.

import { LANGUAGES, listLanguages } from '../engine/voiceNumbers.js';

const STORAGE_KEY = 'bms-calculator:voice-language';

export function loadLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES[stored]) return stored;
  } catch {}
  return 'en';
}

export function saveLanguage(key) {
  try { localStorage.setItem(STORAGE_KEY, key); } catch {}
}

/**
 * Mount the language picker button + popover.
 * @param {HTMLElement} container    where to append the button
 * @param {() => string} getLanguage current language key
 * @param {(key: string) => void} onSelect
 * @returns {{ setActive: (key: string) => void }}
 */
export function mountLanguageToggle(container, getLanguage, onSelect) {
  // ─── Button ────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.className = 'language-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Choose voice language');
  btn.title = 'Voice language';
  btn.innerHTML = `
    <span class="flag">🌍</span>
    <span class="label">Lang</span>
  `;

  // ─── Popover ───────────────────────────────────────────────────────
  const popover = document.createElement('div');
  popover.className = 'language-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Choose voice language');
  popover.innerHTML = `
    <div class="language-popover-title">Voice Language</div>
    <div class="language-options"></div>
  `;

  const optionsEl = popover.querySelector('.language-options');

  for (const key of listLanguages()) {
    const lang = LANGUAGES[key];
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'language-option';
    opt.dataset.langKey = key;
    opt.innerHTML = `
      <span class="lang-flag">${lang.flag}</span>
      <span class="lang-label">${lang.label}</span>
    `;
    opt.addEventListener('click', () => {
      onSelect(key);
      closePopover();
    });
    optionsEl.appendChild(opt);
  }

  // ─── Behaviour ─────────────────────────────────────────────────────
  let isOpen = false;

  function openPopover() {
    isOpen = true;
    popover.classList.add('language-popover--open');
    const rect = btn.getBoundingClientRect();
    popover.style.top = `${rect.bottom + 8}px`;
    popover.style.right = `${Math.max(8, window.innerWidth - rect.right)}px`;
    const active = popover.querySelector('.language-option--active');
    if (active) active.focus();
  }

  function closePopover() {
    isOpen = false;
    popover.classList.remove('language-popover--open');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) closePopover();
    else openPopover();
  });

  document.addEventListener('click', (e) => {
    if (!isOpen) return;
    if (popover.contains(e.target)) return;
    if (btn.contains(e.target)) return;
    closePopover();
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') closePopover();
  });

  window.addEventListener('resize', () => { if (isOpen) closePopover(); });

  // ─── Mount ─────────────────────────────────────────────────────────
  container.appendChild(btn);
  document.body.appendChild(popover);

  // ─── Public API ────────────────────────────────────────────────────
  const setActive = (key) => {
    const lang = LANGUAGES[key] || LANGUAGES.en;
    btn.querySelector('.flag').textContent = lang.flag;

    popover.querySelectorAll('.language-option').forEach((opt) => {
      opt.classList.toggle('language-option--active', opt.dataset.langKey === key);
    });
  };

  setActive(getLanguage());

  return { setActive };
}