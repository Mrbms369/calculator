// src/engine/units.js
// Unit conversion logic.

import { CATEGORIES } from './unitData.js';

/**
 * Convert a value from one unit to another within the same category.
 * @param {string} categoryKey  e.g. 'length'
 * @param {string} fromUnit     e.g. 'm'
 * @param {string} toUnit       e.g. 'ft'
 * @param {number} value        numeric input
 * @returns {number}
 * @throws {Error} on invalid category/unit or non-finite value
 */
export function convert(categoryKey, fromUnit, toUnit, value) {
  const cat = CATEGORIES[categoryKey];
  if (!cat) throw new Error(`Unknown category: ${categoryKey}`);

  const from = cat.units[fromUnit];
  const to = cat.units[toUnit];
  if (!from) throw new Error(`Unknown unit: ${fromUnit}`);
  if (!to) throw new Error(`Unknown unit: ${toUnit}`);
  if (!Number.isFinite(value)) throw new Error('Value must be finite');

  // Same unit → identity
  if (fromUnit === toUnit) return value;

  // Temperature uses formulas, not factors
  if (cat.isTemperature) {
    return convertTemperature(fromUnit, toUnit, value);
  }

  // Standard factor conversion
  const baseValue = value * from.factor;
  return baseValue / to.factor;
}

/**
 * Temperature conversion between C, F, K.
 */
function convertTemperature(fromUnit, toUnit, value) {
  // First: to Celsius
  let celsius;
  switch (fromUnit) {
    case 'C': celsius = value; break;
    case 'F': celsius = (value - 32) * 5 / 9; break;
    case 'K': celsius = value - 273.15; break;
    default: throw new Error(`Unknown temperature unit: ${fromUnit}`);
  }

  // Then: to target
  switch (toUnit) {
    case 'C': return celsius;
    case 'F': return celsius * 9 / 5 + 32;
    case 'K': return celsius + 273.15;
    default: throw new Error(`Unknown temperature unit: ${toUnit}`);
  }
}

/**
 * List all category keys.
 */
export function listCategories() {
  return Object.keys(CATEGORIES);
}

/**
 * List all unit keys for a category.
 */
export function listUnits(categoryKey) {
  const cat = CATEGORIES[categoryKey];
  if (!cat) return [];
  return Object.keys(cat.units);
}

/**
 * Get the human-readable label of a unit.
 */
export function unitLabel(categoryKey, unitKey) {
  const cat = CATEGORIES[categoryKey];
  if (!cat) return unitKey;
  return cat.units[unitKey]?.label || unitKey;
}

/**
 * Get the display label of a category.
 */
export function categoryLabel(categoryKey) {
  return CATEGORIES[categoryKey]?.label || categoryKey;
}

/**
 * Format a number for display (trim trailing zeros, avoid exponential for
 * reasonable ranges).
 */
export function formatNumber(n) {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';

  const abs = Math.abs(n);
  if (abs < 1e-6 || abs >= 1e15) {
    return n.toExponential(6).replace(/\.?0+e/, 'e');
  }

  // Round to 10 significant digits then strip trailing zeros
  const rounded = Number(n.toPrecision(10));
  return String(rounded);
}