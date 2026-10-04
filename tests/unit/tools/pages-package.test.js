import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  assertChecksum,
  assertSingleIndex,
  createPackage,
  sha256,
} from '../../../tools/pages-package.js';

const script = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../tools/pages-package.js',
);
const GAME = '<!doctype html><title>Kulki</title>';
const GAME_SHA = sha256(Buffer.from(GAME));

describe('assertChecksum', () => {
  it('accepts a matching sum', () => {
    expect(() => assertChecksum(Buffer.from(GAME), GAME_SHA)).not.toThrow();
  });

  it('rejects a different sum', () => {
    expect(() => assertChecksum(Buffer.from(GAME), 'f'.repeat(64))).toThrow(/mismatch/);
  });

  it('rejects a missing or malformed expectation', () => {
    expect(() => assertChecksum(Buffer.from(GAME), undefined)).toThrow(/EXPECTED_SHA256/);
    expect(() => assertChecksum(Buffer.from(GAME), 'abc')).toThrow(/EXPECTED_SHA256/);
  });
});

describe('assertSingleIndex', () => {
  it('accepts exactly one index.html', () => {
    expect(() => assertSingleIndex(['index.html'])).not.toThrow();
  });

  it('rejects an empty listing, extra files and other names', () => {
    expect(() => assertSingleIndex([])).toThrow();
    expect(() => assertSingleIndex(['index.html', '404.html'])).toThrow();
    expect(() => assertSingleIndex(['game.html'])).toThrow();
  });
});

describe('pages-package', () => {
  let dir = '';
  let file = '';

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'pkg-'));
    file = path.join(dir, 'game.html');
    writeFileSync(file, GAME);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  /** @param {string} target @param {string} sha */
  const run = (target, sha) =>
    spawnSync('node', [script, file, target], {
      encoding: 'utf8',
      env: { ...process.env, EXPECTED_SHA256: sha },
    });

  it('creates a directory with exactly one index.html and lists it', async () => {
    const target = path.join(dir, 'pkg');

    expect(await createPackage(file, target, GAME_SHA)).toEqual(['index.html']);
    expect(readdirSync(target)).toEqual(['index.html']);
  });

  it('CLI: succeeds and prints the directory content', () => {
    const target = path.join(dir, 'pkg');
    const result = run(target, GAME_SHA);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('index.html');
    expect(readdirSync(target)).toEqual(['index.html']);
  });

  it('CLI: fails on a wrong checksum and creates nothing', () => {
    const target = path.join(dir, 'pkg');
    const result = run(target, 'f'.repeat(64));

    expect(result.status).not.toBe(0);
    expect(() => readdirSync(target)).toThrow();
  });

  it('CLI: fails when the directory holds anything besides index.html', () => {
    const target = path.join(dir, 'pkg');
    mkdirSync(target);
    writeFileSync(path.join(target, 'README.md'), 'x');

    expect(run(target, GAME_SHA).status).not.toBe(0);
  });
});
