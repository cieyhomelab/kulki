import { describe, expect, it } from 'vitest';
import { bouncingCell } from '../../../src/ui/bounce.js';

describe('bouncingCell', () => {
  it('bounces the selected cell when motion is not reduced', () => {
    expect(bouncingCell(0, false)).toBe(0);
    expect(bouncingCell(40, false)).toBe(40);
  });

  it('bounces nothing when nothing is selected', () => {
    expect(bouncingCell(null, false)).toBeNull();
    expect(bouncingCell(null, true)).toBeNull();
  });

  it('bounces nothing when motion is reduced', () => {
    expect(bouncingCell(12, true)).toBeNull();
  });
});
