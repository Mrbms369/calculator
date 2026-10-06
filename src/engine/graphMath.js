// src/engine/graphMath.js
// Compiles a user expression string (in terms of x) into a real callable function.
// Uses new Function() — no eval() — with a strict whitelist of allowed names.
// Supports IMPLICIT MULTIPLICATION: 2x, 3sin(x), (x+1)(x-1), 2π, xsin(x), etc.

// ─── Whitelist of function names the user can type ───────────────────────
const ALLOWED_NAMES = new Set([
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

// Sort longest-first so multi-char names match before shorter prefixes
const FUNCTION_NAMES_LONGEST_FIRST = [
  'arcsin', 'arccos', 'arctan',
  'asinh', 'acosh', 'atanh',
  'log10',
  'sinh', 'cosh', 'tanh',
  'sqrt', 'cbrt', 'pow',
  'asin', 'acos', 'atan',
  'exp', 'abs',
  'log2', 'log', 'ln',
  'sin', 'cos', 'tan',
  'cot', 'sec', 'csc',
  'floor', 'ceil', 'round', 'trunc', 'sign',
  'min', 'max', 'mod',
];

// Named constants → JS Math equivalents
const MATH_CONSTANTS = {
  PI:  'Math.PI',
  pi:  'Math.PI',
  E:   'Math.E',
  e:   'Math.E',
  tau: '(2 * Math.PI)',
  phi: '1.618033988749895',
};

// Function names → Math.* implementations (ALL NAMES LISTED HERE)
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

const RECIPROCAL_TRIG = {
  cot: 'Math.tan',
  sec: 'Math.cos',
  csc: 'Math.sin',
};

/**
 * Compile a user expression string into a callable function.
 */
export function compileFunction(input) {
  if (typeof input !== 'string') throw new Error('Expression must be a string');
  let s = input.trim();
  if (!s) throw new Error('Empty expression');

  // 1. Strip "y = ..." prefix
  s = s.replace(/^\s*y\s*=\s*/i, '');

  // 2. Handle √ (needs paren wrapping) and π
  s = replaceUnicodeOps(s);

  // 3. Replace cot/sec/csc with paren-wrapped reciprocal form
  s = replaceReciprocalTrig(s);

  // 4. Validate identifiers IN THE USER INPUT (before Math.* injections)
  //    We scan the ORIGINAL tokens, not the transformed string.
  const preIdentifiers = s.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  for (const id of preIdentifiers) {
    // Allow "Math" if it was inserted by step 3 (reciprocal trig)
    if (id === 'Math') continue;
    if (!ALLOWED_NAMES.has(id)) {
      throw new Error(`Unknown name: "${id}"`);
    }
  }

  // 5. Insert implicit multiplication
  s = insertImplicitMultiplication(s);

  // 6. Replace ^ with **
  s = s.replace(/\^/g, '**');

  // 7. Replace function names and constants (longest first)
  for (const fn of FUNCTION_NAMES_LONGEST_FIRST) {
    if (!MATH_FUNCTIONS[fn]) continue;
    const re = new RegExp(`\\b${fn}\\b`, 'g');
    s = s.replace(re, MATH_FUNCTIONS[fn]);
  }
  for (const [name, val] of Object.entries(MATH_CONSTANTS)) {
    const re = new RegExp(`\\b${name}\\b`, 'g');
    s = s.replace(re, val);
  }

  // 8. Final identifier check on the transformed string
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

  // 9. Compile with injected helper
  const mod = (a, b) => ((a % b) + b) % b;

  let fn;
  try {
    const inner = new Function('x', 'mod', `"use strict"; return (${s});`);
    fn = (x) => inner(x, mod);
  } catch (err) {
    throw new Error(`Syntax error: ${err.message}`);
  }

  try {
    const testVal = fn(0);
    if (typeof testVal !== 'number') throw new Error('Did not return a number');
  } catch (err) {
    throw new Error(`Expression failed at x=0: ${err.message}`);
  }

  return fn;
}

/**
 * Replace √ and π with named equivalents.
 * √(EXPR) or √NUMBER or √x → sqrt(...)
 */
function replaceUnicodeOps(s) {
  // π → pi
  s = s.replace(/π/g, ' pi ');

  // √ — needs argument wrapping
  let result = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] === '√') {
      i++;
      while (i < s.length && /\s/.test(s[i])) i++;
      if (s[i] === '(') {
        let depth = 0;
        let k = i;
        for (; k < s.length; k++) {
          if (s[k] === '(') depth++;
          else if (s[k] === ')') { depth--; if (depth === 0) break; }
        }
        const inner = s.slice(i + 1, k);
        result += `sqrt(${inner})`;
        i = k + 1;
      } else {
        const m = s.slice(i).match(/^(\d+\.?\d*|[A-Za-z_][A-Za-z0-9_]*)/);
        if (m) {
          const token = m[0];
          i += token.length;
          result += `sqrt(${token})`;
        } else {
          result += 'sqrt';
        }
      }
    } else {
      result += s[i];
      i++;
    }
  }
  return result;
}

/**
 * Replace cot(EXPR), sec(EXPR), csc(EXPR) with (1 / Math.tan(EXPR)) etc.
 */
function replaceReciprocalTrig(s) {
  const fns = ['cot', 'sec', 'csc'];
  let result = '';
  let i = 0;

  while (i < s.length) {
    let matched = false;
    const atBoundary = i === 0 || !/[A-Za-z0-9_]/.test(s[i - 1]);
    if (atBoundary) {
      for (const fn of fns) {
        if (s.slice(i, i + fn.length) === fn) {
          const after = s[i + fn.length];
          if (after === '(' || !/[A-Za-z0-9_]/.test(after || '')) {
            let j = i + fn.length;
            while (j < s.length && /\s/.test(s[j])) j++;
            if (s[j] === '(') {
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
 * Insert * for implicit multiplication.
 * Uses NEGATIVE LOOKBEHIND to avoid mangling function names like log2, log10.
 */
function insertImplicitMultiplication(s) {
  // Rule 1: digit before letter, NOT preceded by a letter → 2x, 2sin, but not log2x
  s = s.replace(/(?<![A-Za-z0-9_])(\d)\s*([A-Za-z_])/g, '$1*$2');

  // Rule 2: digit before (, NOT preceded by a letter → 2(3+4), but not log2(x)
  s = s.replace(/(?<![A-Za-z0-9_])(\d)\s*\(/g, '$1*(');

  // Rule 3: ) before letter, digit or ( → )*(  )*x  )*2
  s = s.replace(/\)\s*\(/g, ')*(');
  s = s.replace(/\)\s*([A-Za-z_])/g, ')*$1');
  s = s.replace(/\)\s*(\d)/g, ')*$1');

  // Rule 4: standalone 'x' followed by a function name → x*func
  for (const fn of FUNCTION_NAMES_LONGEST_FIRST) {
    const re = new RegExp(`(?<![A-Za-z0-9_])x(${fn})(?![A-Za-z0-9_])`, 'g');
    s = s.replace(re, `x*$1`);
  }

  // Rule 5: standalone 'x' followed by ( → x*(
  s = s.replace(/(?<![A-Za-z0-9_])x\s*\(/g, 'x*(');

  return s;
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