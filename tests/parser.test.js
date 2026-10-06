import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/engine/tokenizer.js';
import { parse } from '../src/engine/parser.js';

const ast = (s) => parse(tokenize(s));

describe('parser — precedence', () => {
  it('2 + 3 * 4 → Binary(+, 2, Binary(*, 3, 4))', () => {
    const tree = ast('2 + 3 * 4');
    expect(tree.type).toBe('Binary');
    expect(tree.op).toBe('+');
    expect(tree.left).toEqual({ type: 'Number', value: 2 });
    expect(tree.right.type).toBe('Binary');
    expect(tree.right.op).toBe('*');
  });

  it('2 * 3 + 4 → Binary(+, Binary(*, 2, 3), 4)', () => {
    const tree = ast('2 * 3 + 4');
    expect(tree.op).toBe('+');
    expect(tree.left.op).toBe('*');
    expect(tree.right).toEqual({ type: 'Number', value: 4 });
  });
});

describe('parser — grouping', () => {
  it('(2 + 3) * 4 → Binary(*, Group(+), 4)', () => {
    const tree = ast('(2 + 3) * 4');
    expect(tree.op).toBe('*');
    expect(tree.left.type).toBe('Group');
    expect(tree.left.argument.op).toBe('+');
  });
});

describe('parser — unary', () => {
  it('-5 + 3 → Binary(+, Unary(-, 5), 3)', () => {
    const tree = ast('-5 + 3');
    expect(tree.op).toBe('+');
    expect(tree.left.type).toBe('Unary');
    expect(tree.left.op).toBe('-');
  });

  it('√9 → Unary(√, 9)', () => {
    const tree = ast('√9');
    expect(tree).toEqual({ type: 'Unary', op: '√', argument: { type: 'Number', value: 9 } });
  });
});

describe('parser — postfix percent', () => {
  it('50% → Postfix(%, 50)', () => {
    const tree = ast('50%');
    expect(tree.type).toBe('Postfix');
    expect(tree.op).toBe('%');
    expect(tree.argument).toEqual({ type: 'Number', value: 50 });
  });
});

describe('parser — errors', () => {
  it('unmatched paren', () => {
    expect(() => ast('(2 + 3')).toThrow(/Expected RPAREN/);
  });

  it('trailing operator', () => {
    expect(() => ast('2 +')).toThrow();
  });
});