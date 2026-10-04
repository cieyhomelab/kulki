import { readItem, writeItem } from './safe-storage.js';

/** Storage key of the best score; the format is a protected contract (BACKWARD_COMPATIBILITY.md). */
export const BEST_SCORE_KEY = 'kulki.best.v1';

/**
 * Reads the stored best score.
 * @param {import('./safe-storage.js').StorageLike | null} [storage] defaults to `localStorage`
 * @returns {number} the stored value, or `0` when it is missing, invalid or storage fails
 */
export function readBestScore(storage) {
  const raw = storage === undefined ? readItem(BEST_SCORE_KEY) : readItem(BEST_SCORE_KEY, storage);
  if (raw === null || !/^\d+$/.test(raw)) return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : 0;
}

/**
 * Stores the best score. A failing write is ignored.
 * @param {number} score non-negative safe integer
 * @param {import('./safe-storage.js').StorageLike | null} [storage] defaults to `localStorage`
 * @returns {boolean} whether the value was stored
 * @throws {Error} when `score` is not a non-negative safe integer
 */
export function writeBestScore(score, storage) {
  if (!Number.isSafeInteger(score) || score < 0) {
    throw new Error(`best score must be a non-negative safe integer, got ${score}`);
  }
  return storage === undefined
    ? writeItem(BEST_SCORE_KEY, String(score))
    : writeItem(BEST_SCORE_KEY, String(score), storage);
}
