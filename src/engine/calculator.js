// src/engine/calculator.js
// Pure math engine — no DOM, no side effects, fully testable.

/**
 * Rounds a number to eliminate floating-point artifacts.
 * e.g. 0.1 + 0.2 → 0.30000000000000004 becomes 0.3
 *
 * Strategy: round to 12 significant digits, then strip trailing zeros.
 * 12 digits is enough for a calculator and safe for typical use cases.
 */
export function cleanNumber(value) {
  if (!Number.isFinite(value)) return value;
  // toPrecision(12) then Number() trims trailing zeros automatically
  const rounded = Number(value.toPrecision(12));
  return rounded;
}

/**
 * The four core operations.
 * Takes two numbers, returns a number.
 * Throws for division by zero.
 */
export const operations = {
  add:      (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide:   (a, b) => {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  },
};

/**
 * Execute an operation by its symbol.
 * @param {string} op  one of: '+', '-', '×', '÷'
 * @param {number} a   first operand
 * @param {number} b   second operand
 * @returns {number}   the cleaned result
 */
export function calculate(op, a, b) {
  let result;
  switch (op) {
    case '+': result = operations.add(a, b);      break;
    case '-': result = operations.subtract(a, b); break;
    case '×': result = operations.multiply(a, b); break;
    case '÷': result = operations.divide(a, b);   break;
    default:  throw new Error(`Unknown operator: ${op}`);
  }
  return cleanNumber(result);
}

/**
 * Apply a unary operation (single operand).
 * @param {string} op  one of: '±', '%', '√', 'x²', '1/x'
 * @param {number} n
 * @returns {number}
 */
export function unary(op, n) {
  let result;
  switch (op) {
    case '±':  result = -n;              break;
    case '%':  result = n / 100;         break;
    case '√':  result = Math.sqrt(n);    break;
    case 'x²': result = n * n;           break;
    case '1/x': 
      if (n === 0) throw new Error('Division by zero');
      result = 1 / n;
      break;
    default: throw new Error(`Unknown unary operator: ${op}`);
  }
  return cleanNumber(result);
}