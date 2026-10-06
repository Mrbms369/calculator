// src/engine/graphMath.js
// Compiles a user expression string into a callable function.
// Uses a TOKENIZER + REBUILDER approach — robust against edge cases.
//
// Why not string substitution? Because 2sin(x), log2(x), xsin(x), (x+1)(x-1),
// arcsin(x), √x, 2π all have subtle conflicts when replaced with regexes.
// Working with typed tokens eliminates the whole class of bugs.

// ─── Definitions ────────────────────────────────────────────────────────

// Names the user can write. "x" is the variable; everything else is a
// function or a constant.
const FUNCTIONS = {
  // trig
  sin:   'Math.sin',
  cos:   'Math.cos',
  tan:   'Math.tan',
  cot:   { type: 'reciprocal', inner: 'Math.tan' },
  sec:   { type: 'reciprocal', inner: 'Math.cos' },
  csc:   { type: 'reciprocal', inner: 'Math.sin' },
  // inverse trig
  asin:  'Math.asin',
  acos:  'Math.acos',
  atan:  'Math.atan',
  arcsin:'Math.asin',
  arccos:'Math.acos',
  arctan:'Math.atan',
  // hyperbolic
  sinh:  'Math.sinh',
  cosh:  'Math.cosh',
  tanh:  'Math.tanh',
  asinh: 'Math.asinh',
  acosh: 'Math.acosh',
  atanh: 'Math.atanh',
  // powers & roots
  sqrt:  'Math.sqrt',
  cbrt:  'Math.cbrt',
  abs:   'Math.abs',
  exp:   'Math.exp',
  pow:   'Math.pow',
  mod:   { type: 'helper', name: 'mod' },
  // logs
  log:   'Math.log',
  ln:    'Math.log',
  log2:  'Math.log2',
  log10: 'Math.log10',
  // rounding & sign
  floor: 'Math.floor',
  ceil:  'Math.ceil',
  round: 'Math.round',
  trunc: 'Math.trunc',
  sign:  'Math.sign',
  // aggregation
  min:   'Math.min',
  max:   'Math.max',
};

const CONSTANTS = {
  PI:  'Math.PI',
  pi:  'Math.PI',
  E:   'Math.E',
  e:   'Math.E',
  tau: '(2 * Math.PI)',
  phi: '1.618033988749895',
};

const FUNC_NAMES = Object.keys(FUNCTIONS).sort((a, b) => b.length - a.length);
const CONST_NAMES = Object.keys(CONSTANTS).sort((a, b) => b.length - a.length);

// ─── Token types ────────────────────────────────────────────────────────
const T = {
  NUMBER:   'NUMBER',
  FUNC:     'FUNC',     // named function, e.g. sin, arcsin
  CONST:    'CONST',    // named constant, e.g. PI, e
  VAR:      'VAR',      // "x"
  OP:       'OP',       // + - * / % ^
  LPAREN:   'LPAREN',
  RPAREN:   'RPAREN',
  COMMA:    'COMMA',
  SQRT:     'SQRT',     // √ as unary prefix
};

// ─── Tokenizer ──────────────────────────────────────────────────────────
function tokenize(input) {
  const tokens = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // Number
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(input[i + 1] || ''))) {
      let j = i;
      while (j < input.length && /[0-9.]/.test(input[j])) j++;
      const raw = input.slice(i, j);
      if ((raw.match(/\./g) || []).length > 1) {
        throw new Error(`Invalid number: ${raw}`);
      }
      tokens.push({ type: T.NUMBER, value: raw });
      i = j;
      continue;
    }

    // Identifier (function, constant, or variable)
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < input.length && /[A-Za-z0-9_]/.test(input[j])) j++;
      const name = input.slice(i, j);

      // Try longest match: e.g. "log10" before "log"
      if (name === 'x') {
        tokens.push({ type: T.VAR, value: 'x' });
      } else if (FUNCTIONS[name]) {
        tokens.push({ type: T.FUNC, value: name });
      } else if (CONSTANTS[name]) {
        tokens.push({ type: T.CONST, value: name });
      } else {
        // Try splitting compound like "xsin" → but we handle that via adjacency rules.
        // Here we look for function/const prefixes.
        // First check if the whole token is a known func or const — if not, split.
        const split = trySplitCompound(name);
        if (split) {
          // Replace input slice with the split (identifiers separated by spaces)
          input = input.slice(0, i) + split + input.slice(j);
          // Do not advance — the next loop iteration will tokenize the first part
          continue;
        }
        throw new Error(`Unknown name: "${name}"`);
      }
      i = j;
      continue;
    }

    // Operators
    if ('+-*/%^'.includes(ch)) {
      tokens.push({ type: T.OP, value: ch });
      i++;
      continue;
    }

    // Parens
    if (ch === '(') { tokens.push({ type: T.LPAREN }); i++; continue; }
    if (ch === ')') { tokens.push({ type: T.RPAREN }); i++; continue; }
    if (ch === ',') { tokens.push({ type: T.COMMA }); i++; continue; }

    // Unicode
    if (ch === '√') { tokens.push({ type: T.SQRT }); i++; continue; }
    if (ch === 'π') { tokens.push({ type: T.CONST, value: 'PI' }); i++; continue; }

    throw new Error(`Unexpected character: "${ch}"`);
  }

  return tokens;
}

