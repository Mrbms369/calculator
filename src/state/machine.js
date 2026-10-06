// src/state/machine.js
// Finite state machine for the calculator's behavior.

import { calculate, unary } from '../engine/calculator.js';
import { evaluate as evaluateExpression } from '../engine/expression.js';

export const CONSTANTS = Object.freeze({
  'π': Math.PI,
  'e': Math.E,
});

export const ACCENTS = Object.freeze({
  orange: '#ff9500',
  green:  '#2ecc71',
  blue:   '#3b9bff',
  red:    '#ff5252',
  purple: '#a855f7',
  pink:   '#ec4899',
});

export const State = Object.freeze({
  IDLE:             'IDLE',
  ENTERING_FIRST:   'ENTERING_FIRST',
  OPERATOR_PENDING: 'OPERATOR_PENDING',
  ENTERING_SECOND:  'ENTERING_SECOND',
  RESULT:           'RESULT',
  ERROR:            'ERROR',
});

export function createInitialState(overrides = {}) {
  return {
    state: State.IDLE,
    display: '0',
    operand1: null,
    operand2: null,
    operator: null,
    memory: 0,
    history: [],
    expression: null,
    accent: 'orange',
    ...overrides,
  };
}

export function dispatch(state, event) {
  switch (event.type) {
    case 'DIGIT':                return onDigit(state, event.payload);
    case 'DOT':                  return onDot(state);
    case 'OPERATOR':             return onOperator(state, event.payload);
    case 'EQUALS':               return onEquals(state);
    case 'CLEAR':                return onClear(state);
    case 'SIGN':                 return onSign(state);
    case 'PERCENT':              return onPercent(state);
    case 'BACKSPACE':            return onBackspace(state);
    case 'RECALL_HISTORY':       return onRecallHistory(state, event.payload);
    case 'UNARY':                return onUnary(state, event.payload);
    case 'CONSTANT':             return onConstant(state, event.payload);
    case 'CLEAR_HISTORY':        return { ...state, history: [] };
    case 'CLEAR_HISTORY_TODAY':  return onClearHistoryToday(state, event.payload);
    case 'VOICE_EXPRESSION':     return onVoiceExpression(state, event.payload);
    case 'EXPRESSION_INPUT':     return onExpressionInput(state, event.payload);
    case 'EXPRESSION_EVAL':      return onExpressionEval(state);
    case 'SET_ACCENT':           return onSetAccent(state, event.payload);
    case 'MC':                   return { ...state, memory: 0 };
    case 'MR':                   return { ...state, display: String(state.memory), state: State.RESULT };
    case 'M_PLUS':               return { ...state, memory: state.memory + Number(state.display) };
    case 'M_MINUS':              return { ...state, memory: state.memory - Number(state.display) };
    default:                     return state;
  }
}

// ─── Event handlers ───────────────────────────────────────────────────────

function onDigit(state, digit) {
  if (state.expression != null) {
    const next = state.expression === '0' ? digit : state.expression + digit;
    return { ...state, expression: next, display: next };
  }

  if (state.state === State.RESULT || state.state === State.ERROR) {
    return {
      ...state,
      state: State.ENTERING_FIRST,
      display: digit === '0' ? '0' : digit,
      operand1: null, operand2: null, operator: null,
    };
  }
  if (state.state === State.OPERATOR_PENDING) {
    return { ...state, state: State.ENTERING_SECOND, display: digit === '0' ? '0' : digit };
  }
  const current = state.display;
  const next = current === '0' ? digit : current + digit;
  return {
    ...state,
    state: state.state === State.IDLE ? State.ENTERING_FIRST : state.state,
    display: next,
  };
}

function onDot(state) {
  if (state.expression != null) {
    if (state.expression.includes('.')) return state;
    const next = (state.expression || '0') + '.';
    return { ...state, expression: next, display: next };
  }

  if (state.display.includes('.')) return state;
  if (state.state === State.RESULT || state.state === State.ERROR) {
    return {
      ...state, state: State.ENTERING_FIRST, display: '0.',
      operand1: null, operand2: null, operator: null,
    };
  }
  if (state.state === State.OPERATOR_PENDING) {
    return { ...state, state: State.ENTERING_SECOND, display: '0.' };
  }
  return { ...state, display: state.display + '.' };
}

function onOperator(state, op) {
  if (state.expression != null) {
    return {
      ...state,
      expression: state.expression + ' ' + op + ' ',
      display: state.expression + ' ' + op + ' ',
    };
  }

  if (state.state === State.ERROR) return state;
  if (state.state === State.ENTERING_SECOND && state.operator != null && state.operand1 != null) {
    const b = Number(state.display);
    try {
      const result = calculate(state.operator, state.operand1, b);
      return {
        ...state, state: State.OPERATOR_PENDING, display: String(result),
        operand1: result, operand2: null, operator: op,
      };
    } catch {
      return { ...state, state: State.ERROR, display: 'Error' };
    }
  }
  if (state.state === State.OPERATOR_PENDING) {
    return { ...state, operator: op };
  }
  return {
    ...state, state: State.OPERATOR_PENDING,
    operand1: Number(state.display), operator: op,
  };
}

