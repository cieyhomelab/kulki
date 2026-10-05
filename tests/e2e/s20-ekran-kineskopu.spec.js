import { expect, test } from '@playwright/test';
import { arrange, cell, getState } from './helpers/game.js';
import { contrast, readTextColors } from './helpers/contrast.js';
import {
  cornerLuminances,
  insideRoundedRect,
  readScreen,
  rectInsideScreen,
} from './helpers/screen.js';

const EMPTY = Array(9).fill('.........');
const SIZES = [
  { width: 1024, height: 768 },
  { width: 1920, height: 1080 },
];

/** @param {import('@playwright/test').Page} page */
const crt = (page) => page.getByTestId('crt');
/** @param {import('@playwright/test').Page} page */
const glare = (page) => page.getByTestId('crt-glare');

/** @param {import('@playwright/test').Page} page @param {string} selector */
const rectOf = async (page, selector) =>
  /** @type {import('./helpers/screen.js').Rect} */ (
    await page.locator(selector).first().boundingBox()
  );

/** Board that ends the game on the next move, as in S15. */
const gameOverState = () => {
  const grid = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)),
  );
  grid[0][0] = '.';
  grid[0][1] = '.';
  grid[1][0] = '.';
  return { board: grid.map((r) => r.join('')), score: 1, preview: [6, 7, 1] };
};

