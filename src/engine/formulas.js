// src/engine/formulas.js
// Catalog of formulas across Math, Physics, Chemistry, Electrical, Electronics.
// Each formula is pure data + a compute function.

/**
 * @typedef {Object} Formula
 * @property {string} id          unique key
 * @property {string} category    'math' | 'physics' | 'chemistry' | 'electrical' | 'electronics'
 * @property {string} name        display name
 * @property {string} formula     display formula (with symbols)
 * @property {string} description short explanation
 * @property {Array<{key: string, label: string, symbol: string, default?: string}>} inputs
 * @property {(vals: Record<string, number>) => string | number} compute
 */

const CATEGORIES = {
  math:        { label: 'Math',         icon: '∑' },
  physics:     { label: 'Physics',      icon: '⚛' },
  chemistry:   { label: 'Chemistry',    icon: '🧪' },
  electrical:  { label: 'Electrical',   icon: '⚡' },
  electronics: { label: 'Electronics',  icon: '🔌' },
};

// Helper for number formatting
const fmt = (n) => {
  if (!Number.isFinite(n)) return 'Invalid';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs < 1e-6 || abs >= 1e10) {
    return n.toExponential(4).replace(/\.?0+e/, 'e');
  }
  return Number(n.toPrecision(8)).toString();
};

// ═══════════════════════════════════════════════════════════════════════════
// MATH
// ═══════════════════════════════════════════════════════════════════════════

