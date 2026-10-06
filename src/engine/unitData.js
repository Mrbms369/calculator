// src/engine/unitData.js
// Conversion factors and unit definitions.
// All non-temperature units convert via a factor to a base unit
// (meter, gram, liter, m², m/s, second, byte).

export const CATEGORIES = {
  length: {
    label: 'Length',
    base: 'm',
    units: {
      m:   { label: 'Meter',        factor: 1 },
      km:  { label: 'Kilometer',    factor: 1000 },
      cm:  { label: 'Centimeter',   factor: 0.01 },
      mm:  { label: 'Millimeter',   factor: 0.001 },
      mi:  { label: 'Mile',         factor: 1609.344 },
      yd:  { label: 'Yard',         factor: 0.9144 },
      ft:  { label: 'Foot',         factor: 0.3048 },
      in:  { label: 'Inch',         factor: 0.0254 },
      nmi: { label: 'Nautical mile',factor: 1852 },
    },
  },
  mass: {
    label: 'Mass',
    base: 'kg',
    units: {
      kg:  { label: 'Kilogram',  factor: 1 },
      g:   { label: 'Gram',      factor: 0.001 },
      mg:  { label: 'Milligram', factor: 1e-6 },
      t:   { label: 'Metric ton',factor: 1000 },
      lb:  { label: 'Pound',     factor: 0.45359237 },
      oz:  { label: 'Ounce',     factor: 0.028349523125 },
      st:  { label: 'Stone',     factor: 6.35029318 },
    },
  },
  temperature: {
    label: 'Temperature',
    base: 'C',
    isTemperature: true,
    units: {
      C: { label: 'Celsius' },
      F: { label: 'Fahrenheit' },
      K: { label: 'Kelvin' },
    },
  },
  volume: {
    label: 'Volume',
    base: 'L',
    units: {
      L:    { label: 'Liter',           factor: 1 },
      mL:   { label: 'Milliliter',      factor: 0.001 },
      m3:   { label: 'Cubic meter',     factor: 1000 },
      gal:  { label: 'Gallon (US)',     factor: 3.785411784 },
      qt:   { label: 'Quart (US)',      factor: 0.946352946 },
      pt:   { label: 'Pint (US)',       factor: 0.473176473 },
      floz: { label: 'Fluid ounce (US)',factor: 0.0295735295625 },
      cup:  { label: 'Cup (US)',        factor: 0.2365882365 },
    },
  },
  area: {
    label: 'Area',
    base: 'm2',
    units: {
      m2:  { label: 'Square meter',   factor: 1 },
      km2: { label: 'Square kilometer',factor: 1e6 },
      cm2: { label: 'Square centimeter',factor: 0.0001 },
      ha:  { label: 'Hectare',        factor: 10000 },
      acre:{ label: 'Acre',           factor: 4046.8564224 },
      ft2: { label: 'Square foot',    factor: 0.09290304 },
      in2: { label: 'Square inch',    factor: 0.00064516 },
      mi2: { label: 'Square mile',    factor: 2589988.110336 },
    },
  },
  speed: {
    label: 'Speed',
    base: 'ms',
    units: {
      ms:  { label: 'Meter/second',   factor: 1 },
      kmh: { label: 'Kilometer/hour', factor: 1 / 3.6 },
      mph: { label: 'Mile/hour',      factor: 0.44704 },
      kn:  { label: 'Knot',           factor: 0.514444 },
      fts: { label: 'Foot/second',    factor: 0.3048 },
    },
  },
  time: {
    label: 'Time',
    base: 's',
    units: {
      s:   { label: 'Second',      factor: 1 },
      min: { label: 'Minute',      factor: 60 },
      h:   { label: 'Hour',        factor: 3600 },
      d:   { label: 'Day',         factor: 86400 },
      wk:  { label: 'Week',        factor: 604800 },
      mo:  { label: 'Month (30d)', factor: 2592000 },
      yr:  { label: 'Year (365d)', factor: 31536000 },
    },
  },
  data: {
    label: 'Data',
    base: 'B',
    units: {
      B:   { label: 'Byte',       factor: 1 },
      KB:  { label: 'Kilobyte',   factor: 1000 },
      MB:  { label: 'Megabyte',   factor: 1e6 },
      GB:  { label: 'Gigabyte',   factor: 1e9 },
      TB:  { label: 'Terabyte',   factor: 1e12 },
      KiB: { label: 'Kibibyte',   factor: 1024 },
      MiB: { label: 'Mebibyte',   factor: 1024 ** 2 },
      GiB: { label: 'Gibibyte',   factor: 1024 ** 3 },
      TiB: { label: 'Tebibyte',   factor: 1024 ** 4 },
    },
  },
};