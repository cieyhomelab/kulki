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
});
