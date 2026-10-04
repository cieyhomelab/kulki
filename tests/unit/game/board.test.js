import { describe, expect, it } from 'vitest';
import {
  boardFromRows,
  boardToRows,
  createEmptyBoard,
  emptyCells,
  toIndex,
  withBall,
} from '../../../src/game/board.js';

const ROWS = [
  '.........',
  '..3......',
  '.........',
  '.....7...',
  '.........',
  '.1.......',
  '.........',
  '....2....',
  '......5..',
];

describe('board', () => {
  it('creates an empty 81-cell board', () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(81);
    expect(board.every((c) => c === 0)).toBe(true);
  });

  it('converts rows to a board and back', () => {
    const board = boardFromRows(ROWS);
    expect(board[1 * 9 + 2]).toBe(3);
    expect(board[8 * 9 + 6]).toBe(5);
    expect(boardToRows(board)).toEqual(ROWS);
  });

  it.each([
    ['not an array', 'x'],
    ['wrong row count', ROWS.slice(1)],
    ['short row', [...ROWS.slice(1), '........']],
    ['bad char', [...ROWS.slice(1), '.......8.']],
    ['zero digit', [...ROWS.slice(1), '.......0.']],
    ['non-string row', [...ROWS.slice(1), 5]],
  ])('rejects %s with a TypeError', (_name, value) => {
    expect(() => boardFromRows(value)).toThrow(TypeError);
  });

  it('lists empty cells in ascending order', () => {
    const board = withBall(withBall(createEmptyBoard(), 0, 1), 2, 4);
    const empty = emptyCells(board);
    expect(empty).toHaveLength(79);
    expect(empty.slice(0, 3)).toEqual([1, 3, 4]);
  });

  it('withBall does not mutate and rejects occupied cells', () => {
    const board = createEmptyBoard();
    const next = withBall(board, 10, 3);
    expect(board[10]).toBe(0);
    expect(next[10]).toBe(3);
    expect(() => withBall(next, 10, 2)).toThrow(Error);
    expect(() => withBall(board, 81, 2)).toThrow(RangeError);
    expect(() => withBall(board, 0, 8)).toThrow(RangeError);
  });

  it('toIndex maps row and column and rejects out-of-range values', () => {
    expect(toIndex(2, 3)).toBe(21);
    expect(() => toIndex(9, 0)).toThrow(RangeError);
    expect(() => toIndex(0, -1)).toThrow(RangeError);
  });
});