const MATH_FORMULAS = [
  {
    id: 'quadratic-roots',
    category: 'math',
    name: 'Quadratic Roots',
    formula: 'x = (−b ± √(b² − 4ac)) / 2a',
    description: 'Solve ax² + bx + c = 0',
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
      const x1 = (-b + sq) / (2 * a);
      const x2 = (-b - sq) / (2 * a);
      return `x₁ = ${fmt(x1)}, x₂ = ${fmt(x2)}`;
    },
  },
  {
    id: 'pythagorean',
    category: 'math',
    name: 'Pythagorean Theorem',
    formula: 'c = √(a² + b²)',
    description: 'Hypotenuse of a right triangle',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Side a', default: '3' },
      { key: 'b', symbol: 'b', label: 'Side b', default: '4' },
    ],
    compute: ({ a, b }) => fmt(Math.hypot(a, b)),
  },
  {
    id: 'distance-2d',
    category: 'math',
    name: 'Distance (2D)',
    formula: 'd = √((x₂ − x₁)² + (y₂ − y₁)²)',
    description: 'Distance between two points',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '0' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '0' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '3' },
      { key: 'y2', symbol: 'y₂', label: 'y₂', default: '4' },
    ],
    compute: ({ x1, y1, x2, y2 }) => fmt(Math.hypot(x2 - x1, y2 - y1)),
  },
  {
    id: 'midpoint',
    category: 'math',
    name: 'Midpoint',
    formula: 'M = ((x₁+x₂)/2, (y₁+y₂)/2)',
    description: 'Midpoint of two points',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '0' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '0' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '4' },
      { key: 'y2', symbol: 'y₂', label: 'y₂', default: '6' },
    ],
    compute: ({ x1, y1, x2, y2 }) => `(${fmt((x1 + x2) / 2)}, ${fmt((y1 + y2) / 2)})`,
  },
  {
    id: 'circle-area',
    category: 'math',
    name: 'Circle Area',
    formula: 'A = πr²',
    description: 'Area of a circle from radius',
    inputs: [{ key: 'r', symbol: 'r', label: 'Radius', default: '5' }],
    compute: ({ r }) => fmt(Math.PI * r * r),
  },
  {
    id: 'circle-circumference',
    category: 'math',
    name: 'Circle Circumference',
    formula: 'C = 2πr',
    description: 'Circumference of a circle',
    inputs: [{ key: 'r', symbol: 'r', label: 'Radius', default: '5' }],
    compute: ({ r }) => fmt(2 * Math.PI * r),
  },
  {
    id: 'sphere-volume',
    category: 'math',
    name: 'Sphere Volume',
    formula: 'V = (4/3)πr³',
    description: 'Volume of a sphere',
    inputs: [{ key: 'r', symbol: 'r', label: 'Radius', default: '3' }],
    compute: ({ r }) => fmt((4 / 3) * Math.PI * r * r * r),
  },
  {
    id: 'slope',
    category: 'math',
    name: 'Slope',
    formula: 'm = (y₂ − y₁) / (x₂ − x₁)',
    description: 'Slope between two points',
    inputs: [
      { key: 'x1', symbol: 'x₁', label: 'x₁', default: '0' },
      { key: 'y1', symbol: 'y₁', label: 'y₁', default: '0' },
      { key: 'x2', symbol: 'x₂', label: 'x₂', default: '4' },
      { key: 'y2', symbol: 'y₂', label: 'y₂', default: '8' },
    ],
    compute: ({ x1, y1, x2, y2 }) => {
      const dx = x2 - x1;
      if (dx === 0) return 'Vertical (undefined)';
      return fmt((y2 - y1) / dx);
    },
  },
  {
    id: 'percent-change',
    category: 'math',
    name: 'Percentage Change',
    formula: '% = ((new − old) / old) × 100',
    description: 'Percentage increase or decrease',
    inputs: [
      { key: 'old', symbol: 'old', label: 'Old value', default: '100' },
      { key: 'new', symbol: 'new', label: 'New value', default: '150' },
    ],
    compute: ({ old: o, new: n }) => {
      if (o === 0) return 'Old cannot be 0';
      return `${fmt(((n - o) / o) * 100)} %`;
    },
  },
  {
    id: 'simple-interest',
    category: 'math',
    name: 'Simple Interest',
    formula: 'I = P × r × t',
    description: 'Interest on principal',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Principal', default: '1000' },
      { key: 'r', symbol: 'r', label: 'Rate (decimal)', default: '0.05' },
      { key: 't', symbol: 't', label: 'Time (years)', default: '2' },
    ],
    compute: ({ P, r, t }) => fmt(P * r * t),
  },
  {
    id: 'compound-interest',
    category: 'math',
    name: 'Compound Interest',
    formula: 'A = P × (1 + r/n)^(nt)',
    description: 'Compound interest final amount',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Principal', default: '1000' },
      { key: 'r', symbol: 'r', label: 'Rate (decimal)', default: '0.05' },
      { key: 'n', symbol: 'n', label: 'Compounds/year', default: '12' },
      { key: 't', symbol: 't', label: 'Time (years)', default: '2' },
    ],
    compute: ({ P, r, n, t }) => fmt(P * Math.pow(1 + r / n, n * t)),
  },
  {
    id: 'average',
    category: 'math',
    name: 'Average',
    formula: 'μ = (a + b + c + d) / n',
    description: 'Arithmetic mean of four numbers',
    inputs: [
      { key: 'a', symbol: 'a', label: 'Value 1', default: '1' },
      { key: 'b', symbol: 'b', label: 'Value 2', default: '2' },
      { key: 'c', symbol: 'c', label: 'Value 3', default: '3' },
      { key: 'd', symbol: 'd', label: 'Value 4', default: '4' },
    ],
    compute: ({ a, b, c, d }) => fmt((a + b + c + d) / 4),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PHYSICS
// ═══════════════════════════════════════════════════════════════════════════

const PHYSICS_FORMULAS = [
  {
    id: 'speed',
    category: 'physics',
    name: 'Speed',
    formula: 'v = d / t',
    description: 'Average speed from distance and time',
    inputs: [
      { key: 'd', symbol: 'd', label: 'Distance', default: '100' },
      { key: 't', symbol: 't', label: 'Time', default: '20' },
    ],
    compute: ({ d, t }) => {
      if (t === 0) return 'Division by zero';
      return fmt(d / t);
    },
  },
  {
    id: 'acceleration',
    category: 'physics',
    name: 'Acceleration',
    formula: 'a = (v − u) / t',
    description: 'Acceleration from velocity change',
    inputs: [
      { key: 'u', symbol: 'u', label: 'Initial v', default: '0' },
      { key: 'v', symbol: 'v', label: 'Final v',   default: '20' },
      { key: 't', symbol: 't', label: 'Time',      default: '5' },
    ],
    compute: ({ u, v, t }) => {
      if (t === 0) return 'Division by zero';
      return fmt((v - u) / t);
    },
  },
  {
    id: 'force',
    category: 'physics',
    name: "Newton's 2nd Law",
    formula: 'F = m × a',
    description: 'Force from mass and acceleration',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '10' },
      { key: 'a', symbol: 'a', label: 'Acceleration (m/s²)', default: '2' },
    ],
    compute: ({ m, a }) => fmt(m * a),
  },
  {
    id: 'work',
    category: 'physics',
    name: 'Work',
    formula: 'W = F × d',
    description: 'Work done by a force',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '50' },
      { key: 'd', symbol: 'd', label: 'Distance (m)', default: '10' },
    ],
    compute: ({ F, d }) => fmt(F * d),
  },
  {
    id: 'power',
    category: 'physics',
    name: 'Power',
    formula: 'P = W / t',
    description: 'Power from work over time',
    inputs: [
      { key: 'W', symbol: 'W', label: 'Work (J)', default: '500' },
      { key: 't', symbol: 't', label: 'Time (s)', default: '10' },
    ],
    compute: ({ W, t }) => {
      if (t === 0) return 'Division by zero';
      return fmt(W / t);
    },
  },
  {
    id: 'kinetic-energy',
    category: 'physics',
    name: 'Kinetic Energy',
    formula: 'Ek = ½mv²',
    description: 'Kinetic energy of a moving object',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '5' },
      { key: 'v', symbol: 'v', label: 'Velocity (m/s)', default: '10' },
    ],
    compute: ({ m, v }) => fmt(0.5 * m * v * v),
  },
  {
    id: 'potential-energy',
    category: 'physics',
    name: 'Potential Energy',
    formula: 'Ep = m × g × h',
    description: 'Gravitational potential energy',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '10' },
      { key: 'h', symbol: 'h', label: 'Height (m)', default: '5' },
    ],
    compute: ({ m, h }) => fmt(m * 9.81 * h),
  },
  {
    id: 'density',
    category: 'physics',
    name: 'Density',
    formula: 'ρ = m / V',
    description: 'Density from mass and volume',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '10' },
      { key: 'V', symbol: 'V', label: 'Volume (m³)', default: '2' },
    ],
    compute: ({ m, V }) => {
      if (V === 0) return 'Division by zero';
      return fmt(m / V);
    },
  },
  {
    id: 'pressure',
    category: 'physics',
    name: 'Pressure',
    formula: 'P = F / A',
    description: 'Pressure from force and area',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '100' },
      { key: 'A', symbol: 'A', label: 'Area (m²)', default: '2' },
    ],
    compute: ({ F, A }) => {
      if (A === 0) return 'Division by zero';
      return fmt(F / A);
    },
  },
  {
    id: 'ohm-physics',
    category: 'physics',
    name: 'Ohm (Physics)',
    formula: 'V = I × R',
    description: 'Voltage from current and resistance',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ I, R }) => fmt(I * R),
  },
  {
    id: 'wave-speed',
    category: 'physics',
    name: 'Wave Speed',
    formula: 'v = f × λ',
    description: 'Wave speed from frequency and wavelength',
    inputs: [
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '50' },
      { key: 'l', symbol: 'λ', label: 'Wavelength (m)', default: '2' },
    ],
    compute: ({ f, l }) => fmt(f * l),
  },
  {
    id: 'gravitation',
    category: 'physics',
    name: 'Universal Gravitation',
    formula: 'F = G·m₁·m₂ / r²',
    description: 'Gravitational force between two masses',
    inputs: [
      { key: 'm1', symbol: 'm₁', label: 'Mass 1 (kg)', default: '5.97e24' },
      { key: 'm2', symbol: 'm₂', label: 'Mass 2 (kg)', default: '7.35e22' },
      { key: 'r',  symbol: 'r',  label: 'Distance (m)', default: '3.84e8' },
    ],
    compute: ({ m1, m2, r }) => {
      if (r === 0) return 'Division by zero';
      const G = 6.67430e-11;
      return fmt((G * m1 * m2) / (r * r));
    },
  },
  {
    id: 'momentum',
    category: 'physics',
    name: 'Momentum',
    formula: 'p = m × v',
    description: 'Linear momentum',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (kg)', default: '5' },
      { key: 'v', symbol: 'v', label: 'Velocity (m/s)', default: '8' },
    ],
    compute: ({ m, v }) => fmt(m * v),
  },
  {
    id: 'impulse',
    category: 'physics',
    name: 'Impulse',
    formula: 'J = F × Δt',
    description: 'Impulse from force and time',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '50' },
      { key: 't', symbol: 'Δt', label: 'Time (s)', default: '0.5' },
    ],
    compute: ({ F, t }) => fmt(F * t),
  },
  {
    id: 'torque',
    category: 'physics',
    name: 'Torque',
    formula: 'τ = F × r × sin(θ)',
    description: 'Torque from force and lever arm',
    inputs: [
      { key: 'F', symbol: 'F', label: 'Force (N)', default: '100' },
      { key: 'r', symbol: 'r', label: 'Lever arm (m)', default: '0.5' },
      { key: 'theta', symbol: 'θ', label: 'Angle (°)', default: '90' },
    ],
    compute: ({ F, r, theta }) => fmt(F * r * Math.sin((theta * Math.PI) / 180)),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CHEMISTRY
// ═══════════════════════════════════════════════════════════════════════════

const CHEMISTRY_FORMULAS = [
  {
    id: 'moles-from-mass',
    category: 'chemistry',
    name: 'Moles from Mass',
    formula: 'n = m / M',
    description: 'Number of moles from mass and molar mass',
    inputs: [
      { key: 'm', symbol: 'm', label: 'Mass (g)', default: '36' },
      { key: 'M', symbol: 'M', label: 'Molar mass (g/mol)', default: '18' },
    ],
    compute: ({ m, M }) => {
      if (M === 0) return 'Division by zero';
      return fmt(m / M);
    },
  },
  {
    id: 'molarity',
    category: 'chemistry',
    name: 'Molarity',
    formula: 'M = n / V',
    description: 'Concentration in mol/L',
    inputs: [
      { key: 'n', symbol: 'n', label: 'Moles (mol)', default: '0.5' },
      { key: 'V', symbol: 'V', label: 'Volume (L)', default: '2' },
    ],
    compute: ({ n, V }) => {
      if (V === 0) return 'Division by zero';
      return fmt(n / V);
    },
  },
  {
    id: 'dilution',
    category: 'chemistry',
    name: 'Dilution',
    formula: 'C₁V₁ = C₂V₂',
    description: 'Find new concentration after dilution',
    inputs: [
      { key: 'C1', symbol: 'C₁', label: 'Initial conc (M)', default: '2' },
      { key: 'V1', symbol: 'V₁', label: 'Initial vol (L)', default: '0.5' },
      { key: 'V2', symbol: 'V₂', label: 'Final vol (L)', default: '2' },
    ],
    compute: ({ C1, V1, V2 }) => {
      if (V2 === 0) return 'Division by zero';
      return fmt((C1 * V1) / V2);
    },
  },
  {
    id: 'ideal-gas',
    category: 'chemistry',
    name: 'Ideal Gas Law (V)',
    formula: 'V = nRT / P',
    description: 'Volume of an ideal gas',
    inputs: [
      { key: 'n', symbol: 'n', label: 'Moles (mol)', default: '1' },
      { key: 'T', symbol: 'T', label: 'Temp (K)', default: '273.15' },
      { key: 'P', symbol: 'P', label: 'Pressure (atm)', default: '1' },
    ],
    compute: ({ n, T, P }) => {
      if (P === 0) return 'Division by zero';
      const R = 0.082057;
      return fmt((n * R * T) / P);
    },
  },
  {
    id: 'percent-composition',
    category: 'chemistry',
    name: 'Percent Composition',
    formula: '% = (m_el / m_total) × 100',
    description: 'Mass percent of an element in a compound',
    inputs: [
      { key: 'me', symbol: 'm_el', label: 'Element mass (g)', default: '32' },
      { key: 'mt', symbol: 'm_total', label: 'Compound mass (g)', default: '98' },
    ],
    compute: ({ me, mt }) => {
      if (mt === 0) return 'Division by zero';
      return `${fmt((me / mt) * 100)} %`;
    },
  },
  {
    id: 'ph-from-h',
    category: 'chemistry',
    name: 'pH from [H⁺]',
    formula: 'pH = −log₁₀[H⁺]',
    description: 'pH from hydrogen ion concentration',
    inputs: [
      { key: 'H', symbol: '[H⁺]', label: 'Concentration (M)', default: '0.001' },
    ],
    compute: ({ H }) => {
      if (H <= 0) return 'Must be > 0';
      return fmt(-Math.log10(H));
    },
  },
  {
    id: 'poh-from-oh',
    category: 'chemistry',
    name: 'pOH from [OH⁻]',
    formula: 'pOH = −log₁₀[OH⁻]',
    description: 'pOH from hydroxide concentration',
    inputs: [
      { key: 'OH', symbol: '[OH⁻]', label: 'Concentration (M)', default: '0.001' },
    ],
    compute: ({ OH }) => {
      if (OH <= 0) return 'Must be > 0';
      return fmt(-Math.log10(OH));
    },
  },
  {
    id: 'ph-poh',
    category: 'chemistry',
    name: 'pH from pOH',
    formula: 'pH + pOH = 14',
    description: 'Relationship at 25°C',
    inputs: [{ key: 'poh', symbol: 'pOH', label: 'pOH', default: '4' }],
    compute: ({ poh }) => fmt(14 - poh),
  },
  {
    id: 'percent-yield',
    category: 'chemistry',
    name: 'Percent Yield',
    formula: '% = (actual / theoretical) × 100',
    description: 'Reaction efficiency',
    inputs: [
      { key: 'a', symbol: 'actual', label: 'Actual (g)', default: '15' },
      { key: 't', symbol: 'theory', label: 'Theoretical (g)', default: '20' },
    ],
    compute: ({ a, t }) => {
      if (t === 0) return 'Division by zero';
      return `${fmt((a / t) * 100)} %`;
    },
  },
  {
    id: 'normality',
    category: 'chemistry',
    name: 'Normality',
    formula: 'N = M × n_eq',
    description: 'Normality from molarity and equivalents',
    inputs: [
      { key: 'M', symbol: 'M', label: 'Molarity (M)', default: '0.5' },
      { key: 'n', symbol: 'n_eq', label: 'Equivalents', default: '2' },
    ],
    compute: ({ M, n }) => fmt(M * n),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ELECTRICAL
// ═══════════════════════════════════════════════════════════════════════════

const ELECTRICAL_FORMULAS = [
  {
    id: 'ohms-law',
    category: 'electrical',
    name: "Ohm's Law",
    formula: 'V = I × R',
    description: 'Voltage from current and resistance',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ I, R }) => fmt(I * R),
  },
  {
    id: 'power-vi',
    category: 'electrical',
    name: 'Power (V×I)',
    formula: 'P = V × I',
    description: 'Power from voltage and current',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
    ],
    compute: ({ V, I }) => fmt(V * I),
  },
  {
    id: 'power-i2r',
    category: 'electrical',
    name: 'Power (I²R)',
    formula: 'P = I² × R',
    description: 'Power dissipation in a resistor',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ I, R }) => fmt(I * I * R),
  },
  {
    id: 'power-v2r',
    category: 'electrical',
    name: 'Power (V²/R)',
    formula: 'P = V² / R',
    description: 'Power from voltage and resistance',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '10' },
    ],
    compute: ({ V, R }) => {
      if (R === 0) return 'Division by zero';
      return fmt((V * V) / R);
    },
  },
  {
    id: 'resistors-series',
    category: 'electrical',
    name: 'Resistors in Series',
    formula: 'R_total = R₁ + R₂ + R₃',
    description: 'Series resistance',
    inputs: [
      { key: 'r1', symbol: 'R₁', label: 'R₁ (Ω)', default: '10' },
      { key: 'r2', symbol: 'R₂', label: 'R₂ (Ω)', default: '20' },
      { key: 'r3', symbol: 'R₃', label: 'R₃ (Ω)', default: '30' },
    ],
    compute: ({ r1, r2, r3 }) => fmt(r1 + r2 + r3),
  },
  {
    id: 'resistors-parallel',
    category: 'electrical',
    name: 'Resistors in Parallel',
    formula: '1/R_total = 1/R₁ + 1/R₂ + 1/R₃',
    description: 'Parallel resistance',
    inputs: [
      { key: 'r1', symbol: 'R₁', label: 'R₁ (Ω)', default: '10' },
      { key: 'r2', symbol: 'R₂', label: 'R₂ (Ω)', default: '20' },
      { key: 'r3', symbol: 'R₃', label: 'R₃ (Ω)', default: '30' },
    ],
    compute: ({ r1, r2, r3 }) => {
      if (r1 === 0 || r2 === 0 || r3 === 0) return 'Zero resistance';
      return fmt(1 / (1 / r1 + 1 / r2 + 1 / r3));
    },
  },
  {
    id: 'capacitor-energy',
    category: 'electrical',
    name: 'Capacitor Energy',
    formula: 'E = ½ × C × V²',
    description: 'Energy stored in a capacitor',
    inputs: [
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.001' },
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
    ],
    compute: ({ C, V }) => fmt(0.5 * C * V * V),
  },
  {
    id: 'rc-time',
    category: 'electrical',
    name: 'RC Time Constant',
    formula: 'τ = R × C',
    description: 'Time constant of an RC circuit',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '1000' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.001' },
    ],
    compute: ({ R, C }) => fmt(R * C),
  },
  {
    id: 'inductive-reactance',
    category: 'electrical',
    name: 'Inductive Reactance',
    formula: 'X_L = 2πfL',
    description: 'Inductive reactance',
    inputs: [
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '60' },
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
    ],
    compute: ({ f, L }) => fmt(2 * Math.PI * f * L),
  },
  {
    id: 'capacitive-reactance',
    category: 'electrical',
    name: 'Capacitive Reactance',
    formula: 'X_C = 1 / (2πfC)',
    description: 'Capacitive reactance',
    inputs: [
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '60' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.001' },
    ],
    compute: ({ f, C }) => {
      if (f === 0 || C === 0) return 'Division by zero';
      return fmt(1 / (2 * Math.PI * f * C));
    },
  },
  {
    id: 'resonance-freq',
    category: 'electrical',
    name: 'Resonance Frequency',
    formula: 'f = 1 / (2π√(LC))',
    description: 'LC resonance frequency',
    inputs: [
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.00001' },
    ],
    compute: ({ L, C }) => {
      if (L <= 0 || C <= 0) return 'Must be positive';
      return fmt(1 / (2 * Math.PI * Math.sqrt(L * C)));
    },
  },
  {
    id: 'energy-kwh',
    category: 'electrical',
    name: 'Energy (kWh)',
    formula: 'E = P × t / 1000',
    description: 'Energy consumption in kWh',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Power (W)', default: '1000' },
      { key: 't', symbol: 't', label: 'Time (h)', default: '2' },
    ],
    compute: ({ P, t }) => fmt((P * t) / 1000),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ELECTRONICS
