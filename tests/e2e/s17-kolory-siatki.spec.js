import { expect, test } from '@playwright/test';
import { contrast, luminance } from './helpers/contrast.js';

/** @param {string} value computed `rgb(…)` colour */
const rgb = (value) => (value.match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
/** @param {number[]} c */
const blueDominant = (c) => c[2] > c[0] && c[2] > c[1];

test.describe('S17: board colours', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
  });

  test('S17: grid lines are blue, brighter than a dark blue cell background', async ({ page }) => {
    const read = await page.evaluate(() => {
      const style = (/** @type {string} */ id) =>
        globalThis.getComputedStyle(
          /** @type {Element} */ (globalThis.document.querySelector(`[data-testid="${id}"]`)),
        );
      return {
        board: style('board').backgroundColor,
        border: style('cell-0-0').borderTopColor,
        cell: style('cell-0-0').backgroundColor,
      };
    });
    const cell = rgb(read.cell);
    for (const line of [rgb(read.board), rgb(read.border)]) {
      expect(blueDominant(line)).toBe(true);
      expect(luminance(line)).toBeGreaterThan(luminance(cell));
      expect(contrast(line, cell)).toBeGreaterThanOrEqual(3);
    }
    expect(luminance(cell)).toBeLessThanOrEqual(0.05);
    expect(blueDominant(cell)).toBe(true);
  });

  test('S17: score numbers stay yellow', async ({ page }) => {
    for (const id of ['score', 'best-score']) {
      const colour = rgb(
        await page.getByTestId(id).evaluate((el) => globalThis.getComputedStyle(el).color),
      );
      expect(colour[0]).toBeGreaterThan(colour[2]);
      expect(colour[1]).toBeGreaterThan(colour[2]);
    }
  });
});
