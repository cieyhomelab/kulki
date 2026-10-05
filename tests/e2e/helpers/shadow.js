/** Splitting a computed `text-shadow` into layers for the title scenario (S18). */

/**
 * @typedef {{ color: number[], x: number, y: number, blur: number }} ShadowLayer
 */

/**
 * Splits at commas that are not inside parentheses.
 * @param {string} value
 */
function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (ch === ',' && depth === 0) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Colour as [r, g, b] in 0–255. Accepts `rgb(…)`, `rgba(…)` and `color(srgb r g b)` (0–1 channels).
 * @param {string} text
 */
function parseColor(text) {
  const nums = (text.match(/-?[\d.]+/g) ?? []).map(Number);
  if (text.startsWith('color(')) return nums.slice(0, 3).map((n) => n * 255);
  return nums.slice(0, 3);
}

/**
 * Parses a computed `text-shadow` value. The colour may come first or last in a layer.
 * @param {string} value
 * @returns {ShadowLayer[]}
 */
export function parseTextShadow(value) {
  if (!value || value === 'none') return [];
  return splitTopLevel(value).map((layer) => {
    const colorText = layer.match(/(?:rgba?|color)\([^)]*\)/)?.[0] ?? '';
    const lengths = layer
      .replace(colorText, '')
      .trim()
      .split(/\s+/)
      .map((n) => parseFloat(n));
    return {
      color: parseColor(colorText),
      x: lengths[0],
      y: lengths[1],
      blur: lengths[2] ?? 0,
    };
  });
}
