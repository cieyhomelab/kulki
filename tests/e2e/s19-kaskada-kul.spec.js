import { expect, test } from '@playwright/test';
import { rectInsideScreen, readScreen } from './helpers/screen.js';
import { arrange, colorValue, getState, move, rows } from './helpers/game.js';

/** @typedef {{ x: number, y: number, width: number, height: number }} Rect */

const ALL_COLORS = rows([
  [0, 0, 1],
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 5],
  [0, 5, 6],
  [0, 6, 7],
]);

/** A full board in which neighbouring cells always differ, so no line exists. */
const FULL = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
);

/** @param {import('@playwright/test').Page} page */
const readCascade = (page) =>
  page.evaluate(() =>
    [...globalThis.document.querySelectorAll('[data-testid="cascade-ball"]')].map((el) => {
      const r = el.getBoundingClientRect();
      const css = globalThis.getComputedStyle(el);
      return {
        color: el.getAttribute('data-color'),
        rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        radius: css.borderTopLeftRadius,
        image: css.backgroundImage,
        animations: el.getAnimations().length,
        transition: css.transitionDuration,
      };
    }),
  );

/**
 * Rectangle of the title letters including the outline, the depth layers and the glow.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Rect>}
 */
const titleExtent = (page) =>
  page.evaluate(() => {
    const title = /** @type {Element} */ (
      globalThis.document.querySelector('[data-testid="title"]')
    );
    const r = title.getBoundingClientRect();
    const pad = 3 + 16 + 4;
    return { x: r.x - pad, y: r.y - pad, width: r.width + 2 * pad, height: r.height + 2 * pad };
  });

/** @param {Rect} a @param {Rect} b */
const overlap = (a, b) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** @param {import('@playwright/test').Page} page @param {string[]} ids */
const rectsOf = (page, ids) =>
  Promise.all(
    ids.map(async (id) => /** @type {Rect} */ (await page.getByTestId(id).first().boundingBox())),
  );

/** @param {import('@playwright/test').Page} page */
const snapshot = (page) =>
  page.evaluate(async () => {
    const api = /** @type {any} */ (globalThis).__kulki;
    const cells = [...globalThis.document.querySelectorAll('[data-testid^="cell-"]')].map((c) => [
      c.getAttribute('data-selected'),
      c.getAttribute('data-bouncing'),
    ]);
    return { state: api.getState(), sound: api.getSoundLog().length, cells };
  });

