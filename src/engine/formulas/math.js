// src/engine/formulas/math.js
// Math formulas — algebra, geometry, trigonometry, statistics, finance.

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

export const MATH_FORMULAS = [
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
    formula: 'Δ = b² − 4ac', description: 'Nature of quadratic roots',
    inputs: [
      { key: 'a', symbol: 'a', label: 'a', default: '1' },
      { key: 'b', symbol: 'b', label: 'b', default: '5' },
      { key: 'c', symbol: 'c', label: 'c', default: '6' },
    ],
    compute: ({ a, b, c }) => {
      const d = b * b - 4 * a * c;
      const note = d > 0 ? ' (two real roots)' : d === 0 ? ' (one real root)' : ' (complex roots)';
      return fmt(d) + note;
    },
  },
  { id: 'slope', category: 'math', name: 'Slope',
    formula: 'm = (y₂ − y₁)/(x₂ − x₁)', description: 'Slope between two points',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '0' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '0' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '4' },
      { key: 'y2', symbol: 'y₂', label: 'y₂', default: '8' },
    ],
    compute: ({ x1, y1, x2, y2 }) => (x2 - x1) === 0 ? 'Undefined' : fmt((y2 - y1) / (x2 - x1)),
  },
  { id: 'point-slope', category: 'math', name: 'Point-Slope Form',
    formula: 'y = y₁ + m(x − x₁)', description: 'Line from point and slope',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '1' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '2' },
      { key: 'm',  symbol: 'm',  label: 'Slope', default: '3' },
      { key: 'x',  symbol: 'x',  label: 'x', default: '5' },
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
    formula: 'log_b(x) = ln(x) / ln(b)', description: 'Log in a different base',
    inputs: [
      { key: 'x', symbol: 'x', label: 'Argument', default: '100' },
      { key: 'b', symbol: 'b', label: 'Base',     default: '10' },
    ],
    compute: ({ x, b }) => (x <= 0 || b <= 0 || b === 1) ? 'Invalid' : fmt(Math.log(x) / Math.log(b)),
  },
  { id: 'absolute-value', category: 'math', name: 'Absolute Value',
    formula: '|x|', description: 'Distance from zero',
    inputs: [{ key: 'x', symbol: 'x', label: 'Value', default: '-7' }],
    compute: ({ x }) => fmt(Math.abs(x)),
  },
  { id: 'stirling', category: 'math', name: "Stirling's Approximation",
    formula: 'n! ≈ √(2πn)·(n/e)ⁿ', description: 'Approximate factorial for large n',
    inputs: [{ key: 'n', symbol: 'n', label: 'n', default: '10' }],
    compute: ({ n }) => n < 1 ? 'n must be ≥ 1' : fmt(Math.sqrt(2 * Math.PI * n) * Math.pow(n / Math.E, n)),
  },

  // ─── Geometry 2D ──────────────────────────────────────────────────────
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
  { id: 'triangle-area-base-height', category: 'math', name: 'Triangle Area (b×h)',
    formula: 'A = ½ × b × h', description: 'Area from base and height',
    inputs: [
      { key: 'b', symbol: 'b', label: 'Base', default: '6' },
      { key: 'h', symbol: 'h', label: 'Height', default: '4' },
    ],
    compute: ({ b, h }) => fmt(0.5 * b * h),
  },
  { id: 'triangle-area-heron', category: 'math', name: "Heron's Formula",
    formula: 'A = √(s(s−a)(s−b)(s−c))', description: 'Area from three sides',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Side a', default: '3' },
      { key: 'b', symbol: 'b', label: 'Side b', default: '4' },
      { key: 'c', symbol: 'c', label: 'Side c', default: '5' },
    ],
    compute: ({ a, b, c }) => {
      const s = (a + b + c) / 2;
      const v = s * (s - a) * (s - b) * (s - c);
      return v < 0 ? 'Invalid triangle' : fmt(Math.sqrt(v));
    },
  },
  { id: 'trapezoid-area', category: 'math', name: 'Trapezoid Area',
    formula: 'A = ½ × (a + b) × h', description: 'Area of a trapezoid',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Side a', default: '5' },
      { key: 'b', symbol: 'b', label: 'Side b', default: '8' },
      { key: 'h', symbol: 'h', label: 'Height', default: '4' },
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
  { id: 'circle-diameter-area', category: 'math', name: 'Circle Diameter (from A)',
    formula: 'd = 2√(A/π)', description: 'Diameter from area',
    inputs: [{ key: 'A', symbol: 'A', label: 'Area', default: '78.54' }],
    compute: ({ A }) => fmt(2 * Math.sqrt(A / Math.PI)),
  },
  { id: 'sector-area', category: 'math', name: 'Sector Area',
    formula: 'A = ½ r² θ', description: 'Sector area (θ radians)',
    inputs: [
      { key: 'r', symbol: 'r', label: 'Radius', default: '5' },
      { key: 'theta', symbol: 'θ', label: 'Angle (rad)', default: '1' },
    ],
    compute: ({ r, theta }) => fmt(0.5 * r * r * theta),
  },
  { id: 'regular-polygon-area', category: 'math', name: 'Regular Polygon Area',
    formula: 'A = ½ · n · s² / tan(π/n)', description: 'Area of regular n-gon',
    inputs: [
      { key: 'n', symbol: 'n', label: 'Sides', default: '6' },
      { key: 's', symbol: 's', label: 'Side length', default: '4' },
    ],
    compute: ({ n, s }) => n < 3 ? 'n must be ≥ 3' : fmt(0.5 * n * s * s / Math.tan(Math.PI / n)),
  },

  // ─── Geometry 3D ──────────────────────────────────────────────────────
  { id: 'cube-volume', category: 'math', name: 'Cube Volume',
    formula: 'V = s³', description: 'Volume of a cube',
    inputs: [{ key: 's', symbol: 's', label: 'Side', default: '3' }],
    compute: ({ s }) => fmt(s * s * s),
  },
  { id: 'cube-surface', category: 'math', name: 'Cube Surface',
    formula: 'A = 6s²', description: 'Surface area of a cube',
    inputs: [{ key: 's', symbol: 's', label: 'Side', default: '3' }],
    compute: ({ s }) => fmt(6 * s * s),
  },
  { id: 'box-volume', category: 'math', name: 'Box Volume',
    formula: 'V = l × w × h', description: 'Volume of rectangular prism',
    inputs: [
      { key: 'l', symbol: 'l', label: 'Length', default: '4' },
      { key: 'w', symbol: 'w', label: 'Width',  default: '3' },
      { key: 'h', symbol: 'h', label: 'Height', default: '2' },
    ],
    compute: ({ l, w, h }) => fmt(l * w * h),
  },
  { id: 'box-surface', category: 'math', name: 'Box Surface',
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
  { id: 'sphere-surface', category: 'math', name: 'Sphere Surface',
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
  { id: 'cylinder-surface', category: 'math', name: 'Cylinder Surface',
    formula: 'A = 2πr(r + h)', description: 'Surface of a cylinder',
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
    formula: 'b = a·sin(B)/sin(A)', description: 'Side from opposite angle',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Known side',  default: '8' },
      { key: 'A', symbol: 'A', label: 'Angle A (°)', default: '40' },
      { key: 'B', symbol: 'B', label: 'Angle B (°)', default: '60' },
    ],
    compute: ({ a, A, B }) => {
      const sA = Math.sin(A * Math.PI / 180);
      return sA === 0 ? 'Invalid' : fmt((a * Math.sin(B * Math.PI / 180)) / sA);
    },
  },
  { id: 'law-of-cosines', category: 'math', name: 'Law of Cosines',
    formula: 'c = √(a² + b² − 2ab·cos(C))', description: 'Side from two sides and angle',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Side a', default: '5' },
      { key: 'b', symbol: 'b', label: 'Side b', default: '6' },
      { key: 'C', symbol: 'C', label: 'Angle C (°)', default: '60' },
    ],
    compute: ({ a, b, C }) => fmt(Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C * Math.PI / 180))),
  },
  { id: 'pythagorean-identity', category: 'math', name: 'Pythagorean Identity',
    formula: 'sin²θ + cos²θ = 1', description: 'Verify identity',
    inputs: [{ key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '30' }],
    compute: ({ theta }) => {
      const r = theta * Math.PI / 180;
      return fmt(Math.pow(Math.sin(r), 2) + Math.pow(Math.cos(r), 2));
    },
  },
  { id: 'double-angle-sin', category: 'math', name: 'Double Angle (sin)',
    formula: 'sin(2θ) = 2·sin(θ)·cos(θ)', description: 'Double angle sine',
    inputs: [{ key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '30' }],
    compute: ({ theta }) => {
      const r = theta * Math.PI / 180;
      return fmt(2 * Math.sin(r) * Math.cos(r));
    },
  },
  { id: 'double-angle-cos', category: 'math', name: 'Double Angle (cos)',
    formula: 'cos(2θ) = cos²θ − sin²θ', description: 'Double angle cosine',
    inputs: [{ key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '30' }],
    compute: ({ theta }) => {
      const r = theta * Math.PI / 180;
      return fmt(Math.pow(Math.cos(r), 2) - Math.pow(Math.sin(r), 2));
    },
  },

  // ─── Circle Equation ──────────────────────────────────────────────────
  { id: 'circle-radius-from-eq', category: 'math', name: 'Circle Radius',
    formula: 'r = √(D²/4 + E²/4 − F)', description: 'From x² + y² + Dx + Ey + F = 0',
    inputs: [
      { key: 'D', symbol: 'D', label: 'D', default: '-4' },
      { key: 'E', symbol: 'E', label: 'E', default: '-6' },
      { key: 'F', symbol: 'F', label: 'F', default: '9' },
    ],
    compute: ({ D, E, F }) => {
      const v = (D * D + E * E) / 4 - F;
      return v < 0 ? 'Not a circle' : fmt(Math.sqrt(v));
    },
  },

  // ─── Statistics ───────────────────────────────────────────────────────
  { id: 'average', category: 'math', name: 'Arithmetic Mean',
    formula: 'μ = (a+b+c+d)/4', description: 'Mean of four values',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Value 1', default: '1' },
      { key: 'b', symbol: 'b', label: 'Value 2', default: '2' },
      { key: 'c', symbol: 'c', label: 'Value 3', default: '3' },
      { key: 'd', symbol: 'd', label: 'Value 4', default: '4' },
    ],
    compute: ({ a, b, c, d }) => fmt((a + b + c + d) / 4),
  },
  { id: 'weighted-average', category: 'math', name: 'Weighted Average',
    formula: '(a·w₁ + b·w₂)/(w₁ + w₂)', description: 'Weighted mean',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Value a', default: '80' },
      { key: 'b', symbol: 'b', label: 'Value b', default: '90' },
      { key: 'w1', symbol: 'w₁', label: 'Weight 1', default: '2' },
      { key: 'w2', symbol: 'w₂', label: 'Weight 2', default: '3' },
    ],
    compute: ({ a, b, w1, w2 }) => (w1 + w2 === 0) ? 'Division by zero' : fmt((a * w1 + b * w2) / (w1 + w2)),
  },
  { id: 'variance-2', category: 'math', name: 'Variance (2 values)',
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
    formula: 'σ = √(variance)', description: 'Std dev from variance',
    inputs: [{ key: 'v', symbol: 'σ²', label: 'Variance', default: '4' }],
    compute: ({ v }) => v < 0 ? 'Invalid' : fmt(Math.sqrt(v)),
  },
  { id: 'percent-change', category: 'math', name: 'Percentage Change',
    formula: '% = ((new−old)/old)×100', description: 'Percent increase/decrease',
    inputs: [
      { key: 'old', symbol: 'old', label: 'Old value', default: '100' },
      { key: 'new', symbol: 'new', label: 'New value', default: '150' },
    ],
    compute: ({ old: o, new: n }) => o === 0 ? 'Old cannot be 0' : pct(((n - o) / o) * 100),
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
    formula: 'C(n,r) = n!/(r!(n−r)!)', description: 'Combinations',
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
    formula: 'P(n,r) = n!/(n−r)!', description: 'Permutations',
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

  // ─── Financial ────────────────────────────────────────────────────────
  { id: 'simple-interest', category: 'math', name: 'Simple Interest',
    formula: 'I = P × r × t', description: 'Simple interest',
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
  { id: 'exponential-growth', category: 'math', name: 'Exponential Growth',
    formula: 'A = A₀(1 + r)^t', description: 'Growth rate r over t',
    inputs: [
      { key: 'A0', symbol: 'A₀', label: 'Initial', default: '100' },
      { key: 'r',  symbol: 'r',  label: 'Rate',    default: '0.05' },
      { key: 't',  symbol: 't',  label: 'Periods', default: '10' },
    ],
    compute: ({ A0, r, t }) => fmt(A0 * Math.pow(1 + r, t)),
  },
];