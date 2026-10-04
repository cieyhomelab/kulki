import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { inlineAssets } from './inline.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(rootDir, 'src');
const outFile = path.join(rootDir, 'dist', 'index.html');

const bundle = await build({
  entryPoints: [path.join(srcDir, 'main.js')],
  bundle: true,
  format: 'iife',
  target: ['es2022'],
  charset: 'utf8',
  minify: false,
  write: false,
  logLevel: 'warning',
});

const [template, css] = await Promise.all([
  readFile(path.join(srcDir, 'index.html'), 'utf8'),
  readFile(path.join(srcDir, 'styles.css'), 'utf8'),
]);

const html = inlineAssets(template, { css, js: bundle.outputFiles[0].text });

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, html);
console.log(`Built ${path.relative(rootDir, outFile)} (${Buffer.byteLength(html)} bytes)`);
