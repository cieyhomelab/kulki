import { describe, expect, it } from 'vitest';
import { boardFromRows } from '../../../src/game/board.js';
import { findPath } from '../../../src/game/path.js';

const empty = () => boardFromRows(Array(9).fill('.........'));

describe('findPath', () => {
  it('finds a straight shortest path including both ends', () => {
    const board = empty();
    board[0] = 1;
    expect(findPath(board, 0, 3)).toEqual([0, 1, 2, 3]);
  });

  it('goes around an obstacle with side steps only', () => {
    const board = empty();
    board[0] = 1;
    board[1] = 2;
    board[10] = 2;
    const path = /** @type {number[]} */ (findPath(board, 0, 2));
    expect(path).toEqual([0, 9, 18, 19, 20, 11, 2]);
    path.slice(1).forEach((cell, i) => {
      const prev = path[i];
      const dist =
        Math.abs(Math.floor(cell / 9) - Math.floor(prev / 9)) + Math.abs((cell % 9) - (prev % 9));
      expect(dist).toBe(1);
      expect(board[cell]).toBe(0);
    });
  });

  it('returns null for an occupied target', () => {
    const board = empty();
    board[0] = 1;
    board[10] = 2;
    expect(findPath(board, 0, 10)).toBeNull();
  });

  it('returns null when the only connection is diagonal', () => {
    const board = empty();
    board[0] = 1;
    board[1] = 2;
    board[9] = 2;
    expect(findPath(board, 0, 10)).toBeNull();
  });

  it('returns null when the target is walled off', () => {
    const board = empty();
    board[0] = 1;
    board[7 * 9 + 8] = 2;
    board[8 * 9 + 7] = 2;
    expect(findPath(board, 0, 80)).toBeNull();
  });

  it('returns null for the same cell and throws for bad indexes', () => {
    const board = empty();
    board[0] = 1;
    expect(findPath(board, 0, 0)).toBeNull();
    expect(() => findPath(board, -1, 3)).toThrow(RangeError);
    expect(() => findPath(board, 0, 81)).toThrow(RangeError);
    expect(() => findPath([0], 0, 0)).toThrow();
  });
});
