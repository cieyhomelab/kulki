/**
 * Boots the application inside the given document.
 *
 * Sets `data-ready="true"` on the root element once the UI is usable, so tests
 * can wait for the app instead of guessing with timeouts.
 *
 * @param {Document} doc
 * @returns {HTMLElement} the application root element
 */
export function startApp(doc) {
  const root = doc.getElementById('app');
  if (!root) {
    throw new Error('Application root element #app not found');
  }
  root.dataset.ready = 'true';
  return root;
}
