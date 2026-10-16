import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatFullDate, formatShortDate } from '../../utils/formatters';
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  User, 
  Phone, 
  UtensilsCrossed, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export function MasterScheduleView({ onOpenPosTab }) {
  const { 
    courts, 
    timeSlots, 
    bookings, 
    selectedDate, 
    setSelectedDate, 
    createBooking, 
    updateBookingStatus 
  } = useClub();

  const [inspectBooking, setInspectBooking] = useState(null);
  const [createSlotData, setCreateSlotData] = useState(null);

  // Form states for manual booking
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isFixedPass, setIsFixedPass] = useState(false);
  const [newDepositPaid, setNewDepositPaid] = useState('');
  const [newTableRequested, setNewTableRequested] = useState(false);

  // Status edit for inspect
  const [editingDeposit, setEditingDeposit] = useState('');

  // Date options (7 days)
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return {
      dateStr,
      dayName: i === 0 ? 'Hoy' : days[d.getDay()],
      dayNumber: d.getDate(),
      formatted: formatShortDate(dateStr)
    };
  });

  const handleOpenInspect = (booking) => {
    setInspectBooking(booking);
    setEditingDeposit(booking.depositPaid.toString());
  };

  const handleSaveStatus = (newStatus) => {
    if (!inspectBooking) return;
    const depositVal = Number(editingDeposit) || inspectBooking.depositPaid;
    updateBookingStatus(inspectBooking.id, newStatus, depositVal);
    setInspectBooking(prev => ({
      ...prev,
      status: newStatus,
      depositPaid: depositVal
    }));
  };

  const handleCreateManual = (e) => {
    e.preventDefault();
    if (!newClientName.trim() || !createSlotData) return;

    const court = createSlotData.court;
    const deposit = Number(newDepositPaid) || Math.round(court.rate * 0.5);

    createBooking({
      courtId: court.id,
      date: selectedDate,
      timeSlot: createSlotData.slot,
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim() || '+595 981 000 000',
      category: isFixedPass ? 'Abono Fijo Semanal' : 'Reserva Estándar',
      courtAmount: court.rate,
      depositPaid: deposit,
      barTableRequested: newTableRequested,
      rentedRackets: 0,
      ballTubes: 0
    });

    setCreateSlotData(null);
    setNewClientName('');
    setNewClientPhone('');
    setIsFixedPass(false);
    setNewDepositPaid('');
    setNewTableRequested(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div className="tracking-luxury" style={{ color: '#C5A880' }}>
            AGENDA MAESTRA DE PISTAS & ABONOS FIJOS
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', marginTop: '2px' }}>
            Programación General · {formatFullDate(selectedDate)}
          </h2>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {dateOptions.map(option => {
            const isSelected = option.dateStr === selectedDate;
            return (
              <button
                key={option.dateStr}
                onClick={() => setSelectedDate(option.dateStr)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: isSelected ? '#FFFFFF' : '#121216',
                  color: isSelected ? '#070709' : '#A1A1AA',
                  border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {option.dayName} {option.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Matrix Table */}
      <div className="card-obsidian" style={{ backgroundColor: '#0E0E12', overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <table className="table-executive" style={{ minWidth: '920px' }}>
          <thead>
            <tr>
              <th style={{ width: '130px', padding: '14px 16px' }}>Bloque Horario</th>
              {courts.map(court => (
                <th key={court.id} style={{ width: '280px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#F4F4F6', fontWeight: 700 }}>{court.name}</span>
                    <span className="font-tabular" style={{ color: '#C5A880', fontSize: '11px' }}>{formatGs(court.rate)}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#71717A', fontWeight: 400, marginTop: '2px' }}>
                    {court.specs.split('·')[0]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot}>
                <td style={{ verticalAlign: 'top', padding: '14px 16px', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="font-tabular" style={{ fontSize: '12px', fontWeight: 600, color: '#A1A1AA' }}>
                    {slot}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#52525B', marginTop: '2px' }}>90 minutos</div>
                </td>

                {courts.map(court => {
                  const booking = bookings.find(
                    b => b.courtId === court.id && b.date === selectedDate && b.timeSlot === slot && b.status !== 'Cancelada'
                  );

                  if (booking) {
                    const isFixedPass = booking.category === 'Abono Fijo Semanal';
                    const isBlackTeam = booking.category === 'Clase BlackTeam';
                    const isPending = booking.status === 'Seña Pendiente';
                    const isInPlay = booking.status === 'En Pista';
                    const isConfirmed = booking.status === 'Confirmada';
                    const isFinished = booking.status === 'Finalizada';

                    return (
                      <td 
                        key={court.id}
                        onClick={() => handleOpenInspect(booking)}
                        style={{ 
                          padding: '10px 12px', 
                          borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                          cursor: 'pointer',
                          backgroundColor: isFixedPass ? 'rgba(197, 168, 128, 0.04)' : isInPlay ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                        }}
                      >
                        <div style={{ 
                          padding: '10px 12px', 
                          backgroundColor: '#14141A', 
                          border: isFixedPass ? '1px solid rgba(197, 168, 128, 0.4)' : isInPlay ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          {/* Status and badges */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <span className={`status-pill ${
                              isInPlay ? 'emerald' : isConfirmed ? 'blue' : isPending ? 'terracotta' : 'amber'
                            }`} style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                              {booking.status}
                            </span>

                            {isFixedPass && (
                              <span style={{ fontSize: '9.5px', fontWeight: 600, color: '#C5A880', letterSpacing: '0.04em' }}>
                                ABONO FIJO
                              </span>
                            )}
                          </div>

                          {/* Client Name */}
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {booking.clientName}
                          </div>

                          {/* Financials & Table tag */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#A1A1AA' }}>
                            <span className="font-tabular">
                              Seña: {formatGs(booking.depositPaid)}
                            </span>

                            {booking.barTableRequested && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#C5A880' }} title="Mesa de Tercer Tiempo reservada">
                                <UtensilsCrossed size={11} strokeWidth={1.5} />
                                <span style={{ fontSize: '9.5px' }}>Mesa Bar</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  }

                  // Empty slot
                  return (
                    <td 
                      key={court.id} 
                      onClick={() => setCreateSlotData({ court, slot })}
                      style={{ 
                        padding: '10px 12px', 
                        borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer' 
                      }}
                    >
                      <div 
                        style={{ 
                          height: '66px', 
                          border: '1px dashed rgba(255, 255, 255, 0.08)', 
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: '#52525B',
                          fontSize: '11px',
                          transition: 'all 150ms ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                          e.currentTarget.style.color = '#A1A1AA';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.color = '#52525B';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Plus size={12} strokeWidth={1.5} />
                        <span>Disponible</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inspect & Manage Booking Drawer */}
      {inspectBooking && (
        <div className="drawer-backdrop" onClick={() => setInspectBooking(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: '#0D0D11'
            }}>
              <div>
                <div className="tracking-luxury">ADMINISTRACIÓN DE RESERVA</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6' }}>
                  {inspectBooking.code} · {inspectBooking.clientName}
                </h3>
              </div>
              <button onClick={() => setInspectBooking(null)} className="btn-ghost" style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Summary Card */}
              <div className="card-obsidian" style={{ padding: '16px', backgroundColor: '#131318' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#71717A' }}>Categoría</span>
                  <span style={{ fontWeight: 600, color: inspectBooking.category === 'Abono Fijo Semanal' ? '#C5A880' : '#F4F4F6' }}>
                    {inspectBooking.category}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#71717A' }}>Horario & Fecha</span>
                  <span className="font-tabular">{inspectBooking.timeSlot} · {formatShortDate(inspectBooking.date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#71717A' }}>Teléfono</span>
                  <span className="font-tabular">{inspectBooking.clientPhone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#71717A' }}>Mesa Bar</span>
                  <span style={{ color: inspectBooking.barTableRequested ? '#C5A880' : '#71717A' }}>
                    {inspectBooking.barTableRequested ? 'Mesa Reservada' : 'No solicitada'}
                  </span>
                </div>
              </div>

              {/* Status Update Controls */}
              <div>
                <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                  ACTUALIZAR ESTADO OPERATIVO
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    onClick={() => handleSaveStatus('Seña Pendiente')}
                    className={`btn-secondary ${inspectBooking.status === 'Seña Pendiente' ? 'active' : ''}`}
                    style={{ borderColor: inspectBooking.status === 'Seña Pendiente' ? '#F43F5E' : 'rgba(255,255,255,0.08)' }}
                  >
                    Seña Pendiente
                  </button>

                  <button
                    onClick={() => handleSaveStatus('Confirmada')}
                    className={`btn-secondary ${inspectBooking.status === 'Confirmada' ? 'active' : ''}`}
                    style={{ borderColor: inspectBooking.status === 'Confirmada' ? '#38BDF8' : 'rgba(255,255,255,0.08)' }}
                  >
                    Confirmada
                  </button>

                  <button
                    onClick={() => handleSaveStatus('En Pista')}
                    className={`btn-secondary ${inspectBooking.status === 'En Pista' ? 'active' : ''}`}
                    style={{ borderColor: inspectBooking.status === 'En Pista' ? '#10B981' : 'rgba(255,255,255,0.08)', color: '#34D399' }}
                  >
                    En Pista
                  </button>

                  <button
                    onClick={() => handleSaveStatus('Finalizada')}
                    className={`btn-secondary ${inspectBooking.status === 'Finalizada' ? 'active' : ''}`}
                    style={{ borderColor: inspectBooking.status === 'Finalizada' ? '#A1A1AA' : 'rgba(255,255,255,0.08)' }}
                  >
                    Finalizada
                  </button>
                </div>
              </div>

              {/* Deposit Adjustment */}
              <div>
                <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                  SEÑA ABONADA (GUARANÍES)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    value={editingDeposit}
                    onChange={(e) => setEditingDeposit(e.target.value)}
                    className="input-luxury font-tabular"
                    placeholder="Monto de seña en Gs."
                  />
                  <button
                    onClick={() => handleSaveStatus(inspectBooking.status)}
                    className="btn-primary"
                    style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
                  >
                    Guardar
                  </button>
                </div>
              </div>

              {/* Link to POS Terminal */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <button
                  onClick={() => {
                    const tabId = inspectBooking.linkedTabId;
                    setInspectBooking(null);
                    if (onOpenPosTab) onOpenPosTab(tabId);
                  }}
                  className="btn-bronze"
                  style={{ width: '100%', padding: '14px' }}
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                  <span>ABRIR CUENTA EN TERMINAL POS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Booking Creation Drawer */}
      {createSlotData && (
        <div className="drawer-backdrop" onClick={() => setCreateSlotData(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: '#0D0D11'
            }}>
              <div>
                <div className="tracking-luxury">RECEPCIÓN · REGISTRO MANUAL</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6' }}>
                  {createSlotData.court.name} · {createSlotData.slot}
                </h3>
              </div>
              <button onClick={() => setCreateSlotData(null)} className="btn-ghost" style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <form onSubmit={handleCreateManual} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                    NOMBRE DEL CLIENTE / SOCIO
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellido"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="input-luxury"
                  />
                </div>

                <div>
                  <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                    TELÉFONO DE CONTACTO
                  </label>
                  <input
                    type="tel"
                    placeholder="+595 981 ..."
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="input-luxury"
                  />
                </div>

                {/* Abono Fijo Semanal Toggle */}
                <div 
                  onClick={() => setIsFixedPass(!isFixedPass)}
                  style={{
                    padding: '14px',
                    backgroundColor: isFixedPass ? 'rgba(197, 168, 128, 0.08)' : '#121216',
                    border: isFixedPass ? '1px solid #C5A880' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '3px',
                    border: isFixedPass ? '1px solid #C5A880' : '1px solid #52525B',
                    backgroundColor: isFixedPass ? '#C5A880' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isFixedPass && <Check size={12} strokeWidth={2.5} color="#070709" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isFixedPass ? '#C5A880' : '#F4F4F6' }}>
                      Asignar como Abono Fijo Semanal
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#A1A1AA' }}>
                      Identifica al socio como titular recurrente en la grilla y reporte CRM.
                    </div>
                  </div>
                </div>

                {/* Deposit */}
                <div>
                  <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                    SEÑA INICIAL COBRADA (GS.)
                  </label>
                  <input
                    type="number"
                    placeholder={`Sugerida: ${createSlotData.court.rate * 0.5}`}
                    value={newDepositPaid}
                    onChange={(e) => setNewDepositPaid(e.target.value)}
                    className="input-luxury font-tabular"
                  />
                </div>

                {/* Bar table */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={newTableRequested}
                    onChange={(e) => setNewTableRequested(e.target.checked)}
                    style={{ accentColor: '#C5A880' }}
                  />
                  <span>Reservar mesa en BlackBar para tercer tiempo</span>
                </label>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                  <span>REGISTRAR TURNO EN AGENDA</span>
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
