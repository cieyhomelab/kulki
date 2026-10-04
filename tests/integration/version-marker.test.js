import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { loadGame, readBuiltHtml } from './helpers/load-game.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('version marker in the built game', () => {
  it('has exactly one marker in <head> with the value dev by default', async () => {
    const { document } = new JSDOM(await readBuiltHtml()).window;
    const markers = document.querySelectorAll('meta[name="kulki-version"]');

    expect(markers).toHaveLength(1);
    expect(markers[0]?.parentElement).toBe(document.head);
    expect(markers[0]?.getAttribute('content')).toBe('dev');
  });

  it('does not show the version in the visible text or the title', async () => {
    const { document } = (await loadGame()).window;
    const text = document.body.textContent ?? '';

    expect(text).not.toMatch(/\bdev\b/);
    expect(document.title).toBe('Kulki');
  });

  it('is not read by the game code', async () => {
    const files = await readdir(path.join(rootDir, 'src'), { recursive: true });
    for (const file of files.filter((name) => name.endsWith('.js'))) {
      expect(await readFile(path.join(rootDir, 'src', file), 'utf8'), file).not.toMatch(
        /kulki-version/,
      );
    }
  });
});

describe('build with an invalid KULKI_VERSION', () => {
  it.each(['latest', 'A'.repeat(40), 'a'.repeat(39)])('fails for "%s"', (version) => {
    // The build validates before it writes, so dist/index.html is left untouched.
    expect(() =>
      execFileSync(process.execPath, ['tools/build.js'], {
        cwd: rootDir,
        env: { ...process.env, KULKI_VERSION: version },
        stdio: 'pipe',
      }),
    ).toThrow(/KULKI_VERSION/);
  });
});
