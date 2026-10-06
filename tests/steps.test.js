import { describe, it, expect } from 'vitest';
import { solveStepByStep } from '../src/engine/steps.js';

describe('step-by-step solutions', () => {
  it('simple addition: 2 + 3', () => {
    const { steps, result } = solveStepByStep('2 + 3');
    expect(result).toBe(5);
    expect(steps).toHaveLength(1);
    expect(steps[0].text).toBe('2 + 3 = 5');
  });

  it('precedence: 2 + 3 * 4', () => {
    const { steps, result } = solveStepByStep('2 + 3 * 4');
    expect(result).toBe(14);
    expect(steps).toHaveLength(2);
    expect(steps[0].text).toBe('3 × 4 = 12');
    expect(steps[1].text).toBe('2 + 12 = 14');
  });

  it('parens: (2 + 3) * 4', () => {
    const { steps, result } = solveStepByStep('(2 + 3) * 4');
    expect(result).toBe(20);
    expect(steps).toHaveLength(2);
    expect(steps[0].text).toBe('2 + 3 = 5');
    expect(steps[1].text).toBe('5 × 4 = 20');
  });

  it('chain: 1 + 2 + 3 + 4', () => {
    const { steps, result } = solveStepByStep('1 + 2 + 3 + 4');
    expect(result).toBe(10);
    expect(steps).toHaveLength(3);
    expect(steps[0].text).toBe('1 + 2 = 3');
    expect(steps[1].text).toBe('3 + 3 = 6');
    expect(steps[2].text).toBe('6 + 4 = 10');
  });

  it('the voice complex case: 23 + 4342 * 875 - 234', () => {
    const { steps, result } = solveStepByStep('23 + 4342 * 875 - 234');
    expect(result).toBe(3799039);
    expect(steps).toHaveLength(3);
    expect(steps[0].text).toBe('4342 × 875 = 3799250');
    expect(steps[1].text).toBe('23 + 3799250 = 3799273');
    expect(steps[2].text).toBe('3799273 - 234 = 3799039');
  });

  it('unary: √9 + 1', () => {
    const { steps, result } = solveStepByStep('√9 + 1');
    expect(result).toBe(4);
    expect(steps[0].text).toBe('√9 = 3');
    expect(steps[1].text).toBe('3 + 1 = 4');
  });

  it('percent: 50% * 200', () => {
    const { steps, result } = solveStepByStep('50% * 200');
    expect(result).toBe(100);
    expect(steps[0].text).toBe('50% = 0.5');
    expect(steps[1].text).toBe('0.5 × 200 = 100');
  });

  it('throws on division by zero', () => {
    expect(() => solveStepByStep('5 / 0')).toThrow();
  });
});