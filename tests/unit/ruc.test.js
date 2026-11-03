import { describe, it, expect } from 'vitest';
import { isValidRuc, rucCheckDigit } from '../../src/utils/ruc';

describe('RUC paraguayo', () => {
  it('computes the SET check digit', () => {
    expect(rucCheckDigit('80000519')).toBe(8);
  });
  it('accepts valid RUCs with or without dots', () => {
    expect(isValidRuc('80000519-8')).toBe(true);
    expect(isValidRuc('80.000.519-8')).toBe(true);
  });
  it('rejects a wrong check digit or missing dash', () => {
    expect(isValidRuc('80000519-1')).toBe(false);
    expect(isValidRuc('800005198')).toBe(false);
  });
});
