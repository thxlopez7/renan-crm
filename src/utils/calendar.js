import { addDays, fromMinutes, toMinutes } from './clubTime';

const icsStamp = (date, time) => `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;

// .ics file in club local time, so phones add it at the right hour wherever they are
export function buildBookingIcs({ code, courtName, date, startTime, duration }) {
  const endTotal = toMinutes(startTime) + duration;
  const endDate = endTotal >= 24 * 60 ? addDays(date, 1) : date;
  const endTime = fromMinutes(endTotal);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Black Club//Reservas//ES',
    'BEGIN:VEVENT',
    `UID:${code || Date.now()}@blackclub`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=America/Asuncion:${icsStamp(date, startTime)}`,
    `DTEND;TZID=America/Asuncion:${icsStamp(endDate, endTime)}`,
    `SUMMARY:Pádel en Black Club · ${courtName}`,
    `DESCRIPTION:Reserva ${code || ''}`,
    'LOCATION:Black Club, San Juan Bautista, Misiones, Paraguay',
    'GEO:-26.674539;-57.130401',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Tenés pádel en 2 horas',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

const isAppleMobile = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function googleCalendarUrl({ code, courtName, date, startTime, duration }) {
  const endTotal = toMinutes(startTime) + duration;
  const endDate = endTotal >= 24 * 60 ? addDays(date, 1) : date;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Pádel en Black Club · ${courtName}`,
    dates: `${icsStamp(date, startTime)}/${icsStamp(endDate, fromMinutes(endTotal))}`,
    ctz: 'America/Asuncion',
    details: `Reserva ${code || ''}`,
    location: 'Black Club, San Juan Bautista, Misiones, Paraguay'
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// iPhone opens the .ics in the Calendar "add event" sheet; everyone else gets
// Google Calendar with the event filled in, instead of a loose file in Downloads
export function addBookingToCalendar(booking) {
  if (isAppleMobile()) {
    window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildBookingIcs(booking))}`;
    return;
  }
  window.open(googleCalendarUrl(booking), '_blank', 'noopener');
}
