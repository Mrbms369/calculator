// src/ui/toast.js
// A tiny toast notification helper.
// Creates a floating pill at the bottom of the screen that auto-dismisses.

const DEFAULT_DURATION = 1600;

/**
 * Show a short toast message.
 * @param {string} message   text to display
 * @param {object} [opts]
 * @param {number} [opts.duration]  milliseconds before auto-dismiss
 * @param {string} [opts.variant]   'success' | 'error' | 'info'
 */
export function showToast(message, opts = {}) {
  const { duration = DEFAULT_DURATION, variant = 'success' } = opts;

  // Reuse a single container for all toasts
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger enter animation on next frame
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  // Auto-dismiss: fade out, then remove
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

/**
 * Copy text to clipboard and show a toast.
 * @param {string} text
 * @returns {Promise<boolean>} true on success
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`Copied: ${text}`, { variant: 'success' });
    return true;
  } catch (err) {
    showToast('Copy failed', { variant: 'error' });
    return false;
  }
}