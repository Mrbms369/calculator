// src/engine/parser.js
// Parses a token stream into an Abstract Syntax Tree (AST).
// Grammar (highest precedence binds tightest):
//
//   expression := term (('+' | '-') term)*
//   term       := factor (('*' | '/') factor)*
//   factor     := ('-' | '+') factor | postfix
//   postfix    := primary '%'?                        (postfix percent)
//   primary    := NUMBER | CONST | '(' expression ')' | UNARY primary
//

import { TokenType } from './tokenizer.js';

/**
 * @typedef {Object} Node
 * @property {string} type   'Number' | 'Binary' | 'Unary' | 'Postfix' | 'Group'
 * @property {any}    [value]
 * @property {Node}   [left]
 * @property {Node}   [right]
 * @property {Node}   [argument]
 * @property {string} [op]
 */

/**
 * Parse tokens into an AST.
 * @param {Array<{type: string, value: any}>} tokens
 * @returns {Node}
 */
export function parse(tokens) {
  let pos = 0;

  function peek() { return tokens[pos]; }
  function next() { return tokens[pos++]; }
  function expect(type, value) {
    const t = peek();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`Expected ${type}${value !== undefined ? `(${value})` : ''}, got ${t.type}(${t.value})`);
    }
    return next();
  }

  function parseExpression() {
    let left = parseTerm();
    while (peek().type === TokenType.OP && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const right = parseTerm();
      left = { type: 'Binary', op, left, right };
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (peek().type === TokenType.OP && (peek().value === '*' || peek().value === '/')) {
      const op = next().value;
      const right = parseFactor();
      left = { type: 'Binary', op, left, right };
    }
    return left;
  }

  function parseFactor() {
    // Unary plus/minus
    if (peek().type === TokenType.OP && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const argument = parseFactor();
      return { type: 'Unary', op, argument };
    }
    return parsePostfix();
  }

  function parsePostfix() {
    const node = parsePrimary();
    // Allow only one postfix % (e.g. 50%) — chainable is uncommon
    if (peek().type === TokenType.PERCENT) {
      next();
      return { type: 'Postfix', op: '%', argument: node };
    }
    return node;
  }

  function parsePrimary() {
    const t = peek();

    if (t.type === TokenType.NUMBER) {
      next();
      return { type: 'Number', value: t.value };
    }

    if (t.type === TokenType.CONST) {
      next();
      return { type: 'Number', value: t.value };
    }

    if (t.type === TokenType.UNARY) {           // √
      const op = next().value;
      const argument = parsePrimary();
      return { type: 'Unary', op, argument };
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