// src/ui/tabs.js
// Tab switcher — lets the user switch between Calculator / Graph / Units / Code.

const TABS_KEY = 'bms-calculator:active-tab';

export const TABS = [
  { id: 'calculator', label: 'Calculator', icon: '🧮' },
  { id: 'graph',      label: 'Graph',      icon: '📊' },
  { id: 'units',      label: 'Units',      icon: '🎁' },
  { id: 'programmer', label: 'Code',       icon: '🕹️' },
];

/**
 * Mount the tab bar and panel container.
 * @param {HTMLElement} root
 * @param {HTMLElement} calculatorRoot   the existing calculator app root
 * @returns {{ onChange: (id: string) => void, setActive: (id: string) => void }}
 */
export function mountTabs(root, calculatorRoot) {
  // Build the DOM: tab bar + panel container
  const wrapper = document.createElement('div');
  wrapper.className = 'app-wrapper';

  const tabBar = document.createElement('nav');
  tabBar.className = 'tab-bar';
  tabBar.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'tab-panels';

  // Insert the wrapper around the existing calculator root
  const parent = root.parentNode;
  parent.insertBefore(wrapper, root);
  wrapper.appendChild(tabBar);
  wrapper.appendChild(panels);

  // Create tabs
  for (const tab of TABS) {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.dataset.tabId = tab.id;
    btn.innerHTML = `<span class="tab-icon">${tab.icon}</span><span class="tab-label">${tab.label}</span>`;
    btn.addEventListener('click', () => setActive(tab.id));
    tabBar.appendChild(btn);
  }

  // Calculator panel: the original app goes here
  const calcPanel = document.createElement('div');
  calcPanel.className = 'tab-panel';
  calcPanel.dataset.tabId = 'calculator';
  calcPanel.appendChild(root);
  panels.appendChild(calcPanel);

  // Other panels are created by the caller and inserted dynamically

  const listeners = [];
  function onChange(fn) { listeners.push(fn); }

  function setActive(id) {
    if (!TABS.find(t => t.id === id)) id = 'calculator';

    tabBar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('tab-btn--active', btn.dataset.tabId === id);
      btn.setAttribute('aria-selected', String(btn.dataset.tabId === id));
    });

    panels.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('tab-panel--active', p.dataset.tabId === id);
    });

    try { localStorage.setItem(TABS_KEY, id); } catch {}
    listeners.forEach(fn => fn(id));
  }

  /** Register a new panel under an existing tab id. */
  function registerPanel(tabId, el) {
    el.classList.add('tab-panel');
    el.dataset.tabId = tabId;
    panels.appendChild(el);
  }

  // Initial state
  const stored = localStorage.getItem(TABS_KEY) || 'calculator';
  setActive(stored);

  return { setActive, onChange, registerPanel };
}