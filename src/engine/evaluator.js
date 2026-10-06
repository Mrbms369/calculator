// src/engine/evaluator.js
// Walks an AST and computes the numeric result.

import { cleanNumber } from './calculator.js';

// Constants (same values as graph engine)
const CONSTANTS = {
  'π':   Math.PI,
  'pi':  Math.PI,
  'PI':  Math.PI,
  'e':   Math.E,
  'E':   Math.E,
  'tau': 2 * Math.PI,
  'phi': 1.618033988749895,
};

// Functions (same whitelist as graph engine)
const FUNCTIONS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  cot: (x) => 1 / Math.tan(x),
  sec: (x) => 1 / Math.cos(x),
  csc: (x) => 1 / Math.sin(x),
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  sqrt: Math.sqrt, cbrt: Math.cbrt,
  abs: Math.abs, exp: Math.exp,
  pow: Math.pow,
  mod: (a, b) => ((a % b) + b) % b,
  log: Math.log, ln: Math.log,
  log2: Math.log2, log10: Math.log10,
  floor: Math.floor, ceil: Math.ceil, round: Math.round,
  trunc: Math.trunc, sign: Math.sign,
  min: Math.min, max: Math.max,
};

/**
 * Evaluate an AST node to a number.
 * @param {Object} node
 * @param {Object} [ctx]   context, e.g. { x: 2 }
 * @returns {number}
 */
export function evaluate(node, ctx = {}) {
  if (!node || typeof node !== 'object') throw new Error('Invalid AST node');

  switch (node.type) {
    case 'Number':
      return node.value;

    case 'Variable': {
      const v = ctx[node.name];
      if (v === undefined) throw new Error(`Undefined variable: ${node.name}`);
      return v;
    }

    case 'Constant': {
      const v = CONSTANTS[node.name];
      if (v === undefined) throw new Error(`Unknown constant: ${node.name}`);
      return v;
    }

    case 'Function': {
      const fn = FUNCTIONS[node.name];
      if (!fn) throw new Error(`Unknown function: ${node.name}`);
      const args = node.args.map(a => evaluate(a, ctx));
      return fn(...args);
    }

    case 'Group':
      return evaluate(node.argument, ctx);

    case 'Unary': {
      const v = evaluate(node.argument, ctx);
      if (node.op === '+') return v;
      if (node.op === '-') return -v;
      if (node.op === '√') {
        if (v < 0) throw new Error('Square root of negative number');
        return Math.sqrt(v);
      }
      throw new Error(`Unknown unary operator: ${node.op}`);
    }

    case 'Postfix': {
      const v = evaluate(node.argument, ctx);
      if (node.op === '%') return v / 100;
      throw new Error(`Unknown postfix operator: ${node.op}`);
    }

    case 'Binary': {
      const l = evaluate(node.left, ctx);
      const r = evaluate(node.right, ctx);
      switch (node.op) {
        case '+': return cleanNumber(l + r);
        case '-': return cleanNumber(l - r);
        case '*': return cleanNumber(l * r);
        case '/':
          if (r === 0) throw new Error('Division by zero');
          return cleanNumber(l / r);
        case '^': {
          const result = Math.pow(l, r);
          if (!Number.isFinite(result)) throw new Error('Result is not finite');
          return cleanNumber(result);
        }
        default:
          throw new Error(`Unknown binary operator: ${node.op}`);
      }
    }

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}