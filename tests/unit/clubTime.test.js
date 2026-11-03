import { describe, it, expect } from 'vitest';
import { clubNow, addDays, buildStartTimes, isCourtFree, isStartPast } from '../../src/utils/clubTime';
import { normalizePyPhone, formatPyPhone } from '../../src/utils/phone';

describe('clubNow', () => {
  it('uses Asunción time (UTC-3) regardless of the device clock', () => {
    expect(clubNow(new Date('2026-11-03T02:30:00Z'))).toEqual({ date: '2026-11-02', minutes: 23 * 60 + 30 });
  });
});

describe('addDays', () => {
  it('crosses month boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
  });
});

describe('buildStartTimes', () => {
  it('only offers starts where the whole game fits before closing', () => {
    const times = buildStartTimes({ openHour: 22, closeHour: 24, stepMinutes: 30, duration: 90 });
    expect(times).toEqual(['22:00', '22:30']);
  });
});

describe('isCourtFree', () => {
  const busy = [{ courtId: 'c1', startTime: '19:00', endTime: '20:30' }, { courtId: 'c1', startTime: '22:30', endTime: '00:00' }];
  it('detects partial overlaps', () => {
    expect(isCourtFree(busy, 'c1', '20:00', 60)).toBe(false);
    expect(isCourtFree(busy, 'c1', '20:30', 90)).toBe(true);
    expect(isCourtFree(busy, 'c2', '19:00', 90)).toBe(true);
  });
  it('treats a 00:00 end as midnight', () => {
    expect(isCourtFree(busy, 'c1', '22:00', 60)).toBe(false);
  });
});

describe('isStartPast', () => {
  it('compares against club time on the same day', () => {
    const now = { date: '2026-11-02', minutes: 19 * 60 };
    expect(isStartPast('2026-11-02', '19:00', now)).toBe(true);
    expect(isStartPast('2026-11-02', '19:30', now)).toBe(false);
    expect(isStartPast('2026-11-03', '07:00', now)).toBe(false);
  });
});

describe('normalizePyPhone', () => {
  it('accepts the usual local and international formats', () => {
    for (const input of ['0981 123 456', '981123456', '+595 981 123 456', '595981123456']) {
      expect(normalizePyPhone(input)).toBe('+595981123456');
    }
  });
  it('rejects landlines and incomplete numbers', () => {
    expect(normalizePyPhone('021 123 456')).toBeNull();
    expect(normalizePyPhone('0981 12')).toBeNull();
  });
  it('formats for display', () => {
    expect(formatPyPhone('+595981123456')).toBe('0981 123 456');
  });
});
