import { describe, it, expect } from 'vitest';
import { evaluate } from '../src/engine/expression.js';

describe('expression — public API', () => {
  it('2 + 3 * 4 = 14', () => expect(evaluate('2 + 3 * 4')).toBe(14));
  it('(2 + 3) * 4 = 20', () => expect(evaluate('(2 + 3) * 4')).toBe(20));
  it('√9 + 1 = 4', () => expect(evaluate('√9 + 1')).toBe(4));
  it('50% * 200 = 100', () => expect(evaluate('50% * 200')).toBe(100));
  it('π * 2 ≈ 6.283185', () => expect(evaluate('π * 2')).toBeCloseTo(6.283185, 5));

  it('handles the whole complex case from voice: 23 + 4342 * 875 - 234', () => {
    expect(evaluate('23 + 4342 * 875 - 234')).toBe(3799039);
  });

  it('throws on invalid syntax', () => {
    expect(() => evaluate('2 +')).toThrow();
    expect(() => evaluate('(2 + 3')).toThrow();
    expect(() => evaluate('2 @ 3')).toThrow();
  });
});