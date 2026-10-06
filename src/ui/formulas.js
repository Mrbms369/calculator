// src/engine/formulas.js
// Comprehensive catalog of formulas across Math, Physics, Chemistry,
// Electrical, Electronics. ~60 per category, syllabus-aligned.

/**
 * @typedef {Object} Formula
 * @property {string} id
 * @property {string} category
 * @property {string} name
 * @property {string} formula
 * @property {string} description
 * @property {Array<{key:string, symbol:string, label:string, default?:string}>} inputs
 * @property {(vals: Record<string, number>) => string | number} compute
 */

const CATEGORIES = {
  math:        { label: 'Math',         icon: '∑' },
  physics:     { label: 'Physics',      icon: '⚛' },
  chemistry:   { label: 'Chemistry',    icon: '🧪' },
  electrical:  { label: 'Electrical',   icon: '⚡' },
  electronics: { label: 'Electronics',  icon: '🔌' },
};

const fmt = (n) => {
  if (!Number.isFinite(n)) return 'Invalid';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs < 1e-6 || abs >= 1e10) {
    return n.toExponential(4).replace(/\.?0+e/, 'e');
  }
  return Number(n.toPrecision(8)).toString();
};

const pct = (n) => `${fmt(n)} %`;

// ═══════════════════════════════════════════════════════════════════════════
// MATH (60)
// ═══════════════════════════════════════════════════════════════════════════

