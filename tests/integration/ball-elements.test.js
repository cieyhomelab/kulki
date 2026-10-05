import { describe, expect, it } from 'vitest';
import { loadGame } from './helpers/load-game.js';

describe('ball elements on the board', () => {
  it('has 81 ball elements, one inside each cell, with no own data-color', async () => {
    const { document } = (await loadGame()).window;
    const balls = document.querySelectorAll('[data-testid^="ball-"]');

    expect(balls).toHaveLength(81);
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const ball = document.querySelector(`[data-testid="ball-${row}-${col}"]`);
        expect(ball?.parentElement?.getAttribute('data-testid')).toBe(`cell-${row}-${col}`);
        expect(ball?.hasAttribute('data-color')).toBe(false);
      }
    }
  });
});
