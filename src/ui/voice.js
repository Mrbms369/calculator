// src/ui/voice.js
// Voice input using the Web Speech API.
// Uses the bilingual parser (English + Swahili).

import { parseSpoken } from '../engine/voiceParser.js';
import { evaluate } from '../engine/expression.js';
import { speechLocale, getLanguage } from '../engine/voiceNumbers.js';

// ─── Speech recognition ────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function isVoiceSupported() {
  return Boolean(SpeechRecognition);
}

/**
 * Start listening. Returns the transcript or null.
 * @param {object} [opts]
 * @param {string} [opts.langKey]  'en' | 'sw'  — the language to listen in
 * @returns {Promise<string|null>}
 */
export function listenOnce(opts = {}) {
  const langKey = opts.langKey || 'en';
  const locale = speechLocale(langKey);

  return new Promise((resolve, reject) => {
    if (!SpeechRecognition) {
      reject(new Error('SpeechRecognition not supported'));
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = locale;
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;

    let resolved = false;

    recog.onresult = (e) => {
      resolved = true;
      const text = e.results[0][0].transcript;
      resolve(text);
    };
    recog.onerror = (e) => {
      resolved = true;
      reject(new Error(e.error || 'recognition failed'));
    };
    recog.onend = () => {
      if (!resolved) resolve(null);
    };

    try { recog.start(); } catch (err) { reject(err); }
  });
}

// ─── Voice → math (uses the bilingual parser + expression engine) ──────
/**
 * Take a spoken phrase and produce { expression, result, speakText } or null.
 * @param {string} transcript
 * @param {string} langKey  'en' | 'sw'
 * @returns {{ expression: string, result: number, speakText: string } | null}
 */
export function parseSpokenExpression(transcript, langKey = 'en') {
  if (!transcript) return null;

  const parsed = parseSpoken(transcript, langKey);
  if (!parsed || !parsed.expression) return null;

  try {
    const result = evaluate(parsed.expression);
    if (!Number.isFinite(result)) return null;

    const speech = buildSpeech(parsed.expression, result, langKey);
    return {
      expression: parsed.expression,
      result,
      speakText: speech,
    };
  } catch (err) {
    console.warn('Voice parse error:', err.message, '| expression:', parsed.expression);
    return null;
  }
}

/**
 * Build a natural speech phrase for the result.
 */
function buildSpeech(expression, result, langKey) {
  if (langKey === 'sw') {
    return `${expression} ni ${result}`;
  }
  return `${expression} equals ${result}`;
}

// ─── Text-to-speech ────────────────────────────────────────────────────
/**
 * Speak some text.
 * @param {string} text
 * @param {object} [opts]
 * @param {string} [opts.langKey]  'en' | 'sw'
 */
export function speak(text, opts = {}) {
  if (!('speechSynthesis' in window)) return;
  const langKey = opts.langKey || 'en';
  const locale = speechLocale(langKey);

  const utter = new SpeechSynthesisUtterance(String(text));
  utter.lang = locale;
  utter.rate = 1.05;
  utter.pitch = 1;

  // Try to pick a matching voice if one is available
  const voices = window.speechSynthesis.getVoices();
  const matching = voices.find(v => v.lang.startsWith(locale.split('-')[0]));
  if (matching) utter.voice = matching;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ─── Convenience helpers ───────────────────────────────────────────────
export function languageLabel(key) {
  return getLanguage(key).label;
}