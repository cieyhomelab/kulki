import { COLOR_COUNT, SPAWN_BALLS } from '../game/constants.js';
import { boardFromRows, boardToRows, emptyCells } from '../game/board.js';
import { readItem, writeItem } from './safe-storage.js';

/** Storage key of the saved game; the format is a protected contract (BACKWARD_COMPATIBILITY.md). */
export const GAME_SAVE_KEY = 'kulki.game.v1';

/**
 * Reads the saved game.
 * @param {import('./safe-storage.js').StorageLike | null} [storage] defaults to `localStorage`
 * @returns {import('../game/game.js').GameState | null} `null` when there is no valid saved game
 */
export function readGame(storage) {
  const raw = storage === undefined ? readItem(GAME_SAVE_KEY) : readItem(GAME_SAVE_KEY, storage);
  if (raw === null) return null;
  /** @type {any} */
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    // A corrupted save reads as "no save"; the player is never told.
    return null;
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
  const { board: rows, score, preview, over, record } = data;
  if (!Number.isSafeInteger(score) || score < 0) return null;
  if (
    !Array.isArray(preview) ||
    preview.length !== SPAWN_BALLS ||
    !preview.every((c) => Number.isInteger(c) && c >= 1 && c <= COLOR_COUNT)
  ) {
    return null;
  }
  if (typeof over !== 'boolean' || typeof record !== 'boolean') return null;
  /** @type {number[]} */
  let board;
  try {
    board = boardFromRows(rows);
  } catch {
    // Wrong board shape: treated as "no save".
    return null;
  }
  if (!over && emptyCells(board).length === 0) return null;
  return { board, score, preview, over, record };
}

/**
 * Saves the game. A failing write is ignored.
 * @param {import('../game/game.js').GameState} state
 * @param {import('./safe-storage.js').StorageLike | null} [storage] defaults to `localStorage`
 * @returns {boolean} whether the value was stored
 */
export function writeGame(state, storage) {
  const json = JSON.stringify({
    board: boardToRows(state.board),
    score: state.score,
    preview: [...state.preview],
    over: state.over,
    record: state.record,
  });
  return storage === undefined
    ? writeItem(GAME_SAVE_KEY, json)
    : writeItem(GAME_SAVE_KEY, json, storage);
}
