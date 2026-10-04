/**
 * Installs `window.__kulki`, the test interface described in the specification.
 * The game itself never calls it.
 *
 * @param {Window} win
 * @param {import('./ui/app.js').AppController} app
 * @param {{ configure(options: { queue?: unknown, seed?: unknown }): void }} randomSource
 */
export function installTestApi(win, app, randomSource) {
  Object.defineProperty(win, '__kulki', {
    value: Object.freeze({
      setState: (/** @type {unknown} */ state) => app.setState(state),
      setRandom: (/** @type {{ queue?: unknown, seed?: unknown }} */ options = {}) =>
        randomSource.configure(options),
      getState: () => app.getState(),
      getSoundLog: () => app.getSoundLog(),
    }),
    configurable: true,
  });
}
