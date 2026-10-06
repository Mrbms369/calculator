// src/ui/steps.js
// Step-by-step solutions panel.
// Renders the list of steps for a given expression.

import { solveStepByStep } from '../engine/steps.js';

/**
 * Mount the steps panel into a container.
 * @param {HTMLElement} container
 * @returns {{ show: (expression: string) => void, clear: () => void }}
 */
export function mountSteps(container) {
  container.innerHTML = `
    <div class="steps-panel">
      <header class="steps-header">
        <h3>Step by Step</h3>
        <button type="button" class="steps-close" title="Hide">×</button>
      </header>
      <div class="steps-body">
        <div class="steps-empty">
          Enter an expression, then press <strong>=</strong> or <strong>Enter</strong>.
        </div>
        <ol class="steps-list" hidden></ol>
      </div>
    </div>
  `;

  const emptyEl = container.querySelector('.steps-empty');
  const listEl  = container.querySelector('.steps-list');
  const closeBtn = container.querySelector('.steps-close');

  closeBtn.addEventListener('click', () => {
    container.classList.remove('steps-panel--visible');
  });

  return {
    show(expression) {
      try {
        const { steps, result } = solveStepByStep(expression);
        listEl.innerHTML = steps.map((s, i) => `
          <li>
            <span class="step-num">${i + 1}</span>
            <span class="step-text">${escapeHtml(s.text)}</span>
          </li>
        `).join('') + `
          <li class="step-final">
            <span class="step-num">✓</span>
            <span class="step-text">Result: <strong>${escapeHtml(String(result))}</strong></span>
          </li>
        `;
        listEl.hidden = false;
        emptyEl.hidden = true;
      } catch (err) {
        listEl.innerHTML = `<li class="step-error">Could not break down: ${escapeHtml(err.message)}</li>`;
        listEl.hidden = false;
        emptyEl.hidden = true;
      }
      container.classList.add('steps-panel--visible');
    },

    clear() {
      listEl.innerHTML = '';
      listEl.hidden = true;
      emptyEl.hidden = false;
      container.classList.remove('steps-panel--visible');
    },
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}