import { COLOR_COUNT, SPAWN_BALLS, START_BALLS } from './constants.js';
import { boardFromRows, createEmptyBoard, emptyCells, withBall } from './board.js';
import { findLines } from './lines.js';
import { findPath } from './path.js';
import { randomColor, randomEmptyCell } from './rng.js';
import { scoreForCleared } from './score.js';

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
 * One thing that happened during a turn, in the order it happened.
 * @typedef {(
 *   { type: 'moved', path: number[] } |
 *   { type: 'cleared', cells: number[], points: number } |
 *   { type: 'spawned', cells: number[], colors: number[] } |
 *   { type: 'gameOver' }
 * )} TurnEvent
 */

/**
 * Plays a whole turn synchronously: move, line check, and when nothing was cleared the spawn of
 * the previewed balls (repeated while a clearing leaves the board empty), then the end-of-game check.
 * @param {GameState} state
 * @param {number} from cell index of the ball to move
 * @param {number} to cell index of the empty target
 * @param {import('./rng.js').Rng} rng
 * @param {number} [best] best score before the turn; when the score exceeds it, `record` becomes
 *   true and stays true. Without it `record` is left as it was.
 * @returns {{ state: GameState, events: TurnEvent[] } | null} `null` when there is no path
 * @throws {Error} when the game is over, `from` holds no ball or `to` is not empty
 */
export function playTurn(state, from, to, rng, best) {
  if (state.over) throw new Error('the game is over');
  if (state.board[from] === undefined || state.board[from] === 0) {
    throw new Error(`cell ${from} holds no ball`);
  }
  if (state.board[to] !== 0) {
    throw new Error(`cell ${to} is not empty`);
  }
  const path = findPath(state.board, from, to);
  if (path === null) return null;

  /** @type {TurnEvent[]} */
  const events = [{ type: 'moved', path }];
  let board = state.board.slice();
  board[to] = board[from];
  board[from] = 0;
  let score = state.score;
  let preview = state.preview;
  let over = false;

  /** Clears lines on `board`; returns whether anything was cleared. */
  const clearLines = () => {
    const cells = findLines(board);
    if (cells.length === 0) return false;
    const points = scoreForCleared(cells.length);
    board = board.slice();
    for (const cell of cells) board[cell] = 0;
    score += points;
    events.push({ type: 'cleared', cells, points });
    return true;
  };

  const cleared = clearLines();
  if (!cleared || emptyCells(board).length === board.length) {
    let spawning = true;
    while (spawning) {
      const room = emptyCells(board).length;
      const colors = preview.slice(0, Math.min(preview.length, room));
      const cells = [];
      for (const color of colors) {
        const cell = randomEmptyCell(board, rng);
        board = withBall(board, cell, color);
        cells.push(cell);
      }
      if (cells.length > 0) events.push({ type: 'spawned', cells, colors });
      const clearedNow = clearLines();
      if (emptyCells(board).length === 0) {
        over = true;
        events.push({ type: 'gameOver' });
        break;
      }
      preview = randomColors(SPAWN_BALLS, rng);
      // A clearing that empties the board spawns the new preview right away.
      spawning = clearedNow && emptyCells(board).length === board.length;
    }
  }
  const record = state.record || (best !== undefined && score > best);
  return { state: { board, score, preview, over, record }, events };
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
