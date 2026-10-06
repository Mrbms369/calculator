// src/engine/graphMath.js
// Compiles a user expression string (in terms of x) into a real callable function.
// Uses new Function() — no eval() — with a strict whitelist of allowed names.
// Supports IMPLICIT MULTIPLICATION (2x, 3sin(x), (x+1)(x-1), 2π, etc.).

// ─── Function name whitelist (what the user can type) ────────────────────
const ALLOWED_NAMES = new Set([
  // variable
  'x',

  // trig
  'sin', 'cos', 'tan',
  'cot', 'sec', 'csc',

  // inverse trig
  'asin', 'acos', 'atan',
  'arcsin', 'arccos', 'arctan',

  // hyperbolic
  'sinh', 'cosh', 'tanh',
  'asinh', 'acosh', 'atanh',

  // powers & roots
  'sqrt', 'cbrt', 'pow',
  'exp', 'abs',

  // logs
  'log', 'ln', 'log2', 'log10',

  // rounding & sign
  'floor', 'ceil', 'round', 'trunc', 'sign',

  // aggregation
  'min', 'max', 'mod',

  // constants
  'PI', 'pi', 'E', 'e', 'tau', 'phi',
]);

// ─── Constants mapped to their numeric value expression ──────────────────
const MATH_CONSTANTS = {
  PI:  'Math.PI',
  pi:  'Math.PI',
  E:   'Math.E',
  e:   'Math.E',
  tau: '(2 * Math.PI)',
  phi: '1.618033988749895',
};

// ─── Functions mapped to their implementation ─────────────────────────────
// For cot/sec/csc we wrap in parens so the * argument * is included:
//   cot(x) → (1 / Math.tan(x))
// This is handled by a special pass before generic replacement.
const MATH_FUNCTIONS = {
  sin:   'Math.sin',
  cos:   'Math.cos',
  tan:   'Math.tan',
  asin:  'Math.asin',
  acos:  'Math.acos',
  atan:  'Math.atan',
  arcsin:'Math.asin',
  arccos:'Math.acos',
  arctan:'Math.atan',
  sinh:  'Math.sinh',
  cosh:  'Math.cosh',
  tanh:  'Math.tanh',
  asinh: 'Math.asinh',
  acosh: 'Math.acosh',
  atanh: 'Math.atanh',
  sqrt:  'Math.sqrt',
  cbrt:  'Math.cbrt',
  abs:   'Math.abs',
  exp:   'Math.exp',
  log:   'Math.log',
  ln:    'Math.log',
  log2:  'Math.log2',
  log10: 'Math.log10',
  floor: 'Math.floor',
  ceil:  'Math.ceil',
  round: 'Math.round',
  trunc: 'Math.trunc',
  sign:  'Math.sign',
  min:   'Math.min',
  max:   'Math.max',
  pow:   'Math.pow',
  mod:   'mod',
};

// Reciprocal trig handled by a dedicated pass below
const RECIPROCAL_TRIG = {
  cot: 'Math.tan',
  sec: 'Math.cos',
  csc: 'Math.sin',
};

/**
 * Compile a user expression string into a callable function.
 * @param {string} input  e.g. "2sin(x) + x^2"
 * @returns {(x: number) => number}
 * @throws {Error} on invalid syntax or forbidden identifiers
 */
export function compileFunction(input) {
  if (typeof input !== 'string') throw new Error('Expression must be a string');
  let s = input.trim();
  if (!s) throw new Error('Empty expression');

  // Allow "y = ..." prefix
  s = s.replace(/^\s*y\s*=\s*/i, '');

  // Support π and ° as symbols (turn into named tokens for the parser)
  s = s.replace(/π/g, ' pi ');
  s = s.replace(/√/g, ' sqrt ');

  // ─── 1. Validate identifiers ──────────────────────────────────────────
  const identifiers = s.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  for (const id of identifiers) {
    if (!ALLOWED_NAMES.has(id)) {
      throw new Error(`Unknown name: "${id}"`);
    }
  }

  // ─── 2. Handle reciprocal trig (needs arg wrap) ───────────────────────
  // Pattern: cot(EXPR) → (1 / Math.tan(EXPR))
  // We do a paren-matching replacement to safely wrap nested expressions.
  s = replaceReciprocalTrig(s);

  // ─── 3. Convert ^ to ** (exponentiation) ──────────────────────────────
  s = s.replace(/\^/g, '**');

  // ─── 4. Insert implicit multiplication ────────────────────────────────
  s = insertImplicitMultiplication(s);

  // ─── 5. Replace function names and constants ──────────────────────────
  s = s.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (match) => {
    if (MATH_FUNCTIONS[match]) return MATH_FUNCTIONS[match];
    if (MATH_CONSTANTS[match]) return MATH_CONSTANTS[match];
    return match;
  });

  // ─── 6. Final character sanity check ──────────────────────────────────
  const cleaned = s.replace(/Math\./g, '').replace(/\bmod\b/g, '');
  if (/[^0-9a-zA-Z+\-*/%().,^<>=!?\s]/.test(cleaned)) {
    throw new Error('Expression contains invalid characters');
  }

  // ─── 7. Final identifier whitelist after transform ────────────────────
  const remainingIds = s.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  const ALLOWED_AFTER = new Set([
    'x', 'Math', 'mod',
    'sin','cos','tan','asin','acos','atan',
    'sinh','cosh','tanh','asinh','acosh','atanh',
    'sqrt','cbrt','abs','exp','log','log2','log10',
    'floor','ceil','round','trunc','sign','min','max','pow',
    'PI','E',
  ]);
  for (const id of remainingIds) {
    if (!ALLOWED_AFTER.has(id)) {
      throw new Error(`Forbidden name: "${id}"`);
    }
  }

  // ─── 8. Compile ───────────────────────────────────────────────────────
  const mod = (a, b) => ((a % b) + b) % b;

  let fn;
  try {
    const inner = new Function('x', 'mod', `"use strict"; return (${s});`);
    fn = (x) => inner(x, mod);
  } catch (err) {
    throw new Error(`Syntax error: ${err.message}`);
  }

  // Smoke test
  try {
    const testVal = fn(0);
    if (typeof testVal !== 'number') throw new Error('Did not return a number');
  } catch (err) {
    throw new Error(`Expression failed at x=0: ${err.message}`);
  }

  return fn;
}

