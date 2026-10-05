import { expect, test } from '@playwright/test';
import { ballBox } from './helpers/ball.js';
import { arrange, cell } from './helpers/game.js';

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

/** @param {import('@playwright/test').Page} page */
async function expectNoBouncingCell(page) {
  await expect(page.locator('[data-bouncing="true"]')).toHaveCount(0);
}

test.describe('S13: reduced motion shows a still highlight', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await arrange(page, { board: BOARD, preview: [2, 3, 4], score: 0 });
  });

  test('S13: with reduced motion a selected ball stays still and its cell has an outline', async ({
    page,
  }) => {
    const rest = await ballBox(page, 3, 4);
    await cell(page, 3, 4).click();
    await expect(cell(page, 3, 4)).toHaveAttribute('data-selected', 'true');
    await expectNoBouncingCell(page);
    await expect(cell(page, 3, 4)).toHaveAttribute('data-bouncing', 'false');
    await expect(cell(page, 3, 4)).not.toHaveCSS('outline-style', 'none');
    const width = await cell(page, 3, 4).evaluate((n) =>
      parseFloat(globalThis.getComputedStyle(n).outlineWidth),
    );
    expect(width).toBeGreaterThanOrEqual(2);
    await expect(cell(page, 0, 0)).toHaveCSS('outline-style', 'none');
    await expect(cell(page, 0, 1)).toHaveCSS('outline-style', 'none');
    // The ball does not move over time.
    await expect(async () => {
      expect(await ballBox(page, 3, 4)).toEqual(rest);
    }).toPass();
    await page.evaluate(() => new Promise((r) => globalThis.requestAnimationFrame(() => r(0))));
    expect(await ballBox(page, 3, 4)).toEqual(rest);
    await expect(page.getByTestId('ball-3-4')).toHaveCSS('animation-name', 'none');
  });

  test('S13: deselecting removes the still outline', async ({ page }) => {
    await cell(page, 3, 4).click();
    await expect(cell(page, 3, 4)).not.toHaveCSS('outline-style', 'none');
    await cell(page, 3, 4).click();
    await expect(cell(page, 3, 4)).toHaveAttribute('data-selected', 'false');
    await expect(cell(page, 3, 4)).toHaveCSS('outline-style', 'none');
  });

  test('S13: without reduced motion the ball bounces and has no outline', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await cell(page, 3, 4).click();
    await expect(cell(page, 3, 4)).toHaveAttribute('data-bouncing', 'true');
    await expect(cell(page, 3, 4)).toHaveCSS('outline-style', 'none');
  });

  test('S13: toggling reduced motion with a selected ball switches at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await cell(page, 3, 4).click();
    await expect(cell(page, 3, 4)).toHaveAttribute('data-bouncing', 'true');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(cell(page, 3, 4)).toHaveAttribute('data-bouncing', 'false');
    await expect(cell(page, 3, 4)).toHaveAttribute('data-selected', 'true');
    await expect(cell(page, 3, 4)).not.toHaveCSS('outline-style', 'none');

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(cell(page, 3, 4)).toHaveAttribute('data-bouncing', 'true');
    await expect(cell(page, 3, 4)).toHaveCSS('outline-style', 'none');
  });
});
