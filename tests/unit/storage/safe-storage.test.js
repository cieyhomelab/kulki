import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDefaultStorage, readItem, writeItem } from '../../../src/storage/safe-storage.js';

function memoryStorage() {
  /** @type {Map<string, string>} */
  const data = new Map();
  return {
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

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(globalThis, 'localStorage');
});

describe('safe storage with a working store', () => {
  it('returns the written value when read back', () => {
    const storage = memoryStorage();

    expect(writeItem('k', 'v', storage)).toBe(true);
    expect(readItem('k', storage)).toBe('v');
  });

  it('returns null for a missing key without throwing', () => {
    expect(readItem('missing', memoryStorage())).toBeNull();
  });
});

describe('safe storage with a throwing store', () => {
  it('reads as null instead of throwing', () => {
    expect(() => readItem('k', throwing)).not.toThrow();
    expect(readItem('k', throwing)).toBeNull();
  });

  it('ignores the write instead of throwing', () => {
    expect(() => writeItem('k', 'v', throwing)).not.toThrow();
    expect(writeItem('k', 'v', throwing)).toBe(false);
  });
});

describe('safe storage when localStorage itself is unavailable', () => {
  it('behaves as unavailable for an explicit null store', () => {
    expect(readItem('k', null)).toBeNull();
    expect(writeItem('k', 'v', null)).toBe(false);
  });

  it('behaves as unavailable when the localStorage global is missing', () => {
    vi.stubGlobal('localStorage', undefined);

    expect(getDefaultStorage()).toBeNull();
    expect(readItem('k')).toBeNull();
    expect(writeItem('k', 'v')).toBe(false);
  });

  it('behaves as unavailable when touching localStorage throws', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });

    expect(() => readItem('k')).not.toThrow();
    expect(readItem('k')).toBeNull();
    expect(writeItem('k', 'v')).toBe(false);
  });
});

describe('safe storage default store', () => {
  it('uses the global localStorage when no store is given', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);

    expect(writeItem('k', 'v')).toBe(true);
    expect(readItem('k')).toBe('v');
  });
});
