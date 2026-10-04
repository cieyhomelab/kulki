import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { loadGame, readBuiltHtml } from './helpers/load-game.js';

describe('built index.html', () => {
  it('is self-contained: no external scripts, styles or other resources', async () => {
    const html = await readBuiltHtml();
    const { document } = new JSDOM(html).window;

    expect(document.querySelectorAll('[src], link, object, embed, iframe')).toHaveLength(0);
    expect(document.querySelectorAll('script')).toHaveLength(1);
    expect(document.querySelectorAll('style')).toHaveLength(1);

    const css = document.querySelector('style')?.textContent ?? '';
    expect(css).not.toMatch(/@import/);
    expect(css.match(/url\((?!\s*['"]?data:)/g)).toBeNull();
  });

  it('boots the start screen in Polish', async () => {
    const { document } = (await loadGame()).window;

    expect(document.documentElement.lang).toBe('pl');
    expect(document.querySelector('h1')?.textContent).toBe('Kulki');
    expect(document.getElementById('app')?.dataset.ready).toBe('true');
  });
});

describe('game screen DOM contract', () => {
  it('renders the new game board, scores, preview and buttons', async () => {
    const { document } = (await loadGame()).window;
    const byId = (/** @type {string} */ id) => document.querySelector(`[data-testid="${id}"]`);

    expect(byId('app')?.getAttribute('data-ready')).toBe('true');
    const board = byId('board');
    expect(board?.getAttribute('data-animating')).toBe('false');
    expect(board?.getAttribute('data-rejected')).toBe('false');

    const cells = document.querySelectorAll('[data-testid^="cell-"]');
    expect(cells).toHaveLength(81);
    let balls = 0;
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const cell = byId(`cell-${row}-${col}`);
        expect(cell?.getAttribute('data-color')).toMatch(/^[0-7]$/);
        expect(cell?.getAttribute('data-selected')).toBe('false');
        if (cell?.getAttribute('data-color') !== '0') balls += 1;
      }
    }
    expect(balls).toBe(5);
    expect(document.querySelector('canvas')).toBeNull();

    expect(byId('score')?.textContent).toBe('0');
    expect(byId('best-score')?.textContent).toBe('0');
    const previewBalls = byId('preview')?.querySelectorAll('[data-testid="preview-ball"]') ?? [];
    expect(previewBalls).toHaveLength(3);
    for (const ball of previewBalls) {
      expect(ball.getAttribute('data-color')).toMatch(/^[1-7]$/);
    }
    expect(byId('new-game')?.textContent).toBe('Nowa gra');
  });

  it('toggles the sound button in memory only', async () => {
    const window = (await loadGame()).window;
    const button = /** @type {HTMLElement} */ (
      window.document.querySelector('[data-testid="sound-toggle"]')
    );
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toBe('Dźwięk: włączony');

    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toBe('Dźwięk: wyciszony');

    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.length).toBe(0);
  });
});

describe('test interface window.__kulki', () => {
  it('is installed when the app is ready and exposes the contract', async () => {
    const window = /** @type {any} */ ((await loadGame()).window);
    expect(window.document.getElementById('app').dataset.ready).toBe('true');
    expect(Object.keys(window.__kulki).sort()).toEqual([
      'getSoundLog',
      'getState',
      'setRandom',
      'setState',
    ]);
    expect(window.__kulki.getSoundLog()).toEqual([]);
  });

  it('setState draws the given state and getState reports it', async () => {
    const window = /** @type {any} */ ((await loadGame()).window);
    const board = ['3........', ...Array(8).fill('.........')];
    window.__kulki.setState({ board, score: 14, preview: [4, 1, 6], best: 20 });

    const text = (/** @type {string} */ id) =>
      window.document.querySelector(`[data-testid="${id}"]`).textContent;
    expect(text('score')).toBe('14');
    expect(text('best-score')).toBe('20');
    expect(window.__kulki.getState()).toEqual({
      board,
      score: 14,
      best: 20,
      preview: [4, 1, 6],
      selected: null,
      over: false,
      record: false,
      animating: false,
      rejected: false,
      soundOn: true,
    });
  });

  it('setState rejects a bad argument with a TypeError and keeps the state', async () => {
    const window = /** @type {any} */ ((await loadGame()).window);
    const before = window.__kulki.getState();
    expect(() => window.__kulki.setState({ board: ['x'] })).toThrow(/board/);
    expect(() => window.__kulki.setState({ board: before.board, score: -1 })).toThrow(/score/);
    expect(window.__kulki.getState()).toEqual(before);
  });
});
