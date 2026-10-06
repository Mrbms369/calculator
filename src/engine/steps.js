// src/engine/steps.js
// Generates human-readable step-by-step solutions by walking the AST.
//
// Given: 2 + 3 * 4
// Returns:
//   [
//     { text: '3 × 4 = 12', node: <subtree> },
//     { text: '2 + 12 = 14', node: <whole tree>, result: 14 },
//   ]

import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { evaluate } from './evaluator.js';

/**
 * Evaluate an expression and produce a step-by-step solution.
 * @param {string} expr
 * @returns {{ steps: Array<{text: string, value: number}>, result: number }}
 */
export function solveStepByStep(expr) {
  const tokens = tokenize(expr);
  const ast = parse(tokens);

  const steps = [];
  const result = reduce(ast, steps);

  return { steps, result };
}

/**
 * Reduce a node to a number, recording each arithmetic operation
 * as a step. Returns the numeric value.
 */
function reduce(node, steps) {
  if (!node) throw new Error('Invalid node');

  if (node.type === 'Number') return node.value;

  if (node.type === 'Group') {
    return reduce(node.argument, steps);
  }

  if (node.type === 'Unary') {
    const v = reduce(node.argument, steps);
    let value;
    let display;
    switch (node.op) {
      case '+': value = +v; display = `+${v}`; break;
      case '-': value = -v; display = `-${v}`; break;
      case '√':
        if (v < 0) throw new Error('Square root of negative number');
        value = Math.sqrt(v);
        display = `√${v}`;
        break;
      default: throw new Error(`Unknown unary: ${node.op}`);
    }
    steps.push({ text: `${display} = ${round(value)}`, value: round(value) });
    return value;
  }

  if (node.type === 'Postfix') {
    const v = reduce(node.argument, steps);
    if (node.op === '%') {
      const value = v / 100;
      steps.push({ text: `${v}% = ${round(value)}`, value: round(value) });
      return value;
    }
    throw new Error(`Unknown postfix: ${node.op}`);
  }

  if (node.type === 'Binary') {
    const l = reduce(node.left, steps);
    const r = reduce(node.right, steps);

    let value;
    let opSymbol;
    switch (node.op) {
      case '+': value = l + r; opSymbol = '+'; break;
      case '-': value = l - r; opSymbol = '-'; break;
      case '*': value = l * r; opSymbol = '×'; break;
      case '/':
        if (r === 0) throw new Error('Division by zero');
        value = l / r;
        opSymbol = '÷';
        break;
      default: throw new Error(`Unknown binary: ${node.op}`);
    }

    // Round for display
    const cleaned = cleanNumber(value);
    steps.push({
      text: `${round(l)} ${opSymbol} ${round(r)} = ${round(cleaned)}`,
      value: round(cleaned),
    });
    return cleaned;
  }

  throw new Error(`Unknown node type: ${node.type}`);
}

function cleanNumber(v) {
  if (!Number.isFinite(v)) return v;
  return Number(v.toPrecision(12));
}

function round(v) {
  if (!Number.isFinite(v)) return v;
  const n = Number(v.toPrecision(12));
  return n;
}