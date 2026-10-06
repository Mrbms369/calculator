import { describe, it, expect } from 'vitest';
import { compileFunction, sampleFunction, robustYRange } from '../src/engine/graphMath.js';

describe('compileFunction — basics', () => {
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

  it('accepts "y = ..." prefix', () => {
    const f = compileFunction('y = x + 10');
    expect(f(0)).toBe(10);
    expect(f(5)).toBe(15);
  });
});

describe('compileFunction — implicit multiplication', () => {
  it('2x → 2*x', () => {
    const f = compileFunction('2x');
    expect(f(5)).toBe(10);
  });

  it('2sin(x) → 2*sin(x)', () => {
    const f = compileFunction('2sin(x)');
    expect(f(Math.PI / 2)).toBeCloseTo(2, 10);
  });

  it('3cos(x) works', () => {
    const f = compileFunction('3cos(x)');
    expect(f(0)).toBeCloseTo(3, 10);
  });

  it('2(x+1) → 2*(x+1)', () => {
    const f = compileFunction('2(x+1)');
    expect(f(3)).toBe(8);
  });

  it('(x+1)(x-1) → (x+1)*(x-1)', () => {
    const f = compileFunction('(x+1)(x-1)');
    expect(f(5)).toBe(24);
  });

  it('x(x+1) → x*(x+1)', () => {
    const f = compileFunction('x(x+1)');
    expect(f(4)).toBe(20);
  });

  it('xsin(x) → x*sin(x)', () => {
    const f = compileFunction('xsin(x)');
    expect(f(Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10);
  });

  it('(x+1)sin(x) works', () => {
    const f = compileFunction('(x+1)sin(x)');
    expect(f(0)).toBeCloseTo(0, 10);
    expect(f(Math.PI / 2)).toBeCloseTo(Math.PI / 2 + 1, 10);
  });

  it('2π works', () => {
    const f = compileFunction('2pi');
    expect(f(0)).toBeCloseTo(2 * Math.PI, 10);
  });
});

describe('compileFunction — full scientific library', () => {
  it('sin, cos, tan', () => {
    expect(compileFunction('sin(x)')(Math.PI / 2)).toBeCloseTo(1, 10);
    expect(compileFunction('cos(x)')(0)).toBeCloseTo(1, 10);
    expect(compileFunction('tan(x)')(0)).toBeCloseTo(0, 10);
  });

  it('cot, sec, csc', () => {
    expect(compileFunction('cot(x)')(Math.PI / 4)).toBeCloseTo(1, 10);
    expect(compileFunction('sec(x)')(0)).toBeCloseTo(1, 10);
    expect(compileFunction('csc(x)')(Math.PI / 2)).toBeCloseTo(1, 10);
  });

  it('inverse trig: asin, acos, atan', () => {
    expect(compileFunction('asin(x)')(1)).toBeCloseTo(Math.PI / 2, 10);
    expect(compileFunction('acos(x)')(1)).toBeCloseTo(0, 10);
    expect(compileFunction('atan(x)')(1)).toBeCloseTo(Math.PI / 4, 10);
  });

  it('arcsin/arccos/arctan aliases', () => {
    expect(compileFunction('arcsin(x)')(1)).toBeCloseTo(Math.PI / 2, 10);
    expect(compileFunction('arccos(x)')(1)).toBeCloseTo(0, 10);
    expect(compileFunction('arctan(x)')(1)).toBeCloseTo(Math.PI / 4, 10);
  });

  it('hyperbolic: sinh, cosh, tanh', () => {
    expect(compileFunction('sinh(x)')(0)).toBe(0);
    expect(compileFunction('cosh(x)')(0)).toBe(1);
    expect(compileFunction('tanh(x)')(0)).toBe(0);
  });

  it('roots: sqrt, cbrt', () => {
    expect(compileFunction('sqrt(x)')(16)).toBe(4);
    expect(compileFunction('cbrt(x)')(27)).toBeCloseTo(3, 10);
  });

  it('logs: log, ln, log2, log10', () => {
    expect(compileFunction('log(x)')(Math.E)).toBeCloseTo(1, 10);
    expect(compileFunction('ln(x)')(Math.E)).toBeCloseTo(1, 10);
    expect(compileFunction('log2(x)')(8)).toBeCloseTo(3, 10);
    expect(compileFunction('log10(x)')(1000)).toBeCloseTo(3, 10);
  });

  it('rounding: floor, ceil, round, trunc', () => {
    expect(compileFunction('floor(x)')(2.7)).toBe(2);
    expect(compileFunction('ceil(x)')(2.1)).toBe(3);
    expect(compileFunction('round(x)')(2.5)).toBe(3);
    expect(compileFunction('trunc(x)')(2.9)).toBe(2);
  });

  it('sign', () => {
    expect(compileFunction('sign(x)')(-5)).toBe(-1);
    expect(compileFunction('sign(x)')(0)).toBe(0);
    expect(compileFunction('sign(x)')(5)).toBe(1);
  });

  it('pow and mod', () => {
    expect(compileFunction('pow(x, 2)')(5)).toBe(25);
    expect(compileFunction('mod(x, 3)')(10)).toBe(1);
  });

  it('constants: PI, pi, E, e, tau, phi', () => {
    expect(compileFunction('PI')(0)).toBeCloseTo(Math.PI, 10);
    expect(compileFunction('pi')(0)).toBeCloseTo(Math.PI, 10);
    expect(compileFunction('E')(0)).toBeCloseTo(Math.E, 10);
    expect(compileFunction('e')(0)).toBeCloseTo(Math.E, 10);
    expect(compileFunction('tau')(0)).toBeCloseTo(2 * Math.PI, 10);
    expect(compileFunction('phi')(0)).toBeCloseTo(1.618033988749895, 10);
  });

  it('unicode π and √', () => {
    expect(compileFunction('π')(0)).toBeCloseTo(Math.PI, 10);
    expect(compileFunction('√x')(9)).toBe(3);
  });
});

describe('compileFunction — safety', () => {
  it('rejects unknown identifiers', () => {
    expect(() => compileFunction('foo(x)')).toThrow(/Unknown name/);
    expect(() => compileFunction('window')).toThrow(/Unknown name/);
    expect(() => compileFunction('alert(1)')).toThrow(/Unknown name/);
  });

  it('does not evaluate javascript keywords', () => {
    expect(() => compileFunction('this')).toThrow(/Unknown name/);
    expect(() => compileFunction('eval("1+1")')).toThrow(/Unknown name/);
    expect(() => compileFunction('Function("alert(1)")')).toThrow(/Unknown name/);
  });

  it('rejects malformed syntax', () => {
    expect(() => compileFunction('2 +')).toThrow();
  });

  it('rejects empty input', () => {
    expect(() => compileFunction('')).toThrow(/Empty/);
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

describe('robustYRange', () => {
  it('handles empty input', () => {
    expect(robustYRange([])).toEqual({ yMin: -10, yMax: 10 });
  });

  it('ignores extreme outliers', () => {
    const pts = [];
    for (let i = 0; i < 100; i++) pts.push({ x: i, y: i });
    pts.push({ x: 100, y: 1000000 }); // outlier
    const { yMin, yMax } = robustYRange(pts, 0.05);
    expect(yMax).toBeLessThan(200); // outlier excluded
  });
});