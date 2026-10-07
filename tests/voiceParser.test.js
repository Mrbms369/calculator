import { describe, it, expect } from 'vitest';
import { parseSpoken } from '../src/engine/voiceParser.js';
import { LANGUAGES, listLanguages, speechLocale, getLanguage } from '../src/engine/voiceNumbers.js';

// Helper: parse and return just the expression string
const p = (text, lang) => parseSpoken(text, lang)?.expression ?? null;

describe('voiceNumbers — registry', () => {
  it('has English and Swahili', () => {
    expect(listLanguages()).toEqual(['en', 'sw']);
  });
  it('English locale is en-US', () => {
    expect(speechLocale('en')).toBe('en-US');
  });
  it('Swahili locale is sw-KE', () => {
    expect(speechLocale('sw')).toBe('sw-KE');
  });
  it('unknown language falls back to English', () => {
    expect(getLanguage('xx').code).toBe('en-US');
  });
  it('every language has required fields', () => {
    for (const key of listLanguages()) {
      const l = LANGUAGES[key];
      expect(l.code).toBeTruthy();
      expect(l.label).toBeTruthy();
      expect(l.numbers).toBeTruthy();
      expect(Array.isArray(l.operators)).toBe(true);
      expect(Array.isArray(l.unary)).toBe(true);
      expect(Array.isArray(l.equals)).toBe(true);
    }
  });
});

describe('parseSpoken — English basics', () => {
  it('one plus two', () => expect(p('one plus two', 'en')).toBe('1 + 2'));
  it('two times three', () => expect(p('two times three', 'en')).toBe('2 * 3'));
  it('ten minus four', () => expect(p('ten minus four', 'en')).toBe('10 - 4'));
  it('twenty divided by five', () => expect(p('twenty divided by five', 'en')).toBe('20 / 5'));
  it('compound number: twenty three', () => {
    expect(p('twenty three plus forty two', 'en')).toBe('23 + 42');
  });
  it('one hundred', () => expect(p('one hundred minus fifty', 'en')).toBe('100 - 50'));
  it('three thousand five hundred', () => {
    expect(p('three thousand five hundred', 'en')).toBe('3500');
  });
  it('four hundred twenty', () => {
    expect(p('four hundred twenty', 'en')).toBe('420');
  });
  it('digit + word mixed', () => {
    expect(p('7 plus three', 'en')).toBe('7 + 3');
  });
  it('equals words are dropped', () => {
    expect(p('two plus two equals', 'en')).toBe('2 + 2');
  });
  it('square root of nine', () => {
    expect(p('square root of nine', 'en')).toBe('√9');
  });
});

describe('parseSpoken — Swahili basics', () => {
  it('moja ongeza mbili', () => expect(p('moja ongeza mbili', 'sw')).toBe('1 + 2'));
  it('mbili mara tatu', () => expect(p('mbili mara tatu', 'sw')).toBe('2 * 3'));
  it('kumi toa nne', () => expect(p('kumi toa nne', 'sw')).toBe('10 - 4'));
  it('ishirini gawanya kwa tano', () => {
    expect(p('ishirini gawanya kwa tano', 'sw')).toBe('20 / 5');
  });
  it('zidisha as operator', () => {
    expect(p('saba zidisha nane', 'sw')).toBe('7 * 8');
  });
  it('gawanya without kwa', () => {
    expect(p('tisa gawanya tatu', 'sw')).toBe('9 / 3');
  });
});

describe('parseSpoken — Swahili compound numbers', () => {
  it('kumi na tano = 15', () => {
    expect(p('kumi na tano ongeza moja', 'sw')).toBe('15 + 1');
  });
  it('ishirini na tatu = 23', () => {
    expect(p('ishirini na tatu', 'sw')).toBe('23');
  });
  it('arobaini na mbili = 42', () => {
    expect(p('arobaini na mbili zidisha mbili', 'sw')).toBe('42 * 2');
  });
  it('mia moja = 100', () => {
    expect(p('mia moja toa hamsini', 'sw')).toBe('100 - 50');
  });
  it('mia mbili = 200', () => {
    expect(p('mia mbili', 'sw')).toBe('200');
  });
  it('elfu moja = 1000', () => {
    expect(p('elfu moja', 'sw')).toBe('1000');
  });
  it('elfu mbili mia tatu = 2300', () => {
    expect(p('elfu mbili mia tatu', 'sw')).toBe('2300');
  });
  it('mia mbili ishirini na tano = 225', () => {
    expect(p('mia mbili ishirini na tano', 'sw')).toBe('225');
  });
  it('elfu tano mia mbili sitini = 5260', () => {
    expect(p('elfu tano mia mbili sitini', 'sw')).toBe('5260');
  });
});

describe('parseSpoken — Swahili equals words', () => {
  it('ni is dropped', () => {
    expect(p('mbili ongeza mbili ni', 'sw')).toBe('2 + 2');
  });
  it('sawa na is dropped', () => {
    expect(p('tano toa moja sawa na', 'sw')).toBe('5 - 1');
  });
});

describe('parseSpoken — edge cases', () => {
  it('null on empty string', () => expect(parseSpoken('', 'en')).toBeNull());
  it('null on non-string', () => expect(parseSpoken(null, 'en')).toBeNull());
  it('null on pure words (no math)', () => {
    expect(parseSpoken('hello world', 'en')).toBeNull();
  });
  it('null on Swahili non-math', () => {
    expect(parseSpoken('habari yako', 'sw')).toBeNull();
  });
  it('unknown language falls back to English behaviour', () => {
    expect(p('one plus one', 'xx')).toBe('1 + 1');
  });
  it('handles extra whitespace', () => {
    expect(p('  moja   ongeza   mbili  ', 'sw')).toBe('1 + 2');
  });
  it('digits pass through untouched', () => {
    expect(p('5 + 3', 'en')).toBe('5 + 3');
    expect(p('5 + 3', 'sw')).toBe('5 + 3');
  });
});