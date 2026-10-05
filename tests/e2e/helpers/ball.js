/** Helpers that measure the bouncing ball through the DOM and its animations. */

/**
 * Visible box of a ball element (includes its transform).
 * @param {import('@playwright/test').Page} page
 * @param {number} row
 * @param {number} col
 * @returns {Promise<{ x: number, y: number, width: number, height: number }>}
 */
export function ballBox(page, row, col) {
  return page.getByTestId(`ball-${row}-${col}`).evaluate((node) => {
    const r = node.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
}

/**
 * Samples the visible box of a ball on every animation frame for one cycle.
 * @param {import('@playwright/test').Page} page
 * @param {number} row
 * @param {number} col
 * @returns {Promise<Array<{ x: number, y: number, width: number, height: number }>>}
 */
export function sampleCycle(page, row, col) {
  return page.evaluate(
    ({ row, col }) => {
      const ball = /** @type {HTMLElement} */ (
        globalThis.document.querySelector(`[data-testid="ball-${row}-${col}"]`)
      );
      const cycleMs = parseFloat(globalThis.getComputedStyle(ball).animationDuration) * 1000;
      return new Promise((resolve) => {
        /** @type {Array<{ x: number, y: number, width: number, height: number }>} */
        const samples = [];
        const start = performance.now();
        const tick = () => {
          const r = ball.getBoundingClientRect();
          samples.push({ x: r.x, y: r.y, width: r.width, height: r.height });
          if (performance.now() - start < cycleMs) globalThis.requestAnimationFrame(tick);
          else resolve(samples);
        };
        tick();
      });
    },
    { row, col },
  );
}

/**
 * Freezes the ball's animation at the given moment of the cycle.
 * @param {import('@playwright/test').Page} page
 * @param {number} row
 * @param {number} col
 * @param {number} fraction position in the cycle, 0 to 1
 */
export function freezeAt(page, row, col, fraction) {
  return page.getByTestId(`ball-${row}-${col}`).evaluate((node, fraction) => {
    const [animation] = node.getAnimations();
    const cycleMs = parseFloat(globalThis.getComputedStyle(node).animationDuration) * 1000;
    animation.pause();
    animation.currentTime = cycleMs * fraction;
  }, fraction);
}
