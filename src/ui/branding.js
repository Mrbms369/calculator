// src/ui/branding.js
// Inline SVG of the Tanzania flag + "Made in Tanzania" footer.

export const TANZANIA_FLAG_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
  <rect width="900" height="600" fill="#1EB53A"/>
  <polygon points="0,600 900,0 900,600" fill="#0030dd"/>
  <polygon points="0,0 900,0 900,120 120,600 0,600" fill="none"/>
  <line x1="0" y1="600" x2="900" y2="0" stroke="#eff613" stroke-width="140"/>
  <line x1="0" y1="600" x2="900" y2="0" stroke="#0c0c0b" stroke-width="100"/>
</svg>
`.trim();

/**
 * Insert the branding element into the document body.
 */
export function mountBranding() {
  const el = document.createElement('div');
  el.className = 'branding-footer';
  el.innerHTML = `
    <span class="flag" aria-hidden="true">${TANZANIA_FLAG_SVG}</span>
    <span class="label">Made in Tanzania</span>
  `;
  document.body.appendChild(el);
  return el;
}