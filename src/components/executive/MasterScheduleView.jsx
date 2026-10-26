import React, { useState, useMemo, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatFullDate } from '../../utils/formatters';
import { getNext7Days } from '../../utils/dateHelpers';
import { 
  Check, 
  X, 
  UtensilsCrossed, 
  Plus, 
  ExternalLink, 
  Phone, 
  ArrowLeft, 
  Bell 
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

  // Lock background body scroll while drawer is open
  useEffect(() => {
    if (!inspectBooking && !createSlotData) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [inspectBooking, createSlotData]);

  // Form states for manual booking
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isFixedPass, setIsFixedPass] = useState(false);
  const [newDepositPaid, setNewDepositPaid] = useState('');
  const [newTableRequested, setNewTableRequested] = useState(false);

  // Status edit for inspect
  const [editingDeposit, setEditingDeposit] = useState('');

  // 7 days options with stable generation
  const dateOptions = useMemo(() => getNext7Days(), []);

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

  const pendingRequests = useMemo(() => {
    return bookings.filter(b => 
      (b.status === 'Solicitud Pendiente' || b.status === 'Seña Pendiente') &&
      b.status !== 'Cancelada'
    );
  }, [bookings]);

  const handleConfirmAndBlock = (bookingId) => {
    updateBookingStatus(bookingId, 'Confirmada', 0);
  };

  const handleRejectRequest = (bookingId) => {
    updateBookingStatus(bookingId, 'Cancelada', 0);
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
      clientPhone: newClientPhone.trim() || '+595 983 573 396',
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

      {/* Tarjeta de Solicitudes Entrantes de Reserva (Alguien quiere reservar una cancha) */}
      {pendingRequests.length > 0 && (
        <div style={{
          padding: '16px 18px',
          borderRadius: '8px',
          backgroundColor: '#161619',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="#F59E0B" />
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.02em' }}>
                ¡Alguien quiere reservar una cancha! ({pendingRequests.length} solicitud{pendingRequests.length > 1 ? 'es' : ''})
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#A1A1AA' }}>
              Podés bloquear el turno o coordinar por WhatsApp
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '10px' }}>
            {pendingRequests.map(req => {
              const courtObj = courts.find(c => c.id === req.courtId);
              const cleanPhone = (req.clientPhone || '').replace(/\D/g, '');
              const waUrl = `https://wa.me/${cleanPhone || '595983573396'}?text=${encodeURIComponent(`Hola ${req.clientName}, te escribimos de Black Club Elite para confirmar tu reserva en la cancha ${courtObj?.name || ''} para el ${req.date} en el turno ${req.timeSlot}.`)}`;

              return (
                <div 
                  key={req.id}
                  style={{
                    backgroundColor: '#0E0E10',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ 
                        fontSize: '9.5px', 
                        fontWeight: 700, 
                        backgroundColor: 'rgba(245, 158, 11, 0.15)', 
                        color: '#F59E0B', 
                        padding: '2px 7px', 
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Solicitud Web
                      </span>
                      <span style={{ fontSize: '11px', color: '#A1A1AA' }}>
                        {req.date} · {req.timeSlot}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: '4px 0 6px' }}>
                      {req.clientName}
                    </h4>

                    <div style={{ fontSize: '12px', color: '#D4D4D8', marginBottom: '3px' }}>
                      🎾 Cancha: <strong>{courtObj?.name || 'Cancha'}</strong>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#A1A1AA' }}>
                      📱 Teléfono / WhatsApp: <strong style={{ color: '#FFFFFF' }}>{req.clientPhone}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <button
                      onClick={() => handleConfirmAndBlock(req.id)}
                      className="btn-primary"
                      style={{ flex: 1, minHeight: '38px', fontSize: '12px', fontWeight: 700, gap: '6px' }}
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>Bloquear Reserva</span>
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      title="Chatear por WhatsApp con el cliente"
                      style={{ minHeight: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                    >
                      <Phone size={13} strokeWidth={2} />
                    </a>

                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="btn-ghost"
                      title="Descartar solicitud"
                      style={{ minHeight: '38px', padding: '0 10px', color: '#FB7185', fontSize: '12px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          <div 
            className="drawer-panel" 
            role="dialog"
            aria-modal="true"
            aria-label="Detalle del Turno"
            onClick={(e) => e.stopPropagation()}
          >
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
              <button 
                onClick={() => setInspectBooking(null)} 
                className="btn-secondary" 
                style={{ padding: '6px 12px', minHeight: '34px', fontSize: '11.5px', gap: '6px', borderRadius: '4px' }}
                aria-label="Volver a la agenda"
              >
                <ArrowLeft size={13} strokeWidth={2} />
                <span>Volver</span>
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
                {(inspectBooking.status === 'Solicitud Pendiente' || inspectBooking.status === 'Seña Pendiente') && (
                  <button
                    onClick={() => handleSaveStatus('Confirmada')}
                    className="btn-primary"
                    style={{ width: '100%', minHeight: '44px', gap: '8px', marginBottom: '12px', fontSize: '13px' }}
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>Bloquear y Confirmar Reserva</span>
                  </button>
                )}

                <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#A1A1AA', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Modificar Estado Operativo
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Solicitud Pendiente', 'Confirmada', 'En Cancha', 'Finalizada'].map(st => {
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

              <button
                type="button"
                onClick={() => setInspectBooking(null)}
                className="btn-ghost"
                style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12.5px' }}
              >
                <ArrowLeft size={14} />
                <span>Volver a la Agenda</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Booking Creation Bottom Sheet */}
      {createSlotData && (
        <div className="drawer-backdrop" onClick={() => setCreateSlotData(null)}>
          <div 
            className="drawer-panel" 
            role="dialog"
            aria-modal="true"
            aria-label="Bloquear Turno Manual"
            onClick={(e) => e.stopPropagation()}
          >
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => setCreateSlotData(null)} 
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', minHeight: '34px', fontSize: '11.5px', gap: '6px', borderRadius: '4px' }}
                  aria-label="Volver"
                >
                  <ArrowLeft size={13} strokeWidth={2} />
                  <span>Volver</span>
                </button>
                <button onClick={() => setCreateSlotData(null)} className="btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
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
                    placeholder="+595 983 573 396"
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

                <button 
                  type="button"
                  onClick={() => setCreateSlotData(null)}
                  className="btn-ghost"
                  style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12.5px' }}
                >
                  <ArrowLeft size={14} />
                  <span>Volver a la Agenda</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
