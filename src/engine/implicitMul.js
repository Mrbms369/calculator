// src/engine/implicitMul.js
// Inserts synthetic OP(*) tokens where implicit multiplication appears.

import { TokenType } from './tokenizer.js';

export function insertImplicitMultiplication(tokens) {
  const out = [];

  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i];
    const prev = out[out.length - 1];

    if (prev && shouldInsertBetween(prev, cur)) {
      out.push({ type: TokenType.OP, value: '*' });
    }
    out.push(cur);
  }

  return out;
}

function shouldInsertBetween(prev, cur) {
  const isValueEnd = (t) =>
    t.type === TokenType.NUMBER ||
    t.type === TokenType.VAR ||
    t.type === TokenType.CONST ||
    t.type === TokenType.RPAREN ||
    t.type === TokenType.PERCENT;

  const isValueStart = (t) =>
    t.type === TokenType.NUMBER ||
    t.type === TokenType.VAR ||
    t.type === TokenType.CONST ||
    t.type === TokenType.LPAREN ||
    t.type === TokenType.UNARY ||
    t.type === TokenType.FUNC;   // ← NEW: 2sin(0) → 2 * sin(0)

  // A FUNC immediately followed by LPAREN is a call, not a multiply
  if (prev.type === TokenType.FUNC && cur.type === TokenType.LPAREN) return false;
  if (prev.type === TokenType.FUNC) return false;

  return isValueEnd(prev) && isValueStart(cur);
}