import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatFullDate } from '../../utils/formatters';
import { 
  X, 
  Check, 
  Users, 
  Shield, 
  UtensilsCrossed, 
  CreditCard, 
  Share2, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Info,
  Calendar
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

  if (!slotData) return null;

  const { court, timeSlot, date } = slotData;

  const RACKET_PRICE = 30000;
  const BALL_TUBE_PRICE = 70000;

  const baseRate = court.rate;
  const equipmentTotal = (rentedRackets * RACKET_PRICE) + (ballTubes * BALL_TUBE_PRICE);
  const totalAmount = baseRate + equipmentTotal;
  const perPlayerSplit = Math.round(totalAmount / 4);
  const requiredDeposit = Math.round(baseRate * 0.5);

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg('Por favor ingrese el nombre y apellido del titular.');
      return;
    }
    if (!clientPhone.trim()) {
      setErrorMsg('Por favor ingrese un número de teléfono de contacto.');
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
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#0D0D11'
        }}>
          <div>
            <div className="tracking-luxury">CONCIERGE DE RESERVAS · PÁDEL</div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6', marginTop: '2px' }}>
              {court.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="btn-ghost"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {!confirmedBooking ? (
            <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Slot Summary Card */}
              <div className="card-obsidian" style={{ padding: '16px', backgroundColor: '#131318' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} strokeWidth={1.5} color="#C5A880" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{formatFullDate(date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} strokeWidth={1.5} color="#38BDF8" />
                    <span className="font-tabular" style={{ fontSize: '12.5px', color: '#38BDF8', fontWeight: 600 }}>
                      {timeSlot} (90 min)
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#A1A1AA', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  {court.specs}
                </div>
              </div>

              {/* 4-Player Split Breakdown */}
              <div style={{ 
                backgroundColor: 'rgba(197, 168, 128, 0.05)', 
                border: '1px solid rgba(197, 168, 128, 0.2)', 
                borderRadius: '6px', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} strokeWidth={1.5} color="#C5A880" />
                    <div>
                      <div className="tracking-luxury" style={{ color: '#C5A880' }}>DIVISIÓN ESTIMADA (4 JUGADORES)</div>
                      <div style={{ fontSize: '12px', color: '#A1A1AA' }}>Tarifa individual proporcional</div>
                    </div>
                  </div>
                  <div className="font-tabular" style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6' }}>
                    {formatGs(perPlayerSplit)} <span style={{ fontSize: '11px', fontWeight: 400, color: '#A1A1AA' }}>/ jug.</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                  DATOS DEL TITULAR DE RESERVA
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellido completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="input-luxury"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Teléfono móvil (+595 981 ...)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="input-luxury"
                  />
                </div>
              </div>

              {/* Equipment Add-ons */}
              <div>
                <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                  EQUIPAMIENTO & PRO-SHOP OPCIONAL
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Paletas Bullpadel */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: '#121216',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>Alquiler Paleta Bullpadel Pro</div>
                      <div className="font-tabular" style={{ fontSize: '12px', color: '#A1A1AA' }}>
                        +{formatGs(RACKET_PRICE)} por unidad
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setRentedRackets(Math.max(0, rentedRackets - 1))}
                        className="btn-secondary"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        -
                      </button>
                      <span className="font-tabular" style={{ minWidth: '20px', textAlign: 'center', fontSize: '13px' }}>
                        {rentedRackets}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRentedRackets(Math.min(4, rentedRackets + 1))}
                        className="btn-secondary"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Tubo de Pelotas */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: '#121216',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>Tubo Pelotas Bullpadel Next Pro x3</div>
                      <div className="font-tabular" style={{ fontSize: '12px', color: '#A1A1AA' }}>
                        +{formatGs(BALL_TUBE_PRICE)} nuevo cerrado
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setBallTubes(Math.max(0, ballTubes - 1))}
                        className="btn-secondary"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        -
                      </button>
                      <span className="font-tabular" style={{ minWidth: '20px', textAlign: 'center', fontSize: '13px' }}>
                        {ballTubes}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBallTubes(Math.min(4, ballTubes + 1))}
                        className="btn-secondary"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bar & Post-Match Table Request */}
              <div style={{
                padding: '14px',
                backgroundColor: barTableRequested ? 'rgba(197, 168, 128, 0.08)' : '#121216',
                border: barTableRequested ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onClick={() => setBarTableRequested(!barTableRequested)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '3px', 
                    border: barTableRequested ? '1px solid #C5A880' : '1px solid #52525B',
                    backgroundColor: barTableRequested ? '#C5A880' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    flexShrink: 0
                  }}>
                    {barTableRequested && <Check size={12} strokeWidth={2.5} color="#070709" />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UtensilsCrossed size={13} strokeWidth={1.5} color="#C5A880" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F6' }}>
                        Mesa de Tercer Tiempo en BlackBar
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '4px', lineHeight: 1.4 }}>
                      Reservar automáticamente una mesa en el salón gastronómico al finalizar el partido. (Horario del Bar: 17:00 a 00:00).
                    </p>
                  </div>
                </div>
              </div>

              {/* Error notice */}
              {errorMsg && (
                <div style={{ 
                  padding: '10px 14px', 
                  backgroundColor: 'rgba(244, 63, 94, 0.1)', 
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '4px',
                  color: '#FDA4AF',
                  fontSize: '12px'
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Total & Deposit Breakdown */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#A1A1AA' }}>
                  <span>Alquiler Pista (90 min)</span>
                  <span className="font-tabular">{formatGs(baseRate)}</span>
                </div>
                {equipmentTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#A1A1AA' }}>
                    <span>Equipamiento / Pro-Shop</span>
                    <span className="font-tabular">{formatGs(equipmentTotal)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#F4F4F6' }}>
                  <span>Importe Total</span>
                  <span className="font-tabular">{formatGs(totalAmount)}</span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '10px 12px', 
                  backgroundColor: 'rgba(56, 189, 248, 0.08)', 
                  border: '1px solid rgba(56, 189, 248, 0.25)', 
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#7DD3FC', fontWeight: 500 }}>Seña para Confirmación (50%)</span>
                  <span className="font-tabular" style={{ color: '#7DD3FC', fontWeight: 700 }}>
                    {formatGs(requiredDeposit)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                <span>CONFIRMAR Y EMITIR RESERVA</span>
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </form>
          ) : (
            /* Confirmation & Bank Details View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid #10B981',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Check size={24} strokeWidth={2} color="#10B981" />
                </div>
                <div className="tracking-luxury" style={{ color: '#10B981' }}>SOLICITUD REGISTRADA EXITOSAMENTE</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#F4F4F6', marginTop: '4px' }}>
                  Código: {confirmedBooking.code}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#A1A1AA', marginTop: '4px' }}>
                  La cuenta de pista ya ha sido abierta en el sistema administrativo del club.
                </p>
              </div>

              {/* Reservation summary card */}
              <div className="card-obsidian" style={{ padding: '16px', backgroundColor: '#131318' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#71717A' }}>Titular</span>
                  <span style={{ fontWeight: 600 }}>{confirmedBooking.clientName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#71717A' }}>Pista & Horario</span>
                  <span>{court.name} · {confirmedBooking.timeSlot}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#71717A' }}>Fecha</span>
                  <span>{formatFullDate(confirmedBooking.date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#71717A' }}>Mesa BlackBar</span>
                  <span style={{ color: confirmedBooking.barTableRequested ? '#C5A880' : '#71717A' }}>
                    {confirmedBooking.barTableRequested ? 'Mesa Reservada' : 'No solicitada'}
                  </span>
                </div>
              </div>

              {/* Bank Transfer Instructions for Seña */}
              <div style={{ 
                backgroundColor: '#121216', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '6px', 
                padding: '18px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <CreditCard size={15} strokeWidth={1.5} color="#C5A880" />
                  <span className="tracking-luxury" style={{ color: '#C5A880' }}>
                    DATOS DE TRANSFERENCIA PARA SEÑA ({formatGs(confirmedBooking.depositPaid)})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717A' }}>Entidad Bancaria:</span>
                    <span style={{ fontWeight: 600 }}>Banco Itaú Paraguay S.A.</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717A' }}>Titular de Cuenta:</span>
                    <span>Black Club S.A.</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717A' }}>RUC Institucional:</span>
                    <span className="font-tabular">80092144-2</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717A' }}>Cta. Corriente Guaraníes:</span>
                    <span className="font-tabular">720044910</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717A' }}>Alias SIPAP / QR:</span>
                    <span className="font-tabular" style={{ color: '#38BDF8' }}>blackclub.elite.py</span>
                  </div>
                </div>
              </div>

              {/* Informative Notice */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                padding: '12px', 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                borderRadius: '4px',
                fontSize: '11.5px',
                color: '#A1A1AA'
              }}>
                <Info size={16} strokeWidth={1.5} color="#A1A1AA" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  La seña garantiza el bloqueo definitivo de la pista. Puede remitir el comprobante directamente al Concierge de recepción.
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={`https://wa.me/595981000000?text=${encodeURIComponent(`Hola Black Club Elite. Adjunto comprobante de seña para mi reserva ${confirmedBooking.code} de ${court.name} a nombre de ${confirmedBooking.clientName}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bronze"
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  <Share2 size={14} strokeWidth={1.5} />
                  <span>NOTIFICAR A RECEPCIÓN</span>
                </a>

                <button onClick={onClose} className="btn-secondary" style={{ width: '100%' }}>
                  <span>VOLVER A LA GRILLA</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
