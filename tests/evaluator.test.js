import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/engine/tokenizer.js';
import { parse } from '../src/engine/parser.js';
import { evaluate } from '../src/engine/evaluator.js';

const calc = (s) => evaluate(parse(tokenize(s)));

describe('evaluator — arithmetic', () => {
  it('2 + 3 = 5', () => expect(calc('2 + 3')).toBe(5));
  it('10 - 4 = 6', () => expect(calc('10 - 4')).toBe(6));
  it('6 * 7 = 42', () => expect(calc('6 * 7')).toBe(42));
  it('20 / 4 = 5', () => expect(calc('20 / 4')).toBe(5));
});

describe('evaluator — precedence', () => {
  it('2 + 3 * 4 = 14 (not 20)', () => expect(calc('2 + 3 * 4')).toBe(14));
  it('2 * 3 + 4 = 10 (not 14)', () => expect(calc('2 * 3 + 4')).toBe(10));
  it('(2 + 3) * 4 = 20', () => expect(calc('(2 + 3) * 4')).toBe(20));
  it('20 / 4 + 2 = 7', () => expect(calc('20 / 4 + 2')).toBe(7));
  it('20 / (4 + 1) = 4', () => expect(calc('20 / (4 + 1)')).toBe(4));
});

describe('evaluator — long chains', () => {
  it('23 + 4342 * 875 - 234 = ...', () => {
    // 4342 * 875 = 3,799,250
    // 3,799,250 + 23 - 234 = 3,799,039
    expect(calc('23 + 4342 * 875 - 234')).toBe(3799039);
  });

  it('complex with parens', () => {
    // 2 + 3 * (4 + 5) - 6 / 3
    // = 2 + 27 - 2 = 27
    expect(calc('2 + 3 * (4 + 5) - 6 / 3')).toBe(27);
  });
});

describe('evaluator — unary', () => {
  it('-5 + 3 = -2', () => expect(calc('-5 + 3')).toBe(-2));
  it('-(2 + 3) = -5', () => expect(calc('-(2 + 3)')).toBe(-5));
  it('√9 = 3', () => expect(calc('√9')).toBe(3));
  it('√(9 + 16) = 5', () => expect(calc('√(9 + 16)')).toBe(5));
  it('√ of negative throws', () => expect(() => calc('√-1')).toThrow());
});

describe('evaluator — postfix percent', () => {
  it('50% = 0.5', () => expect(calc('50%')).toBe(0.5));
  it('50% * 200 = 100', () => expect(calc('50% * 200')).toBe(100));
  it('(50 + 50)% = 1', () => expect(calc('(50 + 50)%')).toBe(1));
});

describe('evaluator — constants', () => {
  it('π ≈ 3.14159', () => expect(calc('π')).toBeCloseTo(Math.PI, 10));
  it('π * 2 ≈ 6.283', () => expect(calc('π * 2')).toBeCloseTo(2 * Math.PI, 10));
});

describe('evaluator — errors', () => {
  it('division by zero', () => expect(() => calc('5 / 0')).toThrow(/Division by zero/));
  it('division by zero via parens', () => expect(() => calc('5 / (2 - 2)')).toThrow());
});

describe('evaluator — float safety', () => {
  it('0.1 + 0.2 = 0.3 (not 0.30000000000000004)', () => {
    expect(calc('0.1 + 0.2')).toBe(0.3);
  });
});