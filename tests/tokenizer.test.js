import { describe, it, expect } from 'vitest';
import { tokenize, TokenType } from '../src/engine/tokenizer.js';

const types = (tokens) => tokens.map(t => t.type);
const values = (tokens) => tokens.map(t => t.value);

describe('tokenizer — numbers', () => {
  it('single integer', () => {
    const t = tokenize('42');
    expect(t[0]).toMatchObject({ type: TokenType.NUMBER, value: 42 });
    expect(t[1].type).toBe(TokenType.EOF);
  });

  it('decimal', () => {
    expect(tokenize('3.14')[0]).toMatchObject({ type: TokenType.NUMBER, value: 3.14 });
  });

  it('leading dot', () => {
    expect(tokenize('.5')[0]).toMatchObject({ type: TokenType.NUMBER, value: 0.5 });
  });

  it('rejects double dots', () => {
    expect(() => tokenize('1.2.3')).toThrow(/Invalid number/);
  });
});

describe('tokenizer — operators', () => {
  it('recognizes + - * /', () => {
    expect(values(tokenize('1+2-3*4/5')).slice(0, 9)).toEqual([
      1, '+', 2, '-', 3, '*', 4, '/', 5
    ]);
  });

  it('normalizes × and ÷', () => {
    expect(values(tokenize('2×3÷4'))).toEqual([2, '*', 3, '/', 4, null]);
  });

  it('normalizes unicode minus', () => {
    expect(values(tokenize('5−3'))).toEqual([5, '-', 3, null]);
  });
});

describe('tokenizer — parens, unary, percent', () => {
  it('parens', () => {
    expect(types(tokenize('(1)'))).toEqual([
      TokenType.LPAREN, TokenType.NUMBER, TokenType.RPAREN, TokenType.EOF
    ]);
  });

  it('square root', () => {
    expect(types(tokenize('√9'))).toEqual([
      TokenType.UNARY, TokenType.NUMBER, TokenType.EOF
    ]);
  });

  it('percent postfix', () => {
    expect(types(tokenize('50%'))).toEqual([
      TokenType.NUMBER, TokenType.PERCENT, TokenType.EOF
    ]);
  });
});

describe('tokenizer — constants', () => {
  it('π is CONST with numeric value', () => {
    const t = tokenize('π');
    expect(t[0].type).toBe(TokenType.CONST);
    expect(t[0].value).toBeCloseTo(Math.PI, 10);
  });

  it('pi is CONST with numeric value', () => {
    const t = tokenize('pi');
    expect(t[0].type).toBe(TokenType.CONST);
    expect(t[0].value).toBeCloseTo(Math.PI, 10);
  });

  it('e is CONST with numeric value', () => {
    const t = tokenize('e');
    expect(t[0].type).toBe(TokenType.CONST);
    expect(t[0].value).toBeCloseTo(Math.E, 10);
  });

  it('tau is 2π', () => {
    const t = tokenize('tau');
    expect(t[0].type).toBe(TokenType.CONST);
    expect(t[0].value).toBeCloseTo(2 * Math.PI, 10);
  });
});

describe('tokenizer — functions', () => {
  it('sin is FUNC', () => {
    const t = tokenize('sin(0)');
    expect(t[0]).toMatchObject({ type: TokenType.FUNC, value: 'sin' });
  });

  it('longest function name wins: log2 over log', () => {
    const t = tokenize('log2(8)');
    expect(t[0]).toMatchObject({ type: TokenType.FUNC, value: 'log2' });
  });

  it('sqrt is FUNC', () => {
    const t = tokenize('sqrt(4)');
    expect(t[0]).toMatchObject({ type: TokenType.FUNC, value: 'sqrt' });
  });
});

describe('tokenizer — variables', () => {
  it('x is VAR', () => {
    const t = tokenize('x');
    expect(t[0]).toMatchObject({ type: TokenType.VAR, value: 'x' });
  });

  it('2x → NUMBER, VAR', () => {
    const t = tokenize('2x');
    expect(t.slice(0, 2).map(tok => tok.type)).toEqual([TokenType.NUMBER, TokenType.VAR]);
  });

  it('xsin splits into VAR + FUNC', () => {
    const t = tokenize('xsin(0)');
    expect(t[0]).toMatchObject({ type: TokenType.VAR, value: 'x' });
    expect(t[1]).toMatchObject({ type: TokenType.FUNC, value: 'sin' });
  });
});

describe('tokenizer — errors', () => {
  it('unknown character', () => {
    expect(() => tokenize('2 @ 3')).toThrow(/Unexpected character/);
  });

  it('empty input', () => {
    expect(() => tokenize('')).toThrow(/Empty expression/);
  });

  it('unknown name', () => {
    expect(() => tokenize('foo(x)')).toThrow(/Unknown name/);
  });
});