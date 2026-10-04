import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** @typedef {'pominięta' | 'udana' | 'nieudana'} PublicationResult */

/**
 * Computes the publication result from job results (`success`, `failure`, `cancelled`,
 * `skipped`); a job that was never created is `undefined`.
 * @param {{ gate?: string, deploy?: string, verify?: string }} jobs
 * @returns {PublicationResult}
 */
export function computePublicationResult({ gate, deploy, verify }) {
  if (gate !== 'success' || deploy === 'skipped' || deploy === undefined) return 'pominięta';
  if (deploy === 'success' && verify === 'success') return 'udana';
  return 'nieudana';
}

/**
 * Computes the result from a `GET /actions/runs/{id}/jobs` response, using job names
 * equal to the ids `gate`, `deploy` and `verify`.
 * @param {{ jobs: { name: string, conclusion: string | null }[] }} response
 * @returns {PublicationResult}
 */
export function computeResultFromJobs(response) {
  /** @param {string} name */
  const conclusion = (name) =>
    response.jobs.find((job) => job.name === name)?.conclusion ?? undefined;
  return computePublicationResult({
    gate: conclusion('gate'),
    deploy: conclusion('deploy'),
    verify: conclusion('verify'),
  });
}

/**
 * Checks the history entry (the run) and the API-computed result against this run.
 * @param {{ headSha: string, expectedSha: string, fromNeeds: PublicationResult, fromApi: PublicationResult }} input
 * @returns {string[]} problems; empty when everything agrees
 */
export function findInconsistencies({ headSha, expectedSha, fromNeeds, fromApi }) {
  const problems = [];
  if (headSha !== expectedSha) {
    problems.push(`head_sha of the run is ${headSha}, expected ${expectedSha}`);
  }
  if (fromApi !== fromNeeds) {
    problems.push(`result from the API is "${fromApi}", from needs "${fromNeeds}"`);
  }
  return problems;
}

/**
 * @param {string} name
 * @returns {string}
 */
function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/**
 * @param {string} url
 * @param {string} token
 * @returns {Promise<any>} parsed GitHub API response
 */
async function getJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status}`);
  return response.json();
}

async function main() {
  const sha = requireEnv('GITHUB_SHA');
  const repository = requireEnv('GITHUB_REPOSITORY');
  const runId = requireEnv('GITHUB_RUN_ID');
  const token = requireEnv('GITHUB_TOKEN');
  const fromNeeds = computePublicationResult({
    gate: requireEnv('GATE_RESULT'),
    deploy: requireEnv('DEPLOY_RESULT'),
    verify: requireEnv('VERIFY_RESULT'),
  });

  const line = `Wynik publikacji: ${fromNeeds} (wersja ${sha})`;
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);

  const base = `https://api.github.com/repos/${repository}/actions/runs/${runId}`;
  const run = await getJson(base, token);
  const jobs = await getJson(`${base}/jobs?per_page=100`, token);
  const problems = findInconsistencies({
    headSha: run.head_sha,
    expectedSha: sha,
    fromNeeds,
    fromApi: computeResultFromJobs(jobs),
  });
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
