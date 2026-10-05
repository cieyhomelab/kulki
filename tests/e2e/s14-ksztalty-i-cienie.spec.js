import { expect, test } from '@playwright/test';
import { arrange, rows } from './helpers/game.js';

const BALLS = /** @type {Array<[number, number, number]>} */ ([[0, 0, 1]]);
const SQUARE = [
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
];

/**
 * Reads the computed radii and box shadow of an element.
 * @param {import('@playwright/test').Page} page
 * @param {string} id
 */
function readLook(page, id) {
  return page.getByTestId(id).evaluate((el, props) => {
    const s = globalThis.getComputedStyle(el);
    return {
      radii: props.map((p) => s.getPropertyValue(p)),
      shadow: s.boxShadow,
      transition: s.transitionDuration,
    };
  }, SQUARE);
}

/**
 * Parses a computed `box-shadow` into its layers (offsets, blur, spread).
 * @param {string} shadow
 */
function layers(shadow) {
  if (shadow === 'none') return [];
  return shadow.split(/,(?![^(]*\))/).map((layer) => {
    const nums = (layer.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g) ?? []).map(parseFloat);
    return {
      x: nums[0],
      y: nums[1],
      blur: nums[2],
      spread: nums[3] ?? 0,
      inset: /inset/.test(layer),
    };
  });
}

/** @param {import('@playwright/test').Page} page @param {string} id */
async function expectHardShadow(page, id) {
  const found = layers((await readLook(page, id)).shadow);
  expect(found, id).toHaveLength(1);
  expect(found[0].x, id).toBeGreaterThan(0);
  expect(found[0].y, id).toBeGreaterThan(0);
  expect(found[0].blur, id).toBe(0);
  expect(found[0].spread, id).toBe(0);
  expect(found[0].inset, id).toBe(false);
}

/** @param {import('@playwright/test').Page} page */
async function showGameOver(page) {
  const board = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
  );
  await arrange(page, { board, score: 20, best: 10, over: true, record: true });
  await expect(page.getByTestId('game-over')).toBeVisible();
}

