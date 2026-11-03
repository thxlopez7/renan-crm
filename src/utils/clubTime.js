// Club clock: every "today" and "already passed" check uses Asunción time,
// not the device clock (Paraguay is UTC-3 all year since 2024).
export const CLUB_TIME_ZONE = 'America/Asuncion';

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: CLUB_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

export function clubNow(reference = new Date()) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(reference).map(p => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
}

export function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

export const toMinutes = (hhmm) => {
  const [h, m = 0] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (total) => {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export function formatDuration(minutes) {
  if (minutes === 60) return '1 h';
  if (minutes === 90) return '1 h 30';
  if (minutes === 120) return '2 h';
  return `${minutes} min`;
}

// All start times where a game of `duration` fits inside opening hours
export function buildStartTimes({ openHour, closeHour, stepMinutes, duration }) {
  const times = [];
  for (let start = openHour * 60; start + duration <= closeHour * 60; start += stepMinutes) {
    times.push(fromMinutes(start));
  }
  return times;
}

export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

// Busy ranges come as { courtId, startTime, endTime } with "HH:MM" strings ("00:00" end = midnight)
export function isCourtFree(busyRanges, courtId, startTime, duration) {
  const start = toMinutes(startTime);
  const end = start + duration;
  return !busyRanges.some(b => {
    if (b.courtId !== courtId) return false;
    const bStart = toMinutes(b.startTime);
    let bEnd = toMinutes(b.endTime);
    if (bEnd <= bStart) bEnd += 24 * 60;
    return rangesOverlap(start, end, bStart, bEnd);
  });
}

export function isStartPast(dateStr, startTime, now = clubNow()) {
  if (dateStr < now.date) return true;
  if (dateStr > now.date) return false;
  return toMinutes(startTime) <= now.minutes;
}
