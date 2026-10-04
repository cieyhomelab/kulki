/**
 * Minimal subset of the Web Storage API used by the game.
 * @typedef {{ getItem(key: string): string | null, setItem(key: string, value: string): void }} StorageLike
 */

/**
 * Returns the browser's `localStorage`, or `null` when it is missing or merely touching it throws
 * (blocked cookies, sandboxed iframe, some private modes).
 * @returns {StorageLike | null}
 */
export function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    // Even reading the `localStorage` property can throw; treat it as unavailable.
    return null;
  }
}

/**
 * Reads one key. Never throws.
 * @param {string} key
 * @param {StorageLike | null} [storage] defaults to `localStorage`; `null` means unavailable
 * @returns {string | null} the stored string, or `null` when there is no value or storage fails
 */
export function readItem(key, storage = getDefaultStorage()) {
  try {
    return storage ? (storage.getItem(key) ?? null) : null;
  } catch {
    // Unavailable or broken storage reads as "no value"; the player is never told.
    return null;
  }
}

/**
 * Writes one key. Never throws.
 * @param {string} key
 * @param {string} value
 * @param {StorageLike | null} [storage] defaults to `localStorage`; `null` means unavailable
 * @returns {boolean} `true` when the value was stored, `false` when the write was ignored
 */
export function writeItem(key, value, storage = getDefaultStorage()) {
  try {
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    // Quota exceeded, private mode or unavailable storage: the write is silently dropped.
    return false;
  }
}
