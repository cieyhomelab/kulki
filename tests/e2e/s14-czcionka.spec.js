import { expect, test } from '@playwright/test';
import { arrange, rows } from './helpers/game.js';
import { readFit, readFont, readProbe } from './helpers/font.js';

const DIACRITICS = 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ';
const BALLS = /** @type {Array<[number, number, number]>} */ ([[0, 0, 1]]);

/**
 * Shows the end-of-game message with the new-record line, as S7 does: on a full board without lines.
 * @param {import('@playwright/test').Page} page
 * @param {number} score
 */
async function endGameWithRecord(page, score) {
  const board = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
  );
  await arrange(page, { board, score, best: 10, over: true, record: true });
  await expect(page.getByTestId('game-over-record')).toBeVisible();
}

/**
 * The element is set in the game font: loaded, first in the font stack, every character one em wide.
 * @param {import('@playwright/test').Locator} locator
 * @param {string} label
 */
async function expectGameFont(locator, label) {
  const font = await readFont(locator);
  expect(font.loaded, label).toBe(true);
  expect(font.family, label).toBe('Press Start 2P');
  expect(font.exact, `${label}: ${JSON.stringify(font)}`).toBe(true);
}

/** @param {import('@playwright/test').Page} page @param {string} chars */
async function expectProbeInGameFont(page, chars) {
  const probe = await readProbe(page, chars);
  expect(probe.loaded).toBe(true);
  expect(probe.family).toBe('Press Start 2P');
  expect(probe.exact, JSON.stringify(probe)).toBe(true);
}

test.describe('S14: game font', () => {
  test('S14: title, labels, values, preview and both buttons use the game font', async ({
    page,
  }) => {
    await arrange(page, { board: rows(BALLS), score: 123456, best: 654321, preview: [1, 2, 3] });

    for (const id of ['score', 'best-score', 'new-game', 'sound-toggle']) {
      await expectGameFont(page.getByTestId(id), id);
    }
    // Title, labels and the preview caption have no test id yet; they are found by text.
    for (const text of ['Kulki', 'Wynik', 'Najlepszy wynik', 'Następne kulki']) {
      await expectGameFont(page.getByText(text, { exact: true }).first(), text);
    }
  });

  test('S14: the confirmation question and its buttons use the game font', async ({ page }) => {
    await arrange(page, { board: rows(BALLS), score: 5, best: 9, preview: [1, 2, 3] });
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();

    await expectGameFont(page.getByTestId('confirm-dialog').locator('span').first(), 'question');
    await expectGameFont(page.getByTestId('confirm-yes'), 'confirm-yes');
    await expectGameFont(page.getByTestId('confirm-no'), 'confirm-no');
  });

  test('S14: the game-over message with a new record uses the game font', async ({ page }) => {
    await endGameWithRecord(page, 42);

    for (const id of ['game-over-score', 'game-over-record', 'game-over-new-game']) {
      await expectGameFont(page.getByTestId(id), id);
    }
    await expectGameFont(page.getByTestId('game-over').locator('strong'), 'game-over title');
  });

  test('S14: each of the 18 Polish diacritics is drawn with the game font', async ({ page }) => {
    await page.goto('/');

    expect([...DIACRITICS]).toHaveLength(18);
    await expectProbeInGameFont(page, DIACRITICS);
  });

  test('S14: the game font is there without any request beyond the game file', async ({ page }) => {
    const requests = /** @type {string[]} */ ([]);
    page.on('request', (r) => {
      if (!r.url().startsWith('data:')) requests.push(r.url());
    });
    await page.goto('/');
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');

    await expectProbeInGameFont(page, DIACRITICS);
    await expectGameFont(page.getByTestId('new-game'), 'new-game');
    expect(requests.map((url) => new URL(url).pathname)).toEqual(['/']);
  });

  test('S14: everything fits in 1024×768, also with the question and the record message', async ({
    page,
  }) => {
    await arrange(page, { board: rows(BALLS), score: 999999, best: 999999, preview: [1, 2, 3] });
    const base = ['score', 'best-score', 'new-game', 'sound-toggle'];
    expect(await readFit(page, base)).toEqual({ scrollsX: false, scrollsY: false, clipped: [] });

    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    expect(await readFit(page, [...base, 'confirm-dialog', 'confirm-yes', 'confirm-no'])).toEqual({
      scrollsX: false,
      scrollsY: false,
      clipped: [],
    });
  });

  test('S14: the game-over message with a record fits in 1024×768', async ({ page }) => {
    await endGameWithRecord(page, 999999);

    const ids = ['score', 'best-score', 'game-over', 'game-over-new-game', 'game-over-record'];
    expect(await readFit(page, ids)).toEqual({ scrollsX: false, scrollsY: false, clipped: [] });
  });

  test('S16: the game font is used when the file is opened straight from disk', async ({
    page,
  }) => {
    const fileUrl = process.env.E2E_FILE_URL;
    test.skip(!fileUrl, 'E2E_FILE_URL is not set');
    await page.goto(/** @type {string} */ (fileUrl));
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');

    await expectProbeInGameFont(page, DIACRITICS);
    await expectGameFont(page.getByTestId('score'), 'score');
    await expectGameFont(page.getByTestId('new-game'), 'new-game');
  });
});
