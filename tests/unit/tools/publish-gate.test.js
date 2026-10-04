import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { decidePublish, parseMainTip } from '../../../tools/publish-gate.js';

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const gateScript = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../tools/publish-gate.js',
);

describe('parseMainTip', () => {
  it('reads the commit of refs/heads/main', () => {
    expect(parseMainTip(`${SHA_A}\trefs/heads/main\n`)).toBe(SHA_A);
  });

  it('ignores other refs', () => {
    expect(parseMainTip(`${SHA_B}\trefs/heads/mainline\n${SHA_A}\trefs/heads/main\n`)).toBe(SHA_A);
  });

  it('throws when main is missing or the output is empty', () => {
    expect(() => parseMainTip('')).toThrow(/refs\/heads\/main/);
    expect(() => parseMainTip(`${SHA_B}\trefs/heads/other\n`)).toThrow();
  });
});

describe('decidePublish', () => {
  const now = 1_000_000;

  it('publishes the tip of main with a deadline 900 s ahead', () => {
    expect(
      decidePublish({ ref: 'refs/heads/main', sha: SHA_A, mainTip: SHA_A, nowSeconds: now }),
    ).toMatchObject({ publish: true, deadline: now + 900 });
  });

  it('refuses another branch and says why', () => {
    const result = decidePublish({
      ref: 'refs/heads/feat/x',
      sha: SHA_A,
      mainTip: SHA_A,
      nowSeconds: now,
    });

    expect(result.publish).toBe(false);
    expect(result.reason).toContain('refs/heads/feat/x');
  });

  it('refuses a commit that is no longer the tip of main', () => {
    const result = decidePublish({
      ref: 'refs/heads/main',
      sha: SHA_A,
      mainTip: SHA_B,
      nowSeconds: now,
    });

    expect(result.publish).toBe(false);
    expect(result.reason).toContain('not the tip');
  });
});

describe('node tools/publish-gate.js', () => {
  let dir = '';
  let clone = '';
  let tip = '';

  /** @param {string[]} args @param {string} cwd */
  const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'gate-'));
    const origin = path.join(dir, 'origin.git');
    clone = path.join(dir, 'clone');
    git(['init', '--bare', '-b', 'main', origin], dir);
    mkdirSync(clone);
    git(['init', '-b', 'main'], clone);
    writeFileSync(path.join(clone, 'f'), 'x');
    git(['add', 'f'], clone);
    git(['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-m', 'init'], clone);
    git(['remote', 'add', 'origin', origin], clone);
    git(['push', 'origin', 'main'], clone);
    tip = git(['rev-parse', 'HEAD'], clone);
  });

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  /** @param {Record<string, string>} env @param {string} [cwd] */
  const runGate = (env, cwd = clone) => {
    const output = path.join(dir, `out-${Math.random()}`);
    writeFileSync(output, '');
    const before = Math.floor(Date.now() / 1000);
    const result = spawnSync('node', [gateScript], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, GITHUB_OUTPUT: output, ...env },
    });
    return { result, outputs: readFileSync(output, 'utf8'), before };
  };

  it('publishes the tip of main, deadline = now + 900 s, exit 0', () => {
    const { result, outputs, before } = runGate({ GITHUB_REF: 'refs/heads/main', GITHUB_SHA: tip });

    expect(result.status).toBe(0);
    expect(outputs).toContain('publish=true');
    const deadline = Number(/deadline=(\d+)/.exec(outputs)?.[1]);
    expect(deadline).toBeGreaterThanOrEqual(before + 900);
    expect(deadline).toBeLessThanOrEqual(before + 905);
  });

  it('does not publish another branch: publish=false with a reason, exit 0', () => {
    const { result, outputs } = runGate({ GITHUB_REF: 'refs/heads/feat/x', GITHUB_SHA: tip });

    expect(result.status).toBe(0);
    expect(outputs).toContain('publish=false');
    expect(result.stdout).toContain('refs/heads/feat/x');
  });

  it('does not publish a commit that is not the tip of main, exit 0', () => {
    const { result, outputs } = runGate({ GITHUB_REF: 'refs/heads/main', GITHUB_SHA: SHA_B });

    expect(result.status).toBe(0);
    expect(outputs).toContain('publish=false');
    expect(result.stdout).toContain('not the tip');
  });

  it('exits non-zero when the tip of main cannot be read', () => {
    const lonely = mkdtempSync(path.join(dir, 'lonely-'));
    git(['init', '-b', 'main'], lonely);
    git(['remote', 'add', 'origin', path.join(dir, 'missing.git')], lonely);

    const { result } = runGate({ GITHUB_REF: 'refs/heads/main', GITHUB_SHA: tip }, lonely);

    expect(result.status).not.toBe(0);
  });
});
