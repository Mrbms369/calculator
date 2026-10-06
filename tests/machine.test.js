// tests/machine.test.js
import { describe, it, expect } from 'vitest';
import { createInitialState, dispatch, State } from '../src/state/machine.js';

function run(state, ...events) {
  return events.reduce((s, e) => dispatch(s, e), state);
}

const D = (d) => ({ type: 'DIGIT', payload: d });
const OP = (o) => ({ type: 'OPERATOR', payload: o });
const EQ = () => ({ type: 'EQUALS' });
const C  = () => ({ type: 'CLEAR' });
const DOT = () => ({ type: 'DOT' });
const RECALL = (v) => ({ type: 'RECALL_HISTORY', payload: v });
const UN = (op) => ({ type: 'UNARY', payload: op });
const CONST = (c) => ({ type: 'CONSTANT', payload: c });
const CLEAR_HIST = () => ({ type: 'CLEAR_HISTORY' });
const VOICE = (payload) => ({ type: 'VOICE_EXPRESSION', payload });
const E_IN = (text) => ({ type: 'EXPRESSION_INPUT', payload: text });
const E_EVAL = () => ({ type: 'EXPRESSION_EVAL' });

describe('typing digits', () => {
  it('starts at 0', () => expect(createInitialState().display).toBe('0'));
  it('5 5 5 → "555"', () => {
    expect(run(createInitialState(), D('5'), D('5'), D('5')).display).toBe('555');
  });
  it('leading zero is replaced', () => {
    expect(run(createInitialState(), D('0'), D('7')).display).toBe('7');
  });
});

describe('basic operations flow', () => {
  it('2 + 3 = → 5', () => {
    const s = run(createInitialState(), D('2'), OP('+'), D('3'), EQ());
    expect(s.display).toBe('5');
    expect(s.state).toBe(State.RESULT);
  });
  it('history entry has a timestamp', () => {
    const before = Date.now();
    const s = run(createInitialState(), D('2'), OP('+'), D('3'), EQ());
    const after = Date.now();
    expect(s.history[0].ts).toBeGreaterThanOrEqual(before);
    expect(s.history[0].ts).toBeLessThanOrEqual(after);
  });
  it('shows second operand while typing', () => {
    expect(run(createInitialState(), D('2'), OP('+'), D('3')).display).toBe('3');
  });
  it('chained: 2 + 3 + → 5', () => {
    const s = run(createInitialState(), D('2'), OP('+'), D('3'), OP('+'));
    expect(s.display).toBe('5');
    expect(s.operator).toBe('+');
  });
  it('replaces operator if pressed twice', () => {
    expect(run(createInitialState(), D('2'), OP('+'), OP('×')).operator).toBe('×');
  });
});

describe('division by zero', () => {
  it('5 ÷ 0 = → Error state', () => {
    const s = run(createInitialState(), D('5'), OP('÷'), D('0'), EQ());
    expect(s.state).toBe(State.ERROR);
    expect(s.display).toBe('Error');
  });
});

describe('clear and backspace', () => {
  it('C resets display', () => {
    const s = run(createInitialState(), D('5'), D('5'), C());
    expect(s.display).toBe('0');
    expect(s.state).toBe(State.IDLE);
  });
  it('backspace removes last char', () => {
    expect(run(createInitialState(), D('1'), D('2'), D('3'), { type: 'BACKSPACE' }).display).toBe('12');
  });
});

describe('decimal point', () => {
  it('prevents double dots', () => {
    expect(run(createInitialState(), D('1'), DOT(), D('5'), DOT()).display).toBe('1.5');
  });
  it('2.5 + 2.5 = → 5', () => {
    const s = run(createInitialState(), D('2'), DOT(), D('5'), OP('+'), D('2'), DOT(), D('5'), EQ());
    expect(s.display).toBe('5');
  });
});

describe('sign toggle', () => {
  it('± flips the sign', () => {
    expect(run(createInitialState(), D('7'), { type: 'SIGN' }).display).toBe('-7');
  });
  it('± twice returns to original', () => {
    expect(run(createInitialState(), D('7'), { type: 'SIGN' }, { type: 'SIGN' }).display).toBe('7');
  });
});

