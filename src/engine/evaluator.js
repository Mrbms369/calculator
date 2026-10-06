// src/engine/evaluator.js
// Walks an AST and computes the numeric result.

import { cleanNumber } from './calculator.js';

/**
 * Evaluate an AST node to a number.
 * @param {Node} node
 * @returns {number}
 */
export function evaluate(node) {
  if (!node || typeof node !== 'object') throw new Error('Invalid AST node');

  switch (node.type) {
    case 'Number':
      return node.value;

    case 'Group':
      return evaluate(node.argument);

    case 'Unary': {
      const v = evaluate(node.argument);
      if (node.op === '+') return v;
      if (node.op === '-') return -v;
      if (node.op === '√') {
        if (v < 0) throw new Error('Square root of negative number');
        return Math.sqrt(v);
      }
      throw new Error(`Unknown unary operator: ${node.op}`);
    }

    case 'Postfix': {
      const v = evaluate(node.argument);
      if (node.op === '%') return v / 100;
      throw new Error(`Unknown postfix operator: ${node.op}`);
    }

    case 'Binary': {
      const l = evaluate(node.left);
      const r = evaluate(node.right);
      switch (node.op) {
        case '+': return cleanNumber(l + r);
        case '-': return cleanNumber(l - r);
        case '*': return cleanNumber(l * r);
        case '/':
          if (r === 0) throw new Error('Division by zero');
          return cleanNumber(l / r);
        default:
          throw new Error(`Unknown binary operator: ${node.op}`);
      }
    }

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}