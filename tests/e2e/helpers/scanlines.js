/** Screenshot comparison for the scanline scenarios (S22, S23): a ball disc is free of lines, its surroundings are not. */

/** Colour tolerance per component, out of 255. */
export const COLOR_TOLERANCE = 3;
/** A pixel is darkened by a line when its component sum is at least this fraction lower. */
export const LINE_DARKENING = 0.1;
/** Width of the band on both sides of the disc edge that is not checked, in pixels. */
export const EDGE_BAND = 2;

/**
 * @typedef {{ x: number, y: number, width: number, height: number }} Rect
 * @typedef {{ disc: Rect, area: Rect | null }} Target
 * @typedef {{
 *   targets?: Target[],
 *   emptyAreas?: Rect[],
 *   linedDiscs?: Rect[],
 *   exclude?: Rect[],
 * }} Expectation
 * @typedef {{ discPixels: number, discBad: number, surroundPixels: number, surroundBad: number,
 *   emptyPixels: number, emptyBad: number, linedPixels: number, linedBad: number,
 *   firstBad: string | null }} Result
 */

/**
 * Discs and surrounding areas of every visible game ball: board balls (area = their cell) and
 * preview balls (area = the ball box widened by 4 px). Balls without a visible box are skipped.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Array<Target & { kind: 'board' | 'preview', testId: string }>>}
 */
export function gameBalls(page) {
  return page.evaluate(() => {
    const doc = globalThis.document;
    /** @param {Element} el */
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const out = [];
    for (const ball of doc.querySelectorAll('.cell > .ball')) {
      if (globalThis.getComputedStyle(ball).display === 'none') continue;
      out.push({
        kind: /** @type {'board'} */ ('board'),
        testId: ball.getAttribute('data-testid') ?? '',
        disc: rect(ball),
        area: rect(/** @type {Element} */ (ball.parentElement)),
      });
    }
    for (const ball of doc.querySelectorAll('[data-testid="preview-ball"]')) {
      const d = rect(ball);
      out.push({
        kind: /** @type {'preview'} */ ('preview'),
        testId: 'preview-ball',
        disc: d,
        area: { x: d.x - 4, y: d.y - 4, width: d.width + 8, height: d.height + 8 },
      });
    }
    return out;
  });
}

/**
 * Rectangle of an element (including its transform).
 * @param {import('@playwright/test').Page} page
 * @param {string} testId
 * @returns {Promise<Rect>}
 */
export function rectOfTestId(page, testId) {
  return page.getByTestId(testId).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
}

/**
 * Takes the screenshot and the reference image (scanlines switched off through the custom
 * property, no change to the game state), decodes both in the browser and measures:
 * - `targets`: pixels inside each disc (shrunk by the edge band) must match the reference, and
 *   pixels of its area outside the disc (grown by the band) in line rows must be darkened;
 * - `emptyAreas`: every pixel in a line row must be darkened;
 * - `linedDiscs`: every pixel of the disc (shrunk by the edge band) in a line row must be darkened.
 * `exclude` lists further discs that surrounding areas must not sample.
 * @param {import('@playwright/test').Page} page
 * @param {Expectation} expectation
 * @returns {Promise<Result>}
 */
