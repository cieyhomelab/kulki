import { describe, expect, it } from 'vitest';
import { loadGame } from './helpers/load-game.js';

/** @param {Document} document @param {string} id */
const cell = (document, id) =>
  /** @type {HTMLElement} */ (document.querySelector(`[data-testid="${id}"]`));

/** @param {Document} document */
const bouncing = (document) =>
  Array.from(document.querySelectorAll('[data-bouncing="true"]')).map((c) =>
    c.getAttribute('data-testid'),
  );

/** Loads the game with a ball on (0,0) and (0,1). */
async function setup() {
  const { window } = await loadGame();
  const api = /** @type {any} */ (window).__kulki;
  api.setState({
    board: ['12.......', ...Array(8).fill('.........')],
    score: 0,
    preview: [2, 3, 4],
  });
  return { window, document: window.document };
}

describe('bouncing attribute', () => {
  it('is false on every cell at start', async () => {
    const { document } = await loadGame().then((d) => d.window);
    expect(document.querySelectorAll('[data-bouncing="false"]')).toHaveLength(81);
  });

  it('follows the selection through clicks', async () => {
    const { document } = await setup();
    cell(document, 'cell-0-0').click();
    expect(bouncing(document)).toEqual(['cell-0-0']);
    cell(document, 'cell-0-1').click();
    expect(bouncing(document)).toEqual(['cell-0-1']);
    cell(document, 'cell-0-1').click();
    expect(bouncing(document)).toEqual([]);
    cell(document, 'cell-0-1').click();
    expect(bouncing(document)).toEqual(['cell-0-1']);
  });

  it('is not started by clicking an empty cell', async () => {
    const { document } = await setup();
    cell(document, 'cell-5-5').click();
    expect(bouncing(document)).toEqual([]);
  });

  it('stops on setState', async () => {
    const { window, document } = await setup();
    cell(document, 'cell-0-0').click();
    /** @type {any} */ (window).__kulki.setState({
      board: ['1........', ...Array(8).fill('.........')],
    });
    expect(bouncing(document)).toEqual([]);
  });

  it('keeps bouncing while the new-game question is open and stops after confirming', async () => {
    const { document } = await setup();
    cell(document, 'cell-0-0').click();
    cell(document, 'new-game').click();
    expect(bouncing(document)).toEqual(['cell-0-0']);
    cell(document, 'confirm-no').click();
    expect(bouncing(document)).toEqual(['cell-0-0']);
    cell(document, 'new-game').click();
    cell(document, 'confirm-yes').click();
    expect(bouncing(document)).toEqual([]);
  });

  it('sets the cycle time from one variable on the board', async () => {
    const { document } = await setup();
    expect(cell(document, 'board').style.getPropertyValue('--bounce-ms')).toBe('600ms');
  });
});
