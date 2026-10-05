/** Geometry of the CRT screen edge and decoding of screenshot pixels for the screen scenario (S20). */

/**
 * @typedef {{ x: number, y: number, width: number, height: number }} Rect
 */

/**
 * Whether a point lies inside a rectangle whose four corners are rounded with one circular radius.
 * @param {{ x: number, y: number }} point
 * @param {Rect} rect
 * @param {number} radius
 */
export function insideRoundedRect(point, rect, radius) {
  const { x, y } = point;
  if (x < rect.x || y < rect.y || x > rect.x + rect.width || y > rect.y + rect.height) return false;
  const cx =
    x < rect.x + radius
      ? rect.x + radius
      : x > rect.x + rect.width - radius
        ? rect.x + rect.width - radius
        : x;
  const cy =
    y < rect.y + radius
      ? rect.y + radius
      : y > rect.y + rect.height - radius
        ? rect.y + rect.height - radius
        : y;
  return Math.hypot(x - cx, y - cy) <= radius;
}

/**
 * Whether all four corners of a rectangle lie inside the rounded screen.
 * @param {Rect} box
 * @param {Rect} screen
 * @param {number} radius
 */
export const rectInsideScreen = (box, screen, radius) =>
  [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x, y: box.y + box.height },
    { x: box.x + box.width, y: box.y + box.height },
  ].every((corner) => insideRoundedRect(corner, screen, radius));

/**
 * Reads the screen rectangle and the corner radius (pixels) of the `crt` element.
 * @param {import('@playwright/test').Page} page
 */
export const readScreen = (page) =>
  page.evaluate(() => {
    const el = /** @type {Element} */ (globalThis.document.querySelector('[data-testid="crt"]'));
    const r = el.getBoundingClientRect();
    const css = globalThis.getComputedStyle(el);
    return {
      rect: { x: r.x, y: r.y, width: r.width, height: r.height },
      radii: [
        css.borderTopLeftRadius,
        css.borderTopRightRadius,
        css.borderBottomRightRadius,
        css.borderBottomLeftRadius,
      ].map(parseFloat),
    };
  });

/**
 * Takes a screenshot, decodes it in the browser through a canvas created here (the product has no
 * canvas) and reports the relative luminance of the pixel in each corner of the decoded image.
 * The corners come from the decoded size, not the window: WebKit shoots at double density.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number[]>} luminance of the top-left, top-right, bottom-right, bottom-left pixels
 */
export async function cornerLuminances(page) {
  const png = (await page.screenshot()).toString('base64');
  return page.evaluate(async (data) => {
    const img = new globalThis.Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const canvas = globalThis.document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    ctx.drawImage(img, 0, 0);
    const lin = (/** @type {number} */ v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return [
      [0, 0],
      [img.width - 1, 0],
      [img.width - 1, img.height - 1],
      [0, img.height - 1],
    ].map(([x, y]) => {
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    });
  }, png);
}
