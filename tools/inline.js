const CSS_MARKER = '<!-- inline:css -->';
const JS_MARKER = '<!-- inline:js -->';
const VERSION_MARKER = '<!-- inline:version -->';

/**
 * Produces a self-contained HTML document by replacing the inline markers in
 * the template with the given stylesheet and script, and the version marker
 * with the `kulki-version` meta tag.
 *
 * @param {string} template HTML containing every inline marker exactly once
 * @param {{ css: string, js: string, version: string }} assets
 * @returns {string}
 */
export function inlineAssets(template, { css, js, version }) {
  for (const marker of [CSS_MARKER, JS_MARKER, VERSION_MARKER]) {
    const count = template.split(marker).length - 1;
    if (count !== 1) {
      throw new Error(`Expected exactly one "${marker}" marker in the template, found ${count}`);
    }
  }
  // A literal closing tag inside the code would end the inline element early.
  const safeCss = css.replace(/<\/style/gi, '<\\/style');
  const safeJs = js.replace(/<\/script/gi, '<\\/script');
  // Replacer functions keep `$` sequences in the assets from being interpreted.
  return template
    .replace(VERSION_MARKER, () => `<meta name="kulki-version" content="${version}" />`)
    .replace(CSS_MARKER, () => `<style>\n${safeCss.trim()}\n</style>`)
    .replace(JS_MARKER, () => `<script>\n${safeJs.trim()}\n</script>`);
}
