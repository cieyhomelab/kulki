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

describe('sidebar', () => {
  it('holds the panels and buttons in order, and a window as its last child', async () => {
    const { document } = (await loadGame()).window;
    const sidebar = document.querySelector('[data-testid="sidebar"]');
    const ids = () => [...(sidebar?.children ?? [])].map((c) => c.getAttribute('data-testid'));
    expect(sidebar?.parentElement?.getAttribute('data-testid')).toBe('app');
    expect(ids()).toEqual([
      'score-panel',
      'best-score-panel',
      'preview',
      'new-game',
      'sound-toggle',
    ]);

    /** @type {HTMLElement | null} */ (document.querySelector('[data-testid="new-game"]'))?.click();
    expect(ids().at(-1)).toBe('confirm-dialog');
  });
});
