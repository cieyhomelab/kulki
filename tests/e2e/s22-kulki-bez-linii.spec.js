import { expect, test } from '@playwright/test';
import { arrange, move, rows } from './helpers/game.js';
import {
  describeResult,
  measureGameBalls,
  measureScanlines,
  rectOfTestId,
} from './helpers/scanlines.js';

const SIZES = [
  { width: 1024, height: 768 },
  { width: 1920, height: 1080 },
];

const ALL_COLORS = rows([
  [0, 0, 1],
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 5],
  [0, 5, 6],
  [0, 6, 7],
  [4, 4, 3],
]);

const CORNERS = rows([
  [0, 0, 1],
  [0, 8, 2],
  [8, 0, 3],
  [8, 8, 4],
  [4, 4, 5],
]);

/** Full board in which neighbouring cells always differ, so no line exists. */
const FULL = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
);

/** 81 balls minus nothing: used with the preview. */
const FULL_STATE = { board: FULL, score: 3, preview: [1, 4, 7] };

/** @param {import('@playwright/test').Page} page @param {import('./helpers/scanlines.js').Result} r */
function expectClean(page, r) {
  expect(r.discPixels, 'balls were measured').toBeGreaterThan(0);
  expect(r.discBad + r.surroundBad + r.emptyBad + r.linedBad, describeResult(r)).toBe(0);
}

/** @param {import('@playwright/test').Page} page */
const ready = async (page) => {
  await page.evaluate(() => globalThis.document.fonts.ready);
  await page.locator('[data-testid="board"][data-animating="false"]').waitFor();
};

test.describe('S22: standing balls have no scanlines', () => {
  for (const size of SIZES) {
    test(`S22: board balls of all 7 colours and the preview have no lines at ${size.width}x${size.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await arrange(page, { board: ALL_COLORS, score: 1, preview: [2, 5, 7] });
      await ready(page);
      const result = await measureGameBalls(page);
      expect(result.discPixels).toBeGreaterThan(0);
      expectClean(page, result);
    });

    test(`S22: corner and centre balls have no lines and the surroundings keep them at ${size.width}x${size.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await arrange(page, { board: CORNERS, score: 1, preview: [1, 2, 3] });
      await ready(page);
      const empty = await rectOfTestId(page, 'cell-4-0');
      const result = await measureGameBalls(page, { extra: { emptyAreas: [empty] } });
      expectClean(page, result);
      expect(result.surroundPixels).toBeGreaterThan(0);
      expect(result.emptyPixels).toBeGreaterThan(0);
    });

    test(`S22: all 81 balls have no lines at ${size.width}x${size.height}`, async ({ page }) => {
      await page.setViewportSize(size);
      await arrange(page, FULL_STATE);
      await ready(page);
      const result = await measureGameBalls(page);
      expect(result.discPixels).toBeGreaterThan(81 * 100);
      expectClean(page, result);
    });
  }

  test('S22: an empty field has lines over its whole interior', async ({ page }) => {
    await arrange(page, { board: CORNERS, score: 1, preview: [1, 2, 3] });
    await ready(page);
    const fields = await Promise.all(
      [
        [0, 4],
        [4, 0],
        [7, 7],
      ].map(([r, c]) => rectOfTestId(page, `cell-${r}-${c}`)),
    );
    const result = await measureScanlines(page, { emptyAreas: fields });
    expect(result.emptyPixels).toBeGreaterThan(0);
    expect(result.emptyBad, describeResult(result)).toBe(0);
  });

  test('S22: cascade balls keep the scanlines', async ({ page }) => {
    await arrange(page, { board: CORNERS, score: 1, preview: [1, 2, 3] });
    await ready(page);
    const discs = await page.getByTestId('cascade-ball').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }),
    );
    expect(discs.length).toBeGreaterThan(0);
    const result = await measureScanlines(page, { linedDiscs: discs });
    expect(result.linedPixels).toBeGreaterThan(0);
    expect(result.linedBad, describeResult(result)).toBe(0);
  });

  test('S22: resizing the window keeps the balls free of lines', async ({ page }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [2, 5, 7] });
    await ready(page);
    await page.setViewportSize(SIZES[1]);
    await ready(page);
    expectClean(page, await measureGameBalls(page));
  });

  test('S22: a scrolled 800x600 window keeps every fully visible ball free of lines', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await arrange(page, { board: CORNERS, score: 1, preview: [1, 2, 3] });
    await ready(page);
    await page.evaluate(() =>
      globalThis.scrollTo(
        globalThis.document.documentElement.scrollWidth,
        globalThis.document.documentElement.scrollHeight,
      ),
    );
    const size = await page.evaluate(() => ({
      w: globalThis.innerWidth,
      h: globalThis.innerHeight,
    }));
    const result = await measureGameBalls(page, {
      only: (t) =>
        t.disc.x >= 0 &&
        t.disc.y >= 0 &&
        t.disc.x + t.disc.width <= size.w &&
        t.disc.y + t.disc.height <= size.h,
    });
    expectClean(page, result);
  });

  test('S22: balls have no lines with the new-game question visible', async ({ page }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [2, 5, 7] });
    await ready(page);
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    expectClean(page, await measureGameBalls(page));
  });

  test('S22: balls have no lines with the game-over message visible', async ({ page }) => {
    const grid = FULL.map((r) => r.split(''));
    grid[0][0] = '.';
    grid[0][1] = '.';
    grid[1][0] = '.';
    await arrange(
      page,
      { board: grid.map((r) => r.join('')), score: 1, preview: [6, 7, 1] },
      [0.25, 0.5, 0, 0, 0],
    );
    await move(page, [1, 1], [0, 0]);
    await expect(page.getByTestId('game-over')).toBeVisible();
    await ready(page);
    expectClean(page, await measureGameBalls(page));
  });

  test('S22: an idle game takes identical screenshots and runs no animation', async ({ page }) => {
    await arrange(page, { board: ALL_COLORS, score: 1, preview: [2, 5, 7] });
    await ready(page);
    const first = await page.screenshot({ scale: 'css' });
    const second = await page.screenshot({ scale: 'css' });
    expect(first.equals(second)).toBe(true);
    expect(await page.evaluate(() => globalThis.document.getAnimations().length)).toBe(0);
  });
});
