import { describe, expect, it } from 'vitest';
import { boardToRows } from '../../../src/game/board.js';
import { gameFromSnapshot, newGame } from '../../../src/game/game.js';
import { findLines } from '../../../src/game/lines.js';
import { createQueuedRng, createSeededRng } from '../../../src/game/rng.js';

/** Maps a cell index and a color to the values that make the rng pick them (empty board). */
const cellValue = (/** @type {number} */ index, /** @type {number} */ empty) =>
  (index + 0.5) / empty;
const colorValue = (/** @type {number} */ color) => (color - 1 + 0.5) / 7;

describe('newGame', () => {
  it('places 5 balls on different cells, score 0, preview of 3 colors', () => {
    const game = newGame(createSeededRng(7));
    expect(game.board.filter((c) => c !== 0)).toHaveLength(5);
    expect(game.score).toBe(0);
    expect(game.preview).toHaveLength(3);
    expect(game.preview.every((c) => c >= 1 && c <= 7)).toBe(true);
    expect(game.over).toBe(false);
    expect(game.record).toBe(false);
  });

  it('never starts with a ready line', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      expect(findLines(newGame(createSeededRng(seed)).board)).toEqual([]);
    }
  });

  it('consumes values as: per ball cell then color, then 3 preview colors', () => {
    const queue = [
      cellValue(0, 81),
      colorValue(2),
      cellValue(0, 80),
      colorValue(3), // first empty after cell 0 is cell 1
      cellValue(78, 79),
      colorValue(4), // last of 79 empty cells is cell 80
      cellValue(0, 78),
      colorValue(5), // cell 2
      cellValue(0, 77),
      colorValue(6), // cell 3
      colorValue(7),
      colorValue(1),
      colorValue(2),
    ];
    const game = newGame(createQueuedRng(queue, () => 0));
    expect(boardToRows(game.board)).toEqual([
      '2356.....',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '........4',
    ]);
    expect([...game.preview]).toEqual([7, 1, 2]);
  });

  it('repeats the whole ball placement when it makes a line, before the preview', () => {
    // All zeros put five balls of color 1 on cells 0-4 (a line), so the placement is repeated.
    const queue = [
      ...Array(10).fill(0),
      ...[0.99, 0.0, 0.99, 0.2, 0.99, 0.4, 0.99, 0.6, 0.99, 0.8, 0.1, 0.2, 0.3],
    ];
    const game = newGame(createQueuedRng(queue, () => 0));
    expect(game.board.filter((c) => c !== 0)).toHaveLength(5);
    expect(findLines(game.board)).toEqual([]);
    expect([...game.preview]).toEqual([1, 2, 3]);
  });
});

describe('gameFromSnapshot', () => {
  const board = ['3........', ...Array(8).fill('.........')];

  it('applies defaults', () => {
    const { game, best } = gameFromSnapshot({ board, preview: [1, 2, 3] }, () => 0);
    expect(game.score).toBe(0);
    expect(game.over).toBe(false);
    expect(game.record).toBe(false);
    expect(game.board[0]).toBe(3);
    expect(best).toBeUndefined();
  });

  it('draws the preview from rng when absent', () => {
    const { game } = gameFromSnapshot(
      { board },
      createQueuedRng([0, 0.5, 0.99], () => 0),
    );
    expect([...game.preview]).toEqual([1, 4, 7]);
  });

  it('accepts full input', () => {
    const { game, best } = gameFromSnapshot(
      { board, score: 14, preview: [4, 1, 6], best: 20, over: true, record: true },
      () => 0,
    );
    expect(game).toMatchObject({ score: 14, over: true, record: true });
    expect(best).toBe(20);
  });

  it.each([
    ['null', null, /state/],
    ['array', [], /state/],
    ['missing board', {}, /board/],
    ['bad board', { board: ['x'] }, /board/],
    ['negative score', { board, score: -1 }, /score/],
    ['fractional score', { board, score: 1.5 }, /score/],
    ['short preview', { board, preview: [1, 2] }, /preview/],
    ['preview color 8', { board, preview: [1, 2, 8] }, /preview/],
    ['bad best', { board, best: '3' }, /best/],
    ['bad over', { board, over: 1 }, /over/],
    ['bad record', { board, record: 'yes' }, /record/],
  ])('rejects %s with a TypeError naming the field', (_name, input, field) => {
    expect(() => gameFromSnapshot(input, () => 0)).toThrow(TypeError);
    expect(() => gameFromSnapshot(input, () => 0)).toThrow(field);
  });
});
