/**
 * @typedef {object} CascadeBall
 * @property {1|2|3|4|5|6|7} color game ball colour number
 * @property {number} size diameter in pixels
 * @property {number} x left edge in pixels, relative to the title block
 * @property {number} y top edge in pixels, relative to the title block
 */

/**
 * Fixed decoration around the title. The balls sit in the free area to the right of the letters
 * (the title block is 352 x 104 px and the title with its outline, depth and glow ends at about
 * x = 264). Balls may overlap each other.
 *
 * @type {ReadonlyArray<Readonly<CascadeBall>>}
 */
export const CASCADE_BALLS = Object.freeze(
  [
    { color: 1, size: 28, x: 268, y: 4 },
    { color: 2, size: 20, x: 300, y: 2 },
    { color: 3, size: 14, x: 326, y: 8 },
    { color: 4, size: 24, x: 298, y: 30 },
    { color: 5, size: 16, x: 328, y: 34 },
    { color: 6, size: 20, x: 270, y: 40 },
    { color: 7, size: 28, x: 316, y: 60 },
    { color: 1, size: 12, x: 290, y: 66 },
    { color: 3, size: 18, x: 268, y: 70 },
    { color: 5, size: 10, x: 330, y: 92 },
    { color: 2, size: 12, x: 300, y: 88 },
  ].map((ball) => Object.freeze(/** @type {CascadeBall} */ (ball))),
);

/**
 * Builds the decorative cascade: no text, hidden from assistive technology, no click handling.
 *
 * @param {Document} doc
 * @returns {HTMLElement} the `cascade` container with one `cascade-ball` per table entry
 */
export function buildCascade(doc) {
  const cascade = doc.createElement('div');
  cascade.className = 'cascade';
  cascade.setAttribute('data-testid', 'cascade');
  cascade.setAttribute('aria-hidden', 'true');
  for (const { color, size, x, y } of CASCADE_BALLS) {
    const ball = doc.createElement('span');
    ball.className = 'cascade-ball';
    ball.setAttribute('data-testid', 'cascade-ball');
    ball.setAttribute('data-color', String(color));
    ball.setAttribute('style', `--x: ${x}px; --y: ${y}px; --size: ${size}px`);
    cascade.append(ball);
  }
  return cascade;
}
