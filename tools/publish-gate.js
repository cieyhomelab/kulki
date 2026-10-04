import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MAIN_REF = 'refs/heads/main';
const DEADLINE_SECONDS = 900;

/**
 * Extracts the commit id of `refs/heads/main` from `git ls-remote` output.
 * @param {string} lsRemoteOutput
 * @returns {string}
 */
export function parseMainTip(lsRemoteOutput) {
  for (const line of lsRemoteOutput.split('\n')) {
    const [sha, ref] = line.trim().split(/\s+/);
    if (ref === MAIN_REF && /^[0-9a-f]{40}$/.test(sha)) return sha;
  }
  throw new Error(`Cannot read the tip of ${MAIN_REF} from: ${JSON.stringify(lsRemoteOutput)}`);
}

/**
 * Decides whether this run may publish.
 * @param {{ ref: string | undefined, sha: string | undefined, mainTip: string, nowSeconds: number }} input
 * @returns {{ publish: boolean, reason: string, deadline: number }}
 */
export function decidePublish({ ref, sha, mainTip, nowSeconds }) {
  const deadline = nowSeconds + DEADLINE_SECONDS;
  if (ref !== MAIN_REF) {
    return { publish: false, reason: `ref ${ref ?? '(unset)'} is not ${MAIN_REF}`, deadline };
  }
  if (sha !== mainTip) {
    return {
      publish: false,
      reason: `commit ${sha ?? '(unset)'} is not the tip of main (${mainTip})`,
      deadline,
    };
  }
  return { publish: true, reason: `commit ${sha} is the tip of main`, deadline };
}

function main() {
  const lsRemote = execFileSync('git', ['ls-remote', 'origin', MAIN_REF], { encoding: 'utf8' });
  const decision = decidePublish({
    ref: process.env.GITHUB_REF,
    sha: process.env.GITHUB_SHA,
    mainTip: parseMainTip(lsRemote),
    nowSeconds: Math.floor(Date.now() / 1000),
  });
  console.log(`publish=${decision.publish}: ${decision.reason}`);
  console.log(`deadline=${decision.deadline}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `publish=${decision.publish}\ndeadline=${decision.deadline}\n`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
