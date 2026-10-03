// tests/engine.test.js
import { describe, it, expect } from 'vitest';
import { calculate, unary, cleanNumber } from '../src/engine/calculator.js';

describe('calculate — basic arithmetic', () => {
  it('adds',       () => expect(calculate('+', 2, 3)).toBe(5));
  it('subtracts',  () => expect(calculate('-', 10, 4)).toBe(6));
  it('multiplies', () => expect(calculate('×', 6, 7)).toBe(42));
  it('divides',    () => expect(calculate('÷', 20, 4)).toBe(5));
});

describe('calculate — floating point safety', () => {
  it('0.1 + 0.2 === 0.3 (not 0.30000000000000004)', () => {
    expect(calculate('+', 0.1, 0.2)).toBe(0.3);
  });
  it('1.005 × 100 rounds cleanly', () => {
    expect(calculate('×', 1.005, 100)).toBe(100.5);
  });
});

describe('calculate — error handling', () => {
  it('throws on division by zero', () => {
    expect(() => calculate('÷', 5, 0)).toThrow('Division by zero');
  });
  it('throws on unknown operator', () => {
    expect(() => calculate('@', 1, 2)).toThrow('Unknown operator');
  });
});

describe('unary operations', () => {
  it('negates',     () => expect(unary('±', 7)).toBe(-7));
  it('percent',     () => expect(unary('%', 50)).toBe(0.5));
  it('square root', () => expect(unary('√', 9)).toBe(3));
  it('square',      () => expect(unary('x²', 5)).toBe(25));
  it('reciprocal',  () => expect(unary('1/x', 4)).toBe(0.25));
  it('1/x throws on zero', () => {
    expect(() => unary('1/x', 0)).toThrow('Division by zero');
  });
});

describe('cleanNumber', () => {
  it('trims float artifacts', () => {
    expect(cleanNumber(0.30000000000000004)).toBe(0.3);
  });
  it('leaves integers alone', () => {
    expect(cleanNumber(42)).toBe(42);
  });
});