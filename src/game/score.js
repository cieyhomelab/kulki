import { MIN_LINE } from './constants.js';

/**
 * Points for one clearing: 2 per ball plus 2 per ball above the fifth.
 * @param {number} cleared number of cleared balls
 * @returns {number}
 */
export function scoreForCleared(cleared) {
  if (!Number.isInteger(cleared) || cleared < 0) {
    throw new RangeError(`invalid number of cleared balls: ${cleared}`);
  }
  if (cleared === 0) return 0;
  return 2 * cleared + 2 * Math.max(0, cleared - MIN_LINE);
}
