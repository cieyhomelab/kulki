import { describe, expect, it } from 'vitest';
import { loadWorkflow } from './helpers/load-workflow.js';

describe('CI workflow (ci.yml)', () => {
  it('P2: runs only for pull requests', async () => {
    expect((await loadWorkflow('ci.yml')).on).toEqual({ pull_request: null });
  });

  it('P2: only calls tests.yml with the PR head commit as version', async () => {
    const { jobs } = await loadWorkflow('ci.yml');

    expect(Object.keys(jobs)).toEqual(['tests']);
    expect(jobs.tests.uses).toBe('./.github/workflows/tests.yml');
    expect(jobs.tests.with).toEqual({ version: '${{ github.event.pull_request.head.sha }}' });
    expect(jobs.tests.steps).toBeUndefined();
  });

  it('has read-only permissions and cancels older runs of the same ref', async () => {
    const workflow = await loadWorkflow('ci.yml');

    expect(workflow.permissions).toEqual({ contents: 'read' });
    expect(workflow.concurrency).toEqual({
      group: 'ci-${{ github.ref }}',
      'cancel-in-progress': true,
    });
  });
});