describe('history', () => {
  it('records completed calculations', () => {
    const s = run(createInitialState(), D('2'), OP('+'), D('3'), EQ());
    expect(s.history).toHaveLength(1);
    expect(s.history[0].result).toBe(5);
  });
});

describe('memory', () => {
  it('M+ stores value and MR recalls it', () => {
    const s1 = run(createInitialState(), D('4'), D('2'), { type: 'M_PLUS' });
    expect(s1.memory).toBe(42);
    expect(run(s1, C(), { type: 'MR' }).display).toBe('42');
  });
});

describe('recall from history', () => {
  it('puts the value in the display and enters RESULT state', () => {
    const s = run(createInitialState(), RECALL(3915));
    expect(s.display).toBe('3915');
    expect(s.state).toBe(State.RESULT);
    expect(s.operand1).toBe(3915);
  });
  it('next digit starts a fresh number', () => {
    expect(run(createInitialState(), RECALL(42), D('7')).display).toBe('7');
  });
  it('can be used as first operand of a new calculation', () => {
    expect(run(createInitialState(), RECALL(5), OP('+'), D('3'), EQ()).display).toBe('8');
  });
  it('ignores non-numeric payload', () => {
    const before = createInitialState();
    const after  = dispatch(before, RECALL('not-a-number'));
    expect(after).toEqual(before);
  });
});

describe('unary operations', () => {
  it('√9 → 3', () => expect(run(createInitialState(), D('9'), UN('√')).display).toBe('3'));
  it('x² of 5 → 25', () => expect(run(createInitialState(), D('5'), UN('x²')).display).toBe('25'));
  it('1/x of 4 → 0.25', () => expect(run(createInitialState(), D('4'), UN('1/x')).display).toBe('0.25'));
  it('√ of a negative number → Error', () => {
    expect(run(createInitialState(), D('9'), { type: 'SIGN' }, UN('√')).state).toBe(State.ERROR);
  });
  it('1/x of 0 → Error', () => {
    expect(run(createInitialState(), UN('1/x')).state).toBe(State.ERROR);
  });
  it('unary result feeds next calculation', () => {
    expect(run(createInitialState(), D('9'), UN('√'), OP('+'), D('1'), EQ()).display).toBe('4');
  });
  it('next digit after √ starts fresh', () => {
    expect(run(createInitialState(), D('9'), UN('√'), D('7')).display).toBe('7');
  });
});

describe('constant insertion (π)', () => {
  it('inserts π and enters RESULT state', () => {
    const s = run(createInitialState(), CONST('π'));
    expect(s.state).toBe(State.RESULT);
    expect(Number(s.display)).toBeCloseTo(Math.PI, 10);
  });
  it('next digit after π starts fresh', () => {
    expect(run(createInitialState(), CONST('π'), D('5')).display).toBe('5');
  });
  it('π × 2 = → ~6.28', () => {
    const s = run(createInitialState(), CONST('π'), OP('×'), D('2'), EQ());
    expect(Number(s.display)).toBeCloseTo(2 * Math.PI, 8);
  });
  it('ignores unknown constants', () => {
    const before = createInitialState();
    expect(dispatch(before, CONST('Ω'))).toEqual(before);
  });
});