const MATH_FORMULAS = [
  // ─── Algebra ──────────────────────────────────────────────────────────
  { id: 'quadratic-roots', category: 'math', name: 'Quadratic Roots',
    formula: 'x = (−b ± √(b² − 4ac)) / 2a', description: 'Solve ax² + bx + c = 0',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Coefficient a', default: '1' },
      { key: 'b', symbol: 'b', label: 'Coefficient b', default: '0' },
      { key: 'c', symbol: 'c', label: 'Constant c',   default: '-4' },
    ],
    compute: ({ a, b, c }) => {
      if (a === 0) return 'a cannot be 0';
      const disc = b * b - 4 * a * c;
      if (disc < 0) return 'No real roots (disc < 0)';
      const sq = Math.sqrt(disc);
      return `x₁ = ${fmt((-b + sq) / (2 * a))}, x₂ = ${fmt((-b - sq) / (2 * a))}`;
    },
  },
  { id: 'quadratic-discriminant', category: 'math', name: 'Discriminant',
    formula: 'Δ = b² − 4ac', description: 'Determines nature of quadratic roots',
    inputs: [
      { key: 'a', symbol: 'a', label: 'a', default: '1' },
      { key: 'b', symbol: 'b', label: 'b', default: '5' },
      { key: 'c', symbol: 'c', label: 'c', default: '6' },
    ],
    compute: ({ a, b, c }) => {
      const d = b * b - 4 * a * c;
      let note = '';
      if (d > 0) note = ' (two real roots)';
      else if (d === 0) note = ' (one real root)';
      else note = ' (complex roots)';
      return fmt(d) + note;
    },
  },
  { id: 'slope', category: 'math', name: 'Slope',
    formula: 'm = (y₂ − y₁) / (x₂ − x₁)', description: 'Slope between two points',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '0' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '0' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '4' },
      { key: 'y2', symbol: 'y₂', label: 'y₂', default: '8' },
    ],
    compute: ({ x1, y1, x2, y2 }) => {
      const dx = x2 - x1;
      if (dx === 0) return 'Undefined (vertical)';
      return fmt((y2 - y1) / dx);
    },
  },
  { id: 'point-slope', category: 'math', name: 'Point-Slope Form',
    formula: 'y = y₁ + m(x − x₁)', description: 'Equation of a line from point and slope',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '1' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '2' },
      { key: 'm',  symbol: 'm',  label: 'Slope', default: '3' },
      { key: 'x',  symbol: 'x',  label: 'Evaluate at x', default: '5' },
    ],
    compute: ({ x1, y1, m, x }) => fmt(y1 + m * (x - x1)),
  },
  { id: 'distance-2d', category: 'math', name: 'Distance (2D)',
    formula: 'd = √((x₂−x₁)² + (y₂−y₁)²)', description: 'Distance between two points',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '0' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '0' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '3' },
      { key: 'y2', symbol: 'y₂', label: 'y₂', default: '4' },
    ],
    compute: ({ x1, y1, x2, y2 }) => fmt(Math.hypot(x2 - x1, y2 - y1)),
  },
  { id: 'midpoint', category: 'math', name: 'Midpoint',
    formula: 'M = ((x₁+x₂)/2, (y₁+y₂)/2)', description: 'Midpoint of two points',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '0' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '0' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '4' },
      { key: 'y2', symbol: 'y₂', label: 'y₂', default: '6' },
    ],
    compute: ({ x1, y1, x2, y2 }) => `(${fmt((x1 + x2) / 2)}, ${fmt((y1 + y2) / 2)})`,
  },
  { id: 'log-change-base', category: 'math', name: 'Log Change of Base',
    formula: 'log_b(x) = ln(x) / ln(b)', description: 'Logarithm in a different base',
    inputs: [
      { key: 'x', symbol: 'x', label: 'Argument', default: '100' },
      { key: 'b', symbol: 'b', label: 'Base',     default: '10' },
    ],
    compute: ({ x, b }) => {
      if (x <= 0 || b <= 0 || b === 1) return 'Invalid';
      return fmt(Math.log(x) / Math.log(b));
    },
  },
  { id: 'absolute-value', category: 'math', name: 'Absolute Value',
    formula: '|x|', description: 'Distance from zero',
    inputs: [{ key: 'x', symbol: 'x', label: 'Value', default: '-7' }],
    compute: ({ x }) => fmt(Math.abs(x)),
  },
  { id: 'factorial-approx', category: 'math', name: "Stirling's Approximation",
    formula: 'n! ≈ √(2πn) · (n/e)ⁿ', description: 'Approximate factorial for large n',
    inputs: [{ key: 'n', symbol: 'n', label: 'n', default: '10' }],
    compute: ({ n }) => {
      if (n < 1) return 'n must be ≥ 1';
      return fmt(Math.sqrt(2 * Math.PI * n) * Math.pow(n / Math.E, n));
    },
  },

  // ─── Geometry — 2D ────────────────────────────────────────────────────
  { id: 'pythagorean', category: 'math', name: 'Pythagorean Theorem',
    formula: 'c = √(a² + b²)', description: 'Hypotenuse of a right triangle',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Side a', default: '3' },
      { key: 'b', symbol: 'b', label: 'Side b', default: '4' },
    ],
    compute: ({ a, b }) => fmt(Math.hypot(a, b)),
  },
  { id: 'rectangle-area', category: 'math', name: 'Rectangle Area',
    formula: 'A = l × w', description: 'Area of a rectangle',
    inputs: [
      { key: 'l', symbol: 'l', label: 'Length', default: '5' },
      { key: 'w', symbol: 'w', label: 'Width', default: '3' },
    ],
    compute: ({ l, w }) => fmt(l * w),
  },
  { id: 'rectangle-perimeter', category: 'math', name: 'Rectangle Perimeter',
    formula: 'P = 2(l + w)', description: 'Perimeter of a rectangle',
    inputs: [
      { key: 'l', symbol: 'l', label: 'Length', default: '5' },
      { key: 'w', symbol: 'w', label: 'Width', default: '3' },
    ],
    compute: ({ l, w }) => fmt(2 * (l + w)),
  },
  { id: 'triangle-area-base-height', category: 'math', name: 'Triangle Area (base×height)',
    formula: 'A = ½ × b × h', description: 'Area from base and height',
    inputs: [
      { key: 'b', symbol: 'b', label: 'Base', default: '6' },
      { key: 'h', symbol: 'h', label: 'Height', default: '4' },
    ],
    compute: ({ b, h }) => fmt(0.5 * b * h),
  },
  { id: 'triangle-area-heron', category: 'math', name: "Heron's Formula",
    formula: 'A = √(s(s−a)(s−b)(s−c))', description: 'Triangle area from three sides',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Side a', default: '3' },
      { key: 'b', symbol: 'b', label: 'Side b', default: '4' },
      { key: 'c', symbol: 'c', label: 'Side c', default: '5' },
    ],
    compute: ({ a, b, c }) => {
      const s = (a + b + c) / 2;
      const v = s * (s - a) * (s - b) * (s - c);
      if (v < 0) return 'Invalid triangle';
      return fmt(Math.sqrt(v));
    },
  },
  { id: 'trapezoid-area', category: 'math', name: 'Trapezoid Area',
    formula: 'A = ½ × (a + b) × h', description: 'Area of a trapezoid',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Parallel side a', default: '5' },
      { key: 'b', symbol: 'b', label: 'Parallel side b', default: '8' },
      { key: 'h', symbol: 'h', label: 'Height',          default: '4' },
    ],
    compute: ({ a, b, h }) => fmt(0.5 * (a + b) * h),
  },
  { id: 'parallelogram-area', category: 'math', name: 'Parallelogram Area',
    formula: 'A = b × h', description: 'Area of a parallelogram',
    inputs: [
      { key: 'b', symbol: 'b', label: 'Base',   default: '7' },
      { key: 'h', symbol: 'h', label: 'Height', default: '4' },
    ],
    compute: ({ b, h }) => fmt(b * h),
  },
  { id: 'circle-area', category: 'math', name: 'Circle Area',
    formula: 'A = πr²', description: 'Area of a circle',
    inputs: [{ key: 'r', symbol: 'r', label: 'Radius', default: '5' }],
    compute: ({ r }) => fmt(Math.PI * r * r),
  },
  { id: 'circle-circumference', category: 'math', name: 'Circle Circumference',
    formula: 'C = 2πr', description: 'Circumference of a circle',
    inputs: [{ key: 'r', symbol: 'r', label: 'Radius', default: '5' }],
    compute: ({ r }) => fmt(2 * Math.PI * r),
  },
  { id: 'circle-diameter-from-area', category: 'math', name: 'Circle Diameter',
    formula: 'd = 2√(A/π)', description: 'Diameter from area',
    inputs: [{ key: 'A', symbol: 'A', label: 'Area', default: '78.54' }],
    compute: ({ A }) => fmt(2 * Math.sqrt(A / Math.PI)),
  },
  { id: 'sector-area', category: 'math', name: 'Sector Area',
    formula: 'A = ½ r² θ', description: 'Area of a sector (θ in radians)',
    inputs: [
      { key: 'r', symbol: 'r', label: 'Radius', default: '5' },
      { key: 'theta', symbol: 'θ', label: 'Angle (rad)', default: '1' },
    ],
    compute: ({ r, theta }) => fmt(0.5 * r * r * theta),
  },
  { id: 'regular-polygon-area', category: 'math', name: 'Regular Polygon Area',
    formula: 'A = ½ × n × s² / tan(π/n)', description: 'Area of regular n-gon',
    inputs: [
      { key: 'n', symbol: 'n', label: 'Number of sides', default: '6' },
      { key: 's', symbol: 's', label: 'Side length',     default: '4' },
    ],
    compute: ({ n, s }) => {
      if (n < 3) return 'n must be ≥ 3';
      return fmt(0.5 * n * s * s / Math.tan(Math.PI / n));
    },
  },

  // ─── Geometry — 3D ────────────────────────────────────────────────────
  { id: 'cube-volume', category: 'math', name: 'Cube Volume',
    formula: 'V = s³', description: 'Volume of a cube',
    inputs: [{ key: 's', symbol: 's', label: 'Side', default: '3' }],
    compute: ({ s }) => fmt(s * s * s),
  },
  { id: 'cube-surface', category: 'math', name: 'Cube Surface Area',
    formula: 'A = 6s²', description: 'Surface area of a cube',
    inputs: [{ key: 's', symbol: 's', label: 'Side', default: '3' }],
    compute: ({ s }) => fmt(6 * s * s),
  },
  { id: 'box-volume', category: 'math', name: 'Rectangular Box Volume',
    formula: 'V = l × w × h', description: 'Volume of a rectangular prism',
    inputs: [
      { key: 'l', symbol: 'l', label: 'Length', default: '4' },
      { key: 'w', symbol: 'w', label: 'Width',  default: '3' },
      { key: 'h', symbol: 'h', label: 'Height', default: '2' },
    ],
    compute: ({ l, w, h }) => fmt(l * w * h),
  },
  { id: 'box-surface', category: 'math', name: 'Box Surface Area',
    formula: 'A = 2(lw + lh + wh)', description: 'Surface area of a box',
    inputs: [
      { key: 'l', symbol: 'l', label: 'Length', default: '4' },
      { key: 'w', symbol: 'w', label: 'Width',  default: '3' },
      { key: 'h', symbol: 'h', label: 'Height', default: '2' },
    ],
    compute: ({ l, w, h }) => fmt(2 * (l * w + l * h + w * h)),
  },
  { id: 'sphere-volume', category: 'math', name: 'Sphere Volume',
    formula: 'V = (4/3)πr³', description: 'Volume of a sphere',
    inputs: [{ key: 'r', symbol: 'r', label: 'Radius', default: '3' }],
    compute: ({ r }) => fmt((4 / 3) * Math.PI * r * r * r),
  },
  { id: 'sphere-surface', category: 'math', name: 'Sphere Surface Area',
    formula: 'A = 4πr²', description: 'Surface area of a sphere',
    inputs: [{ key: 'r', symbol: 'r', label: 'Radius', default: '3' }],
    compute: ({ r }) => fmt(4 * Math.PI * r * r),
  },
  { id: 'cylinder-volume', category: 'math', name: 'Cylinder Volume',
    formula: 'V = πr²h', description: 'Volume of a cylinder',
    inputs: [
      { key: 'r', symbol: 'r', label: 'Radius', default: '3' },
      { key: 'h', symbol: 'h', label: 'Height', default: '7' },
    ],
    compute: ({ r, h }) => fmt(Math.PI * r * r * h),
  },
  { id: 'cylinder-surface', category: 'math', name: 'Cylinder Surface Area',
    formula: 'A = 2πr(r + h)', description: 'Surface area of a cylinder',
    inputs: [
      { key: 'r', symbol: 'r', label: 'Radius', default: '3' },
      { key: 'h', symbol: 'h', label: 'Height', default: '7' },
    ],
    compute: ({ r, h }) => fmt(2 * Math.PI * r * (r + h)),
  },
  { id: 'cone-volume', category: 'math', name: 'Cone Volume',
    formula: 'V = ⅓πr²h', description: 'Volume of a cone',
    inputs: [
      { key: 'r', symbol: 'r', label: 'Radius', default: '3' },
      { key: 'h', symbol: 'h', label: 'Height', default: '5' },
    ],
    compute: ({ r, h }) => fmt((1 / 3) * Math.PI * r * r * h),
  },
  { id: 'cone-slant', category: 'math', name: 'Cone Slant Height',
    formula: 'l = √(r² + h²)', description: 'Slant height of a cone',
    inputs: [
      { key: 'r', symbol: 'r', label: 'Radius', default: '3' },
      { key: 'h', symbol: 'h', label: 'Height', default: '4' },
    ],
    compute: ({ r, h }) => fmt(Math.hypot(r, h)),
  },

  // ─── Trigonometry ─────────────────────────────────────────────────────
  { id: 'law-of-sines', category: 'math', name: 'Law of Sines',
    formula: 'a/sin(A) = b/sin(B) = c/sin(C)', description: 'Find side from opposite angle',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Known side',   default: '8' },
      { key: 'A', symbol: 'A', label: 'Angle A (°)',  default: '40' },
      { key: 'B', symbol: 'B', label: 'Angle B (°)',  default: '60' },
    ],
    compute: ({ a, A, B }) => {
      const sA = Math.sin((A * Math.PI) / 180);
      if (sA === 0) return 'Invalid';
      return fmt((a * Math.sin((B * Math.PI) / 180)) / sA);
    },
  },
  { id: 'law-of-cosines', category: 'math', name: 'Law of Cosines',
    formula: 'c = √(a² + b² − 2ab·cos(C))', description: 'Side from two sides and included angle',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Side a', default: '5' },
      { key: 'b', symbol: 'b', label: 'Side b', default: '6' },
      { key: 'C', symbol: 'C', label: 'Angle C (°)', default: '60' },
    ],
    compute: ({ a, b, C }) => {
      const c = Math.cos((C * Math.PI) / 180);
      return fmt(Math.sqrt(a * a + b * b - 2 * a * b * c));
    },
  },
  { id: 'pythagorean-identity', category: 'math', name: 'Pythagorean Identity',
    formula: 'sin²θ + cos²θ = 1', description: 'Verify the identity',
    inputs: [{ key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '30' }],
    compute: ({ theta }) => {
      const r = (theta * Math.PI) / 180;
      return fmt(Math.pow(Math.sin(r), 2) + Math.pow(Math.cos(r), 2));
    },
  },
  { id: 'double-angle-sin', category: 'math', name: 'Double Angle (sin)',
    formula: 'sin(2θ) = 2·sin(θ)·cos(θ)', description: 'Double angle identity for sine',
    inputs: [{ key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '30' }],
    compute: ({ theta }) => {
      const r = (theta * Math.PI) / 180;
      return fmt(2 * Math.sin(r) * Math.cos(r));
    },
  },
  { id: 'double-angle-cos', category: 'math', name: 'Double Angle (cos)',
    formula: 'cos(2θ) = cos²θ − sin²θ', description: 'Double angle identity for cosine',
    inputs: [{ key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '30' }],
    compute: ({ theta }) => {
      const r = (theta * Math.PI) / 180;
      return fmt(Math.pow(Math.cos(r), 2) - Math.pow(Math.sin(r), 2));
    },
  },

  // ─── Coordinate & Analytic Geometry ───────────────────────────────────
  { id: 'line-from-two-points', category: 'math', name: 'Line Length (2 points)',
    formula: 'd = √((x₂−x₁)² + (y₂−y₁)²)', description: 'Length of a line segment',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '1' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '2' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '4' },
      { key: 'y2', symbol: 'y₂', label: 'y₂', default: '6' },
    ],
    compute: ({ x1, y1, x2, y2 }) => fmt(Math.hypot(x2 - x1, y2 - y1)),
  },
  { id: 'circle-equation-radius', category: 'math', name: 'Circle Radius from Equation',
    formula: 'r = √(h² + k² − c)', description: 'From x² + y² + Dx + Ey + F = 0',
    inputs: [
      { key: 'D', symbol: 'D', label: 'D coefficient', default: '-4' },
      { key: 'E', symbol: 'E', label: 'E coefficient', default: '-6' },
      { key: 'F', symbol: 'F', label: 'F constant',    default: '9' },
    ],
    compute: ({ D, E, F }) => {
      const v = (D * D + E * E) / 4 - F;
      if (v < 0) return 'Not a circle';
      return fmt(Math.sqrt(v));
    },
  },

  // ─── Statistics & Probability ─────────────────────────────────────────
  { id: 'average', category: 'math', name: 'Arithmetic Mean',
    formula: 'μ = (a+b+c+d)/n', description: 'Average of four numbers',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Value 1', default: '1' },
      { key: 'b', symbol: 'b', label: 'Value 2', default: '2' },
      { key: 'c', symbol: 'c', label: 'Value 3', default: '3' },
      { key: 'd', symbol: 'd', label: 'Value 4', default: '4' },
    ],
    compute: ({ a, b, c, d }) => fmt((a + b + c + d) / 4),
  },
  { id: 'weighted-average', category: 'math', name: 'Weighted Average',
    formula: '(a·w₁ + b·w₂) / (w₁ + w₂)', description: 'Weighted mean of two values',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Value a', default: '80' },
      { key: 'b', symbol: 'b', label: 'Value b', default: '90' },
      { key: 'w1', symbol: 'w₁', label: 'Weight 1', default: '2' },
      { key: 'w2', symbol: 'w₂', label: 'Weight 2', default: '3' },
    ],
    compute: ({ a, b, w1, w2 }) => {
      if (w1 + w2 === 0) return 'Division by zero';
      return fmt((a * w1 + b * w2) / (w1 + w2));
    },
  },
  { id: 'variance-2', category: 'math', name: 'Sample Variance (2 points)',
    formula: 's² = (x₁² + x₂²)/2 − μ²', description: 'Variance of two values',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '4' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '8' },
    ],
    compute: ({ x1, x2 }) => {
      const mean = (x1 + x2) / 2;
      return fmt((x1 * x1 + x2 * x2) / 2 - mean * mean);
    },
  },
  { id: 'standard-deviation', category: 'math', name: 'Standard Deviation',
    formula: 'σ = √(variance)', description: 'Standard deviation',
    inputs: [{ key: 'v', symbol: 'σ²', label: 'Variance', default: '4' }],
    compute: ({ v }) => v < 0 ? 'Invalid' : fmt(Math.sqrt(v)),
  },
  { id: 'percent-change', category: 'math', name: 'Percentage Change',
    formula: '% = ((new − old)/old) × 100', description: 'Percent increase or decrease',
    inputs: [
      { key: 'old', symbol: 'old', label: 'Old value', default: '100' },
      { key: 'new', symbol: 'new', label: 'New value', default: '150' },
    ],
    compute: ({ old: o, new: n }) => {
      if (o === 0) return 'Old cannot be 0';
      return pct(((n - o) / o) * 100);
    },
  },
  { id: 'percent-of', category: 'math', name: 'Percent Of',
    formula: 'value = (p/100) × n', description: 'p percent of n',
    inputs: [
      { key: 'p', symbol: 'p', label: 'Percent', default: '25' },
      { key: 'n', symbol: 'n', label: 'Number',  default: '80' },
    ],
    compute: ({ p, n }) => fmt((p / 100) * n),
  },
  { id: 'combination', category: 'math', name: 'Combination (nCr)',
    formula: 'C(n,r) = n! / (r!(n−r)!)', description: 'Number of combinations',
    inputs: [
      { key: 'n', symbol: 'n', label: 'n', default: '10' },
      { key: 'r', symbol: 'r', label: 'r', default: '3' },
    ],
    compute: ({ n, r }) => {
      if (r > n || n < 0 || r < 0) return 'Invalid';
      const fact = (k) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
      return fmt(fact(n) / (fact(r) * fact(n - r)));
    },
  },
  { id: 'permutation', category: 'math', name: 'Permutation (nPr)',
    formula: 'P(n,r) = n! / (n−r)!', description: 'Number of permutations',
    inputs: [
      { key: 'n', symbol: 'n', label: 'n', default: '10' },
      { key: 'r', symbol: 'r', label: 'r', default: '3' },
    ],
    compute: ({ n, r }) => {
      if (r > n || n < 0 || r < 0) return 'Invalid';
      const fact = (k) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
      return fmt(fact(n) / fact(n - r));
    },
  },

  // ─── Financial Math ───────────────────────────────────────────────────
  { id: 'simple-interest', category: 'math', name: 'Simple Interest',
    formula: 'I = P × r × t', description: 'Interest on principal',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Principal', default: '1000' },
      { key: 'r', symbol: 'r', label: 'Rate (decimal)', default: '0.05' },
      { key: 't', symbol: 't', label: 'Time (years)', default: '2' },
    ],
    compute: ({ P, r, t }) => fmt(P * r * t),
  },
  { id: 'compound-interest', category: 'math', name: 'Compound Interest',
    formula: 'A = P(1 + r/n)^(nt)', description: 'Compound interest',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Principal', default: '1000' },
      { key: 'r', symbol: 'r', label: 'Rate (decimal)', default: '0.05' },
      { key: 'n', symbol: 'n', label: 'Compounds/year', default: '12' },
      { key: 't', symbol: 't', label: 'Time (years)', default: '2' },
    ],
    compute: ({ P, r, n, t }) => fmt(P * Math.pow(1 + r / n, n * t)),
  },
  { id: 'simple-growth', category: 'math', name: 'Exponential Growth',
    formula: 'A = A₀ × (1 + r)^t', description: 'Growth at rate r over t periods',
    inputs: [
      { key: 'A0', symbol: 'A₀', label: 'Initial', default: '100' },
      { key: 'r',  symbol: 'r',  label: 'Rate',    default: '0.05' },
      { key: 't',  symbol: 't',  label: 'Periods', default: '10' },
    ],
    compute: ({ A0, r, t }) => fmt(A0 * Math.pow(1 + r, t)),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PHYSICS (60)
// ═══════════════════════════════════════════════════════════════════════════

const PHYSICS_FORMULAS = [
  // ─── Kinematics ───────────────────────────────────────────────────────
  { id: 'speed', category: 'physics', name: 'Speed',
    formula: 'v = d / t', description: 'Average speed',
    inputs: [
      { key: 'd', symbol: 'd', label: 'Distance (m)', default: '100' },
      { key: 't', symbol: 't', label: 'Time (s)', default: '20' },
    ],
    compute: ({ d, t }) => t === 0 ? 'Division by zero' : fmt(d / t),
  },
  { id: 'acceleration', category: 'physics', name: 'Acceleration',
    formula: 'a = (v − u) / t', description: 'Acceleration from velocity change',
    inputs: [
      { key: 'u', symbol: 'u', label: 'Initial v (m/s)', default: '0' },
      { key: 'v', symbol: 'v', label: 'Final v (m/s)',   default: '20' },
      { key: 't', symbol: 't', label: 'Time (s)', default: '5' },
    ],
    compute: ({ u, v, t }) => t === 0 ? 'Division by zero' : fmt((v - u) / t),
  },
  { id: 'eq-motion-1', category: 'physics', name: 'Motion Eq. 1',
    formula: 'v = u + a·t', description: 'Velocity after time t',
    inputs: [
      { key: 'u', symbol: 'u', label: 'Initial v', default: '0' },
      { key: 'a', symbol: 'a', label: 'Acceleration', default: '2' },
      { key: 't', symbol: 't', label: 'Time', default: '5' },
    ],
    compute: ({ u, a, t }) => fmt(u + a * t),
  },
  { id: 'eq-motion-2', category: 'physics', name: 'Motion Eq. 2',
    formula: 's = u·t + ½a·t²', description: 'Displacement after time t',
    inputs: [
      { key: 'u', symbol: 'u', label: 'Initial v', default: '0' },
      { key: 'a', symbol: 'a', label: 'Acceleration', default: '2' },
      { key: 't', symbol: 't', label: 'Time', default: '5' },
    ],
    compute: ({ u, a, t }) => fmt(u * t + 0.5 * a * t * t),
  },
  { id: 'eq-motion-3', category: 'physics', name: 'Motion Eq. 3',
    formula: 'v² = u² + 2a·s', description: 'Velocity after displacement',
    inputs: [
      { key: 'u', symbol: 'u', label: 'Initial v', default: '0' },
      { key: 'a', symbol: 'a', label: 'Acceleration', default: '2' },
      { key: 's', symbol: 's', label: 'Displacement', default: '25' },
    ],
    compute: ({ u, a, s }) => {
      const v2 = u * u + 2 * a * s;
      return v2 < 0 ? 'Invalid' : fmt(Math.sqrt(v2));
    },
  },

  // ─── Force, Work, Energy ──────────────────────────────────────────────
  { id: 'force', category: 'physics', name: "Newton's 2nd Law",
    formula: 'F = m × a', description: 'Force from mass and acceleration',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '10' },
      { key: 'a', symbol: 'a', label: 'Acceleration (m/s²)', default: '2' },
    ],
    compute: ({ m, a }) => fmt(m * a),
  },
  { id: 'weight', category: 'physics', name: 'Weight',
    formula: 'W = m × g', description: 'Weight from mass (g = 9.81)',
    inputs: [{ key: 'm', symbol: 'm', label: 'Mass (kg)', default: '10' }],
    compute: ({ m }) => fmt(m * 9.81),
  },
  { id: 'work', category: 'physics', name: 'Work',
    formula: 'W = F × d', description: 'Work from force and distance',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '50' },
      { key: 'd', symbol: 'd', label: 'Distance (m)', default: '10' },
    ],
    compute: ({ F, d }) => fmt(F * d),
  },
  { id: 'work-angle', category: 'physics', name: 'Work (at angle)',
    formula: 'W = F × d × cos(θ)', description: 'Work at an angle to displacement',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '50' },
      { key: 'd', symbol: 'd', label: 'Distance (m)', default: '10' },
      { key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '30' },
    ],
    compute: ({ F, d, theta }) => fmt(F * d * Math.cos(theta * Math.PI / 180)),
  },
  { id: 'power', category: 'physics', name: 'Power',
    formula: 'P = W / t', description: 'Power from work and time',
    inputs: [
      { key: 'W', symbol: 'W', label: 'Work (J)', default: '500' },
      { key: 't', symbol: 't', label: 'Time (s)', default: '10' },
    ],
    compute: ({ W, t }) => t === 0 ? 'Division by zero' : fmt(W / t),
  },
  { id: 'kinetic-energy', category: 'physics', name: 'Kinetic Energy',
    formula: 'Ek = ½mv²', description: 'Kinetic energy',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '5' },
      { key: 'v', symbol: 'v', label: 'Velocity (m/s)', default: '10' },
    ],
    compute: ({ m, v }) => fmt(0.5 * m * v * v),
  },
  { id: 'potential-energy', category: 'physics', name: 'Potential Energy',
    formula: 'Ep = mgh', description: 'Gravitational potential energy',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '10' },
      { key: 'h', symbol: 'h', label: 'Height (m)', default: '5' },
    ],
    compute: ({ m, h }) => fmt(m * 9.81 * h),
  },
  { id: 'mechanical-energy', category: 'physics', name: 'Mechanical Energy',
    formula: 'E = Ek + Ep', description: 'Total mechanical energy',
    inputs: [
      { key: 'Ek', symbol: 'Ek', label: 'Kinetic (J)', default: '100' },
      { key: 'Ep', symbol: 'Ep', label: 'Potential (J)', default: '50' },
    ],
    compute: ({ Ek, Ep }) => fmt(Ek + Ep),
  },
  { id: 'spring-potential', category: 'physics', name: 'Spring Potential Energy',
    formula: 'Ep = ½kx²', description: 'Energy stored in a spring',
    inputs: [
      { key: 'k', symbol: 'k', label: 'Spring constant (N/m)', default: '100' },
      { key: 'x', symbol: 'x', label: 'Extension (m)', default: '0.1' },
    ],
    compute: ({ k, x }) => fmt(0.5 * k * x * x),
  },
  { id: 'hookes-law', category: 'physics', name: "Hooke's Law",
    formula: 'F = k × x', description: 'Spring force',
    inputs: [
      { key: 'k', symbol: 'k', label: 'Spring constant (N/m)', default: '100' },
      { key: 'x', symbol: 'x', label: 'Extension (m)', default: '0.1' },
    ],
    compute: ({ k, x }) => fmt(k * x),
  },

  // ─── Momentum & Collisions ────────────────────────────────────────────
  { id: 'momentum', category: 'physics', name: 'Momentum',
    formula: 'p = m × v', description: 'Linear momentum',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '5' },
      { key: 'v', symbol: 'v', label: 'Velocity (m/s)', default: '8' },
    ],
    compute: ({ m, v }) => fmt(m * v),
  },
  { id: 'impulse', category: 'physics', name: 'Impulse',
    formula: 'J = F × Δt', description: 'Impulse = change in momentum',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '50' },
      { key: 't', symbol: 'Δt', label: 'Time (s)', default: '0.5' },
    ],
    compute: ({ F, t }) => fmt(F * t),
  },

  // ─── Fluid Mechanics ──────────────────────────────────────────────────
  { id: 'density', category: 'physics', name: 'Density',
    formula: 'ρ = m / V', description: 'Density from mass and volume',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '10' },
      { key: 'V', symbol: 'V', label: 'Volume (m³)', default: '2' },
    ],
    compute: ({ m, V }) => V === 0 ? 'Division by zero' : fmt(m / V),
  },
  { id: 'pressure', category: 'physics', name: 'Pressure',
    formula: 'P = F / A', description: 'Pressure from force and area',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '100' },
      { key: 'A', symbol: 'A', label: 'Area (m²)', default: '2' },
    ],
    compute: ({ F, A }) => A === 0 ? 'Division by zero' : fmt(F / A),
  },
  { id: 'hydrostatic-pressure', category: 'physics', name: 'Hydrostatic Pressure',
    formula: 'P = ρgh', description: 'Pressure at depth h in a fluid',
    inputs: [
      { key: 'rho', symbol: 'ρ', label: 'Density (kg/m³)', default: '1000' },
      { key: 'h',   symbol: 'h', label: 'Depth (m)', default: '10' },
    ],
    compute: ({ rho, h }) => fmt(rho * 9.81 * h),
  },
  { id: 'buoyancy', category: 'physics', name: 'Buoyant Force',
    formula: 'F = ρ·V·g', description: 'Archimedes principle',
    inputs: [
      { key: 'rho', symbol: 'ρ', label: 'Fluid density (kg/m³)', default: '1000' },
      { key: 'V',   symbol: 'V', label: 'Displaced volume (m³)', default: '0.01' },
    ],
    compute: ({ rho, V }) => fmt(rho * V * 9.81),
  },
  { id: 'flow-rate', category: 'physics', name: 'Volume Flow Rate',
    formula: 'Q = A × v', description: 'Flow rate through a pipe',
    inputs: [
      { key: 'A', symbol: 'A', label: 'Area (m²)', default: '0.01' },
      { key: 'v', symbol: 'v', label: 'Velocity (m/s)', default: '2' },
    ],
    compute: ({ A, v }) => fmt(A * v),
  },
  { id: 'continuity', category: 'physics', name: 'Continuity Equation',
    formula: 'A₁v₁ = A₂v₂', description: 'Solve for v₂',
    inputs: [
      { key: 'A1', symbol: 'A₁', label: 'Area 1 (m²)', default: '0.1' },
      { key: 'v1', symbol: 'v₁', label: 'Velocity 1 (m/s)', default: '2' },
      { key: 'A2', symbol: 'A₂', label: 'Area 2 (m²)', default: '0.05' },
    ],
    compute: ({ A1, v1, A2 }) => A2 === 0 ? 'Division by zero' : fmt((A1 * v1) / A2),
  },

  // ─── Waves & Sound ────────────────────────────────────────────────────
  { id: 'wave-speed', category: 'physics', name: 'Wave Speed',
    formula: 'v = f × λ', description: 'Wave speed from frequency and wavelength',
    inputs: [
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '50' },
      { key: 'l', symbol: 'λ', label: 'Wavelength (m)', default: '2' },
    ],
    compute: ({ f, l }) => fmt(f * l),
  },
  { id: 'wave-period', category: 'physics', name: 'Wave Period',
    formula: 'T = 1 / f', description: 'Period from frequency',
    inputs: [{ key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '50' }],
    compute: ({ f }) => f === 0 ? 'Division by zero' : fmt(1 / f),
  },
  { id: 'sound-distance', category: 'physics', name: 'Sound Distance',
    formula: 'd = v × t', description: 'Distance from sound travel time',
    inputs: [
      { key: 'v', symbol: 'v', label: 'Speed of sound (m/s)', default: '343' },
      { key: 't', symbol: 't', label: 'Time (s)', default: '2' },
    ],
    compute: ({ v, t }) => fmt(v * t),
  },
  { id: 'doppler', category: 'physics', name: 'Doppler Effect',
    formula: 'f_obs = f_s · v / (v − v_s)', description: 'Observed frequency from moving source',
    inputs: [
      { key: 'fs', symbol: 'f_s', label: 'Source freq (Hz)', default: '500' },
      { key: 'v',  symbol: 'v',   label: 'Speed of sound (m/s)', default: '343' },
      { key: 'vs', symbol: 'v_s', label: 'Source speed (m/s)', default: '30' },
    ],
    compute: ({ fs, v, vs }) => v - vs === 0 ? 'Source at speed of sound' : fmt((fs * v) / (v - vs)),
  },

  // ─── Thermodynamics ───────────────────────────────────────────────────
  { id: 'heat-energy', category: 'physics', name: 'Heat Energy',
    formula: 'Q = m·c·ΔT', description: 'Heat to change temperature',
    inputs: [
      { key: 'm',  symbol: 'm',  label: 'Mass (kg)', default: '2' },
      { key: 'c',  symbol: 'c',  label: 'Specific heat (J/kg·K)', default: '4186' },
      { key: 'dT', symbol: 'ΔT', label: 'Temp change (K)', default: '10' },
    ],
    compute: ({ m, c, dT }) => fmt(m * c * dT),
  },
  { id: 'latent-heat', category: 'physics', name: 'Latent Heat',
    formula: 'Q = m·L', description: 'Heat for phase change',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '1' },
      { key: 'L', symbol: 'L', label: 'Latent heat (J/kg)', default: '334000' },
    ],
    compute: ({ m, L }) => fmt(m * L),
  },
  { id: 'ideal-gas-pv', category: 'physics', name: 'Ideal Gas (PV=nRT)',
    formula: 'P = nRT / V', description: 'Ideal gas pressure',
    inputs: [
      { key: 'n', symbol: 'n', label: 'Moles', default: '1' },
      { key: 'T', symbol: 'T', label: 'Temperature (K)', default: '300' },
      { key: 'V', symbol: 'V', label: 'Volume (m³)', default: '0.0224' },
    ],
    compute: ({ n, T, V }) => V === 0 ? 'Division by zero' : fmt((n * 8.314 * T) / V),
  },
  { id: 'thermal-expansion', category: 'physics', name: 'Thermal Expansion',
    formula: 'ΔL = L₀ · α · ΔT', description: 'Linear thermal expansion',
    inputs: [
      { key: 'L0', symbol: 'L₀', label: 'Original length (m)', default: '1' },
      { key: 'a',  symbol: 'α',  label: 'Expansion coeff (1/K)', default: '0.000012' },
      { key: 'dT', symbol: 'ΔT', label: 'Temp change (K)', default: '50' },
    ],
    compute: ({ L0, a, dT }) => fmt(L0 * a * dT),
  },
  { id: 'carnot-efficiency', category: 'physics', name: 'Carnot Efficiency',
    formula: 'η = 1 − T_cold / T_hot', description: 'Maximum heat engine efficiency',
    inputs: [
      { key: 'Tc', symbol: 'T_cold', label: 'Cold temp (K)', default: '300' },
      { key: 'Th', symbol: 'T_hot',  label: 'Hot temp (K)',  default: '500' },
    ],
    compute: ({ Tc, Th }) => {
      if (Th === 0) return 'Division by zero';
      return `${fmt((1 - Tc / Th) * 100)} %`;
    },
  },

  // ─── Electricity (Physics) ────────────────────────────────────────────
  { id: 'ohm-physics', category: 'physics', name: "Ohm's Law (Physics)",
    formula: 'V = I × R', description: 'Voltage from current and resistance',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ I, R }) => fmt(I * R),
  },
  { id: 'electric-power', category: 'physics', name: 'Electric Power',
    formula: 'P = V × I', description: 'Electrical power',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
    ],
    compute: ({ V, I }) => fmt(V * I),
  },
  { id: 'coulomb-force', category: 'physics', name: "Coulomb's Law",
    formula: 'F = k·q₁·q₂ / r²', description: 'Force between two charges',
    inputs: [
      { key: 'q1', symbol: 'q₁', label: 'Charge 1 (C)', default: '0.000001' },
      { key: 'q2', symbol: 'q₂', label: 'Charge 2 (C)', default: '0.000001' },
      { key: 'r',  symbol: 'r',  label: 'Distance (m)', default: '1' },
    ],
    compute: ({ q1, q2, r }) => {
      if (r === 0) return 'Division by zero';
      const k = 8.9875517923e9;
      return fmt((k * q1 * q2) / (r * r));
    },
  },
  { id: 'electric-field', category: 'physics', name: 'Electric Field',
    formula: 'E = F / q', description: 'Field from force and charge',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '10' },
      { key: 'q', symbol: 'q', label: 'Charge (C)', default: '2' },
    ],
    compute: ({ F, q }) => q === 0 ? 'Division by zero' : fmt(F / q),
  },

  // ─── Magnetism & Waves ────────────────────────────────────────────────
  { id: 'magnetic-force', category: 'physics', name: 'Magnetic Force',
    formula: 'F = q·v·B·sin(θ)', description: 'Force on moving charge',
    inputs: [
      { key: 'q', symbol: 'q', label: 'Charge (C)', default: '0.001' },
      { key: 'v', symbol: 'v', label: 'Velocity (m/s)', default: '100' },
      { key: 'B', symbol: 'B', label: 'B-field (T)', default: '0.5' },
      { key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '90' },
    ],
    compute: ({ q, v, B, theta }) => fmt(q * v * B * Math.sin(theta * Math.PI / 180)),
  },

  // ─── Gravitation & Astronomy ──────────────────────────────────────────
  { id: 'gravitation', category: 'physics', name: 'Universal Gravitation',
    formula: 'F = G·m₁·m₂ / r²', description: 'Gravitational force',
    inputs: [
      { key: 'm1', symbol: 'm₁', label: 'Mass 1 (kg)', default: '5.97e24' },
      { key: 'm2', symbol: 'm₂', label: 'Mass 2 (kg)', default: '7.35e22' },
      { key: 'r',  symbol: 'r',  label: 'Distance (m)', default: '3.84e8' },
    ],
    compute: ({ m1, m2, r }) => {
      if (r === 0) return 'Division by zero';
      return fmt((6.67430e-11 * m1 * m2) / (r * r));
    },
  },
  { id: 'orbital-speed', category: 'physics', name: 'Orbital Speed',
    formula: 'v = √(GM / r)', description: 'Circular orbit speed',
    inputs: [
      { key: 'M', symbol: 'M', label: 'Central mass (kg)', default: '5.97e24' },
      { key: 'r', symbol: 'r', label: 'Orbit radius (m)', default: '6.78e6' },
    ],
    compute: ({ M, r }) => {
      if (r === 0) return 'Division by zero';
      return fmt(Math.sqrt((6.67430e-11 * M) / r));
    },
  },
  { id: 'escape-velocity', category: 'physics', name: 'Escape Velocity',
    formula: 'v = √(2GM / r)', description: 'Escape velocity',
    inputs: [
      { key: 'M', symbol: 'M', label: 'Mass (kg)', default: '5.97e24' },
      { key: 'r', symbol: 'r', label: 'Radius (m)', default: '6.37e6' },
    ],
    compute: ({ M, r }) => {
      if (r === 0) return 'Division by zero';
      return fmt(Math.sqrt((2 * 6.67430e-11 * M) / r));
    },
  },

  // ─── Rotation ─────────────────────────────────────────────────────────
  { id: 'torque', category: 'physics', name: 'Torque',
    formula: 'τ = F × r × sin(θ)', description: 'Torque from force',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '100' },
      { key: 'r', symbol: 'r', label: 'Lever arm (m)', default: '0.5' },
      { key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '90' },
    ],
    compute: ({ F, r, theta }) => fmt(F * r * Math.sin(theta * Math.PI / 180)),
  },
  { id: 'angular-velocity', category: 'physics', name: 'Angular Velocity',
    formula: 'ω = θ / t', description: 'Angular velocity',
    inputs: [
      { key: 'theta', symbol: 'θ', label: 'Angle (rad)', default: '6.28' },
      { key: 't',     symbol: 't', label: 'Time (s)', default: '2' },
    ],
    compute: ({ theta, t }) => t === 0 ? 'Division by zero' : fmt(theta / t),
  },
  { id: 'centripetal-force', category: 'physics', name: 'Centripetal Force',
    formula: 'F = m·v² / r', description: 'Force to keep in circular path',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '1' },
      { key: 'v', symbol: 'v', label: 'Velocity (m/s)', default: '10' },
      { key: 'r', symbol: 'r', label: 'Radius (m)', default: '5' },
    ],
    compute: ({ m, v, r }) => r === 0 ? 'Division by zero' : fmt((m * v * v) / r),
  },

  // ─── Modern Physics ───────────────────────────────────────────────────
  { id: 'energy-mass', category: 'physics', name: 'Mass-Energy Equivalence',
    formula: 'E = m·c²', description: 'Einstein mass-energy',
    inputs: [{ key: 'm', symbol: 'm', label: 'Mass (kg)', default: '1' }],
    compute: ({ m }) => fmt(m * Math.pow(299792458, 2)),
  },
  { id: 'photon-energy', category: 'physics', name: 'Photon Energy',
    formula: 'E = h·f', description: 'Energy of a photon',
    inputs: [{ key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '5e14' }],
    compute: ({ f }) => fmt(6.62607015e-34 * f),
  },
  { id: 'de-broglie', category: 'physics', name: 'de Broglie Wavelength',
    formula: 'λ = h / (m·v)', description: 'Matter wavelength',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '9.11e-31' },
      { key: 'v', symbol: 'v', label: 'Velocity (m/s)', default: '1e6' },
    ],
    compute: ({ m, v }) => {
      if (m * v === 0) return 'Division by zero';
      return fmt(6.62607015e-34 / (m * v));
    },
  },

  // ─── Misc Physics ─────────────────────────────────────────────────────
  { id: 'half-life', category: 'physics', name: 'Radioactive Decay',
    formula: 'N = N₀ × (½)^(t/t½)', description: 'Remaining atoms after time t',
    inputs: [
      { key: 'N0',  symbol: 'N₀',  label: 'Initial atoms', default: '1000' },
      { key: 't',   symbol: 't',   label: 'Elapsed time', default: '10' },
      { key: 'th',  symbol: 't½',  label: 'Half-life', default: '5' },
    ],
    compute: ({ N0, t, th }) => th === 0 ? 'Division by zero' : fmt(N0 * Math.pow(0.5, t / th)),
  },
  { id: 'ph', category: 'physics', name: 'pH (Physics)',
    formula: 'pH = −log₁₀[H⁺]', description: 'pH from hydrogen concentration',
    inputs: [{ key: 'H', symbol: '[H⁺]', label: 'Concentration (M)', default: '0.001' }],
    compute: ({ H }) => H <= 0 ? 'Must be > 0' : fmt(-Math.log10(H)),
  },
  { id: 'specific-heat-q', category: 'physics', name: 'Molar Heat Capacity',
    formula: 'Q = n·C·ΔT', description: 'Heat for n moles',
    inputs: [
      { key: 'n',  symbol: 'n',  label: 'Moles', default: '1' },
      { key: 'C',  symbol: 'C',  label: 'Molar heat (J/mol·K)', default: '30' },
      { key: 'dT', symbol: 'ΔT', label: 'Temp change (K)', default: '10' },
    ],
    compute: ({ n, C, dT }) => fmt(n * C * dT),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CHEMISTRY (60)
// ═══════════════════════════════════════════════════════════════════════════

const CHEMISTRY_FORMULAS = [
  // ─── Moles & Stoichiometry ────────────────────────────────────────────
  { id: 'moles-from-mass', category: 'chemistry', name: 'Moles from Mass',
    formula: 'n = m / M', description: 'Moles from mass and molar mass',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (g)', default: '36' },
      { key: 'M', symbol: 'M', label: 'Molar mass (g/mol)', default: '18' },
    ],
    compute: ({ m, M }) => M === 0 ? 'Division by zero' : fmt(m / M),
  },
  { id: 'mass-from-moles', category: 'chemistry', name: 'Mass from Moles',
    formula: 'm = n × M', description: 'Mass from moles and molar mass',
    inputs: [
      { key: 'n', symbol: 'n', label: 'Moles', default: '2' },
      { key: 'M', symbol: 'M', label: 'Molar mass (g/mol)', default: '18' },
    ],
    compute: ({ n, M }) => fmt(n * M),
  },
  { id: 'particles-from-moles', category: 'chemistry', name: 'Particles from Moles',
    formula: 'N = n × N_A', description: "Particles using Avogadro's number",
    inputs: [{ key: 'n', symbol: 'n', label: 'Moles', default: '1' }],
    compute: ({ n }) => fmt(n * 6.02214076e23),
  },
  { id: 'moles-from-particles', category: 'chemistry', name: 'Moles from Particles',
    formula: 'n = N / N_A', description: 'Moles from particle count',
    inputs: [{ key: 'N', symbol: 'N', label: 'Particles', default: '6.022e23' }],
    compute: ({ N }) => fmt(N / 6.02214076e23),
  },
  { id: 'molar-mass-from-mass-moles', category: 'chemistry', name: 'Molar Mass',
    formula: 'M = m / n', description: 'Molar mass from mass and moles',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (g)', default: '36' },
      { key: 'n', symbol: 'n', label: 'Moles', default: '2' },
    ],
    compute: ({ m, n }) => n === 0 ? 'Division by zero' : fmt(m / n),
  },

  // ─── Concentration ────────────────────────────────────────────────────
  { id: 'molarity', category: 'chemistry', name: 'Molarity',
    formula: 'M = n / V', description: 'Concentration in mol/L',
    inputs: [
      { key: 'n', symbol: 'n', label: 'Moles (mol)', default: '0.5' },
      { key: 'V', symbol: 'V', label: 'Volume (L)', default: '2' },
    ],
    compute: ({ n, V }) => V === 0 ? 'Division by zero' : fmt(n / V),
  },
  { id: 'moles-from-molarity', category: 'chemistry', name: 'Moles from Molarity',
    formula: 'n = M × V', description: 'Moles from molarity and volume',
    inputs: [
      { key: 'M', symbol: 'M', label: 'Molarity (M)', default: '0.5' },
      { key: 'V', symbol: 'V', label: 'Volume (L)', default: '2' },
    ],
    compute: ({ M, V }) => fmt(M * V),
  },
  { id: 'dilution', category: 'chemistry', name: 'Dilution',
    formula: 'C₁V₁ = C₂V₂', description: 'Find new concentration',
    inputs: [
      { key: 'C1', symbol: 'C₁', label: 'Initial conc (M)', default: '2' },
      { key: 'V1', symbol: 'V₁', label: 'Initial vol (L)', default: '0.5' },
      { key: 'V2', symbol: 'V₂', label: 'Final vol (L)', default: '2' },
    ],
    compute: ({ C1, V1, V2 }) => V2 === 0 ? 'Division by zero' : fmt((C1 * V1) / V2),
  },
  { id: 'molality', category: 'chemistry', name: 'Molality',
    formula: 'm = n_solute / kg_solvent', description: 'Moles per kg of solvent',
    inputs: [
      { key: 'n',  symbol: 'n',  label: 'Moles solute', default: '0.5' },
      { key: 'kg', symbol: 'kg', label: 'kg solvent', default: '1' },
    ],
    compute: ({ n, kg }) => kg === 0 ? 'Division by zero' : fmt(n / kg),
  },
  { id: 'mass-percent', category: 'chemistry', name: 'Mass Percent',
    formula: '% = (m_solute / m_solution) × 100', description: 'Mass percent concentration',
    inputs: [
      { key: 'ms',  symbol: 'm_solute', label: 'Solute mass (g)', default: '10' },
      { key: 'msol', symbol: 'm_solution', label: 'Solution mass (g)', default: '100' },
    ],
    compute: ({ ms, msol }) => msol === 0 ? 'Division by zero' : pct((ms / msol) * 100),
  },
  { id: 'mole-fraction', category: 'chemistry', name: 'Mole Fraction',
    formula: 'x_A = n_A / n_total', description: 'Fraction of one component',
    inputs: [
      { key: 'nA',   symbol: 'n_A',     label: 'Moles of A', default: '2' },
      { key: 'ntot', symbol: 'n_total', label: 'Total moles', default: '5' },
    ],
    compute: ({ nA, ntot }) => ntot === 0 ? 'Division by zero' : fmt(nA / ntot),
  },
  { id: 'normality', category: 'chemistry', name: 'Normality',
    formula: 'N = M × n_eq', description: 'Normality from molarity and equivalents',
    inputs: [
      { key: 'M', symbol: 'M', label: 'Molarity (M)', default: '0.5' },
      { key: 'n', symbol: 'n_eq', label: 'Equivalents', default: '2' },
    ],
    compute: ({ M, n }) => fmt(M * n),
  },

  // ─── Gas Laws ─────────────────────────────────────────────────────────
  { id: 'ideal-gas-v', category: 'chemistry', name: 'Ideal Gas (V)',
    formula: 'V = nRT / P', description: 'Volume of an ideal gas',
    inputs: [
      { key: 'n', symbol: 'n', label: 'Moles', default: '1' },
      { key: 'T', symbol: 'T', label: 'Temperature (K)', default: '273.15' },
      { key: 'P', symbol: 'P', label: 'Pressure (atm)', default: '1' },
    ],
    compute: ({ n, T, P }) => P === 0 ? 'Division by zero' : fmt((n * 0.082057 * T) / P),
  },
  { id: 'boyles-law', category: 'chemistry', name: "Boyle's Law",
    formula: 'P₁V₁ = P₂V₂', description: 'Solve for P₂ (T constant)',
    inputs: [
      { key: 'P1', symbol: 'P₁', label: 'Pressure 1', default: '1' },
      { key: 'V1', symbol: 'V₁', label: 'Volume 1', default: '10' },
      { key: 'V2', symbol: 'V₂', label: 'Volume 2', default: '5' },
    ],
    compute: ({ P1, V1, V2 }) => V2 === 0 ? 'Division by zero' : fmt((P1 * V1) / V2),
  },
  { id: 'charles-law', category: 'chemistry', name: "Charles's Law",
    formula: 'V₁/T₁ = V₂/T₂', description: 'Solve for V₂ (P constant)',
    inputs: [
      { key: 'V1', symbol: 'V₁', label: 'Volume 1', default: '1' },
      { key: 'T1', symbol: 'T₁', label: 'Temp 1 (K)', default: '273' },
      { key: 'T2', symbol: 'T₂', label: 'Temp 2 (K)', default: '373' },
    ],
    compute: ({ V1, T1, T2 }) => T1 === 0 ? 'Division by zero' : fmt((V1 * T2) / T1),
  },
  { id: 'combined-gas', category: 'chemistry', name: 'Combined Gas Law',
    formula: 'P₁V₁/T₁ = P₂V₂/T₂', description: 'Solve for P₂',
    inputs: [
      { key: 'P1', symbol: 'P₁', label: 'P₁', default: '1' },
      { key: 'V1', symbol: 'V₁', label: 'V₁', default: '1' },
      { key: 'T1', symbol: 'T₁', label: 'T₁ (K)', default: '273' },
      { key: 'V2', symbol: 'V₂', label: 'V₂', default: '2' },
      { key: 'T2', symbol: 'T₂', label: 'T₂ (K)', default: '546' },
    ],
    compute: ({ P1, V1, T1, V2, T2 }) => {
      if (V2 === 0 || T1 === 0) return 'Division by zero';
      return fmt((P1 * V1 * T2) / (T1 * V2));
    },
  },
  { id: 'gay-lussac', category: 'chemistry', name: "Gay-Lussac's Law",
    formula: 'P₁/T₁ = P₂/T₂', description: 'Solve for P₂ (V constant)',
    inputs: [
      { key: 'P1', symbol: 'P₁', label: 'P₁', default: '1' },
      { key: 'T1', symbol: 'T₁', label: 'T₁ (K)', default: '273' },
      { key: 'T2', symbol: 'T₂', label: 'T₂ (K)', default: '373' },
    ],
    compute: ({ P1, T1, T2 }) => T1 === 0 ? 'Division by zero' : fmt((P1 * T2) / T1),
  },
  { id: 'daltons-partial', category: 'chemistry', name: "Dalton's Law",
    formula: 'P_total = P₁ + P₂ + P₃', description: 'Sum of partial pressures',
    inputs: [
      { key: 'p1', symbol: 'P₁', label: 'P₁', default: '1' },
      { key: 'p2', symbol: 'P₂', label: 'P₂', default: '2' },
      { key: 'p3', symbol: 'P₃', label: 'P₃', default: '3' },
    ],
    compute: ({ p1, p2, p3 }) => fmt(p1 + p2 + p3),
  },
  { id: 'grahams-law', category: 'chemistry', name: "Graham's Law",
    formula: 'r₁/r₂ = √(M₂/M₁)', description: 'Effusion rate ratio',
    inputs: [
      { key: 'M1', symbol: 'M₁', label: 'Molar mass 1', default: '2' },
      { key: 'M2', symbol: 'M₂', label: 'Molar mass 2', default: '32' },
    ],
    compute: ({ M1, M2 }) => {
      if (M1 <= 0 || M2 <= 0) return 'Invalid';
      return fmt(Math.sqrt(M2 / M1));
    },
  },

  // ─── Stoichiometry ────────────────────────────────────────────────────
  { id: 'percent-yield', category: 'chemistry', name: 'Percent Yield',
    formula: '% = (actual / theoretical) × 100', description: 'Reaction efficiency',
    inputs: [
      { key: 'a', symbol: 'actual', label: 'Actual (g)', default: '15' },
      { key: 't', symbol: 'theory', label: 'Theoretical (g)', default: '20' },
    ],
    compute: ({ a, t }) => t === 0 ? 'Division by zero' : pct((a / t) * 100),
  },
  { id: 'percent-composition', category: 'chemistry', name: 'Percent Composition',
    formula: '% = (m_el / m_total) × 100', description: 'Mass percent of element',
    inputs: [
      { key: 'me', symbol: 'm_el', label: 'Element mass (g)', default: '32' },
      { key: 'mt', symbol: 'm_total', label: 'Compound mass (g)', default: '98' },
    ],
    compute: ({ me, mt }) => mt === 0 ? 'Division by zero' : pct((me / mt) * 100),
  },
  { id: 'empirical-mass', category: 'chemistry', name: 'Empirical Formula Mass',
    formula: 'M_emp = sum(atomic masses)', description: 'Sum of atomic masses',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Element 1 mass', default: '12' },
      { key: 'b', symbol: 'b', label: 'Element 2 mass', default: '16' },
      { key: 'c', symbol: 'c', label: 'Element 3 mass', default: '0' },
    ],
    compute: ({ a, b, c }) => fmt(a + b + c),
  },

  // ─── Acids & Bases ────────────────────────────────────────────────────
  { id: 'ph-from-h', category: 'chemistry', name: 'pH from [H⁺]',
    formula: 'pH = −log₁₀[H⁺]', description: 'pH from hydrogen concentration',
    inputs: [{ key: 'H', symbol: '[H⁺]', label: 'Concentration (M)', default: '0.001' }],
    compute: ({ H }) => H <= 0 ? 'Must be > 0' : fmt(-Math.log10(H)),
  },
  { id: 'poh-from-oh', category: 'chemistry', name: 'pOH from [OH⁻]',
    formula: 'pOH = −log₁₀[OH⁻]', description: 'pOH from hydroxide concentration',
    inputs: [{ key: 'OH', symbol: '[OH⁻]', label: 'Concentration (M)', default: '0.001' }],
    compute: ({ OH }) => OH <= 0 ? 'Must be > 0' : fmt(-Math.log10(OH)),
  },
  { id: 'ph-poh', category: 'chemistry', name: 'pH + pOH',
    formula: 'pH + pOH = 14', description: 'At 25°C',
    inputs: [{ key: 'poh', symbol: 'pOH', label: 'pOH', default: '4' }],
    compute: ({ poh }) => fmt(14 - poh),
  },
  { id: 'h-from-ph', category: 'chemistry', name: '[H⁺] from pH',
    formula: '[H⁺] = 10^(−pH)', description: 'Hydrogen concentration from pH',
    inputs: [{ key: 'ph', symbol: 'pH', label: 'pH', default: '3' }],
    compute: ({ ph }) => fmt(Math.pow(10, -ph)),
  },
  { id: 'ka-from-pka', category: 'chemistry', name: 'Ka from pKa',
    formula: 'Ka = 10^(−pKa)', description: 'Acid dissociation constant',
    inputs: [{ key: 'pka', symbol: 'pKa', label: 'pKa', default: '4.76' }],
    compute: ({ pka }) => fmt(Math.pow(10, -pka)),
  },
  { id: 'pka-from-ka', category: 'chemistry', name: 'pKa from Ka',
    formula: 'pKa = −log₁₀(Ka)', description: 'pKa from Ka',
    inputs: [{ key: 'ka', symbol: 'Ka', label: 'Ka', default: '0.0000175' }],
    compute: ({ ka }) => ka <= 0 ? 'Must be > 0' : fmt(-Math.log10(ka)),
  },
  { id: 'kw-water', category: 'chemistry', name: 'Water Ion Product',
    formula: 'Kw = [H⁺][OH⁻] = 10⁻¹⁴', description: 'Water autoionization constant',
    inputs: [{ key: 'H', symbol: '[H⁺]', label: 'H⁺ (M)', default: '0.0000001' }],
    compute: ({ H }) => H === 0 ? 'Division by zero' : fmt(1e-14 / H),
  },
  { id: 'henderson-hasselbalch', category: 'chemistry', name: 'Henderson-Hasselbalch',
    formula: 'pH = pKa + log([A⁻]/[HA])', description: 'Buffer pH',
    inputs: [
      { key: 'pka', symbol: 'pKa', label: 'pKa', default: '4.76' },
      { key: 'a',   symbol: '[A⁻]', label: 'Base conc', default: '0.1' },
      { key: 'ha',  symbol: '[HA]', label: 'Acid conc', default: '0.1' },
    ],
    compute: ({ pka, a, ha }) => {
      if (a <= 0 || ha <= 0) return 'Must be > 0';
      return fmt(pka + Math.log10(a / ha));
    },
  },

  // ─── Thermochemistry ──────────────────────────────────────────────────
  { id: 'heat-reaction', category: 'chemistry', name: 'Heat of Reaction',
    formula: 'Q = m × c × ΔT', description: 'Calorimetry heat',
    inputs: [
      { key: 'm',  symbol: 'm',  label: 'Mass (g)', default: '100' },
      { key: 'c',  symbol: 'c',  label: 'Specific heat (J/g·°C)', default: '4.18' },
      { key: 'dT', symbol: 'ΔT', label: 'Temp change (°C)', default: '10' },
    ],
    compute: ({ m, c, dT }) => fmt(m * c * dT),
  },
  { id: 'enthalpy-formation', category: 'chemistry', name: 'Enthalpy of Reaction',
    formula: 'ΔH = ΣΔH_products − ΣΔH_reactants', description: "Hess's law (2 terms)",
    inputs: [
      { key: 'hp', symbol: 'ΔH_p', label: 'Product enthalpy', default: '-394' },
      { key: 'hr', symbol: 'ΔH_r', label: 'Reactant enthalpy', default: '-200' },
    ],
    compute: ({ hp, hr }) => fmt(hp - hr),
  },
  { id: 'gibbs-free-energy', category: 'chemistry', name: 'Gibbs Free Energy',
    formula: 'ΔG = ΔH − T·ΔS', description: 'Spontaneity criterion',
    inputs: [
      { key: 'dh', symbol: 'ΔH', label: 'Enthalpy (kJ/mol)', default: '-100' },
      { key: 'T',  symbol: 'T',  label: 'Temperature (K)', default: '298' },
      { key: 'ds', symbol: 'ΔS', label: 'Entropy (kJ/mol·K)', default: '0.05' },
    ],
    compute: ({ dh, T, ds }) => fmt(dh - T * ds),
  },
  { id: 'entropy-change', category: 'chemistry', name: 'Entropy Change',
    formula: 'ΔS = Q_rev / T', description: 'Reversible entropy change',
    inputs: [
      { key: 'q', symbol: 'Q_rev', label: 'Heat (J)', default: '1000' },
      { key: 'T', symbol: 'T', label: 'Temperature (K)', default: '298' },
    ],
    compute: ({ q, T }) => T === 0 ? 'Division by zero' : fmt(q / T),
  },

  // ─── Kinetics ─────────────────────────────────────────────────────────
  { id: 'rate-law-simple', category: 'chemistry', name: 'Rate Law',
    formula: 'rate = k[A]^n', description: 'Reaction rate from concentration',
    inputs: [
      { key: 'k', symbol: 'k', label: 'Rate constant', default: '0.1' },
      { key: 'A', symbol: '[A]', label: 'Concentration', default: '1' },
      { key: 'n', symbol: 'n', label: 'Order', default: '1' },
    ],
    compute: ({ k, A, n }) => fmt(k * Math.pow(A, n)),
  },
  { id: 'arrhenius', category: 'chemistry', name: 'Arrhenius Equation',
    formula: 'k = A·exp(−Ea/RT)', description: 'Rate constant vs temperature',
    inputs: [
      { key: 'A',  symbol: 'A',  label: 'Pre-exponential', default: '1e13' },
      { key: 'Ea', symbol: 'Ea', label: 'Activation E (J/mol)', default: '50000' },
      { key: 'T',  symbol: 'T',  label: 'Temperature (K)', default: '300' },
    ],
    compute: ({ A, Ea, T }) => {
      if (T === 0) return 'Division by zero';
      return fmt(A * Math.exp(-Ea / (8.314 * T)));
    },
  },

  // ─── Solutions ────────────────────────────────────────────────────────
  { id: 'raoults-law', category: 'chemistry', name: "Raoult's Law",
    formula: 'P_sol = x_solvent × P°_solvent', description: 'Vapor pressure of solution',
    inputs: [
      { key: 'x',  symbol: 'x',  label: 'Mole fraction solvent', default: '0.9' },
      { key: 'P0', symbol: 'P°', label: 'Pure vapor pressure', default: '100' },
    ],
    compute: ({ x, P0 }) => fmt(x * P0),
  },
  { id: 'freezing-point-depression', category: 'chemistry', name: 'Freezing Point Depression',
    formula: 'ΔT = Kf × m', description: 'Freezing point lowering',
    inputs: [
      { key: 'Kf', symbol: 'Kf', label: 'Kf (°C·kg/mol)', default: '1.86' },
      { key: 'm',  symbol: 'm',  label: 'Molality (mol/kg)', default: '1' },
    ],
    compute: ({ Kf, m }) => fmt(Kf * m),
  },
  { id: 'boiling-point-elevation', category: 'chemistry', name: 'Boiling Point Elevation',
    formula: 'ΔT = Kb × m', description: 'Boiling point raising',
    inputs: [
      { key: 'Kb', symbol: 'Kb', label: 'Kb (°C·kg/mol)', default: '0.512' },
      { key: 'm',  symbol: 'm',  label: 'Molality (mol/kg)', default: '1' },
    ],
    compute: ({ Kb, m }) => fmt(Kb * m),
  },

  // ─── Electrochemistry ─────────────────────────────────────────────────
  { id: 'nernst-equation', category: 'chemistry', name: 'Nernst Equation',
    formula: 'E = E° − (RT/nF)·ln(Q)', description: 'Cell potential with concentration',
    inputs: [
      { key: 'E0', symbol: 'E°', label: 'Standard potential (V)', default: '1.1' },
      { key: 'n',  symbol: 'n',  label: 'Electrons transferred', default: '2' },
      { key: 'Q',  symbol: 'Q',  label: 'Reaction quotient', default: '1' },
      { key: 'T',  symbol: 'T',  label: 'Temperature (K)', default: '298' },
    ],
    compute: ({ E0, n, Q, T }) => {
      if (n === 0 || Q <= 0) return 'Invalid';
      return fmt(E0 - (8.314 * T) / (n * 96485) * Math.log(Q));
    },
  },
  { id: 'faraday-mass', category: 'chemistry', name: 'Electrolysis Mass',
    formula: 'm = (I·t·M) / (n·F)', description: 'Mass deposited by electrolysis',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
      { key: 't', symbol: 't', label: 'Time (s)', default: '3600' },
      { key: 'M', symbol: 'M', label: 'Molar mass (g/mol)', default: '63.5' },
      { key: 'n', symbol: 'n', label: 'Electrons', default: '2' },
    ],
    compute: ({ I, t, M, n }) => {
      if (n === 0) return 'Division by zero';
      return fmt((I * t * M) / (n * 96485));
    },
  },

  // ─── Nuclear ──────────────────────────────────────────────────────────
  { id: 'half-life-chem', category: 'chemistry', name: 'Radioactive Half-Life',
    formula: 'N = N₀ × (½)^(t/t½)', description: 'Remaining after time t',
    inputs: [
      { key: 'N0', symbol: 'N₀', label: 'Initial amount', default: '100' },
      { key: 't',  symbol: 't',  label: 'Time', default: '10' },
      { key: 'th', symbol: 't½', label: 'Half-life', default: '5' },
    ],
    compute: ({ N0, t, th }) => th === 0 ? 'Division by zero' : fmt(N0 * Math.pow(0.5, t / th)),
  },
  { id: 'decay-constant', category: 'chemistry', name: 'Decay Constant',
    formula: 'λ = ln(2) / t½', description: 'From half-life',
    inputs: [{ key: 'th', symbol: 't½', label: 'Half-life', default: '5' }],
    compute: ({ th }) => th === 0 ? 'Division by zero' : fmt(Math.LN2 / th),
  },

  // ─── Misc Chemistry ───────────────────────────────────────────────────
  { id: 'dilution-factor', category: 'chemistry', name: 'Dilution Factor',
    formula: 'DF = V_final / V_aliquot', description: 'Dilution ratio',
    inputs: [
      { key: 'vf', symbol: 'V_final',  label: 'Final volume', default: '100' },
      { key: 'va', symbol: 'V_aliquot', label: 'Aliquot', default: '10' },
    ],
    compute: ({ vf, va }) => va === 0 ? 'Division by zero' : fmt(vf / va),
  },
  { id: 'percent-error', category: 'chemistry', name: 'Percent Error',
    formula: '% = |exp − true| / true × 100', description: 'Measurement accuracy',
    inputs: [
      { key: 'e', symbol: 'exp',  label: 'Experimental', default: '9.8' },
      { key: 't', symbol: 'true', label: 'True value',   default: '9.81' },
    ],
    compute: ({ e, t }) => t === 0 ? 'Division by zero' : pct(Math.abs(e - t) / Math.abs(t) * 100),
  },
  { id: 'molar-volume', category: 'chemistry', name: 'Molar Volume',
    formula: 'Vm = V / n', description: 'Volume per mole',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Volume (L)', default: '22.4' },
      { key: 'n', symbol: 'n', label: 'Moles',      default: '1' },
    ],
    compute: ({ V, n }) => n === 0 ? 'Division by zero' : fmt(V / n),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ELECTRICAL (60)
