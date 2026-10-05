import { expect, test } from '@playwright/test';
import { arrange, cell, rows } from './helpers/game.js';
import { describeResult, measureGameBalls } from './helpers/scanlines.js';
import { readScreen } from './helpers/screen.js';

const BASE_COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1', '#1e53d6', '#8e24aa'];

const ALL_COLORS = rows([
  [0, 0, 1],
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 5],
  [0, 5, 6],
  [0, 6, 7],
]);

/** 80 balls and one empty field, no line anywhere. */
const ALMOST_FULL = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) =>
    r === 8 && c === 8 ? '.' : String(((3 * r + c) % 7) + 1),
  ).join(''),
);

/** @param {import('@playwright/test').Page} page */
const ready = async (page) => {
  await page.evaluate(() => globalThis.document.fonts.ready);
  await page.locator('[data-testid="board"][data-animating="false"]').waitFor();
};

/**
 * Computed `z-index` of the first element with the test id.
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
const zIndex = (page, selector) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => globalThis.getComputedStyle(el).zIndex);

test.describe('S24: the rest of the screen and the game work as before', () => {
  test('S24: screen layers are ordered scanlines < balls < vignette < glare, cascade balls stay below', async ({
    page,
  }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [1, 2, 3] });
    const crt = Number(await zIndex(page, '[data-testid="crt"]'));
    const ball = Number(await zIndex(page, '[data-testid="ball-0-0"]'));
    const preview = Number(await zIndex(page, '[data-testid="preview-ball"]'));
    const vignette = Number(await zIndex(page, '[data-testid="crt-vignette"]'));
    const glare = Number(await zIndex(page, '[data-testid="crt-glare"]'));
    expect(crt).toBeLessThan(ball);
    expect(preview).toBe(ball);
    expect(ball).toBeLessThan(vignette);
    expect(vignette).toBeLessThan(glare);
    expect(await zIndex(page, '[data-testid="cascade-ball"]')).toBe('auto');
    expect(await zIndex(page, '[data-testid="app"]')).toBe('auto');
  });

  test('S24: the vignette covers the window with the screen edge, takes no clicks and says nothing', async ({
    page,
  }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [1, 2, 3] });
    const screen = await readScreen(page);
    const vignette = page.getByTestId('crt-vignette');
    const box = await vignette.boundingBox();
    expect(box).toEqual(screen.rect);
    const style = await vignette.evaluate((el) => {
      const css = globalThis.getComputedStyle(el);
      return {
        radii: [
          css.borderTopLeftRadius,
          css.borderTopRightRadius,
          css.borderBottomRightRadius,
          css.borderBottomLeftRadius,
        ].map(parseFloat),
        pointerEvents: css.pointerEvents,
        image: css.backgroundImage,
        text: el.textContent,
        hidden: el.getAttribute('aria-hidden'),
        animations: el.getAnimations().length,
      };
    });
    expect(style.radii).toEqual(screen.radii);
    expect(style.pointerEvents).toBe('none');
    expect(style.image).toContain('radial-gradient');
    expect(style.text).toBe('');
    expect(style.hidden).toBe('true');
    expect(style.animations).toBe(0);

    // The page reads the same with and without it: it adds nothing to the accessibility tree.
    const withIt = await page.locator('body').ariaSnapshot();
    await vignette.evaluate((el) =>
      /** @type {HTMLElement} */ (el).style.setProperty('display', 'none'),
    );
    expect(await page.locator('body').ariaSnapshot()).toBe(withIt);
  });

  test('S24: scanline strength, screen edge radius, glare and text glow keep the S20 values', async ({
    page,
  }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [1, 2, 3] });
    const values = await page.evaluate(() => {
      const doc = globalThis.document;
      const root = globalThis.getComputedStyle(doc.documentElement);
      const crt = /** @type {Element} */ (doc.querySelector('[data-testid="crt"]'));
      const glare = /** @type {Element} */ (doc.querySelector('[data-testid="crt-glare"]'));
      return {
        alpha: parseFloat(root.getPropertyValue('--crt-scanline-alpha')),
        radius: parseFloat(globalThis.getComputedStyle(crt).borderTopLeftRadius),
        image: globalThis.getComputedStyle(crt).backgroundImage,
        glare: globalThis.getComputedStyle(glare).backgroundImage,
        glow: globalThis.getComputedStyle(doc.body).textShadow,
      };
    });
    expect(values.alpha).toBeGreaterThanOrEqual(0.2);
    expect(values.alpha).toBeLessThanOrEqual(0.4);
    expect(values.radius).toBeGreaterThanOrEqual(0.02 * 768);
    expect(values.image).toContain('radial-gradient');
    expect(values.image).toContain('repeating-linear-gradient');
    expect(values.glare).toContain('linear-gradient');
    expect(values.glow).not.toBe('none');
  });

  test('S24: the board has no transform at the moment of a refused move', async ({ page }) => {
    await arrange(page, {
      board: rows([
        [0, 0, 1],
        [0, 1, 2],
        [1, 0, 2],
      ]),
      score: 1,
      preview: [1, 2, 3],
    });
    await cell(page, 0, 0).click();
    const during = await page.evaluate(() => {
      const doc = globalThis.document;
      /** @type {HTMLElement} */ (doc.querySelector('[data-testid="cell-8-8"]')).click();
      const board = /** @type {HTMLElement} */ (doc.querySelector('[data-testid="board"]'));
      return {
        rejected: board.dataset.rejected,
        transform: globalThis.getComputedStyle(board).transform,
      };
    });
    expect(during.rejected).toBe('true');
    expect(during.transform).toBe('none');
  });

  test('S24: the screen looks the same in a light and a dark system theme and stands still', async ({
    page,
  }) => {
    /** @param {'light' | 'dark'} colorScheme */
    const shot = async (colorScheme) => {
      await page.emulateMedia({ colorScheme });
      await arrange(page, { board: ALL_COLORS, score: 1, preview: [1, 2, 3] });
      await ready(page);
      return page.screenshot({ scale: 'css' });
    };
    const light = await shot('light');
    const dark = await shot('dark');
    const again = await page.screenshot({ scale: 'css' });
    expect(dark.equals(again)).toBe(true);
    expect(light.equals(dark)).toBe(true);
    expect(await page.evaluate(() => globalThis.document.getAnimations().length)).toBe(0);
  });

  test('S24: balls are round, keep the base colours and the 12% inset and have no shadow or filter', async ({
    page,
  }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [1, 2, 3] });
    await ready(page);
    const data = await page.evaluate(() => {
      const doc = globalThis.document;
      /** @param {Element} el */
      const info = (el) => {
        const css = globalThis.getComputedStyle(el);
        const probe = doc.createElement('span');
        probe.style.color = css.getPropertyValue('--ball');
        doc.body.append(probe);
        const color = globalThis.getComputedStyle(probe).color;
        probe.remove();
        return {
          color,
          radius: css.borderTopLeftRadius,
          shadow: css.boxShadow,
          filter: css.filter,
          textShadow: css.textShadow,
          rect: el.getBoundingClientRect().toJSON(),
        };
      };
      return {
        board: [0, 1, 2, 3, 4, 5, 6].map((c) =>
          info(/** @type {Element} */ (doc.querySelector(`[data-testid="ball-0-${c}"]`))),
        ),
        cells: [0, 1, 2, 3, 4, 5, 6].map((c) =>
          /** @type {Element} */ (doc.querySelector(`[data-testid="cell-0-${c}"]`))
            .getBoundingClientRect()
            .toJSON(),
        ),
        preview: [...doc.querySelectorAll('[data-testid="preview-ball"]')].map(info),
      };
    });
    /** @param {string} hex */
    const rgb = (hex) =>
      `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
    data.board.forEach((ball, i) => {
      expect(ball.color).toBe(rgb(BASE_COLORS[i]));
      expect(ball.radius).toBe('50%');
      expect(ball.shadow).toBe('none');
      expect(ball.filter).toBe('none');
      const c = data.cells[i];
      const inset = 0.12 * c.width;
      expect(Math.abs(ball.rect.x - c.x - inset)).toBeLessThanOrEqual(1 + 1);
      expect(Math.abs(c.x + c.width - (ball.rect.x + ball.rect.width) - inset)).toBeLessThanOrEqual(
        2,
      );
      expect(Math.abs(ball.rect.y - c.y - 0.12 * c.height)).toBeLessThanOrEqual(2);
      expect(
        Math.abs(c.y + c.height - (ball.rect.y + ball.rect.height) - 0.12 * c.height),
      ).toBeLessThanOrEqual(2);
    });
    expect(data.preview).toHaveLength(3);
    data.preview.forEach((ball, i) => {
      expect(ball.color).toBe(rgb(BASE_COLORS[i]));
      expect(ball.radius).toBe('50%');
      expect(ball.shadow).toBe('none');
      expect(ball.filter).toBe('none');
      expect(ball.rect.width).toBe(ball.rect.height);
    });
  });

  test('S24: a cascade ball has the same fill as a board ball of the same colour', async ({
    page,
  }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [1, 2, 3] });
    const pairs = await page.evaluate(() => {
      const doc = globalThis.document;
      /** @type {Array<{ color: string, cascade: string, board: string }>} */
      const out = [];
      for (const el of doc.querySelectorAll('[data-testid="cascade-ball"]')) {
        const color = el.getAttribute('data-color') ?? '';
        const board = doc.querySelector(`.cell > .ball[data-color="${color}"]`);
        const source = board ?? doc.querySelector(`[data-testid="ball-0-${Number(color) - 1}"]`);
        if (!source) continue;
        out.push({
          color,
          cascade: globalThis.getComputedStyle(el).backgroundImage,
          board: globalThis.getComputedStyle(source).backgroundImage,
        });
      }
      return out;
    });
    expect(pairs.length).toBeGreaterThan(0);
    for (const pair of pairs) expect(pair.cascade, `colour ${pair.color}`).toBe(pair.board);
  });

  test('S24: clicking a ball with 80 balls on the board changes the state within 100 ms', async ({
    page,
  }) => {
    await arrange(page, { board: ALMOST_FULL, score: 1, preview: [1, 2, 3] });
    await ready(page);
    const ms = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const doc = globalThis.document;
          const api = /** @type {any} */ (globalThis).__kulki;
          const target = /** @type {HTMLElement} */ (doc.querySelector('[data-testid="cell-4-4"]'));
          const started = performance.now();
          target.click();
          const poll = () => {
            if (api.getState().selected) resolve(performance.now() - started);
            else globalThis.requestAnimationFrame(poll);
          };
          poll();
        }),
    );
    expect(ms).toBeLessThanOrEqual(100);
  });

  test('S24: clicks on balls, empty fields, corners and buttons change the state within 100 ms', async ({
    page,
  }) => {
    await arrange(page, {
      board: rows([
        [0, 0, 1],
        [0, 8, 2],
        [8, 0, 3],
        [8, 8, 4],
        [4, 4, 5],
      ]),
      score: 1,
      preview: [1, 2, 3],
    });
    await ready(page);
    /** @param {string} testId @param {string} what script returning true once the effect shows */
    const timed = (testId, what) =>
      page.evaluate(
        ({ testId, what }) =>
          new Promise((resolve) => {
            const doc = globalThis.document;
            const api = /** @type {any} */ (globalThis).__kulki;
            const check = new Function('doc', 'api', `return ${what}`);
            const started = performance.now();
            /** @type {HTMLElement} */ (doc.querySelector(`[data-testid="${testId}"]`)).click();
            const poll = () => {
              if (check(doc, api)) resolve(performance.now() - started);
              else globalThis.requestAnimationFrame(poll);
            };
            poll();
          }),
        { testId, what },
      );
    const select = (/** @type {string} */ id) =>
      timed(id, 'api.getState().selected !== null && api.getState().selected !== undefined');
    // Balls in the four corners and in the middle, and a click on an empty field to deselect.
    for (const id of ['cell-0-0', 'cell-0-8', 'cell-8-0', 'cell-8-8', 'cell-4-4']) {
      expect(await select(id), id).toBeLessThanOrEqual(100);
      await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState());
      await cell(page, 4, 4).click();
      await page.getByTestId('board').and(page.locator('[data-animating="false"]')).waitFor();
      await page.evaluate(() =>
        /** @type {any} */ (globalThis).__kulki.setState({
          board: ['1.......2', ...Array(6).fill('.........'), '.........', '3.......4'].map(
            (r, i) => (i === 4 ? '....5....' : r),
          ),
          score: 1,
          preview: [1, 2, 3],
        }),
      );
    }
    expect(
      await timed('new-game', 'doc.querySelector(\'[data-testid="confirm-dialog"]\') !== null'),
    ).toBeLessThanOrEqual(100);
    expect(
      await timed('confirm-no', 'doc.querySelector(\'[data-testid="confirm-dialog"]\') === null'),
    ).toBeLessThanOrEqual(100);
    const sound = await page.getByTestId('sound-toggle').textContent();
    expect(
      await timed(
        'sound-toggle',
        `doc.querySelector('[data-testid="sound-toggle"]').textContent !== ${JSON.stringify(sound)}`,
      ),
    ).toBeLessThanOrEqual(100);
  });

  test('S24: a selected ball still bounces, deselects and walks as before', async ({ page }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [1, 2, 3] });
    await cell(page, 0, 0).click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'true');
    await cell(page, 0, 0).click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-selected', 'false');
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'false');
  });

  test('S24: the balls have no lines when the file is opened from disk, with no extra requests', async ({
    page,
  }) => {
    const fileUrl = process.env.E2E_FILE_URL;
    test.skip(!fileUrl, 'E2E_FILE_URL is not set');
    /** @type {string[]} */
    const requests = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('data:')) requests.push(request.url());
    });
    await page.goto(/** @type {string} */ (fileUrl));
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
    await page.evaluate(
      ({ board }) =>
        /** @type {any} */ (globalThis).__kulki.setState({ board, score: 1, preview: [1, 2, 3] }),
      { board: ALL_COLORS },
    );
    await ready(page);
    const result = await measureGameBalls(page);
    expect(result.discPixels).toBeGreaterThan(0);
    expect(result.discBad + result.surroundBad, describeResult(result)).toBe(0);
    expect(requests.filter((url) => url !== fileUrl)).toEqual([]);
  });
});
