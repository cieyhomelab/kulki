import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

/**
 * @typedef {{ name?: string, uses?: string, run?: string, if?: string, with?: Record<string, unknown>, env?: Record<string, string> }} Step
 * @typedef {{ name?: string, needs?: string | string[], if?: string, uses?: string, environment?: unknown, permissions?: unknown, concurrency?: unknown, steps?: Step[] }} Job
 * @typedef {{ name?: string, on: unknown, concurrency?: unknown, permissions?: unknown, jobs: Record<string, Job> }} Workflow
 */

/**
 * Reads and parses a GitHub Actions workflow from .github/workflows.
 *
 * @param {string} fileName e.g. `ci.yml`
 * @returns {Promise<Workflow>}
 */
export async function loadWorkflow(fileName) {
  const file = path.join(rootDir, '.github', 'workflows', fileName);
  return parse(await readFile(file, 'utf8'));
}

/**
 * Lists the shell commands of every `run` step, in file order.
 *
 * @param {Workflow} workflow
 * @returns {{ job: string, run: string }[]}
 */
export function runCommands(workflow) {
  return Object.entries(workflow.jobs).flatMap(([job, { steps = [] }]) =>
    steps.flatMap((step) => (step.run === undefined ? [] : [{ job, run: step.run.trim() }])),
  );
}

/**
 * Reads a JSON file relative to the repository root.
 *
 * @param {string} relativePath
 * @returns {Promise<any>}
 */
export async function readRepoJson(relativePath) {
  return JSON.parse(await readFile(path.join(rootDir, relativePath), 'utf8'));
}
