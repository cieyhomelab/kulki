import { describe, expect, it } from 'vitest';
import { loadWorkflow, runCommands } from './helpers/load-workflow.js';

const needsOf = (/** @type {any} */ job) => [job.needs ?? []].flat();

describe('Publication workflow (publish.yml)', () => {
  it('is named Publikacja and has the contract job identifiers without name fields', async () => {
    const workflow = await loadWorkflow('publish.yml');

    expect(workflow.name).toBe('Publikacja');
    expect(Object.keys(workflow.jobs)).toEqual(['tests', 'gate', 'deploy', 'verify', 'result']);
    for (const id of ['gate', 'deploy', 'verify', 'result']) {
      expect(workflow.jobs[id].name).toBeUndefined();
    }
  });

  it('P2: is triggered only by a push to main', async () => {
    expect((await loadWorkflow('publish.yml')).on).toEqual({ push: { branches: ['main'] } });
  });

  it('P2: never runs two publications at once and never cancels a running one', async () => {
    expect((await loadWorkflow('publish.yml')).concurrency).toEqual({
      group: 'publikacja',
      'cancel-in-progress': false,
    });
  });

  it('P2: deploys only when the gate says so', async () => {
    const { jobs } = await loadWorkflow('publish.yml');

    expect(jobs.deploy.if).toBe("needs.gate.outputs.publish == 'true'");
    expect(jobs.gate.outputs).toEqual({
      publish: '${{ steps.gate.outputs.publish }}',
      deadline: '${{ steps.gate.outputs.deadline }}',
    });
  });

  it('P2: tests the pushed commit and verifies the live address', async () => {
    const workflow = await loadWorkflow('publish.yml');
    const verify = workflow.jobs.verify.steps.find((/** @type {any} */ s) =>
      s.run?.includes('test-e2e.sh'),
    );

    expect(workflow.jobs.tests.uses).toBe('./.github/workflows/tests.yml');
    expect(workflow.jobs.tests.with).toEqual({ version: '${{ github.sha }}' });
    expect(workflow.env).toEqual({ POSTDEPLOY_URL: 'https://cieyhomelab.github.io/kulki/' });
    expect(verify.run).toBe('scripts/test-e2e.sh --project postdeploy');
    expect(verify.env).toMatchObject({
      POSTDEPLOY_VERSION: '${{ github.sha }}',
      POSTDEPLOY_SHA256: '${{ needs.tests.outputs.sha256 }}',
      POSTDEPLOY_DEADLINE: '${{ needs.gate.outputs.deadline }}',
    });
  });

  it('P3: chains every job after the tests, so any failed step stops the deploy', async () => {
    const { jobs } = await loadWorkflow('publish.yml');

    expect(jobs.tests.needs).toBeUndefined();
    expect(needsOf(jobs.gate)).toEqual(['tests']);
    expect(needsOf(jobs.deploy)).toEqual(['tests', 'gate']);
    expect(needsOf(jobs.verify)).toEqual(['tests', 'gate', 'deploy']);
    expect(needsOf(jobs.result)).toEqual(['tests', 'gate', 'deploy', 'verify']);
  });

  it('P3: gate, deploy and verify cannot run after a failure or be forced to run', async () => {
    const { jobs } = await loadWorkflow('publish.yml');

    expect(JSON.stringify(jobs)).not.toMatch(/continue-on-error/);
    for (const id of ['gate', 'deploy', 'verify']) {
      expect(JSON.stringify(jobs[id])).not.toMatch(/always\(\)|!cancelled\(\)/);
    }
  });

  it('only result runs after a failure, and reports from the three job results', async () => {
    const { jobs } = await loadWorkflow('publish.yml');
    const step = jobs.result.steps.find(
      (/** @type {any} */ s) => s.run === 'node tools/publication-result.js',
    );

    expect(jobs.result.if).toBe('always()');
    expect(step.env).toMatchObject({
      GATE_RESULT: '${{ needs.gate.result }}',
      DEPLOY_RESULT: '${{ needs.deploy.result }}',
      VERIFY_RESULT: '${{ needs.verify.result }}',
    });
    for (const id of ['tests', 'gate', 'verify']) {
      expect(jobs[id].if).toBeUndefined();
    }
  });

  it('permissions: read by default, Pages write only in deploy, actions read in result', async () => {
    const workflow = await loadWorkflow('publish.yml');
    const { jobs } = workflow;

    expect(workflow.permissions).toEqual({ contents: 'read' });
    expect(jobs.deploy.permissions).toMatchObject({ pages: 'write', 'id-token': 'write' });
    expect(jobs.deploy.environment.name).toBe('github-pages');
    expect(jobs.result.permissions).toMatchObject({ actions: 'read' });
    for (const id of ['tests', 'gate', 'verify']) {
      expect(jobs[id].permissions).toBeUndefined();
    }
    const writes = Object.entries(jobs).filter(([, job]) =>
      Object.values(job.permissions ?? {}).includes('write'),
    );
    expect(writes.map(([id]) => id)).toEqual(['deploy']);
  });

  it('P4: deploys the package of exactly one file made from the tested artifact', async () => {
    const { jobs } = await loadWorkflow('publish.yml');
    const steps = jobs.deploy.steps;
    const names = steps.map((/** @type {any} */ s) => s.uses?.split('@')[0] ?? s.run);
    const download = steps.find((/** @type {any} */ s) =>
      s.uses?.startsWith('actions/download-artifact@'),
    );
    const pack = steps.find((/** @type {any} */ s) =>
      s.run?.startsWith('node tools/pages-package.js'),
    );
    const upload = steps.find((/** @type {any} */ s) =>
      s.uses?.startsWith('actions/upload-pages-artifact@'),
    );

    expect(names).not.toContain('scripts/build.sh');
    expect(download.with.name).toBe('index-html');
    expect(pack.run).toBe(
      `node tools/pages-package.js ${download.with.path}/index.html ${upload.with.path}`,
    );
    expect(pack.env.EXPECTED_SHA256).toBe('${{ needs.tests.outputs.sha256 }}');
    expect(names.indexOf('node tools/pages-package.js artifact/index.html site')).toBeLessThan(
      names.indexOf('actions/upload-pages-artifact'),
    );
    expect(names.indexOf('actions/upload-pages-artifact')).toBeLessThan(
      names.indexOf('actions/deploy-pages'),
    );
  });

  it('verify has a 25 minute timeout and uploads test-results on failure', async () => {
    const { verify } = (await loadWorkflow('publish.yml')).jobs;
    const upload = verify.steps.find((/** @type {any} */ s) =>
      s.uses?.startsWith('actions/upload-artifact@'),
    );

    expect(verify['timeout-minutes']).toBe(25);
    expect(upload.if).toBe('failure()');
    expect(upload.with.path).toBe('test-results/');
  });

  it('P2: result ends with the publication-result tool run from the repository', async () => {
    const { jobs } = await loadWorkflow('publish.yml');

    expect(
      jobs.result.steps.some((/** @type {any} */ s) => s.uses?.startsWith('actions/checkout@')),
    ).toBe(true);
    expect(jobs.result.steps.at(-1).env.GITHUB_TOKEN).toBe('${{ secrets.GITHUB_TOKEN }}');
  });

  it('calls only scripts/*.sh or node tools/*.js', async () => {
    const commands = runCommands(await loadWorkflow('publish.yml')).map(({ run }) => run);

    expect(commands.length).toBeGreaterThan(0);
    for (const command of commands) {
      expect(command).toMatch(/^(scripts\/[a-z0-9-]+\.sh|node tools\/[a-z0-9-]+\.js)( |$)/);
    }
  });

  it('uses only actions/* pinned to a major version', async () => {
    for (const file of ['publish.yml', 'tests.yml', 'ci.yml']) {
      const { jobs } = await loadWorkflow(file);
      for (const job of Object.values(jobs)) {
        for (const step of job.steps ?? []) {
          if (step.uses) expect(step.uses).toMatch(/^actions\/[a-z-]+@v\d+$/);
        }
      }
    }
  });
});
