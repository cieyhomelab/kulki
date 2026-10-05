import { expect, test } from '@playwright/test';
import { arrange, move } from './helpers/game.js';

const IDS = ['app', 'title', 'score-panel', 'best-score-panel', 'board', 'new-game'];

/** A full board in which neighbouring cells always differ, so no line exists. */
const FULL = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
);

/**
 * Reads the left edge and width of the stable layout elements.
 * @param {import('@playwright/test').Page} page
 */
const measure = (page) =>
  page.evaluate(
    (ids) =>
      Object.fromEntries(
        ids.map((id) => {
          const r = globalThis.document
            .querySelector(`[data-testid="${id}"]`)
            ?.getBoundingClientRect();
          return [id, r && { x: r.x, width: r.width }];
        }),
      ),
    IDS,
  );

for (const size of [
  { width: 1024, height: 768 },
  { width: 1920, height: 1080 },
]) {
  test.describe(`S17: dialogs keep the layout in place at ${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    test('S17: the confirmation dialog moves nothing horizontally and spans the app', async ({
      page,
    }) => {
      await arrange(page, { board: ['1' + '.'.repeat(8), ...Array(8).fill('.'.repeat(9))] });
      const before = await measure(page);
      await page.getByTestId('new-game').click();
      const dialog = page.getByTestId('confirm-dialog');
      await expect(dialog).toBeVisible();

      expect(await measure(page)).toEqual(before);
      const box = await dialog.boundingBox();
      expect(box?.width).toBeCloseTo(before.app?.width ?? 0, 0);
    });

    test('S17: the game-over window moves nothing horizontally and spans the app', async ({
      page,
    }) => {
      const board = [...FULL];
      // Moving (1,0) to (0,0) leaves two empty cells that the spawned balls fill.
      board[0] = '..' + board[0].slice(2);
      await arrange(page, { board, score: 42, preview: [6, 7, 1] }, [0.25, 0.5, 0, 0, 0]);
      const before = await measure(page);
      await move(page, [1, 0], [0, 0]);
      const over = page.getByTestId('game-over');
      await expect(over).toBeVisible();

      expect(await measure(page)).toEqual(before);
      const box = await over.boundingBox();
      expect(box?.width).toBeCloseTo(before.app?.width ?? 0, 0);
    });
  });
}
