import { expect, test } from '@playwright/test';
import { arrange, cell } from './helpers/game.js';

const BOARD = [
  '.........',
  '.........',
  '.........',
  '.........',
  '....2....',
  '.........',
  '.........',
  '.........',
  '1.......3',
];

test.describe('Step W: ball as a separate element', () => {
  test.beforeEach(async ({ page }) => {
    await arrange(page, { board: BOARD, preview: [2, 3, 4], score: 0 });
  });

  test('S10: has 81 ball elements, one in every cell, also on empty cells', async ({ page }) => {
    await expect(page.locator('[data-testid^="ball-"]')).toHaveCount(81);
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        await expect(cell(page, row, col).getByTestId(`ball-${row}-${col}`)).toHaveCount(1);
      }
    }
  });

  test('S10: ball is visible only on a cell with a colour and takes its colour', async ({
    page,
  }) => {
    await expect(page.getByTestId('ball-0-0')).toHaveCSS('display', 'none');
    await expect(page.getByTestId('ball-4-4')).toBeVisible();
    /** @param {string} id */
    const gradient = (id) =>
      page.getByTestId(id).evaluate((node) => globalThis.getComputedStyle(node).backgroundImage);
    const colours = [
      await gradient('ball-8-0'),
      await gradient('ball-4-4'),
      await gradient('ball-8-8'),
    ];
    expect(new Set(colours).size).toBe(3);
  });

  test('S10: ball has the same size and position as before (12% margin)', async ({ page }) => {
    const cellBox = await cell(page, 4, 4).boundingBox();
    const ballBox = await page.getByTestId('ball-4-4').boundingBox();
    const c = /** @type {NonNullable<typeof cellBox>} */ (cellBox);
    const b = /** @type {NonNullable<typeof ballBox>} */ (ballBox);
    const border = 1;
    const inner = c.width - 2 * border;
    expect(b.width).toBeCloseTo(inner * 0.76, 0);
    expect(b.height).toBeCloseTo(inner * 0.76, 0);
    expect(b.x - c.x - border).toBeCloseTo(inner * 0.12, 0);
    expect(b.y - c.y - border).toBeCloseTo(inner * 0.12, 0);
  });

  test('S10: ball in default state has no transform and no animation', async ({ page }) => {
    const ball = page.getByTestId('ball-4-4');
    await expect(ball).toHaveCSS('transform', 'none');
    const animations = await ball.evaluate((node) => node.getAnimations().length);
    expect(animations).toBe(0);
    await expect(ball).toHaveCSS('transition-duration', '0s');
  });
});
