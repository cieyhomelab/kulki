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

  it('toggles the sound button and stores the setting', async () => {
    const window = (await loadGame()).window;
    const button = /** @type {HTMLElement} */ (
      window.document.querySelector('[data-testid="sound-toggle"]')
    );
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toBe('Dźwięk: włączony');

    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toBe('Dźwięk: wyciszony');
    expect(window.localStorage.getItem('kulki.sound.v1')).toBe('off');

    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem('kulki.sound.v1')).toBe('on');
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

describe('move animation', () => {
  /** @param {any} window @param {string[]} board */
  function start(window, board) {
    window.__kulki.setState({ board, score: 0, preview: [4, 5, 6], best: 0 });
    const cell = (/** @type {number} */ r, /** @type {number} */ c) =>
      window.document.querySelector(`[data-testid="cell-${r}-${c}"]`);
    return {
      cell,
      click: (/** @type {number} */ r, /** @type {number} */ c) => cell(r, c).click(),
      done: () =>
        new Promise((resolve) => {
          const poll = () =>
            window.document.querySelector('[data-testid="board"]').dataset.animating === 'false'
              ? resolve(undefined)
              : window.setTimeout(poll, 1);
          poll();
        }),
    };
  }

  it('keeps the ball colour on the path when the move completes a line', async () => {
    const window = /** @type {any} */ ((await loadGame()).window);
    const board = ['1111.....', '.........', '....1....', ...Array(6).fill('.........')];
    const { cell, click, done } = start(window, board);
    click(2, 4);
    click(0, 4);
    expect(cell(1, 4).dataset.color).toBe('0');
    const seen = /** @type {string[]} */ ([]);
    const sample = () => {
      seen.push(cell(1, 4).dataset.color);
      if (window.document.querySelector('[data-testid="board"]').dataset.animating === 'true') {
        window.setTimeout(sample, 1);
      }
    };
    sample();
    await done();
    expect(seen).toContain('1');
    expect(seen.filter((color) => color !== '0' && color !== '1')).toEqual([]);
    expect(window.__kulki.getState().score).toBeGreaterThan(0);
  });

  it('finishes the walk within 600 ms of timer delay on the longest paths', async () => {
    const window = /** @type {any} */ ((await loadGame()).window);
    const board = [
      '1........',
      '22222222.',
      '.........',
      '.3333333 3'.replace(' ', ''),
      '.........',
      '22222222.',
      '.........',
      '.3333333 3'.replace(' ', ''),
      '.........',
    ];
    const { click, done } = start(window, board);
    const delays = /** @type {number[]} */ ([]);
    const original = window.setTimeout.bind(window);
    window.setTimeout = (/** @type {() => void} */ fn, /** @type {number} */ ms) => {
      // ms === 1 is the test's own polling; the 300 ms spawn pause after the walk is not a step
      if (ms > 1 && ms < 300) delays.push(ms);
      return original(fn, ms);
    };
    click(0, 0);
    click(8, 8);
    await done();
    window.setTimeout = original;
    expect(delays.length).toBeGreaterThan(30);
    expect(delays.reduce((sum, ms) => sum + ms, 0)).toBeLessThanOrEqual(600);
  });
});

describe('saved game', () => {
  it('resumes a saved game on start', async () => {
    const board = ['.........', '..3......', ...Array(7).fill('.........')];
    const save = { board, score: 9, preview: [4, 1, 6], over: false, record: false };
    const { document } = (
      await loadGame({
        beforeScripts: (window) =>
          window.localStorage.setItem('kulki.game.v1', JSON.stringify(save)),
      })
    ).window;
    const byId = (/** @type {string} */ id) => document.querySelector(`[data-testid="${id}"]`);
    expect(byId('score')?.textContent).toBe('9');
    expect(byId('cell-1-2')?.getAttribute('data-color')).toBe('3');
    expect(
      document.querySelectorAll('[data-testid^="cell-"][data-color]:not([data-color="0"])'),
    ).toHaveLength(1);
  });

  it('plays normally when localStorage is unavailable', async () => {
    const { document } = (
      await loadGame({
        beforeScripts: (window) =>
          Object.defineProperty(window, 'localStorage', {
            get() {
              throw new Error('SecurityError');
            },
          }),
      })
    ).window;
    expect(document.getElementById('app')?.dataset.ready).toBe('true');
    expect(document.querySelector('[role="alert"]')).toBeNull();
    expect(document.querySelector('[data-testid="score"]')?.textContent).toBe('0');
  });
});

describe('embedded game font', () => {
  it('has exactly one @font-face rule, with a data: address and no licence text', async () => {
    const html = await readBuiltHtml();
    const css = new JSDOM(html).window.document.querySelector('style')?.textContent ?? '';

    expect(css.match(/@font-face/g)).toHaveLength(1);
    expect(css).toMatch(/font-family:\s*'Press Start 2P'/);
    expect(css).toMatch(/url\('data:font\/ttf;base64,[A-Za-z0-9+/=]+'\)\s*format\('truetype'\)/);
    expect(css).toMatch(/font-display:\s*block/);
    expect(css).not.toContain('./fonts/');
    expect(html).not.toMatch(/OFL|SIL OPEN FONT/);
  });
});
