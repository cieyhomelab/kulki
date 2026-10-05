import { expect, test } from '@playwright/test';
import { ballBox, sampleCycle } from './helpers/ball.js';
import { arrange, cell, getState } from './helpers/game.js';

const BOARD = [
  '1........',
  '.........',
  '.........',
  '....2....',
  '.........',
  '.........',
  '.........',
  '.........',
  '.......3.',
];

test.describe('S10: the selected ball bounces', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await arrange(page, { board: BOARD, preview: [2, 3, 4], score: 0 });
  });

  test('S10: clicking a ball starts bouncing synchronously in the click handler', async ({
    page,
  }) => {
    await expect(cell(page, 3, 4)).toHaveAttribute('data-bouncing', 'false');
    const bouncingRightAfter = await page.evaluate(() => {
      const target = /** @type {HTMLElement} */ (
        globalThis.document.querySelector('[data-testid="cell-3-4"]')
      );
      target.click();
      return target.dataset.bouncing;
    });
    expect(bouncingRightAfter).toBe('true');
  });

  test('S10: the ball moves vertically and stays within its cell during a cycle', async ({
    page,
  }) => {
    await cell(page, 3, 4).click();
    const samples = await sampleCycle(page, 3, 4);
    const ys = samples.map((s) => s.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(1);
    const box =
      /** @type {NonNullable<Awaited<ReturnType<ReturnType<typeof cell>['boundingBox']>>>} */ (
        await cell(page, 3, 4).boundingBox()
      );
    for (const s of samples) {
      expect(s.x).toBeGreaterThanOrEqual(box.x);
      expect(s.y).toBeGreaterThanOrEqual(box.y);
      expect(s.x + s.width).toBeLessThanOrEqual(box.x + box.width);
      expect(s.y + s.height).toBeLessThanOrEqual(box.y + box.height);
    }
  });

  test('S10: the cycle lasts between 300 ms and 1 s', async ({ page }) => {
    await cell(page, 3, 4).click();
    const ms = await page
      .getByTestId('ball-3-4')
      .evaluate((node) => parseFloat(globalThis.getComputedStyle(node).animationDuration) * 1000);
    expect(ms).toBeGreaterThanOrEqual(300);
    expect(ms).toBeLessThanOrEqual(1000);
  });

  test('S10: exactly one ball bounces, the other cells keep the default state', async ({
    page,
  }) => {
    await cell(page, 3, 4).click();
    await expect(page.locator('[data-bouncing="true"]')).toHaveCount(1);
    await expect(page.locator('[data-bouncing="false"]')).toHaveCount(80);
    await expect(cell(page, 3, 4)).toHaveAttribute('data-bouncing', 'true');
    for (const id of ['ball-0-0', 'ball-8-7']) {
      const ball = page.getByTestId(id);
      await expect(ball).toHaveCSS('transform', 'none');
      expect(await ball.evaluate((node) => node.getAnimations().length)).toBe(0);
    }
  });

  test('S10: bouncing does not block the board and the cell stays selected', async ({ page }) => {
    await cell(page, 3, 4).click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'false');
    await expect(cell(page, 3, 4)).toHaveAttribute('data-selected', 'true');
    expect((await getState(page)).animating).toBe(false);
  });

  test('S10: with motion not reduced the bouncing cell has no static outline', async ({ page }) => {
    await cell(page, 3, 4).click();
    await expect(cell(page, 3, 4)).toHaveCSS('outline-style', 'none');
    await expect(cell(page, 0, 0)).toHaveCSS('outline-style', 'none');
  });

  test('S10: the animation uses only transform', async ({ page }) => {
    await cell(page, 3, 4).click();
    const props = await page.getByTestId('ball-3-4').evaluate((node) => {
      const [animation] = node.getAnimations();
      const frames = /** @type {KeyframeEffect} */ (animation.effect).getKeyframes();
      return [...new Set(frames.flatMap((f) => Object.keys(f)))].filter(
        (k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k),
      );
    });
    expect(props).toEqual(['transform']);
    const box = await ballBox(page, 3, 4);
    expect(box.width).toBeGreaterThan(0);
  });
});
