import { describe, expect, it } from 'vitest';
import { loadWorkflow, readRepoJson, runCommands } from './helpers/load-workflow.js';

describe('Tests workflow (tests.yml)', () => {
  it('is reusable and takes a required version input and gives a sha256 output', async () => {
    const { on } = await loadWorkflow('tests.yml');

    expect(Object.keys(on)).toEqual(['workflow_call']);
    expect(on.workflow_call.inputs.version).toMatchObject({ type: 'string', required: true });
    expect(on.workflow_call.outputs.sha256.value).toBe('${{ jobs.checks.outputs.sha256 }}');
  });

  it('calls only the scripts from scripts/', async () => {
    const commands = runCommands(await loadWorkflow('tests.yml')).map(({ run }) => run);

    expect(commands.length).toBeGreaterThan(0);
    for (const command of commands) {
      expect(command).toMatch(/^scripts\/[a-z0-9-]+\.sh$/);
    }
  });

  it('P3: runs every command of the validation gate, once', async () => {
    const commands = runCommands(await loadWorkflow('tests.yml')).map(({ run }) => run);
    const config = await readRepoJson('.ai/agentic.config.json');

    expect([...commands].sort()).toEqual([...config.validation.commands].sort());
  });

  it('P3: runs lint, unit, integration and build in checks, then e2e after it', async () => {
    const { jobs } = await loadWorkflow('tests.yml');

    expect(runCommands({ jobs: { checks: jobs.checks } }).map(({ run }) => run)).toEqual([
      'scripts/lint.sh',
      'scripts/test-unit.sh',
      'scripts/test-integration.sh',
      'scripts/build.sh',
    ]);
    expect(runCommands({ jobs: { e2e: jobs.e2e } }).map(({ run }) => run)).toEqual([
      'scripts/test-e2e.sh',
    ]);
    expect(jobs.e2e.needs).toBe('checks');
  });

  it('P3: never lets a failing step pass', async () => {
    const { jobs } = await loadWorkflow('tests.yml');

    expect(JSON.stringify(jobs)).not.toMatch(/continue-on-error/);
    for (const job of Object.values(jobs)) {
      expect(job.if).toBeUndefined();
    }
  });

  it('builds with the version input and publishes the artifact and its sha256', async () => {
    const { jobs } = await loadWorkflow('tests.yml');
    const build = jobs.checks.steps.find(
      (/** @type {any} */ step) => step.run === 'scripts/build.sh',
    );
    const upload = jobs.checks.steps.find((/** @type {any} */ step) =>
      step.uses?.startsWith('actions/upload-artifact@'),
    );

    expect(build.env.KULKI_VERSION).toBe('${{ inputs.version }}');
    // Only the build step gets the version: integration tests expect the default "dev".
    expect(jobs.checks.env?.KULKI_VERSION).toBeUndefined();
    expect(jobs.checks.outputs.sha256).toBe(`\${{ steps.${build.id}.outputs.sha256 }}`);
    expect(upload.with).toMatchObject({ name: 'index-html', path: 'dist/index.html' });
  });

  it('runs e2e on the same version and checks the file against the built sha256', async () => {
    const { jobs } = await loadWorkflow('tests.yml');
    const step = jobs.e2e.steps.find((/** @type {any} */ s) => s.run === 'scripts/test-e2e.sh');

    expect(step.env).toMatchObject({
      KULKI_VERSION: '${{ inputs.version }}',
      POSTDEPLOY_VERSION: '${{ inputs.version }}',
      POSTDEPLOY_SHA256: '${{ needs.checks.outputs.sha256 }}',
    });
  });

  it('has read-only permissions', async () => {
    expect((await loadWorkflow('tests.yml')).permissions).toEqual({ contents: 'read' });
  });
});
