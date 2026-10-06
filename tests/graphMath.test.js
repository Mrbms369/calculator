import { describe, it, expect } from 'vitest';
import { compileFunction, sampleFunction } from '../src/engine/graphMath.js';

describe('compileFunction', () => {
  it('compiles a simple linear function', () => {
    const f = compileFunction('2*x + 1');
    expect(f(0)).toBe(1);
    expect(f(5)).toBe(11);
  });

  it('handles exponent with ^', () => {
    const f = compileFunction('x^2');
    expect(f(3)).toBe(9);
    expect(f(-4)).toBe(16);
  });

  it('handles sin', () => {
    const f = compileFunction('sin(x)');
    expect(f(0)).toBeCloseTo(0, 10);
    expect(f(Math.PI / 2)).toBeCloseTo(1, 10);
  });

  it('handles sqrt', () => {
    const f = compileFunction('sqrt(x)');
    expect(f(16)).toBe(4);
    expect(Number.isNaN(f(-1))).toBe(true);
  });

  it('accepts "y = ..." prefix', () => {
    const f = compileFunction('y = x + 10');
    expect(f(0)).toBe(10);
    expect(f(5)).toBe(15);
  });

  it('supports PI constant', () => {
    const f = compileFunction('PI * 2');
    expect(f(0)).toBeCloseTo(2 * Math.PI, 10);
  });

  it('rejects unknown identifiers', () => {
    expect(() => compileFunction('foo(x)')).toThrow(/Unknown name/);
    expect(() => compileFunction('window')).toThrow(/Unknown name/);
    expect(() => compileFunction('alert(1)')).toThrow(/Unknown name/);
  });

  it('rejects malformed syntax', () => {
    expect(() => compileFunction('2 +')).toThrow();
    expect(() => compileFunction('x +')).toThrow();
  });

  it('rejects empty input', () => {
    expect(() => compileFunction('')).toThrow(/Empty/);
  });

  it('does not evaluate javascript keywords', () => {
    expect(() => compileFunction('this')).toThrow(/Unknown name/);
    expect(() => compileFunction('eval("1+1")')).toThrow(/Unknown name/);
    expect(() => compileFunction('Function("alert(1)")')).toThrow(/Unknown name/);
  });
});

describe('sampleFunction', () => {
  it('returns the requested number of samples', () => {
    const f = compileFunction('x');
    const pts = sampleFunction(f, -5, 5, 11);
    expect(pts).toHaveLength(11);
    expect(pts[0].x).toBe(-5);
    expect(pts[10].x).toBe(5);
  });

  it('produces NaN for undefined points', () => {
    const f = compileFunction('sqrt(x)');
    const pts = sampleFunction(f, -5, 5, 11);
    const negatives = pts.filter(p => p.x < 0);
    expect(negatives.every(p => Number.isNaN(p.y))).toBe(true);
  });
});