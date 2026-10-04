import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  computePublicationResult,
  computeResultFromJobs,
  findInconsistencies,
} from '../../../tools/publication-result.js';

const RESULTS = ['success', 'failure', 'cancelled', 'skipped'];

/** @param {string} gate @param {string} deploy @param {string} verify */
const expected = (gate, deploy, verify) => {
  if (gate !== 'success' || deploy === 'skipped') return 'pominięta';
  if (deploy === 'success' && verify === 'success') return 'udana';
  return 'nieudana';
};

describe('computePublicationResult', () => {
  const combinations = RESULTS.flatMap((gate) =>
    RESULTS.flatMap((deploy) => RESULTS.map((verify) => [gate, deploy, verify])),
  );

  it.each(combinations)('gate=%s deploy=%s verify=%s', (gate, deploy, verify) => {
    expect(computePublicationResult({ gate, deploy, verify })).toBe(expected(gate, deploy, verify));
  });

  it('is skipped when the run was cancelled before any job was created', () => {
    expect(computePublicationResult({})).toBe('pominięta');
  });

  it('is failed when deploy was cancelled after the gate passed', () => {
    expect(
      computePublicationResult({ gate: 'success', deploy: 'cancelled', verify: 'skipped' }),
    ).toBe('nieudana');
  });
});

describe('computeResultFromJobs', () => {
  /** @param {[string, string | null][]} entries */
  const jobs = (entries) => ({
    jobs: entries.map(([name, conclusion]) => ({ name, conclusion })),
  });

  it('computes a successful publication', () => {
    expect(
      computeResultFromJobs(
        jobs([
          ['gate', 'success'],
          ['deploy', 'success'],
          ['verify', 'success'],
        ]),
      ),
    ).toBe('udana');
  });

  it('computes a failed verification', () => {
    expect(
      computeResultFromJobs(
        jobs([
          ['gate', 'success'],
          ['deploy', 'success'],
          ['verify', 'failure'],
        ]),
      ),
    ).toBe('nieudana');
  });

  it('computes skipped when deploy was skipped by the gate', () => {
    expect(
      computeResultFromJobs(
        jobs([
          ['gate', 'success'],
          ['deploy', 'skipped'],
          ['verify', 'skipped'],
        ]),
      ),
    ).toBe('pominięta');
  });

  it('computes skipped for a cancelled run without a deploy job', () => {
    expect(computeResultFromJobs(jobs([['tests / checks', 'cancelled']]))).toBe('pominięta');
  });

  it('ignores unrelated jobs and treats an in-progress job (null) as missing', () => {
    expect(
      computeResultFromJobs(
        jobs([
          ['tests / e2e', 'success'],
          ['gate', 'success'],
          ['deploy', null],
        ]),
      ),
    ).toBe('pominięta');
  });
});

describe('findInconsistencies', () => {
  const sha = 'a'.repeat(40);

  it('reports nothing when everything agrees', () => {
    expect(
      findInconsistencies({ headSha: sha, expectedSha: sha, fromNeeds: 'udana', fromApi: 'udana' }),
    ).toEqual([]);
  });

  it('reports a different head_sha', () => {
    expect(
      findInconsistencies({
        headSha: 'b'.repeat(40),
        expectedSha: sha,
        fromNeeds: 'udana',
        fromApi: 'udana',
      }),
    ).toHaveLength(1);
  });

  it('reports a result that differs between API and needs', () => {
    expect(
      findInconsistencies({
        headSha: sha,
        expectedSha: sha,
        fromNeeds: 'udana',
        fromApi: 'nieudana',
      }),
    ).toHaveLength(1);
  });
});

describe('node tools/publication-result.js', () => {
  const SHA = 'a'.repeat(40);
  const stub = path.resolve('tests/unit/tools/helpers/stub-github-api.js');
  const successJobs = ['gate', 'deploy', 'verify'].map((name) => ({ name, conclusion: 'success' }));

  /** @param {Record<string, string>} extra */
  function run(extra) {
    const dir = mkdtempSync(path.join(tmpdir(), 'pubresult-'));
    const summary = path.join(dir, 'summary.md');
    try {
      const result = spawnSync(
        process.execPath,
        ['--import', stub, 'tools/publication-result.js'],
        {
          encoding: 'utf8',
          env: {
            PATH: process.env.PATH,
            GITHUB_SHA: SHA,
            GITHUB_REPOSITORY: 'o/r',
            GITHUB_RUN_ID: '1',
            GITHUB_TOKEN: 'x',
            GITHUB_STEP_SUMMARY: summary,
            GATE_RESULT: 'success',
            DEPLOY_RESULT: 'success',
            VERIFY_RESULT: 'success',
            STUB_HEAD_SHA: SHA,
            STUB_JOBS: JSON.stringify(successJobs),
            ...extra,
          },
        },
      );
      return {
        status: result.status,
        summary: existsSync(summary) ? readFileSync(summary, 'utf8') : '',
      };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it('writes the result line with the version to the step summary, exit 0', () => {
    const { status, summary } = run({});
    expect(status).toBe(0);
    expect(summary).toContain('Wynik publikacji: udana');
    expect(summary).toContain(SHA);
  });

  it('exits non-zero when head_sha of the run differs from GITHUB_SHA', () => {
    expect(run({ STUB_HEAD_SHA: 'b'.repeat(40) }).status).not.toBe(0);
  });

  it('exits non-zero when the result from the API differs from the one from needs', () => {
    const jobs = [
      { name: 'gate', conclusion: 'success' },
      { name: 'deploy', conclusion: 'failure' },
    ];
    const { status, summary } = run({ STUB_JOBS: JSON.stringify(jobs) });
    expect(status).not.toBe(0);
    expect(summary).toContain('Wynik publikacji: udana');
  });
});
