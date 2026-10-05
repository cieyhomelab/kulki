import { describe, expect, it } from 'vitest';
import { loadGame } from './helpers/load-game.js';

describe('hero block', () => {
  it('is a child of the app and contains the title', async () => {
    const { document } = (await loadGame()).window;
    const app = document.querySelector('[data-testid="app"]');
    const hero = document.querySelector('[data-testid="hero"]');
    const title = document.querySelector('[data-testid="title"]');

    expect(hero).not.toBeNull();
    expect(hero?.parentElement).toBe(app);
    expect(title?.tagName).toBe('H1');
    expect(title?.parentElement).toBe(hero);
    expect(title?.textContent).toBe('Kulki');
  });
});