test.describe('S20: convex CRT screen', () => {
  for (const size of SIZES) {
    test(`S20: covers the window, has rounded corners and black outside at ${size.width}x${size.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
      await page.evaluate(() => globalThis.document.fonts.ready);

      const screen = await readScreen(page);
      expect(screen.rect).toEqual({ x: 0, y: 0, width: size.width, height: size.height });
      expect(screen.radii).toHaveLength(4);
      for (const radius of screen.radii) {
        expect(radius).toBeGreaterThanOrEqual(0.02 * Math.min(size.width, size.height));
      }
      expect(new Set(screen.radii).size).toBe(1);

      await page.getByTestId('new-game').click();
      await expect(page.getByTestId('confirm-dialog')).toBeVisible();
      const withDialog = await readScreen(page);
      const dialog = await rectOf(page, '[data-testid="confirm-dialog"]');
      expect(withDialog.rect.x).toBeLessThanOrEqual(dialog.x);
      expect(withDialog.rect.y).toBeLessThanOrEqual(dialog.y);
      expect(withDialog.rect.x + withDialog.rect.width).toBeGreaterThanOrEqual(
        dialog.x + dialog.width,
      );
      expect(withDialog.rect.y + withDialog.rect.height).toBeGreaterThanOrEqual(
        dialog.y + dialog.height,
      );

      for (const luminance of await cornerLuminances(page)) {
        expect(luminance).toBeLessThanOrEqual(0.01);
      }
    });
  }

  test('S20: interface, title and dialogs lie inside the screen edge at 1024x768', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
    await page.evaluate(() => globalThis.document.fonts.ready);
    const screen = await readScreen(page);
    const radius = screen.radii[0];

    const check = async (/** @type {string} */ selector) => {
      const box = await rectOf(page, selector);
      expect(rectInsideScreen(box, screen.rect, radius), selector).toBe(true);
    };
    for (const selector of [
      'h1',
      '[data-testid="board"]',
      '[data-testid="score-panel"]',
      '[data-testid="best-score-panel"]',
      '[data-testid="preview"]',
      '[data-testid="new-game"]',
      '[data-testid="sound-toggle"]',
    ]) {
      await check(selector);
    }

    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await check('[data-testid="confirm-dialog"]');
    await check('[data-testid="board"]');
    await page.getByTestId('confirm-no').click();

    await arrange(page, gameOverState(), [0.25, 0.5, 0, 0, 0]);
    await cell(page, 1, 1).click();
    await cell(page, 0, 0).click();
    await expect(page.getByTestId('game-over')).toBeVisible();
    await check('[data-testid="game-over"]');
    await check('[data-testid="board"]');
    await check('[data-testid="new-game"]');
  });

  test('S20: the 81 cells are undistorted squares in straight rows and columns', async ({
    page,
  }) => {
    await arrange(page, { board: EMPTY, score: 0, preview: [1, 2, 3] });
    await page.evaluate(() => globalThis.document.fonts.ready);
    const boxes = await page.evaluate(() =>
      Array.from({ length: 81 }, (_, i) => {
        const r = /** @type {Element} */ (
          globalThis.document.querySelector(`[data-testid="cell-${Math.floor(i / 9)}-${i % 9}"]`)
        ).getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }),
    );
    expect(boxes).toHaveLength(81);
    for (const b of boxes) {
      expect(Math.abs(b.width - b.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(b.width - boxes[0].width)).toBeLessThanOrEqual(1);
      expect(Math.abs(b.height - boxes[0].height)).toBeLessThanOrEqual(1);
    }
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const b = boxes[row * 9 + col];
        expect(Math.abs(b.y - boxes[row * 9].y)).toBeLessThanOrEqual(1);
        expect(Math.abs(b.x - boxes[col].x)).toBeLessThanOrEqual(1);
      }
    }
  });

  test('S20: the glare exists, lies inside the screen, has no text and is hidden from assistive technology', async ({
    page,
  }) => {
    await arrange(page, { board: EMPTY, score: 0, preview: [1, 2, 3] });
    await expect(glare(page)).toHaveCount(1);
    await expect(glare(page)).toHaveText('');
    await expect(glare(page)).toHaveAttribute('aria-hidden', 'true');
    expect(await glare(page).evaluate((el) => el.childNodes.length)).toBe(0);
    await expect(glare(page)).not.toHaveCSS('background-image', 'none');
    await expect(glare(page)).toHaveCSS('position', 'fixed');

    const box = await rectOf(page, '[data-testid="crt-glare"]');
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
    const screen = await readScreen(page);
    expect(rectInsideScreen(box, screen.rect, screen.radii[0])).toBe(true);

    const tree = await page.locator('body').ariaSnapshot();
    expect(tree).not.toContain('glare');
    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
    expect(bodyText).toBe(
      'Kulki Wynik 0 Najlepszy wynik 0 Następne kulki Nowa gra Dźwięk: włączony',
    );
  });

  test('S20: the screen, edge and glare do not intercept clicks', async ({ page }) => {
    await arrange(page, { board: EMPTY, score: 0, preview: [1, 2, 3] });
    await expect(crt(page)).toHaveCSS('pointer-events', 'none');
    await expect(glare(page)).toHaveCSS('pointer-events', 'none');

    const g = await rectOf(page, '[data-testid="crt-glare"]');
    const targets = await page.evaluate((glareBox) => {
      const hits = new Set(['0-0', '0-8', '8-0', '8-8']);
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const b = /** @type {Element} */ (
            globalThis.document.querySelector(`[data-testid="cell-${r}-${c}"]`)
          ).getBoundingClientRect();
          const overlaps =
            b.x < glareBox.x + glareBox.width &&
            b.x + b.width > glareBox.x &&
            b.y < glareBox.y + glareBox.height &&
            b.y + b.height > glareBox.y;
          if (overlaps) hits.add(`${r}-${c}`);
        }
      }
      return [...hits].map((k) => k.split('-').map(Number));
    }, g);

    const board = Array.from({ length: 9 }, () => Array(9).fill('.'));
    targets.forEach(([r, c], i) => {
      board[r][c] = String((i % 7) + 1);
    });
    await page.evaluate((state) => /** @type {any} */ (globalThis).__kulki.setState(state), {
      board: board.map((r) => r.join('')),
      score: 0,
      preview: [1, 2, 3],
    });
    for (const [r, c] of targets) {
      await cell(page, r, c).click();
      await expect(cell(page, r, c)).toHaveAttribute('data-selected', 'true');
      await cell(page, r, c).click();
      await expect(cell(page, r, c)).toHaveAttribute('data-selected', 'false');
    }

    await page.getByTestId('sound-toggle').click();
    await expect(page.getByTestId('sound-toggle')).toHaveText('Dźwięk: wyciszony');
    await page.getByTestId('new-game').click();
    await page.getByTestId('confirm-no').click();
    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    await page.getByTestId('new-game').click();
    await page.getByTestId('confirm-yes').click();
    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    expect((await getState(page)).score).toBe(0);

    await arrange(page, gameOverState(), [0.25, 0.5, 0, 0, 0]);
    await cell(page, 1, 1).click();
    await cell(page, 0, 0).click();
    await expect(page.getByTestId('game-over')).toBeVisible();
    await page.getByTestId('game-over-new-game').click();
    await expect(page.getByTestId('game-over')).toHaveCount(0);
  });

  test('S20: nothing animates and consecutive screenshots are identical', async ({ page }) => {
    await arrange(page, { board: EMPTY, score: 0, preview: [1, 2, 3] });
    await page.locator('[data-testid="board"][data-animating="false"]').waitFor();
    await page.evaluate(() => globalThis.document.fonts.ready);

    expect(await page.evaluate(() => globalThis.document.getAnimations().length)).toBe(0);
    for (const target of [crt(page), glare(page)]) {
      await expect(target).toHaveCSS('transition-duration', '0s');
      await expect(target).toHaveCSS('animation-name', 'none');
    }
    const first = await page.screenshot();
    const second = await page.screenshot();
    expect(second.equals(first)).toBe(true);
  });

  test('S20: dark scanlines dim 20-40% and the gaps do not dim at all', async ({ page }) => {
    await arrange(page, { board: EMPTY, score: 0, preview: [1, 2, 3] });
    const alpha = await page.evaluate(() =>
      parseFloat(
        globalThis
          .getComputedStyle(globalThis.document.documentElement)
          .getPropertyValue('--crt-scanline-alpha'),
      ),
    );
    expect(alpha).toBeGreaterThanOrEqual(0.2);
    expect(alpha).toBeLessThanOrEqual(0.4);

    const background = await crt(page).evaluate(
      (el) => globalThis.getComputedStyle(el).backgroundImage,
    );
    const lines = background.slice(background.indexOf('repeating-linear-gradient'));
    const colors = [
      ...lines.matchAll(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/g),
    ].map((m) => ({
      rgb: [Number(m[1]), Number(m[2]), Number(m[3])],
      alpha: m[4] === undefined ? 1 : Number(m[4]),
    }));
    const dark = colors.filter((c) => c.alpha > 0);
    const gaps = colors.filter((c) => c.alpha === 0);
    expect(dark.length).toBeGreaterThan(0);
    expect(gaps.length).toBeGreaterThan(0);
    for (const c of dark) {
      expect(c.rgb).toEqual([0, 0, 0]);
      expect(c.alpha).toBeCloseTo(alpha, 2);
    }
  });

  test('S20: labels and button captions glow with a radius of at least 4 px', async ({ page }) => {
    await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
    const blurs = await page.evaluate(() =>
      ['score-label', 'best-score-label', 'preview-label', 'new-game', 'sound-toggle'].map((id) => {
        const shadow = globalThis.getComputedStyle(
          /** @type {Element} */ (globalThis.document.querySelector(`[data-testid="${id}"]`)),
        ).textShadow;
        // Drop the colour (it may contain commas) and read the lengths of the first layer.
        let bare = shadow;
        // Colours may nest parentheses (`color-mix(in srgb, rgb(…) 40%, …)`): peel innermost first.
        while (/\([^()]*\)/.test(bare)) bare = bare.replace(/[\w-]*\([^()]*\)/g, '');
        const lengths = bare.match(/-?[\d.]+px/g) ?? [];
        return { id, blur: parseFloat(lengths[2] ?? '0') };
      }),
    );
    for (const { id, blur } of blurs) expect(blur, id).toBeGreaterThanOrEqual(4);
  });

  test('S20: every text has a contrast of at least 4.5:1 to its own background', async ({
    page,
  }) => {
    await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    const texts = /** @type {Array<{ text: string, color: number[], background: number[] }>} */ (
      await readTextColors(page, 'body')
    );
    expect(texts.length).toBeGreaterThan(0);
    for (const t of texts)
      expect(contrast(t.color, t.background), t.text).toBeGreaterThanOrEqual(4.5);
  });

  test('S20: looks the same in the light and dark system theme and with reduced motion', async ({
    page,
  }) => {
    /** @param {Parameters<typeof page.emulateMedia>[0]} media */
    const shot = async (media) => {
      await page.emulateMedia(media);
      await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
      await page.locator('[data-testid="board"][data-animating="false"]').waitFor();
      await page.evaluate(() => globalThis.document.fonts.ready);
      return page.screenshot();
    };
    const light = await shot({ colorScheme: 'light', reducedMotion: 'no-preference' });
    const dark = await shot({ colorScheme: 'dark', reducedMotion: 'no-preference' });
    const reduced = await shot({ colorScheme: 'dark', reducedMotion: 'reduce' });
    expect(dark.equals(light)).toBe(true);
    expect(reduced.equals(dark)).toBe(true);
  });

  test('S20: the effect is present when the file is opened from disk, with no extra requests', async ({
    page,
  }) => {
    const fileUrl = process.env.E2E_FILE_URL;
    test.skip(!fileUrl, 'E2E_FILE_URL is not set');
    /** @type {string[]} */
    const requests = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('data:')) requests.push(request.url());
    });
    await page.goto(/** @type {string} */ (fileUrl));
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');

    await expect(crt(page)).toBeVisible();
    await expect(glare(page)).toHaveCount(1);
    const screen = await readScreen(page);
    expect(screen.radii[0]).toBeGreaterThan(0);
    const background = await crt(page).evaluate(
      (el) => globalThis.getComputedStyle(el).backgroundImage,
    );
    expect(background).toContain('repeating-linear-gradient');
    const g = await rectOf(page, '[data-testid="crt-glare"]');
    expect(insideRoundedRect({ x: g.x, y: g.y }, screen.rect, screen.radii[0])).toBe(true);
    // Firefox does not report the document itself; nothing but the game file may be requested.
    expect(requests.filter((url) => url !== fileUrl)).toEqual([]);
  });
});
