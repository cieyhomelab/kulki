import { describe, expect, it } from 'vitest';
import { BEST_SCORE_KEY, readBestScore, writeBestScore } from '../../../src/storage/best-score.js';

function memoryStorage(/** @type {Record<string, string>} */ initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (/** @type {string} */ key) => data.get(key) ?? null,
    setItem: (/** @type {string} */ key, /** @type {string} */ value) => void data.set(key, value),
  };
}

const throwing = {
  getItem() {
    throw new Error('SecurityError');
  },
  setItem() {
    throw new Error('QuotaExceededError');
  },
};

describe('readBestScore', () => {
  it('reads a stored decimal integer', () => {
    expect(readBestScore(memoryStorage({ [BEST_SCORE_KEY]: '124' }))).toBe(124);
  });

  it('defaults to 0 on first run', () => {
    expect(readBestScore(memoryStorage())).toBe(0);
  });

  it.each(['abc', '', '-5', '1.5', '1e3', ' 12', '12 ', '+7', '0x10', '9007199254740993'])(
    'defaults to 0 for the invalid value %j',
    (value) => {
      expect(readBestScore(memoryStorage({ [BEST_SCORE_KEY]: value }))).toBe(0);
    },
  );

  it('defaults to 0 when storage throws or is unavailable', () => {
    expect(readBestScore(throwing)).toBe(0);
    expect(readBestScore(null)).toBe(0);
  });
});

describe('writeBestScore', () => {
  it('stores the value as a decimal string under the v1 key', () => {
    const storage = memoryStorage();
    expect(writeBestScore(24, storage)).toBe(true);
    expect(storage.data.get('kulki.best.v1')).toBe('24');
  });

  it('ignores a failing write', () => {
    expect(writeBestScore(24, throwing)).toBe(false);
    expect(writeBestScore(24, null)).toBe(false);
  });

  it('rejects values that are not non-negative safe integers', () => {
    for (const bad of [-1, 1.5, Number.NaN, Infinity, 2 ** 53]) {
      expect(() => writeBestScore(bad, memoryStorage())).toThrow(Error);
    }
  });
});
