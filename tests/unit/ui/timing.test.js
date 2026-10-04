import { describe, expect, it } from 'vitest';
import { MOVE_TOTAL_MAX_MS, REJECT_MS, moveStepMs } from '../../../src/ui/timing.js';

describe('moveStepMs', () => {
  it('uses at most 60 ms per step', () => {
    expect(moveStepMs(1)).toBe(60);
    expect(moveStepMs(13)).toBe(60);
  });

  it('keeps the whole animation within 800 ms for any path length', () => {
    for (let steps = 1; steps <= 80; steps += 1) {
      expect(moveStepMs(steps) * steps).toBeLessThanOrEqual(MOVE_TOTAL_MAX_MS);
    }
  });

  it('keeps the rejection signal under 1 s', () => {
    expect(REJECT_MS).toBeLessThanOrEqual(1000);
  });
});
