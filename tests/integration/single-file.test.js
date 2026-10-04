import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { loadGame, readBuiltHtml } from './helpers/load-game.js';

describe('built index.html', () => {
  it('is self-contained: no external scripts, styles or other resources', async () => {
    const html = await readBuiltHtml();
    const { document } = new JSDOM(html).window;

    expect(document.querySelectorAll('[src], link, object, embed, iframe')).toHaveLength(0);
    expect(document.querySelectorAll('script')).toHaveLength(1);
    expect(document.querySelectorAll('style')).toHaveLength(1);

    const css = document.querySelector('style')?.textContent ?? '';
    expect(css).not.toMatch(/@import/);
    expect(css.match(/url\((?!\s*['"]?data:)/g)).toBeNull();
  });

  it('boots the start screen in Polish', async () => {
    const { document } = (await loadGame()).window;

    expect(document.documentElement.lang).toBe('pl');
    expect(document.querySelector('h1')?.textContent).toBe('Kulki');
    expect(document.getElementById('app')?.dataset.ready).toBe('true');
  });
});
