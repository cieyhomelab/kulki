const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * @param {Window} win
 * @returns {MediaQueryList | null}
 */
function findQuery(win) {
  try {
    return typeof win.matchMedia === 'function' ? win.matchMedia(QUERY) : null;
  } catch {
    // An unusable matchMedia means "no preference known": motion stays unrestricted.
    return null;
  }
}

/**
 * Reads the player's reduced-motion preference. Without `matchMedia`, or when it throws, motion
 * is not reduced.
 *
 * @param {Window} win
 * @returns {Motion}
 */
export function createMotion(win) {
  const media = findQuery(win);
  return {
    isReduced: () => media?.matches === true,
    onChange(listener) {
      media?.addEventListener('change', () => listener());
    },
  };
}

/**
 * @typedef {object} Motion
 * @property {() => boolean} isReduced whether the player asked for reduced motion
 * @property {(listener: () => void) => void} onChange calls `listener` when the preference changes
 */
