import { describe, it, expect } from 'vitest';
import { formatGs } from '../../src/utils/formatters';

describe('formatGs - Paraguayan Guaraní Currency Formatter', () => {
  it('formats positive integers with dot thousands separator and Gs. suffix', () => {
    expect(formatGs(160000)).toBe('160.000 Gs.');
    expect(formatGs(200000)).toBe('200.000 Gs.');
    expect(formatGs(1500000)).toBe('1.500.000 Gs.');
    expect(formatGs(30000)).toBe('30.000 Gs.');
    expect(formatGs(95000)).toBe('95.000 Gs.');
  });

  it('rounds floating numbers to nearest integer without decimals', () => {
    expect(formatGs(160000.45)).toBe('160.000 Gs.');
    expect(formatGs(160000.75)).toBe('160.001 Gs.');
  });

  it('formats zero correctly', () => {
    expect(formatGs(0)).toBe('0 Gs.');
    expect(formatGs('0')).toBe('0 Gs.');
  });

  it('handles null, undefined and invalid numbers safely', () => {
    expect(formatGs(null)).toBe('0 Gs.');
    expect(formatGs(undefined)).toBe('0 Gs.');
    expect(formatGs(NaN)).toBe('0 Gs.');
    expect(formatGs('invalid-text')).toBe('0 Gs.');
  });
});