// ═══════════════════════════════════════════════════════════════════════════

const ELECTRICAL_FORMULAS = [
  { id: 'ohms-law', category: 'electrical', name: "Ohm's Law",
    formula: 'V = I × R', description: 'Voltage from current and resistance',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ I, R }) => fmt(I * R),
  },
  { id: 'ohms-law-i', category: 'electrical', name: "Ohm's Law (I)",
    formula: 'I = V / R', description: 'Current from voltage and resistance',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ V, R }) => R === 0 ? 'Division by zero' : fmt(V / R),
  },
  { id: 'ohms-law-r', category: 'electrical', name: "Ohm's Law (R)",
    formula: 'R = V / I', description: 'Resistance from voltage and current',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
    ],
    compute: ({ V, I }) => I === 0 ? 'Division by zero' : fmt(V / I),
  },
  { id: 'power-vi', category: 'electrical', name: 'Power (V×I)',
    formula: 'P = V × I', description: 'Power from voltage and current',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
    ],
    compute: ({ V, I }) => fmt(V * I),
  },
  { id: 'power-i2r', category: 'electrical', name: 'Power (I²R)',
    formula: 'P = I² × R', description: 'Power from current and resistance',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ I, R }) => fmt(I * I * R),
  },
  { id: 'power-v2r', category: 'electrical', name: 'Power (V²/R)',
    formula: 'P = V² / R', description: 'Power from voltage and resistance',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ V, R }) => R === 0 ? 'Division by zero' : fmt((V * V) / R),
  },
  { id: 'resistors-series', category: 'electrical', name: 'Resistors in Series',
    formula: 'R = R₁ + R₂ + R₃', description: 'Series resistance',
    inputs: [
      { key: 'r1', symbol: 'R₁', label: 'R₁ (Ω)', default: '10' },
      { key: 'r2', symbol: 'R₂', label: 'R₂ (Ω)', default: '20' },
      { key: 'r3', symbol: 'R₃', label: 'R₃ (Ω)', default: '30' },
    ],
    compute: ({ r1, r2, r3 }) => fmt(r1 + r2 + r3),
  },
  { id: 'resistors-parallel', category: 'electrical', name: 'Resistors in Parallel',
    formula: '1/R = 1/R₁ + 1/R₂ + 1/R₃', description: 'Parallel resistance',
    inputs: [
      { key: 'r1', symbol: 'R₁', label: 'R₁ (Ω)', default: '10' },
      { key: 'r2', symbol: 'R₂', label: 'R₂ (Ω)', default: '10' },
      { key: 'r3', symbol: 'R₃', label: 'R₃ (Ω)', default: '1e12' },
    ],
    compute: ({ r1, r2, r3 }) => {
      if (r1 === 0 || r2 === 0 || r3 === 0) return 'Zero resistance';
      return fmt(1 / (1 / r1 + 1 / r2 + 1 / r3));
    },
  },
  { id: 'resistors-parallel-2', category: 'electrical', name: 'Parallel R₁ ∥ R₂',
    formula: 'R = R₁R₂ / (R₁ + R₂)', description: 'Two parallel resistors',
    inputs: [
      { key: 'r1', symbol: 'R₁', label: 'R₁ (Ω)', default: '10' },
      { key: 'r2', symbol: 'R₂', label: 'R₂ (Ω)', default: '10' },
    ],
    compute: ({ r1, r2 }) => r1 + r2 === 0 ? 'Division by zero' : fmt((r1 * r2) / (r1 + r2)),
  },
  { id: 'voltage-divider', category: 'electrical', name: 'Voltage Divider (V_out)',
    formula: 'V_out = V_in × R₂ / (R₁ + R₂)', description: 'Output of resistive divider',
    inputs: [
      { key: 'Vin', symbol: 'V_in', label: 'Input (V)', default: '12' },
      { key: 'R1', symbol: 'R₁', label: 'R₁ (Ω)', default: '1000' },
      { key: 'R2', symbol: 'R₂', label: 'R₂ (Ω)', default: '1000' },
    ],
    compute: ({ Vin, R1, R2 }) => R1 + R2 === 0 ? 'Division by zero' : fmt((Vin * R2) / (R1 + R2)),
  },
  { id: 'current-divider', category: 'electrical', name: 'Current Divider',
    formula: 'I₁ = I_total × R₂ / (R₁ + R₂)', description: 'Split current',
    inputs: [
      { key: 'It', symbol: 'I_total', label: 'Total (A)', default: '1' },
      { key: 'R1', symbol: 'R₁', label: 'R₁ (Ω)', default: '100' },
      { key: 'R2', symbol: 'R₂', label: 'R₂ (Ω)', default: '100' },
    ],
    compute: ({ It, R1, R2 }) => R1 + R2 === 0 ? 'Division by zero' : fmt((It * R2) / (R1 + R2)),
  },
  { id: 'capacitor-charge', category: 'electrical', name: 'Capacitor Charge',
    formula: 'Q = C × V', description: 'Charge on a capacitor',
    inputs: [
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.001' },
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
    ],
    compute: ({ C, V }) => fmt(C * V),
  },
  { id: 'capacitor-energy', category: 'electrical', name: 'Capacitor Energy',
    formula: 'E = ½CV²', description: 'Energy in a capacitor',
    inputs: [
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.001' },
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
    ],
    compute: ({ C, V }) => fmt(0.5 * C * V * V),
  },
  { id: 'capacitors-series', category: 'electrical', name: 'Capacitors in Series',
    formula: '1/C = 1/C₁ + 1/C₂', description: 'Series capacitance',
    inputs: [
      { key: 'c1', symbol: 'C₁', label: 'C₁ (F)', default: '0.00001' },
      { key: 'c2', symbol: 'C₂', label: 'C₂ (F)', default: '0.00001' },
    ],
    compute: ({ c1, c2 }) => {
      if (c1 === 0 || c2 === 0) return 'Zero capacitance';
      return fmt(1 / (1 / c1 + 1 / c2));
    },
  },
  { id: 'capacitors-parallel', category: 'electrical', name: 'Capacitors in Parallel',
    formula: 'C = C₁ + C₂ + C₃', description: 'Parallel capacitance',
    inputs: [
      { key: 'c1', symbol: 'C₁', label: 'C₁ (F)', default: '0.00001' },
      { key: 'c2', symbol: 'C₂', label: 'C₂ (F)', default: '0.00002' },
      { key: 'c3', symbol: 'C₃', label: 'C₃ (F)', default: '0.00003' },
    ],
    compute: ({ c1, c2, c3 }) => fmt(c1 + c2 + c3),
  },
  { id: 'rc-time', category: 'electrical', name: 'RC Time Constant',
    formula: 'τ = R × C', description: 'RC time constant',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '1000' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.001' },
    ],
    compute: ({ R, C }) => fmt(R * C),
  },
  { id: 'rl-time', category: 'electrical', name: 'RL Time Constant',
    formula: 'τ = L / R', description: 'RL time constant',
    inputs: [
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '100' },
    ],
    compute: ({ L, R }) => R === 0 ? 'Division by zero' : fmt(L / R),
  },
  { id: 'inductor-energy', category: 'electrical', name: 'Inductor Energy',
    formula: 'E = ½LI²', description: 'Energy in an inductor',
    inputs: [
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
    ],
    compute: ({ L, I }) => fmt(0.5 * L * I * I),
  },
  { id: 'inductors-series', category: 'electrical', name: 'Inductors in Series',
    formula: 'L = L₁ + L₂ + L₃', description: 'Series inductance',
    inputs: [
      { key: 'l1', symbol: 'L₁', label: 'L₁ (H)', default: '0.1' },
      { key: 'l2', symbol: 'L₂', label: 'L₂ (H)', default: '0.2' },
      { key: 'l3', symbol: 'L₃', label: 'L₃ (H)', default: '0.3' },
    ],
    compute: ({ l1, l2, l3 }) => fmt(l1 + l2 + l3),
  },
  { id: 'inductors-parallel', category: 'electrical', name: 'Inductors in Parallel',
    formula: '1/L = 1/L₁ + 1/L₂', description: 'Parallel inductance',
    inputs: [
      { key: 'l1', symbol: 'L₁', label: 'L₁ (H)', default: '0.1' },
      { key: 'l2', symbol: 'L₂', label: 'L₂ (H)', default: '0.1' },
    ],
    compute: ({ l1, l2 }) => {
      if (l1 === 0 || l2 === 0) return 'Zero inductance';
      return fmt(1 / (1 / l1 + 1 / l2));
    },
  },
  { id: 'inductive-reactance', category: 'electrical', name: 'Inductive Reactance',
    formula: 'X_L = 2πfL', description: 'Inductive reactance',
    inputs: [
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '60' },
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
    ],
    compute: ({ f, L }) => fmt(2 * Math.PI * f * L),
  },
  { id: 'capacitive-reactance', category: 'electrical', name: 'Capacitive Reactance',
    formula: 'X_C = 1 / (2πfC)', description: 'Capacitive reactance',
    inputs: [
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '60' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.000001' },
    ],
    compute: ({ f, C }) => (f === 0 || C === 0) ? 'Division by zero' : fmt(1 / (2 * Math.PI * f * C)),
  },
  { id: 'impedance-rc', category: 'electrical', name: 'RC Impedance',
    formula: 'Z = √(R² + X_C²)', description: 'Impedance of RC circuit',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '100' },
      { key: 'X', symbol: 'X_C', label: 'X_C (Ω)', default: '50' },
    ],
    compute: ({ R, X }) => fmt(Math.hypot(R, X)),
  },
  { id: 'impedance-rl', category: 'electrical', name: 'RL Impedance',
    formula: 'Z = √(R² + X_L²)', description: 'Impedance of RL circuit',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '100' },
      { key: 'X', symbol: 'X_L', label: 'X_L (Ω)', default: '50' },
    ],
    compute: ({ R, X }) => fmt(Math.hypot(R, X)),
  },
  { id: 'resonance-freq', category: 'electrical', name: 'LC Resonance',
    formula: 'f = 1 / (2π√(LC))', description: 'LC resonance frequency',
    inputs: [
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.00001' },
    ],
    compute: ({ L, C }) => (L <= 0 || C <= 0) ? 'Invalid' : fmt(1 / (2 * Math.PI * Math.sqrt(L * C))),
  },
  { id: 'energy-kwh', category: 'electrical', name: 'Energy (kWh)',
    formula: 'E = P × t / 1000', description: 'Energy consumption',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Power (W)', default: '1000' },
      { key: 't', symbol: 't', label: 'Time (h)', default: '2' },
    ],
    compute: ({ P, t }) => fmt((P * t) / 1000),
  },
  { id: 'cost-electricity', category: 'electrical', name: 'Electricity Cost',
    formula: 'Cost = kWh × rate', description: 'Cost from energy and rate',
    inputs: [
      { key: 'kwh', symbol: 'kWh', label: 'Energy (kWh)', default: '10' },
      { key: 'r',   symbol: 'rate', label: 'Rate per kWh', default: '0.15' },
    ],
    compute: ({ kwh, r }) => fmt(kwh * r),
  },
  { id: 'three-phase-power', category: 'electrical', name: 'Three-Phase Power',
    formula: 'P = √3 · V_L · I_L · cos(φ)', description: '3-phase real power',
    inputs: [
      { key: 'V', symbol: 'V_L', label: 'Line voltage (V)', default: '400' },
      { key: 'I', symbol: 'I_L', label: 'Line current (A)', default: '10' },
      { key: 'pf', symbol: 'cos(φ)', label: 'Power factor', default: '0.9' },
    ],
    compute: ({ V, I, pf }) => fmt(Math.sqrt(3) * V * I * pf),
  },
  { id: 'transformer-secondary-v', category: 'electrical', name: 'Transformer (V)',
    formula: 'V_s = V_p × N_s / N_p', description: 'Secondary voltage',
    inputs: [
      { key: 'Vp', symbol: 'V_p', label: 'Primary V', default: '230' },
      { key: 'Np', symbol: 'N_p', label: 'Primary turns', default: '1000' },
      { key: 'Ns', symbol: 'N_s', label: 'Secondary turns', default: '100' },
    ],
    compute: ({ Vp, Np, Ns }) => Np === 0 ? 'Division by zero' : fmt((Vp * Ns) / Np),
  },
  { id: 'transformer-turns', category: 'electrical', name: 'Transformer Turns Ratio',
    formula: 'N_p/N_s = V_p/V_s', description: 'Turns ratio',
    inputs: [
      { key: 'Vp', symbol: 'V_p', label: 'Primary V', default: '230' },
      { key: 'Vs', symbol: 'V_s', label: 'Secondary V', default: '23' },
    ],
    compute: ({ Vp, Vs }) => Vs === 0 ? 'Division by zero' : fmt(Vp / Vs),
  },
  { id: 'wire-resistance', category: 'electrical', name: 'Wire Resistance',
    formula: 'R = ρL / A', description: 'Resistance of a wire',
    inputs: [
      { key: 'rho', symbol: 'ρ', label: 'Resistivity (Ω·m)', default: '1.68e-8' },
      { key: 'L',   symbol: 'L', label: 'Length (m)', default: '100' },
      { key: 'A',   symbol: 'A', label: 'Area (m²)', default: '1e-6' },
    ],
    compute: ({ rho, L, A }) => A === 0 ? 'Division by zero' : fmt((rho * L) / A),
  },
  { id: 'current-density', category: 'electrical', name: 'Current Density',
    formula: 'J = I / A', description: 'Current per unit area',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '10' },
      { key: 'A', symbol: 'A', label: 'Area (m²)', default: '0.0001' },
    ],
    compute: ({ I, A }) => A === 0 ? 'Division by zero' : fmt(I / A),
  },
  { id: 'electric-charge', category: 'electrical', name: 'Electric Charge',
    formula: 'Q = I × t', description: 'Charge from current and time',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
      { key: 't', symbol: 't', label: 'Time (s)', default: '10' },
    ],
    compute: ({ I, t }) => fmt(I * t),
  },
  { id: 'battery-life', category: 'electrical', name: 'Battery Life',
    formula: 't = Capacity / Current', description: 'Battery duration',
    inputs: [
      { key: 'C', symbol: 'Ah', label: 'Capacity (Ah)', default: '10' },
      { key: 'I', symbol: 'I',  label: 'Current (A)',   default: '0.5' },
    ],
    compute: ({ C, I }) => I === 0 ? 'Division by zero' : fmt(C / I) + ' h',
  },
  { id: 'peak-rms-v', category: 'electrical', name: 'Peak to RMS (V)',
    formula: 'V_rms = V_peak / √2', description: 'RMS from peak voltage',
    inputs: [{ key: 'Vp', symbol: 'V_peak', label: 'Peak (V)', default: '170' }],
    compute: ({ Vp }) => fmt(Vp / Math.SQRT2),
  },
  { id: 'peak-rms-i', category: 'electrical', name: 'Peak to RMS (I)',
    formula: 'I_rms = I_peak / √2', description: 'RMS from peak current',
    inputs: [{ key: 'Ip', symbol: 'I_peak', label: 'Peak (A)', default: '5' }],
    compute: ({ Ip }) => fmt(Ip / Math.SQRT2),
  },
  { id: 'apparent-power', category: 'electrical', name: 'Apparent Power',
    formula: 'S = V × I', description: 'Apparent power (VA)',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '230' },
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '5' },
    ],
    compute: ({ V, I }) => fmt(V * I),
  },
  { id: 'power-factor', category: 'electrical', name: 'Power Factor',
    formula: 'PF = P / S', description: 'Real / apparent power',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Real (W)', default: '1000' },
      { key: 'S', symbol: 'S', label: 'Apparent (VA)', default: '1250' },
    ],
    compute: ({ P, S }) => S === 0 ? 'Division by zero' : fmt(P / S),
  },
  { id: 'reactive-power', category: 'electrical', name: 'Reactive Power',
    formula: 'Q = √(S² − P²)', description: 'Reactive power (VAR)',
    inputs: [
      { key: 'S', symbol: 'S', label: 'Apparent (VA)', default: '1250' },
      { key: 'P', symbol: 'P', label: 'Real (W)', default: '1000' },
    ],
    compute: ({ S, P }) => {
      const v = S * S - P * P;
      return v < 0 ? 'Invalid' : fmt(Math.sqrt(v));
    },
  },
  { id: 'voltage-drop', category: 'electrical', name: 'Voltage Drop',
    formula: 'V_drop = 2 × I × L × R_per_m', description: 'Wire voltage drop',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '10' },
      { key: 'L', symbol: 'L', label: 'Length (m)', default: '50' },
      { key: 'R', symbol: 'R_per_m', label: 'Ω per meter', default: '0.005' },
    ],
    compute: ({ I, L, R }) => fmt(2 * I * L * R),
  },
  { id: 'short-circuit-current', category: 'electrical', name: 'Short Circuit Current',
    formula: 'I_sc = V / Z', description: 'Fault current',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '230' },
      { key: 'Z', symbol: 'Z', label: 'Impedance (Ω)', default: '0.1' },
    ],
    compute: ({ V, Z }) => Z === 0 ? 'Division by zero' : fmt(V / Z),
  },
  { id: 'fuse-rating', category: 'electrical', name: 'Fuse Rating',
    formula: 'I_fuse = P / V × 1.25', description: 'Recommended fuse (with margin)',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Power (W)', default: '2000' },
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '230' },
    ],
    compute: ({ P, V }) => V === 0 ? 'Division by zero' : fmt((P / V) * 1.25),
  },
  { id: 'db-power-ratio', category: 'electrical', name: 'Power Ratio (dB)',
    formula: 'dB = 10·log₁₀(P_out/P_in)', description: 'Power ratio in dB',
    inputs: [
      { key: 'Po', symbol: 'P_out', label: 'Output (W)', default: '100' },
      { key: 'Pi', symbol: 'P_in',  label: 'Input (W)',  default: '1' },
    ],
    compute: ({ Po, Pi }) => (Pi <= 0 || Po <= 0) ? 'Must be > 0' : `${fmt(10 * Math.log10(Po / Pi))} dB`,
  },
  { id: 'motor-torque', category: 'electrical', name: 'Motor Torque',
    formula: 'T = (P × 60) / (2π × N)', description: 'Torque from power and RPM',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Power (W)', default: '1000' },
      { key: 'N', symbol: 'N', label: 'Speed (RPM)', default: '1500' },
    ],
    compute: ({ P, N }) => N === 0 ? 'Division by zero' : fmt((P * 60) / (2 * Math.PI * N)),
  },
  { id: 'motor-power', category: 'electrical', name: 'Motor Power (HP)',
    formula: 'HP = (T × N) / 5252', description: 'Horsepower from torque (lb-ft)',
    inputs: [
      { key: 'T', symbol: 'T', label: 'Torque (lb-ft)', default: '100' },
      { key: 'N', symbol: 'N', label: 'Speed (RPM)',    default: '1500' },
    ],
    compute: ({ T, N }) => fmt((T * N) / 5252),
  },
  { id: 'cable-ampacity', category: 'electrical', name: 'Cable Ampacity (mm² rule)',
    formula: 'I ≈ 4 × A', description: 'Rule of thumb for copper',
    inputs: [{ key: 'A', symbol: 'A', label: 'Area (mm²)', default: '2.5' }],
    compute: ({ A }) => fmt(4 * A),
  },
  { id: 'earth-resistance', category: 'electrical', name: 'Earth Resistance',
    formula: 'R = ρ / (2πL) × ln(4L/d)', description: 'Ground rod resistance',
    inputs: [
      { key: 'rho', symbol: 'ρ', label: 'Resistivity (Ω·m)', default: '100' },
      { key: 'L',   symbol: 'L', label: 'Rod length (m)',    default: '3' },
      { key: 'd',   symbol: 'd', label: 'Rod diameter (m)',  default: '0.02' },
    ],
    compute: ({ rho, L, d }) => {
      if (L <= 0 || d <= 0) return 'Invalid';
      return fmt((rho / (2 * Math.PI * L)) * Math.log((4 * L) / d));
    },
  },
  { id: 'led-series-r', category: 'electrical', name: 'LED Series Resistor',
    formula: 'R = (V_s − V_f) / I_f', description: 'Resistor for LED',
    inputs: [
      { key: 'Vs', symbol: 'V_s', label: 'Supply (V)', default: '12' },
      { key: 'Vf', symbol: 'V_f', label: 'Forward (V)', default: '2' },
      { key: 'If', symbol: 'I_f', label: 'Current (mA)', default: '20' },
    ],
    compute: ({ Vs, Vf, If }) => If === 0 ? 'Division by zero' : fmt(((Vs - Vf) * 1000) / If) + ' Ω',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ELECTRONICS (60)
// ═══════════════════════════════════════════════════════════════════════════

const ELECTRONICS_FORMULAS = [
  { id: 'voltage-divider-e', category: 'electronics', name: 'Voltage Divider',
    formula: 'V_out = V_in × R₂ / (R₁ + R₂)', description: 'Output of resistive divider',
    inputs: [
      { key: 'Vin', symbol: 'V_in', label: 'Input (V)', default: '12' },
      { key: 'R1', symbol: 'R₁', label: 'R₁ (Ω)', default: '1000' },
      { key: 'R2', symbol: 'R₂', label: 'R₂ (Ω)', default: '1000' },
    ],
    compute: ({ Vin, R1, R2 }) => R1 + R2 === 0 ? 'Division by zero' : fmt((Vin * R2) / (R1 + R2)),
  },
  { id: 'current-divider-e', category: 'electronics', name: 'Current Divider',
    formula: 'I₁ = I_total × R₂ / (R₁ + R₂)', description: 'Split current',
    inputs: [
      { key: 'It', symbol: 'I_total', label: 'Total (A)', default: '1' },
      { key: 'R1', symbol: 'R₁', label: 'R₁ (Ω)', default: '100' },
      { key: 'R2', symbol: 'R₂', label: 'R₂ (Ω)', default: '100' },
    ],
    compute: ({ It, R1, R2 }) => R1 + R2 === 0 ? 'Division by zero' : fmt((It * R2) / (R1 + R2)),
  },
  { id: 'opamp-inverting', category: 'electronics', name: 'Op-Amp Gain (Inverting)',
    formula: 'A = −R_f / R_in', description: 'Inverting amplifier gain',
    inputs: [
      { key: 'Rf',  symbol: 'R_f',  label: 'Feedback R (Ω)', default: '10000' },
      { key: 'Rin', symbol: 'R_in', label: 'Input R (Ω)',    default: '1000' },
    ],
    compute: ({ Rf, Rin }) => Rin === 0 ? 'Division by zero' : fmt(-Rf / Rin),
  },
  { id: 'opamp-noninverting', category: 'electronics', name: 'Op-Amp Gain (Non-Inv)',
    formula: 'A = 1 + R_f / R_in', description: 'Non-inverting amplifier gain',
    inputs: [
      { key: 'Rf',  symbol: 'R_f',  label: 'Feedback R (Ω)', default: '10000' },
      { key: 'Rin', symbol: 'R_in', label: 'Input R (Ω)',    default: '1000' },
    ],
    compute: ({ Rf, Rin }) => Rin === 0 ? 'Division by zero' : fmt(1 + Rf / Rin),
  },
  { id: 'opamp-differential', category: 'electronics', name: 'Op-Amp Differential',
    formula: 'V_out = (R_f/R_in) × (V₂ − V₁)', description: 'Differential amplifier',
    inputs: [
      { key: 'Rf',  symbol: 'R_f',  label: 'Feedback R (Ω)', default: '10000' },
      { key: 'Rin', symbol: 'R_in', label: 'Input R (Ω)',    default: '1000' },
      { key: 'V1',  symbol: 'V₁',   label: 'V₁ (V)',          default: '1' },
      { key: 'V2',  symbol: 'V₂',   label: 'V₂ (V)',          default: '2' },
    ],
    compute: ({ Rf, Rin, V1, V2 }) => Rin === 0 ? 'Division by zero' : fmt((Rf / Rin) * (V2 - V1)),
  },
  { id: 'opamp-integrator', category: 'electronics', name: 'Op-Amp Integrator (τ)',
    formula: 'τ = R × C', description: 'Integrator time constant',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Input R (Ω)', default: '10000' },
      { key: 'C', symbol: 'C', label: 'Feedback C (F)', default: '0.000001' },
    ],
    compute: ({ R, C }) => fmt(R * C),
  },
  { id: 'opamp-differentiator', category: 'electronics', name: 'Op-Amp Differentiator (τ)',
    formula: 'τ = R × C', description: 'Differentiator time constant',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Feedback R (Ω)', default: '10000' },
      { key: 'C', symbol: 'C', label: 'Input C (F)', default: '0.000001' },
    ],
    compute: ({ R, C }) => fmt(R * C),
  },
  { id: 'opamp-gbp', category: 'electronics', name: 'Op-Amp Bandwidth (GBP)',
    formula: 'BW = GBP / A_cl', description: 'Bandwidth from gain-bandwidth product',
    inputs: [
      { key: 'gbp', symbol: 'GBP',  label: 'Gain-bandwidth (Hz)', default: '1e6' },
      { key: 'acl', symbol: 'A_cl', label: 'Closed-loop gain',    default: '10' },
    ],
    compute: ({ gbp, acl }) => acl === 0 ? 'Division by zero' : fmt(gbp / acl) + ' Hz',
  },
  { id: 'led-resistor', category: 'electronics', name: 'LED Resistor',
    formula: 'R = (V_s − V_LED) / I_LED', description: 'Series resistor for LED',
    inputs: [
      { key: 'Vs', symbol: 'V_s', label: 'Supply (V)', default: '5' },
      { key: 'Vl', symbol: 'V_LED', label: 'LED forward (V)', default: '2' },
      { key: 'Il', symbol: 'I_LED', label: 'LED current (A)', default: '0.02' },
    ],
    compute: ({ Vs, Vl, Il }) => Il === 0 ? 'Division by zero' : fmt((Vs - Vl) / Il),
  },
  { id: 'led-power', category: 'electronics', name: 'LED Power',
    formula: 'P = V_f × I_f', description: 'LED power dissipation',
    inputs: [
      { key: 'Vf', symbol: 'V_f', label: 'Forward (V)', default: '2' },
      { key: 'If', symbol: 'I_f', label: 'Current (A)', default: '0.02' },
    ],
    compute: ({ Vf, If }) => fmt(Vf * If),
  },
  { id: 'transformer-turns-e', category: 'electronics', name: 'Transformer Turns',
    formula: 'V_s = V_p × N_s / N_p', description: 'Secondary voltage',
    inputs: [
      { key: 'Vp', symbol: 'V_p', label: 'Primary V', default: '230' },
      { key: 'Np', symbol: 'N_p', label: 'Primary turns', default: '1000' },
      { key: 'Ns', symbol: 'N_s', label: 'Secondary turns', default: '100' },
    ],
    compute: ({ Vp, Np, Ns }) => Np === 0 ? 'Division by zero' : fmt((Vp * Ns) / Np),
  },
  { id: 'diode-current', category: 'electronics', name: 'Diode Current (Shockley)',
    formula: 'I = I_s·(e^(V/nV_T) − 1)', description: 'Diode current from voltage',
    inputs: [
      { key: 'Is', symbol: 'I_s', label: 'Saturation I (A)', default: '1e-12' },
      { key: 'V',  symbol: 'V',   label: 'Forward V (V)',    default: '0.7' },
      { key: 'n',  symbol: 'n',   label: 'Ideality',         default: '1' },
    ],
    compute: ({ Is, V, n }) => {
      if (n === 0) return 'Division by zero';
      return fmt(Is * (Math.exp(V / (n * 0.02585)) - 1));
    },
  },
  { id: 'transistor-beta', category: 'electronics', name: 'Transistor β',
    formula: 'β = I_C / I_B', description: 'Current gain',
    inputs: [
      { key: 'Ic', symbol: 'I_C', label: 'Collector I (A)', default: '0.1' },
      { key: 'Ib', symbol: 'I_B', label: 'Base I (A)',      default: '0.001' },
    ],
    compute: ({ Ic, Ib }) => Ib === 0 ? 'Division by zero' : fmt(Ic / Ib),
  },
  { id: 'transistor-ie', category: 'electronics', name: 'Transistor I_E',
    formula: 'I_E = I_C + I_B', description: 'Emitter current',
    inputs: [
      { key: 'Ic', symbol: 'I_C', label: 'Collector I (A)', default: '0.1' },
      { key: 'Ib', symbol: 'I_B', label: 'Base I (A)',      default: '0.001' },
    ],
    compute: ({ Ic, Ib }) => fmt(Ic + Ib),
  },
  { id: 'transistor-alpha', category: 'electronics', name: 'Transistor α',
    formula: 'α = I_C / I_E', description: 'Common-base gain',
    inputs: [
      { key: 'Ic', symbol: 'I_C', label: 'Collector I (A)', default: '0.1' },
      { key: 'Ie', symbol: 'I_E', label: 'Emitter I (A)',   default: '0.101' },
    ],
    compute: ({ Ic, Ie }) => Ie === 0 ? 'Division by zero' : fmt(Ic / Ie),
  },
  { id: 'bjt-bias-vce', category: 'electronics', name: 'BJT V_CE',
    formula: 'V_CE = V_CC − I_C × R_C', description: 'Collector-emitter voltage',
    inputs: [
      { key: 'Vcc', symbol: 'V_CC', label: 'Supply (V)', default: '12' },
      { key: 'Ic',  symbol: 'I_C',  label: 'Collector I (A)', default: '0.01' },
      { key: 'Rc',  symbol: 'R_C',  label: 'R_C (Ω)', default: '1000' },
    ],
    compute: ({ Vcc, Ic, Rc }) => fmt(Vcc - Ic * Rc),
  },
  { id: 'bjt-base-r', category: 'electronics', name: 'BJT Base Resistor',
    formula: 'R_B = (V_in − V_BE) / I_B', description: 'Base resistor',
    inputs: [
      { key: 'Vin', symbol: 'V_in', label: 'Input V', default: '5' },
      { key: 'Vbe', symbol: 'V_BE', label: 'V_BE',    default: '0.7' },
      { key: 'Ib',  symbol: 'I_B',  label: 'Base I (A)', default: '0.001' },
    ],
    compute: ({ Vin, Vbe, Ib }) => Ib === 0 ? 'Division by zero' : fmt((Vin - Vbe) / Ib),
  },
  { id: 'mosfet-id', category: 'electronics', name: 'MOSFET Saturation I_D',
    formula: 'I_D = ½ · k · (V_GS − V_th)²', description: 'MOSFET current',
    inputs: [
      { key: 'k',  symbol: 'k',     label: 'k (A/V²)', default: '0.001' },
      { key: 'Vgs', symbol: 'V_GS', label: 'Gate-source (V)', default: '5' },
      { key: 'Vth', symbol: 'V_th', label: 'Threshold (V)',   default: '2' },
    ],
    compute: ({ k, Vgs, Vth }) => fmt(0.5 * k * Math.pow(Vgs - Vth, 2)),
  },
  { id: 'bjt-transconductance', category: 'electronics', name: 'BJT Transconductance',
    formula: 'g_m = I_C / V_T', description: 'Transconductance',
    inputs: [
      { key: 'Ic', symbol: 'I_C', label: 'Collector I (A)', default: '0.001' },
      { key: 'VT', symbol: 'V_T', label: 'Thermal V (V)',  default: '0.026' },
    ],
    compute: ({ Ic, VT }) => VT === 0 ? 'Division by zero' : fmt(Ic / VT),
  },
  { id: 'db-gain', category: 'electronics', name: 'dB from Voltage',
    formula: 'dB = 20·log₁₀(V_out/V_in)', description: 'Voltage gain in dB',
    inputs: [
      { key: 'Vout', symbol: 'V_out', label: 'Output V', default: '10' },
      { key: 'Vin',  symbol: 'V_in',  label: 'Input V',  default: '1' },
    ],
    compute: ({ Vout, Vin }) => (Vin <= 0 || Vout <= 0) ? 'Must be > 0' : `${fmt(20 * Math.log10(Vout / Vin))} dB`,
  },
  { id: 'db-power-e', category: 'electronics', name: 'dB from Power',
    formula: 'dB = 10·log₁₀(P_out/P_in)', description: 'Power gain in dB',
    inputs: [
      { key: 'Pout', symbol: 'P_out', label: 'Output P', default: '100' },
      { key: 'Pin',  symbol: 'P_in',  label: 'Input P',  default: '1' },
    ],
    compute: ({ Pout, Pin }) => (Pin <= 0 || Pout <= 0) ? 'Must be > 0' : `${fmt(10 * Math.log10(Pout / Pin))} dB`,
  },
  { id: 'db-voltage-to-ratio', category: 'electronics', name: 'dB to Voltage Ratio',
    formula: 'ratio = 10^(dB/20)', description: 'Voltage ratio from dB',
    inputs: [{ key: 'db', symbol: 'dB', label: 'Decibels', default: '20' }],
    compute: ({ db }) => fmt(Math.pow(10, db / 20)),
  },
  { id: 'db-power-to-ratio', category: 'electronics', name: 'dB to Power Ratio',
    formula: 'ratio = 10^(dB/10)', description: 'Power ratio from dB',
    inputs: [{ key: 'db', symbol: 'dB', label: 'Decibels', default: '10' }],
    compute: ({ db }) => fmt(Math.pow(10, db / 10)),
  },
  { id: 'rc-lowpass', category: 'electronics', name: 'RC Low-Pass Cutoff',
    formula: 'f_c = 1 / (2πRC)', description: 'RC filter cutoff',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '1000' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.000001' },
    ],
    compute: ({ R, C }) => (R <= 0 || C <= 0) ? 'Must be > 0' : fmt(1 / (2 * Math.PI * R * C)) + ' Hz',
  },
  { id: 'rl-highpass', category: 'electronics', name: 'RL High-Pass Cutoff',
    formula: 'f_c = R / (2πL)', description: 'RL filter cutoff',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '100' },
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.001' },
    ],
    compute: ({ R, L }) => L <= 0 ? 'Must be > 0' : fmt(R / (2 * Math.PI * L)) + ' Hz',
  },
  { id: 'lc-resonance', category: 'electronics', name: 'LC Resonance',
    formula: 'f = 1 / (2π√(LC))', description: 'LC tank frequency',
    inputs: [
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.0001' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.0000001' },
    ],
    compute: ({ L, C }) => (L <= 0 || C <= 0) ? 'Must be > 0' : fmt(1 / (2 * Math.PI * Math.sqrt(L * C))) + ' Hz',
  },
  { id: 'wavelength-freq', category: 'electronics', name: 'Wavelength from Frequency',
    formula: 'λ = c / f', description: 'Wavelength from frequency',
    inputs: [{ key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '100000000' }],
    compute: ({ f }) => f === 0 ? 'Division by zero' : fmt(299792458 / f) + ' m',
  },
  { id: 'antenna-length', category: 'electronics', name: 'Half-Wave Antenna',
    formula: 'L = 143 / f', description: 'Half-wave antenna in feet (f in MHz)',
    inputs: [{ key: 'f', symbol: 'f', label: 'Frequency (MHz)', default: '100' }],
    compute: ({ f }) => f === 0 ? 'Division by zero' : fmt(143 / f) + ' ft',
  },
  { id: 'impedance-match', category: 'electronics', name: 'Impedance Matching (L)',
    formula: 'L = R / (2πf)', description: 'Match inductance',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '50' },
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '1e6' },
    ],
    compute: ({ R, f }) => f === 0 ? 'Division by zero' : fmt(R / (2 * Math.PI * f)) + ' H',
  },
  { id: 'noise-figure', category: 'electronics', name: 'Noise Figure (dB)',
    formula: 'NF = 10·log₁₀(F)', description: 'From noise factor',
    inputs: [{ key: 'F', symbol: 'F', label: 'Noise factor', default: '2' }],
    compute: ({ F }) => F <= 0 ? 'Must be > 0' : `${fmt(10 * Math.log10(F))} dB`,
  },
  { id: 'snr', category: 'electronics', name: 'Signal to Noise Ratio',
    formula: 'SNR = 20·log₁₀(V_s / V_n)', description: 'SNR in dB',
    inputs: [
      { key: 'Vs', symbol: 'V_s', label: 'Signal V', default: '1' },
      { key: 'Vn', symbol: 'V_n', label: 'Noise V',  default: '0.001' },
    ],
    compute: ({ Vs, Vn }) => Vn <= 0 ? 'Must be > 0' : `${fmt(20 * Math.log10(Vs / Vn))} dB`,
  },
  { id: 'thermal-noise', category: 'electronics', name: 'Thermal Noise Voltage',
    formula: 'V_n = √(4kTRB)', description: 'Johnson-Nyquist noise',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '1000' },
      { key: 'T', symbol: 'T', label: 'Temperature (K)', default: '300' },
      { key: 'B', symbol: 'B', label: 'Bandwidth (Hz)', default: '20000' },
    ],
    compute: ({ R, T, B }) => fmt(Math.sqrt(4 * 1.380649e-23 * T * R * B)) + ' V',
  },
  { id: 'power-supply-ripple', category: 'electronics', name: 'Power Supply Ripple',
    formula: 'V_ripple = I / (2fC)', description: 'Ripple voltage',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '1' },
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '50' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.001' },
    ],
    compute: ({ I, f, C }) => (f === 0 || C === 0) ? 'Division by zero' : fmt(I / (2 * f * C)) + ' V',
  },
  { id: 'transformer-power', category: 'electronics', name: 'Transformer Power',
    formula: 'P = V_p × I_p', description: 'Primary power',
    inputs: [
      { key: 'Vp', symbol: 'V_p', label: 'Primary V', default: '230' },
      { key: 'Ip', symbol: 'I_p', label: 'Primary I', default: '1' },
    ],
    compute: ({ Vp, Ip }) => fmt(Vp * Ip),
  },
  { id: 'efficiency-trafo', category: 'electronics', name: 'Transformer Efficiency',
    formula: 'η = P_out / P_in × 100', description: 'Trafo efficiency',
    inputs: [
      { key: 'Po', symbol: 'P_out', label: 'Output (W)', default: '220' },
      { key: 'Pi', symbol: 'P_in',  label: 'Input (W)',  default: '230' },
    ],
    compute: ({ Po, Pi }) => Pi === 0 ? 'Division by zero' : pct((Po / Pi) * 100),
  },
  { id: 'battery-capacity', category: 'electronics', name: 'Battery Capacity (Wh)',
    formula: 'Wh = V × Ah', description: 'Watt-hours from V and Ah',
    inputs: [
      { key: 'V',  symbol: 'V',  label: 'Voltage (V)', default: '12' },
      { key: 'Ah', symbol: 'Ah', label: 'Amp-hours',   default: '100' },
    ],
    compute: ({ V, Ah }) => fmt(V * Ah),
  },
  { id: 'duty-cycle', category: 'electronics', name: 'PWM Duty Cycle',
    formula: 'D = t_on / T × 100', description: 'Duty cycle percent',
    inputs: [
      { key: 'ton', symbol: 't_on', label: 'On time (s)', default: '0.001' },
      { key: 'T',   symbol: 'T',    label: 'Period (s)',  default: '0.004' },
    ],
    compute: ({ ton, T }) => T === 0 ? 'Division by zero' : pct((ton / T) * 100),
  },
  { id: 'pwm-avg-voltage', category: 'electronics', name: 'PWM Average Voltage',
    formula: 'V_avg = V_peak × D', description: 'Average output of PWM',
    inputs: [
      { key: 'Vp', symbol: 'V_peak', label: 'Peak (V)', default: '5' },
      { key: 'd',  symbol: 'D',      label: 'Duty (0–1)', default: '0.5' },
    ],
    compute: ({ Vp, d }) => fmt(Vp * d),
  },
  { id: 'time-constant-5t', category: 'electronics', name: 'RC 5τ Settling',
    formula: 't_settle = 5 × R × C', description: 'Time to ~99% charge',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '1000' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.000001' },
    ],
    compute: ({ R, C }) => fmt(5 * R * C) + ' s',
  },
  { id: 'inductor-time-constant', category: 'electronics', name: 'Inductor Time Constant',
    formula: 'τ = L / R', description: 'RL time constant',
    inputs: [
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.01' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '100' },
    ],
    compute: ({ L, R }) => R === 0 ? 'Division by zero' : fmt(L / R) + ' s',
  },
  { id: 'power-in-rms', category: 'electronics', name: 'Power in RMS',
    formula: 'P = V_rms × I_rms × cos(φ)', description: 'Real power with power factor',
    inputs: [
      { key: 'V',  symbol: 'V_rms', label: 'V_rms (V)', default: '230' },
      { key: 'I',  symbol: 'I_rms', label: 'I_rms (A)', default: '5' },
      { key: 'pf', symbol: 'cos(φ)', label: 'Power factor', default: '0.9' },
    ],
    compute: ({ V, I, pf }) => fmt(V * I * pf),
  },
  { id: 'opamp-cmrr', category: 'electronics', name: 'Op-Amp CMRR',
    formula: 'CMRR = A_d / A_cm', description: 'Common-mode rejection ratio',
    inputs: [
      { key: 'Ad',  symbol: 'A_d',  label: 'Diff gain', default: '100000' },
      { key: 'Acm', symbol: 'A_cm', label: 'Common gain', default: '1' },
    ],
    compute: ({ Ad, Acm }) => Acm === 0 ? 'Division by zero' : fmt(Ad / Acm),
  },
  { id: 'opamp-slew-rate-time', category: 'electronics', name: 'Op-Amp Slew Time',
    formula: 't = ΔV / SR', description: 'Time for voltage change',
    inputs: [
      { key: 'dV', symbol: 'ΔV', label: 'Voltage swing (V)', default: '10' },
      { key: 'SR', symbol: 'SR', label: 'Slew rate (V/µs)',  default: '0.5' },
    ],
    compute: ({ dV, SR }) => SR === 0 ? 'Division by zero' : fmt(dV / SR) + ' µs',
  },
  { id: 'regulator-dissipation', category: 'electronics', name: 'Regulator Dissipation',
    formula: 'P = (V_in − V_out) × I', description: 'Linear regulator heat',
    inputs: [
      { key: 'Vin', symbol: 'V_in', label: 'Input (V)', default: '12' },
      { key: 'Vo',  symbol: 'V_out', label: 'Output (V)', default: '5' },
      { key: 'I',   symbol: 'I',   label: 'Current (A)', default: '1' },
    ],
    compute: ({ Vin, Vo, I }) => fmt((Vin - Vo) * I),
  },
  { id: 'regulator-efficiency', category: 'electronics', name: 'Linear Regulator Efficiency',
    formula: 'η = V_out / V_in × 100', description: 'Linear reg efficiency',
    inputs: [
      { key: 'Vo', symbol: 'V_out', label: 'Output (V)', default: '5' },
      { key: 'Vi', symbol: 'V_in',  label: 'Input (V)',  default: '12' },
    ],
    compute: ({ Vo, Vi }) => Vi === 0 ? 'Division by zero' : pct((Vo / Vi) * 100),
  },
  { id: 'buck-output', category: 'electronics', name: 'Buck Converter Output',
    formula: 'V_out = V_in × D', description: 'Ideal buck output',
    inputs: [
      { key: 'Vin', symbol: 'V_in', label: 'Input (V)', default: '12' },
      { key: 'D',   symbol: 'D',   label: 'Duty (0–1)', default: '0.5' },
    ],
    compute: ({ Vin, D }) => fmt(Vin * D),
  },
  { id: 'boost-output', category: 'electronics', name: 'Boost Converter Output',
    formula: 'V_out = V_in / (1 − D)', description: 'Ideal boost output',
    inputs: [
      { key: 'Vin', symbol: 'V_in', label: 'Input (V)', default: '5' },
      { key: 'D',   symbol: 'D',   label: 'Duty (0–1)', default: '0.5' },
    ],
    compute: ({ Vin, D }) => D >= 1 ? 'Invalid duty' : fmt(Vin / (1 - D)),
  },
  { id: 'capacitor-charge-time', category: 'electronics', name: 'Capacitor Charge Time',
    formula: 't = −RC·ln(1 − V/V_s)', description: 'Time to reach V',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '1000' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.000001' },
      { key: 'V', symbol: 'V', label: 'Target V', default: '3' },
      { key: 'Vs',symbol: 'V_s', label: 'Supply V', default: '5' },
    ],
    compute: ({ R, C, V, Vs }) => {
      const ratio = V / Vs;
      if (ratio >= 1 || ratio <= 0) return 'Invalid ratio';
      return fmt(-R * C * Math.log(1 - ratio)) + ' s';
    },
  },
  { id: 'electromagnet-force', category: 'electronics', name: 'Electromagnet Force',
    formula: 'F = (B² × A) / (2µ₀)', description: 'Force from B-field',
    inputs: [
      { key: 'B', symbol: 'B', label: 'B-field (T)', default: '1' },
      { key: 'A', symbol: 'A', label: 'Pole area (m²)', default: '0.01' },
    ],
    compute: ({ B, A }) => fmt((B * B * A) / (2 * 4 * Math.PI * 1e-7)),
  },
  { id: 'transformer-current', category: 'electronics', name: 'Transformer Current',
    formula: 'I_s = I_p × N_p / N_s', description: 'Secondary current',
    inputs: [
      { key: 'Ip', symbol: 'I_p', label: 'Primary I (A)', default: '1' },
      { key: 'Np', symbol: 'N_p', label: 'Primary turns', default: '1000' },
      { key: 'Ns', symbol: 'N_s', label: 'Secondary turns', default: '100' },
    ],
    compute: ({ Ip, Np, Ns }) => Ns === 0 ? 'Division by zero' : fmt((Ip * Np) / Ns),
  },
  { id: 'wire-ampacity', category: 'electronics', name: 'Wire Ampacity (AWG)',
    formula: 'I ≈ 10 × A^0.7', description: 'Ampacity estimate',
    inputs: [{ key: 'A', symbol: 'A', label: 'Area (mm²)', default: '1' }],
    compute: ({ A }) => fmt(10 * Math.pow(A, 0.7)),
  },
  { id: 'impedance-rlc', category: 'electronics', name: 'RLC Impedance',
    formula: 'Z = √(R² + (X_L − X_C)²)', description: 'RLC circuit impedance',
    inputs: [
      { key: 'R',  symbol: 'R',   label: 'R (Ω)',  default: '50' },
      { key: 'XL', symbol: 'X_L', label: 'X_L (Ω)', default: '30' },
      { key: 'XC', symbol: 'X_C', label: 'X_C (Ω)', default: '10' },
    ],
    compute: ({ R, XL, XC }) => fmt(Math.hypot(R, XL - XC)),
  },
  { id: 'phase-angle', category: 'electronics', name: 'Phase Angle',
    formula: 'φ = arctan((X_L − X_C) / R)', description: 'RLC phase angle',
    inputs: [
      { key: 'R',  symbol: 'R',   label: 'R (Ω)',  default: '50' },
      { key: 'XL', symbol: 'X_L', label: 'X_L (Ω)', default: '30' },
      { key: 'XC', symbol: 'X_C', label: 'X_C (Ω)', default: '10' },
    ],
    compute: ({ R, XL, XC }) => R === 0 ? 'Division by zero' : fmt(Math.atan((XL - XC) / R) * 180 / Math.PI) + '°',
  },
  { id: 'q-factor', category: 'electronics', name: 'Q Factor (Series RLC)',
    formula: 'Q = (1/R) × √(L/C)', description: 'Quality factor',
    inputs: [
      { key: 'R', symbol: 'R', label: 'R (Ω)', default: '10' },
      { key: 'L', symbol: 'L', label: 'L (H)', default: '0.001' },
      { key: 'C', symbol: 'C', label: 'C (F)', default: '0.0000001' },
    ],
    compute: ({ R, L, C }) => (R === 0 || C === 0) ? 'Division by zero' : fmt((1 / R) * Math.sqrt(L / C)),
  },
  { id: 'bandwidth', category: 'electronics', name: 'RLC Bandwidth',
    formula: 'BW = f₀ / Q', description: 'Bandwidth from Q',
    inputs: [
      { key: 'f0', symbol: 'f₀', label: 'Resonant freq (Hz)', default: '1000' },
      { key: 'Q',  symbol: 'Q',  label: 'Q factor', default: '10' },
    ],
    compute: ({ f0, Q }) => Q === 0 ? 'Division by zero' : fmt(f0 / Q) + ' Hz',
  },
  { id: 'dbm-to-mw', category: 'electronics', name: 'dBm to mW',
    formula: 'P = 10^(dBm/10)', description: 'Power from dBm',
    inputs: [{ key: 'dBm', symbol: 'dBm', label: 'dBm', default: '0' }],
    compute: ({ dBm }) => fmt(Math.pow(10, dBm / 10)) + ' mW',
  },
  { id: 'mw-to-dbm', category: 'electronics', name: 'mW to dBm',
    formula: 'dBm = 10·log₁₀(P)', description: 'dBm from power (mW)',
    inputs: [{ key: 'P', symbol: 'P', label: 'Power (mW)', default: '1' }],
    compute: ({ P }) => P <= 0 ? 'Must be > 0' : `${fmt(10 * Math.log10(P))} dBm`,
  },
  { id: 'cable-loss', category: 'electronics', name: 'Cable Loss',
    formula: 'L_total = L_per_m × length', description: 'Total cable loss',
    inputs: [
      { key: 'L', symbol: 'L_per_m', label: 'Loss (dB/m)', default: '0.2' },
      { key: 'm', symbol: 'length',  label: 'Length (m)', default: '50' },
    ],
    compute: ({ L, m }) => fmt(L * m) + ' dB',
  },
  { id: 'power-gain-cascade', category: 'electronics', name: 'Cascade Power Gain',
    formula: 'G_total = G₁ × G₂', description: 'Two-stage gain',
    inputs: [
      { key: 'G1', symbol: 'G₁', label: 'Gain 1 (×)', default: '10' },
      { key: 'G2', symbol: 'G₂', label: 'Gain 2 (×)', default: '5' },
    ],
    compute: ({ G1, G2 }) => fmt(G1 * G2),
  },
  { id: 'noise-temp', category: 'electronics', name: 'Noise Temperature',
    formula: 'T = 290 × (F − 1)', description: 'From noise factor',
    inputs: [{ key: 'F', symbol: 'F', label: 'Noise factor', default: '2' }],
    compute: ({ F }) => fmt(290 * (F - 1)) + ' K',
  },
  { id: 'bit-rate', category: 'electronics', name: 'Bit Rate (Nyquist)',
    formula: 'R = 2 × B × log₂(M)', description: 'Data rate for M-ary signaling',
    inputs: [
      { key: 'B', symbol: 'B', label: 'Bandwidth (Hz)', default: '1000' },
      { key: 'M', symbol: 'M', label: 'Levels',         default: '4' },
    ],
    compute: ({ B, M }) => M <= 1 ? 'Invalid levels' : fmt(2 * B * Math.log2(M)) + ' bps',
  },
  { id: 'shannon-capacity', category: 'electronics', name: 'Shannon Capacity',
    formula: 'C = B × log₂(1 + SNR)', description: 'Channel capacity',
    inputs: [
      { key: 'B',   symbol: 'B', label: 'Bandwidth (Hz)', default: '3000' },
      { key: 'SNR', symbol: 'SNR', label: 'SNR (linear)', default: '1000' },
    ],
    compute: ({ B, SNR }) => SNR < 0 ? 'Invalid SNR' : fmt(B * Math.log2(1 + SNR)) + ' bps',
  },
  { id: 'am-modulation', category: 'electronics', name: 'AM Modulation Index',
    formula: 'm = (A_max − A_min) / (A_max + A_min)', description: 'AM depth',
    inputs: [
      { key: 'Amax', symbol: 'A_max', label: 'Max amplitude', default: '2' },
      { key: 'Amin', symbol: 'A_min', label: 'Min amplitude', default: '0' },
    ],
    compute: ({ Amax, Amin }) => (Amax + Amin) === 0 ? 'Division by zero' : fmt((Amax - Amin) / (Amax + Amin)),
  },
  { id: 'fm-deviation', category: 'electronics', name: 'FM Frequency Deviation',
    formula: 'Δf = k × V_m', description: 'FM deviation',
    inputs: [
      { key: 'k', symbol: 'k',   label: 'Sensitivity (Hz/V)', default: '5000' },
      { key: 'V', symbol: 'V_m', label: 'Mod. amplitude (V)', default: '1' },
    ],
    compute: ({ k, V }) => fmt(k * V) + ' Hz',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Combined catalog
// ═══════════════════════════════════════════════════════════════════════════

export const FORMULAS = [
  ...MATH_FORMULAS,
  ...PHYSICS_FORMULAS,
  ...CHEMISTRY_FORMULAS,
  ...ELECTRICAL_FORMULAS,
  ...ELECTRONICS_FORMULAS,
];

export const FORMULA_CATEGORIES = CATEGORIES;

export function formulasByCategory(categoryKey) {
  return FORMULAS.filter(f => f.category === categoryKey);
}

export function getFormula(id) {
  return FORMULAS.find(f => f.id === id) || null;
}

export function computeFormula(id, values) {
  const f = getFormula(id);
  if (!f) throw new Error(`Unknown formula: ${id}`);
  return f.compute(values);
}