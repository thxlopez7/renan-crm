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

export function downloadBookingIcs(booking) {
  const blob = new Blob([buildBookingIcs(booking)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reserva-${booking.code || 'black-club'}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
