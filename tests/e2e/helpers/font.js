/** Reading the game font from the page, see "czcionka gry" in the spec's DOM and style contract. */

/**
 * Runs in the page. Reports whether the game font is loaded, whether it is the first family of the
 * element, and whether every character of the element's text renders exactly one `font-size` wide
 * (a fallback monospace font is about 0.6 em wide). Characters are measured as separate
 * inline-block boxes with the element's font, because range rectangles of single characters are
 * rounded up by WebKit.
 * @param {Element} el
 * @param {string} [textOverride]
 */
async function measureInPage(el, textOverride) {
  const doc = globalThis.document;
  await doc.fonts.ready;
  const style = globalThis.getComputedStyle(el);
  const size = parseFloat(style.fontSize);
  const text = textOverride ?? el.textContent ?? '';
  const probe = doc.createElement('span');
  probe.style.font = style.font;
  probe.style.letterSpacing = style.letterSpacing;
  probe.style.whiteSpace = 'pre';
  probe.style.position = 'absolute';
  const boxes = [...text].map((ch) => {
    const box = doc.createElement('span');
    box.style.display = 'inline-block';
    box.textContent = ch;
    probe.append(box);
    return box;
  });
  doc.body.append(probe);
  const widths = boxes.map((box) => box.getBoundingClientRect().width);
  probe.remove();
  return {
    text,
    loaded: [...doc.fonts].some(
      (f) => f.family.replaceAll('"', '') === 'Press Start 2P' && f.status === 'loaded',
    ),
    family: style.fontFamily.split(',')[0].trim().replaceAll(/["']/g, ''),
    exact: text.length > 0 && widths.every((w) => Math.abs(w - size) <= 0.5),
    widths,
    size,
  };
}

/**
 * Font reading of one element.
 * @param {import('@playwright/test').Locator} locator
 */
export const readFont = (locator) => locator.evaluate(measureInPage);

/**
 * Font reading of a string of characters put into the page with the inherited font.
 * @param {import('@playwright/test').Page} page
 * @param {string} chars
 */
export function readProbe(page, chars) {
  return page.evaluate(
    async ([fn, text]) => {
      const probe = globalThis.document.createElement('span');
      probe.textContent = text;
      globalThis.document.body.append(probe);
      const measure = new Function(`return (${fn})`)();
      const result = await measure(probe, text);
      probe.remove();
      return result;
    },
    [measureInPage.toString(), chars],
  );
}

/**
 * Whether the page scrolls or any listed element's text overflows its box.
 * @param {import('@playwright/test').Page} page
 * @param {string[]} testIds
 */
export function readFit(page, testIds) {
  return page.evaluate((ids) => {
    const root = globalThis.document.documentElement;
    const clipped = ids.filter((id) => {
      const el = /** @type {HTMLElement} */ (
        globalThis.document.querySelector(`[data-testid="${id}"]`)
      );
      return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    });
    return {
      scrollsX: root.scrollWidth > root.clientWidth,
      scrollsY: root.scrollHeight > root.clientHeight,
      clipped,
    };
  }, testIds);
}
