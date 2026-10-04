import { COLOR_COUNT } from './constants.js';
import { emptyCells } from './board.js';

/** @typedef {() => number} Rng a function returning a number in [0, 1) */

/** @returns {Rng} the default generator, backed by `Math.random` */
export function createDefaultRng() {
  return () => Math.random();
}

/**
 * mulberry32: a small deterministic generator.
 * @param {number} seed integer
 * @returns {Rng}
 */
export function createSeededRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Serves the given values in order, then falls back to another generator.
 * @param {readonly number[]} queue values in [0, 1)
 * @param {Rng} fallback
 * @returns {Rng}
 */
export function createQueuedRng(queue, fallback) {
  const pending = queue.slice();
  let position = 0;
  return () => (position < pending.length ? pending[position++] : fallback());
}

/**
 * A replaceable randomness source: the game keeps calling `rng`, tests swap what is behind it.
 * @returns {{ rng: Rng, configure(options: { queue?: unknown, seed?: unknown }): void }}
 */
export function createRandomSource() {
  let current = createDefaultRng();
  return {
    rng: () => current(),
    configure({ queue, seed } = {}) {
      if (queue !== undefined) {
        if (!Array.isArray(queue) || !queue.every(isUnitInterval)) {
          throw new TypeError('queue must be an array of numbers in [0, 1)');
        }
      }
      if (seed !== undefined && !Number.isInteger(seed)) {
        throw new TypeError('seed must be an integer');
      }
      const fallback = createSeededRng(/** @type {number} */ (seed ?? 1));
      current = createQueuedRng(/** @type {number[]} */ (queue ?? []), fallback);
    },
  };
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isUnitInterval(value) {
  return typeof value === 'number' && value >= 0 && value < 1;
}

/**
 * Consumes one value: `1 + floor(rng() * 7)`.
 * @param {Rng} rng
 * @returns {number} color 1-7
 */
export function randomColor(rng) {
  return 1 + Math.floor(rng() * COLOR_COUNT);
}

/**
 * Consumes one value: picks the `floor(rng() * n)`-th empty cell in ascending index order.
 * @param {readonly number[]} board
 * @param {Rng} rng
 * @returns {number} cell index
 * @throws {Error} when the board is full
 */
export function randomEmptyCell(board, rng) {
  const empty = emptyCells(board);
  if (empty.length === 0) {
    throw new Error('no empty cell to pick');
  }
  return empty[Math.floor(rng() * empty.length)];
}
