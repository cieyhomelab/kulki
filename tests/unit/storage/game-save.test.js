import { describe, expect, it } from 'vitest';
import { boardFromRows } from '../../../src/game/board.js';
import { GAME_SAVE_KEY, readGame, writeGame } from '../../../src/storage/game-save.js';

function memoryStorage(/** @type {Record<string, string>} */ initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (/** @type {string} */ key) => data.get(key) ?? null,
    setItem: (/** @type {string} */ key, /** @type {string} */ value) => void data.set(key, value),
  };
}

const throwing = {
  getItem() {
    throw new Error('SecurityError');
  },
  setItem() {
    throw new Error('QuotaExceededError');
  },
};

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
const valid = () => ({ board: ROWS, score: 12, preview: [4, 1, 6], over: false, record: false });
const stored = (/** @type {unknown} */ value) =>
  memoryStorage({ [GAME_SAVE_KEY]: JSON.stringify(value) });
const full = () =>
  Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
  );

describe('readGame', () => {
  it('reads a valid saved game', () => {
    expect(readGame(stored(valid()))).toEqual({
      board: boardFromRows(ROWS),
      score: 12,
      preview: [4, 1, 6],
      over: false,
      record: false,
    });
  });

  it('accepts a finished game with a full board', () => {
    const game = readGame(stored({ ...valid(), board: full(), over: true, record: true }));
    expect(game?.over).toBe(true);
    expect(game?.record).toBe(true);
  });

  it('returns null when there is no save', () => {
    expect(readGame(memoryStorage())).toBeNull();
  });

  it('returns null when storage fails', () => {
    expect(readGame(throwing)).toBeNull();
    expect(readGame(null)).toBeNull();
  });

  it('returns null for text that is not JSON', () => {
    expect(readGame(memoryStorage({ [GAME_SAVE_KEY]: '{oops' }))).toBeNull();
    expect(readGame(memoryStorage({ [GAME_SAVE_KEY]: '' }))).toBeNull();
  });

  const broken = /** @type {Array<[string, unknown]>} */ ([
    ['null', null],
    ['an array', []],
    ['a number', 5],
    ['a missing board', { ...valid(), board: undefined }],
    ['a board with 8 rows', { ...valid(), board: ROWS.slice(1) }],
    ['a row of 8 characters', { ...valid(), board: [ROWS[0].slice(1), ...ROWS.slice(1)] }],
    ['a color 8', { ...valid(), board: ['8........', ...ROWS.slice(1)] }],
    ['a color 0', { ...valid(), board: ['0........', ...ROWS.slice(1)] }],
    ['a non-string row', { ...valid(), board: [5, ...ROWS.slice(1)] }],
    ['a negative score', { ...valid(), score: -1 }],
    ['a fractional score', { ...valid(), score: 1.5 }],
    ['a string score', { ...valid(), score: '12' }],
    ['a missing score', { ...valid(), score: undefined }],
    ['a preview of 2', { ...valid(), preview: [1, 2] }],
    ['a preview of 4', { ...valid(), preview: [1, 2, 3, 4] }],
    ['a preview color 0', { ...valid(), preview: [0, 1, 2] }],
    ['a preview color 8', { ...valid(), preview: [1, 2, 8] }],
    ['a fractional preview color', { ...valid(), preview: [1, 2, 2.5] }],
    ['a non-boolean over', { ...valid(), over: 'false' }],
    ['a missing over', { ...valid(), over: undefined }],
    ['a non-boolean record', { ...valid(), record: 0 }],
    ['a missing record', { ...valid(), record: undefined }],
    ['an unfinished game with a full board', { ...valid(), board: full() }],
  ]);
  it.each(broken)('returns null for %s', (_name, value) => {
    expect(readGame(stored(value))).toBeNull();
  });
});

describe('writeGame', () => {
  it('writes the external format and reads back the same game', () => {
    const storage = memoryStorage();
    const game = {
      board: boardFromRows(ROWS),
      score: 12,
      preview: [4, 1, 6],
      over: false,
      record: true,
    };
    expect(writeGame(game, storage)).toBe(true);
    expect(JSON.parse(storage.data.get(GAME_SAVE_KEY) ?? '')).toEqual({
      board: ROWS,
      score: 12,
      preview: [4, 1, 6],
      over: false,
      record: true,
    });
    expect(readGame(storage)).toEqual(game);
  });

  it('ignores a failing write', () => {
    const game = readGame(stored(valid()));
    expect(game).not.toBeNull();
    expect(writeGame(/** @type {any} */ (game), throwing)).toBe(false);
    expect(writeGame(/** @type {any} */ (game), null)).toBe(false);
  });
});
