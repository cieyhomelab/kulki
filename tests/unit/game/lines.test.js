import { describe, expect, it } from 'vitest';
import { boardFromRows, createEmptyBoard } from '../../../src/game/board.js';
import { findLines } from '../../../src/game/lines.js';
import { scoreForCleared } from '../../../src/game/score.js';

/** @param {string[]} rows */
const lines = (rows) => findLines(boardFromRows(rows));
const EMPTY = '.........';

describe('findLines', () => {
  it('finds nothing on an empty board and for 4 in a row', () => {
    expect(findLines(createEmptyBoard())).toEqual([]);
    expect(lines(['1111.....', ...Array(8).fill(EMPTY)])).toEqual([]);
  });

  it('finds horizontal, vertical and both diagonals', () => {
    expect(lines(['.22222...', ...Array(8).fill(EMPTY)])).toEqual([1, 2, 3, 4, 5]);
    const vertical = ['3', '3', '3', '3', '3'].map((c) => c + '........');
    expect(lines([...vertical, ...Array(4).fill(EMPTY)])).toEqual([0, 9, 18, 27, 36]);
    const down = ['1........', '.1.......', '..1......', '...1.....', '....1....'];
    expect(lines([...down, ...Array(4).fill(EMPTY)])).toEqual([0, 10, 20, 30, 40]);
    const up = ['....4....', '...4.....', '..4......', '.4.......', '4........'];
    expect(lines([...up, ...Array(4).fill(EMPTY)])).toEqual([4, 12, 20, 28, 36]);
  });

  it('keeps longer runs whole', () => {
    expect(lines(['666666...', ...Array(8).fill(EMPTY)])).toHaveLength(6);
  });

  it('does not join different colors', () => {
    expect(lines(['111122223', ...Array(8).fill(EMPTY)])).toEqual([]);
  });

  it('lists several lines at once and a shared ball once', () => {
    const rows = [
      '11111....',
      '1........',
      '1........',
      '1........',
      '1........',
      ...Array(4).fill(EMPTY),
    ];
    const found = lines(rows);
    expect(found).toHaveLength(9);
    expect(new Set(found).size).toBe(9);
    const two = lines(['11111.222', '.........', '.........', ...Array(6).fill(EMPTY)]);
    expect(two).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('scoreForCleared', () => {
  it.each([
    [0, 0],
    [5, 10],
    [6, 14],
    [7, 18],
    [8, 22],
    [9, 26],
    [10, 30],
    [11, 34],
  ])('%i balls score %i', (count, points) => {
    expect(scoreForCleared(count)).toBe(points);
  });

  it('rejects invalid counts', () => {
    expect(() => scoreForCleared(-1)).toThrow(RangeError);
    expect(() => scoreForCleared(1.5)).toThrow(RangeError);
  });
});
