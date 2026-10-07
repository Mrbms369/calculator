// src/engine/formulas/index.js
// Aggregates all formula categories into a single catalog.

import { MATH_FORMULAS } from './math.js';
import { PHYSICS_FORMULAS } from './physics.js';
import { CHEMISTRY_FORMULAS } from './chemistry.js';
import { ELECTRICAL_FORMULAS } from './electrical.js';
import { ELECTRONICS_FORMULAS } from './electronics.js';

export const CATEGORIES = {
  math:        { label: 'Math',         icon: '∑' },
  physics:     { label: 'Physics',      icon: '⚛' },
  chemistry:   { label: 'Chemistry',    icon: '🧪' },
  electrical:  { label: 'Electrical',   icon: '⚡' },
  electronics: { label: 'Electronics',  icon: '🔌' },
};

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

export { MATH_FORMULAS, PHYSICS_FORMULAS, CHEMISTRY_FORMULAS, ELECTRICAL_FORMULAS, ELECTRONICS_FORMULAS };