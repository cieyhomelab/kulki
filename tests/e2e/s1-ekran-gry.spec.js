import { expect, test } from '@playwright/test';

test.describe('S1: game screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
  });

  test('S1: shows Polish captions, buttons and sound state', async ({ page }) => {
    const app = page.getByTestId('app');
    await expect(app.getByText('Wynik', { exact: true })).toBeVisible();
    await expect(app.getByText('Najlepszy wynik', { exact: true })).toBeVisible();
    await expect(app.getByText('Następne kulki', { exact: true })).toBeVisible();
    await expect(page.getByTestId('new-game')).toHaveText('Nowa gra');
    await expect(page.getByTestId('sound-toggle')).toHaveText('Dźwięk: włączony');

    const text = await app.innerText();
    expect(text.replace(/\s+/g, ' ').trim()).toBe(
      'Kulki Wynik 0 Najlepszy wynik 0 Następne kulki Nowa gra Dźwięk: włączony',
    );
  });

  test('S1: fits at 1024x768 without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    const overflow = await page.locator('html').evaluate((root) => {
      return {
        x: root.scrollWidth - root.clientWidth,
        y: root.scrollHeight - root.clientHeight,
      };
    });
    expect(overflow.x).toBeLessThanOrEqual(0);
    expect(overflow.y).toBeLessThanOrEqual(0);

    for (const id of ['board', 'score', 'best-score', 'preview', 'new-game', 'sound-toggle']) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box, id).not.toBeNull();
      const b = /** @type {NonNullable<typeof box>} */ (box);
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(1024);
      expect(b.y + b.height).toBeLessThanOrEqual(768);
    }
  });

  test('S1: sound button toggles label and aria-pressed', async ({ page }) => {
    const button = page.getByTestId('sound-toggle');
    await expect(button).toHaveAttribute('aria-pressed', 'true');

    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toHaveText('Dźwięk: wyciszony');

    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveText('Dźwięk: włączony');

    expect(await page.evaluate(() => globalThis.localStorage.length)).toBe(0);
  });

  test('S1: exposes the DOM contract', async ({ page }) => {
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'false');
    await expect(page.getByTestId('board')).toHaveAttribute('data-rejected', 'false');
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(81);
    await expect(
      page.locator('[data-testid^="cell-"][data-color="0"][data-selected="false"]'),
    ).toHaveCount(81);
    await expect(page.getByTestId('cell-0-0')).toBeVisible();
    await expect(page.getByTestId('cell-8-8')).toBeVisible();
    await expect(page.getByTestId('score')).toHaveText('0');
    await expect(page.getByTestId('best-score')).toHaveText('0');
    await expect(page.getByTestId('preview').getByTestId('preview-ball')).toHaveCount(3);
  });
});
