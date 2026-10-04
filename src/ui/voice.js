// src/ui/voice.js
// Voice input using the Web Speech API.
// Parses spoken math ("47 times 89") into an expression and evaluates it.

// ─── Speech recognition setup ──────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function isVoiceSupported() {
  return Boolean(SpeechRecognition);
}

/**
 * Start listening. Returns a Promise that resolves with the transcript.
 * @returns {Promise<string|null>}
 */
export function listenOnce({ lang = 'en-US' } = {}) {
  return new Promise((resolve, reject) => {
    if (!SpeechRecognition) {
      reject(new Error('SpeechRecognition not supported'));
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = lang;
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;

    let resolved = false;

    recog.onresult = (e) => {
      resolved = true;
      const text = e.results[0][0].transcript;
      resolve(text);
    };

    recog.onerror = (e) => {
      resolved = true;
      reject(new Error(e.error || 'recognition failed'));
    };

    recog.onend = () => {
      if (!resolved) resolve(null); // stopped without result
    };

    try {
      recog.start();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Voice → expression parser ─────────────────────────────────────────
const WORD_NUMBERS = {
  zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9,
  ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16,
  seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty:30, forty:40,
  fifty:50, sixty:60, seventy:70, eighty:80, ninety:90,
  hundred:100, thousand:1000, million:1000000,
};

const OPERATOR_WORDS = [
  { words: ['times', 'multiplied by', 'multiply by', 'multiplied', 'x'], op: '×' },
  { words: ['divided by', 'divide by', 'over', 'divided'], op: '÷' },
  { words: ['plus', 'add', 'and'], op: '+' },
  { words: ['minus', 'subtract', 'less'], op: '-' },
];

const UNARY_WORDS = [
  { words: ['square root of', 'square root', 'root of'], op: '√' },
  { words: ['percent of', 'percent'], op: '%' },
];

const EQUALS_WORDS = ['equals', 'equal', 'is', 'makes', 'gives'];

/**
 * Parses a spoken sentence like "forty seven times eighty nine" into
 * a canonical expression string and its numerical result.
 *
 * @param {string} text
 * @returns {{ expression: string, result: number } | null}
 */
export function parseSpokenExpression(text) {
  if (!text) return null;
  let s = ' ' + text.toLowerCase().trim() + ' ';

  // Replace decimal point: "point five" → ".5"; "five point two" → "5.2"
  s = s.replace(/(\d+|zero|one|two|three|four|five|six|seven|eight|nine)\s+point\s+(\d+|zero|one|two|three|four|five|six|seven|eight|nine)/g,
    (_, a, b) => `${a}.${b}`);

  // Replace word-operators with symbols
  for (const { words, op } of OPERATOR_WORDS) {
    for (const w of words) {
      const re = new RegExp(`\\s+${w.replace(/\s+/g, '\\s+')}\\s+`, 'g');
      s = s.replace(re, ` ${op} `);
    }
  }

  // Handle "square root of N" → √N
  for (const { words, op } of UNARY_WORDS) {
    for (const w of words) {
      const re = new RegExp(`\\s+${w.replace(/\s+/g, '\\s+')}\\s+(\\d+)`, 'g');
      s = s.replace(re, ` ${op}$1`);
    }
  }

  // Remove "equals"/"is"/etc
  for (const w of EQUALS_WORDS) {
    s = s.replace(new RegExp(`\\s+${w}\\s+`, 'g'), ' ');
  }

  // Replace word-numbers with digits (single pass for "twenty one" style)
  s = convertWordNumbers(s);

  // Extract candidate expression: digits, operators, dot, parens, √, %, π
  const cleaned = s.replace(/[^0-9+\-*/×÷.√%π\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (!cleaned) return null;

  // Reject if it has more than one operator in a row (basic sanity)
  if (/[+\-*/×÷]\s*[+\-*/×÷]/.test(cleaned)) return null;

  // Evaluate the expression safely
  const result = evaluateExpression(cleaned);
  if (!Number.isFinite(result)) return null;

  return { expression: cleaned, result };
}

/**
 * Convert word-numbers to digits: "forty seven" → "47", "twenty one" → "21".
 */
function convertWordNumbers(input) {
  const tokens = input.split(/\s+/);
  const out = [];
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i];
    if (WORD_NUMBERS[tok] !== undefined) {
      let value = 0;
      let current = 0;
      // Greedily consume consecutive number-words
      while (i < tokens.length && WORD_NUMBERS[tokens[i]] !== undefined) {
        const n = WORD_NUMBERS[tokens[i]];
        if (n === 100) {
          current = (current || 1) * 100;
        } else if (n === 1000) {
          value += (current || 1) * 1000;
          current = 0;
        } else if (n >= 20 && n <= 90 && n % 10 === 0) {
          current += n;
        } else {
          current += n;
        }
        i++;
      }
      out.push(String(value + current));
    } else {
      out.push(tok);
      i++;
    }
  }

  return out.join(' ');
}

/**
 * Safely evaluate a simple arithmetic expression string.
 * Supports: numbers, + - * / × ÷, √, %, π, decimal points.
 * Does NOT use eval().
 */
function evaluateExpression(expr) {
  // Normalize operators
  let s = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, String(Math.PI))
    .replace(/√\s*(\d+(?:\.\d+)?)/g, (_, n) => String(Math.sqrt(Number(n))));

  // Tokenize
  const tokens = s.match(/(\d+\.?\d*|[+\-*/%])/g);
  if (!tokens || tokens.length === 0) return NaN;

  // First pass: handle * and /
  const stack = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t === '*' || t === '/') {
      const prev = stack.pop();
      const next = Number(tokens[i + 1]);
      if (!Number.isFinite(prev) || !Number.isFinite(next)) return NaN;
      stack.push(t === '*' ? prev * next : (next === 0 ? NaN : prev / next));
      i += 2;
    } else {
      stack.push(t === '+' || t === '-' || t === '%' ? t : Number(t));
      i++;
    }
  }

  // Second pass: + and -
  if (stack.length === 0) return NaN;
  let result = typeof stack[0] === 'number' ? stack[0] : Number(stack[1]);
  let idx = typeof stack[0] === 'number' ? 1 : 2;
  while (idx < stack.length) {
    const op = stack[idx++];
    const val = Number(stack[idx++]);
    if (!Number.isFinite(val)) return NaN;
    if (op === '+') result += val;
    else if (op === '-') result -= val;
  }

  return result;
}

// ─── Text-to-speech ────────────────────────────────────────────────────
export function speak(text, { lang = 'en-US' } = {}) {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(String(text));
  utter.lang = lang;
  utter.rate = 1.05;
  utter.pitch = 1;
  window.speechSynthesis.cancel(); // stop any pending speech
  window.speechSynthesis.speak(utter);
}