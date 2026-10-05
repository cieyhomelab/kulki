import { expect, test } from '@playwright/test';
import { contrast, luminance } from './helpers/contrast.js';
import { readFont } from './helpers/font.js';
import { parseTextShadow } from './helpers/shadow.js';
import { rectInsideScreen, readScreen } from './helpers/screen.js';
import { arrange } from './helpers/game.js';

const EMPTY = Array(9).fill('.........');
const FULL = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
);

/** @param {import('@playwright/test').Page} page */
const readTitle = (page) =>
  page.evaluate(() => {
    const doc = globalThis.document;
    const css = (/** @type {Element} */ el) => globalThis.getComputedStyle(el);
    const q = (/** @type {string} */ id) =>
      /** @type {Element} */ (doc.querySelector(`[data-testid="${id}"]`));
    const title = q('title');
    const style = css(title);
    const rgb = (/** @type {string} */ v) => (v.match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
    const r = title.getBoundingClientRect();
    let bgEl = /** @type {Element | null} */ (title);
    let bg = css(title).backgroundColor;
    while (bgEl && /rgba\(.*, 0\)|transparent/.test(bg)) {
      bgEl = bgEl.parentElement;
      bg = bgEl ? css(bgEl).backgroundColor : 'rgb(0, 0, 0)';
    }
    return {
      docTitle: doc.title,
      text: title.textContent,
      nodes: title.childNodes.length,
      fontSize: parseFloat(style.fontSize),
      scoreFontSize: parseFloat(css(q('score')).fontSize),
      fill: rgb(style.color),
      stroke: rgb(style.getPropertyValue('-webkit-text-stroke-color')),
      strokeWidth: parseFloat(style.getPropertyValue('-webkit-text-stroke-width')),
      background: rgb(bg),
      shadow: style.textShadow,
      labelShadow: css(q('score-label')).textShadow,
      rect: { x: r.x, y: r.y, width: r.width, height: r.height },
      animations: title.getAnimations().length,
      transition: style.transitionDuration,
      beforeContent: globalThis.getComputedStyle(title, '::before').content,
      afterContent: globalThis.getComputedStyle(title, '::after').content,
      bodyText: doc.body.innerText,
    };
  });

/**
 * @param {Awaited<ReturnType<typeof readTitle>>} t
 */
function extent(t) {
  const layers = parseTextShadow(t.shadow);
  const glow = Math.max(...layers.map((l) => l.blur));
  const depth = Math.max(0, ...layers.filter((l) => l.blur === 0).flatMap((l) => [l.x, l.y]));
  const pad = t.strokeWidth + glow;
  return {
    x: t.rect.x - pad,
    y: t.rect.y - pad,
    width: t.rect.width + 2 * pad + depth,
    height: t.rect.height + 2 * pad + depth,
  };
}

/** @param {{ x: number, y: number, width: number, height: number }} a @param {{ x: number, y: number, width: number, height: number }} b */
const overlap = (a, b) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test.describe('S18: neon title', () => {
  test.beforeEach(async ({ page }) => {
    await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
    await page.evaluate(() => globalThis.document.fonts.ready);
  });

  test('S18: the title reads KULKI in the page text and the tab is named Kulki', async ({
    page,
  }) => {
    const t = await readTitle(page);
    expect(t.text).toBe('KULKI');
    expect(t.docTitle).toBe('Kulki');
  });

  test('S18: the title is set in the game font', async ({ page }) => {
    const font = await readFont(page.getByTestId('title'));
    expect(font.loaded).toBe(true);
    expect(font.family).toBe('Press Start 2P');
    expect(font.exact).toBe(true);
  });

  test('S18: the letters are at least twice the size of the score number', async ({ page }) => {
    const t = await readTitle(page);
    expect(t.fontSize).toBeGreaterThanOrEqual(2 * t.scoreFontSize);
  });

  test('S18: the fill is blue and the outline is yellow and thick', async ({ page }) => {
    const t = await readTitle(page);
    expect(t.fill[2]).toBeGreaterThan(t.fill[0]);
    expect(t.fill[2]).toBeGreaterThan(t.fill[1]);
    expect(t.stroke[0]).toBeGreaterThan(t.stroke[2]);
    expect(t.stroke[1]).toBeGreaterThan(t.stroke[2]);
    expect(t.strokeWidth).toBeGreaterThan(0);
  });

  test('S18: the fill reaches contrast 4.5:1 on the background under the title', async ({
    page,
  }) => {
    const t = await readTitle(page);
    expect(contrast(t.fill, t.background)).toBeGreaterThanOrEqual(4.5);
  });

  test('S18: the glow is yellow, blurred and at least twice the label glow', async ({ page }) => {
    const t = await readTitle(page);
    const glows = parseTextShadow(t.shadow).filter((l) => l.blur > 0);
    const labelBlur = Math.max(...parseTextShadow(t.labelShadow).map((l) => l.blur));
    expect(glows.length).toBeGreaterThan(0);
    for (const glow of glows) {
      expect(glow.color[0]).toBeGreaterThan(glow.color[2]);
      expect(glow.color[1]).toBeGreaterThan(glow.color[2]);
    }
    expect(Math.max(...glows.map((g) => g.blur))).toBeGreaterThanOrEqual(2 * labelBlur);
  });

  test('S18: a sharp layer below and right of the letters is darker than the fill', async ({
    page,
  }) => {
    const t = await readTitle(page);
    const depth = parseTextShadow(t.shadow).filter((l) => l.blur === 0 && l.x > 0 && l.y > 0);
    expect(depth.length).toBeGreaterThan(0);
    for (const layer of depth) {
      expect(luminance(layer.color)).toBeLessThan(luminance(t.fill));
    }
  });

  test('S18: KULKI appears once in the page text and once as a level-1 heading', async ({
    page,
  }) => {
    const t = await readTitle(page);
    expect(t.bodyText.match(/KULKI/g)).toHaveLength(1);
    expect(t.nodes).toBe(1);
    for (const content of [t.beforeContent, t.afterContent]) {
      expect(['none', 'normal', '""']).toContain(content);
    }
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'KULKI' })).toHaveCount(1);
  });

  test('S18: the title has no animation or transition', async ({ page }) => {
    const t = await readTitle(page);
    expect(t.animations).toBe(0);
    expect(t.transition).toBe('0s');
  });

  for (const size of [
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    test(`S18: the extent fits the window and screen edge, and nothing overlaps at ${size.width}x${size.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.evaluate(() => globalThis.document.fonts.ready);
      const screen = await readScreen(page);
      const ids = [
        'board',
        'score-panel',
        'best-score-panel',
        'preview',
        'new-game',
        'sound-toggle',
      ];

      /** @param {string[]} extra */
      const verify = async (extra) => {
        const t = await readTitle(page);
        const box = extent(t);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(size.width);
        expect(box.y + box.height).toBeLessThanOrEqual(size.height);
        expect(rectInsideScreen(box, screen.rect, screen.radii[0])).toBe(true);
        const letters = {
          x: t.rect.x - t.strokeWidth,
          y: t.rect.y - t.strokeWidth,
          width: t.rect.width + 2 * t.strokeWidth + 4,
          height: t.rect.height + 2 * t.strokeWidth + 4,
        };
        for (const id of [...ids, ...extra]) {
          const other = await page.getByTestId(id).boundingBox();
          expect(other, id).not.toBeNull();
          expect(overlap(letters, /** @type {NonNullable<typeof other>} */ (other)), id).toBe(
            false,
          );
        }
      };

      await verify([]);
      await page.getByTestId('new-game').click();
      await expect(page.getByTestId('confirm-dialog')).toBeVisible();
      await verify(['confirm-dialog']);
      await page.getByTestId('confirm-no').click();
      await arrange(page, { board: FULL, score: 50, best: 10, over: true, record: true });
      await expect(page.getByTestId('game-over')).toBeVisible();
      await verify(['game-over']);
    });
  }
});
