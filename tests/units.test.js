import { describe, it, expect } from 'vitest';
import { convert, listCategories, listUnits, formatNumber } from '../src/engine/units.js';

describe('convert — length', () => {
  it('1 km = 1000 m', () => expect(convert('length', 'km', 'm', 1)).toBe(1000));
  it('100 cm = 1 m', () => expect(convert('length', 'cm', 'm', 100)).toBe(1));
  it('1 mi ≈ 1609.344 m', () => expect(convert('length', 'mi', 'm', 1)).toBeCloseTo(1609.344, 6));
  it('1 m = 0 ft (round-trip)', () => {
    const ft = convert('length', 'm', 'ft', 1);
    expect(convert('length', 'ft', 'm', ft)).toBeCloseTo(1, 10);
  });
  it('same unit is identity', () => expect(convert('length', 'm', 'm', 42)).toBe(42));
});

describe('convert — mass', () => {
  it('1 kg = 1000 g', () => expect(convert('mass', 'kg', 'g', 1)).toBe(1000));
  it('1 lb ≈ 0.4536 kg', () => expect(convert('mass', 'lb', 'kg', 1)).toBeCloseTo(0.45359237, 8));
  it('16 oz ≈ 1 lb', () => {
    const oz = convert('mass', 'lb', 'oz', 1);
    expect(oz).toBeCloseTo(16, 6);
  });
});

describe('convert — temperature', () => {
  it('0°C = 32°F', () => expect(convert('temperature', 'C', 'F', 0)).toBeCloseTo(32, 10));
  it('100°C = 212°F', () => expect(convert('temperature', 'C', 'F', 100)).toBeCloseTo(212, 10));
  it('0°C = 273.15 K', () => expect(convert('temperature', 'C', 'K', 0)).toBeCloseTo(273.15, 10));
  it('32°F = 0°C', () => expect(convert('temperature', 'F', 'C', 32)).toBeCloseTo(0, 10));
  it('-40°C = -40°F', () => expect(convert('temperature', 'C', 'F', -40)).toBeCloseTo(-40, 10));
  it('0 K ≈ -273.15°C', () => expect(convert('temperature', 'K', 'C', 0)).toBeCloseTo(-273.15, 10));
});

describe('convert — volume', () => {
  it('1 L = 1000 mL', () => expect(convert('volume', 'L', 'mL', 1)).toBe(1000));
  it('1 gal ≈ 3.785 L', () => expect(convert('volume', 'gal', 'L', 1)).toBeCloseTo(3.785411784, 8));
});

describe('convert — area', () => {
  it('1 km² = 1,000,000 m²', () => expect(convert('area', 'km2', 'm2', 1)).toBe(1000000));
  it('1 ha = 10,000 m²', () => expect(convert('area', 'ha', 'm2', 1)).toBe(10000));
});

describe('convert — speed', () => {
  it('1 m/s = 3.6 km/h', () => expect(convert('speed', 'ms', 'kmh', 1)).toBeCloseTo(3.6, 10));
  it('1 mph ≈ 1.609 km/h', () => expect(convert('speed', 'mph', 'kmh', 1)).toBeCloseTo(1.609344, 6));
});

describe('convert — time', () => {
  it('1 h = 3600 s', () => expect(convert('time', 'h', 's', 1)).toBe(3600));
  it('1 d = 24 h', () => expect(convert('time', 'd', 'h', 1)).toBe(24));
  it('1 wk = 7 d', () => expect(convert('time', 'wk', 'd', 1)).toBe(7));
});

describe('convert — data', () => {
  it('1 KB = 1000 B', () => expect(convert('data', 'KB', 'B', 1)).toBe(1000));
  it('1 KiB = 1024 B', () => expect(convert('data', 'KiB', 'B', 1)).toBe(1024));
  it('1 MiB = 1,048,576 B', () => expect(convert('data', 'MiB', 'B', 1)).toBe(1048576));
});

describe('convert — errors', () => {
  it('rejects unknown category', () => {
    expect(() => convert('nope', 'm', 'ft', 1)).toThrow(/Unknown category/);
  });
  it('rejects unknown unit', () => {
    expect(() => convert('length', 'bogus', 'm', 1)).toThrow(/Unknown unit/);
  });
  it('rejects non-finite value', () => {
    expect(() => convert('length', 'm', 'ft', NaN)).toThrow(/finite/);
  });
});

describe('listCategories and listUnits', () => {
  it('lists all categories', () => {
    const cats = listCategories();
    expect(cats).toContain('length');
    expect(cats).toContain('mass');
    expect(cats).toContain('temperature');
    expect(cats).toContain('volume');
    expect(cats).toContain('area');
    expect(cats).toContain('speed');
    expect(cats).toContain('time');
    expect(cats).toContain('data');
  });
  it('lists all length units', () => {
    const units = listUnits('length');
    expect(units).toContain('m');
    expect(units).toContain('km');
    expect(units).toContain('mi');
  });
  it('unknown category returns empty list', () => {
    expect(listUnits('bogus')).toEqual([]);
  });
});

describe('formatNumber', () => {
  it('formats integers', () => expect(formatNumber(100)).toBe('100'));
  it('formats decimals', () => expect(formatNumber(3.14)).toBe('3.14'));
  it('formats zero', () => expect(formatNumber(0)).toBe('0'));
  it('handles very small numbers', () => {
    expect(formatNumber(1e-9)).toMatch(/e-9/);
  });
  it('handles very large numbers', () => {
    expect(formatNumber(1e20)).toMatch(/e\+20/);
  });
  it('handles NaN', () => expect(formatNumber(NaN)).toBe('—'));
});