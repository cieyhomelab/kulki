import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

/** Version marker the game under test is expected to carry. */
export const expectedVersion = process.env.POSTDEPLOY_VERSION || 'dev';

/**
 * Expected SHA-256 of the game file. Without POSTDEPLOY_SHA256 it is the sum of the
 * `dist/index.html` baked into the test container, built from the same sources.
 *
 * @returns {string} 64 lowercase hexadecimal characters
 */
export function expectedSha256() {
  const fromEnv = process.env.POSTDEPLOY_SHA256;
  if (fromEnv) return fromEnv.toLowerCase();
  return createHash('sha256')
    .update(readFileSync(new URL('../../../dist/index.html', import.meta.url)))
    .digest('hex');
}
