/** Colour reading and WCAG contrast for the palette scenario (S14). */

/**
 * Runs in the page. For every element that directly holds visible text, reports its text colour and
 * the background colour of the nearest ancestor (or itself) with a non-transparent background.
 * @param {string} rootSelector
 */
function collectInPage(rootSelector) {
  const doc = globalThis.document;
  const rgb = (/** @type {string} */ value) => (value.match(/[\d.]+/g) ?? []).map(Number);
  const out = [];
  for (const el of doc.querySelectorAll(`${rootSelector} *`)) {
    const own = [...el.childNodes].some(
      (n) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '',
    );
    if (!own) continue;
    let bgEl = /** @type {Element | null} */ (el);
    let bg = rgb(globalThis.getComputedStyle(el).backgroundColor);
    while (bgEl && (bg.length < 3 || (bg.length === 4 && bg[3] === 0))) {
      bgEl = bgEl.parentElement;
      bg = bgEl ? rgb(globalThis.getComputedStyle(bgEl).backgroundColor) : [0, 0, 0, 1];
    }
    out.push({
      text: (el.textContent ?? '').trim(),
      color: rgb(globalThis.getComputedStyle(el).color).slice(0, 3),
      background: bg.slice(0, 3),
      backgroundImage: globalThis.getComputedStyle(bgEl ?? el).backgroundImage,
    });
  }
  return out;
}

/** @param {import('@playwright/test').Page} page @param {string} [rootSelector] */
export const readTextColors = (page, rootSelector = '[data-testid="app"]') =>
  page.evaluate(`(${collectInPage.toString()})(${JSON.stringify(rootSelector)})`);

/** WCAG relative luminance of an sRGB colour given as [r, g, b] in 0–255. @param {number[]} rgb */
export function luminance([r, g, b]) {
  const lin = (/** @type {number} */ v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio of two colours. @param {number[]} a @param {number[]} b */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
