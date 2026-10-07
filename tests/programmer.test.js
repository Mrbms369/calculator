import { describe, it, expect } from 'vitest';
import {
  parseInBase, formatInBase, formatBinarySpaced, toBits, fromBits,
  toggleBit, applyOp, describeNumber, byteSize,
} from '../src/engine/programmer.js';

// ─── Bit index reference (important for reading these tests) ──────────────
// toBits(n) returns an array of 32 bits, MSB first:
//   bits[0]  = bit 31 of the number (MSB)
//   bits[31] = bit 0 of the number (LSB)
// So: number's bit position p  ⇔  array index (31 - p)

describe('parseInBase', () => {
  it('parses decimal', () => expect(parseInBase('255', 10)).toBe(255));
  it('parses hex lowercase', () => expect(parseInBase('ff', 16)).toBe(255));
  it('parses hex uppercase', () => expect(parseInBase('FF', 16)).toBe(255));
  it('parses hex with 0x prefix', () => expect(parseInBase('0xFF', 16)).toBe(255));
  it('parses binary', () => expect(parseInBase('11111111', 2)).toBe(255));
  it('parses binary with 0b prefix', () => expect(parseInBase('0b11111111', 2)).toBe(255));
  it('parses octal', () => expect(parseInBase('377', 8)).toBe(255));
  it('rejects invalid hex', () => expect(parseInBase('GG', 16)).toBeNaN());
  it('rejects invalid binary', () => expect(parseInBase('102', 2)).toBeNaN());
  it('rejects empty', () => expect(parseInBase('', 10)).toBeNaN());
  it('ignores spaces', () => expect(parseInBase('1111 0000', 2)).toBe(240));
});

describe('formatInBase', () => {
  it('formats decimal', () => expect(formatInBase(255, 10)).toBe('255'));
  it('formats hex', () => expect(formatInBase(255, 16)).toBe('ff'));
  it('formats binary', () => expect(formatInBase(255, 2)).toBe('11111111'));
  it('formats octal', () => expect(formatInBase(255, 8)).toBe('377'));
  it('formats 0', () => expect(formatInBase(0, 16)).toBe('0'));
});

describe('formatBinarySpaced', () => {
  it('formats 8-bit value as 32-bit with spaces', () => {
    const s = formatBinarySpaced(255);
    expect(s).toBe('0000 0000 0000 0000 0000 0000 1111 1111');
  });
  it('formats 0', () => {
    expect(formatBinarySpaced(0)).toBe('0000 0000 0000 0000 0000 0000 0000 0000');
  });
});

describe('toBits / fromBits', () => {
  // Reminder: array index = 31 - bit_position
  // bit 0 (LSB) → index 31
  // bit 7       → index 24
  // bit 8       → index 23
  // bit 31 (MSB)→ index 0

  it('roundtrip for 255 (bits 0-7 set)', () => {
    const bits = toBits(255);
    expect(bits).toHaveLength(32);
    expect(bits[31]).toBe(1);   // bit 0 = LSB
    expect(bits[30]).toBe(1);   // bit 1
    expect(bits[24]).toBe(1);   // bit 7
    expect(bits[23]).toBe(0);   // bit 8 (padding)
    expect(bits[0]).toBe(0);    // bit 31 = MSB
    expect(fromBits(bits)).toBe(255);
  });

  it('roundtrip for 0', () => {
    expect(fromBits(toBits(0))).toBe(0);
  });

  it('roundtrip for max uint32', () => {
    expect(fromBits(toBits(0xFFFFFFFF))).toBe(0xFFFFFFFF);
  });

  it('roundtrip for 1 (only bit 0)', () => {
    const bits = toBits(1);
    expect(bits[31]).toBe(1);   // bit 0 = LSB
    expect(bits[30]).toBe(0);   // bit 1
    expect(bits[0]).toBe(0);    // bit 31 = MSB
    expect(fromBits(bits)).toBe(1);
  });

  it('roundtrip for 256 (bit 8 set)', () => {
    const bits = toBits(256);
    expect(bits[31]).toBe(0);   // bit 0 not set
    expect(bits[23]).toBe(1);   // bit 8 set — this is the fix
    expect(bits[24]).toBe(0);   // bit 7 not set
    expect(fromBits(bits)).toBe(256);
  });
});

describe('toggleBit', () => {
  it('sets a bit', () => expect(toggleBit(0, 0)).toBe(1));
  it('unsets a bit', () => expect(toggleBit(1, 0)).toBe(0));
  it('toggles bit 7', () => expect(toggleBit(0, 7)).toBe(128));
  it('toggles bit 31', () => expect(toggleBit(0, 31)).toBe(2147483648));
  it('ignores invalid index', () => expect(toggleBit(5, -1)).toBe(5));
});

describe('applyOp', () => {
  it('AND', () => expect(applyOp('AND', 12, 10)).toBe(8));
  it('OR',  () => expect(applyOp('OR', 12, 10)).toBe(14));
  it('XOR', () => expect(applyOp('XOR', 12, 10)).toBe(6));
  it('NOT', () => expect(applyOp('NOT', 0)).toBe(0xFFFFFFFF));
  it('LSHIFT', () => expect(applyOp('LSHIFT', 1, 4)).toBe(16));
  it('RSHIFT', () => expect(applyOp('RSHIFT', 16, 4)).toBe(1));
  it('LSHIFT wraps', () => expect(applyOp('LSHIFT', 1, 32)).toBe(1));
  it('throws on unknown', () => expect(() => applyOp('BOGUS', 1, 2)).toThrow());
});

describe('describeNumber', () => {
  it('identifies power of 2', () => {
    const desc = describeNumber(256);
    expect(desc.some(s => s.includes('2^8'))).toBe(true);
  });
  it('identifies printable ASCII', () => {
    const desc = describeNumber(65);
    expect(desc.some(s => s.includes("'A'"))).toBe(true);
  });
  it('identifies byte size', () => {
    const desc = describeNumber(1024);
    expect(desc.some(s => s.includes('KB'))).toBe(true);
  });
});

describe('byteSize', () => {
  it('formats bytes', () => expect(byteSize(500)).toBe('500 B'));
  it('formats KB', () => expect(byteSize(1024)).toBe('1.00 KB'));
  it('formats MB', () => expect(byteSize(1024 * 1024)).toBe('1.00 MB'));
  it('formats GB', () => expect(byteSize(1024 ** 3)).toBe('1.00 GB'));
});