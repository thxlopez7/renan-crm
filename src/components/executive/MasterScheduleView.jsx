import React, { useState, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatFullDate, formatShortDate } from '../../utils/formatters';
import { 
  Check, 
  X, 
  UtensilsCrossed, 
  Plus, 
  ExternalLink,
  Phone
} from 'lucide-react';

export function MasterScheduleView({ onOpenPosTab }) {
  const { 
    courts, 
    timeSlots, 
    bookings, 
    tabs,
    selectedDate, 
    setSelectedDate, 
    createBooking, 
    updateBookingStatus 
  } = useClub();

  const [inspectBooking, setInspectBooking] = useState(null);
  const [createSlotData, setCreateSlotData] = useState(null);
  const [mobileViewCourtId, setMobileViewCourtId] = useState(() => courts[0]?.id || 'court-1');
  const [scheduleViewMode, setScheduleViewMode] = useState('cards'); // 'cards' (mobile-first) | 'table'

  // Form states for manual booking
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isFixedPass, setIsFixedPass] = useState(false);
  const [newDepositPaid, setNewDepositPaid] = useState('');
  const [newTableRequested, setNewTableRequested] = useState(false);

  // Status edit for inspect
  const [editingDeposit, setEditingDeposit] = useState('');

  // 7 days options with stable generation
  const dateOptions = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
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
  }, []);

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

  const activeMobileCourt = courts.find(c => c.id === mobileViewCourtId) || courts[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
            Agenda de Canchas
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '2px' }}>
            {formatFullDate(selectedDate)}
          </h2>
        </div>

        {/* View Mode Switcher (Cards vs Table) */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#111113', 
          padding: '3px', 
          borderRadius: '6px', 
          border: '1px solid rgba(255, 255, 255, 0.08)' 
        }}>
          <button
            onClick={() => setScheduleViewMode('cards')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: scheduleViewMode === 'cards' ? '#FFFFFF' : 'transparent',
              color: scheduleViewMode === 'cards' ? '#09090B' : '#A1A1AA',
              transition: 'all 120ms ease'
            }}
          >
            Vista Canchas
          </button>
          <button
            onClick={() => setScheduleViewMode('table')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: scheduleViewMode === 'table' ? '#FFFFFF' : 'transparent',
              color: scheduleViewMode === 'table' ? '#09090B' : '#A1A1AA',
              transition: 'all 120ms ease'
            }}
          >
            Grilla Completa
          </button>
        </div>
      </div>

      {/* Date Carousel Selector */}
      <div className="date-carousel" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {dateOptions.map(option => {
          const isSelected = option.dateStr === selectedDate;
          return (
            <button
              key={option.dateStr}
              onClick={() => setSelectedDate(option.dateStr)}
              style={{
                minWidth: '70px',
                padding: '10px 8px',
                backgroundColor: isSelected ? '#FFFFFF' : '#111113',
                color: isSelected ? '#09090B' : '#A1A1AA',
                border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                flexShrink: 0,
                transition: 'all 120ms ease'
              }}
            >
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{option.dayName}</span>
              <span className="font-tabular" style={{ fontSize: '17px', fontWeight: 800 }}>{option.dayNumber}</span>
            </button>
          );
        })}
      </div>

      {/* 1. MOBILE / FOCUS CARDS VIEW MODE */}
      {scheduleViewMode === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Court Selector Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {courts.map(court => {
              const isSelected = court.id === mobileViewCourtId;
              const courtBookingsToday = bookings.filter(b => b.courtId === court.id && b.date === selectedDate && b.status !== 'Cancelada');

              return (
                <button
                  key={court.id}
                  onClick={() => setMobileViewCourtId(court.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: isSelected ? '#FFFFFF' : '#111113',
                    color: isSelected ? '#09090B' : '#A1A1AA',
                    fontSize: '11.5px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 120ms ease'
                  }}
                >
                  <span>{court.name}</span>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '1px 6px', 
                    borderRadius: '10px', 
                    backgroundColor: isSelected ? '#09090B' : '#1E1E24',
                    color: isSelected ? '#FFFFFF' : '#A1A1AA',
                    fontWeight: 700
                  }}>
                    {courtBookingsToday.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Court Summary Card */}
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#111113', 
            borderRadius: '6px', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>{activeMobileCourt.name}</div>
              <div style={{ fontSize: '11px', color: '#71717A' }}>{activeMobileCourt.specs.split('·')[0]}</div>
            </div>
            <div className="font-tabular" style={{ fontSize: '14px', fontWeight: 800, color: '#E4E4E7' }}>
              {formatGs(activeMobileCourt.rate)} <span style={{ fontSize: '10.5px', color: '#71717A', fontWeight: 400 }}>/ hora</span>
            </div>
          </div>

          {/* Timeline of Slots - With Ample Padding and No Clipping */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {timeSlots.map(slot => {
              const booking = bookings.find(
                b => b.courtId === activeMobileCourt.id && b.date === selectedDate && b.timeSlot === slot && b.status !== 'Cancelada'
              );

              if (booking) {
                const isFixedPass = booking.category === 'Turno Fijo Semanal' || booking.category === 'Abono Fijo Semanal';
                const isInPlay = booking.status === 'En Cancha' || booking.status === 'En Pista';
                const isConfirmed = booking.status === 'Confirmada';
                const isPending = booking.status === 'Seña Pendiente';

                return (
                  <div
                    key={slot}
                    onClick={() => handleOpenInspect(booking)}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: isInPlay ? 'rgba(16, 185, 129, 0.05)' : '#111113',
                      border: isInPlay ? '1px solid rgba(16, 185, 129, 0.5)' : isFixedPass ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      minHeight: 'auto',
                      transition: 'border-color 120ms ease, background-color 120ms ease'
                    }}
                  >
                    {/* Top Row: Time & Status Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-tabular" style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                          {slot}
                        </span>
                        {isFixedPass && (
                          <span style={{ 
                            fontSize: '9px', 
                            fontWeight: 700, 
                            padding: '1px 6px', 
                            borderRadius: '3px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#E4E4E7',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}>
                            Abono Fijo
                          </span>
                        )}
                      </div>

                      <span className={`status-pill ${
                        isInPlay ? 'emerald' : isConfirmed ? 'blue' : isPending ? 'amber' : 'zinc'
                      }`} style={{ fontSize: '9.5px', padding: '2px 8px' }}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Middle Row: Client Name & Financials */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                        {booking.clientName}
                      </div>

                      <div className="font-tabular" style={{ fontSize: '12px', color: '#A1A1AA' }}>
                        Seña: <strong style={{ color: '#E4E4E7' }}>{formatGs(booking.depositPaid)}</strong>
                      </div>
                    </div>

                    {/* Bottom Row: Phone & Bar Info (Clear padding, no overflow clip) */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                      paddingTop: '8px', 
                      marginTop: '2px',
                      fontSize: '11.5px', 
                      color: '#71717A',
                      lineHeight: 1.4
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} color="#71717A" />
                        <span>{booking.clientPhone}</span>
                      </div>

                      {booking.barTableRequested && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }}>
                          <UtensilsCrossed size={12} />
                          <span>Mesa Reservada</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Empty slot row
              return (
                <div
                  key={slot}
                  onClick={() => setCreateSlotData({ court: activeMobileCourt, slot })}
                  style={{
                    padding: '11px 16px',
                    backgroundColor: '#09090B',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 120ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="font-tabular" style={{ fontSize: '12.5px', color: '#71717A', fontWeight: 600 }}>
                      {slot}
                    </span>
                    <span style={{ fontSize: '11px', color: '#52525B' }}>· Libre</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#A1A1AA', fontSize: '11px', fontWeight: 600 }}>
                    <Plus size={13} />
                    <span>Bloquear Turno</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FULL GRID TABLE MODE */}
      {scheduleViewMode === 'table' && (
        <div style={{ backgroundColor: '#09090B', overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px' }}>
          <table className="table-executive" style={{ minWidth: '860px' }}>
            <thead>
              <tr>
                <th style={{ width: '130px', padding: '12px 14px' }}>Bloque Horario</th>
                {courts.map(court => (
                  <th key={court.id} style={{ width: '240px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{court.name}</span>
                      <span className="font-tabular" style={{ color: '#E4E4E7', fontSize: '11px' }}>{formatGs(court.rate)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot}>
                  <td style={{ verticalAlign: 'top', padding: '12px 14px', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="font-tabular" style={{ fontSize: '12px', fontWeight: 600, color: '#A1A1AA' }}>
                      {slot}
                    </div>
                  </td>

                  {courts.map(court => {
                    const booking = bookings.find(
                      b => b.courtId === court.id && b.date === selectedDate && b.timeSlot === slot && b.status !== 'Cancelada'
                    );

                    if (booking) {
                      const isFixedPass = booking.category === 'Turno Fijo Semanal' || booking.category === 'Abono Fijo Semanal';
                      const isInPlay = booking.status === 'En Cancha' || booking.status === 'En Pista';
                      const isConfirmed = booking.status === 'Confirmada';
                      const isPending = booking.status === 'Seña Pendiente';

                      return (
                        <td 
                          key={court.id}
                          onClick={() => handleOpenInspect(booking)}
                          style={{ 
                            padding: '8px 10px', 
                            borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ 
                            padding: '10px 12px', 
                            backgroundColor: '#111113', 
                            border: isFixedPass ? '1px solid rgba(255, 255, 255, 0.25)' : isInPlay ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span className={`status-pill ${
                                isInPlay ? 'emerald' : isConfirmed ? 'blue' : isPending ? 'amber' : 'zinc'
                              }`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                                {booking.status}
                              </span>
                            </div>

                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {booking.clientName}
                            </div>

                            <div className="font-tabular" style={{ fontSize: '11px', color: '#A1A1AA' }}>
                              Seña: {formatGs(booking.depositPaid)}
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
                        style={{ padding: '8px 10px', borderRight: '1px solid rgba(255, 255, 255, 0.04)', cursor: 'pointer' }}
                      >
                        <div style={{ height: '56px', border: '1px dashed rgba(255, 255, 255, 0.08)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525B', fontSize: '11px' }}>
                          + Libre
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect / Edit Booking Bottom Sheet */}
      {inspectBooking && (
        <div className="drawer-backdrop" onClick={() => setInspectBooking(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle"></div>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#09090B' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
                  Detalle del Turno
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                  {inspectBooking.clientName}
                </h3>
              </div>
              <button onClick={() => setInspectBooking(null)} className="btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px', backgroundColor: '#111113', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#71717A' }}>Cancha:</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>{courts.find(c => c.id === inspectBooking.courtId)?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#71717A' }}>Horario:</span>
                  <span className="font-tabular" style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 700 }}>{inspectBooking.timeSlot}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#71717A' }}>Teléfono:</span>
                  <span style={{ fontSize: '12.5px', color: '#E4E4E7' }}>{inspectBooking.clientPhone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#71717A' }}>Seña Registrada:</span>
                  <span className="font-tabular" style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>{formatGs(inspectBooking.depositPaid)}</span>
                </div>
              </div>

              {/* Status Change Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#A1A1AA', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Modificar Estado Operativo
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Seña Pendiente', 'Confirmada', 'En Cancha', 'Finalizada'].map(st => {
                    const isActive = inspectBooking.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleSaveStatus(st)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '6px',
                          border: isActive ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                          backgroundColor: isActive ? '#FFFFFF' : '#111113',
                          color: isActive ? '#09090B' : '#71717A',
                          fontSize: '11.5px',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 120ms ease'
                        }}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Link to POS Tab */}
              {(() => {
                const linkedTab = tabs.find(t => t.bookingId === inspectBooking.id);
                if (linkedTab) {
                  return (
                    <button
                      onClick={() => {
                        setInspectBooking(null);
                        onOpenPosTab(linkedTab.id);
                      }}
                      className="btn-primary"
                      style={{ width: '100%', minHeight: '46px', marginTop: '10px' }}
                    >
                      <ExternalLink size={15} />
                      <span>Abrir Cuenta en POS</span>
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Manual Booking Creation Bottom Sheet */}
      {createSlotData && (
        <div className="drawer-backdrop" onClick={() => setCreateSlotData(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle"></div>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#09090B' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
                  Bloquear Turno Manual
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                  {createSlotData.court.name}
                </h3>
              </div>
              <button onClick={() => setCreateSlotData(null)} className="btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              <form onSubmit={handleCreateManual} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px 14px', backgroundColor: '#111113', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#71717A' }}>Horario Seleccionado:</span>
                  <span className="font-tabular" style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 700 }}>
                    {createSlotData.slot}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Titular del Turno *
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
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="+595 981 000 000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="input-luxury"
                  />
                </div>

                <div 
                  onClick={() => setIsFixedPass(!isFixedPass)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 14px', 
                    backgroundColor: isFixedPass ? 'rgba(255, 255, 255, 0.06)' : '#111113', 
                    borderRadius: '6px', 
                    border: isFixedPass ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: isFixedPass ? '#FFFFFF' : '#A1A1AA' }}>
                    Registrar como Abono Fijo Semanal
                  </div>
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '4px', 
                    border: isFixedPass ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: isFixedPass ? '#FFFFFF' : 'transparent',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    {isFixedPass && <Check size={12} color="#09090B" strokeWidth={3} />}
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '46px', marginTop: '6px' }}>
                  <span>Bloquear Turno</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
