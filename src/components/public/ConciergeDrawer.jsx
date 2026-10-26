import React, { useState, useEffect, useRef } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatFullDate, formatShortDate } from '../../utils/formatters';
import { 
  Check, 
  ShieldCheck, 
  UtensilsCrossed, 
  Share2, 
  Clock, 
  Calendar,
  Plus,
  Minus,
  ArrowLeft
} from 'lucide-react';

export function ConciergeDrawer({ slotData, onClose }) {
  const { createBooking } = useClub();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [rentedRackets, setRentedRackets] = useState(0);
  const [ballTubes, setBallTubes] = useState(0);
  const [barTableRequested, setBarTableRequested] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Swipe-to-dismiss gesture state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const currentDragY = useRef(0);

  // Lock background body scroll while drawer is open (prevents iOS rubber-banding and scroll chaining)
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      currentDragY.current = delta;
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentDragY.current > 75) {
      onClose();
    } else {
      setDragY(0);
      currentDragY.current = 0;
    }
  };

  if (!slotData) return null;

  const { court, timeSlot, date } = slotData;

  const RACKET_PRICE = 30000;
  const BALL_TUBE_PRICE = 70000;

  const baseRate = court.rate;
  const equipmentTotal = (rentedRackets * RACKET_PRICE) + (ballTubes * BALL_TUBE_PRICE);
  const totalAmount = baseRate + equipmentTotal;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg('Por favor ingrese el nombre del titular.');
      return;
    }
    if (!clientPhone.trim()) {
      setErrorMsg('Por favor ingrese un número de teléfono/WhatsApp.');
      return;
    }

    try {
      const newBooking = await createBooking({
        courtId: court.id,
        date,
        timeSlot,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        category: 'Reserva Estándar',
        courtAmount: baseRate,
        depositPaid: 0,
        status: 'Solicitud Pendiente',
        barTableRequested,
        rentedRackets,
        ballTubes
      });
      setConfirmedBooking(newBooking);

      // Redirección directa e inmediata a WhatsApp oficial
      const waMsg = `Hola Black Club Elite, acabo de solicitar la reserva de la cancha ${court.name} para el día ${date} en el turno ${timeSlot} a nombre de ${clientName.trim()} (Tel: ${clientPhone.trim()}). Aguardo confirmación del operador para el bloqueo oficial de mi turno.`;
      const waUrl = `https://wa.me/595983573396?text=${encodeURIComponent(waMsg)}`;
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      if (err.message && (err.message.includes('SLOT_ALREADY_BOOKED') || err.message.includes('23505') || err.code === '23505' || err.code === 'P0001')) {
        setErrorMsg('Este turno acaba de ser reservado por otro cliente. Por favor elegí otro horario.');
      } else if (err.message && err.message.includes('MAX_PENDING_REACHED')) {
        setErrorMsg('Has alcanzado el límite máximo de reservas pendientes de confirmación.');
      } else if (err.message && err.message.includes('SLOT_PAST')) {
        setErrorMsg('No es posible reservar un turno en un horario que ya ha transcurrido.');
      } else {
        setErrorMsg(err.message || 'Error al emitir la reserva. Por favor intente nuevamente.');
      }
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div 
        className="drawer-panel" 
        role="dialog"
        aria-modal="true"
        aria-label="Panel de Reserva de Cancha"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
      >
        {/* Mobile drag handle with touch swipe to dismiss */}
        <div 
          className="drawer-drag-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={onClose}
          title="Deslizar o tocar para cerrar"
        >
          <div className="drawer-drag-handle"></div>
        </div>

        {/* Header with swipe listener */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: '#0E0E10'
          }}
        >
          <div>
            <div className="tracking-luxury">RESERVA DE TURNO · PÁDEL</div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {court.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 12px', minHeight: '34px', fontSize: '11.5px', gap: '6px', borderRadius: '4px' }}
            aria-label="Volver a la grilla de turnos"
          >
            <ArrowLeft size={13} strokeWidth={2} />
            <span>Volver</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {!confirmedBooking ? (
            <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Slot Summary Card */}
              <div className="card-obsidian" style={{ padding: '14px', backgroundColor: '#131316' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} strokeWidth={1.5} color="#A1A1AA" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>{formatFullDate(date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} strokeWidth={1.5} color="#FFFFFF" />
                    <span className="font-tabular" style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 800 }}>
                      {timeSlot}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#71717A', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  {court.specs}
                </div>
              </div>

              {/* Client Info Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Nombre del Titular *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Martín Rodríguez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="input-luxury"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+595 981 123 456"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="input-luxury"
                  />
                </div>
              </div>

              {/* Equipment Steppers */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <div className="tracking-luxury" style={{ marginBottom: '10px' }}>EQUIPAMIENTO OPCIONAL</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Rackets */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#111113', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>Paletas Bullpadel (Alquiler)</div>
                      <div className="font-tabular" style={{ fontSize: '11px', color: '#A1A1AA' }}>{formatGs(RACKET_PRICE)} por unidad</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        type="button" 
                        onClick={() => setRentedRackets(Math.max(0, rentedRackets - 1))}
                        className="stepper-btn"
                        disabled={rentedRackets === 0}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-tabular" style={{ minWidth: '22px', textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>
                        {rentedRackets}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setRentedRackets(Math.min(4, rentedRackets + 1))}
                        className="stepper-btn"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Ball Tubes */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#111113', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>Tubo Bullpadel Next Pro</div>
                      <div className="font-tabular" style={{ fontSize: '11px', color: '#A1A1AA' }}>{formatGs(BALL_TUBE_PRICE)} (Sellado)</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        type="button" 
                        onClick={() => setBallTubes(Math.max(0, ballTubes - 1))}
                        className="stepper-btn"
                        disabled={ballTubes === 0}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-tabular" style={{ minWidth: '22px', textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>
                        {ballTubes}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setBallTubes(Math.min(6, ballTubes + 1))}
                        className="stepper-btn"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bar Table Checkbox */}
              <div 
                onClick={() => setBarTableRequested(!barTableRequested)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px 14px', 
                  backgroundColor: barTableRequested ? 'rgba(255, 255, 255, 0.05)' : '#111113', 
                  borderRadius: '6px', 
                  border: barTableRequested ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <UtensilsCrossed size={16} strokeWidth={1.5} color={barTableRequested ? '#FFFFFF' : '#71717A'} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: barTableRequested ? '#FFFFFF' : '#E4E4E7' }}>
                        Mesa en BlackBar
                      </span>
                      <span style={{ 
                        fontSize: '9.5px', 
                        fontWeight: 700, 
                        color: '#10B981', 
                        backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                        border: '1px solid rgba(16, 185, 129, 0.25)', 
                        padding: '1px 6px', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        Sin costo adicional
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>
                      Tercer tiempo · Reserva de mesa gastronómica
                    </div>
                  </div>
                </div>
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '4px', 
                  border: barTableRequested ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: barTableRequested ? '#FFFFFF' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {barTableRequested && <Check size={12} strokeWidth={3} color="#09090B" />}
                </div>
              </div>

              {/* Direct WhatsApp Confirmation Callout (No Advance Deposit) */}
              <div style={{ 
                padding: '14px', 
                backgroundColor: '#111113', 
                border: '1px solid rgba(16, 185, 129, 0.25)', 
                borderRadius: '8px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="status-dot emerald"></span>
                  <span className="tracking-luxury" style={{ fontSize: '9px', color: '#34D399' }}>CONFIRMACIÓN DIRECTA VÍA WHATSAPP</span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  Sin seña bancaria previa
                </div>

                <div style={{ fontSize: '11.5px', color: '#A1A1AA', lineHeight: 1.45 }}>
                  Al presionar el botón serás redirigido a nuestro WhatsApp oficial (<strong>+595 983 573 396</strong>) y tu solicitud ingresará instantáneamente en la agenda del CRM para que el operador bloquee tu cancha.
                </div>
              </div>

              {errorMsg && (
                <div style={{ fontSize: '12px', color: '#FB7185', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              {/* Action Bar */}
              <div style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
                paddingTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#71717A' }}>Total Cancha & Extras</div>
                    <div className="font-tabular" style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
                      {formatGs(totalAmount)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10.5px', color: '#10B981' }}>Pago en Recepción</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#E4E4E7' }}>
                      Al llegar al club
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', minHeight: '46px', fontSize: '13.5px' }}
                  >
                    <ShieldCheck size={16} strokeWidth={2} />
                    <span>Solicitar Reserva & Confirmar por WhatsApp</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Digital Confirmation Voucher */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center', padding: '10px 0' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                border: '1.5px solid #10B981', 
                color: '#34D399', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto' 
              }}>
                <Check size={24} strokeWidth={2.5} />
              </div>

              <div>
                <span className="status-pill emerald" style={{ marginBottom: '6px' }}>
                  RESERVA CONFIRMADA
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                  Turno Bloqueado en Grilla
                </h3>
                <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '2px' }}>
                  Sincronizado inmediatamente con la recepción del club.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="card-obsidian" style={{ padding: '14px', backgroundColor: '#131316', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#71717A' }}>Código de Reserva</span>
                  <span className="font-tabular" style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                    {confirmedBooking.id.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11.5px', color: '#A1A1AA' }}>Titular:</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{confirmedBooking.clientName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11.5px', color: '#A1A1AA' }}>Cancha:</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{court.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11.5px', color: '#A1A1AA' }}>Fecha & Horario:</span>
                  <span className="font-tabular" style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                    {formatShortDate(date)} · {timeSlot}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                  <span style={{ fontSize: '11.5px', color: '#A1A1AA' }}>Estado Solicitud:</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8' }}>
                    Pendiente en Recepción
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={`https://wa.me/595983573396?text=${encodeURIComponent(`Hola Black Club Elite, acabo de solicitar la reserva de la cancha ${court.name} para el ${date} en el turno ${timeSlot} a nombre de ${confirmedBooking.clientName}. Aguardo confirmación.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', minHeight: '44px', gap: '8px' }}
                >
                  <Share2 size={14} />
                  <span>Abrir WhatsApp (+595 983 573 396)</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  style={{ minHeight: '42px', gap: '8px' }}
                >
                  <ArrowLeft size={14} />
                  <span>Volver a la Grilla de Turnos</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
