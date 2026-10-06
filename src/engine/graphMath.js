// src/engine/graphMath.js
// Compiles a user expression string (in terms of x) into a real callable function.
// Uses new Function() — no eval() — with a strict whitelist of allowed names.

const ALLOWED_NAMES = new Set([
  'x',
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'sqrt', 'abs', 'exp', 'log', 'ln', 'log2', 'log10',
  'floor', 'ceil', 'round', 'sign', 'min', 'max', 'pow',
  'PI', 'pi', 'E', 'e',
]);

// Substitute common math aliases to JS equivalents
const MATH_CONSTANTS = {
  PI: 'Math.PI',
  pi: 'Math.PI',
  E:  'Math.E',
  e:  'Math.E',
};

const MATH_FUNCTIONS = {
  sin:   'Math.sin',
  cos:   'Math.cos',
  tan:   'Math.tan',
  asin:  'Math.asin',
  acos:  'Math.acos',
  atan:  'Math.atan',
  sinh:  'Math.sinh',
  cosh:  'Math.cosh',
  tanh:  'Math.tanh',
  sqrt:  'Math.sqrt',
  abs:   'Math.abs',
  exp:   'Math.exp',
  log:   'Math.log',      // natural log in JS
  ln:    'Math.log',      // alias for natural log
  log2:  'Math.log2',
  log10: 'Math.log10',
  floor: 'Math.floor',
  ceil:  'Math.ceil',
  round: 'Math.round',
  sign:  'Math.sign',
  min:   'Math.min',
  max:   'Math.max',
  pow:   'Math.pow',
};

/**
 * Compile a user expression string into a callable function.
 * @param {string} input  e.g. "sin(x) + x^2"
 * @returns {(x: number) => number}
 * @throws {Error} on invalid syntax or forbidden identifiers
 */
export function compileFunction(input) {
  if (typeof input !== 'string') throw new Error('Expression must be a string');
  let s = input.trim();
  if (!s) throw new Error('Empty expression');

  // Allow users to write "y = ..." — strip the LHS
  s = s.replace(/^\s*y\s*=\s*/i, '');

  // Tokenize identifiers to validate them (letters followed by digits/underscores)
  const identifiers = s.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  for (const id of identifiers) {
    if (!ALLOWED_NAMES.has(id)) {
      throw new Error(`Unknown name: "${id}"`);
    }
  }

  // Replace ^ with ** for exponentiation
  s = s.replace(/\^/g, '**');

  // Replace known functions and constants with their Math.* equivalents.
  // Use word boundaries to avoid partial matches.
  s = s.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (match) => {
    if (MATH_FUNCTIONS[match]) return MATH_FUNCTIONS[match];
    if (MATH_CONSTANTS[match]) return MATH_CONSTANTS[match];
    return match;
  });

  // Now the string should only contain: x, digits, operators, parens, dots, commas, spaces, and Math.*
  // Sanity check: only allow specific characters (plus the "Math." prefix)
  const cleaned = s.replace(/Math\./g, '');
  if (/[^0-9a-zA-Z+\-*/%().,^<>=!?\s]/.test(cleaned)) {
    throw new Error('Expression contains invalid characters');
  }

  // Final whitelist check — any remaining identifier must be x, Math, or a known Math method
  const remainingIds = s.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  const ALLOWED_AFTER_TRANSFORM = new Set([
    'x', 'Math',
    'sin','cos','tan','asin','acos','atan',
    'sinh','cosh','tanh',
    'sqrt','abs','exp','log','log2','log10',
    'floor','ceil','round','sign','min','max','pow',
    'PI','E',
  ]);
  for (const id of remainingIds) {
    if (!ALLOWED_AFTER_TRANSFORM.has(id)) {
      throw new Error(`Forbidden name after transform: "${id}"`);
    }
  }

  let fn;
  try {
    fn = new Function('x', `return (${s});`);
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
 * Sample the function across a domain to produce points for the graph.
 * @param {(x:number)=>number} fn
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} samples
 * @returns {Array<{x:number, y:number}>}
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