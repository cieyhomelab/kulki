import { expect, test } from '@playwright/test';
import { expectedVersion } from './helpers/expected.js';
import { fetchFresh, versionMarkers } from './helpers/fetch.js';
import { openGame } from './helpers/game.js';

test('P2: the version marker in the HTML equals POSTDEPLOY_VERSION', async ({
  request,
  baseURL,
}) => {
  const html = await (await fetchFresh(request, baseURL ?? './')).text();

  expect(versionMarkers(html)).toEqual([expectedVersion]);
});

test('P2: the text visible on the game screen does not show the version', async ({ page }) => {
  await openGame(page);
  const text = await page.locator('body').innerText();

  if (expectedVersion === 'dev') {
    // `dev` is a word, so only the marker itself is checked.
    expect(text).not.toContain('kulki-version');
  } else {
    expect(text).not.toContain(expectedVersion);
    expect(text).not.toContain(expectedVersion.slice(0, 7));
  }
});
