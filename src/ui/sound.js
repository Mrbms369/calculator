// src/ui/sound.js
// Tiny sound engine — generates click sounds with the Web Audio API.
// No audio files needed; we synthesize them.
// Also handles haptic feedback via navigator.vibrate.

let audioCtx = null;
let enabled = true;

/**
 * Lazily create the AudioContext. Must be called from a user gesture
 * on some browsers (Safari, Chrome strict mode).
 */
function getCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  // Browsers suspend the context until a user gesture; resume on first use.
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Enable or disable all sound + haptics.
 */
export function setEnabled(value) {
  enabled = Boolean(value);
}

export function isEnabled() {
  return enabled;
}

/**
 * Play a short "click" tone. Varies by button type.
 * @param {'digit' | 'operator' | 'function' | 'equals' | 'clear' | 'error'} kind
 */
export function playClick(kind = 'digit') {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  // Different pitch/duration per kind
  const config = {
    digit:    { freq: 880,  duration: 0.04, gain: 0.06 },
    operator: { freq: 660,  duration: 0.06, gain: 0.08 },
    function: { freq: 990,  duration: 0.04, gain: 0.06 },
    equals:   { freq: 523,  duration: 0.10, gain: 0.10 },
    clear:    { freq: 440,  duration: 0.06, gain: 0.07 },
    error:    { freq: 220,  duration: 0.20, gain: 0.12 },
  }[kind] || { freq: 880, duration: 0.04, gain: 0.06 };

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = config.freq;

  // Envelope: quick attack, quick decay — sounds like a "tick"
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(config.gain, now + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + config.duration + 0.02);
}

/**
 * Haptic feedback on supported devices (mostly Android).
 * @param {number | number[]} pattern  ms or [on, off, on, ...]
 */
export function haptic(pattern = 10) {
  if (!enabled) return;
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try { navigator.vibrate(pattern); } catch {}
}

/**
 * Combined helper — plays a click sound AND buzzes.
 */
export function feedback(kind) {
  playClick(kind);
  // Vibration pattern tuned per kind
  if (kind === 'equals') haptic([12, 40, 12]);
  else if (kind === 'error') haptic([40, 40, 40]);
  else haptic(8);
}

/**
 * Map a dispatch event to a sound kind.
 */
export function soundForEvent(event) {
  if (!event || !event.type) return 'digit';
  switch (event.type) {
    case 'DIGIT':
    case 'DOT':
      return 'digit';
    case 'OPERATOR':
    case 'SIGN':
    case 'PERCENT':
      return 'operator';
    case 'CLEAR':
    case 'BACKSPACE':
      return 'clear';
    case 'EQUALS':
    case 'EXPRESSION_EVAL':
      return 'equals';
    case 'UNARY':
    case 'CONSTANT':
      return 'function';
    case 'M_PLUS': case 'M_MINUS': case 'MC': case 'MR':
      return 'function';
    default:
      return 'digit';
  }
}