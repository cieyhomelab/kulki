import { expect, test } from '@playwright/test';
import { arrange, rows } from './helpers/game.js';

const BASE_COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1', '#1e53d6', '#8e24aa'];

/** One ball of each of the 7 colors, on cells of the first row. */
const ALL_COLORS = /** @type {Array<[number, number, number]>} */ (
  BASE_COLORS.map((_, i) => [0, i, i + 1])
);

/**
 * Reads what makes a ball look the way it does.
 * @param {import('@playwright/test').Locator} ball
 */
function readBall(ball) {
  return ball.evaluate((el) => {
    const s = globalThis.getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const host = /** @type {HTMLElement} */ (el.parentElement).getBoundingClientRect();
    return {
      radius: s.borderTopLeftRadius,
      width: r.width,
      height: r.height,
      base: s.getPropertyValue('--ball').trim().toLowerCase(),
      boxShadow: s.boxShadow,
      filter: s.filter,
      gaps: {
        left: r.left - host.left,
        right: host.right - r.right,
        top: r.top - host.top,
        bottom: host.bottom - r.bottom,
        side: host.width,
      },
    };
  });
}

test.describe('S21: the game works as before', () => {
  test('S21: balls on the board are round and use the seven base colors without glow or shadow', async ({
    page,
  }) => {
    await arrange(page, { board: rows(ALL_COLORS), score: 0, best: 0, preview: [1, 2, 3] });
    await page.evaluate(() => globalThis.document.fonts.ready);

    for (const [i, color] of BASE_COLORS.entries()) {
      const ball = await readBall(page.getByTestId(`ball-0-${i}`));
      expect(ball.base, `color ${i + 1}`).toBe(color);
      expect(ball.radius, `color ${i + 1}`).toBe('50%');
      expect(ball.width).toBeCloseTo(ball.height, 1);
      expect(ball.boxShadow, `color ${i + 1}`).toBe('none');
      expect(ball.filter, `color ${i + 1}`).toBe('none');
    }
  });

  test('S21: a ball on the board keeps 12% of the cell side from every edge of its cell', async ({
    page,
  }) => {
    await arrange(page, { board: rows(ALL_COLORS), score: 0, best: 0, preview: [1, 2, 3] });
    await page.evaluate(() => globalThis.document.fonts.ready);

    for (const i of [0, 3, 6]) {
      const { gaps } = await readBall(page.getByTestId(`ball-0-${i}`));
      const expected = gaps.side * 0.12;
      for (const edge of /** @type {const} */ (['left', 'right', 'top', 'bottom'])) {
        expect(Math.abs(gaps[edge] - expected), `ball ${i} ${edge}`).toBeLessThanOrEqual(1);
      }
    }
  });

  test('S21: balls in the preview are round and use the seven base colors without glow or shadow', async ({
    page,
  }) => {
    const seen = new Set();
    for (const preview of [
      [1, 2, 3],
      [4, 5, 6],
      [7, 1, 2],
    ]) {
      await arrange(page, { board: rows([[0, 0, 1]]), score: 0, best: 0, preview });
      const balls = page.getByTestId('preview-ball');
      await expect(balls).toHaveCount(3);
      for (const [i, color] of preview.entries()) {
        const ball = await readBall(balls.nth(i));
        expect(ball.base, `preview ${i}`).toBe(BASE_COLORS[color - 1]);
        seen.add(ball.base);
        expect(ball.radius, `preview ${i}`).toBe('50%');
        expect(ball.width).toBeCloseTo(ball.height, 1);
        expect(ball.boxShadow, `preview ${i}`).toBe('none');
        expect(ball.filter, `preview ${i}`).toBe('none');
      }
    }
    expect([...seen].sort()).toEqual([...BASE_COLORS].sort());
  });

  test('S21: clicking a ball changes data-selected within 100 ms', async ({ page }) => {
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, best: 0, preview: [1, 2, 3] });
    const elapsed = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const doc = globalThis.document;
          const cell = /** @type {HTMLElement} */ (doc.querySelector('[data-testid="cell-4-4"]'));
          const start = performance.now();
          new globalThis.MutationObserver((_, observer) => {
            if (cell.dataset.selected !== 'true') return;
            observer.disconnect();
            resolve(performance.now() - start);
          }).observe(cell, { attributes: true, attributeFilter: ['data-selected'] });
          cell.click();
        }),
    );
    expect(elapsed).toBeLessThanOrEqual(100);
    await expect(page.getByTestId('cell-4-4')).toHaveAttribute('data-selected', 'true');
  });
});
