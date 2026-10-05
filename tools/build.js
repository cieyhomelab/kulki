import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { embedFonts } from './embed-fonts.js';
import { inlineAssets } from './inline.js';
import { resolveVersion } from './version.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(rootDir, 'src');
const outFile = path.join(rootDir, 'dist', 'index.html');

const version = resolveVersion(process.env.KULKI_VERSION);

const bundle = await build({
  entryPoints: [path.join(srcDir, 'main.js')],
  bundle: true,
  format: 'iife',
  target: ['es2022'],
  charset: 'utf8',
  minify: false,
  write: false,
  logLevel: 'warning',
  // Pinned so the output does not depend on tsconfig.json being present (the Docker build has none).
  tsconfigRaw: { compilerOptions: { alwaysStrict: true } },
});

const [template, css] = await Promise.all([
  readFile(path.join(srcDir, 'index.html'), 'utf8'),
  readFile(path.join(srcDir, 'styles.css'), 'utf8'),
]);

// Only the font files themselves; the licence text stays in the repository.
const fontsDir = path.join(srcDir, 'fonts');
const fontFiles = (await readdir(fontsDir)).filter((name) => name.endsWith('.ttf'));
const fonts = Object.fromEntries(
  await Promise.all(
    fontFiles.map(async (name) => [name, await readFile(path.join(fontsDir, name))]),
  ),
);

const html = inlineAssets(template, {
  css: embedFonts(css, fonts),
  js: bundle.outputFiles[0].text,
  version,
});

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, html);
console.log(`Built ${path.relative(rootDir, outFile)} (${Buffer.byteLength(html)} bytes)`);
