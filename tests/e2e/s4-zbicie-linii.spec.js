import { expect, test } from '@playwright/test';
import { arrange, playTimed, cell, countBalls, getState, move, rows } from './helpers/game.js';

/** A ball that stays out of every line used below and keeps the board from emptying. */
const BYSTANDER = /** @type {[number, number, number]} */ ([0, 8, 2]);

test.describe('S4: clearing lines', () => {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {Array<[number, number, number]>} balls
   * @param {[number, number]} from
   * @param {[number, number]} to
   * @param {number} cleared
   * @param {number} points
   */
  async function expectClearing(page, balls, from, to, cleared, points) {
    await arrange(page, { board: rows([...balls, BYSTANDER]), score: 3, preview: [2, 3, 4] });
    const before = await getState(page);
    await move(page, from, to);
    const after = await getState(page);
    expect(after.score).toBe(3 + points);
    await expect(page.getByTestId('score')).toHaveText(String(3 + points));
    // Only the bystander is left: the move and the whole line are gone, nothing was spawned.
    expect(countBalls(after.board)).toBe(1);
    expect(countBalls(before.board)).toBe(cleared + 1);
    expect(after.preview).toEqual([2, 3, 4]);
  }

  test('S4: a horizontal line of 5 disappears for 10 points', async ({ page }) => {
    await expectClearing(
      page,
      [
        [8, 0, 1],
        [8, 1, 1],
        [8, 2, 1],
        [8, 3, 1],
        [6, 4, 1],
      ],
      [6, 4],
      [8, 4],
      5,
      10,
    );
    for (let col = 0; col < 5; col += 1) {
      await expect(cell(page, 8, col)).toHaveAttribute('data-color', '0');
    }
  });

  test('S4: a vertical line of 5 disappears for 10 points', async ({ page }) => {
    await expectClearing(
      page,
      [
        [2, 0, 1],
        [3, 0, 1],
        [4, 0, 1],
        [5, 0, 1],
        [8, 5, 1],
      ],
      [8, 5],
      [6, 0],
      5,
      10,
    );
  });

  test('S4: a diagonal line of 5 disappears for 10 points', async ({ page }) => {
    await expectClearing(
      page,
      [
        [1, 1, 1],
        [2, 2, 1],
        [3, 3, 1],
        [4, 4, 1],
        [8, 5, 1],
      ],
      [8, 5],
      [5, 5],
      5,
      10,
    );
  });

  test('S4: an anti-diagonal line of 5 disappears for 10 points', async ({ page }) => {
    await expectClearing(
      page,
      [
        [1, 6, 1],
        [2, 5, 1],
        [3, 4, 1],
        [4, 3, 1],
        [8, 0, 1],
      ],
      [8, 0],
      [5, 2],
      5,
      10,
    );
  });

  for (const [length, points] of [
    [6, 14],
    [7, 18],
    [8, 22],
    [9, 26],
  ]) {
    test(`S4: a line of ${length} disappears entirely for ${points} points`, async ({ page }) => {
      /** @type {Array<[number, number, number]>} */
      const balls = [];
      for (let col = 0; col < length; col += 1) if (col !== 2) balls.push([8, col, 1]);
      balls.push([4, 2, 1]);
      await expectClearing(page, balls, [4, 2], [8, 2], length, points);
      for (let col = 0; col < length; col += 1) {
        await expect(cell(page, 8, col)).toHaveAttribute('data-color', '0');
      }
    });
  }

  test('S4: a cross of two lines of 5 with a shared ball clears 9 balls for 26 points', async ({
    page,
  }) => {
    await expectClearing(
      page,
      [
        [4, 3, 1],
        [4, 4, 1],
        [4, 5, 1],
        [4, 6, 1],
        [0, 2, 1],
        [1, 2, 1],
        [2, 2, 1],
        [3, 2, 1],
        [8, 8, 1],
      ],
      [8, 8],
      [4, 2],
      9,
      26,
    );
  });

  test('S4: a line of only 4 does not disappear and the score stays', async ({ page }) => {
    await arrange(page, {
      board: rows([[8, 0, 1], [8, 1, 1], [8, 2, 1], [5, 3, 1], BYSTANDER]),
      score: 3,
      preview: [2, 3, 4],
    });
    await move(page, [5, 3], [8, 3]);
    const state = await getState(page);
    expect(state.score).toBe(3);
    for (let col = 0; col < 4; col += 1) {
      await expect(cell(page, 8, col)).toHaveAttribute('data-color', '1');
    }
  });

  test('S4: after a clearing no ball appears and the preview does not change', async ({ page }) => {
    await arrange(page, {
      board: rows([
        [8, 0, 1],
        [8, 1, 1],
        [8, 2, 1],
        [8, 3, 1],
        [6, 4, 1],
        [0, 0, 5],
        [0, 1, 6],
      ]),
      preview: [7, 3, 4],
    });
    await move(page, [6, 4], [8, 4]);
    const state = await getState(page);
    expect(state.board).toEqual(
      rows([
        [0, 0, 5],
        [0, 1, 6],
      ]),
    );
    expect(state.preview).toEqual([7, 3, 4]);
    await expect(page.locator('[data-testid="preview-ball"]')).toHaveCount(3);
  });

  test('S4: a board emptied by a clearing gets 3 balls from the preview and a new preview', async ({
    page,
  }) => {
    await arrange(
      page,
      {
        board: rows([
          [8, 0, 1],
          [8, 1, 1],
          [8, 2, 1],
          [8, 3, 1],
          [6, 4, 1],
        ]),
        preview: [2, 3, 4],
      },
      // Spawned balls land on the first empty cells; the new preview colors are 1, 2, 3.
      [0, 0, 0, 0.0714, 0.2143, 0.3571],
    );
    await move(page, [6, 4], [8, 4]);
    const state = await getState(page);
    expect(state.score).toBe(10);
    expect(state.board.slice(0, 1)).toEqual(['234......']);
    expect(countBalls(state.board)).toBe(3);
    expect(state.preview).toEqual([1, 2, 3]);
  });

  test('S4: the best score follows the score when it is beaten', async ({ page }) => {
    await arrange(page, {
      board: rows([[8, 0, 1], [8, 1, 1], [8, 2, 1], [8, 3, 1], [6, 4, 1], BYSTANDER]),
      score: 14,
      best: 20,
    });
    await move(page, [6, 4], [8, 4]);
    await expect(page.getByTestId('score')).toHaveText('24');
    await expect(page.getByTestId('best-score')).toHaveText('24');
    expect((await getState(page)).best).toBe(24);
  });

  test('S4: the best score stays when it is not beaten', async ({ page }) => {
    await arrange(page, {
      board: rows([[8, 0, 1], [8, 1, 1], [8, 2, 1], [8, 3, 1], [6, 4, 1], BYSTANDER]),
      score: 10,
      best: 50,
    });
    await move(page, [6, 4], [8, 4]);
    await expect(page.getByTestId('score')).toHaveText('20');
    await expect(page.getByTestId('best-score')).toHaveText('50');
  });

  test('S2: clicks are ignored while a clearing animates and it takes at most 1 s', async ({
    page,
  }) => {
    await arrange(page, {
      board: rows([[8, 0, 1], [8, 1, 1], [8, 2, 1], [8, 3, 1], [7, 4, 1], BYSTANDER]),
      preview: [2, 3, 4],
    });
    const duration = await playTimed(page, 'cell-7-4', 'cell-8-4', ['cell-0-8', 'cell-5-5']);
    expect(duration.animating).toBe(true);
    expect(duration.selected).toBeNull();
    expect(duration.ms).toBeLessThanOrEqual(1000);
    expect((await getState(page)).score).toBe(10);
  });
});