test.describe('S14: square corners, hard shadows and pressed buttons', () => {
  test('S14: interface elements have square corners and balls are round', async ({ page }) => {
    await arrange(page, { board: rows(BALLS), score: 1, best: 2, preview: [1, 2, 3] });
    const ids = [
      'board',
      'cell-0-0',
      'cell-4-4',
      'score-panel',
      'best-score-panel',
      'preview',
      'new-game',
      'sound-toggle',
    ];
    await page.getByTestId('new-game').click();
    ids.push('confirm-dialog', 'confirm-yes', 'confirm-no');
    for (const id of ids) {
      expect((await readLook(page, id)).radii, id).toEqual(['0px', '0px', '0px', '0px']);
    }
    await showGameOver(page);
    for (const id of ['game-over', 'game-over-new-game']) {
      expect((await readLook(page, id)).radii, id).toEqual(['0px', '0px', '0px', '0px']);
    }
    for (const id of ['ball-0-0', 'preview-ball']) {
      const radius = await page
        .getByTestId(id)
        .first()
        .evaluate((el) => {
          const s = globalThis.getComputedStyle(el);
          return { r: s.borderTopLeftRadius, w: el.getBoundingClientRect().width };
        });
      expect(radius.r, id).toBe('50%');
    }
  });

  test('S14: panels, buttons and dialogs have one hard shadow down and to the right', async ({
    page,
  }) => {
    await arrange(page, { board: rows(BALLS), score: 1, best: 2, preview: [1, 2, 3] });
    for (const id of ['score-panel', 'best-score-panel', 'preview', 'new-game', 'sound-toggle']) {
      await expectHardShadow(page, id);
    }
    await page.getByTestId('new-game').click();
    for (const id of ['confirm-dialog', 'confirm-yes', 'confirm-no'])
      await expectHardShadow(page, id);
    await showGameOver(page);
    for (const id of ['game-over', 'game-over-new-game']) await expectHardShadow(page, id);
  });

  test('S14: buttons have no transition', async ({ page }) => {
    await arrange(page, { board: rows(BALLS), score: 1, best: 2, preview: [1, 2, 3] });
    for (const id of ['new-game', 'sound-toggle']) {
      expect((await readLook(page, id)).transition, id).toBe('0s');
    }
  });

  /**
   * Holds the mouse button on the element, compares with rest, releases and compares again.
   * @param {import('@playwright/test').Page} page
   * @param {string} id
   */
  async function checkPress(page, id) {
    const button = page.getByTestId(id);
    const rest = /** @type {{ x: number; y: number; width: number; height: number }} */ (
      await button.boundingBox()
    );
    const restShadow = layers((await readLook(page, id)).shadow)[0];
    await page.mouse.move(rest.x + rest.width / 2, rest.y + rest.height / 2);
    await page.mouse.down();
    try {
      await expect
        .poll(async () => ((await button.boundingBox())?.x ?? 0) - rest.x, { message: `${id} x` })
        .toBeGreaterThan(0);
      const down = /** @type {{ x: number; y: number }} */ (await button.boundingBox());
      expect(down.y - rest.y, id).toBeGreaterThan(0);
      const pressed = layers((await readLook(page, id)).shadow)[0];
      expect(!pressed || pressed.x < restShadow.x, id).toBe(true);
    } finally {
      // Release away from the button so that no click (and no action) happens.
      await page.mouse.move(0, 0);
      await page.mouse.up();
    }
  }

  /** @param {import('@playwright/test').Page} page @param {string} id */
  async function expectRest(page, id, /** @type {{ x: number; y: number }} */ rest) {
    await expect
      .poll(
        async () => {
          const box = await page.getByTestId(id).boundingBox();
          return box ? { x: box.x, y: box.y } : null;
        },
        { message: `${id} rest` },
      )
      .toEqual(rest);
  }

  test('S14: the top buttons move down-right when pressed and return when released', async ({
    page,
  }) => {
    await arrange(page, { board: rows(BALLS), score: 1, best: 2, preview: [1, 2, 3] });
    for (const id of ['sound-toggle', 'new-game']) {
      const box = /** @type {{ x: number; y: number }} */ (
        await page.getByTestId(id).boundingBox()
      );
      const rest = { x: box.x, y: box.y };
      const shadow = (await readLook(page, id)).shadow;
      await checkPress(page, id);
      await page.mouse.move(0, 0);
      await expectRest(page, id, rest);
      expect((await readLook(page, id)).shadow, id).toBe(shadow);
    }
  });

  test('S14: the confirmation buttons move when pressed and return when released', async ({
    page,
  }) => {
    await arrange(page, { board: rows(BALLS), score: 1, best: 2, preview: [1, 2, 3] });
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    const box = /** @type {{ x: number; y: number }} */ (
      await page.getByTestId('confirm-no').boundingBox()
    );
    const rest = { x: box.x, y: box.y };
    const yes = /** @type {{ x: number; y: number }} */ (
      await page.getByTestId('confirm-yes').boundingBox()
    );
    const yesRest = { x: yes.x, y: yes.y };
    const shadow = (await readLook(page, 'confirm-no')).shadow;
    await checkPress(page, 'confirm-yes');
    await expectRest(page, 'confirm-yes', yesRest);
    expect((await readLook(page, 'confirm-yes')).shadow).toBe(shadow);
    await checkPress(page, 'confirm-no');
    await expectRest(page, 'confirm-no', rest);
    expect((await readLook(page, 'confirm-no')).shadow).toBe(shadow);
  });

  test('S14: the game-over button moves when pressed and returns when released', async ({
    page,
  }) => {
    await showGameOver(page);
    const box = /** @type {{ x: number; y: number }} */ (
      await page.getByTestId('game-over-new-game').boundingBox()
    );
    const rest = { x: box.x, y: box.y };
    const shadow = (await readLook(page, 'game-over-new-game')).shadow;
    await checkPress(page, 'game-over-new-game');
    await page.mouse.move(0, 0);
    await expectRest(page, 'game-over-new-game', rest);
    expect((await readLook(page, 'game-over-new-game')).shadow).toBe(shadow);
  });
});
