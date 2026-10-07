// src/engine/voiceNumbers.js
// Language-specific word tables for the voice parser.
// Each language maps spoken words to numeric values or operators.

// ─── English ────────────────────────────────────────────────────────────
const ENGLISH_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4,
  five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100,
  thousand: 1000,
  million: 1000000,
  billion: 1000000000,
};

const ENGLISH_OPERATORS = [
  { phrases: ['multiplied by', 'multiply by', 'multiplied', 'times'], op: '*' },
  { phrases: ['divided by', 'divide by', 'divided', 'over'], op: '/' },
  { phrases: ['plus', 'add', 'and'], op: '+' },
  { phrases: ['minus', 'subtract', 'less'], op: '-' },
  { phrases: ['open paren', 'open parenthesis', 'left paren'], op: '(' },
  { phrases: ['close paren', 'close parenthesis', 'right paren'], op: ')' },
];

const ENGLISH_UNARY = [
  { phrases: ['square root of', 'square root', 'root of'], op: '√' },
];

const ENGLISH_EQUALS = ['equals', 'equal', 'is', 'makes', 'gives', 'the result is'];

// ─── Swahili ────────────────────────────────────────────────────────────
const SWAHILI_NUMBERS = {
  sifuri: 0,
  moja: 1, mmoja: 1,
  mbili: 2, wawili: 2,
  tatu: 3, watatu: 3,
  nne: 4, wanne: 4,
  tano: 5, watano: 5,
  sita: 6, wasita: 6,
  saba: 7, wasaba: 7,
  nane: 8, wanane: 8,
  tisa: 9, tisia: 9,
  kumi: 10,
  ishirini: 20,
  thelathini: 30,
  arobaini: 40,
  hamsini: 50,
  sitini: 60,
  sabini: 70,
  themanini: 80,
  tisini: 90,
  mia: 100,
  elfu: 1000,
  milioni: 1000000,
  bilioni: 1000000000,
};

const SWAHILI_OPERATORS = [
  // Multi-word phrases first (longer matches take priority)
  { phrases: ['gawanya kwa', 'gawanya na'], op: '/' },
  { phrases: ['zidisha kwa', 'zidisha na'], op: '*' },

  // Single words — must come AFTER multi-word to avoid greedy capture
  { phrases: ['zidisha'], op: '*' },
  { phrases: ['mara'], op: '*' },
  { phrases: ['gawanya'], op: '/' },
  { phrases: ['toa', 'punguza'], op: '-' },
  { phrases: ['ongeza', 'jumlisha'], op: '+' },

  // Parens
  { phrases: ['funga mabano', 'funga'], op: ')' },
  { phrases: ['fungua mabano', 'fungua'], op: '(' },
];

const SWAHILI_UNARY = [
  { phrases: ['mzizi wa', 'mzizi'], op: '√' },
];

const SWAHILI_EQUALS = ['ni', 'sawa na', 'sawa', 'inatupa', 'inaleta'];

// ─── Language registry ──────────────────────────────────────────────────
export const LANGUAGES = {
  en: {
    code: 'en-US',
    label: 'English',
    flag: '🇬🇧',
    numbers: ENGLISH_NUMBERS,
    operators: ENGLISH_OPERATORS,
    unary: ENGLISH_UNARY,
    equals: ENGLISH_EQUALS,
    numberJoiners: [],
    // English: "one hundred" — digit comes BEFORE the multiplier
    multiplierFirst: false,
  },
  sw: {
    code: 'sw-KE',
    label: 'Kiswahili',
    flag: '🇹🇿',
    numbers: SWAHILI_NUMBERS,
    operators: SWAHILI_OPERATORS,
    unary: SWAHILI_UNARY,
    equals: SWAHILI_EQUALS,
    numberJoiners: ['na'],
    // Swahili: "mia moja" — multiplier comes BEFORE the digit
    multiplierFirst: true,
  },
};

export const DEFAULT_LANGUAGE = 'en';

export function getLanguage(key) {
  return LANGUAGES[key] || LANGUAGES[DEFAULT_LANGUAGE];
}

export function speechLocale(key) {
  return getLanguage(key).code;
}

export function listLanguages() {
  return Object.keys(LANGUAGES);
}