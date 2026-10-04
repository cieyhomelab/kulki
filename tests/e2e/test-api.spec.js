import { expect, test } from '@playwright/test';

const BOARD = [
  '.........',
  '..3......',
  '.........',
  '.....7...',
  '.........',
  '.1.......',
  '.........',
  '....2....',
  '......5..',
];

test.describe('test interface window.__kulki', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
  });

  test('setState shows the given board, score, preview and best score', async ({ page }) => {
    await page.evaluate(
      (board) =>
        /** @type {any} */ (globalThis).__kulki.setState({
          board,
          score: 14,
          preview: [4, 1, 6],
          best: 20,
        }),
      BOARD,
    );

    await expect(page.getByTestId('cell-1-2')).toHaveAttribute('data-color', '3');
    await expect(page.getByTestId('cell-3-5')).toHaveAttribute('data-color', '7');
    await expect(page.getByTestId('cell-8-6')).toHaveAttribute('data-color', '5');
    await expect(page.locator('[data-testid^="cell-"]:not([data-color="0"])')).toHaveCount(5);
    await expect(page.getByTestId('score')).toHaveText('14');
    await expect(page.getByTestId('best-score')).toHaveText('20');
    const balls = page.getByTestId('preview').getByTestId('preview-ball');
    await expect(balls.nth(0)).toHaveAttribute('data-color', '4');
    await expect(balls.nth(1)).toHaveAttribute('data-color', '1');
    await expect(balls.nth(2)).toHaveAttribute('data-color', '6');

    expect(await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState())).toEqual({
      board: BOARD,
      score: 14,
      best: 20,
      preview: [4, 1, 6],
      selected: null,
      over: false,
      record: false,
      animating: false,
      rejected: false,
      soundOn: true,
    });
  });

  test('setState draws a missing preview from the random source', async ({ page }) => {
    await page.evaluate(() => {
      const kulki = /** @type {any} */ (globalThis).__kulki;
      kulki.setRandom({ queue: [0, 0.5, 0.99] });
      kulki.setState({ board: ['.........', ...Array(8).fill('.........')] });
    });
    expect(
      await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState().preview),
    ).toEqual([1, 4, 7]);
  });

  test('setState with an invalid argument throws TypeError and changes nothing', async ({
    page,
  }) => {
    await page.evaluate(
      (board) => /** @type {any} */ (globalThis).__kulki.setState({ board, score: 3 }),
      BOARD,
    );
    const errors = await page.evaluate(() => {
      const kulki = /** @type {any} */ (globalThis).__kulki;
      const attempts = [{ board: ['x'] }, { board: Array(9).fill('.........'), score: -5 }, null];
      return attempts.map((arg) => {
        try {
          kulki.setState(arg);
          return null;
        } catch (error) {
          return {
            type: error instanceof TypeError,
            message: String(/** @type {Error} */ (error).message),
          };
        }
      });
    });
    expect(errors.map((e) => e?.type)).toEqual([true, true, true]);
    expect(errors[0]?.message).toContain('board');
    expect(errors[1]?.message).toContain('score');

    await expect(page.getByTestId('score')).toHaveText('3');
    const state = await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState());
    expect(state.board).toEqual(BOARD);
    expect(state.score).toBe(3);
  });

  test('getSoundLog is empty on a freshly loaded game', async ({ page }) => {
    expect(
      await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getSoundLog()),
    ).toEqual([]);
  });
});
