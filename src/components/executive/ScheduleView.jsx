import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, MessageCircle, Plus, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { addDays, clubNow, formatDuration, fromMinutes, toMinutes, weekdayOf } from '../../utils/clubTime';
import { formatGs } from '../../utils/formatters';
import { formatPyPhone, whatsappLink } from '../../utils/phone';
import { StaffBookingSheet } from './StaffBookingSheet';
import { BookingActionsSheet } from './BookingActionsSheet';
import '../../styles/booking.css';
import '../../styles/admin.css';

const PX_PER_MIN = 1.2;
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
const VISIBLE = ['Pendiente', 'Confirmada', 'Jugando', 'Finalizada', 'No vino'];

export const STATUS_CLASS = {
  Pendiente: 'is-pending',
  Confirmada: '',
  Jugando: 'is-playing',
  Finalizada: 'is-done',
  'No vino': 'is-noshow'
};

export function categoryTag(booking) {
  const category = booking.category || '';
  if (category === 'Bloqueo') return 'Bloqueo';
  if (category.includes('Fijo')) return 'Fijo';
  if (category.includes('Clase')) return 'Clase';
  return null;
}

export function longDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  const text = `${DAY_NAMES[weekdayOf(dateStr)]} ${d} de ${MONTHS[m - 1]}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function confirmationMessage(booking, courtName) {
  return `Hola ${booking.clientName.split(' ')[0]}, te confirmamos tu reserva ${booking.code} en ${courtName}, ` +
    `el ${longDate(booking.date)} de ${booking.startTime} a ${booking.endTime}. ¡Te esperamos en Black Club!`;
}

function useMinuteClock() {
  const [now, setNow] = useState(clubNow);
  useEffect(() => {
    const timer = setInterval(() => setNow(clubNow()), 30000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function minutesLeft(expiresAt) {
  if (!expiresAt) return null;
  return Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000);
}

export function ScheduleView({ onOpenPosTab }) {
  const { bookings, courts, pricingConfig, selectedDate, setSelectedDate, updateBookingStatus } = useClub();
  const now = useMinuteClock();
  const [newDraft, setNewDraft] = useState(null);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const boardRef = useRef(null);

  const openMin = Number(pricingConfig.openHour) * 60;
  const closeMin = Number(pricingConfig.closeHour) * 60;
  const height = (closeMin - openMin) * PX_PER_MIN;
  const courtName = (id) => courts.find(c => c.id === id)?.name || 'Cancha';

  const pending = useMemo(() => bookings
    .filter(b => b.status === 'Pendiente' && b.date >= now.date)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
  [bookings, now.date]);

  const dayBookings = useMemo(
    () => bookings.filter(b => b.date === selectedDate && VISIBLE.includes(b.status)),
    [bookings, selectedDate]
  );

  const stats = useMemo(() => {
    const real = dayBookings.filter(b => b.category !== 'Bloqueo' && b.status !== 'No vino');
    const minutes = real.reduce((sum, b) => sum + b.durationMinutes, 0);
    const capacity = courts.filter(c => c.status === 'operational').length * (closeMin - openMin);
    return {
      count: real.length,
      occupancy: capacity > 0 ? Math.round((minutes / capacity) * 100) : 0,
      revenue: real.reduce((sum, b) => sum + (b.courtAmount || 0), 0)
    };
  }, [dayBookings, courts, closeMin, openMin]);

  const activeBooking = bookings.find(b => b.id === activeBookingId);

  // Tap on an empty spot: snap to the half hour and open a prefilled booking
  const handleColumnTap = (court, e) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const minute = openMin + Math.floor((e.clientY - rect.top) / PX_PER_MIN / 30) * 30;
    setNewDraft({ courtId: court.id, date: selectedDate, startTime: fromMinutes(Math.min(minute, closeMin - 60)) });
  };

  // Opening today's agenda jumps to the current hour
  useEffect(() => {
    if (selectedDate !== now.date || !boardRef.current) return;
    const offset = Math.max(0, (now.minutes - openMin - 60) * PX_PER_MIN);
    const top = boardRef.current.getBoundingClientRect().top + window.scrollY + offset - 120;
    if (offset > 0) window.scrollTo({ top, behavior: 'smooth' });
    // Only on day change, not on every clock tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const nowOffset = selectedDate === now.date && now.minutes >= openMin && now.minutes <= closeMin
    ? (now.minutes - openMin) * PX_PER_MIN
    : null;

  return (
    <div className="ag">
      <div className="ag-toolbar">
        <button type="button" className="bk-icon-btn" aria-label="Día anterior" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
          <ChevronLeft size={18} />
        </button>
        <div className="ag-date-label">
          {longDate(selectedDate)}
          <small>{selectedDate === now.date ? 'Hoy' : selectedDate === addDays(now.date, 1) ? 'Mañana' : ' '}</small>
        </div>
        {selectedDate !== now.date && (
          <button type="button" className="ag-today-btn" onClick={() => setSelectedDate(now.date)}>Hoy</button>
        )}
        <button type="button" className="bk-icon-btn" aria-label="Día siguiente" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          <ChevronRight size={18} />
        </button>
      </div>

      {pending.length > 0 && (
        <section aria-label="Solicitudes por confirmar">
          <div className="ag-section-title">
            Solicitudes por confirmar <span className="ag-count">{pending.length}</span>
          </div>
          <div className="ag-requests">
            {pending.map(b => {
              const left = minutesLeft(b.expiresAt);
              const confirmUrl = whatsappLink(b.clientPhone, confirmationMessage(b, courtName(b.courtId)));
              return (
                <article key={b.id} className="ag-request">
                  <div className="ag-request-head">
                    <div>
                      <div className="ag-request-name">{b.clientName}</div>
                      <div className="ag-request-meta">
                        {courtName(b.courtId)}<br />
                        {b.date === now.date ? 'Hoy' : longDate(b.date)} · {b.startTime} a {b.endTime} ({formatDuration(b.durationMinutes)})<br />
                        {formatPyPhone(b.clientPhone)} · {formatGs(b.courtAmount)}
                      </div>
                    </div>
                    {left !== null && (
                      <span className={`ag-timer ${left <= 15 ? 'is-urgent' : ''}`}>
                        {left > 0 ? `vence en ${left} min` : 'vencida'}
                      </span>
                    )}
                  </div>
                  <div className="ag-actions">
                    <button type="button" className="ag-btn is-success" onClick={() => updateBookingStatus(b.id, 'Confirmada')}>
                      <Check size={16} /> Confirmar
                    </button>
                    {confirmUrl && (
                      <a className="ag-btn is-whatsapp is-icon" href={confirmUrl} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp">
                        <MessageCircle size={17} />
                      </a>
                    )}
                    <button type="button" className="ag-btn is-danger is-icon" aria-label="Rechazar" onClick={() => setActiveBookingId(b.id)}>
                      <X size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="ag-summary">
        <div className="ag-stat"><strong>{stats.count}</strong><span>reservas</span></div>
        <div className="ag-stat"><strong>{stats.occupancy}%</strong><span>ocupación</span></div>
        <div className="ag-stat"><strong style={{ fontSize: 15 }}>{formatGs(stats.revenue).replace(' Gs.', '')}</strong><span>Gs. en canchas</span></div>
      </div>

      <div className="ag-board" ref={boardRef} style={{ '--ag-courts': courts.length }}>
        <div className="ag-board-scroll">
          <div className="ag-board-head">
            <div />
            {courts.map(c => (
              <div key={c.id}>
                {c.name.replace(/\s*\(.*\)/, '')}
                {c.status !== 'operational' && <span style={{ display: 'block', color: '#FBBF24', fontWeight: 600 }}>fuera de servicio</span>}
              </div>
            ))}
          </div>
          <div className="ag-grid" style={{ height }}>
            <div className="ag-hours">
              {Array.from({ length: (closeMin - openMin) / 60 + 1 }, (_, i) => openMin + i * 60).map(m => (
                <div key={m} className="ag-hour" style={{ top: Math.max(6, Math.min(height - 6, (m - openMin) * PX_PER_MIN)) }}>
                  {fromMinutes(m)}
                </div>
              ))}
            </div>
            {courts.map(court => (
              <div
                key={court.id}
                className="ag-col"
                role="button"
                tabIndex={-1}
                aria-label={`Nueva reserva en ${court.name}`}
                onClick={(e) => handleColumnTap(court, e)}
              >
                {dayBookings.filter(b => b.courtId === court.id).map(b => {
                  const top = (toMinutes(b.startTime) - openMin) * PX_PER_MIN;
                  const isBlock = b.category === 'Bloqueo';
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`ag-event ${isBlock ? 'is-block' : STATUS_CLASS[b.status] || ''}`}
                      style={{ top: top + 1, height: b.durationMinutes * PX_PER_MIN - 2 }}
                      onClick={() => setActiveBookingId(b.id)}
                    >
                      <span className="ag-event-name">{b.clientName}</span>
                      <span className="ag-event-time">{b.startTime}–{b.endTime}</span>
                      {b.durationMinutes >= 90 && (
                        <span className="ag-event-tag">
                          {categoryTag(b) || b.status}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {nowOffset !== null && <div className="ag-now" style={{ top: nowOffset }} />}
          </div>
        </div>
      </div>

      <div className="ag-legend">
        <span><i style={{ background: '#F2A33A' }} />Por confirmar</span>
        <span><i style={{ background: '#E8E4DC' }} />Confirmada</span>
        <span><i style={{ background: '#8FBF9F' }} />Jugando</span>
        <span><i style={{ background: '#71717A' }} />Finalizada / bloqueo</span>
        <span>Tocá un espacio libre para reservar</span>
      </div>

      <button type="button" className="ag-fab" onClick={() => setNewDraft({ date: selectedDate })}>
        <Plus size={20} /> Nueva reserva
      </button>

      {newDraft && <StaffBookingSheet draft={newDraft} onClose={() => setNewDraft(null)} />}
      {activeBooking && (
        <BookingActionsSheet
          booking={activeBooking}
          courtName={courtName(activeBooking.courtId)}
          onClose={() => setActiveBookingId(null)}
          onOpenPosTab={onOpenPosTab}
        />
      )}
    </div>
  );
}
