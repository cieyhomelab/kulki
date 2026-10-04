import { expect, test } from '@playwright/test';

// Addresses are relative (`./`), never `/`: the published game lives under a path.
test('post-deploy: the game opens at the target address', async ({ page }) => {
  const response = await page.goto('./');

  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('board')).toBeVisible();
});
