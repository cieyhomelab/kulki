import { describe, expect, it } from 'vitest';
import { embedFonts } from '../../tools/embed-fonts.js';

const BYTES = new Uint8Array([0, 1, 2, 250, 251, 255]);
const BASE64 = Buffer.from(BYTES).toString('base64');

describe('embedFonts', () => {
  it('replaces a font address with a data: address holding the file', () => {
    const css = "@font-face { src: url('./fonts/a.ttf') format('truetype'); }";

    expect(embedFonts(css, { 'a.ttf': BYTES })).toBe(
      `@font-face { src: url('data:font/ttf;base64,${BASE64}') format('truetype'); }`,
    );
  });

  it('replaces every font address and leaves the rest of the stylesheet alone', () => {
    const css = 'a { color: red; background: url(data:image/png;base64,AA==); }\n';
    const fonts = { 'a.ttf': BYTES, 'b.ttf': new Uint8Array([9]) };

    const out = embedFonts(
      `${css}x { src: url("./fonts/a.ttf"); } y { src: url('./fonts/b.ttf'); }`,
      fonts,
    );

    expect(out.startsWith(css)).toBe(true);
    expect(out).not.toContain('./fonts/');
    expect(out).toContain(`base64,${BASE64}`);
    expect(out).toContain(`base64,${Buffer.from([9]).toString('base64')}`);
  });

  it('names the file when it is missing from the map', () => {
    expect(() => embedFonts("a { src: url('./fonts/missing.ttf'); }", {})).toThrow(/missing\.ttf/);
  });

  it('gives the same output for the same input', () => {
    const css = "a { src: url('./fonts/a.ttf'); }";

    expect(embedFonts(css, { 'a.ttf': BYTES })).toBe(embedFonts(css, { 'a.ttf': BYTES }));
  });

  it('returns a stylesheet without font addresses unchanged', () => {
    expect(embedFonts('a { color: red; }', {})).toBe('a { color: red; }');
  });
});
