import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { addDays, buildStartTimes, formatDuration, fromMinutes, isCourtFree, toMinutes } from '../../utils/clubTime';
import { formatGs } from '../../utils/formatters';
import { formatPyPhone, normalizePyPhone } from '../../utils/phone';
import { longDate } from './ScheduleView';

const TYPES = [
  { id: 'Reserva Estándar', label: 'Reserva' },
  { id: 'Turno Fijo', label: 'Turno fijo' },
  { id: 'Clase', label: 'Clase' },
  { id: 'Bloqueo', label: 'Bloquear cancha' }
];
const DURATIONS = [60, 90, 120];
const WEEK_OPTIONS = [4, 8, 12];
const OCCUPYING = ['Pendiente', 'Confirmada', 'Jugando', 'Finalizada'];

export function StaffBookingSheet({ draft, onClose }) {
  const { courts, bookings, players, pricingConfig, createBooking } = useClub();

  const [type, setType] = useState('Reserva Estándar');
  const [courtId, setCourtId] = useState(draft.courtId || courts.find(c => c.status === 'operational')?.id || courts[0]?.id);
  const [date, setDate] = useState(draft.date);
  const [duration, setDuration] = useState(90);
  const [startTime, setStartTime] = useState(draft.startTime || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [price, setPrice] = useState('');
  const [priceEdited, setPriceEdited] = useState(false);
  const [weeks, setWeeks] = useState(8);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const isBlock = type === 'Bloqueo';
  const isFixed = type === 'Turno Fijo';
  const court = courts.find(c => c.id === courtId);

  const startTimes = useMemo(() => buildStartTimes({
    openHour: Number(pricingConfig.openHour),
    closeHour: Number(pricingConfig.closeHour),
    stepMinutes: Number(pricingConfig.slotStepMinutes) || 30,
    duration
  }), [pricingConfig, duration]);

  // Keep the start valid when the duration shrinks the available list
  useEffect(() => {
    if (startTime && !startTimes.includes(startTime)) setStartTime(startTimes[startTimes.length - 1] || '');
  }, [startTimes, startTime]);

  const suggestedPrice = court ? Math.round(court.rate * duration / 60) : 0;
  const finalPrice = isBlock ? 0 : priceEdited ? Number(String(price).replace(/\D/g, '')) || 0 : suggestedPrice;

  const busyFor = (day) => bookings
    .filter(b => b.date === day && OCCUPYING.includes(b.status))
    .map(b => ({ courtId: b.courtId, startTime: b.startTime, endTime: b.endTime }));

  const dates = isFixed ? Array.from({ length: weeks }, (_, i) => addDays(date, i * 7)) : [date];
  const conflicts = startTime ? dates.filter(d => !isCourtFree(busyFor(d), courtId, startTime, duration)) : [];

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (q.length < 2 || isBlock) return [];
    return players
      .filter(p => p.name?.toLowerCase().includes(q) || (p.phone || '').includes(q.replace(/\D/g, '') || '§'))
      .slice(0, 4);
  }, [name, players, isBlock]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!startTime) return setError('Elegí la hora de inicio.');
    if (name.trim().length < 2) return setError(isBlock ? 'Escribí el motivo del bloqueo.' : 'Escribí el nombre del cliente.');
    if (phone.trim() && !normalizePyPhone(phone)) return setError('El celular no es válido (09XX XXX XXX).');
    if (!isFixed && conflicts.length > 0) return setError('La cancha ya está ocupada en ese horario.');

    const toCreate = dates.filter(d => !conflicts.includes(d));
    if (toCreate.length === 0) return setError('Todas las fechas elegidas están ocupadas.');

    for (const day of toCreate) {
      await createBooking({
        courtId,
        date: day,
        startTime,
        durationMinutes: duration,
        clientName: name.trim(),
        clientPhone: isBlock ? '' : phone,
        category: type,
        courtAmount: finalPrice
      });
    }
    setResult({ created: toCreate.length, skipped: conflicts });
  };

  const endTime = startTime ? fromMinutes(toMinutes(startTime) + duration) : '';

  return (
    <div className="bk-sheet-backdrop" onClick={onClose}>
      <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="sb-title" onClick={(e) => e.stopPropagation()}>
        <div className="bk-sheet-handle" />
        <div className="bk-sheet-head">
          <h3 id="sb-title" className="bk-sheet-title">{result ? 'Listo' : isBlock ? 'Bloquear cancha' : 'Nueva reserva'}</h3>
          <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
        </div>

        {result ? (
          <div className="bk-stack">
            <p className="bk-subtitle" style={{ lineHeight: 1.5 }}>
              {result.created === 1 ? 'Se cargó 1 reserva confirmada.' : `Se cargaron ${result.created} reservas confirmadas.`}
              {result.skipped.length > 0 && ` Se salteó: ${result.skipped.map(longDate).join(', ')} (ocupado).`}
            </p>
            <button type="button" className="bk-primary" onClick={onClose}>Volver a la agenda</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="ag-chips" style={{ marginBottom: 14 }}>
              {TYPES.map(t => (
                <button key={t.id} type="button" className={`ag-chip ${type === t.id ? 'is-active' : ''}`} onClick={() => setType(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="ag-row" style={{ marginBottom: 12 }}>
              <div className="bk-field" style={{ marginBottom: 0 }}>
                <label htmlFor="sb-court">Cancha</label>
                <select id="sb-court" className="ag-select" value={courtId} onChange={(e) => setCourtId(e.target.value)}>
                  {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="bk-field" style={{ marginBottom: 0 }}>
                <label htmlFor="sb-date">{isFixed ? 'Desde' : 'Día'}</label>
                <input id="sb-date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
              </div>
            </div>

            <div className="bk-field">
              <label>Duración</label>
              <div className="bk-segment">
                {DURATIONS.map(d => (
                  <button key={d} type="button" className={d === duration ? 'is-active' : ''} onClick={() => setDuration(d)}>
                    {formatDuration(d)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bk-field">
              <label htmlFor="sb-start">Hora de inicio</label>
              <select id="sb-start" className="ag-select" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                <option value="">Elegí…</option>
                {startTimes.map(t => {
                  const free = isCourtFree(busyFor(date), courtId, t, duration);
                  return <option key={t} value={t}>{t} a {fromMinutes(toMinutes(t) + duration)}{free ? '' : ' · ocupado'}</option>;
                })}
              </select>
            </div>

            {isFixed && (
              <div className="bk-field">
                <label>Repetir cada {longDate(date).split(' ')[0]}</label>
                <div className="ag-chips">
                  {WEEK_OPTIONS.map(w => (
                    <button key={w} type="button" className={`ag-chip ${weeks === w ? 'is-active' : ''}`} onClick={() => setWeeks(w)}>
                      {w} semanas
                    </button>
                  ))}
                </div>
                {conflicts.length > 0 && (
                  <span className="bk-hint" style={{ color: '#FBBF24' }}>
                    {conflicts.length} {conflicts.length === 1 ? 'fecha ocupada se va a saltear' : 'fechas ocupadas se van a saltear'}: {conflicts.map(d => d.slice(8, 10) + '/' + d.slice(5, 7)).join(', ')}
                  </span>
                )}
              </div>
            )}

            <div className="bk-field" style={{ position: 'relative' }}>
              <label htmlFor="sb-name">{isBlock ? 'Motivo' : 'Cliente'}</label>
              <input
                id="sb-name"
                value={name}
                autoComplete="off"
                onChange={(e) => { setName(e.target.value); setShowSuggestions(true); }}
                placeholder={isBlock ? 'Ej. Mantenimiento de césped' : 'Nombre o celular'}
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="ag-suggest">
                {suggestions.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setName(p.name); setPhone(formatPyPhone(p.phone)); setShowSuggestions(false); }}
                  >
                    <span>{p.name}</span><small>{formatPyPhone(p.phone)}</small>
                  </button>
                ))}
              </div>
            )}

            {!isBlock && (
              <div className="ag-row">
                <div className="bk-field">
                  <label htmlFor="sb-phone">Celular</label>
                  <input id="sb-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0981 123 456" />
                </div>
                <div className="bk-field">
                  <label htmlFor="sb-price">Precio (Gs.)</label>
                  <input
                    id="sb-price"
                    inputMode="numeric"
                    value={priceEdited ? price : suggestedPrice.toLocaleString('es-PY')}
                    onChange={(e) => { setPrice(e.target.value); setPriceEdited(true); }}
                  />
                </div>
              </div>
            )}

            {startTime && (
              <div className="bk-summary">
                <div className="bk-summary-row"><span>{court?.name}</span><strong>{startTime} a {endTime}</strong></div>
                <div className="bk-summary-row">
                  <span>{isFixed ? `${dates.length - conflicts.length} semanas` : longDate(date)}</span>
                  <strong>{isBlock ? 'Sin cargo' : `${formatGs(finalPrice)}${isFixed ? ' c/u' : ''}`}</strong>
                </div>
              </div>
            )}

            {error && <div className="bk-error" role="alert"><AlertCircle size={16} style={{ flexShrink: 0 }} />{error}</div>}

            <button type="submit" className="bk-primary">
              {isBlock ? 'Bloquear horario' : isFixed ? 'Crear turno fijo' : 'Guardar reserva'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
