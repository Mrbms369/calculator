import { describe, it, expect } from 'vitest';
import { evaluate } from '../src/engine/expression.js';
import { createInitialState, dispatch, State } from '../src/state/machine.js';

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

describe('expression — edge cases that must throw', () => {
  it('trailing operator: "4 *"',   () => expect(() => evaluate('4 *')).toThrow());
  it('trailing operator: "4 +"',   () => expect(() => evaluate('4 +')).toThrow());
  it('trailing operator: "4 -"',   () => expect(() => evaluate('4 -')).toThrow());
  it('trailing operator: "4 /"',   () => expect(() => evaluate('4 /')).toThrow());
  it('leading operator: "* 4"',    () => expect(() => evaluate('* 4')).toThrow());
  it('unmatched open paren: "(4"', () => expect(() => evaluate('(4')).toThrow());
  it('empty parens: "()"',         () => expect(() => evaluate('()')).toThrow());
  it('double operator: "4 ** 5"',  () => expect(() => evaluate('4 ** 5')).toThrow());
  it('just an operator: "+"',      () => expect(() => evaluate('+')).toThrow());
});

// ─── State machine: incomplete expression guard ─────────────────────────
// These test the "4 × = 16" bug fix at the state machine level.
function run(state, ...events) {
  return events.reduce((s, e) => dispatch(s, e), state);
}
const D  = (d) => ({ type: 'DIGIT', payload: d });
const OP = (o) => ({ type: 'OPERATOR', payload: o });
const EQ = () => ({ type: 'EQUALS' });

describe('state machine — incomplete expression → Error', () => {
  it('4 × = → Error (not 16)', () => {
    const s = run(createInitialState(), D('4'), OP('×'), EQ());
    expect(s.state).toBe(State.ERROR);
    expect(s.display).toBe('Error');
  });

  it('4 + = → Error (not 8)', () => {
    const s = run(createInitialState(), D('4'), OP('+'), EQ());
    expect(s.state).toBe(State.ERROR);
    expect(s.display).toBe('Error');
  });

  it('12 ÷ = → Error (not 1)', () => {
    const s = run(createInitialState(), D('1'), D('2'), OP('÷'), EQ());
    expect(s.state).toBe(State.ERROR);
    expect(s.display).toBe('Error');
  });

  it('complete expression still works: 4 × 5 = → 20', () => {
    const s = run(createInitialState(), D('4'), OP('×'), D('5'), EQ());
    expect(s.display).toBe('20');
    expect(s.state).toBe(State.RESULT);
  });

  it('single number + = is a no-op (does not error)', () => {
    // "4 =" with no operator → nothing to compute; state stays as is
    const s = run(createInitialState(), D('4'), EQ());
    expect(s.state).not.toBe(State.ERROR);
    expect(s.display).toBe('4');
  });
});