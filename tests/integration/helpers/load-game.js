import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

export const distFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../dist/index.html',
);

/** @returns {Promise<string>} source of the built single-file game */
export function readBuiltHtml() {
  return readFile(distFile, 'utf8');
}

/**
 * Loads the built game into jsdom and runs its inline script.
 *
 * @param {{ beforeScripts?: (window: import('jsdom').DOMWindow) => void }} [options]
 *   `beforeScripts` runs before the game script, e.g. to seed `localStorage`.
 * @returns {Promise<JSDOM>}
 */
export async function loadGame({ beforeScripts } = {}) {
  return new JSDOM(await readBuiltHtml(), {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse: beforeScripts,
  });
}
