import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Clock, 
  Check, 
  X, 
  ChevronRight, 
  UserCheck,
  ArrowLeft
} from 'lucide-react';

export function BlackTeamView() {
  const { coaches, courts, bookCoachClass, selectedDate } = useClub();

  const [activeCoach, setActiveCoach] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Lock background body scroll while drawer is open
  useEffect(() => {
    if (!activeCoach) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [activeCoach]);

  const handleBookLesson = (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !selectedSlot) {
      setErrorMsg('Por favor complete todos los campos requeridos.');
      return;
    }

    try {
      const newBooking = bookCoachClass({
        coachId: activeCoach.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim()
      });

      setConfirmation(newBooking);
    } catch {
      setErrorMsg('El horario seleccionado ya se encuentra bloqueado en la grilla del club.');
    }
  };

  const closeDrawer = () => {
    setActiveCoach(null);
    setSelectedSlot('');
    setClientName('');
    setClientPhone('');
    setConfirmation(null);
    setErrorMsg('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner - Direct & Clean */}
      <div 
        className="card-obsidian"
        style={{
          position: 'relative',
          padding: '20px',
          backgroundImage: 'linear-gradient(to right, rgba(9, 9, 11, 0.95) 45%, rgba(9, 9, 11, 0.6) 100%), url(/images/blackteam.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255, 255, 255, 0.07)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="status-dot blue"></span>
            <span className="tracking-luxury">BLACKTEAM · ACADEMIA & CLASES</span>
          </div>

          <h2 className="title-section" style={{ color: '#FFFFFF' }}>
            Coaches & Clínicas Personalizadas
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '11.5px', color: '#A1A1AA' }}>
            <span>Sesiones 1 a 1</span>
            <span>·</span>
            <span>Bloqueo automático de cancha oficial</span>
          </div>
        </div>
      </div>

      {/* Coaches Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
        gap: '14px' 
      }}>
        {coaches.map(coach => {
          const defaultCourt = courts.find(c => c.id === coach.defaultCourtId);

          return (
            <div
              key={coach.id}
              className="card-obsidian"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '8px'
              }}
            >
              <div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between', 
                  gap: '8px', 
                  marginBottom: '12px' 
                }}>
                  <span 
                    className="status-pill blue" 
                    style={{ 
                      fontSize: '9.5px', 
                      padding: '3px 8px', 
                      lineHeight: '1.3',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      maxWidth: '100%'
                    }}
                  >
                    {coach.role}
                  </span>
                  <div 
                    className="font-tabular" 
                    style={{ 
                      fontSize: '15px', 
                      fontWeight: 800, 
                      color: '#FFFFFF',
                      flexShrink: 0,
                      marginLeft: 'auto'
                    }}
                  >
                    {formatGs(coach.rate)} <span style={{ fontSize: '10px', color: '#71717A', fontWeight: 400 }}>/ hora</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                  {coach.name}
                </h3>

                <div style={{ fontSize: '11.5px', color: '#38BDF8', fontWeight: 600, marginBottom: '8px' }}>
                  {coach.credentials}
                </div>

                <p style={{ fontSize: '12px', color: '#A1A1AA', lineHeight: 1.45, marginBottom: '14px' }}>
                  {coach.bio}
                </p>

                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#09090B', 
                  borderRadius: '6px', 
                  border: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '11px',
                  color: '#71717A',
                  marginBottom: '16px'
                }}>
                  Cancha de Entrenamiento: <strong style={{ color: '#FFFFFF' }}>{defaultCourt ? defaultCourt.name : 'Cancha Central'}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveCoach(coach);
                  setSelectedSlot(coach.enabledSlots[0] || '');
                }}
                className="btn-primary"
                style={{ width: '100%', minHeight: '42px' }}
              >
                <span>Agendar Clase</span>
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Booking Drawer / Bottom Sheet */}
      {activeCoach && (
        <div className="drawer-backdrop" onClick={closeDrawer}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-container" onClick={closeDrawer} title="Cerrar">
              <div className="drawer-drag-handle"></div>
            </div>

            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: '#09090B'
            }}>
              <div>
                <div className="tracking-luxury">BLACKTEAM · CLASE PARTICULAR</div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  {activeCoach.name}
                </h3>
              </div>
              <button 
                onClick={closeDrawer} 
                className="btn-secondary" 
                style={{ padding: '6px 12px', minHeight: '34px', fontSize: '11.5px', gap: '6px', borderRadius: '4px' }}
                aria-label="Volver a lista de coaches"
              >
                <ArrowLeft size={13} strokeWidth={2} />
                <span>Volver</span>
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {!confirmation ? (
                <form onSubmit={handleBookLesson} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="card-obsidian" style={{ padding: '12px 14px', backgroundColor: '#131316' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11.5px', color: '#71717A' }}>Tarifa de Clase (1h):</span>
                      <span className="font-tabular" style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                        {formatGs(activeCoach.rate)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#71717A' }}>
                      Incluye cancha oficial y tubos de pelotas de alta presión.
                    </div>
                  </div>

                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '6px' }}>
                      HORARIOS HABILITADOS
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeCoach.enabledSlots.map(slot => (
                        <div
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: selectedSlot === slot ? '#FFFFFF' : '#111113',
                            border: selectedSlot === slot ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: selectedSlot === slot ? '#09090B' : '#A1A1AA',
                            transition: 'all 120ms ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={12} strokeWidth={1.5} color={selectedSlot === slot ? '#09090B' : '#71717A'} />
                            <span className="font-tabular" style={{ fontSize: '12.5px', fontWeight: 700 }}>{slot}</span>
                          </div>
                          {selectedSlot === slot && <Check size={14} color="#09090B" strokeWidth={2.5} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Nombre del Jugador *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Rodrigo Giménez"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="input-luxury"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase' }}>
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+595 981 000 000"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div style={{ fontSize: '12px', color: '#FB7185', textAlign: 'center' }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ width: '100%', minHeight: '46px' }}
                    >
                      <UserCheck size={15} strokeWidth={2} />
                      <span>Confirmar Sesión</span>
                    </button>

                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="btn-ghost"
                      style={{ width: '100%', minHeight: '38px', fontSize: '12px', color: '#A1A1AA', gap: '6px' }}
                    >
                      <ArrowLeft size={13} />
                      <span>Volver a Coaches</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                    border: '1.5px solid #10B981', 
                    color: '#10B981', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto' 
                  }}>
                    <Check size={22} strokeWidth={2.5} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
                      Clase Agendada
                    </h3>
                    <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '4px' }}>
                      Cancha bloqueada en la agenda del club para el turno seleccionado.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="btn-primary"
                    style={{ width: '100%', minHeight: '44px', gap: '8px' }}
                  >
                    <ArrowLeft size={14} />
                    <span>Volver a BlackTeam</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
