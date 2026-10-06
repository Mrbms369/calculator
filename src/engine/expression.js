// src/engine/expression.js
// Public API: evaluate a full expression string.
//   evaluate("2 + 3 * 4")           → 14
//   evaluate("(2 + 3) * 4")         → 20
//   evaluate("√9 + 1")              → 4
//   evaluate("50% * 200")           → 100

import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { evaluate as evalAst } from './evaluator.js';
import { cleanNumber } from './calculator.js';

/**
 * Evaluate a full expression string.
 * @param {string} expr
 * @returns {number}
 * @throws {Error} on invalid syntax, division by zero, etc.
 */
export function evaluate(expr) {
  const tokens = tokenize(expr);
  const ast = parse(tokens);
  const result = evalAst(ast);
  if (!Number.isFinite(result)) throw new Error('Result is not finite');
  return cleanNumber(result);
}