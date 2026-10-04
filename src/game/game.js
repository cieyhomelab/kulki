import { COLOR_COUNT, SPAWN_BALLS, START_BALLS } from './constants.js';
import { boardFromRows, createEmptyBoard, withBall } from './board.js';
import { findLines } from './lines.js';
import { randomColor, randomEmptyCell } from './rng.js';

/**
 * Immutable game state.
 * @typedef {object} GameState
 * @property {readonly number[]} board 81 cells, 0 = empty, 1-7 = color
 * @property {number} score
 * @property {readonly number[]} preview 3 colors of the next balls
 * @property {boolean} over
 * @property {boolean} record whether the best score was beaten in this game
 */

/**
 * Starts a new game: 5 balls that form no line, then a 3-color preview.
 * Random values are consumed per the contract: for each ball a cell then a color, and the whole
 * placement is repeated when it makes a line; the preview colors come last.
 * @param {import('./rng.js').Rng} rng
 * @returns {GameState}
 */
export function newGame(rng) {
  let board;
  do {
    board = createEmptyBoard();
    for (let i = 0; i < START_BALLS; i += 1) {
      const cell = randomEmptyCell(board, rng);
      board = withBall(board, cell, randomColor(rng));
    }
  } while (findLines(board).length > 0);
  return { board, score: 0, preview: randomColors(SPAWN_BALLS, rng), over: false, record: false };
}

/**
 * @param {number} count
 * @param {import('./rng.js').Rng} rng
 * @returns {number[]}
 */
function randomColors(count, rng) {
  return Array.from({ length: count }, () => randomColor(rng));
}

/**
 * Validates a test-supplied state (see `window.__kulki.setState`).
 * @param {unknown} input
 * @param {import('./rng.js').Rng} rng used only when `preview` is missing
 * @returns {{ game: GameState, best: number | undefined }}
 * @throws {TypeError} naming the offending field
 */
export function gameFromSnapshot(input, rng) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('state must be an object');
  }
  const {
    board,
    score = 0,
    preview,
    best,
    over = false,
    record = false,
  } = /** @type {any} */ (input);
  const cells = boardFromRows(board);
  if (!isNonNegativeInteger(score)) {
    throw new TypeError('score must be a non-negative integer');
  }
  if (preview !== undefined && !isValidPreview(preview)) {
    throw new TypeError(`preview must be ${SPAWN_BALLS} integers from 1 to ${COLOR_COUNT}`);
  }
  if (best !== undefined && !isNonNegativeInteger(best)) {
    throw new TypeError('best must be a non-negative integer');
  }
  if (typeof over !== 'boolean') {
    throw new TypeError('over must be a boolean');
  }
  if (typeof record !== 'boolean') {
    throw new TypeError('record must be a boolean');
  }
  return {
    game: {
      board: cells,
      score,
      preview: preview ?? randomColors(SPAWN_BALLS, rng),
      over,
      record,
    },
    best,
  };
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
function isNonNegativeInteger(value) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isValidPreview(value) {
  return (
    Array.isArray(value) &&
    value.length === SPAWN_BALLS &&
    value.every((c) => Number.isInteger(c) && c >= 1 && c <= COLOR_COUNT)
  );
}
