import { describe, it, expect } from 'vitest';
import { FORMULAS, formulasByCategory, getFormula, computeFormula } from '../src/engine/formulas.js';

describe('formulas — catalog integrity', () => {
  it('has at least 50 formulas', () => {
    expect(FORMULAS.length).toBeGreaterThanOrEqual(50);
  });

  it('every formula has required fields', () => {
    for (const f of FORMULAS) {
      expect(f.id).toBeTruthy();
      expect(f.category).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.formula).toBeTruthy();
      expect(Array.isArray(f.inputs)).toBe(true);
      expect(f.inputs.length).toBeGreaterThan(0);
      expect(typeof f.compute).toBe('function');
    }
  });

  it('formula ids are unique', () => {
    const ids = FORMULAS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every input has key, symbol, label', () => {
    for (const f of FORMULAS) {
      for (const inp of f.inputs) {
        expect(inp.key).toBeTruthy();
        expect(inp.symbol).toBeTruthy();
        expect(inp.label).toBeTruthy();
      }
    }
  });

  it('every formula has a compute that returns something for defaults', () => {
    for (const f of FORMULAS) {
      const values = {};
      for (const inp of f.inputs) values[inp.key] = Number(inp.default ?? 1);
      const out = f.compute(values);
      expect(out === undefined || out === null).toBe(false);
    }
  });
});

describe('formulas — categories', () => {
  it('has 5 categories', () => {
    const cats = ['math', 'physics', 'chemistry', 'electrical', 'electronics'];
    for (const c of cats) {
      expect(formulasByCategory(c).length).toBeGreaterThan(0);
    }
  });
});

describe('formulas — getFormula', () => {
  it('returns a formula by id', () => {
    const f = getFormula('pythagorean');
    expect(f).toBeTruthy();
    expect(f.name).toBe('Pythagorean Theorem');
  });
  it('returns null for unknown id', () => {
    expect(getFormula('bogus')).toBeNull();
  });
});

describe('formulas — MATH computations', () => {
  it('pythagorean 3,4 → 5', () => {
    expect(computeFormula('pythagorean', { a: 3, b: 4 })).toBe('5');
  });
  it('circle area r=1 → π', () => {
    expect(computeFormula('circle-area', { r: 1 })).toBeCloseTo(String(Math.PI), 5);
  });
  it('quadratic x² - 4 = 0 → roots ±2', () => {
    const out = computeFormula('quadratic-roots', { a: 1, b: 0, c: -4 });
    expect(out).toContain('x₁');
    expect(out).toContain('2');
    expect(out).toContain('-2');
  });
  it('quadratic with no real roots', () => {
    const out = computeFormula('quadratic-roots', { a: 1, b: 0, c: 1 });
    expect(out).toMatch(/No real roots/);
  });
  it('percent-change 100→150 = 50 %', () => {
    const out = computeFormula('percent-change', { old: 100, new: 150 });
    expect(out).toContain('50');
  });
  it('simple-interest 1000 * 0.05 * 2 = 100', () => {
    expect(computeFormula('simple-interest', { P: 1000, r: 0.05, t: 2 })).toBe('100');
  });
});

describe('formulas — PHYSICS computations', () => {
  it('speed d=100, t=20 → 5', () => {
    expect(computeFormula('speed', { d: 100, t: 20 })).toBe('5');
  });
  it('force m=10, a=2 → 20', () => {
    expect(computeFormula('force', { m: 10, a: 2 })).toBe('20');
  });
  it('kinetic energy ½mv²', () => {
    expect(computeFormula('kinetic-energy', { m: 2, v: 3 })).toBe('9');
  });
  it('density m=10, V=2 → 5', () => {
    expect(computeFormula('density', { m: 10, V: 2 })).toBe('5');
  });
  it('wave speed f=50, λ=2 → 100', () => {
    expect(computeFormula('wave-speed', { f: 50, l: 2 })).toBe('100');
  });
});

describe('formulas — CHEMISTRY computations', () => {
  it('moles 36 g / 18 g/mol → 2', () => {
    expect(computeFormula('moles-from-mass', { m: 36, M: 18 })).toBe('2');
  });
  it('molarity 0.5 / 2 = 0.25', () => {
    expect(computeFormula('molarity', { n: 0.5, V: 2 })).toBe('0.25');
  });
  it('pH of 0.001 M → 3', () => {
    expect(computeFormula('ph-from-h', { H: 0.001 })).toBe('3');
  });
});

describe('formulas — ELECTRICAL computations', () => {
  it('Ohm\'s law V = 2 × 10 = 20', () => {
    expect(computeFormula('ohms-law', { I: 2, R: 10 })).toBe('20');
  });
  it('power V×I = 12 × 2 = 24', () => {
    expect(computeFormula('power-vi', { V: 12, I: 2 })).toBe('24');
  });
  it('series 10 + 20 + 30 = 60', () => {
    expect(computeFormula('resistors-series', { r1: 10, r2: 20, r3: 30 })).toBe('60');
  });

  // FIXED: parallel with a very large third resistor gives ~5 (correctly rounded)
  it('parallel 10, 10, ∞ → 5', () => {
    const out = computeFormula('resistors-parallel', { r1: 10, r2: 10, r3: 1e12 });
    expect(out).toBe('5');
  });

  it('parallel 10, 10, 10 → 3.3333333', () => {
    const out = computeFormula('resistors-parallel', { r1: 10, r2: 10, r3: 10 });
    // 10/3 = 3.3333333... rounded to 8 sig digits
    expect(Number(out)).toBeCloseTo(10 / 3, 6);
  });

  it('parallel 100, 100 → 50 (via huge third)', () => {
    const out = computeFormula('resistors-parallel', { r1: 100, r2: 100, r3: 1e12 });
    expect(Number(out)).toBeCloseTo(50, 6);
  });

  it('RC 1000 × 0.001 = 1', () => {
    expect(computeFormula('rc-time', { R: 1000, C: 0.001 })).toBe('1');
  });
});

describe('formulas — ELECTRONICS computations', () => {
  it('voltage divider 12V, 1k, 1k → 6', () => {
    expect(computeFormula('voltage-divider', { Vin: 12, R1: 1000, R2: 1000 })).toBe('6');
  });
  it('opamp inverting gain −Rf/Rin', () => {
    expect(computeFormula('opamp-inverting', { Rf: 10000, Rin: 1000 })).toBe('-10');
  });
  it('opamp non-inverting gain 1 + Rf/Rin', () => {
    expect(computeFormula('opamp-noninverting', { Rf: 10000, Rin: 1000 })).toBe('11');
  });
  it('LED resistor (5 − 2) / 0.02 = 150', () => {
    expect(computeFormula('led-resistor', { Vs: 5, Vl: 2, Il: 0.02 })).toBe('150');
  });
  it('dB gain 10× → 20 dB', () => {
    const out = computeFormula('db-gain', { Vout: 10, Vin: 1 });
    expect(out).toContain('20');
    expect(out).toContain('dB');
  });
});