describe('clear history', () => {
  it('CLEAR_HISTORY empties the array', () => {
    const s1 = run(createInitialState(), D('2'), OP('+'), D('3'), EQ());
    expect(s1.history).toHaveLength(1);
    expect(run(s1, CLEAR_HIST()).history).toEqual([]);
  });
  it('keeps display/memory untouched', () => {
    const s1 = run(createInitialState(), D('4'), D('2'), { type: 'M_PLUS' });
    const s2 = run(s1, D('2'), OP('+'), D('3'), EQ());
    const s3 = run(s2, CLEAR_HIST());
    expect(s3.display).toBe(s2.display);
    expect(s3.memory).toBe(42);
  });
  it('CLEAR_HISTORY_TODAY removes only entries from today', () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000;
    const now = Date.now();
    const initial = createInitialState({
      history: [
        { expression: '1 + 1', result: 2, ts: yesterday },
        { expression: '2 + 2', result: 4, ts: now },
      ],
    });
    const after = dispatch(initial, { type: 'CLEAR_HISTORY_TODAY', payload: now });
    expect(after.history).toHaveLength(1);
    expect(after.history[0].expression).toBe('1 + 1');
  });
  it('CLEAR_HISTORY_TODAY leaves older entries intact', () => {
    const oldTs = Date.now() - 10 * 24 * 60 * 60 * 1000;
    const initial = createInitialState({
      history: [{ expression: '5 × 5', result: 25, ts: oldTs }],
    });
    expect(dispatch(initial, { type: 'CLEAR_HISTORY_TODAY' }).history).toHaveLength(1);
  });
});

describe('voice expression', () => {
  it('sets display to result and enters RESULT state', () => {
    const s = run(createInitialState(), VOICE({ expression: '47 × 89', result: 4183 }));
    expect(s.display).toBe('4183');
    expect(s.state).toBe(State.RESULT);
  });
  it('adds to history with the expression', () => {
    const s = run(createInitialState(), VOICE({ expression: '12 + 30', result: 42 }));
    expect(s.history).toHaveLength(1);
    expect(s.history[0].expression).toBe('12 + 30');
  });
  it('invalid payload → error state', () => {
    expect(dispatch(createInitialState(), VOICE({ expression: 'x', result: NaN })).state).toBe(State.ERROR);
  });
});

// ─── NEW: typed expression mode ────────────────────────────────────────
describe('typed expression mode', () => {
  it('EXPRESSION_INPUT enters expression mode with the given text', () => {
    const s = run(createInitialState(), E_IN('2 + 3 * 4'));
    expect(s.expression).toBe('2 + 3 * 4');
    expect(s.display).toBe('2 + 3 * 4');
  });

  it('DIGIT in expression mode appends to the expression', () => {
    const s = run(createInitialState(), E_IN('12'), D('3'));
    expect(s.expression).toBe('123');
    expect(s.display).toBe('123');
  });

  it('EXPRESSION_EVAL evaluates the whole expression and adds to history', () => {
    const s = run(createInitialState(), E_IN('2 + 3 * 4'), E_EVAL());
    expect(s.display).toBe('14');
    expect(s.state).toBe(State.RESULT);
    expect(s.expression).toBe(null);
    expect(s.history[0].expression).toBe('2 + 3 * 4');
    expect(s.history[0].result).toBe(14);
  });

  it('EXPRESSION_EVAL handles complex precedence', () => {
    const s = run(createInitialState(), E_IN('23 + 4342 * 875 - 234'), E_EVAL());
    expect(Number(s.display)).toBe(3799039);
  });

  it('EXPRESSION_EVAL handles parens', () => {
    const s = run(createInitialState(), E_IN('(2 + 3) * 4'), E_EVAL());
    expect(Number(s.display)).toBe(20);
  });

  it('EXPRESSION_EVAL on invalid expression → Error', () => {
    const s = run(createInitialState(), E_IN('2 +'), E_EVAL());
    expect(s.state).toBe(State.ERROR);
    expect(s.display).toBe('Error');
  });

  it('EXPRESSION_EVAL on division by zero → Error', () => {
    const s = run(createInitialState(), E_IN('5 / 0'), E_EVAL());
    expect(s.state).toBe(State.ERROR);
  });

  it('EXPRESSION_EVAL with empty expression clears expression mode', () => {
    const s = run(createInitialState(), E_IN(''), E_EVAL());
    expect(s.expression).toBe(null);
  });

  it('after EXPRESSION_EVAL, next digit starts fresh', () => {
    const s = run(createInitialState(), E_IN('2 + 3'), E_EVAL(), D('7'));
    expect(s.display).toBe('7');
  });
});