// Helpers for post-deploy tests that play on the game at the target address.
// Addresses are relative (`./`): the published game lives under a path.

/** @param {import('@playwright/test').Page} page @param {number} row @param {number} col */
export const cell = (page, row, col) => page.getByTestId(`cell-${row}-${col}`);

/** @param {import('@playwright/test').Page} page */
export const getState = (page) =>
  page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState());

/**
 * Opens the game and waits until `window.__kulki` is usable.
 * @param {import('@playwright/test').Page} page
 */
export async function openGame(page) {
  await page.goto('./');
  await page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();
}

/**
 * Sets a layout and predictable randomness through the test interface.
 * @param {import('@playwright/test').Page} page
 * @param {object} state argument of `window.__kulki.setState`
 */
export async function arrange(page, state) {
  await page.evaluate((state) => {
    const api = /** @type {any} */ (globalThis).__kulki;
    api.setRandom({ queue: [0, 0, 0, 0, 0, 0] });
    api.setState(state);
  }, state);
}

/**
 * Board rows with `.` for empty cells, from `[row, col, color]` triples.
 * @param {Array<[number, number, number]>} balls
 * @returns {string[]}
 */
export function rows(balls) {
  const grid = Array.from({ length: 9 }, () => Array(9).fill('.'));
  for (const [row, col, color] of balls) grid[row][col] = String(color);
  return grid.map((r) => r.join(''));
}

/**
 * Plays one move by clicking and waits for the animation to end.
 * @param {import('@playwright/test').Page} page
 * @param {[number, number]} from
 * @param {[number, number]} to
 */
export async function move(page, from, to) {
  await cell(page, ...from).click();
  await cell(page, ...to).click();
  await page.locator('[data-testid="board"][data-animating="false"]').waitFor();
}
