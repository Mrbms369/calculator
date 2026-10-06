import { describe, it, expect } from 'vitest';
import { evaluate, hasVariable } from '../src/engine/expression.js';

describe('expression — arithmetic (regression)', () => {
  it('2 + 3 * 4 = 14', () => expect(evaluate('2 + 3 * 4')).toBe(14));
  it('(2 + 3) * 4 = 20', () => expect(evaluate('(2 + 3) * 4')).toBe(20));
  it('√9 + 1 = 4', () => expect(evaluate('√9 + 1')).toBe(4));
  it('50% * 200 = 100', () => expect(evaluate('50% * 200')).toBe(100));
  it('π * 2 ≈ 6.283', () => expect(evaluate('π * 2')).toBeCloseTo(6.283185, 5));
  it('23 + 4342 * 875 - 234 = 3799039', () => {
    expect(evaluate('23 + 4342 * 875 - 234')).toBe(3799039);
  });
});

describe('expression — power ^', () => {
  it('2^3 = 8', () => expect(evaluate('2^3')).toBe(8));
  it('2^3^2 = 512 (right-assoc)', () => expect(evaluate('2^3^2')).toBe(512));
  it('2^0.5 ≈ √2', () => expect(evaluate('2^0.5')).toBeCloseTo(Math.SQRT2, 10));
  it('power binds tighter than *', () => {
    expect(evaluate('2 * 3^2')).toBe(18);
  });
  it('-2^2 = -4 (unary binds looser than ^)', () => {
    // Note: our parser treats -2^2 as -(2^2) = -4
    expect(evaluate('-2^2')).toBe(-4);
  });
});

describe('expression — variables', () => {
  it('x = 5 → x = 5', () => expect(evaluate('x', { x: 5 })).toBe(5));
  it('x + 2 = 7 when x=5', () => expect(evaluate('x + 2', { x: 5 })).toBe(7));
  it('7x^2 + 5x - 9 at x=2 → 29', () => {
    expect(evaluate('7x^2 + 5x - 9', { x: 2 })).toBe(29);
  });
  it('7x^2 + 5x - 9 at x=-3 → 63 - 15 - 9 = 39', () => {
    expect(evaluate('7x^2 + 5x - 9', { x: -3 })).toBe(39);
  });
  it('x^2 + 2x + 1 at x=3 → 16', () => {
    expect(evaluate('x^2 + 2x + 1', { x: 3 })).toBe(16);
  });
  it('throws when x is undefined', () => {
    expect(() => evaluate('x + 1')).toThrow(/Undefined variable/);
  });
});

describe('expression — implicit multiplication', () => {
  it('2x → 2*x', () => expect(evaluate('2x', { x: 5 })).toBe(10));
  it('2x + 1 at x=3 → 7', () => expect(evaluate('2x + 1', { x: 3 })).toBe(7));
  it('2(x+1) at x=3 → 8', () => expect(evaluate('2(x+1)', { x: 3 })).toBe(8));
  it('(x+1)(x-1) at x=5 → 24', () => {
    expect(evaluate('(x+1)(x-1)', { x: 5 })).toBe(24);
  });
  it('2π ≈ 6.283', () => expect(evaluate('2π')).toBeCloseTo(6.283185, 5));
  it('2π works without x', () => expect(Number.isFinite(evaluate('2π'))).toBe(true));
});

describe('expression — functions', () => {
  it('sin(0) = 0', () => expect(evaluate('sin(0)')).toBeCloseTo(0, 10));
  it('cos(0) = 1', () => expect(evaluate('cos(0)')).toBeCloseTo(1, 10));
  it('sqrt(16) = 4', () => expect(evaluate('sqrt(16)')).toBe(4));
  it('log(1) = 0', () => expect(evaluate('log(1)')).toBe(0));
  it('abs(-5) = 5', () => expect(evaluate('abs(-5)')).toBe(5));
  it('pow(2, 10) = 1024', () => expect(evaluate('pow(2, 10)')).toBe(1024));
  it('2sin(0) = 0', () => expect(evaluate('2sin(0)')).toBeCloseTo(0, 10));
});

describe('expression — constants', () => {
  it('π ≈ 3.14159', () => expect(evaluate('π')).toBeCloseTo(Math.PI, 10));
  it('pi ≈ 3.14159', () => expect(evaluate('pi')).toBeCloseTo(Math.PI, 10));
  it('e ≈ 2.71828', () => expect(evaluate('e')).toBeCloseTo(Math.E, 10));
  it('tau ≈ 2π', () => expect(evaluate('tau')).toBeCloseTo(2 * Math.PI, 10));
});

describe('expression — unicode and normalization', () => {
  it('unicode minus: 5−3 = 2', () => expect(evaluate('5−3')).toBe(2));
  it('unicode × : 2×3 = 6', () => expect(evaluate('2×3')).toBe(6));
  it('unicode ÷ : 10÷2 = 5', () => expect(evaluate('10÷2')).toBe(5));
});

describe('expression — errors', () => {
  it('throws on invalid syntax', () => {
    expect(() => evaluate('2 +')).toThrow();
    expect(() => evaluate('(2 + 3')).toThrow();
  });
  it('throws on division by zero', () => {
    expect(() => evaluate('5 / 0')).toThrow(/Division by zero/);
  });
  it('throws on unknown names', () => {
    expect(() => evaluate('foo(2)')).toThrow(/Unknown/);
  });
});

describe('expression — hasVariable', () => {
  it('detects x', () => expect(hasVariable('2x + 1')).toBe(true));
  it('detects x inside parens', () => expect(hasVariable('(x+1)')).toBe(true));
  it('false when no x', () => expect(hasVariable('2 + 3')).toBe(false));
  it('false for π', () => expect(hasVariable('2π')).toBe(false));
  it('false for unknown', () => expect(hasVariable('foo')).toBe(false));
});