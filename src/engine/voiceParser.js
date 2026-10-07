// src/engine/voiceParser.js
// Converts spoken text (English or Swahili) into a math expression string.

import { getLanguage } from './voiceNumbers.js';

export function parseSpoken(text, langKey = 'en') {
  if (!text || typeof text !== 'string') return null;
  const lang = getLanguage(langKey);

  // Normalize
  let s = ' ' + text.toLowerCase().trim().replace(/\s+/g, ' ') + ' ';

  // ─── 1. Word-numbers FIRST ────────────────────────────────────────
  s = convertWordNumbers(s, lang);

  // ─── 2. Decimal points ────────────────────────────────────────────
  const pointWord = langKey === 'sw' ? 'nukta' : 'point';
  s = s.replace(new RegExp(`\\b(\\d+)\\s+${pointWord}\\s+(\\d+)\\b`, 'g'), '$1.$2');

  // ─── 3. Operators (longest phrases first) ─────────────────────────
  const sortedOps = [...lang.operators].sort(
    (a, b) => longestPhrase(b.phrases) - longestPhrase(a.phrases)
  );
  for (const { phrases, op } of sortedOps) {
    for (const phrase of phrases) {
      const re = new RegExp(`\\s+${escapeRegex(phrase).replace(/ /g, '\\s+')}\\s+`, 'g');
      s = s.replace(re, ` ${op} `);
    }
  }

  // ─── 4. Unary ─────────────────────────────────────────────────────
  for (const { phrases, op } of lang.unary) {
    for (const phrase of phrases) {
      const re = new RegExp(
        `\\s+${escapeRegex(phrase).replace(/ /g, '\\s+')}\\s+(\\d+)`,
        'g'
      );
      s = s.replace(re, ` ${op}$1`);
    }
  }

  // ─── 5. Drop equals words ─────────────────────────────────────────
  for (const word of lang.equals) {
    const re = new RegExp(`\\s+${escapeRegex(word).replace(/ /g, '\\s+')}\\s+`, 'g');
    s = s.replace(re, ' ');
  }

  // ─── 6. Clean ─────────────────────────────────────────────────────
  s = s
    .replace(/[^0-9+\-*/×÷.()√%π\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!s) return null;
  if (!/[0-9π]/.test(s)) return null;

  return { expression: s };
}

// ─── Helpers ────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function longestPhrase(phrases) {
  return Math.max(...phrases.map(p => p.length));
}

/**
 * Convert number-words into digits.
 * Two ordering conventions:
 *   English:  "one hundred"     → 100     (digit BEFORE multiplier)
 *             "three thousand five hundred" → 3500
 *   Swahili:  "mia moja"        → 100     (multiplier BEFORE digit)
 *             "elfu mbili mia tatu" → 2300
 */
function convertWordNumbers(input, lang) {
  const tokens = input.split(/\s+/);
  const numbers = lang.numbers;
  const joiners = new Set(lang.numberJoiners || []);
  const isMultiplier = (n) => n === 100 || n === 1000 || n === 1000000 || n === 1000000000;

  const out = [];
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i].toLowerCase();

    if (numbers[tok] === undefined) {
      out.push(tokens[i]);
      i++;
      continue;
    }

    // We hit a number-word — begin accumulation
    let total = 0;
    let current = 0;

    if (lang.multiplierFirst) {
      // ─── Swahili-style: MULTIPLIER [digit] ... ────────────────
      // e.g. "mia moja" = 100*1 ; "elfu mbili mia tatu" = 2*1000 + 3*100
      while (i < tokens.length) {
        const t = tokens[i].toLowerCase();
        if (numbers[t] === undefined) break;

        const n = numbers[t];

        if (isMultiplier(n)) {
          // Peek next: if it's a small number (1-99), it multiplies
          const nextTok = tokens[i + 1] ? tokens[i + 1].toLowerCase() : '';
          const nextVal = nextTok && numbers[nextTok] !== undefined ? numbers[nextTok] : null;

          if (nextVal !== null && !isMultiplier(nextVal)) {
            const product = n * nextVal;
            i += 2;
            if (n >= 1000) {
              total += product;
            } else {
              // n === 100 or smaller — accumulate into current
              current += product;
            }
          } else {
            // Bare multiplier like "mia" = 100
            if (n >= 1000) total += n;
            else current += n;
            i++;
          }
        } else if (n >= 20 && n <= 90 && n % 10 === 0) {
          // Tens
          current += n;
          i++;
        } else {
          // Units (0-9, 10-19)
          current += n;
          i++;
        }

        // Consume joiners when between two number tokens
        while (i < tokens.length) {
          const j = tokens[i].toLowerCase();
          if (!joiners.has(j)) break;
          const after = tokens[i + 1] ? tokens[i + 1].toLowerCase() : '';
          if (numbers[after] === undefined) break;
          i++;
        }
      }
    } else {
      // ─── English-style: [digit] MULTIPLIER [digit] MULTIPLIER ─
      // e.g. "one hundred" = 1*100 ; "three thousand five hundred" = 3500
      while (i < tokens.length) {
        const t = tokens[i].toLowerCase();
        if (numbers[t] === undefined) break;

        const n = numbers[t];

        if (n === 100) {
          current = (current || 1) * 100;
          i++;
        } else if (n >= 1000) {
          total += (current || 1) * n;
          current = 0;
          i++;
        } else if (n >= 20 && n <= 90 && n % 10 === 0) {
          // tens: "twenty" adds to current
          current += n;
          i++;
        } else {
          // units: "one", "three", etc.
          current += n;
          i++;
        }

        // Skip number joiners if between numbers
        while (i < tokens.length) {
          const j = tokens[i].toLowerCase();
          if (!joiners.has(j)) break;
          const after = tokens[i + 1] ? tokens[i + 1].toLowerCase() : '';
          if (numbers[after] === undefined) break;
          i++;
        }
      }
    }

    out.push(String(total + current));
  }

  return out.join(' ');
}