// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { COLOR_COUNT } from '../../../src/game/constants.js';
import { CASCADE_BALLS, buildCascade } from '../../../src/ui/cascade.js';

describe('CASCADE_BALLS', () => {
  it('has between 7 and 30 balls', () => {
    expect(CASCADE_BALLS.length).toBeGreaterThanOrEqual(7);
    expect(CASCADE_BALLS.length).toBeLessThanOrEqual(30);
  });

  it('uses every game colour at least once', () => {
    const colors = new Set(CASCADE_BALLS.map((b) => b.color));
    for (let c = 1; c <= COLOR_COUNT; c += 1) expect(colors.has(/** @type {any} */ (c))).toBe(true);
    expect([...colors].every((c) => c >= 1 && c <= COLOR_COUNT)).toBe(true);
  });

  it('has at least 3 distinct sizes', () => {
    expect(new Set(CASCADE_BALLS.map((b) => b.size)).size).toBeGreaterThanOrEqual(3);
  });

  it('has non-negative integer size, x and y', () => {
    for (const { size, x, y } of CASCADE_BALLS) {
      for (const v of [size, x, y]) {
        expect(Number.isInteger(v) && v >= 0).toBe(true);
      }
    }
  });

  it('keeps every ball inside the 352 x 104 title block', () => {
    for (const { size, x, y } of CASCADE_BALLS) {
      expect(x + size).toBeLessThanOrEqual(352);
      expect(y + size).toBeLessThanOrEqual(104);
    }
  });

  it('is frozen, entries included', () => {
    expect(Object.isFrozen(CASCADE_BALLS)).toBe(true);
    expect(CASCADE_BALLS.every((b) => Object.isFrozen(b))).toBe(true);
  });
});

describe('buildCascade', () => {
  /** @param {HTMLElement} node */
  const describeNode = (node) =>
    [...node.children].map((c) => [c.getAttribute('data-color'), c.getAttribute('style')]);

  it('builds a hidden, textless container with one ball per table entry, in order', () => {
    const cascade = buildCascade(globalThis.document);
    expect(cascade.getAttribute('data-testid')).toBe('cascade');
    expect(cascade.getAttribute('aria-hidden')).toBe('true');
    expect(cascade.textContent).toBe('');
    expect(cascade.children).toHaveLength(CASCADE_BALLS.length);
    [...cascade.children].forEach((child, i) => {
      const ball = CASCADE_BALLS[i];
      expect(child.getAttribute('data-testid')).toBe('cascade-ball');
      expect(child.getAttribute('data-color')).toBe(String(ball.color));
      expect(child.getAttribute('style')).toBe(
        `--x: ${ball.x}px; --y: ${ball.y}px; --size: ${ball.size}px`,
      );
    });
  });

  it('gives identical elements on every call', () => {
    expect(describeNode(buildCascade(globalThis.document))).toEqual(
      describeNode(buildCascade(globalThis.document)),
    );
  });
});