test.describe('S19: cascade of balls around the title', () => {
  test('S19: 7 to 30 balls, every game colour present, at least 3 sizes', async ({ page }) => {
    await arrange(page, { board: ALL_COLORS, preview: [1, 2, 3] });
    const balls = await readCascade(page);
    expect(balls.length).toBeGreaterThanOrEqual(7);
    expect(balls.length).toBeLessThanOrEqual(30);
    expect(new Set(balls.map((b) => b.color))).toEqual(
      new Set(['1', '2', '3', '4', '5', '6', '7']),
    );
    expect(new Set(balls.map((b) => b.rect.width)).size).toBeGreaterThanOrEqual(3);
    for (const b of balls) expect(b.rect.width).toBe(b.rect.height);
  });

  test('S19: each ball is round and filled like the board ball of the same colour', async ({
    page,
  }) => {
    await arrange(page, { board: ALL_COLORS, preview: [1, 2, 3] });
    const balls = await readCascade(page);
    for (const b of balls) {
      expect(b.radius).toBe('50%');
      const col = Number(b.color) - 1;
      const boardBall = await page
        .getByTestId(`ball-0-${col}`)
        .evaluate((el) => globalThis.getComputedStyle(el).backgroundImage);
      expect(b.image).toBe(boardBall);
    }
  });

  for (const size of [
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    test.describe(`at ${size.width}x${size.height}`, () => {
      test.use({ viewport: size });

      test('S19: balls fit in the window and keep clear of the board, panels, buttons and title', async ({
        page,
      }) => {
        await arrange(page, { board: FULL, score: 42, preview: [6, 7, 1] }, [0.25, 0.5, 0, 0, 0]);
        await page.evaluate(() => globalThis.document.fonts.ready);
        const ids = [
          'board',
          'score-panel',
          'best-score-panel',
          'preview',
          'new-game',
          'sound-toggle',
        ];

        /** @param {string[]} extra */
        const check = async (extra) => {
          const others = await rectsOf(page, [...ids, ...extra]);
          const letters = await titleExtent(page);
          const viewport = size;
          for (const b of await readCascade(page)) {
            expect(b.rect.x).toBeGreaterThanOrEqual(0);
            expect(b.rect.y).toBeGreaterThanOrEqual(0);
            expect(b.rect.x + b.rect.width).toBeLessThanOrEqual(viewport.width);
            expect(b.rect.y + b.rect.height).toBeLessThanOrEqual(viewport.height);
            expect(overlap(b.rect, letters)).toBe(false);
            for (const other of others) expect(overlap(b.rect, other)).toBe(false);
          }
        };

        await check([]);
        await page.getByTestId('new-game').click();
        await expect(page.getByTestId('confirm-dialog')).toBeVisible();
        await check(['confirm-dialog']);
        await page.reload();
        await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
        await page.evaluate(
          ({ board, queue }) => {
            const api = /** @type {any} */ (globalThis).__kulki;
            api.setRandom({ queue });
            api.setState({ board, score: 42, preview: [6, 7, 1] });
          },
          {
            board: [`..${FULL[0].slice(2)}`, ...FULL.slice(1)],
            queue: [0.25, 0.5, 0, 0, 0],
          },
        );
        await move(page, [1, 0], [0, 0]);
        await expect(page.getByTestId('game-over')).toBeVisible();
        await check(['game-over']);
      });

      test('S19: every ball lies inside the rounded screen edge', async ({ page }) => {
        await arrange(page, { board: ALL_COLORS, preview: [1, 2, 3] });
        const screen = await readScreen(page);
        for (const b of await readCascade(page)) {
          expect(rectInsideScreen(b.rect, screen.rect, screen.radii[0])).toBe(true);
        }
      });
    });
  }

  test('S19: the cascade adds no text and is hidden from the accessibility tree', async ({
    page,
  }) => {
    await arrange(page, { board: ALL_COLORS, preview: [1, 2, 3] });
    const cascade = page.getByTestId('cascade');
    await expect(cascade).toHaveAttribute('aria-hidden', 'true');
    expect(await cascade.evaluate((el) => el.textContent)).toBe('');
    expect(await cascade.evaluate((el) => /** @type {HTMLElement} */ (el).innerText)).toBe('');
    const tree = await page.locator('body').ariaSnapshot();
    expect(tree).not.toContain('cascade');
    expect(await page.getByRole('img').count()).toBe(0);
  });

  test('S19: two openings give the same cascade', async ({ page }) => {
    await arrange(page, { board: ALL_COLORS, preview: [1, 2, 3] });
    const first = await readCascade(page);
    await page.reload();
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
    await page.evaluate(() => globalThis.document.fonts.ready);
    expect(await readCascade(page)).toEqual(first);
  });

  test('S19: clicking a ball changes nothing when no ball is selected', async ({ page }) => {
    await arrange(page, { board: ALL_COLORS, preview: [1, 2, 3] });
    const before = await snapshot(page);
    await page.getByTestId('cascade-ball').first().click();
    expect(await snapshot(page)).toEqual(before);
    expect(before.cells.every(([selected]) => selected === 'false')).toBe(true);
  });

  test('S19: a selected, bouncing ball stays selected after clicks on a ball, the title and empty space', async ({
    page,
  }) => {
    await arrange(page, { board: ALL_COLORS, preview: [1, 2, 3] });
    const selected = page.getByTestId('cell-0-3');
    await selected.click();
    await expect(selected).toHaveAttribute('data-bouncing', 'true');
    const before = await snapshot(page);

    // An empty point: just left of the hero, outside the game, found from the rectangles.
    const app = /** @type {Rect} */ (await page.getByTestId('app').boundingBox());
    const empty = { x: Math.max(2, app.x / 2), y: app.y + app.height / 2 };

    const clicks = [
      () => page.getByTestId('cascade-ball').first().click(),
      () => page.getByTestId('title').click(),
      () => page.mouse.click(empty.x, empty.y),
    ];
    for (const click of clicks) {
      await click();
      await expect(selected).toHaveAttribute('data-selected', 'true');
      await expect(selected).toHaveAttribute('data-bouncing', 'true');
      const now = await snapshot(page);
      expect(now.state).toEqual(before.state);
      expect(now.sound).toBe(before.sound);
    }
  });

  test('S19: spawned balls and the new preview follow the given sequence, cascade unchanged', async ({
    page,
  }) => {
    await arrange(page, { board: rows([[8, 0, 5]]), preview: [2, 3, 4] }, [
      0.999,
      0.999,
      0,
      colorValue(5),
      colorValue(6),
      colorValue(7),
    ]);
    const before = await readCascade(page);
    await move(page, [8, 0], [8, 1]);
    const state = await getState(page);
    expect(state.board[8][1]).toBe('5');
    expect(state.board[8][8]).toBe('2');
    expect(state.board[8][7]).toBe('3');
    expect(state.board[0][0]).toBe('4');
    expect(state.preview).toEqual([5, 6, 7]);
    expect(await readCascade(page)).toEqual(before);
  });

  test('S19: no animation runs on any ball, also while a board ball bounces', async ({ page }) => {
    await arrange(page, { board: ALL_COLORS, preview: [1, 2, 3] });
    await page.getByTestId('cell-0-3').click();
    await expect(page.getByTestId('cell-0-3')).toHaveAttribute('data-bouncing', 'true');
    for (const b of await readCascade(page)) {
      expect(b.animations).toBe(0);
      expect(b.transition).toBe('0s');
    }
  });
});
