// src/ui/accentPicker.js
// Popover with color swatches for choosing the accent.

import { ACCENTS } from '../state/machine.js';

const DISPLAY_NAMES = {
  orange: 'Orange',
  green:  'Green',
  blue:   'Blue',
  red:    'Red',
  purple: 'Purple',
  pink:   'Pink',
};

/**
 * Mount the accent picker button + popover.
 * @param {HTMLElement} container   where to attach the elements
 * @param {() => string} getAccent  current accent key
 * @param {(key: string) => void} onSelect
 * @returns {{ setActive: (key: string) => void }}
 */
export function mountAccentPicker(container, getAccent, onSelect) {
  // ─── Toggle button ────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.className = 'accent-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Choose accent color');
  btn.title = 'Accent color';
  btn.innerHTML = `
    <span class="swatch"></span>
    <span class="label">Color</span>
  `;

  // ─── Popover ──────────────────────────────────────────────────────
  const popover = document.createElement('div');
  popover.className = 'accent-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Choose accent color');
  popover.innerHTML = `
    <div class="accent-popover-title">Accent</div>
    <div class="accent-swatches"></div>
  `;

  const swatchList = popover.querySelector('.accent-swatches');

  for (const [key, color] of Object.entries(ACCENTS)) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'accent-dot';
    dot.dataset.accentKey = key;
    dot.setAttribute('aria-label', DISPLAY_NAMES[key] || key);
    dot.title = DISPLAY_NAMES[key] || key;
    dot.style.setProperty('--dot-color', color);
    dot.addEventListener('click', () => {
      onSelect(key);
      closePopover();
    });
    swatchList.appendChild(dot);
  }

  // ─── Behavior ─────────────────────────────────────────────────────
  let isOpen = false;

  function openPopover() {
    isOpen = true;
    popover.classList.add('accent-popover--open');
    // Position under the button
    const rect = btn.getBoundingClientRect();
    popover.style.top = `${rect.bottom + 8}px`;
    popover.style.right = `${Math.max(8, window.innerWidth - rect.right)}px`;
    // Focus first swatch for keyboard users
    const first = popover.querySelector('.accent-dot');
    if (first) first.focus();
  }

  function closePopover() {
    isOpen = false;
    popover.classList.remove('accent-popover--open');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) closePopover();
    else openPopover();
  });

  // Click outside → close
  document.addEventListener('click', (e) => {
    if (!isOpen) return;
    if (popover.contains(e.target)) return;
    if (btn.contains(e.target)) return;
    closePopover();
  });

  // Escape → close
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') closePopover();
  });

  // Close on scroll/resize (avoids stale positioning)
  window.addEventListener('resize', () => { if (isOpen) closePopover(); });

  // ─── Mount ────────────────────────────────────────────────────────
  container.appendChild(btn);
  document.body.appendChild(popover);

  // ─── Public API ───────────────────────────────────────────────────
  const setActive = (key) => {
    const color = ACCENTS[key] || ACCENTS.orange;
    btn.querySelector('.swatch').style.background = color;
    btn.querySelector('.swatch').style.boxShadow = `0 0 8px ${color}`;

    popover.querySelectorAll('.accent-dot').forEach((dot) => {
      dot.classList.toggle('accent-dot--active', dot.dataset.accentKey === key);
    });
  };

  setActive(getAccent());

  return { setActive };
}