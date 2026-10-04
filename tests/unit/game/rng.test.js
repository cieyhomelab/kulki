import { describe, expect, it } from 'vitest';
import { createEmptyBoard, withBall } from '../../../src/game/board.js';
import {
  createQueuedRng,
  createRandomSource,
  createSeededRng,
  randomColor,
  randomEmptyCell,
} from '../../../src/game/rng.js';

describe('rng', () => {
  it('seeded generator is deterministic and stays in [0, 1)', () => {
    const a = createSeededRng(1);
    const b = createSeededRng(1);
    const values = Array.from({ length: 200 }, () => a());
    expect(values).toEqual(Array.from({ length: 200 }, () => b()));
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(createSeededRng(2)()).not.toBe(createSeededRng(1)());
  });

  it('queued generator serves the queue, then the fallback', () => {
    const rng = createQueuedRng([0.1, 0.2], () => 0.9);
    expect([rng(), rng(), rng(), rng()]).toEqual([0.1, 0.2, 0.9, 0.9]);
  });

  it('picks colors as 1 + floor(rng * 7)', () => {
    expect(randomColor(() => 0)).toBe(1);
    expect(randomColor(() => 0.5)).toBe(4);
    expect(randomColor(() => 0.9999)).toBe(7);
  });

  it('picks the floor(rng * n)-th empty cell in index order', () => {
    const board = withBall(createEmptyBoard(), 0, 1);
    expect(randomEmptyCell(board, () => 0)).toBe(1);
    expect(randomEmptyCell(board, () => 0.9999)).toBe(80);
    const full = createEmptyBoard().fill(1);
    expect(() => randomEmptyCell(full, () => 0)).toThrow(Error);
  });

  it('random source: queue first, then seed 1 by default', () => {
    const source = createRandomSource();
    source.configure({ queue: [0.25] });
    const expected = createSeededRng(1);
    expect(source.rng()).toBe(0.25);
    expect(source.rng()).toBe(expected());
    source.configure({ seed: 5 });
    expect(source.rng()).toBe(createSeededRng(5)());
  });

  it('random source rejects invalid options', () => {
    const source = createRandomSource();
    expect(() => source.configure({ queue: [1] })).toThrow(TypeError);
    expect(() => source.configure({ queue: 'x' })).toThrow(TypeError);
    expect(() => source.configure({ seed: 1.5 })).toThrow(TypeError);
  });
});
