import { describe, expect, it } from 'vitest';
import { boardFromRows, boardToRows } from '../../../src/game/board.js';
import { gameFromSnapshot, newGame, playTurn } from '../../../src/game/game.js';
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

describe('playTurn', () => {
  /** @param {string[]} rows @param {number[]} [preview] @param {number} [score] */
  const stateOf = (rows, preview = [2, 3, 4], score = 0) => ({
    board: boardFromRows(rows),
    score,
    preview,
    over: false,
    record: false,
  });
  const blank = '.........';
  const rows = (/** @type {Record<number,string>} */ at) =>
    Array.from({ length: 9 }, (_, i) => at[i] ?? blank);
  // rng values: first empty cell, color irrelevant
  const zeros = () => createQueuedRng([], () => 0);

  it('returns null when there is no path and consumes no randomness', () => {
    const state = stateOf(rows({ 0: '12.......', 1: '2........' }));
    let calls = 0;
    expect(playTurn(state, 0, 2, () => ((calls += 1), 0))).toBeNull();
    expect(calls).toBe(0);
  });

  it('throws on programmer errors', () => {
    const state = stateOf(rows({ 0: '1........' }));
    expect(() => playTurn(state, 5, 6, zeros())).toThrow();
    expect(() => playTurn(state, 0, 0, zeros())).toThrow();
    expect(() => playTurn({ ...state, over: true }, 0, 5, zeros())).toThrow();
  });

  it('moves, spawns the preview on the first empty cells and draws a new preview', () => {
    const state = stateOf(rows({ 8: '1........' }));
    const result = playTurn(
      state,
      72,
      40,
      createQueuedRng([0, 0, 0, 0, 0, 0], () => 0),
    );
    expect(result).not.toBeNull();
    const { state: next, events } = /** @type {NonNullable<typeof result>} */ (result);
    expect(events.map((e) => e.type)).toEqual(['moved', 'spawned']);
    expect(next.board[72]).toBe(0);
    expect(next.board[40]).toBe(1);
    expect([next.board[0], next.board[1], next.board[2]]).toEqual([2, 3, 4]);
    expect(next.preview).toEqual([1, 1, 1]);
    expect(next.score).toBe(0);
  });

  it('clears a line made by the move, scores it and spawns nothing', () => {
    const state = stateOf(rows({ 0: '1111.....', 1: '....1....', 8: '........6' }), [5, 5, 5], 3);
    const result = /** @type {any} */ (playTurn(state, 13, 4, zeros()));
    expect(result.events.map((/** @type {any} */ e) => e.type)).toEqual(['moved', 'cleared']);
    expect(result.events[1]).toEqual({ type: 'cleared', cells: [0, 1, 2, 3, 4], points: 10 });
    expect(result.state.score).toBe(13);
    expect(result.state.preview).toEqual([5, 5, 5]);
    expect(result.state.board.filter((/** @type {number} */ c) => c !== 0)).toHaveLength(1);
  });

  it('spawns again when clearing leaves the board empty', () => {
    const state = stateOf(rows({ 0: '1111.....', 1: '....1....' }), [5, 6, 7]);
    const result = /** @type {any} */ (playTurn(state, 13, 4, zeros()));
    // the board only held the line, so after clearing it is empty and the preview is spawned
    expect(result.events.map((/** @type {any} */ e) => e.type)).toEqual([
      'moved',
      'cleared',
      'spawned',
    ]);
    expect(result.state.board.filter((/** @type {number} */ c) => c !== 0)).toHaveLength(3);
    expect(result.state.over).toBe(false);
  });

  it('clears a line created by the spawn', () => {
    const state = stateOf(rows({ 0: '.2222....', 8: '1........' }), [2, 6, 7]);
    // first spawn cell: first empty = (0,0) -> 2 makes 2222 2? (0,0..4) = 2,2,2,2,2 -> line
    const result = /** @type {any} */ (playTurn(state, 72, 80, zeros()));
    const types = result.events.map((/** @type {any} */ e) => e.type);
    expect(types).toEqual(['moved', 'spawned', 'cleared']);
    expect(result.state.score).toBe(10);
  });

  it('drops balls that do not fit and ends the game on a full board', () => {
    // 80 cells filled with a pattern without lines, one hole beside the moving ball
    const filled = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => String(1 + ((r * 3 + c) % 7))).join(''),
    );
    const board = boardFromRows(filled);
    expect(findLines(board)).toEqual([]);
    board[0] = 0;
    board[1] = 0;
    const state = { board, score: 0, preview: [1, 2, 3], over: false, record: false };
    const result = /** @type {any} */ (playTurn(state, 2, 1, zeros()));
    // moving 2->1 leaves cells 0 and 2 empty: two balls spawn, third dropped
    expect(result.events.map((/** @type {any} */ e) => e.type)).toEqual([
      'moved',
      'spawned',
      'gameOver',
    ]);
    expect(result.events[1].cells).toHaveLength(2);
    expect(result.state.over).toBe(true);
    expect(result.state.preview).toEqual([1, 2, 3]);
  });
});
