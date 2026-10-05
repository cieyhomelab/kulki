/** Animation times in milliseconds. Every value stays within the 1 s limit of the specification. */
export const MOVE_STEP_MAX_MS = 60;
export const MOVE_TOTAL_MAX_MS = 450;
export const REJECT_MS = 500;
export const CLEAR_MS = 300;
export const SPAWN_MS = 300;

/**
 * Time of one step of the move animation: at most 60 ms, and short enough that the whole
 * animation takes at most 450 ms whatever the path length.
 * @param {number} steps number of steps between the first and the last cell of the path
 * @returns {number}
 */
export function moveStepMs(steps) {
  return Math.min(MOVE_STEP_MAX_MS, Math.floor(MOVE_TOTAL_MAX_MS / Math.max(1, steps)));
}

/** Time of one full bounce cycle (up and down) of the selected ball; 300 ms to 1 s. */
export const BOUNCE_CYCLE_MS = 600;
