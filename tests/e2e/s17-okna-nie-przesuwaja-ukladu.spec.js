import { expect, test } from '@playwright/test';
import { arrange, move } from './helpers/game.js';

const IDS = [
  'app',
  'hero',
  'title',
  'score-panel',
  'best-score-panel',
  'preview',
  'board',
  'new-game',
  'sound-toggle',
];

/** A full board in which neighbouring cells always differ, so no line exists. */
const FULL = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
);

/**
 * Reads the rectangle of the stable layout elements.
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
          return [id, r && { x: r.x, y: r.y, width: r.width, height: r.height }];
        }),
      ),
    IDS,
  );

/**
 * The window is the last child of the sidebar, below the sound button and inside the column.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} dialog
 */
async function expectInSidebar(page, dialog) {
  const last = await page
    .getByTestId('sidebar')
    .evaluate((el) => el.lastElementChild?.getAttribute('data-testid'));
  expect(last).toBe(await dialog.getAttribute('data-testid'));
  const box = /** @type {NonNullable<Awaited<ReturnType<typeof dialog.boundingBox>>>} */ (
    await dialog.boundingBox()
  );
  const side = /** @type {NonNullable<typeof box>} */ (
    await page.getByTestId('sidebar').boundingBox()
  );
  const sound = /** @type {NonNullable<typeof box>} */ (
    await page.getByTestId('sound-toggle').boundingBox()
  );
  expect(box.y).toBeGreaterThanOrEqual(sound.y + sound.height);
  expect(box.x).toBeGreaterThanOrEqual(side.x);
  expect(box.x + box.width).toBeLessThanOrEqual(side.x + side.width);
  const viewport = /** @type {{ width: number, height: number }} */ (page.viewportSize());
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  const clipped = await dialog.evaluate((el) =>
    [el, ...el.querySelectorAll('*')].some((n) => n.scrollWidth > n.clientWidth + 1),
  );
  expect(clipped).toBe(false);
}

for (const size of [
  { width: 1024, height: 768 },
  { width: 1920, height: 1080 },
]) {
  test.describe(`S17: dialogs keep the layout in place at ${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    test('S17: the confirmation dialog moves nothing and sits in the sidebar', async ({ page }) => {
      await arrange(page, { board: ['1' + '.'.repeat(8), ...Array(8).fill('.'.repeat(9))] });
      const before = await measure(page);
      await page.getByTestId('new-game').click();
      const dialog = page.getByTestId('confirm-dialog');
      await expect(dialog).toBeVisible();

      expect(await measure(page)).toEqual(before);
      await expectInSidebar(page, dialog);
    });

    test('S17: the game-over window moves nothing and sits in the sidebar', async ({ page }) => {
      const board = [...FULL];
      // Moving (1,0) to (0,0) leaves two empty cells that the spawned balls fill.
      board[0] = '..' + board[0].slice(2);
      await arrange(page, { board, score: 42, preview: [6, 7, 1] }, [0.25, 0.5, 0, 0, 0]);
      const before = await measure(page);
      await move(page, [1, 0], [0, 0]);
      const over = page.getByTestId('game-over');
      await expect(over).toBeVisible();

      expect(await measure(page)).toEqual(before);
      await expectInSidebar(page, over);
    });
  });
}
