import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Integration tests run against the built artifact, so build it first. */
export default function setup() {
  execFileSync(process.execPath, ['tools/build.js'], { cwd: rootDir, stdio: 'inherit' });
}