// ═══════════════════════════════════════════════════════════════════════════

const ELECTRONICS_FORMULAS = [
  {
    id: 'voltage-divider',
    category: 'electronics',
    name: 'Voltage Divider',
    formula: 'V_out = V_in × R₂ / (R₁ + R₂)',
    description: 'Output voltage of a resistive divider',
    inputs: [
      { key: 'Vin', symbol: 'V_in', label: 'Input voltage (V)', default: '12' },
      { key: 'R1', symbol: 'R₁', label: 'R₁ (Ω)', default: '1000' },
      { key: 'R2', symbol: 'R₂', label: 'R₂ (Ω)', default: '1000' },
    ],
    compute: ({ Vin, R1, R2 }) => {
      if (R1 + R2 === 0) return 'Division by zero';
      return fmt((Vin * R2) / (R1 + R2));
    },
  },
  {
    id: 'current-divider',
    category: 'electronics',
    name: 'Current Divider',
    formula: 'I₁ = I_total × R₂ / (R₁ + R₂)',
    description: 'Current through R₁ in parallel circuit',
    inputs: [
      { key: 'It', symbol: 'I_total', label: 'Total current (A)', default: '1' },
      { key: 'R1', symbol: 'R₁', label: 'R₁ (Ω)', default: '100' },
      { key: 'R2', symbol: 'R₂', label: 'R₂ (Ω)', default: '100' },
    ],
    compute: ({ It, R1, R2 }) => {
      if (R1 + R2 === 0) return 'Division by zero';
      return fmt((It * R2) / (R1 + R2));
    },
  },
  {
    id: 'opamp-inverting',
    category: 'electronics',
    name: 'Op-Amp Gain (Inverting)',
    formula: 'A = −R_f / R_in',
    description: 'Inverting amplifier gain',
    inputs: [
      { key: 'Rf',  symbol: 'R_f',  label: 'Feedback R (Ω)', default: '10000' },
      { key: 'Rin', symbol: 'R_in', label: 'Input R (Ω)', default: '1000' },
    ],
    compute: ({ Rf, Rin }) => {
      if (Rin === 0) return 'Division by zero';
      return fmt(-Rf / Rin);
    },
  },
  {
    id: 'opamp-noninverting',
    category: 'electronics',
    name: 'Op-Amp Gain (Non-Inv)',
    formula: 'A = 1 + R_f / R_in',
    description: 'Non-inverting amplifier gain',
    inputs: [
      { key: 'Rf',  symbol: 'R_f',  label: 'Feedback R (Ω)', default: '10000' },
      { key: 'Rin', symbol: 'R_in', label: 'Input R (Ω)', default: '1000' },
    ],
    compute: ({ Rf, Rin }) => {
      if (Rin === 0) return 'Division by zero';
      return fmt(1 + Rf / Rin);
    },
  },
  {
    id: 'led-resistor',
    category: 'electronics',
    name: 'LED Resistor',
    formula: 'R = (V_s − V_LED) / I_LED',
    description: 'Series resistor for an LED',
    inputs: [
      { key: 'Vs', symbol: 'V_s', label: 'Supply (V)', default: '5' },
      { key: 'Vl', symbol: 'V_LED', label: 'LED forward (V)', default: '2' },
      { key: 'Il', symbol: 'I_LED', label: 'LED current (A)', default: '0.02' },
    ],
    compute: ({ Vs, Vl, Il }) => {
      if (Il === 0) return 'Division by zero';
      return fmt((Vs - Vl) / Il);
    },
  },
  {
    id: 'transformer-turns',
    category: 'electronics',
    name: 'Transformer Ratio',
    formula: 'V_s / V_p = N_s / N_p',
    description: 'Secondary voltage from turns ratio',
    inputs: [
      { key: 'Vp', symbol: 'V_p', label: 'Primary V', default: '230' },
      { key: 'Np', symbol: 'N_p', label: 'Primary turns', default: '1000' },
      { key: 'Ns', symbol: 'N_s', label: 'Secondary turns', default: '100' },
    ],
    compute: ({ Vp, Np, Ns }) => {
      if (Np === 0) return 'Division by zero';
      return fmt((Vp * Ns) / Np);
    },
  },
  {
    id: 'diode-current',
    category: 'electronics',
    name: 'Diode Current',
    formula: 'I = I_s × (e^(V / (n × V_T)) − 1)',
    description: 'Shockley diode equation',
    inputs: [
      { key: 'Is', symbol: 'I_s',  label: 'Saturation I (A)', default: '1e-12' },
      { key: 'V',  symbol: 'V',    label: 'Forward V',        default: '0.7' },
      { key: 'n',  symbol: 'n',    label: 'Ideality',         default: '1' },
    ],
    compute: ({ Is, V, n }) => {
      if (n === 0) return 'Division by zero';
      const VT = 0.02585;
      return fmt(Is * (Math.exp(V / (n * VT)) - 1));
    },
  },
  {
    id: 'transistor-beta',
    category: 'electronics',
    name: 'Transistor β',
    formula: 'β = I_C / I_B',
    description: 'Current gain of a transistor',
    inputs: [
      { key: 'Ic', symbol: 'I_C', label: 'Collector I (A)', default: '0.1' },
      { key: 'Ib', symbol: 'I_B', label: 'Base I (A)', default: '0.001' },
    ],
    compute: ({ Ic, Ib }) => {
      if (Ib === 0) return 'Division by zero';
      return fmt(Ic / Ib);
    },
  },
  {
    id: 'db-gain',
    category: 'electronics',
    name: 'dB from Voltage Ratio',
    formula: 'dB = 20 × log₁₀(V_out / V_in)',
    description: 'Voltage gain in decibels',
    inputs: [
      { key: 'Vout', symbol: 'V_out', label: 'Output V', default: '10' },
      { key: 'Vin',  symbol: 'V_in',  label: 'Input V',  default: '1' },
    ],
    compute: ({ Vout, Vin }) => {
      if (Vin === 0 || Vout / Vin <= 0) return 'Must be positive';
      return `${fmt(20 * Math.log10(Vout / Vin))} dB`;
    },
  },
  {
    id: 'db-power',
    category: 'electronics',
    name: 'dB from Power Ratio',
    formula: 'dB = 10 × log₁₀(P_out / P_in)',
    description: 'Power gain in decibels',
    inputs: [
      { key: 'Pout', symbol: 'P_out', label: 'Output P', default: '100' },
      { key: 'Pin',  symbol: 'P_in',  label: 'Input P',  default: '1' },
    ],
    compute: ({ Pout, Pin }) => {
      if (Pin === 0 || Pout / Pin <= 0) return 'Must be positive';
      return `${fmt(10 * Math.log10(Pout / Pin))} dB`;
    },
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

/**
 * Get all formulas in a category.
 */
export function formulasByCategory(categoryKey) {
  return FORMULAS.filter(f => f.category === categoryKey);
}

/**
 * Get a formula by id.
 */
export function getFormula(id) {
  return FORMULAS.find(f => f.id === id) || null;
}

/**
 * Compute a formula by id, given a values object (keyed by input key).
 */
export function computeFormula(id, values) {
  const f = getFormula(id);
  if (!f) throw new Error(`Unknown formula: ${id}`);
  return f.compute(values);
}