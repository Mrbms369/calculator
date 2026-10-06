// src/engine/expression.js
// Public API: evaluate a full expression string with optional variable context.
//   evaluate("2 + 3 * 4")                    → 14
//   evaluate("(2 + 3) * 4")                  → 20
//   evaluate("7x^2 + 5x - 9", { x: 2 })      → 29
//   evaluate("sin(0)")                       → 0

import { tokenize } from './tokenizer.js';
import { insertImplicitMultiplication } from './implicitMul.js';
import { parse } from './parser.js';
import { evaluate as evalAst } from './evaluator.js';
import { cleanNumber } from './calculator.js';

/**
 * Normalize input before tokenizing.
 *   - Unicode minus → hyphen
 *   - Trailing operators → leave for parser (it will throw)
 */
function normalizeInput(s) {
  return s
    .replace(/−/g, '-')   // U+2212 minus
    .replace(/–/g, '-')
    .replace(/—/g, '-');
}

/**
 * Evaluate a full expression string.
 * @param {string} expr
 * @param {Object} [ctx]  e.g. { x: 2 }
 * @returns {number}
 * @throws {Error} on invalid syntax, division by zero, unknown names, etc.
 */
export function evaluate(expr, ctx = {}) {
  const normalized = normalizeInput(expr);
  const rawTokens = tokenize(normalized);
  const tokens = insertImplicitMultiplication(rawTokens);
  const ast = parse(tokens);
  const result = evalAst(ast, ctx);
  if (!Number.isFinite(result)) throw new Error('Result is not finite');
  return cleanNumber(result);
}

/**
 * Check whether an expression string contains the variable `x`.
 * Used to decide whether to prompt the user for x.
 */
export function hasVariable(expr) {
  if (typeof expr !== 'string') return false;
  try {
    const rawTokens = tokenize(normalizeInput(expr));
    return rawTokens.some(t => t.type === 'VAR' && t.value === 'x');
  } catch {
    return false;
  }
}