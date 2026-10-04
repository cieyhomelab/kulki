import { expect, test } from '@playwright/test';
import { expectedVersion } from './helpers/expected.js';
import { fetchFresh, msToDeadline, versionMarkers } from './helpers/fetch.js';

// Readiness gate: the other post-deploy tests run only once the address serves the expected
// version, so a hosting that is still switching over does not fail them one by one.
test('readiness: the address serves the expected version', async ({ request, baseURL }) => {
  test.setTimeout(msToDeadline() + 10_000);

  await expect(async () => {
    const response = await fetchFresh(request, baseURL ?? './');
    expect(response.status()).toBe(200);
    expect(versionMarkers(await response.text())).toEqual([expectedVersion]);
  }).toPass({ timeout: msToDeadline(), intervals: [500, 1000, 2000] });
});
