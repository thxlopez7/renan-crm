import { describe, it, expect } from 'vitest';
import { isRetryableError, describeServerError } from '../../src/services/clubService';

describe('isRetryableError', () => {
  it('retries network failures without a Postgres code', () => {
    expect(isRetryableError({ message: 'TypeError: Failed to fetch', code: '' })).toBe(true);
    expect(isRetryableError(new TypeError('NetworkError when attempting to fetch resource.'))).toBe(true);
  });

  it('does not retry errors the server rejected', () => {
    expect(isRetryableError({ message: 'new row violates row-level security policy', code: '42501' })).toBe(false);
    expect(isRetryableError({ message: 'SLOT_ALREADY_BOOKED: ...', code: 'P0001' })).toBe(false);
    expect(isRetryableError(null)).toBe(false);
  });
});

describe('describeServerError', () => {
  it('maps known RPC exceptions to Spanish messages', () => {
    expect(describeServerError({ message: 'SLOT_ALREADY_BOOKED: El turno ...' })).toMatch(/ya está reservado/);
    expect(describeServerError({ message: 'NOT_STAFF: ...' })).toMatch(/permisos de staff/);
  });

  it('explains permission errors and falls back to a generic message', () => {
    expect(describeServerError({ code: '42501', message: 'denied' })).toMatch(/permisos/);
    expect(describeServerError({ message: 'algo raro' })).toMatch(/No se pudo guardar/);
  });
});
