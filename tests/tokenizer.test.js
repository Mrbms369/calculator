import { describe, it, expect } from 'vitest';
import { tokenize, TokenType } from '../src/engine/tokenizer.js';

const types = (tokens) => tokens.map(t => t.type);
const values = (tokens) => tokens.map(t => t.value);

describe('tokenizer — numbers', () => {
  it('single integer', () => {
    const t = tokenize('42');
    expect(t[0]).toEqual({ type: TokenType.NUMBER, value: 42 });
    expect(t[1].type).toBe(TokenType.EOF);
  });

  it('decimal', () => {
    expect(tokenize('3.14')[0]).toEqual({ type: TokenType.NUMBER, value: 3.14 });
  });

  it('leading dot', () => {
    expect(tokenize('.5')[0]).toEqual({ type: TokenType.NUMBER, value: 0.5 });
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
});

describe('tokenizer — parens, unary, percent, constants', () => {
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

  it('π', () => {
    const t = tokenize('π');
    expect(t[0].type).toBe(TokenType.CONST);
    expect(t[0].value).toBeCloseTo(Math.PI, 10);
  });
});

describe('tokenizer — errors', () => {
  it('unknown character', () => {
    expect(() => tokenize('2 @ 3')).toThrow(/Unexpected character/);
  });

  it('empty input', () => {
    expect(() => tokenize('')).toThrow(/Empty expression/);
  });
});