export async function measureScanlines(page, expectation) {
  await page.evaluate(() => globalThis.document.fonts.ready);
  const shot = (await page.screenshot({ scale: 'css' })).toString('base64');
  await page.evaluate(() =>
    globalThis.document.documentElement.style.setProperty('--crt-scanline-alpha', '0'),
  );
  let reference;
  try {
    reference = (await page.screenshot({ scale: 'css' })).toString('base64');
  } finally {
    await page.evaluate(() =>
      globalThis.document.documentElement.style.removeProperty('--crt-scanline-alpha'),
    );
  }
  return page.evaluate(
    async ({ shot, reference, expectation, tolerance, darkening, band }) => {
      const doc = globalThis.document;
      /** @param {string} data */
      const decode = async (data) => {
        const img = new globalThis.Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const canvas = doc.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, img.width, img.height);
      };
      const [a, b] = [await decode(shot), await decode(reference)];
      const width = a.width;
      const css = globalThis.getComputedStyle(doc.documentElement);
      const period = parseFloat(css.getPropertyValue('--crt-scanline-period'));
      const lineWidth = parseFloat(css.getPropertyValue('--crt-scanline-width'));
      /** @param {number} y */
      const isLineRow = (y) => y % period >= period - lineWidth;
      /** @param {number} i */
      const sum = (i, /** @type {Uint8ClampedArray} */ d) => d[i] + d[i + 1] + d[i + 2];
      /** @param {number} x @param {number} y */
      const same = (x, y) => {
        const i = (y * width + x) * 4;
        return [0, 1, 2].every((c) => Math.abs(a.data[i + c] - b.data[i + c]) <= tolerance);
      };
      /** @param {number} x @param {number} y */
      const darkened = (x, y) => {
        const i = (y * width + x) * 4;
        return sum(i, a.data) <= sum(i, b.data) * (1 - darkening);
      };
      /** Normalised distance helper: inside the ellipse inscribed in rect, grown by `grow` pixels. */
      /** @param {any} r @param {number} grow @param {number} x @param {number} y */
      const inEllipse = (r, grow, x, y) => {
        const rx = r.width / 2 + grow;
        const ry = r.height / 2 + grow;
        if (rx <= 0 || ry <= 0) return false;
        const dx = (x + 0.5 - (r.x + r.width / 2)) / rx;
        const dy = (y + 0.5 - (r.y + r.height / 2)) / ry;
        return dx * dx + dy * dy <= 1;
      };
      const out = {
        discPixels: 0,
        discBad: 0,
        surroundPixels: 0,
        surroundBad: 0,
        emptyPixels: 0,
        emptyBad: 0,
        linedPixels: 0,
        linedBad: 0,
        /** @type {string | null} */ firstBad: null,
      };
      /** @param {string} what @param {number} x @param {number} y */
      const note = (what, x, y) => {
        out.firstBad ??= `${what} at ${x},${y}`;
      };
      const targets = expectation.targets ?? [];
      const everyDisc = [...targets.map((t) => t.disc), ...(expectation.exclude ?? [])];
      /** @param {any} r */
      const bounds = (r) => ({
        x0: Math.max(0, Math.floor(r.x)),
        y0: Math.max(0, Math.floor(r.y)),
        x1: Math.min(width - 1, Math.ceil(r.x + r.width)),
        y1: Math.min(a.height - 1, Math.ceil(r.y + r.height)),
      });
      for (const { disc, area } of targets) {
        const d = bounds(disc);
        for (let y = d.y0; y <= d.y1; y++) {
          for (let x = d.x0; x <= d.x1; x++) {
            if (!inEllipse(disc, -band, x, y)) continue;
            out.discPixels++;
            if (!same(x, y)) {
              out.discBad++;
              note('disc differs from reference', x, y);
            }
          }
        }
        if (!area) continue;
        const r = bounds({
          x: area.x + 2,
          y: area.y + 2,
          width: area.width - 4,
          height: area.height - 4,
        });
        for (let y = r.y0; y <= r.y1; y++) {
          if (!isLineRow(y)) continue;
          for (let x = r.x0; x <= r.x1; x++) {
            if (everyDisc.some((o) => inEllipse(o, band, x, y))) continue;
            out.surroundPixels++;
            if (!darkened(x, y)) {
              out.surroundBad++;
              note('surrounding without line', x, y);
            }
          }
        }
      }
      for (const area of expectation.emptyAreas ?? []) {
        const r = bounds({
          x: area.x + 2,
          y: area.y + 2,
          width: area.width - 4,
          height: area.height - 4,
        });
        for (let y = r.y0; y <= r.y1; y++) {
          if (!isLineRow(y)) continue;
          for (let x = r.x0; x <= r.x1; x++) {
            out.emptyPixels++;
            if (!darkened(x, y)) {
              out.emptyBad++;
              note('empty field without line', x, y);
            }
          }
        }
      }
      for (const disc of expectation.linedDiscs ?? []) {
        const d = bounds(disc);
        for (let y = d.y0; y <= d.y1; y++) {
          if (!isLineRow(y)) continue;
          for (let x = d.x0; x <= d.x1; x++) {
            if (!inEllipse(disc, -band, x, y)) continue;
            out.linedPixels++;
            if (!darkened(x, y)) {
              out.linedBad++;
              note('disc without line', x, y);
            }
          }
        }
      }
      return out;
    },
    {
      shot,
      reference,
      expectation,
      tolerance: COLOR_TOLERANCE,
      darkening: LINE_DARKENING,
      band: EDGE_BAND,
    },
  );
}

/**
 * Measures every visible game ball (board and preview) against the reference image.
 * @param {import('@playwright/test').Page} page
 * @param {{ only?: (t: Awaited<ReturnType<typeof gameBalls>>[number]) => boolean, extra?: Expectation }} [options]
 * @returns {Promise<Result>}
 */
export async function measureGameBalls(page, options = {}) {
  const all = await gameBalls(page);
  const targets = options.only ? all.filter(options.only) : all;
  return measureScanlines(page, {
    ...options.extra,
    targets: [...targets, ...(options.extra?.targets ?? [])],
    exclude: [...all.map((t) => t.disc), ...(options.extra?.exclude ?? [])],
  });
}

/**
 * Asserts nothing was found out of place: a readable message for the first offending pixel.
 * @param {Result} r
 * @returns {string}
 */
export const describeResult = (r) =>
  `disc ${r.discBad}/${r.discPixels}, surround ${r.surroundBad}/${r.surroundPixels}, empty ${r.emptyBad}/${r.emptyPixels}, lined ${r.linedBad}/${r.linedPixels}; first: ${r.firstBad}`;
