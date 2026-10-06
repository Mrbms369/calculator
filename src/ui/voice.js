// src/ui/voice.js
// Voice input using the Web Speech API.
// Uses the new expression engine (src/engine/expression.js) — no more mini-parser.

import { evaluate } from '../engine/expression.js';

// ─── Speech recognition setup ──────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function isVoiceSupported() {
  return Boolean(SpeechRecognition);
}

/**
 * Start listening. Returns a Promise that resolves with the transcript.
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
      if (!resolved) resolve(null);
    };

    try { recog.start(); } catch (err) { reject(err); }
  });
}

// ─── Voice → math expression ───────────────────────────────────────────
const WORD_NUMBERS = {
  zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9,
  ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16,
  seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty:30, forty:40,
  fifty:50, sixty:60, seventy:70, eighty:80, ninety:90,
  hundred:100, thousand:1000, million:1000000,
};

const OPERATOR_WORDS = [
  { phrases: ['multiplied by', 'multiply by', 'times', 'multiplied'], op: '*' },
  { phrases: ['divided by', 'divide by', 'over', 'divided'], op: '/' },
  { phrases: ['plus', 'add', 'and'], op: '+' },
  { phrases: ['minus', 'subtract', 'less'], op: '-' },
  { phrases: ['open paren', 'open parenthesis', 'left paren'], op: '(' },
  { phrases: ['close paren', 'close parenthesis', 'right paren'], op: ')' },
];

const UNARY_WORDS = [
  { phrases: ['square root of', 'square root'], op: '√' },
];

const EQUALS_WORDS = ['equals', 'equal', 'is', 'makes', 'gives', 'the result is'];

/**
 * Convert a spoken sentence to a math expression string (still symbolic).
 * e.g. "twenty three plus forty three hundred forty two" → "23 + 4342"
 */
function spokenToExpression(text) {
  if (!text) return '';
  let s = ' ' + text.toLowerCase().trim() + ' ';

  // Decimal points: "five point two" → "5.2"
  s = s.replace(/(\d+|zero|one|two|three|four|five|six|seven|eight|nine)\s+point\s+(\d+|zero|one|two|three|four|five|six|seven|eight|nine)/g,
    (_, a, b) => `${a}.${b}`);

  // Percent: "fifty percent" → "50 %"  (leave as % — the tokenizer handles postfix %)
  s = s.replace(/\bpercent\b/g, ' % ');

  // Operator phrases → symbols
  for (const { phrases, op } of OPERATOR_WORDS) {
    for (const p of phrases) {
      const re = new RegExp(`\\s+${p.replace(/\s+/g, '\\s+')}\\s+`, 'g');
      s = s.replace(re, ` ${op} `);
    }
  }

  // Unary functions: "square root of 9" → "√ 9"
  for (const { phrases, op } of UNARY_WORDS) {
    for (const p of phrases) {
      const re = new RegExp(`\\s+${p.replace(/\s+/g, '\\s+')}\\s+`, 'g');
      s = s.replace(re, ` ${op} `);
    }
  }

  // Drop "equals" / "is" (they don't affect math)
  for (const w of EQUALS_WORDS) {
    s = s.replace(new RegExp(`\\s+${w}\\s+`, 'g'), ' ');
  }

  // Word-numbers → digits
  s = convertWordNumbers(s);

  // Keep only math-safe characters
  s = s.replace(/[^0-9+\-*/×÷.()√%π\s]/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();

  return s;
}

/**
 * Convert sequences of number-words into decimal digits.
 * Handles "twenty three" → 23, "four thousand five hundred" → 4500.
 */
function convertWordNumbers(input) {
  const tokens = input.split(/\s+/);
  const out = [];
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i];
    if (WORD_NUMBERS[tok] !== undefined) {
      let total = 0;
      let current = 0;
      while (i < tokens.length && WORD_NUMBERS[tokens[i]] !== undefined) {
        const n = WORD_NUMBERS[tokens[i]];
        if (n === 100) {
          current = (current || 1) * 100;
        } else if (n === 1000) {
          total += (current || 1) * 1000;
          current = 0;
        } else if (n >= 20 && n <= 90 && n % 10 === 0) {
          current += n;
        } else {
          current += n;
        }
        i++;
      }
      out.push(String(total + current));
    } else {
      out.push(tok);
      i++;
    }
  }

  return out.join(' ');
}

/**
 * Parse a spoken sentence into { expression, result } or null.
 * Uses the new parser engine for evaluation.
 */
export function parseSpokenExpression(text) {
  if (!text) return null;

  const expression = spokenToExpression(text);
  if (!expression) return null;

  // Quick sanity: must contain at least one digit or constant
  if (!/[0-9π]/.test(expression)) return null;

  try {
    const result = evaluate(expression);
    if (!Number.isFinite(result)) return null;
    return { expression, result };
  } catch (err) {
    console.warn('Voice parse error:', err.message, '| expression:', expression);
    return null;
  }
}

// ─── Text-to-speech ────────────────────────────────────────────────────
export function speak(text, { lang = 'en-US' } = {}) {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(String(text));
  utter.lang = lang;
  utter.rate = 1.05;
  utter.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}