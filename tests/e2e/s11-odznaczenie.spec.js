import { expect, test } from '@playwright/test';
import { ballBox, freezeAt } from './helpers/ball.js';
import { arrange, cell } from './helpers/game.js';

const BOARD = [
  '12.......',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
];

/** @param {{ x: number, y: number, width: number, height: number }} a @param {typeof a} b */
function expectSameBox(a, b) {
  expect(Math.abs(a.x - b.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(a.height - b.height)).toBeLessThanOrEqual(1);
}

test.describe('S11: the ball stops at once', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await arrange(page, { board: BOARD, preview: [2, 3, 4], score: 0 });
  });

  test('S11: clicking the ball again stops it in its resting position and size', async ({
    page,
  }) => {
    const rest = await ballBox(page, 0, 0);
    await cell(page, 0, 0).click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'true');
    await cell(page, 0, 0).click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'false');
    expectSameBox(await ballBox(page, 0, 0), rest);
    await expect(page.getByTestId('ball-0-0')).toHaveCSS('transform', 'none');
  });

  test('S11: clicking another ball moves the bouncing to it', async ({ page }) => {
    await cell(page, 0, 0).click();
    await cell(page, 0, 1).click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'false');
    await expect(cell(page, 0, 1)).toHaveAttribute('data-bouncing', 'true');
    expect(await page.getByTestId('ball-0-0').evaluate((node) => node.getAnimations().length)).toBe(
      0,
    );
  });

  test('S11: stopping at different moments of the cycle gives the same resting state', async ({
    page,
  }) => {
    const rest = await ballBox(page, 0, 0);
    for (const fraction of [0.1, 0.5, 0.9]) {
      await cell(page, 0, 0).click();
      await freezeAt(page, 0, 0, fraction);
      await cell(page, 0, 0).click();
      await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'false');
      expectSameBox(await ballBox(page, 0, 0), rest);
    }
  });

  test('S11: selecting a ball again after deselecting makes it bounce again', async ({ page }) => {
    await cell(page, 0, 0).click();
    await cell(page, 0, 0).click();
    await cell(page, 0, 0).click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'true');
  });

  test('S11: new game after confirming leaves nothing bouncing', async ({ page }) => {
    await cell(page, 0, 0).click();
    await page.getByTestId('new-game').click();
    await page.getByTestId('confirm-yes').click();
    await expect(page.locator('[data-bouncing="true"]')).toHaveCount(0);
  });

  test('S11: the new-game question and declining it keep the ball bouncing', async ({ page }) => {
    await cell(page, 0, 0).click();
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'true');
    await page.getByTestId('confirm-no').click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-selected', 'true');
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'true');
  });

  test('S11: after a reload nothing bounces', async ({ page }) => {
    await cell(page, 0, 0).click();
    await page.reload();
    await page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();
    await expect(page.locator('[data-bouncing="true"]')).toHaveCount(0);
  });

  test('S11: clicking an empty cell with nothing selected starts nothing', async ({ page }) => {
    await cell(page, 5, 5).click();
    await expect(page.locator('[data-bouncing="true"]')).toHaveCount(0);
  });

  test('S11: rapid switching never leaves more than the selected ball bouncing', async ({
    page,
  }) => {
    const ok = await page.evaluate(() => {
      const doc = globalThis.document;
      const click = (/** @type {string} */ id) =>
        /** @type {HTMLElement} */ (doc.querySelector(`[data-testid="${id}"]`)).click();
      for (const id of ['cell-0-0', 'cell-0-1', 'cell-0-1', 'cell-0-0', 'cell-0-1']) {
        click(id);
        const bouncing = doc.querySelectorAll('[data-bouncing="true"]');
        const selected = doc.querySelectorAll('[data-selected="true"]');
        if (bouncing.length > 1) return false;
        if (bouncing.length === 1 && bouncing[0] !== selected[0]) return false;
        if (bouncing.length !== selected.length) return false;
      }
      return true;
    });
    expect(ok).toBe(true);
  });

  test('S11: a click during a blocking animation does not start or stop bouncing', async ({
    page,
  }) => {
    await arrange(page, { board: BOARD, preview: [2, 3, 4], score: 0 });
    const result = await page.evaluate(async () => {
      const doc = globalThis.document;
      const click = (/** @type {string} */ id) =>
        /** @type {HTMLElement} */ (doc.querySelector(`[data-testid="${id}"]`)).click();
      const bouncing = () => doc.querySelectorAll('[data-bouncing="true"]').length;
      click('cell-0-1');
      click('cell-4-4');
      const during = bouncing();
      click('cell-0-0');
      click('cell-0-1');
      const afterClicks = bouncing();
      const board = /** @type {HTMLElement} */ (doc.querySelector('[data-testid="board"]'));
      await new Promise((resolve) => {
        const poll = () =>
          board.dataset.animating === 'false'
            ? resolve(null)
            : globalThis.requestAnimationFrame(poll);
        poll();
      });
      return { during, afterClicks, animatingAtEnd: bouncing() };
    });
    expect(result.during).toBe(0);
    expect(result.afterClicks).toBe(0);
    expect(result.animatingAtEnd).toBe(0);
  });
});
