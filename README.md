# BMs Calculator

> A professional-grade web calculator built with **Vanilla JavaScript + Vite**.
> Tested with **Vitest** — 47 unit tests covering math, state, and behavior.

![Status](https://img.shields.io/badge/tests-47%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Made with](https://img.shields.io/badge/made%20with-Vanilla%20JS-f7df1e?logo=javascript&logoColor=000)
![Bundler](https://img.shields.io/badge/bundler-Vite-646cff?logo=vite&logoColor=fff)

🔗 **Live demo:** https://inspiring-cheesecake-449193.netlify.app

---

## ✨ Features

### Tier 1 — Core
- Digits `0–9`, decimal point `.`
- Basic operations: `+` `−` `×` `÷`
- `=` equals, `C` clear, `±` sign toggle, `%` percent
- Backspace `⌫`
- **Float-safe math** — `0.1 + 0.2` correctly yields `0.3`, not `0.30000000000000004`

### Tier 2 — Standard
- 🧠 **Memory keys**: `MC` (clear), `MR` (recall), `M+`, `M−`
- 📜 **History panel** — records every completed calculation
- 🖱️ **Clickable history** — click any entry to reuse its result
- ⌨️ **Full keyboard support** — `0-9`, `+ - * /`, `Enter`, `Esc`, `Backspace`
- 🌓 **Dark / Light theme** — persists in `localStorage`
- 📋 **Click display to copy** — with toast feedback

### Tier 3 — Scientific
- `√` square root
- `x²` square
- `1/x` reciprocal
- `π` Pi constant
- ⚠️ Proper error handling (division by zero, √ of negatives, `1/0`)

### Polish
- 🎨 Glowing **RGB animated title**
- 📱 **Fully responsive** — works on mobile
- ♿ Keyboard-navigable, ARIA-friendly
- 🧪 **47 unit tests** — engine + state machine

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher (LTS recommended)
- [VS Code](https://code.visualstudio.com) (or any editor)

### Install & run

```bash
# 1. Clone the repository
git clone https://github.com/your-username/calculator.git
cd calculator

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev