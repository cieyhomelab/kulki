import { BOARD_SIZE, CELL_COUNT } from './constants.js';

/** Orthogonal neighbours only: a diagonal step is never a connection. */
const STEPS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * Finds a shortest path over empty cells, stepping to side neighbours only (BFS).
 * The start cell holds the moving ball and is allowed; the target must be empty.
 * @param {readonly number[]} board
 * @param {number} from cell index of the ball
 * @param {number} to cell index of the target
 * @returns {number[] | null} cell indexes from `from` to `to` inclusive, or `null` when unreachable
 * @throws {Error} on a bad board or an index outside the board
 */
export function findPath(board, from, to) {
  if (board.length !== CELL_COUNT) {
    throw new Error(`board must have ${CELL_COUNT} cells`);
  }
  for (const index of [from, to]) {
    if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) {
      throw new RangeError(`cell index out of range: ${index}`);
    }
  }
  if (board[to] !== 0 || from === to) return null;

  /** @type {number[]} */
  const previous = new Array(CELL_COUNT).fill(-1);
  previous[from] = from;
  const queue = [from];
  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head];
    if (current === to) break;
    const row = Math.floor(current / BOARD_SIZE);
    const col = current % BOARD_SIZE;
    for (const [dRow, dCol] of STEPS) {
      const r = row + dRow;
      const c = col + dCol;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;
      const next = r * BOARD_SIZE + c;
      if (previous[next] !== -1 || board[next] !== 0) continue;
      previous[next] = current;
      queue.push(next);
    }
  }
  if (previous[to] === -1) return null;

  const path = [to];
  while (path[path.length - 1] !== from) {
    path.push(previous[path[path.length - 1]]);
  }
  return path.reverse();
}
