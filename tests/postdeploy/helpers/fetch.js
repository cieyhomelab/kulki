/** Version marker tags found in the HTML of the game file. */
const VERSION_MARKER = /<meta name="kulki-version" content="([^"]*)" \/>/g;

/**
 * Fetches a URL bypassing caches: a unique query parameter plus `Cache-Control: no-cache`.
 * Relative URLs resolve against the Playwright `baseURL` (the game address).
 *
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} url
 */
export function fetchFresh(request, url) {
  return request.get(`${url}?nocache=${Math.random().toString(36).slice(2)}`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
}

/**
 * Version markers read from the HTML source, without running the game.
 *
 * @param {string} html
 * @returns {string[]}
 */
export function versionMarkers(html) {
  return [...html.matchAll(VERSION_MARKER)].map((match) => match[1]);
}

/**
 * Milliseconds left until `POSTDEPLOY_DEADLINE` (epoch seconds); without it each waiting step gets 30 s from its own start. Never less than 1 ms.
 *
 * @returns {number}
 */
export function msToDeadline() {
  const deadline = Number(process.env.POSTDEPLOY_DEADLINE);
  if (!Number.isFinite(deadline) || deadline <= 0) return 30_000;
  return Math.max(1, deadline * 1000 - Date.now());
}
