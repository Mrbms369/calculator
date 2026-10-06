// src/engine/tokenizer.js
// Converts an expression string into a flat array of tokens.
// A token is { type, value } — e.g. { type: 'NUMBER', value: 42 }
//                                       { type: 'OP', value: '+' }

export const TokenType = Object.freeze({
  NUMBER:  'NUMBER',
  OP:      'OP',       // + - * / × ÷
  LPAREN:  'LPAREN',   // (
  RPAREN:  'RPAREN',   // )
  UNARY:   'UNARY',    // √ (applies to next primary)
  PERCENT: 'PERCENT',  // postfix % (e.g. 50%)
  CONST:   'CONST',    // π, e
  EOF:     'EOF',      // end of input marker
});

const OPERATOR_MAP = {
  '+': '+',
  '-': '-',
  '*': '*',
  '×': '*',
  '/': '/',
  '÷': '/',
};

const CONSTANT_MAP = {
  'π': Math.PI,
  'pi': Math.PI,
  'e': Math.E,
};

/**
 * Tokenize an expression string.
 * @param {string} input
 * @returns {Array<{type: string, value: any}>}
 * @throws {Error} on invalid characters
 */
export function tokenize(input) {
  if (typeof input !== 'string') throw new Error('Input must be a string');
  const s = input.trim();
  if (!s) throw new Error('Empty expression');

  const tokens = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    // Whitespace → skip
    if (/\s/.test(ch)) { i++; continue; }

    // Numbers (integer or decimal)
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(s[i + 1] || ''))) {
      let start = i;
      while (i < s.length && /[0-9.]/.test(s[i])) i++;
      const raw = s.slice(start, i);
      // Guard against multiple dots like "1.2.3"
      if ((raw.match(/\./g) || []).length > 1) {
        throw new Error(`Invalid number: ${raw}`);
      }
      tokens.push({ type: TokenType.NUMBER, value: Number(raw) });
      continue;
    }

    // Operators
    if (OPERATOR_MAP[ch] !== undefined) {
      tokens.push({ type: TokenType.OP, value: OPERATOR_MAP[ch] });
      i++;
      continue;
    }

    // Parentheses
    if (ch === '(') { tokens.push({ type: TokenType.LPAREN, value: '(' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: TokenType.RPAREN, value: ')' }); i++; continue; }

    // Square root symbol (unary prefix)
    if (ch === '√') {
      tokens.push({ type: TokenType.UNARY, value: '√' });
      i++;
      continue;
    }

    // Percent (postfix)
    if (ch === '%') {
      tokens.push({ type: TokenType.PERCENT, value: '%' });
      i++;
      continue;
    }

    // Constants
    // Single-char 'e' — but careful: 'e' can also be part of scientific notation,
    // which we don't support here. So just check single char.
    if (ch === 'π') { tokens.push({ type: TokenType.CONST, value: Math.PI }); i++; continue; }
    if (ch === 'e' || ch === 'E') {
      // Only treat as Euler's number if it's standalone (not adjacent to digits)
      const prev = i > 0 ? s[i - 1] : '';
      const next = s[i + 1] ?? '';
      if (!/[0-9]/.test(prev) && !/[0-9]/.test(next)) {
        tokens.push({ type: TokenType.CONST, value: Math.E });
        i++;
        continue;
      }
    }

    throw new Error(`Unexpected character: "${ch}"`);
  }

  tokens.push({ type: TokenType.EOF, value: null });
  return tokens;
}