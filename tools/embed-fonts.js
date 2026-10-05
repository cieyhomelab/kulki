const FONT_URL = /url\(\s*(['"])\.\/fonts\/([^'"]+)\1\s*\)/g;

/**
 * Replaces every `url('./fonts/<file>')` in the stylesheet with a `data:` URL holding the file.
 * Does not read the disk; the caller supplies the font files.
 *
 * @param {string} css stylesheet with url('./fonts/<file>') addresses
 * @param {Record<string, Uint8Array>} fonts contents of the files in src/fonts/ by file name
 * @returns {string} the stylesheet with every such address turned into a data: address
 * @throws {Error} when the stylesheet points at a file that is not in `fonts`
 */
export function embedFonts(css, fonts) {
  return css.replace(FONT_URL, (_match, _quote, file) => {
    if (!Object.hasOwn(fonts, file)) {
      throw new Error(`Font file "${file}" referenced by the stylesheet is not in src/fonts/`);
    }
    return `url('data:font/ttf;base64,${Buffer.from(fonts[file]).toString('base64')}')`;
  });
}
