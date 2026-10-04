/** Shared helpers for the E2E scenarios that play whole turns. */

/** @param {import('@playwright/test').Page} page @param {number} row @param {number} col */
export const cell = (page, row, col) => page.getByTestId(`cell-${row}-${col}`);

/** @param {import('@playwright/test').Page} page */
export const getState = (page) =>
  page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState());

/**
 * Opens the game and sets a layout and predictable randomness.
 * @param {import('@playwright/test').Page} page
 * @param {object} state argument of `window.__kulki.setState`
 * @param {number[]} [queue] values for `window.__kulki.setRandom`
 */
export async function arrange(page, state, queue = [0, 0, 0, 0, 0, 0]) {
  await page.goto('/');
  await expect_ready(page);
  await page.evaluate(
    ({ state, queue }) => {
      const api = /** @type {any} */ (globalThis).__kulki;
      api.setRandom({ queue });
      api.setState(state);
    },
    { state, queue },
  );
}

/** @param {import('@playwright/test').Page} page */
async function expect_ready(page) {
  await page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();
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

/** @param {number} color value that makes `randomColor` return `color` */
export const colorValue = (color) => (color - 1 + 0.5) / 7;

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
 * Number of balls on a board snapshot.
 * @param {string[]} board
 */
export const countBalls = (board) => board.join('').replaceAll('.', '').length;

/**
 * Plays a move through `click()` calls in one task, then clicks two other cells while the turn
 * animates and waits for the end. Reports whether the board was animating, whether those clicks
 * selected anything, and how long the whole turn took in milliseconds.
 * @param {import('@playwright/test').Page} page
 * @param {string} from test id of the ball to move
 * @param {string} to test id of the target cell
 * @param {string[]} extra test ids clicked during the animation
 * @returns {Promise<{ ms: number, animating: boolean, selected: unknown }>}
 */
export function playTimed(page, from, to, extra) {
  return page.evaluate(
    async ({ from, to, extra }) => {
      const doc = globalThis.document;
      const click = (/** @type {string} */ id) =>
        /** @type {HTMLElement} */ (doc.querySelector(`[data-testid="${id}"]`)).click();
      const board = /** @type {HTMLElement} */ (doc.querySelector('[data-testid="board"]'));
      const started = performance.now();
      click(from);
      click(to);
      const animating = board.dataset.animating === 'true';
      extra.forEach(click);
      const selected = /** @type {any} */ (globalThis).__kulki.getState().selected;
      await new Promise((resolve) => {
        const poll = () =>
          board.dataset.animating === 'false'
            ? resolve(null)
            : globalThis.requestAnimationFrame(poll);
        poll();
      });
      return { ms: performance.now() - started, animating, selected };
    },
    { from, to, extra },
  );
}