/**
 * Insert * where the user wrote implicit multiplication.
 * Handles:
 *   - number followed by identifier: 2x → 2*x ; 2sin → 2*sin
 *   - number followed by ( : 2(x+1) → 2*(x+1)
 *   - ) followed by ( or identifier or number: (x+1)(x-1) → (x+1)*(x-1) ; (x+1)2 → (x+1)*2
 *   - identifier followed by ( : x(x+1) → x*(x+1) — careful: don't break sin(x)!
 *     (we already treat known function names specially — see below)
 *   - identifier followed by identifier: xsin(x) → x*sin(x) — tricky
 *   - ) followed by identifier: (x+1)sin(x) → (x+1)*sin(x)
 *
 * The safe approach: only insert * between:
 *   - digit and letter     (2x)
 *   - digit and (          (2(…))
 *   - ) and digit          )(2)
 *   - ) and letter         )x
 *   - ) and (              )(
 *   - letter (variable x) and digit
 *   - letter (variable x) and (
 * We must NOT insert between a function name and its argument: sin(x)
 */
function insertImplicitMultiplication(s) {
  // Strategy: tokenize by "units" and insert * between adjacent units that
  // shouldn't be concatenated. We work right-to-left to avoid shifts.

  // Pass 1: number followed by a letter or ( → 2x → 2*x, 2( → 2*(
  //         But careful: don't split function names, so only do this when the
  //         letter that follows starts a NEW token (not part of a number).
  s = s.replace(/(\d)\s*([A-Za-z_])/g, '$1*$2');   // 2x, 2sin, 2pi
  s = s.replace(/(\d)\s*\(/g, '$1*(');             // 2(3+4)

  // Pass 2: ) followed by ( or letter or digit → )*(, )*x, )*2
  s = s.replace(/\)\s*\(/g, ')*(');
  s = s.replace(/\)\s*([A-Za-z_])/g, ')*$1');      // )x → )*x, )sin → )*sin
  s = s.replace(/\)\s*(\d)/g, ')*$1');             // )2 → )*2

  // Pass 3: variable x followed by letter or ( — but NOT if the x is part
  //         of a longer identifier (like "max")
  //         Also handle x followed by ( — but skip known function names.
  s = s.replace(/\bx\s*\(/g, 'x*(');               // x(3+4) → x*(3+4)

  // Pass 4: variable x followed by a function name: xsin(x) → x*sin(x)
  //         Only apply when x is followed directly by a known function word.
  const fnNames = Object.keys(MATH_FUNCTIONS).concat(Object.keys(RECIPROCAL_TRIG));
  for (const fn of fnNames) {
    const re = new RegExp(`\\bx${fn}\\b`, 'g');
    s = s.replace(re, `x*${fn}`);
  }

  return s;
}

/**
 * Replace cot(EXPR), sec(EXPR), csc(EXPR) with (1 / Math.tan(EXPR)) etc.
 * Uses paren matching to find the full argument.
 */
function replaceReciprocalTrig(s) {
  const fns = ['cot', 'sec', 'csc'];
  let result = '';
  let i = 0;

  while (i < s.length) {
    let matched = false;
    for (const fn of fns) {
      if (s.slice(i, i + fn.length) === fn && /[\s(]/.test(s[i + fn.length] || ' ')) {
        // Look ahead for the opening paren
        let j = i + fn.length;
        while (j < s.length && /\s/.test(s[j])) j++;
        if (s[j] === '(') {
          // Match parens
          let depth = 0;
          let k = j;
          for (; k < s.length; k++) {
            if (s[k] === '(') depth++;
            else if (s[k] === ')') { depth--; if (depth === 0) break; }
          }
          if (depth === 0) {
            const inner = s.slice(j + 1, k);
            result += `(1 / ${RECIPROCAL_TRIG[fn]}(${inner}))`;
            i = k + 1;
            matched = true;
            break;
          }
        }
      }
    }
    if (!matched) {
      result += s[i];
      i++;
    }
  }

  return result;
}

/**
 * Sample the function across a domain.
 */
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

/**
 * Robust y-range: uses percentiles to ignore outliers (asymptote spikes).
 * @param {Array<{x:number,y:number}>} pts
 * @param {number} percentile  e.g. 0.05 = ignore bottom/top 5%
 */
export function robustYRange(pts, percentile = 0.05) {
  const finite = pts.map(p => p.y).filter(Number.isFinite).sort((a, b) => a - b);
  if (finite.length === 0) return { yMin: -10, yMax: 10 };

  const lo = finite[Math.floor(finite.length * percentile)];
  const hi = finite[Math.floor(finite.length * (1 - percentile))];

  if (lo === hi) return { yMin: lo - 1, yMax: hi + 1 };

  const pad = (hi - lo) * 0.1;
  return { yMin: lo - pad, yMax: hi + pad };
}