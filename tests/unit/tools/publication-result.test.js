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
