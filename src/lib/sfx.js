/**
 * Sound is synthesised with the Web Audio API instead of loading files, so the
 * build stays a single bundle and nothing can 404 after it is uploaded.
 *
 * iOS Safari keeps the context suspended until a real user gesture, which is
 * why `unlock()` has to be called from a pointer or key handler.
 */

let context = null;
let muted = false;

function ensureContext() {
  if (context) return context;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  context = new AudioContextClass();
  return context;
}

/** Resumes audio. Must run inside a user gesture for iOS to allow sound. */
export function unlock() {
  const ctx = ensureContext();
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return Boolean(ctx);
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

/** One short oscillator note. */
function tone({ freq, duration = 0.08, type = 'square', volume = 0.12, slideTo = null, delay = 0 }) {
  const ctx = ensureContext();
  if (!ctx || muted) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);

  // A quick attack and a smooth tail keeps the blips from clicking.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Plays a sequence of notes as a short melody. */
function melody(notes, { type = 'square', volume = 0.1, gap = 0.1 } = {}) {
  notes.forEach((freq, index) => {
    tone({ freq, duration: gap * 0.9, type, volume, delay: index * gap });
  });
}

export const sfx = {
  blip: () => tone({ freq: 620, duration: 0.03, volume: 0.05, type: 'square' }),
  step: () => tone({ freq: 170, duration: 0.04, volume: 0.04, type: 'triangle' }),
  select: () => tone({ freq: 520, duration: 0.07, slideTo: 780, volume: 0.1 }),
  memory: () => melody([523, 659, 784], { gap: 0.09, volume: 0.09 }),
  denied: () => tone({ freq: 200, duration: 0.12, slideTo: 120, volume: 0.09, type: 'sawtooth' }),
  unlock: () => melody([392, 523, 659, 784, 1047], { gap: 0.11, volume: 0.1, type: 'triangle' }),
  reveal: () => melody([523, 587, 659, 784, 880, 1047], { gap: 0.16, volume: 0.09, type: 'triangle' }),
  heart: () => tone({ freq: 880, duration: 0.09, slideTo: 1320, volume: 0.07, type: 'sine' }),
};
