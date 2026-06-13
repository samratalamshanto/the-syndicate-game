import { describe, expect, it } from 'vitest';
import { createDefaultConfig } from './defaultConfig';

describe('createDefaultConfig', () => {
  it('defaults to a single human', () => {
    expect(createDefaultConfig(4, 'medium').humanCount).toBe(1);
  });

  it('keeps at least one bot by clamping humanCount to playerCount - 1', () => {
    expect(createDefaultConfig(4, 'medium', undefined, 9).humanCount).toBe(3);
    expect(createDefaultConfig(6, 'hard', undefined, 6).humanCount).toBe(5);
  });

  it('clamps humanCount to a minimum of 1', () => {
    expect(createDefaultConfig(4, 'easy', undefined, 0).humanCount).toBe(1);
  });
});
