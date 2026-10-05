import { describe, expect, it } from 'vitest';
import { loadGame } from './helpers/load-game.js';

describe('CRT effect element', () => {
  it('is empty, hidden from assistive technology and outside the app', async () => {
    const { document } = (await loadGame()).window;
    const crt = document.querySelector('[data-testid="crt"]');
    const app = document.querySelector('[data-testid="app"]');

    expect(crt).not.toBeNull();
    expect(crt?.tagName).toBe('DIV');
    expect(crt?.getAttribute('aria-hidden')).toBe('true');
    expect(crt?.childNodes).toHaveLength(0);
    expect(app?.contains(crt)).toBe(false);
    expect(crt?.parentElement).toBe(document.body);
  });

  it('survives the interface rebuilding the app contents', async () => {
    const { document } = (await loadGame()).window;
    expect(document.querySelectorAll('[data-testid="crt"]')).toHaveLength(1);
  });

  it('has an empty, hidden glare element right after the screen, as a child of the body', async () => {
    const { document } = (await loadGame()).window;
    const crt = document.querySelector('[data-testid="crt"]');
    const glare = document.querySelector('[data-testid="crt-glare"]');

    expect(document.querySelectorAll('[data-testid="crt-glare"]')).toHaveLength(1);
    expect(glare?.tagName).toBe('DIV');
    expect(glare?.getAttribute('aria-hidden')).toBe('true');
    expect(glare?.childNodes).toHaveLength(0);
    expect(glare?.parentElement).toBe(document.body);
    expect(crt?.nextElementSibling).toBe(glare);
    expect(crt?.childNodes).toHaveLength(0);
  });
});

describe('CRT vignette element', () => {
  it('is empty, hidden from assistive technology and a child of the body outside the app', async () => {
    const { document } = (await loadGame()).window;
    const vignette = document.querySelector('[data-testid="crt-vignette"]');
    const app = document.querySelector('[data-testid="app"]');

    expect(document.querySelectorAll('[data-testid="crt-vignette"]')).toHaveLength(1);
    expect(vignette?.tagName).toBe('DIV');
    expect(vignette?.getAttribute('aria-hidden')).toBe('true');
    expect(vignette?.childNodes).toHaveLength(0);
    expect(vignette?.parentElement).toBe(document.body);
    expect(app?.contains(vignette)).toBe(false);
  });
});
