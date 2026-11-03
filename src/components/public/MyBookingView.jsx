import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CalendarPlus, Loader2, MessageCircle } from 'lucide-react';
import { cancelMyBooking, describeServerError, fetchMyBooking } from '../../services/clubService';
import { formatFullDate, formatGs } from '../../utils/formatters';
import { formatDuration } from '../../utils/clubTime';
import { formatPyPhone, normalizePyPhone } from '../../utils/phone';
import { downloadBookingIcs } from '../../utils/calendar';
import { CLUB_WHATSAPP_URL } from '../../config/contact';
import { LAST_BOOKING_KEY } from './BookingSheet';
import '../../styles/booking.css';

const STATUS_STYLE = {
  Pendiente: { cls: 'is-pending', text: 'Esperando confirmación del club' },
  Confirmada: { cls: 'is-confirmed', text: 'Confirmada' },
  Jugando: { cls: 'is-confirmed', text: 'En juego' },
  Finalizada: { cls: 'is-neutral', text: 'Finalizada' },
  Cancelada: { cls: 'is-cancelled', text: 'Cancelada' },
  'No vino': { cls: 'is-cancelled', text: 'No se presentó' }
};

function readLastBooking() {
  try {
    return JSON.parse(localStorage.getItem(LAST_BOOKING_KEY)) || {};
  } catch {
    return {};
  }
}

export function MyBookingView({ onBack }) {
  const last = readLastBooking();
  const [code, setCode] = useState(last.code || '');
  const [phone, setPhone] = useState(last.phone ? formatPyPhone(last.phone) : '');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (lookupCode = code, lookupPhone = phone) => {
    setError('');
    const normalized = normalizePyPhone(lookupPhone);
    if (!lookupCode.trim() || !normalized) {
      setError('Ingresá el código de la reserva y el celular con el que reservaste.');
      return;
    }
    setLoading(true);
    try {
      const result = await fetchMyBooking(lookupCode.trim(), normalized);
      if (!result) setError('No encontramos una reserva con ese código y celular.');
      setBooking(result);
    } catch (err) {
      setError(describeServerError(err));
    } finally {
      setLoading(false);
    }
  };

  // Returning visitors see their last booking straight away
  useEffect(() => {
    if (last.code && last.phone) lookup(last.code, last.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    setError('');
    try {
      setBooking(await cancelMyBooking(booking.code, normalizePyPhone(phone)));
      setConfirmCancel(false);
    } catch (err) {
      setError(describeServerError(err));
    } finally {
      setCancelling(false);
    }
  };

  const status = booking ? STATUS_STYLE[booking.status] || { cls: 'is-neutral', text: booking.status } : null;
  const isActive = booking && ['Pendiente', 'Confirmada'].includes(booking.status);

  return (
    <div className="bk" style={{ maxWidth: 560 }}>
      <div className="bk-head">
        <div>
          <h2 className="bk-title">Mi reserva</h2>
          <p className="bk-subtitle">Consultá el estado o cancelá tu turno.</p>
        </div>
        <button type="button" className="bk-link-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Reservar
        </button>
      </div>

      <form
        className="bk-card"
        onSubmit={(e) => { e.preventDefault(); lookup(); }}
        noValidate
      >
        <div className="bk-field">
          <label htmlFor="mb-code">Código de reserva</label>
          <input
            id="mb-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="BC-1234"
            autoCapitalize="characters"
          />
        </div>
        <div className="bk-field">
          <label htmlFor="mb-phone">Celular con el que reservaste</label>
          <input
            id="mb-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0981 123 456"
          />
        </div>
        <button type="submit" className="bk-primary" disabled={loading}>
          {loading ? <><Loader2 size={18} className="animate-spin" /> Buscando…</> : 'Buscar reserva'}
        </button>
      </form>

      {error && <div className="bk-error" role="alert"><AlertCircle size={16} style={{ flexShrink: 0 }} />{error}</div>}

      {booking && (
        <div className="bk-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span className="bk-code" style={{ margin: 0, fontSize: 16 }}>{booking.code}</span>
            <span className={`bk-status ${status.cls}`}>{status.text}</span>
          </div>

          <div className="bk-summary">
            <div className="bk-summary-row"><span>Cancha</span><strong>{booking.courtName}</strong></div>
            <div className="bk-summary-row"><span>Día</span><strong>{formatFullDate(booking.date)}</strong></div>
            <div className="bk-summary-row">
              <span>Horario</span>
              <strong>{booking.timeSlot.replace(' - ', ' a ')} · {formatDuration(booking.durationMinutes)}</strong>
            </div>
            <div className="bk-summary-row"><span>A nombre de</span><strong>{booking.clientName}</strong></div>
            <div className="bk-summary-row bk-summary-total"><span>Cancha</span><strong>{formatGs(booking.courtAmount)}</strong></div>
          </div>

          {booking.status === 'Pendiente' && (
            <p className="bk-hint" style={{ marginBottom: 12, lineHeight: 1.5 }}>
              El club todavía no confirmó. Si no lo hace a tiempo, el turno se libera solo.
            </p>
          )}

          {isActive && (
            <div className="bk-stack">
              <button
                type="button"
                className="bk-secondary"
                onClick={() => downloadBookingIcs({
                  code: booking.code,
                  courtName: booking.courtName,
                  date: booking.date,
                  startTime: booking.startTime,
                  duration: booking.durationMinutes
                })}
              >
                <CalendarPlus size={17} /> Agregar a mi calendario
              </button>

              {booking.canCancel ? (
                confirmCancel ? (
                  <div className="bk-stack">
                    <p className="bk-hint" style={{ textAlign: 'center' }}>¿Seguro? El turno queda libre para otra persona.</p>
                    <button type="button" className="bk-primary" style={{ background: '#F87171', color: '#1F0A0A' }} disabled={cancelling} onClick={handleCancel}>
                      {cancelling ? <><Loader2 size={18} className="animate-spin" /> Cancelando…</> : 'Sí, cancelar reserva'}
                    </button>
                    <button type="button" className="bk-secondary" onClick={() => setConfirmCancel(false)}>No, mantenerla</button>
                  </div>
                ) : (
                  <button type="button" className="bk-secondary" style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.4)' }} onClick={() => setConfirmCancel(true)}>
                    Cancelar reserva
                  </button>
                )
              ) : (
                <a
                  className="bk-primary is-whatsapp"
                  href={`${CLUB_WHATSAPP_URL}?text=${encodeURIComponent(`Hola, necesito cancelar o cambiar mi reserva ${booking.code}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} /> Faltan menos de {booking.cancelNoticeHours} h: escribinos
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
