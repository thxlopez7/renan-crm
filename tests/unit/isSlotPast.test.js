import { describe, it, expect } from 'vitest';
import { isSlotPast } from '../../src/utils/dateHelpers';

describe('isSlotPast - Business Logic for Time Slots and Dates', () => {
  // Reference time: Thursday 2026-10-22 at 17:03:00
  const referenceDate = new Date('2026-10-22T17:03:00');
  const todayStr = '2026-10-22';
  const yesterdayStr = '2026-10-21';
  const tomorrowStr = '2026-10-23';

  it('should disable passed time slots for today', () => {
    // 07:00 has already passed when current time is 17:03
    expect(isSlotPast('07:00 - 08:00', todayStr, referenceDate)).toBe(true);
    expect(isSlotPast('14:00 - 15:00', todayStr, referenceDate)).toBe(true);
    expect(isSlotPast('16:00 - 17:00', todayStr, referenceDate)).toBe(true);
  });

  it('should disable current active slot if hour already started', () => {
    // Current time is 17:03, slot 17:00 - 18:00 started 3 minutes ago
    expect(isSlotPast('17:00 - 18:00', todayStr, referenceDate)).toBe(true);
  });

  it('should keep future time slots enabled for today', () => {
    // 18:00 and onwards are in the future for today
    expect(isSlotPast('18:00 - 19:00', todayStr, referenceDate)).toBe(false);
    expect(isSlotPast('20:00 - 21:00', todayStr, referenceDate)).toBe(false);
    expect(isSlotPast('22:00 - 23:00', todayStr, referenceDate)).toBe(false);
  });

  it('should allow all time slots for future dates regardless of time', () => {
    expect(isSlotPast('07:00 - 08:00', tomorrowStr, referenceDate)).toBe(false);
    expect(isSlotPast('12:00 - 13:00', tomorrowStr, referenceDate)).toBe(false);
    expect(isSlotPast('23:00 - 00:00', tomorrowStr, referenceDate)).toBe(false);
  });

  it('should block all time slots for past dates', () => {
    expect(isSlotPast('07:00 - 08:00', yesterdayStr, referenceDate)).toBe(true);
    expect(isSlotPast('23:00 - 00:00', yesterdayStr, referenceDate)).toBe(true);
  });

  it('should correctly handle boundary midnight slots like 23:00 - 00:00', () => {
    // For today at 17:03, 23:00 is in the future
    expect(isSlotPast('23:00 - 00:00', todayStr, referenceDate)).toBe(false);

    // If current time is 23:15, 23:00 - 00:00 is past
    const lateRef = new Date('2026-10-22T23:15:00');
    expect(isSlotPast('23:00 - 00:00', todayStr, lateRef)).toBe(true);
  });
});
