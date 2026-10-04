import { describe, expect, it } from 'vitest';
import {
  CLEAR_MS,
  MOVE_TOTAL_MAX_MS,
  REJECT_MS,
  SPAWN_MS,
  moveStepMs,
} from '../../../src/ui/timing.js';

describe('moveStepMs', () => {
  it('uses at most 60 ms per step', () => {
    expect(moveStepMs(1)).toBe(60);
    expect(moveStepMs(7)).toBe(60);
  });

  it('keeps the whole animation within MOVE_TOTAL_MAX_MS for any path length', () => {
    for (let steps = 1; steps <= 80; steps += 1) {
      expect(moveStepMs(steps) * steps).toBeLessThanOrEqual(MOVE_TOTAL_MAX_MS);
    }
  });

  it('keeps the rejection signal under 1 s', () => {
    expect(REJECT_MS).toBeLessThanOrEqual(1000);
  });
});

describe('clear and spawn animation times', () => {
  it('stay at 300 ms, within the 1 s limit', () => {
    expect(CLEAR_MS).toBe(300);
    expect(SPAWN_MS).toBe(300);
  });
});
