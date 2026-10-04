import { describe, expect, it } from 'vitest';
import { loadSoundOn, saveSoundOn } from '../../../src/storage/sound-setting.js';

/** @param {Record<string, string>} [data] */
const memory = (data = {}) => ({
  getItem: (/** @type {string} */ k) => data[k] ?? null,
  setItem: (/** @type {string} */ k, /** @type {string} */ v) => {
    data[k] = v;
  },
});

describe('sound setting', () => {
  it('defaults to on when nothing is stored', () => {
    expect(loadSoundOn(memory())).toBe(true);
  });

  it('reads "on" and "off"', () => {
    expect(loadSoundOn(memory({ 'kulki.sound.v1': 'on' }))).toBe(true);
    expect(loadSoundOn(memory({ 'kulki.sound.v1': 'off' }))).toBe(false);
  });

  it.each(['', 'ON', 'true', '0', '{"a":1}'])('treats invalid value %j as on', (value) => {
    expect(loadSoundOn(memory({ 'kulki.sound.v1': value }))).toBe(true);
  });

  it('round-trips through storage under kulki.sound.v1', () => {
    const data = {};
    const storage = memory(data);
    saveSoundOn(false, storage);
    expect(data).toEqual({ 'kulki.sound.v1': 'off' });
    expect(loadSoundOn(storage)).toBe(false);
    saveSoundOn(true, storage);
    expect(data).toEqual({ 'kulki.sound.v1': 'on' });
  });

  it('falls back to on and does not throw when storage is unavailable or broken', () => {
    expect(loadSoundOn(null)).toBe(true);
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadSoundOn(broken)).toBe(true);
    expect(() => saveSoundOn(false, broken)).not.toThrow();
    expect(() => saveSoundOn(false, null)).not.toThrow();
  });
});
