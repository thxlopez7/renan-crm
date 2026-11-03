import React, { useEffect, useState } from 'react';
import { AlertCircle, CalendarPlus, Check, ChevronDown, Loader2, MessageCircle, Minus, Plus, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatFullDate } from '../../utils/formatters';
import { formatDuration, fromMinutes, toMinutes } from '../../utils/clubTime';
import { formatPyPhone, normalizePyPhone } from '../../utils/phone';
import { downloadBookingIcs } from '../../utils/calendar';
import { CLUB_WHATSAPP_URL } from '../../config/contact';

const PROFILE_KEY = 'bc_booking_profile';
export const LAST_BOOKING_KEY = 'bc_last_booking';

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeStorage(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode): the flow still works without it
  }
}

function Stepper({ value, max, onChange, label }) {
  return (
    <div className="bk-stepper" aria-label={label}>
      <button type="button" aria-label={`Quitar ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)}>
        <Minus size={16} />
      </button>
      <span>{value}</span>
      <button type="button" aria-label={`Agregar ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={16} />
      </button>
    </div>
  );
}

export function BookingSheet({ court, date, startTime, duration, price, isStaff, onClose, onConflict, onBooked, onOpenMyBooking }) {
  const { createBooking, pricingConfig } = useClub();
  const profile = readProfile();

  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone ? formatPyPhone(profile.phone) : '');
  const [remember, setRemember] = useState(true);
  const [rackets, setRackets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [barTable, setBarTable] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  // Lock the page behind the sheet and close on Escape
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const endTime = fromMinutes(toMinutes(startTime) + duration);
  const racketFee = Number(pricingConfig.racketRentalFee) || 0;
  const ballFee = Number(pricingConfig.ballTubeFee) || 0;
  const extrasTotal = rackets * racketFee + balls * ballFee;
  const total = price + extrasTotal;

  const normalizedPhone = normalizePyPhone(phone);
  const nameError = touched && name.trim().length < 2 ? 'Ingresá tu nombre.' : '';
  const phoneError = touched && !normalizedPhone ? 'Ingresá un celular válido, por ejemplo 0981 123 456.' : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (name.trim().length < 2 || !normalizedPhone) return;

    setSubmitting(true);
    try {
      const result = await createBooking({
        courtId: court.id,
        date,
        startTime,
        durationMinutes: duration,
        clientName: name.trim(),
        clientPhone: normalizedPhone,
        rentedRackets: rackets,
        ballTubes: balls,
        barTableRequested: barTable
      });
      writeStorage(PROFILE_KEY, remember ? { name: name.trim(), phone: normalizedPhone } : null);
      writeStorage(LAST_BOOKING_KEY, { code: result.code, phone: normalizedPhone });
      setBooking(result);
      onBooked?.();
    } catch (err) {
      setError(err.message || 'No pudimos registrar la reserva. Intentá de nuevo.');
      if (/ocupad|reservad/i.test(err.message || '')) onConflict?.();
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappText = booking
    ? `Hola Black Club, hice una reserva desde la web.\n` +
      `Código: ${booking.code}\n` +
      `${court.name} · ${formatFullDate(date)} · ${startTime} a ${endTime} (${formatDuration(duration)})\n` +
      `A nombre de: ${name.trim()}\n¿Me la confirman? Gracias.`
    : '';

  return (
    <div className="bk-sheet-backdrop" onClick={onClose}>
      <div
        className="bk-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bk-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bk-sheet-handle" />

        {booking ? (
          <div className="bk-success">
            <div className="bk-success-icon"><Check size={28} strokeWidth={2.5} /></div>
            <h3 id="bk-sheet-title" className="bk-sheet-title">
              {isStaff ? '¡Reserva cargada!' : '¡Listo! Tu turno está apartado'}
            </h3>
            <p className="bk-subtitle" style={{ lineHeight: 1.5 }}>
              {isStaff
                ? 'Quedó confirmada en la agenda.'
                : `Lo guardamos ${pricingConfig.holdExpiresMinutes || 60} min mientras el club lo confirma por WhatsApp.`}
            </p>
            {booking.code && booking.code !== '…' && <div className="bk-code">{booking.code}</div>}

            <div className="bk-summary" style={{ textAlign: 'left' }}>
              <div className="bk-summary-row"><span>Cancha</span><strong>{court.name}</strong></div>
              <div className="bk-summary-row"><span>Día</span><strong>{formatFullDate(date)}</strong></div>
              <div className="bk-summary-row"><span>Horario</span><strong>{startTime} a {endTime}</strong></div>
              <div className="bk-summary-row bk-summary-total"><span>A pagar en el club</span><strong>{formatGs(total)}</strong></div>
            </div>

            <div className="bk-stack">
              {!isStaff && (
                <a
                  className="bk-primary is-whatsapp"
                  href={`${CLUB_WHATSAPP_URL}?text=${encodeURIComponent(whatsappText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} /> Avisar al club por WhatsApp
                </a>
              )}
              <button
                type="button"
                className="bk-secondary"
                onClick={() => downloadBookingIcs({ code: booking.code, courtName: court.name, date, startTime, duration })}
              >
                <CalendarPlus size={17} /> Agregar a mi calendario
              </button>
              {!isStaff && (
                <button type="button" className="bk-secondary" onClick={() => { onClose(); onOpenMyBooking?.(); }}>
                  Ver o cancelar mi reserva
                </button>
              )}
              <button type="button" className="bk-secondary" style={{ border: 'none' }} onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="bk-sheet-head">
              <h3 id="bk-sheet-title" className="bk-sheet-title">Confirmá tu reserva</h3>
              <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
            </div>

            <div className="bk-summary">
              <div className="bk-summary-row"><span>Cancha</span><strong>{court.name}</strong></div>
              <div className="bk-summary-row"><span>Día</span><strong>{formatFullDate(date)}</strong></div>
              <div className="bk-summary-row">
                <span>Horario</span><strong>{startTime} a {endTime} · {formatDuration(duration)}</strong>
              </div>
            </div>

            <div className="bk-field">
              <label htmlFor="bk-name">Nombre y apellido</label>
              <input
                id="bk-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(nameError)}
                placeholder="Ej. Ana Benítez"
              />
              {nameError && <span className="bk-hint is-error">{nameError}</span>}
            </div>

            <div className="bk-field">
              <label htmlFor="bk-phone">Celular (WhatsApp)</label>
              <input
                id="bk-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => normalizedPhone && setPhone(formatPyPhone(normalizedPhone))}
                aria-invalid={Boolean(phoneError)}
                placeholder="0981 123 456"
              />
              {phoneError
                ? <span className="bk-hint is-error">{phoneError}</span>
                : <span className="bk-hint">Te escribimos a este número para confirmar.</span>}
            </div>

            <label className="bk-check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Recordar mis datos en este dispositivo
            </label>

            <details className="bk-extras">
              <summary>
                <span>Extras opcionales {extrasTotal > 0 && `· ${formatGs(extrasTotal)}`}{barTable && ' · mesa'}</span>
                <ChevronDown size={16} />
              </summary>
              <div className="bk-extras-body">
                <div className="bk-extra-row">
                  <div>Alquiler de paletas<small>{formatGs(racketFee)} c/u</small></div>
                  <Stepper value={rackets} max={4} onChange={setRackets} label="paletas" />
                </div>
                <div className="bk-extra-row">
                  <div>Tubo de pelotas nuevas<small>{formatGs(ballFee)} c/u</small></div>
                  <Stepper value={balls} max={6} onChange={setBalls} label="tubos de pelotas" />
                </div>
                <label className="bk-check" style={{ justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: 13.5 }}>
                    Reservar mesa en el bar para después
                  </span>
                  <input type="checkbox" checked={barTable} onChange={(e) => setBarTable(e.target.checked)} />
                </label>
              </div>
            </details>

            <div className="bk-summary">
              <div className="bk-summary-row"><span>Cancha</span><strong>{formatGs(price)}</strong></div>
              {extrasTotal > 0 && <div className="bk-summary-row"><span>Extras</span><strong>{formatGs(extrasTotal)}</strong></div>}
              <div className="bk-summary-row bk-summary-total"><span>Total a pagar en el club</span><strong>{formatGs(total)}</strong></div>
            </div>

            {error && (
              <div className="bk-error" role="alert"><AlertCircle size={16} style={{ flexShrink: 0 }} />{error}</div>
            )}

            <button type="submit" className="bk-primary" disabled={submitting}>
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Reservando…</> : 'Confirmar reserva'}
            </button>
            {!isStaff && (
              <p className="bk-hint" style={{ textAlign: 'center', marginTop: 10 }}>
                Sin seña. Podés cancelar online hasta {pricingConfig.cancelNoticeHours || 3} h antes.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
