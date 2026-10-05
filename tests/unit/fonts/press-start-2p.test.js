import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const fontsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../src/fonts');

// Upstream file from google/fonts (ofl/pressstart2p). The licence reserves the font name for
// unmodified copies, so the file must stay byte-identical: no subsetting, no format conversion.
const FONT_SHA256 = '034c77f1f05ec89421e4a63f0e3a4ca1ecf852cc6d2bf611f126f275728e017d';

describe('game font asset', () => {
  it('is the unmodified upstream Press Start 2P file', async () => {
    const font = await readFile(path.join(fontsDir, 'PressStart2P-Regular.ttf'));

    expect(createHash('sha256').update(font).digest('hex')).toBe(FONT_SHA256);
  });

  it('ships with its licence text and copyright notice', async () => {
    const licence = await readFile(path.join(fontsDir, 'OFL.txt'), 'utf8');

    expect(licence).toContain('The Press Start 2P Project Authors');
    expect(licence).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });
});
