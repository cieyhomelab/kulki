import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Computes the SHA-256 of a buffer as lowercase hex.
 * @param {Uint8Array} content
 * @returns {string}
 */
export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Throws unless the file content has the expected SHA-256.
 * @param {Uint8Array} content
 * @param {string | undefined} expected
 */
export function assertChecksum(content, expected) {
  if (!expected || !/^[0-9a-f]{64}$/.test(expected)) {
    throw new Error('EXPECTED_SHA256 must be set to 64 lowercase hex characters');
  }
  const actual = sha256(content);
  if (actual !== expected) {
    throw new Error(`Checksum mismatch: expected ${expected}, got ${actual}`);
  }
}

/**
 * Throws unless the directory listing is exactly one `index.html`.
 * @param {string[]} entries names of everything in the package directory
 */
export function assertSingleIndex(entries) {
  if (entries.length !== 1 || entries[0] !== 'index.html') {
    throw new Error(
      `Package must contain exactly one index.html, found: ${JSON.stringify(entries)}`,
    );
  }
}

/**
 * Builds the Pages package: a directory holding only the game file as `index.html`.
 * @param {string} file
 * @param {string} directory
 * @param {string | undefined} expectedSha256
 * @returns {Promise<string[]>} the final directory listing
 */
export async function createPackage(file, directory, expectedSha256) {
  assertChecksum(await readFile(file), expectedSha256);
  await mkdir(directory, { recursive: true });
  await copyFile(file, path.join(directory, 'index.html'));
  const entries = await readdir(directory, { recursive: true });
  assertSingleIndex(entries);
  return entries;
}

async function main() {
  const [file, directory] = process.argv.slice(2);
  if (!file || !directory) throw new Error('Usage: node tools/pages-package.js <file> <directory>');
  const entries = await createPackage(file, directory, process.env.EXPECTED_SHA256);
  console.log(`Package ${directory}:`);
  for (const entry of entries) console.log(`  ${entry}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