function onEquals(state) {
  if (state.expression != null) return onExpressionEval(state);

  if (state.state === State.ERROR) return state;
  if (state.operator == null || state.operand1 == null) return state;

  // Incomplete expression → Error
  if (state.state !== State.ENTERING_SECOND) {
    return { ...state, state: State.ERROR, display: 'Error' };
  }

  const b = Number(state.display);
  try {
    const result = calculate(state.operator, state.operand1, b);
    const expression = `${state.operand1} ${state.operator} ${b}`;
    return {
      ...state, state: State.RESULT, display: String(result),
      operand1: result, operand2: b, operator: null,
      history: [...state.history, { expression, result, ts: Date.now() }],
    };
  } catch {
    return { ...state, state: State.ERROR, display: 'Error' };
  }
}

function onClear(state) {
  return { ...createInitialState(), memory: state.memory, history: state.history, accent: state.accent };
}

function onSign(state) {
  if (state.expression != null) {
    const e = state.expression;
    const next = e.startsWith('-') ? e.slice(1) : '-' + e;
    return { ...state, expression: next, display: next };
  }

  if (state.state === State.ERROR) return state;
  if (state.display === '0') return state;
  const toggled = state.display.startsWith('-') ? state.display.slice(1) : '-' + state.display;
  return { ...state, display: toggled };
}

function onPercent(state) {
  if (state.expression != null) {
    const next = state.expression + '%';
    return { ...state, expression: next, display: next };
  }

  if (state.state === State.ERROR) return state;
  try {
    const result = unary('%', Number(state.display));
    return { ...state, display: String(result) };
  } catch {
    return { ...state, state: State.ERROR, display: 'Error' };
  }
}

function onBackspace(state) {
  if (state.expression != null) {
    const e = state.expression;
    const next = e.length <= 1 ? '0' : e.slice(0, -1);
    return { ...state, expression: next === '0' ? '0' : next, display: next };
  }

  if (state.state === State.RESULT || state.state === State.ERROR) return state;
  const current = state.display;
  if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
    return { ...state, display: '0' };
  }
  return { ...state, display: current.slice(0, -1) };
}

function onRecallHistory(state, value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return state;
  return {
    ...state, state: State.RESULT, display: String(value),
    operand1: num, operand2: null, operator: null,
    expression: null,
  };
}

function onUnary(state, op) {
  if (state.expression != null) {
    const next = state.expression + op;
    return { ...state, expression: next, display: next };
  }

  if (state.state === State.ERROR) return state;
  const n = Number(state.display);
  if (!Number.isFinite(n)) return { ...state, state: State.ERROR, display: 'Error' };
  try {
    const result = unary(op, n);
    if (!Number.isFinite(result)) return { ...state, state: State.ERROR, display: 'Error' };
    return {
      ...state, state: State.RESULT, display: String(result),
      operand1: result, operand2: null, operator: null,
    };
  } catch {
    return { ...state, state: State.ERROR, display: 'Error' };
  }
}

function onConstant(state, symbol) {
  const value = CONSTANTS[symbol];
  if (value == null) return state;

  if (state.expression != null) {
    const next = state.expression + symbol;
    return { ...state, expression: next, display: next };
  }

  return {
    ...state, state: State.RESULT, display: String(value),
    operand1: value, operand2: null, operator: null,
  };
}

function onClearHistoryToday(state, referenceTs = Date.now()) {
  const startOfToday = new Date(referenceTs);
  startOfToday.setHours(0, 0, 0, 0);
  const cutoff = startOfToday.getTime();
  return { ...state, history: state.history.filter(h => (h.ts ?? 0) < cutoff) };
}

function onVoiceExpression(state, payload) {
  if (!payload || typeof payload.expression !== 'string') return state;
  const { expression, result } = payload;
  if (!Number.isFinite(result)) {
    return { ...state, state: State.ERROR, display: 'Error' };
  }
  return {
    ...state,
    state: State.RESULT,
    display: String(result),
    operand1: result,
    operand2: null,
    operator: null,
    expression: null,
    history: [...state.history, { expression, result, ts: Date.now() }],
  };
}

function onExpressionInput(state, payload) {
  const text = typeof payload === 'string' ? payload : state.display;
  return { ...state, expression: text, display: text };
}

function onExpressionEval(state) {
  const expr = state.expression;
  if (expr == null || expr.trim() === '') {
    return { ...state, expression: null };
  }

  try {
    const result = evaluateExpression(expr);
    if (!Number.isFinite(result)) {
      return { ...state, state: State.ERROR, display: 'Error', expression: null };
    }
    return {
      ...state,
      state: State.RESULT,
      display: String(result),
      operand1: result,
      operand2: null,
      operator: null,
      expression: null,
      history: [...state.history, { expression: expr, result, ts: Date.now() }],
    };
  } catch (err) {
    return { ...state, state: State.ERROR, display: 'Error', expression: null };
  }
}

/**
 * Set the accent color.
 * Payload: 'orange' | 'green' | 'blue' | 'red' | 'purple' | 'pink'
 */
function onSetAccent(state, payload) {
  if (!ACCENTS[payload]) return state;
  return { ...state, accent: payload };
}