import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRightLeft, Ban, Check, MessageCircle, Play, Receipt, UserX, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { buildStartTimes, formatDuration, fromMinutes, isCourtFree, toMinutes } from '../../utils/clubTime';
import { formatGs } from '../../utils/formatters';
import { formatPyPhone, whatsappLink } from '../../utils/phone';
import { categoryTag, confirmationMessage, longDate } from './ScheduleView';

const DURATIONS = [60, 90, 120];
const OCCUPYING = ['Pendiente', 'Confirmada', 'Jugando', 'Finalizada'];

const STATUS_LABEL = {
  Pendiente: 'Por confirmar',
  Confirmada: 'Confirmada',
  Jugando: 'Jugando',
  Finalizada: 'Cobrada',
  'No vino': 'No vino',
  Cancelada: 'Cancelada'
};

export function BookingActionsSheet({ booking, courtName, onClose, onOpenPosTab }) {
  const { courts, bookings, pricingConfig, updateBookingStatus, updateBooking } = useClub();
  const [confirming, setConfirming] = useState(null); // 'cancel' | 'noshow'
  const [moving, setMoving] = useState(false);
  const [move, setMove] = useState({
    courtId: booking.courtId,
    date: booking.date,
    startTime: booking.startTime,
    durationMinutes: booking.durationMinutes
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const isBlock = booking.category === 'Bloqueo';
  const tag = categoryTag(booking);
  const waUrl = whatsappLink(booking.clientPhone);
  const confirmUrl = whatsappLink(booking.clientPhone, confirmationMessage(booking, courtName));

  const setStatus = (status) => {
    updateBookingStatus(booking.id, status);
    onClose();
  };

  const goToCash = () => {
    onClose();
    onOpenPosTab?.(booking.linkedTabId);
  };

  const startTimes = useMemo(() => buildStartTimes({
    openHour: Number(pricingConfig.openHour),
    closeHour: Number(pricingConfig.closeHour),
    stepMinutes: Number(pricingConfig.slotStepMinutes) || 30,
    duration: move.durationMinutes
  }), [pricingConfig, move.durationMinutes]);

  const busy = bookings
    .filter(b => b.id !== booking.id && b.date === move.date && OCCUPYING.includes(b.status))
    .map(b => ({ courtId: b.courtId, startTime: b.startTime, endTime: b.endTime }));

  const saveMove = () => {
    setError('');
    if (!startTimes.includes(move.startTime)) return setError('Elegí una hora válida.');
    if (!isCourtFree(busy, move.courtId, move.startTime, move.durationMinutes)) {
      return setError('La cancha está ocupada en ese horario.');
    }
    const court = courts.find(c => c.id === move.courtId);
    const durationChanged = move.durationMinutes !== booking.durationMinutes;
    const courtChanged = move.courtId !== booking.courtId;
    const patch = { ...move };
    // Re-price only when the game length or court changes and the booking used the list price
    if (!isBlock && court && (durationChanged || courtChanged)) {
      patch.courtAmount = Math.round(court.rate * move.durationMinutes / 60);
    }
    updateBooking(booking.id, patch);
    onClose();
  };

  return (
    <div className="bk-sheet-backdrop" onClick={onClose}>
      <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="ba-title" onClick={(e) => e.stopPropagation()}>
        <div className="bk-sheet-handle" />
        <div className="bk-sheet-head">
          <div>
            <h3 id="ba-title" className="bk-sheet-title">{booking.clientName}</h3>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span className={`bk-status ${booking.status === 'Pendiente' ? 'is-pending' : ['Confirmada', 'Jugando'].includes(booking.status) ? 'is-confirmed' : booking.status === 'No vino' ? 'is-cancelled' : 'is-neutral'}`}>
                {isBlock ? 'Bloqueo' : STATUS_LABEL[booking.status] || booking.status}
              </span>
              {tag && !isBlock && <span className="bk-status is-neutral">{tag}</span>}
              {booking.code && booking.code !== '…' && <span className="bk-status is-neutral">{booking.code}</span>}
            </div>
          </div>
          <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="bk-summary">
          <div className="bk-summary-row"><span>Cancha</span><strong>{courtName}</strong></div>
          <div className="bk-summary-row"><span>Día</span><strong>{longDate(booking.date)}</strong></div>
          <div className="bk-summary-row"><span>Horario</span><strong>{booking.startTime} a {booking.endTime} · {formatDuration(booking.durationMinutes)}</strong></div>
          {!isBlock && booking.clientPhone && (
            <div className="bk-summary-row"><span>Celular</span><strong>{formatPyPhone(booking.clientPhone)}</strong></div>
          )}
          {!isBlock && <div className="bk-summary-row"><span>Cancha</span><strong>{formatGs(booking.courtAmount)}</strong></div>}
          {(booking.rentedRackets > 0 || booking.ballTubes > 0 || booking.barTableRequested) && (
            <div className="bk-summary-row">
              <span>Pidió</span>
              <strong>
                {[booking.rentedRackets > 0 && `${booking.rentedRackets} paleta(s)`,
                  booking.ballTubes > 0 && `${booking.ballTubes} tubo(s)`,
                  booking.barTableRequested && 'mesa en el bar'].filter(Boolean).join(' · ')}
              </strong>
            </div>
          )}
          {booking.notes && <div className="bk-summary-row"><span>Nota</span><strong>{booking.notes}</strong></div>}
        </div>

        {error && <div className="bk-error" role="alert"><AlertCircle size={16} style={{ flexShrink: 0 }} />{error}</div>}

        {moving ? (
          <div>
            <div className="ag-row" style={{ marginBottom: 12 }}>
              <div className="bk-field" style={{ marginBottom: 0 }}>
                <label htmlFor="ba-court">Cancha</label>
                <select id="ba-court" className="ag-select" value={move.courtId} onChange={(e) => setMove({ ...move, courtId: e.target.value })}>
                  {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="bk-field" style={{ marginBottom: 0 }}>
                <label htmlFor="ba-date">Día</label>
                <input id="ba-date" type="date" value={move.date} onChange={(e) => e.target.value && setMove({ ...move, date: e.target.value })} />
              </div>
            </div>
            <div className="bk-field">
              <label>Duración</label>
              <div className="bk-segment">
                {DURATIONS.map(d => (
                  <button key={d} type="button" className={d === move.durationMinutes ? 'is-active' : ''} onClick={() => setMove({ ...move, durationMinutes: d })}>
                    {formatDuration(d)}
                  </button>
                ))}
              </div>
            </div>
            <div className="bk-field">
              <label htmlFor="ba-start">Hora de inicio</label>
              <select id="ba-start" className="ag-select" value={move.startTime} onChange={(e) => setMove({ ...move, startTime: e.target.value })}>
                {startTimes.map(t => (
                  <option key={t} value={t}>
                    {t} a {fromMinutes(toMinutes(t) + move.durationMinutes)}
                    {isCourtFree(busy, move.courtId, t, move.durationMinutes) ? '' : ' · ocupado'}
                  </option>
                ))}
              </select>
            </div>
            <div className="bk-stack">
              <button type="button" className="bk-primary" onClick={saveMove}>Guardar cambio</button>
              <button type="button" className="bk-secondary" onClick={() => { setMoving(false); setError(''); }}>Volver</button>
            </div>
          </div>
        ) : confirming ? (
          <div className="bk-stack">
            <p className="bk-subtitle" style={{ textAlign: 'center' }}>
              {confirming === 'noshow'
                ? '¿Marcar que no vino? El turno se cierra sin cobrar y queda en su historial.'
                : isBlock ? '¿Quitar el bloqueo y liberar el horario?' : '¿Cancelar la reserva? El horario queda libre y la cuenta se cierra sin cobro.'}
            </p>
            <button
              type="button"
              className="bk-primary"
              style={{ background: '#F87171', color: '#1F0A0A' }}
              onClick={() => setStatus(confirming === 'noshow' ? 'No vino' : 'Cancelada')}
            >
              {confirming === 'noshow' ? 'Sí, no vino' : isBlock ? 'Sí, quitar bloqueo' : 'Sí, cancelar'}
            </button>
            <button type="button" className="bk-secondary" onClick={() => setConfirming(null)}>Volver</button>
          </div>
        ) : (
          <div className="ag-action-list">
            {booking.status === 'Pendiente' && (
              <>
                <button type="button" className="ag-btn is-success" onClick={() => setStatus('Confirmada')}>
                  <Check size={18} /> Confirmar reserva
                </button>
                {confirmUrl && (
                  <a className="ag-btn is-whatsapp" href={confirmUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} /> Enviar confirmación por WhatsApp
                  </a>
                )}
              </>
            )}

            {booking.status === 'Confirmada' && !isBlock && (
              <button type="button" className="ag-btn is-success" onClick={() => setStatus('Jugando')}>
                <Play size={18} /> Llegaron · empezar partido
              </button>
            )}

            {['Confirmada', 'Jugando', 'Finalizada'].includes(booking.status) && booking.linkedTabId && (
              <button type="button" className={`ag-btn ${booking.status === 'Jugando' ? 'is-primary' : ''}`} onClick={goToCash}>
                <Receipt size={18} /> {booking.status === 'Finalizada' ? 'Ver cuenta cobrada' : 'Ir a la cuenta y cobrar'}
              </button>
            )}

            {waUrl && booking.status !== 'Pendiente' && (
              <a className="ag-btn is-whatsapp" href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} /> Escribir por WhatsApp
              </a>
            )}

            {['Pendiente', 'Confirmada'].includes(booking.status) && (
              <button type="button" className="ag-btn" onClick={() => setMoving(true)}>
                <ArrowRightLeft size={18} /> Mover o cambiar duración
              </button>
            )}

            {['Pendiente', 'Confirmada', 'Jugando'].includes(booking.status) && (
              <>
                <div className="ag-divider" />
                {booking.status === 'Confirmada' && !isBlock && (
                  <button type="button" className="ag-btn is-danger" onClick={() => setConfirming('noshow')}>
                    <UserX size={18} /> No vino
                  </button>
                )}
                <button type="button" className="ag-btn is-danger" onClick={() => setConfirming('cancel')}>
                  <Ban size={18} /> {booking.status === 'Pendiente' ? 'Rechazar solicitud' : isBlock ? 'Quitar bloqueo' : 'Cancelar reserva'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
