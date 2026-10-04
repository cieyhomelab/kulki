import { readItem, writeItem } from './safe-storage.js';

const KEY = 'kulki.sound.v1';

/**
 * Reads the sound setting. Anything other than `"on"` or `"off"` means the default: on.
 * @param {import('./safe-storage.js').StorageLike | null} [storage] defaults to `localStorage`
 * @returns {boolean} `true` when sounds are on
 */
export function loadSoundOn(storage) {
  return (storage === undefined ? readItem(KEY) : readItem(KEY, storage)) !== 'off';
}

/**
 * Stores the sound setting. Never throws.
 * @param {boolean} on
 * @param {import('./safe-storage.js').StorageLike | null} [storage] defaults to `localStorage`
 */
export function saveSoundOn(on, storage) {
  const value = on ? 'on' : 'off';
  if (storage === undefined) writeItem(KEY, value);
  else writeItem(KEY, value, storage);
}
