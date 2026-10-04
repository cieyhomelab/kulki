import { BOARD_SIZE, CELL_COUNT, COLOR_COUNT } from './constants.js';

/**
 * A board is 81 numbers, index `row * 9 + col`: `0` is an empty cell, `1`-`7` is a ball color.
 * @typedef {readonly number[]} Board
 */

/** @returns {number[]} a board with no balls */
export function createEmptyBoard() {
  return new Array(CELL_COUNT).fill(0);
}

/**
 * @param {number} row
 * @param {number} col
 * @returns {number} cell index
 */
export function toIndex(row, col) {
  if (!Number.isInteger(row) || row < 0 || row >= BOARD_SIZE) {
    throw new RangeError(`row out of range: ${row}`);
  }
  if (!Number.isInteger(col) || col < 0 || col >= BOARD_SIZE) {
    throw new RangeError(`col out of range: ${col}`);
  }
  return row * BOARD_SIZE + col;
}

/**
 * Converts the external format (9 strings of 9 characters, `.` or `1`-`7`) to a board.
 * @param {unknown} rows
 * @returns {number[]}
 * @throws {TypeError} when the value does not have the expected shape
 */
export function boardFromRows(rows) {
  if (!Array.isArray(rows) || rows.length !== BOARD_SIZE) {
    throw new TypeError(`board must be an array of ${BOARD_SIZE} strings`);
  }
  const pattern = new RegExp(`^[.1-${COLOR_COUNT}]{${BOARD_SIZE}}$`);
  /** @type {number[]} */
  const board = [];
  rows.forEach((row, rowIndex) => {
    if (typeof row !== 'string' || !pattern.test(row)) {
      throw new TypeError(
        `board[${rowIndex}] must be a string of ${BOARD_SIZE} characters: "." or a digit 1-${COLOR_COUNT}`,
      );
    }
    for (const char of row) {
      board.push(char === '.' ? 0 : Number(char));
    }
  });
  return board;
}

/**
 * @param {Board} board
 * @returns {string[]} the external format, see {@link boardFromRows}
 */
export function boardToRows(board) {
  assertBoard(board);
  const rows = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const cells = board.slice(row * BOARD_SIZE, (row + 1) * BOARD_SIZE);
    rows.push(cells.map((color) => (color === 0 ? '.' : String(color))).join(''));
  }
  return rows;
}

/**
 * @param {Board} board
 * @returns {number[]} indexes of empty cells in ascending order
 */
export function emptyCells(board) {
  assertBoard(board);
  /** @type {number[]} */
  const result = [];
  board.forEach((color, index) => {
    if (color === 0) result.push(index);
  });
  return result;
}

/**
 * Returns a copy of the board with a ball put on an empty cell.
 * @param {Board} board
 * @param {number} index
 * @param {number} color 1-7
 * @returns {number[]}
 */
export function withBall(board, index, color) {
  assertBoard(board);
  if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) {
    throw new RangeError(`cell index out of range: ${index}`);
  }
  if (!Number.isInteger(color) || color < 1 || color > COLOR_COUNT) {
    throw new RangeError(`color out of range: ${color}`);
  }
  if (board[index] !== 0) {
    throw new Error(`cell ${index} is not empty`);
  }
  const next = board.slice();
  next[index] = color;
  return next;
}

/** @param {Board} board */
function assertBoard(board) {
  if (!Array.isArray(board) || board.length !== CELL_COUNT) {
    throw new Error(`board must have ${CELL_COUNT} cells`);
  }
}
