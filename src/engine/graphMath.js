// src/engine/graphMath.js
// Compiles a user expression string (in terms of x) into a real callable function.
// Uses new Function() — no eval() — with a strict whitelist of allowed names.

const ALLOWED_NAMES = new Set([
  'x',
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh',
  'sqrt', 'cbrt', 'abs', 'exp', 'log', 'ln', 'log2', 'log10',
  'floor', 'ceil', 'round', 'sign', 'min', 'max', 'pow', 'mod',
  'PI', 'pi', 'E', 'e',
]);

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
  arcsin:'Math.asin',
  arccos:'Math.acos',
  arctan:'Math.atan',
  sinh:  'Math.sinh',
  cosh:  'Math.cosh',
  tanh:  'Math.tanh',
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
  sign:  'Math.sign',
  min:   'Math.min',
  max:   'Math.max',
  pow:   'Math.pow',
  mod:   'mod',
};

export function compileFunction(input) {
  if (typeof input !== 'string') throw new Error('Expression must be a string');
  let s = input.trim();
  if (!s) throw new Error('Empty expression');

  s = s.replace(/^\s*y\s*=\s*/i, '');

  const identifiers = s.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  for (const id of identifiers) {
    if (!ALLOWED_NAMES.has(id)) throw new Error(`Unknown name: "${id}"`);
  }

  s = s.replace(/\^/g, '**');

  s = s.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (m) => {
    if (MATH_FUNCTIONS[m]) return MATH_FUNCTIONS[m];
    if (MATH_CONSTANTS[m]) return MATH_CONSTANTS[m];
    return m;
  });

  const cleaned = s.replace(/Math\./g, '').replace(/mod/g, '');
  if (/[^0-9a-zA-Z+\-*/%().,^<>=!?\s]/.test(cleaned)) {
    throw new Error('Expression contains invalid characters');
  }

  const remainingIds = s.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  const ALLOWED_AFTER = new Set([
    'x', 'Math', 'mod',
    'sin','cos','tan','asin','acos','atan',
    'sinh','cosh','tanh',
    'sqrt','cbrt','abs','exp','log','log2','log10',
    'floor','ceil','round','sign','min','max','pow',
    'PI','E',
  ]);
  for (const id of remainingIds) {
    if (!ALLOWED_AFTER.has(id)) throw new Error(`Forbidden name: "${id}"`);
  }

  const mod = (a, b) => ((a % b) + b) % b;

  let fn;
  try {
    const inner = new Function('x', 'mod', `return (${s});`);
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
 * Robust y-range that ignores extreme outliers (uses percentiles).
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