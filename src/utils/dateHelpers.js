import { formatShortDate } from './formatters';

/**
 * Generates an array of the next 7 days for schedule selection.
 * @returns {Array<{dateStr: string, dayName: string, dayNumber: number, formatted: string}>}
 */
export function getNext7Days() {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      dateStr,
      dayName: i === 0 ? 'Hoy' : days[d.getDay()],
      dayNumber: d.getDate(),
      formatted: formatShortDate(dateStr)
    };
  });
}

/**
 * Checks if a given time slot has already passed relative to referenceDate (default now).
 * @param {string} slot - E.g. "07:00 - 08:00" or "23:00 - 00:00"
 * @param {string} dateStr - YYYY-MM-DD
 * @param {Date} [referenceDate] - Optional reference Date (defaults to new Date())
 * @returns {boolean}
 */
export function isSlotPast(slot, dateStr, referenceDate = new Date()) {
  if (!slot || !dateStr) return false;

  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const day = String(referenceDate.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  
  // Past date entirely
  if (dateStr < todayStr) return true;
  // Future date
  if (dateStr > todayStr) return false;
  
  // dateStr === todayStr: compare hours
  const startTime = slot.split(' - ')[0]; // e.g. "07:00", "17:00"
  const [slotHour, slotMinute = 0] = startTime.split(':').map(Number);
  
  const currentHour = referenceDate.getHours();
  const currentMinute = referenceDate.getMinutes();
  
  // If the slot starts earlier than current hour, or same hour (already started)
  if (slotHour < currentHour || (slotHour === currentHour && currentMinute >= slotMinute)) {
    return true;
  }
  return false;
}
