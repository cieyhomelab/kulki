import { expect, test } from '@playwright/test';

test.describe('start screen', () => {
  test('opens when served from static hosting', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Kulki');
    await expect(page.getByRole('heading', { name: 'Kulki' })).toBeVisible();
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
  });

  test('opens when the file is loaded straight from disk', async ({ page }) => {
    const fileUrl = process.env.E2E_FILE_URL;
    test.skip(!fileUrl, 'E2E_FILE_URL is not set');

    await page.goto(/** @type {string} */ (fileUrl));

    await expect(page.getByRole('heading', { name: 'Kulki' })).toBeVisible();
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
  });
});
