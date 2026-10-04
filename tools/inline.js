const CSS_MARKER = '<!-- inline:css -->';
const JS_MARKER = '<!-- inline:js -->';

/**
 * Produces a self-contained HTML document by replacing the inline markers in
 * the template with the given stylesheet and script.
 *
 * @param {string} template HTML containing both inline markers exactly once
 * @param {{ css: string, js: string }} assets
 * @returns {string}
 */
export function inlineAssets(template, { css, js }) {
  for (const marker of [CSS_MARKER, JS_MARKER]) {
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
    .replace(CSS_MARKER, () => `<style>\n${safeCss.trim()}\n</style>`)
    .replace(JS_MARKER, () => `<script>\n${safeJs.trim()}\n</script>`);
}