/**
 * Try to split a compound identifier like "xsin" or "xarcsin" into
 * "x sin" / "x arcsin". Returns the split string or null.
 */
function trySplitCompound(name) {
  // Only split if the whole thing isn't valid. Try removing one
  // leading character at a time and see if the rest is a valid FUNC or CONST.
  for (let splitAt = 1; splitAt < name.length; splitAt++) {
    const left = name.slice(0, splitAt);
    const right = name.slice(splitAt);
    if (left === 'x' && (FUNCTIONS[right] || CONSTANTS[right])) {
      return `x ${right}`;
    }
  }
  return null;
}

// ─── Implicit multiplication ────────────────────────────────────────────
/**
 * Insert synthetic OP(*) tokens where implicit multiplication appears.
 * Rules (adjacent pairs that should multiply):
 *   NUMBER  followed by VAR | FUNC | CONST | LPAREN | SQRT
 *   VAR     followed by VAR | FUNC | CONST | LPAREN | NUMBER | SQRT
 *   RPAREN  followed by NUMBER | VAR | FUNC | CONST | LPAREN | SQRT
 *   CONST   followed by NUMBER | VAR | FUNC | LPAREN | SQRT
 *
 * We do NOT insert between:
 *   FUNC followed by LPAREN (that's a call)
 *   FUNC followed by VAR (that's ambiguous, but usually a call without parens — treat as error)
 */
function insertImplicitMultiplication(tokens) {
  const out = [];

  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i];
    const prev = out[out.length - 1];

    if (prev && shouldInsertBetween(prev, cur)) {
      out.push({ type: T.OP, value: '*' });
    }
    out.push(cur);
  }

  return out;
}

function shouldInsertBetween(prev, cur) {
  const isValueEnd = (t) =>
    t.type === T.NUMBER ||
    t.type === T.VAR ||
    t.type === T.RPAREN ||
    t.type === T.CONST;

  const isValueStart = (t) =>
    t.type === T.NUMBER ||
    t.type === T.VAR ||
    t.type === T.LPAREN ||
    t.type === T.SQRT ||
    t.type === T.CONST;

  // Number/var/const before a function → multiply (2sin, xsin)
  if (isValueEnd(prev) && cur.type === T.FUNC) return true;

  // Number/var/rparen/const before value start
  if (isValueEnd(prev) && isValueStart(cur)) return true;

  return false;
}

// ─── Rebuilder ──────────────────────────────────────────────────────────
/**
 * Rebuild a JS expression string from tokens.
 * Translates FUNC and CONST tokens to their Math.* equivalents.
 */
function rebuild(tokens) {
  const parts = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const next = tokens[i + 1];

    switch (tok.type) {
      case T.NUMBER:
        parts.push(tok.value);
        break;

      case T.VAR:
        parts.push('x');
        break;

      case T.CONST: {
        const name = tok.value;
        parts.push(`(${CONSTANTS[name] ?? CONSTANTS.PI})`);
        break;
      }

      case T.FUNC: {
        const name = tok.value;
        const impl = FUNCTIONS[name];

        if (typeof impl === 'string') {
          // Simple Math.* mapping: sin(x) → Math.sin(x)
          parts.push(impl);
        } else if (impl && impl.type === 'reciprocal') {
          // cot(x) → (1 / Math.tan(x))
          // Wrap the argument of the following (...) call.
          // We know the next token(s) form a paren-group; consume them.
          const group = consumeParenGroup(tokens, i + 1);
          if (!group) {
            throw new Error(`Expected "(" after function ${name}`);
          }
          parts.push(`(1 / ${impl.inner}`);
          parts.push(...group.rendered);
          parts.push(')');
          i = group.endIndex;
        } else if (impl && impl.type === 'helper') {
          parts.push(impl.name);
        } else {
          throw new Error(`Unknown function: ${name}`);
        }
        break;
      }

      case T.OP:
        // JS uses ** for exponent
        parts.push(tok.value === '^' ? '**' : tok.value);
        break;

      case T.LPAREN:
        parts.push('(');
        break;

      case T.RPAREN:
        parts.push(')');
        break;

      case T.COMMA:
        parts.push(',');
        break;

      case T.SQRT: {
        // √ is a prefix operator; wrap the next primary.
        // Simplest approach: replace with Math.sqrt and let the parser see
        // "Math.sqrt<primary>". We need to insert a paren around the argument.
        // Strategy: peek the next token. If it's LPAREN, we let the parser
        // handle "Math.sqrt(...)" naturally — just emit "Math.sqrt" and it
        // will be called with the following group.
        // If it's a number or var, we wrap it in parens.
        const n = tokens[i + 1];
        if (!n) throw new Error('√ needs an argument');
        if (n.type === T.LPAREN) {
          parts.push('Math.sqrt');
          // The LPAREN will be emitted in the next iteration
        } else if (n.type === T.NUMBER) {
          parts.push(`Math.sqrt(${n.value})`);
          i++;
        } else if (n.type === T.VAR) {
          parts.push(`Math.sqrt(x)`);
          i++;
        } else if (n.type === T.FUNC) {
          // √sin(x) → Math.sqrt(Math.sin(x))
          // Handle by wrapping the function call
          parts.push(`Math.sqrt(`);
          // Let the function and its group be emitted next
          // We need to close the paren after the function call — track depth.
          // Simplest: call recursively is overkill. Instead just insert closing later.
          // For simplicity, we treat √func(...) by deferring the closing paren
          // to the following RPAREN of the function.
          throw new Error('√ of a function is not supported yet');
        } else {
          throw new Error('√ needs a number, variable, or paren');
        }
        break;
      }

      default:
        throw new Error(`Unexpected token: ${tok.type}`);
    }
  }

  return parts.join('');
}

