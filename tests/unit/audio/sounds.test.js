import { describe, expect, it } from 'vitest';
import { createSounds } from '../../../src/audio/sounds.js';

/** Fake AudioContext counting the oscillators it was asked to start. */
function fakeContext(state = 'running') {
  const context = {
    state,
    currentTime: 0,
    destination: {},
    started: 0,
    resumed: 0,
    resume() {
      context.resumed += 1;
      context.state = 'running';
      return Promise.resolve();
    },
    createGain: () => ({
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() {},
    }),
    createOscillator: () => ({
      frequency: { value: 0 },
      connect() {},
      start() {
        context.started += 1;
      },
      stop() {},
    }),
  };
  return context;
}

describe('createSounds', () => {
  it('logs events in order and synthesizes them once unlocked', () => {
    const context = fakeContext();
    const sounds = createSounds({ createContext: () => context });
    sounds.unlock();
    for (const event of /** @type {const} */ (['move', 'clear', 'reject', 'gameover'])) {
      sounds.play(event);
    }
    expect(sounds.getLog().map((e) => e.event)).toEqual(['move', 'clear', 'reject', 'gameover']);
    expect(context.started).toBeGreaterThanOrEqual(4);
  });

  it('creates the context lazily, only on unlock', () => {
    let created = 0;
    const sounds = createSounds({
      createContext: () => {
        created += 1;
        return fakeContext();
      },
    });
    sounds.play('move');
    expect(created).toBe(0);
    sounds.unlock();
    sounds.unlock();
    expect(created).toBe(1);
  });

  it('resumes a suspended context on unlock', () => {
    const context = fakeContext('suspended');
    createSounds({ createContext: () => context }).unlock();
    expect(context.resumed).toBe(1);
  });

  it('logs but stays silent when the context is suspended or missing', () => {
    const suspended = fakeContext('suspended');
    suspended.resume = () => Promise.reject(new Error('blocked'));
    const a = createSounds({ createContext: () => suspended });
    a.unlock();
    a.play('move');
    expect(a.getLog()).toEqual([{ event: 'move' }]);
    expect(suspended.started).toBe(0);

    const b = createSounds({ createContext: () => null });
    b.unlock();
    expect(() => b.play('clear')).not.toThrow();
    expect(b.getLog()).toEqual([{ event: 'clear' }]);
  });

  it('survives a throwing context factory and throwing oscillators', () => {
    const a = createSounds({
      createContext: () => {
        throw new Error('no audio');
      },
    });
    expect(() => a.unlock()).not.toThrow();
    expect(() => a.play('reject')).not.toThrow();

    const context = fakeContext();
    context.createOscillator = () => {
      throw new Error('boom');
    };
    const b = createSounds({ createContext: () => context });
    b.unlock();
    expect(() => b.play('move')).not.toThrow();
    expect(b.getLog()).toHaveLength(1);
  });

  it('adds nothing to the log while muted and resumes logging when turned on', () => {
    const context = fakeContext();
    const sounds = createSounds({ createContext: () => context });
    sounds.unlock();
    sounds.setOn(false);
    sounds.play('move');
    expect(sounds.getLog()).toEqual([]);
    expect(context.started).toBe(0);
    sounds.setOn(true);
    sounds.play('move');
    expect(sounds.getLog()).toEqual([{ event: 'move' }]);
  });

  it('starts muted when asked and returns a copy of the log', () => {
    const sounds = createSounds({ createContext: () => null, on: false });
    expect(sounds.isOn()).toBe(false);
    sounds.setOn(true);
    sounds.play('move');
    sounds.getLog().push({ event: 'clear' });
    expect(sounds.getLog()).toHaveLength(1);
  });
});
