import { describe, expect, it, vi } from 'vitest';
import { createMotion } from '../../../src/ui/motion.js';

/** @param {boolean} matches */
function fakeWindow(matches) {
  /** @type {Array<() => void>} */
  const listeners = [];
  const query = {
    matches,
    addEventListener: (/** @type {string} */ _type, /** @type {() => void} */ l) => {
      listeners.push(l);
    },
  };
  const matchMedia = vi.fn(() => query);
  return {
    win: /** @type {any} */ ({ matchMedia }),
    matchMedia,
    change(/** @type {boolean} */ value) {
      query.matches = value;
      listeners.forEach((l) => l());
    },
  };
}

describe('createMotion', () => {
  it('asks for the reduced-motion media query', () => {
    const fake = fakeWindow(true);
    createMotion(fake.win);
    expect(fake.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('reports the current preference', () => {
    expect(createMotion(fakeWindow(true).win).isReduced()).toBe(true);
    expect(createMotion(fakeWindow(false).win).isReduced()).toBe(false);
  });

  it('treats missing matchMedia as unrestricted motion', () => {
    const motion = createMotion(/** @type {any} */ ({}));
    expect(motion.isReduced()).toBe(false);
    expect(() => motion.onChange(() => {})).not.toThrow();
  });

  it('treats a throwing matchMedia as unrestricted motion', () => {
    const motion = createMotion(
      /** @type {any} */ ({
        matchMedia() {
          throw new Error('blocked');
        },
      }),
    );
    expect(motion.isReduced()).toBe(false);
  });

  it('notifies listeners when the preference changes', () => {
    const fake = fakeWindow(false);
    const motion = createMotion(fake.win);
    const listener = vi.fn();
    motion.onChange(listener);
    fake.change(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(motion.isReduced()).toBe(true);
  });
});
