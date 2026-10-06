// src/engine/parser.js
// Parses a token stream into an AST.
//
// Grammar:
//   expression     := additive
//   additive       := multiplicative (('+' | '-') multiplicative)*
//   multiplicative := unary (('*' | '/') unary)*
//   unary          := ('-' | '+' | '√') unary | power
//   power          := postfix ('^' unary)?
//   postfix        := primary '%'?
//   primary        := NUMBER | VAR | CONST | FUNC '(' args ')' | '(' expression ')'

import { TokenType } from './tokenizer.js';

export function parse(tokens) {
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function expect(type, value) {
    const t = peek();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`Expected ${type}${value !== undefined ? `(${value})` : ''}, got ${t.type}(${t.value})`);
    }
    return next();
  }

  function parseExpression() {
    return parseAdditive();
  }

  function parseAdditive() {
    let left = parseMultiplicative();
    while (peek().type === TokenType.OP && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const right = parseMultiplicative();
      left = { type: 'Binary', op, left, right };
    }
    return left;
  }

  function parseMultiplicative() {
    let left = parseUnary();
    while (peek().type === TokenType.OP && (peek().value === '*' || peek().value === '/')) {
      const op = next().value;
      const right = parseUnary();
      left = { type: 'Binary', op, left, right };
    }
    return left;
  }

  function parseUnary() {
    if (peek().type === TokenType.OP && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const arg = parseUnary();
      return { type: 'Unary', op, argument: arg };
    }
    if (peek().type === TokenType.UNARY && peek().value === '√') {
      next();
      const arg = parseUnary();
      return { type: 'Unary', op: '√', argument: arg };
    }
    return parsePower();
  }

  function parsePower() {
    const left = parsePostfix();
    if (peek().type === TokenType.OP && peek().value === '^') {
      next();
      const right = parseUnary();  // right-assoc, allows 2^-3
      return { type: 'Binary', op: '^', left, right };
    }
    return left;
  }

  function parsePostfix() {
    const node = parsePrimary();
    if (peek().type === TokenType.PERCENT) {
      next();
      return { type: 'Postfix', op: '%', argument: node };
    }
    return node;
  }

  function parsePrimary() {
    const t = peek();

    if (t.type === TokenType.NUMBER) { next(); return { type: 'Number', value: t.value }; }

    // CONST now carries the numeric value directly (see tokenizer)
    if (t.type === TokenType.CONST) { next(); return { type: 'Number', value: t.value }; }

    if (t.type === TokenType.VAR) { next(); return { type: 'Variable', name: t.value }; }

    if (t.type === TokenType.FUNC) {
      next();
      expect(TokenType.LPAREN);
      const args = [];
      if (peek().type !== TokenType.RPAREN) {
        args.push(parseExpression());
        while (peek().type === TokenType.COMMA) {
          next();
          args.push(parseExpression());
        }
      }
      expect(TokenType.RPAREN);
      return { type: 'Function', name: t.value, args };
    }

    if (t.type === TokenType.LPAREN) {
      next();
      const inner = parseExpression();
      expect(TokenType.RPAREN);
      return { type: 'Group', argument: inner };
    }

    throw new Error(`Unexpected token: ${t.type}(${t.value})`);
  }

  const ast = parseExpression();
  expect(TokenType.EOF);
  return ast;
}