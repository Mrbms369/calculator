// src/engine/programmer.js
// Pure logic for the programmer calculator.
// All bitwise ops use 32-bit signed integers (JavaScript bitwise semantics).

const MASK_32 = 0xFFFFFFFF;

/**
 * Parse a string in a given base to a JS number.
 * Returns NaN on invalid input.
 * @param {string} input
 * @param {2|8|10|16} base
 * @returns {number}
 */
export function parseInBase(input, base) {
  if (typeof input !== 'string') return NaN;
  const cleaned = input.trim().replace(/^0[bxo]/i, '').replace(/\s+/g, '');
  if (cleaned === '') return NaN;

  // Only allow digits valid in the given base
  const validChars = '0123456789abcdef'.slice(0, base);
  const lower = cleaned.toLowerCase();
  for (const ch of lower) {
    if (!validChars.includes(ch)) return NaN;
  }

  const n = parseInt(lower, base);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Format a number in a given base with proper prefix.
 * Handles both positive (0..2^32-1) and negative signed values.
 * @param {number} n
 * @param {2|8|10|16} base
 * @param {boolean} [unsigned=true] treat negative as unsigned 32-bit
 * @returns {string}
 */
export function formatInBase(n, base, unsigned = true) {
  if (!Number.isFinite(n)) return '';
  let value = Math.trunc(n);

  if (unsigned) {
    value = value >>> 0; // to unsigned 32-bit
  }

  if (base === 10) return String(value);
  if (base === 16) return (value < 0 ? '-' : '') + (value < 0 ? (-value).toString(16) : value.toString(16));
  if (base === 8)  return (value < 0 ? '-' : '') + (value < 0 ? (-value).toString(8) : value.toString(8));
  if (base === 2)  return (value < 0 ? '-' : '') + (value < 0 ? (-value).toString(2) : value.toString(2));
  return String(value);
}

/**
 * Format binary with spaces every 4 bits for readability.
 */
export function formatBinarySpaced(n) {
  const bits = formatInBase(n, 2, true).padStart(32, '0');
  return bits.match(/.{1,4}/g).join(' ');
}

/**
 * Get an array of 32 bits (MSB first) for a number.
 * @param {number} n
 * @returns {number[]}
 */
export function toBits(n) {
  const bits = [];
  const v = (Math.trunc(n) >>> 0);
  for (let i = 31; i >= 0; i--) {
    bits.push((v >>> i) & 1);
  }
  return bits;
}

/**
 * Convert an array of 32 bits (MSB first) back to a number.
 */
export function fromBits(bits) {
  let v = 0;
  for (const b of bits) v = (v << 1) | (b ? 1 : 0);
  return v >>> 0;
}

/**
 * Toggle one bit in a number.
 * @param {number} n
 * @param {number} index 0 (LSB) to 31 (MSB)
 */
export function toggleBit(n, index) {
  if (index < 0 || index > 31) return n;
  return ((n >>> 0) ^ (1 << index)) >>> 0;
}

/**
 * Bitwise operations on 32-bit integers.
 */
export const OPS = {
  AND: (a, b) => (a & b) >>> 0,
  OR:  (a, b) => (a | b) >>> 0,
  XOR: (a, b) => (a ^ b) >>> 0,
  NOT: (a)    => (~a) >>> 0,
  LSHIFT: (a, b) => (a << (b & 31)) >>> 0,
  RSHIFT: (a, b) => (a >>> (b & 31)) >>> 0,   // logical shift
};

/**
 * Compute the operation by name.
 * @param {string} name  'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT'
 * @param {number} a
 * @param {number} [b]
 */
export function applyOp(name, a, b = 0) {
  const fn = OPS[name];
  if (!fn) throw new Error(`Unknown operation: ${name}`);
  return fn(Math.trunc(a) >>> 0, Math.trunc(b) >>> 0);
}

/**
 * Describe a number in human-readable form:
 * power-of-2, byte size, ASCII (if printable).
 */
export function describeNumber(n) {
  const notes = [];
  const v = Math.trunc(n);

  // Power of 2?
  if (v > 0 && (v & (v - 1)) === 0) {
    notes.push(`2^${Math.log2(v)}`);
  }

  // ASCII printable?
  if (v >= 32 && v <= 126) {
    notes.push(`ASCII '${String.fromCharCode(v)}'`);
  }

  // Byte size
  notes.push(byteSize(v));

  return notes;
}

/**
 * Human-friendly size for a byte count.
 */
export function byteSize(bytes) {
  if (!Number.isFinite(bytes)) return '';
  const abs = Math.abs(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  let n = abs;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const sign = bytes < 0 ? '-' : '';
  return `${sign}${n.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}