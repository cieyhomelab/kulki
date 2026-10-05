import { expect, test } from '@playwright/test';
import { arrange, cell, getState, move } from './helpers/game.js';

const crt = (/** @type {import('@playwright/test').Page} */ page) => page.getByTestId('crt');

test.describe('S15: CRT effect', () => {
  test('S15: covers the whole window, including dialogs', async ({ page }) => {
    await arrange(page, { board: Array(9).fill('.........'), score: 5, preview: [1, 2, 3] });
    const viewport = /** @type {{width: number, height: number}} */ (page.viewportSize());

    const box = await crt(page).boundingBox();
    expect(box).toEqual({ x: 0, y: 0, width: viewport.width, height: viewport.height });

    await page.getByTestId('new-game').click();
    const dialog = page.getByTestId('confirm-dialog');
    await expect(dialog).toBeVisible();
    const dialogBox = /** @type {NonNullable<Awaited<ReturnType<typeof dialog.boundingBox>>>} */ (
      await dialog.boundingBox()
    );
    const covering = /** @type {NonNullable<typeof box>} */ (await crt(page).boundingBox());
    expect(covering.x).toBeLessThanOrEqual(dialogBox.x);
    expect(covering.y).toBeLessThanOrEqual(dialogBox.y);
    expect(covering.x + covering.width).toBeGreaterThanOrEqual(dialogBox.x + dialogBox.width);
    expect(covering.y + covering.height).toBeGreaterThanOrEqual(dialogBox.y + dialogBox.height);
    const appBox =
      /** @type {NonNullable<Awaited<ReturnType<ReturnType<typeof page.getByTestId>['boundingBox']>>>} */ (
        await page.getByTestId('app').boundingBox()
      );
    expect(covering.x + covering.width).toBeGreaterThanOrEqual(appBox.x + appBox.width);
    expect(covering.y + covering.height).toBeGreaterThanOrEqual(appBox.y + appBox.height);
  });

  test('S15: covers the game-over message', async ({ page }) => {
    const grid = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)),
    );
    grid[0][0] = '.';
    grid[0][1] = '.';
    grid[1][0] = '.';
    await arrange(
      page,
      { board: grid.map((r) => r.join('')), score: 1, preview: [6, 7, 1] },
      [0.25, 0.5, 0, 0, 0],
    );
    await move(page, [1, 1], [0, 0]);
    const over = page.getByTestId('game-over');
    await expect(over).toBeVisible();
    const o = /** @type {NonNullable<Awaited<ReturnType<typeof over.boundingBox>>>} */ (
      await over.boundingBox()
    );
    const c =
      /** @type {NonNullable<Awaited<ReturnType<ReturnType<typeof crt>['boundingBox']>>>} */ (
        await crt(page).boundingBox()
      );
    expect(c.x).toBeLessThanOrEqual(o.x);
    expect(c.y).toBeLessThanOrEqual(o.y);
    expect(c.x + c.width).toBeGreaterThanOrEqual(o.x + o.width);
    expect(c.y + c.height).toBeGreaterThanOrEqual(o.y + o.height);
  });

  test('S15: does not intercept clicks', async ({ page }) => {
    await arrange(page, {
      board: ['1........', ...Array(8).fill('.........')],
      score: 0,
      preview: [2, 2, 2],
    });
    await expect(crt(page)).toHaveCSS('pointer-events', 'none');

    await cell(page, 0, 0).click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-selected', 'true');
    await cell(page, 0, 0).click();
    await expect(cell(page, 0, 0)).toHaveAttribute('data-selected', 'false');

    await page.getByTestId('sound-toggle').click();
    await expect(page.getByTestId('sound-toggle')).toHaveText('Dźwięk: wyciszony');

    await page.getByTestId('new-game').click();
    await page.getByTestId('confirm-no').click();
    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    await page.getByTestId('new-game').click();
    await page.getByTestId('confirm-yes').click();
    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    expect((await getState(page)).score).toBe(0);
  });

  test('S15: is static: no animations and identical screenshots', async ({ page }) => {
    await arrange(page, { board: Array(9).fill('.........'), score: 0, preview: [1, 2, 3] });
    await page.locator('[data-testid="board"][data-animating="false"]').waitFor();
    await page.evaluate(() => globalThis.document.fonts.ready);

    expect(await page.evaluate(() => globalThis.document.getAnimations().length)).toBe(0);
    const first = await page.screenshot();
    const second = await page.screenshot();
    expect(second.equals(first)).toBe(true);
    await expect(crt(page)).toHaveCSS('transition-duration', '0s');
    await expect(crt(page)).toHaveCSS('animation-name', 'none');
  });

  test('S15: adds no visible text and is absent from the accessibility tree', async ({ page }) => {
    await arrange(page, { board: Array(9).fill('.........'), score: 0, preview: [1, 2, 3] });
    await expect(crt(page)).toHaveText('');
    await expect(crt(page)).toHaveAttribute('aria-hidden', 'true');
    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
    expect(bodyText).toBe(
      'KULKI Wynik 0 Najlepszy wynik 0 Następne kulki Nowa gra Dźwięk: włączony',
    );
    const tree = await page.locator('body').ariaSnapshot();
    expect(tree).not.toContain('crt');
  });

  test('S15: is visible when the file is opened straight from disk', async ({ page }) => {
    const fileUrl = process.env.E2E_FILE_URL;
    test.skip(!fileUrl, 'E2E_FILE_URL is not set');
    await page.goto(/** @type {string} */ (fileUrl));
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');

    await expect(crt(page)).toBeVisible();
    const viewport = /** @type {{width: number, height: number}} */ (page.viewportSize());
    expect(await crt(page).boundingBox()).toEqual({
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
    const background = await crt(page).evaluate(
      (el) => globalThis.getComputedStyle(el).backgroundImage,
    );
    expect(background).toContain('repeating-linear-gradient');
    expect(background).toContain('radial-gradient');
  });
});
