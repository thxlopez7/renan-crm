import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarCheck, ChevronDown, Search } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { fetchAvailability } from '../../services/clubService';
import {
  addDays,
  buildStartTimes,
  clubNow,
  formatDuration,
  fromMinutes,
  isCourtFree,
  isStartPast,
  toMinutes,
  weekdayOf
} from '../../utils/clubTime';
import { formatGs } from '../../utils/formatters';
import { BookingSheet } from './BookingSheet';
import '../../styles/booking.css';

const DAY_NAMES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
const DURATIONS = [60, 90, 120];
const DURATION_KEY = 'bc_booking_duration';
const PERIODS = [
  { label: 'Mañana', from: 0, to: 12 * 60 },
  { label: 'Tarde', from: 12 * 60, to: 18 * 60 },
  { label: 'Noche', from: 18 * 60, to: 24 * 60 }
];

function readStoredDuration() {
  try {
    const value = Number(localStorage.getItem(DURATION_KEY));
    return DURATIONS.includes(value) ? value : 90;
  } catch {
    return 90;
  }
}

export function BookingFlow({ onOpenMyBooking }) {
  const { courts, pricingConfig, user } = useClub();
  const today = clubNow().date;

  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(readStoredDuration);
  const [startTime, setStartTime] = useState(null);
  const [busy, setBusy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sheetCourt, setSheetCourt] = useState(null);
  const courtsRef = useRef(null);

  const days = useMemo(() => {
    const count = Math.max(1, Number(pricingConfig.bookingWindowDays) || 14);
    return Array.from({ length: count + 1 }, (_, i) => {
      const value = addDays(today, i);
      const [, month, day] = value.split('-').map(Number);
      const name = i === 0 ? 'hoy' : i === 1 ? 'mañana' : DAY_NAMES[weekdayOf(value)];
      return { value, name, day, month: MONTHS[month - 1] };
    });
  }, [today, pricingConfig.bookingWindowDays]);

  const loadAvailability = useCallback(async () => {
    try {
      setLoadError('');
      setBusy(await fetchAvailability(date));
    } catch {
      setLoadError('No pudimos cargar la disponibilidad. Revisá tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    loadAvailability();
    // Keep the grid fresh while the visitor decides
    const timer = setInterval(loadAvailability, 30000);
    return () => clearInterval(timer);
  }, [loadAvailability]);

  const operationalCourts = useMemo(
    () => courts.filter(c => c.status === 'operational'),
    [courts]
  );

  const slots = useMemo(() => {
    const now = clubNow();
    return buildStartTimes({
      openHour: Number(pricingConfig.openHour),
      closeHour: Number(pricingConfig.closeHour),
      stepMinutes: Number(pricingConfig.slotStepMinutes) || 30,
      duration
    }).map(time => {
      const past = isStartPast(date, time, now);
      const freeCourts = past ? [] : operationalCourts.filter(c => isCourtFree(busy, c.id, time, duration));
      return { time, past, freeCount: freeCourts.length };
    });
  }, [busy, date, duration, operationalCourts, pricingConfig]);

  const selectedSlot = slots.find(s => s.time === startTime);

  // A selected time that became full or past is dropped
  useEffect(() => {
    if (startTime && (!selectedSlot || selectedSlot.freeCount === 0)) setStartTime(null);
  }, [selectedSlot, startTime]);

  const pickedByUser = useRef(false);
  const pickDate = (value) => {
    pickedByUser.current = true;
    setDate(value);
    setStartTime(null);
  };

  const pickDuration = (value) => {
    setDuration(value);
    try { localStorage.setItem(DURATION_KEY, String(value)); } catch { /* private mode */ }
  };

  const pickTime = (time) => {
    setStartTime(time);
    requestAnimationFrame(() => courtsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const endTime = startTime ? fromMinutes(toMinutes(startTime) + duration) : null;
  const priceFor = (court) => Math.round(court.rate * duration / 60);
  const visibleSlots = slots.filter(s => !s.past);
  const hasAnyFree = visibleSlots.some(s => s.freeCount > 0);

  // Late at night today is already full or over: open on tomorrow instead of an empty day
  useEffect(() => {
    if (!loading && !pickedByUser.current && date === today && !hasAnyFree) setDate(addDays(today, 1));
  }, [loading, hasAnyFree, date, today]);

  return (
    <div className="bk">
      <div className="bk-head">
        <div>
          <h2 className="bk-title">Reservá tu cancha</h2>
          <p className="bk-subtitle">Elegí día, duración y hora. Te confirmamos por WhatsApp.</p>
        </div>
        <button type="button" className="bk-link-btn" onClick={onOpenMyBooking}>
          <Search size={14} /> Mi reserva
        </button>
      </div>

      <section aria-label="Día">
        <div className="bk-step-label">1 · Día</div>
        <div className="bk-days" role="listbox" aria-label="Elegí el día">
          {days.map(d => (
            <button
              key={d.value}
              type="button"
              role="option"
              aria-selected={d.value === date}
              className={`bk-day ${d.value === date ? 'is-active' : ''}`}
              onClick={() => pickDate(d.value)}
            >
              <span className="bk-day-name">{d.name}</span>
              <span className="bk-day-num">{d.day}</span>
              <span className="bk-day-month">{d.month}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Duración">
        <div className="bk-step-label">2 · Duración del partido</div>
        <div className="bk-segment" role="radiogroup" aria-label="Duración">
          {DURATIONS.map(value => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={value === duration}
              className={value === duration ? 'is-active' : ''}
              onClick={() => pickDuration(value)}
            >
              {formatDuration(value)}
              {value === 90 && <small>el más elegido</small>}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Hora">
        <div className="bk-step-label">3 · Hora de inicio</div>
        {loadError && <div className="bk-error">{loadError}</div>}
        {loading ? (
          <div className="bk-times">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="bk-skeleton" />)}
          </div>
        ) : !hasAnyFree ? (
          <div className="bk-empty">
            <strong>No quedan turnos de {formatDuration(duration)} este día</strong>
            Probá con otro día o con una duración más corta.
          </div>
        ) : (
          PERIODS.map(period => {
            const periodSlots = visibleSlots.filter(s => {
              const m = toMinutes(s.time);
              return m >= period.from && m < period.to;
            });
            if (periodSlots.length === 0) return null;
            return (
              <div key={period.label} className="bk-period">
                <div className="bk-period-title">{period.label}</div>
                <div className="bk-times">
                  {periodSlots.map(slot => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={slot.freeCount === 0}
                      aria-pressed={slot.time === startTime}
                      className={[
                        'bk-time',
                        slot.time === startTime ? 'is-active' : '',
                        slot.freeCount === 1 ? 'is-low' : ''
                      ].join(' ')}
                      onClick={() => pickTime(slot.time)}
                    >
                      <span className="bk-time-hour">{slot.time}</span>
                      <span className="bk-time-free">
                        {slot.freeCount === 0 ? 'completo' : slot.freeCount === 1 ? 'última' : `${slot.freeCount} libres`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {startTime && (
        <section ref={courtsRef} aria-label="Cancha" style={{ scrollMarginTop: '72px' }}>
          <div className="bk-step-label">4 · Cancha · {startTime} a {endTime}</div>
          <div className="bk-courts">
            {operationalCourts.map(court => {
              const free = isCourtFree(busy, court.id, startTime, duration);
              return (
                <article key={court.id} className={`bk-court ${free ? '' : 'is-busy'}`}>
                  <div className="bk-court-media" style={{ backgroundImage: `url(${court.image || '/images/court_panoramic.jpg'})` }} />
                  <div className="bk-court-body">
                  <div className="bk-court-top">
                    <div>
                      <div className="bk-court-name">{court.name}</div>
                      <div className="bk-court-spec">{court.specs || court.surface}</div>
                    </div>
                    <div className="bk-court-price">
                      <strong>{formatGs(priceFor(court))}</strong>
                      <span>{formatDuration(duration)} · cancha completa</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bk-primary"
                    disabled={!free}
                    onClick={() => setSheetCourt(court)}
                  >
                    {free ? <><CalendarCheck size={17} /> Reservar</> : 'Ocupada a esa hora'}
                  </button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="bk-hint" style={{ marginTop: 10 }}>
            Precio por la cancha completa (4 jugadores). Se paga en el club.
          </p>
        </section>
      )}

      {!startTime && !loading && hasAnyFree && (
        <p className="bk-hint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChevronDown size={14} /> Tocá una hora para ver las canchas libres.
        </p>
      )}

      {sheetCourt && startTime && (
        <BookingSheet
          court={sheetCourt}
          date={date}
          startTime={startTime}
          duration={duration}
          price={priceFor(sheetCourt)}
          isStaff={Boolean(user)}
          onClose={() => setSheetCourt(null)}
          onConflict={loadAvailability}
          onBooked={loadAvailability}
          onOpenMyBooking={onOpenMyBooking}
        />
      )}
    </div>
  );
}
