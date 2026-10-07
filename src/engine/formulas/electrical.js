// src/engine/formulas/electrical.js
// Electrical engineering formulas — Ohm's law, power, networks, AC, transformers.

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

export const ELECTRICAL_FORMULAS = [
  // ─── Ohm's Law Family ─────────────────────────────────────────────────
  { id: 'ohms-law', category: 'electrical', name: "Ohm's Law (V)",
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

  // ─── Power Family ─────────────────────────────────────────────────────
  { id: 'power-vi', category: 'electrical', name: 'Power (V×I)',
    formula: 'P = V × I', description: 'Electrical power',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '2' },
    ],
    compute: ({ V, I }) => fmt(V * I),
  },
  { id: 'power-i2r', category: 'electrical', name: 'Power (I²R)',
    formula: 'P = I² × R', description: 'Power dissipation',
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

  // ─── Resistor Networks ────────────────────────────────────────────────
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
      { key: 'r2', symbol: 'R₂', label: 'R₂ (Ω)', default: '20' },
      { key: 'r3', symbol: 'R₃', label: 'R₃ (Ω)', default: '1e12' },
    ],
    compute: ({ r1, r2, r3 }) => {
      if (r1 === 0 || r2 === 0 || r3 === 0) return 'Zero resistance';
      return fmt(1 / (1 / r1 + 1 / r2 + 1 / r3));
    },
  },
  { id: 'resistors-parallel-2', category: 'electrical', name: 'R₁ ∥ R₂',
    formula: 'R = R₁R₂ / (R₁ + R₂)', description: 'Two parallel resistors',
    inputs: [
      { key: 'r1', symbol: 'R₁', label: 'R₁ (Ω)', default: '10' },
      { key: 'r2', symbol: 'R₂', label: 'R₂ (Ω)', default: '10' },
    ],
    compute: ({ r1, r2 }) => (r1 + r2) === 0 ? 'Division by zero' : fmt((r1 * r2) / (r1 + r2)),
  },
  { id: 'voltage-divider-e', category: 'electrical', name: 'Voltage Divider',
    formula: 'V_out = V_in × R₂/(R₁ + R₂)', description: 'Resistive divider output',
    inputs: [
      { key: 'Vin', symbol: 'V_in', label: 'Input (V)', default: '12' },
      { key: 'R1', symbol: 'R₁', label: 'R₁ (Ω)', default: '1000' },
      { key: 'R2', symbol: 'R₂', label: 'R₂ (Ω)', default: '1000' },
    ],
    compute: ({ Vin, R1, R2 }) => (R1 + R2) === 0 ? 'Division by zero' : fmt((Vin * R2) / (R1 + R2)),
  },
  { id: 'current-divider-e', category: 'electrical', name: 'Current Divider',
    formula: 'I₁ = I_total × R₂/(R₁+R₂)', description: 'Split current',
    inputs: [
      { key: 'It', symbol: 'I_total', label: 'Total (A)', default: '1' },
      { key: 'R1', symbol: 'R₁', label: 'R₁ (Ω)', default: '100' },
      { key: 'R2', symbol: 'R₂', label: 'R₂ (Ω)', default: '100' },
    ],
    compute: ({ It, R1, R2 }) => (R1 + R2) === 0 ? 'Division by zero' : fmt((It * R2) / (R1 + R2)),
  },

  // ─── Capacitance ──────────────────────────────────────────────────────
  { id: 'capacitor-charge', category: 'electrical', name: 'Capacitor Charge',
    formula: 'Q = C × V', description: 'Charge on capacitor',
    inputs: [
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.001' },
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '12' },
    ],
    compute: ({ C, V }) => fmt(C * V),
  },
  { id: 'capacitor-energy', category: 'electrical', name: 'Capacitor Energy',
    formula: 'E = ½CV²', description: 'Energy in capacitor',
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
    compute: ({ c1, c2 }) => (c1 === 0 || c2 === 0) ? 'Zero capacitance' : fmt(1 / (1 / c1 + 1 / c2)),
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
  { id: 'rc-cutoff', category: 'electrical', name: 'RC Cutoff Frequency',
    formula: 'f_c = 1/(2πRC)', description: 'RC filter cutoff',
    inputs: [
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '1000' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.000001' },
    ],
    compute: ({ R, C }) => (R <= 0 || C <= 0) ? 'Must be > 0' : fmt(1 / (2 * Math.PI * R * C)) + ' Hz',
  },

  // ─── Inductance ───────────────────────────────────────────────────────
  { id: 'inductor-energy', category: 'electrical', name: 'Inductor Energy',
    formula: 'E = ½LI²', description: 'Energy in inductor',
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
    compute: ({ l1, l2 }) => (l1 === 0 || l2 === 0) ? 'Zero inductance' : fmt(1 / (1 / l1 + 1 / l2)),
  },
  { id: 'rl-time', category: 'electrical', name: 'RL Time Constant',
    formula: 'τ = L / R', description: 'RL time constant',
    inputs: [
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
      { key: 'R', symbol: 'R', label: 'Resistance (Ω)', default: '100' },
    ],
    compute: ({ L, R }) => R === 0 ? 'Division by zero' : fmt(L / R),
  },

  // ─── Reactance & Impedance ────────────────────────────────────────────
  { id: 'inductive-reactance', category: 'electrical', name: 'Inductive Reactance',
    formula: 'X_L = 2πfL', description: 'Inductive reactance',
    inputs: [
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '60' },
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
    ],
    compute: ({ f, L }) => fmt(2 * Math.PI * f * L),
  },
  { id: 'capacitive-reactance', category: 'electrical', name: 'Capacitive Reactance',
    formula: 'X_C = 1/(2πfC)', description: 'Capacitive reactance',
    inputs: [
      { key: 'f', symbol: 'f', label: 'Frequency (Hz)', default: '60' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.000001' },
    ],
    compute: ({ f, C }) => (f === 0 || C === 0) ? 'Division by zero' : fmt(1 / (2 * Math.PI * f * C)),
  },
  { id: 'impedance-rlc', category: 'electrical', name: 'RLC Impedance',
    formula: 'Z = √(R² + (X_L − X_C)²)', description: 'RLC impedance',
    inputs: [
      { key: 'R',  symbol: 'R',   label: 'R (Ω)',  default: '50' },
      { key: 'XL', symbol: 'X_L', label: 'X_L (Ω)', default: '30' },
      { key: 'XC', symbol: 'X_C', label: 'X_C (Ω)', default: '10' },
    ],
    compute: ({ R, XL, XC }) => fmt(Math.hypot(R, XL - XC)),
  },
  { id: 'impedance-rc', category: 'electrical', name: 'RC Impedance',
    formula: 'Z = √(R² + X_C²)', description: 'RC circuit impedance',
    inputs: [
      { key: 'R', symbol: 'R', label: 'R (Ω)', default: '100' },
      { key: 'X', symbol: 'X_C', label: 'X_C (Ω)', default: '50' },
    ],
    compute: ({ R, X }) => fmt(Math.hypot(R, X)),
  },
  { id: 'impedance-rl', category: 'electrical', name: 'RL Impedance',
    formula: 'Z = √(R² + X_L²)', description: 'RL circuit impedance',
    inputs: [
      { key: 'R', symbol: 'R', label: 'R (Ω)', default: '100' },
      { key: 'X', symbol: 'X_L', label: 'X_L (Ω)', default: '50' },
    ],
    compute: ({ R, X }) => fmt(Math.hypot(R, X)),
  },
  { id: 'resonance-freq', category: 'electrical', name: 'LC Resonance',
    formula: 'f = 1/(2π√(LC))', description: 'Resonant frequency',
    inputs: [
      { key: 'L', symbol: 'L', label: 'Inductance (H)', default: '0.1' },
      { key: 'C', symbol: 'C', label: 'Capacitance (F)', default: '0.00001' },
    ],
    compute: ({ L, C }) => (L <= 0 || C <= 0) ? 'Invalid' : fmt(1 / (2 * Math.PI * Math.sqrt(L * C))) + ' Hz',
  },
  { id: 'q-factor', category: 'electrical', name: 'Q Factor',
    formula: 'Q = (1/R)·√(L/C)', description: 'Quality factor (series RLC)',
    inputs: [
      { key: 'R', symbol: 'R', label: 'R (Ω)', default: '10' },
      { key: 'L', symbol: 'L', label: 'L (H)', default: '0.001' },
      { key: 'C', symbol: 'C', label: 'C (F)', default: '0.0000001' },
    ],
    compute: ({ R, L, C }) => (R === 0 || C === 0) ? 'Division by zero' : fmt((1 / R) * Math.sqrt(L / C)),
  },

  // ─── AC ───────────────────────────────────────────────────────────────
  { id: 'peak-rms-v', category: 'electrical', name: 'Peak to RMS (V)',
    formula: 'V_rms = V_peak / √2', description: 'RMS from peak',
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
    formula: 'PF = P / S', description: 'Power factor',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Real power (W)', default: '1000' },
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
  { id: 'phase-angle', category: 'electrical', name: 'Phase Angle',
    formula: 'φ = arctan((X_L − X_C)/R)', description: 'RLC phase angle',
    inputs: [
      { key: 'R',  symbol: 'R',   label: 'R (Ω)',  default: '50' },
      { key: 'XL', symbol: 'X_L', label: 'X_L (Ω)', default: '30' },
      { key: 'XC', symbol: 'X_C', label: 'X_C (Ω)', default: '10' },
    ],
    compute: ({ R, XL, XC }) => R === 0 ? 'Division by zero' : fmt(Math.atan((XL - XC) / R) * 180 / Math.PI) + '°',
  },

  // ─── Energy & Cost ────────────────────────────────────────────────────
  { id: 'energy-kwh', category: 'electrical', name: 'Energy (kWh)',
    formula: 'E = P × t / 1000', description: 'Energy consumption',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Power (W)', default: '1000' },
      { key: 't', symbol: 't', label: 'Time (h)', default: '2' },
    ],
    compute: ({ P, t }) => fmt((P * t) / 1000),
  },
  { id: 'cost-electricity', category: 'electrical', name: 'Electricity Cost',
    formula: 'Cost = kWh × rate', description: 'Cost from energy',
    inputs: [
      { key: 'kwh', symbol: 'kWh', label: 'Energy (kWh)', default: '10' },
      { key: 'r',   symbol: 'rate', label: 'Rate per kWh', default: '0.15' },
    ],
    compute: ({ kwh, r }) => fmt(kwh * r),
  },

  // ─── Three-Phase ──────────────────────────────────────────────────────
  { id: 'three-phase-power', category: 'electrical', name: 'Three-Phase Power',
    formula: 'P = √3·V_L·I_L·cos(φ)', description: '3-phase real power',
    inputs: [
      { key: 'V',  symbol: 'V_L',   label: 'Line V (V)', default: '400' },
      { key: 'I',  symbol: 'I_L',   label: 'Line I (A)', default: '10' },
      { key: 'pf', symbol: 'cos(φ)', label: 'Power factor', default: '0.9' },
    ],
    compute: ({ V, I, pf }) => fmt(Math.sqrt(3) * V * I * pf),
  },

  // ─── Transformers ─────────────────────────────────────────────────────
  { id: 'transformer-secondary-v', category: 'electrical', name: 'Transformer V',
    formula: 'V_s = V_p × N_s/N_p', description: 'Secondary voltage',
    inputs: [
      { key: 'Vp', symbol: 'V_p', label: 'Primary V', default: '230' },
      { key: 'Np', symbol: 'N_p', label: 'Primary turns', default: '1000' },
      { key: 'Ns', symbol: 'N_s', label: 'Secondary turns', default: '100' },
    ],
    compute: ({ Vp, Np, Ns }) => Np === 0 ? 'Division by zero' : fmt((Vp * Ns) / Np),
  },
  { id: 'transformer-turns', category: 'electrical', name: 'Turns Ratio',
    formula: 'N_p/N_s = V_p/V_s', description: 'Turns ratio',
    inputs: [
      { key: 'Vp', symbol: 'V_p', label: 'Primary V', default: '230' },
      { key: 'Vs', symbol: 'V_s', label: 'Secondary V', default: '23' },
    ],
    compute: ({ Vp, Vs }) => Vs === 0 ? 'Division by zero' : fmt(Vp / Vs),
  },
  { id: 'transformer-current', category: 'electrical', name: 'Transformer I',
    formula: 'I_s = I_p × N_p/N_s', description: 'Secondary current',
    inputs: [
      { key: 'Ip', symbol: 'I_p', label: 'Primary I', default: '1' },
      { key: 'Np', symbol: 'N_p', label: 'Primary turns', default: '1000' },
      { key: 'Ns', symbol: 'N_s', label: 'Secondary turns', default: '100' },
    ],
    compute: ({ Ip, Np, Ns }) => Ns === 0 ? 'Division by zero' : fmt((Ip * Np) / Ns),
  },

  // ─── Wiring ───────────────────────────────────────────────────────────
  { id: 'wire-resistance', category: 'electrical', name: 'Wire Resistance',
    formula: 'R = ρL/A', description: 'Resistance of a wire',
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
  { id: 'voltage-drop', category: 'electrical', name: 'Voltage Drop',
    formula: 'V_drop = 2·I·L·R_per_m', description: 'Wire voltage drop',
    inputs: [
      { key: 'I', symbol: 'I', label: 'Current (A)', default: '10' },
      { key: 'L', symbol: 'L', label: 'Length (m)', default: '50' },
      { key: 'R', symbol: 'R_per_m', label: 'Ω/m', default: '0.005' },
    ],
    compute: ({ I, L, R }) => fmt(2 * I * L * R),
  },
  { id: 'cable-ampacity', category: 'electrical', name: 'Cable Ampacity',
    formula: 'I ≈ 4 × A_mm²', description: 'Copper rule of thumb',
    inputs: [{ key: 'A', symbol: 'A', label: 'Area (mm²)', default: '2.5' }],
    compute: ({ A }) => fmt(4 * A),
  },
  { id: 'short-circuit-current', category: 'electrical', name: 'Short-Circuit Current',
    formula: 'I_sc = V / Z', description: 'Fault current',
    inputs: [
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '230' },
      { key: 'Z', symbol: 'Z', label: 'Impedance (Ω)', default: '0.1' },
    ],
    compute: ({ V, Z }) => Z === 0 ? 'Division by zero' : fmt(V / Z),
  },
  { id: 'fuse-rating', category: 'electrical', name: 'Fuse Rating',
    formula: 'I = P/V × 1.25', description: 'Fuse with safety margin',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Power (W)', default: '2000' },
      { key: 'V', symbol: 'V', label: 'Voltage (V)', default: '230' },
    ],
    compute: ({ P, V }) => V === 0 ? 'Division by zero' : fmt((P / V) * 1.25),
  },
  { id: 'battery-life', category: 'electrical', name: 'Battery Life',
    formula: 't = Capacity / Current', description: 'Battery duration',
    inputs: [
      { key: 'C', symbol: 'Ah', label: 'Capacity (Ah)', default: '10' },
      { key: 'I', symbol: 'I',  label: 'Current (A)',   default: '0.5' },
    ],
    compute: ({ C, I }) => I === 0 ? 'Division by zero' : fmt(C / I) + ' h',
  },

  // ─── Motors & Machinery ───────────────────────────────────────────────
  { id: 'motor-torque', category: 'electrical', name: 'Motor Torque',
    formula: 'T = P·60/(2πN)', description: 'Torque from power and RPM',
    inputs: [
      { key: 'P', symbol: 'P', label: 'Power (W)', default: '1000' },
      { key: 'N', symbol: 'N', label: 'Speed (RPM)', default: '1500' },
    ],
    compute: ({ P, N }) => N === 0 ? 'Division by zero' : fmt((P * 60) / (2 * Math.PI * N)),
  },
  { id: 'motor-hp', category: 'electrical', name: 'Motor HP',
    formula: 'HP = (T × N) / 5252', description: 'Horsepower (T in lb-ft)',
    inputs: [
      { key: 'T', symbol: 'T', label: 'Torque (lb-ft)', default: '100' },
      { key: 'N', symbol: 'N', label: 'Speed (RPM)',    default: '1500' },
    ],
    compute: ({ T, N }) => fmt((T * N) / 5252),
  },

  // ─── dB in Electrical Context ─────────────────────────────────────────
  { id: 'db-power-ratio-el', category: 'electrical', name: 'Power Ratio (dB)',
    formula: 'dB = 10·log₁₀(P_out/P_in)', description: 'Power ratio in dB',
    inputs: [
      { key: 'Po', symbol: 'P_out', label: 'Output (W)', default: '100' },
      { key: 'Pi', symbol: 'P_in',  label: 'Input (W)',  default: '1' },
    ],
    compute: ({ Po, Pi }) => (Pi <= 0 || Po <= 0) ? 'Must be > 0' : `${fmt(10 * Math.log10(Po / Pi))} dB`,
  },
];