import { describe, expect, it } from 'vitest';
import { loadWorkflow, readRepoJson, runCommands } from './helpers/load-workflow.js';

describe('CI workflow', () => {
  it('calls only the scripts from scripts/', async () => {
    const commands = runCommands(await loadWorkflow('ci.yml')).map(({ run }) => run);

    expect(commands.length).toBeGreaterThan(0);
    for (const command of commands) {
      expect(command).toMatch(/^scripts\/[a-z0-9-]+\.sh$/);
    }
  });

  it('runs every command of the validation gate', async () => {
    const commands = runCommands(await loadWorkflow('ci.yml')).map(({ run }) => run);
    const config = await readRepoJson('.ai/agentic.config.json');

    expect([...commands].sort()).toEqual([...config.validation.commands].sort());
  });
});
