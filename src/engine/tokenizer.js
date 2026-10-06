// src/engine/tokenizer.js
// Converts an expression string into a flat array of tokens.
// Supports: numbers, + - * / % ^, ( ), x, functions, constants, unicode symbols.

export const TokenType = Object.freeze({
  NUMBER:  'NUMBER',
  OP:      'OP',
  LPAREN:  'LPAREN',
  RPAREN:  'RPAREN',
  UNARY:   'UNARY',
  PERCENT: 'PERCENT',
  CONST:   'CONST',
  VAR:     'VAR',
  FUNC:    'FUNC',
  COMMA:   'COMMA',
  EOF:     'EOF',
});

// Operator normalization
const OP_MAP = {
  '+': '+', '-': '-', '−': '-', '–': '-', '—': '-',
  '*': '*', '×': '*', '·': '*',
  '/': '/', '÷': '/',
  '^': '^',
};

// Constants — name → numeric value
const CONSTANTS = {
  'π':   Math.PI,
  'pi':  Math.PI,
  'PI':  Math.PI,
  'e':   Math.E,
  'E':   Math.E,
  'tau': 2 * Math.PI,
  'phi': 1.618033988749895,
};

// Function names
const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan',
  'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh',
  'asinh', 'acosh', 'atanh',
  'sqrt', 'cbrt', 'abs', 'exp', 'pow', 'mod',
  'log', 'ln', 'log2', 'log10',
  'floor', 'ceil', 'round', 'trunc', 'sign',
  'min', 'max',
]);

// Longest-first arrays for reliable matching
const ALL_FUNCS = [...FUNCTIONS].sort((a, b) => b.length - a.length);
const ALL_CONSTS = Object.keys(CONSTANTS).sort((a, b) => b.length - a.length);

/**
 * Tokenize an expression string.
 * @param {string} input
 * @returns {Array<{type: string, value: any}>}
 */
export function tokenize(input) {
  if (typeof input !== 'string') throw new Error('Input must be a string');
  const s = input.trim();
  if (!s) throw new Error('Empty expression');

  const tokens = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    // Whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // Number (integer or decimal)
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(s[i + 1] || ''))) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      if ((raw.match(/\./g) || []).length > 1) {
        throw new Error(`Invalid number: ${raw}`);
      }
      tokens.push({ type: TokenType.NUMBER, value: Number(raw) });
      i = j;
      continue;
    }

    // Identifier: constant, function, or variable x
    if (/[A-Za-zπ_]/.test(ch)) {
      const remaining = s.slice(i);
      let matched = false;

      // Constants first (longest match wins)
      for (const name of ALL_CONSTS) {
        if (remaining.startsWith(name)) {
          tokens.push({
            type: TokenType.CONST,
            value: CONSTANTS[name],  // ← numeric value (Math.PI etc.)
            name,                     // ← original name (for display/debugging)
          });
          i += name.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // Functions (longest match, must not be followed by another identifier char)
      for (const name of ALL_FUNCS) {
        if (remaining.startsWith(name)) {
          const after = remaining[name.length];
          if (after === undefined || !/[A-Za-z0-9_]/.test(after)) {
            tokens.push({ type: TokenType.FUNC, value: name });
            i += name.length;
            matched = true;
            break;
          }
        }
      }
      if (matched) continue;

      // Standalone variable x
      if (ch === 'x' && (i + 1 === s.length || !/[A-Za-z0-9_]/.test(s[i + 1]))) {
        tokens.push({ type: TokenType.VAR, value: 'x' });
        i++;
        continue;
      }

      // Compound like "xsin" — split into "x" + "sin"
      if (ch === 'x') {
        const rest = s.slice(i + 1);
        for (const name of ALL_FUNCS) {
          if (rest.startsWith(name) && (rest[name.length] === undefined || !/[A-Za-z0-9_]/.test(rest[name.length]))) {
            tokens.push({ type: TokenType.VAR, value: 'x' });
            i++;
            matched = true;
            break;
          }
        }
        if (matched) continue;
      }

      const bad = remaining.match(/^[A-Za-z_]+/)?.[0] || ch;
      throw new Error(`Unknown name: "${bad}"`);
    }

    // Operators
    if (OP_MAP[ch] !== undefined) {
      tokens.push({ type: TokenType.OP, value: OP_MAP[ch] });
      i++;
      continue;
    }

    // Percent (postfix)
    if (ch === '%') {
      tokens.push({ type: TokenType.PERCENT, value: '%' });
      i++;
      continue;
    }

    // Parens, comma
    if (ch === '(') { tokens.push({ type: TokenType.LPAREN }); i++; continue; }
    if (ch === ')') { tokens.push({ type: TokenType.RPAREN }); i++; continue; }
    if (ch === ',') { tokens.push({ type: TokenType.COMMA }); i++; continue; }

    // √ unary prefix
    if (ch === '√') { tokens.push({ type: TokenType.UNARY, value: '√' }); i++; continue; }

    throw new Error(`Unexpected character: "${ch}"`);
  }

  tokens.push({ type: TokenType.EOF, value: null });
  return tokens;
}