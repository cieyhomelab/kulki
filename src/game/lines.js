import { BOARD_SIZE, CELL_COUNT, MIN_LINE } from './constants.js';

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

/**
 * Finds every ball that belongs to a line of at least 5 same-colored balls
 * (horizontal, vertical or diagonal). A ball in two lines is listed once.
 * @param {readonly number[]} board
 * @returns {number[]} cell indexes in ascending order
 */
export function findLines(board) {
  if (board.length !== CELL_COUNT) {
    throw new Error(`board must have ${CELL_COUNT} cells`);
  }
  const marked = new Set();
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const color = board[row * BOARD_SIZE + col];
      if (color === 0) continue;
      for (const [dRow, dCol] of DIRECTIONS) {
        // Only start counting at the first ball of a run.
        if (colorAt(board, row - dRow, col - dCol) === color) continue;
        const run = [];
        let r = row;
        let c = col;
        while (colorAt(board, r, c) === color) {
          run.push(r * BOARD_SIZE + c);
          r += dRow;
          c += dCol;
        }
        if (run.length >= MIN_LINE) {
          run.forEach((index) => marked.add(index));
        }
      }
    }
  }
  return [...marked].sort((a, b) => a - b);
}

/**
 * @param {readonly number[]} board
 * @param {number} row
 * @param {number} col
 * @returns {number} color, or -1 outside the board
 */
function colorAt(board, row, col) {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return -1;
  return board[row * BOARD_SIZE + col];
}
