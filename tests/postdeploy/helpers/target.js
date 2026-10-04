// The post-deploy suite checks one address. POSTDEPLOY_URL points it at the
// published game; without it the suite runs in mock mode against the `web`
// service of the Compose stack, which stands in for the hosting.

/** True when the suite runs against the real hosting. */
export const isLive = Boolean(process.env.POSTDEPLOY_URL);

/** Address of the game under test; always ends with a slash. */
export const targetUrl = withTrailingSlash(
  process.env.POSTDEPLOY_URL || process.env.E2E_BASE_URL || 'http://web/',
);

/**
 * @param {string} url
 * @returns {string}
 */
function withTrailingSlash(url) {
  return url.endsWith('/') ? url : `${url}/`;
}