/**
 * Consume a balanced (...) group starting at index start.
 * Returns { rendered: string[], endIndex: number } or null.
 */
function consumeParenGroup(tokens, start) {
  if (tokens[start]?.type !== T.LPAREN) return null;

  const rendered = ['('];
  let depth = 1;
  let i = start + 1;

  while (i < tokens.length && depth > 0) {
    const t = tokens[i];
    if (t.type === T.LPAREN) depth++;
    else if (t.type === T.RPAREN) depth--;

    if (depth === 0) break;

    switch (t.type) {
      case T.NUMBER: rendered.push(t.value); break;
      case T.VAR: rendered.push('x'); break;
      case T.CONST: rendered.push(`(${CONSTANTS[t.value]})`); break;
      case T.FUNC: rendered.push(FUNCTIONS[t.value]); break;
      case T.OP: rendered.push(t.value === '^' ? '**' : t.value); break;
      case T.LPAREN: rendered.push('('); break;
      case T.RPAREN: rendered.push(')'); break;
      case T.COMMA: rendered.push(','); break;
      case T.SQRT: rendered.push('Math.sqrt'); break;
      default: throw new Error(`Unexpected token in group: ${t.type}`);
    }
    i++;
  }

  rendered.push(')');
  return { rendered, endIndex: i };
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Compile a user expression string into a callable function.
 * @param {string} input
 * @returns {(x: number) => number}
 */
export function compileFunction(input) {
  if (typeof input !== 'string') throw new Error('Expression must be a string');
  let s = input.trim();
  if (!s) throw new Error('Empty expression');

  // Strip "y = ..." prefix
  s = s.replace(/^\s*y\s*=\s*/i, '');

  // Tokenize
  const rawTokens = tokenize(s);

  // Insert implicit multiplication
  const tokens = insertImplicitMultiplication(rawTokens);

  // Rebuild JS expression
  const jsExpr = rebuild(tokens);

  // Compile
  const mod = (a, b) => ((a % b) + b) % b;

  let inner;
  try {
    inner = new Function('x', 'mod', `"use strict"; return (${jsExpr});`);
  } catch (err) {
    throw new Error(`Syntax error: ${err.message}`);
  }

  const fn = (x) => inner(x, mod);

  // Smoke test
  try {
    const testVal = fn(0);
    if (typeof testVal !== 'number') throw new Error('Did not return a number');
  } catch (err) {
    throw new Error(`Expression failed at x=0: ${err.message}`);
  }

  return fn;
}

// ─── Sampling & range ───────────────────────────────────────────────────

export function sampleFunction(fn, xMin, xMax, samples = 600) {
  const pts = [];
  const dx = (xMax - xMin) / (samples - 1);
  for (let i = 0; i < samples; i++) {
    const x = xMin + i * dx;
    let y;
    try { y = fn(x); } catch { y = NaN; }
    pts.push({ x, y: Number.isFinite(y) ? y : NaN });
  }
  return pts;
}

export function robustYRange(pts, percentile = 0.05) {
  const finite = pts.map(p => p.y).filter(Number.isFinite).sort((a, b) => a - b);
  if (finite.length === 0) return { yMin: -10, yMax: 10 };

  const lo = finite[Math.floor(finite.length * percentile)];
  const hi = finite[Math.floor(finite.length * (1 - percentile))];

  if (lo === hi) return { yMin: lo - 1, yMax: hi + 1 };

  const pad = (hi - lo) * 0.1;
  return { yMin: lo - pad, yMax: hi + pad };
}