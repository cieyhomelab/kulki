/**
 * @typedef {'move' | 'clear' | 'reject' | 'gameover'} SoundEvent
 * @typedef {{ event: SoundEvent }} SoundLogEntry
 * @typedef {object} Sounds
 * @property {(event: SoundEvent) => void} play requests the sound of an event; no-op when muted
 * @property {() => void} unlock creates the `AudioContext` on a player gesture and resumes it
 * @property {(on: boolean) => void} setOn turns sounds on or off
 * @property {() => boolean} isOn
 * @property {() => SoundLogEntry[]} getLog copy of the registry of requested sounds
 */

/**
 * Minimal view of the Web Audio API used here.
 * @typedef {{ state: string, currentTime: number, destination: unknown, resume(): unknown, createOscillator(): any, createGain(): any }} AudioContextLike
 */

/** Tone shape per event: a sequence of `[frequency Hz, offset s]` notes sharing one envelope. */
const TONES = Object.freeze({
  move: { type: 'sine', notes: [[440, 0]], length: 0.09, peak: 0.12 },
  clear: {
    type: 'triangle',
    notes: [
      [523, 0],
      [659, 0.08],
      [784, 0.16],
    ],
    length: 0.14,
    peak: 0.16,
  },
  reject: { type: 'square', notes: [[140, 0]], length: 0.18, peak: 0.08 },
  gameover: {
    type: 'sawtooth',
    notes: [
      [392, 0],
      [330, 0.2],
      [262, 0.4],
    ],
    length: 0.3,
    peak: 0.1,
  },
});

/** @returns {AudioContextLike | null} */
function createDefaultContext() {
  const Ctor =
    /** @type {any} */ (globalThis).AudioContext ??
    /** @type {any} */ (globalThis).webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

/**
 * Plays the synthesized tone of an event on the given context.
 * @param {AudioContextLike} context
 * @param {SoundEvent} event
 */
function synthesize(context, event) {
  const tone = TONES[event];
  const start = context.currentTime;
  for (const [frequency, offset] of tone.notes) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(tone.peak, start + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + tone.length);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start + offset);
    oscillator.stop(start + offset + tone.length + 0.02);
  }
}

/**
 * Creates the sound module: four synthesized sounds, a mute switch and a registry of requested
 * sounds for tests. The `AudioContext` is created lazily by `unlock`; when it is missing,
 * suspended or throws, nothing is audible and nothing is reported.
 *
 * @param {{ createContext?: () => AudioContextLike | null, on?: boolean }} [options]
 * @returns {Sounds}
 */
export function createSounds({ createContext = createDefaultContext, on = true } = {}) {
  let enabled = on;
  /** @type {AudioContextLike | null} */
  let context = null;
  /** @type {SoundLogEntry[]} */
  const log = [];

  return {
    unlock() {
      try {
        context ??= createContext();
        if (context && context.state === 'suspended') {
          const resumed = /** @type {any} */ (context.resume());
          // A rejected resume (autoplay policy) is ignored; the sound simply stays silent.
          resumed?.catch?.(() => {});
        }
      } catch {
        // No usable audio: sounds stay silent and the game goes on.
        context = null;
      }
    },
    play(event) {
      if (!enabled) return;
      log.push({ event });
      try {
        if (context && context.state === 'running') synthesize(context, event);
      } catch {
        // A failing Web Audio call must never reach the player.
      }
    },
    setOn(value) {
      enabled = value;
    },
    isOn: () => enabled,
    getLog: () => log.map((entry) => ({ ...entry })),
  };
}
