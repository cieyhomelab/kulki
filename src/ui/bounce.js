/**
 * Which cell holds the bouncing ball: the selected one, unless motion is reduced.
 *
 * @param {number | null} selected index of the selected cell, if any
 * @param {boolean} reducedMotion
 * @returns {number | null}
 */
export function bouncingCell(selected, reducedMotion) {
  return selected !== null && !reducedMotion ? selected : null;
}
