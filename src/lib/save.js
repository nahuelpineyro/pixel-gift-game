/**
 * Progress lives in localStorage. Every read is defensive: a private-mode
 * browser or a cleared storage must never stop the game from starting.
 */

const KEY = 'pixel-gift-save-v1';

const EMPTY = { found: [], finished: false };

/** Reads saved progress, falling back to a fresh run on any problem. */
export function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };

    const parsed = JSON.parse(raw);
    return {
      found: Array.isArray(parsed.found) ? parsed.found : [],
      finished: Boolean(parsed.finished),
    };
  } catch {
    return { ...EMPTY };
  }
}

/** Persists progress. Failures are ignored on purpose. */
export function save(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — the game still plays, it just will not resume.
  }
}

/** Wipes progress so the game can be played again from the start. */
export function reset() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}
