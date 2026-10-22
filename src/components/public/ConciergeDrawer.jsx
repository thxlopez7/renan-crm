import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatFullDate } from '../../utils/formatters';
import { 
  X, 
  Check, 
  ShieldCheck, 
  UtensilsCrossed, 
  CreditCard, 
  Share2, 
  Clock, 
  Calendar,
  Copy,
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
  const [copiedBankData, setCopiedBankData] = useState(false);

  if (!slotData) return null;

  const { court, timeSlot, date } = slotData;

  const RACKET_PRICE = 30000;
  const BALL_TUBE_PRICE = 70000;

  const baseRate = court.rate;
  const equipmentTotal = (rentedRackets * RACKET_PRICE) + (ballTubes * BALL_TUBE_PRICE);
  const totalAmount = baseRate + equipmentTotal;
  const requiredDeposit = Math.round(baseRate * 0.5);

  const handleCopyBank = () => {
    const text = `BLACK CLUB ELITE · DATOS BANCARIOS (ITAÚ PARAGUAY)\nBanco: Banco Itaú Paraguay S.A.\nCuenta Corriente: 720049182\nTitular: Black Club Elite S.A.\nRUC: 80112948-2\nConcepto: Seña Cancha ${court.name} ${date} ${timeSlot}`;
    navigator.clipboard?.writeText(text);
    setCopiedBankData(true);
    setTimeout(() => setCopiedBankData(false), 2000);
  };

  const handleConfirm = (e) => {
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
      const newBooking = createBooking({
        courtId: court.id,
        date,
        timeSlot,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        category: 'Reserva Estándar',
        courtAmount: baseRate,
        depositPaid: requiredDeposit,
        barTableRequested,
        rentedRackets,
        ballTubes
      });
      setConfirmedBooking(newBooking);
    } catch {
      setErrorMsg('Error al emitir la reserva. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Mobile drag handle */}
        <div className="drawer-drag-handle"></div>

        {/* Header */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#0E0E10'
        }}>
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
                  padding: '12px', 
                  backgroundColor: barTableRequested ? 'rgba(255, 255, 255, 0.05)' : '#111113', 
                  borderRadius: '6px', 
                  border: barTableRequested ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UtensilsCrossed size={15} strokeWidth={1.5} color={barTableRequested ? '#FFFFFF' : '#71717A'} />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: barTableRequested ? '#FFFFFF' : '#A1A1AA' }}>
                      Mesa Post-Partido en BlackBar (Tercer Tiempo)
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#71717A' }}>
                      Reserva de lounge gastronómico para el equipo
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
                  justifyContent: 'center'
                }}>
                  {barTableRequested && <Check size={12} strokeWidth={3} color="#09090B" />}
                </div>
              </div>

              {/* Bank Transfer Instructions */}
              <div style={{ 
                padding: '12px 14px', 
                backgroundColor: '#111113', 
                border: '1px solid rgba(255, 255, 255, 0.06)', 
                borderRadius: '6px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={13} strokeWidth={1.5} color="#FFFFFF" />
                    <span className="tracking-luxury" style={{ fontSize: '9px' }}>SEÑA BANCARIA (50%)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyBank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'transparent',
                      border: 'none',
                      color: copiedBankData ? '#34D399' : '#FFFFFF',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    <Copy size={11} />
                    <span>{copiedBankData ? 'Copiado!' : 'Copiar Cuenta'}</span>
                  </button>
                </div>

                <div className="font-tabular" style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
                  {formatGs(requiredDeposit)} <span style={{ fontSize: '11px', fontWeight: 400, color: '#A1A1AA' }}>para confirmar</span>
                </div>

                <div style={{ fontSize: '11px', color: '#71717A', lineHeight: 1.4 }}>
                  Banco Itaú Paraguay · Cta Cte: <strong>720049182</strong> · Black Club Elite S.A.
                </div>
              </div>

              {errorMsg && (
                <div style={{ fontSize: '12px', color: '#FB7185', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              {/* Sticky Confirmation Action Bar */}
              <div style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
                paddingTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#71717A' }}>Total Reserva</div>
                    <div className="font-tabular" style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
                      {formatGs(totalAmount)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10.5px', color: '#A1A1AA' }}>Seña Requerida (50%)</div>
                    <div className="font-tabular" style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                      {formatGs(requiredDeposit)}
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
                    <span>Confirmar & Emitir Reserva</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost"
                    style={{ width: '100%', minHeight: '38px', fontSize: '12px', color: '#A1A1AA', gap: '6px' }}
                  >
                    <ArrowLeft size={13} />
                    <span>Volver a la Grilla de Turnos</span>
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
                  <span style={{ fontSize: '11.5px', color: '#A1A1AA' }}>Seña Registrada:</span>
                  <span className="font-tabular" style={{ fontSize: '13px', fontWeight: 800, color: '#34D399' }}>
                    {formatGs(confirmedBooking.depositPaid)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={`https://wa.me/595981000000?text=${encodeURIComponent(`Hola Black Club Elite, acabo de registrar la reserva ${confirmedBooking.id} a nombre de ${confirmedBooking.clientName} para ${court.name} el ${date} en el turno ${timeSlot}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', minHeight: '42px', gap: '8px' }}
                >
                  <Share2 size={13} />
                  <span>Enviar Comprobante por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary"
                  style={{ minHeight: '44px', gap: '8px' }}
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
