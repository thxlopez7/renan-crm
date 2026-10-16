import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Award, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  UserCheck,
  Zap,
  Activity
} from 'lucide-react';

export function BlackTeamView() {
  const { coaches, courts, bookCoachClass, selectedDate } = useClub();

  const [activeCoach, setActiveCoach] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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
    <div>
      {/* Editorial Header */}
      <div 
        className="card-obsidian"
        style={{
          position: 'relative',
          padding: '40px 32px',
          marginBottom: '32px',
          backgroundImage: 'linear-gradient(to right, rgba(7, 7, 9, 0.95) 45%, rgba(7, 7, 9, 0.45) 100%), url(/images/blackteam.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="status-dot blue"></span>
            <span className="tracking-luxury" style={{ color: '#38BDF8' }}>
              BLACKTEAM ACADEMY · ALTO RENDIMIENTO
            </span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Cuerpo Técnico & Clínicas de Perfeccionamiento
          </h2>

          <p style={{ fontSize: '13.5px', color: '#A1A1AA', marginTop: '10px', lineHeight: 1.5 }}>
            Metodología de entrenamiento biomecánico y preparación táctica orientada a jugadores de competición. Toda sesión privada bloquea automáticamente la pista correspondiente en la agenda general.
          </p>
        </div>
      </div>

      {/* Coaches Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {coaches.map(coach => {
          const defaultCourt = courts.find(c => c.id === coach.defaultCourtId);

          return (
            <div
              key={coach.id}
              className="card-obsidian"
              style={{
                backgroundColor: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <span className="status-pill blue" style={{ marginBottom: '8px' }}>
                      {coach.role}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F4F4F6', marginTop: '4px' }}>
                      {coach.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#C5A880', fontWeight: 500, marginTop: '2px' }}>
                      {coach.credentials}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="tracking-luxury">SESIÓN (90 MIN)</div>
                    <div className="font-tabular" style={{ fontSize: '18px', fontWeight: 700, color: '#F4F4F6' }}>
                      {formatGs(coach.rate)}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#A1A1AA', lineHeight: 1.5, marginBottom: '18px' }}>
                  {coach.bio}
                </p>

                {/* Court assignment */}
                <div style={{ 
                  padding: '10px 12px', 
                  backgroundColor: '#0D0D11', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '4px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: '#71717A' }}>Pista Asignada:</span>
                  <span style={{ color: '#F4F4F6', fontWeight: 500 }}>{defaultCourt ? defaultCourt.name : 'Pista Central'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveCoach(coach);
                  setSelectedSlot(coach.enabledSlots[0] || '');
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                <span>AGENDAR SESIÓN PRIVADA</span>
                <ChevronRight size={15} strokeWidth={1.5} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Slide-over Booking Drawer */}
      {activeCoach && (
        <div className="drawer-backdrop" onClick={closeDrawer}>
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
                <div className="tracking-luxury">BLACKTEAM · RESERVA DE CLASE</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6' }}>
                  {activeCoach.name}
                </h3>
              </div>
              <button onClick={closeDrawer} className="btn-ghost" style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {!confirmation ? (
                <form onSubmit={handleBookLesson} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Summary info */}
                  <div className="card-obsidian" style={{ padding: '16px', backgroundColor: '#131318' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#71717A' }}>Especialidad</span>
                      <span style={{ fontWeight: 600 }}>{activeCoach.role}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#71717A' }}>Tarifa Sesión</span>
                      <span className="font-tabular" style={{ fontWeight: 700, color: '#C5A880' }}>
                        {formatGs(activeCoach.rate)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#38BDF8', marginTop: '6px' }}>
                      Incluye bloqueo total de 90 minutos en la pista asignada.
                    </div>
                  </div>

                  {/* Slot Selection */}
                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                      SELECCIONAR BLOQUE HORARIO DISPONIBLE
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeCoach.enabledSlots.map(slot => (
                        <label
                          key={slot}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            backgroundColor: selectedSlot === slot ? 'rgba(56, 189, 248, 0.08)' : '#121216',
                            border: selectedSlot === slot ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={14} strokeWidth={1.5} color={selectedSlot === slot ? '#38BDF8' : '#71717A'} />
                            <span className="font-tabular" style={{ fontSize: '13.5px', fontWeight: 600 }}>
                              {slot}
                            </span>
                          </div>
                          <input
                            type="radio"
                            name="coachSlot"
                            checked={selectedSlot === slot}
                            onChange={() => setSelectedSlot(slot)}
                            style={{ accentColor: '#38BDF8' }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                      DATOS DEL ALUMNO / JUGADOR
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Nombre y Apellido del alumno"
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

                  {errorMsg && (
                    <div style={{ padding: '10px 14px', backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '4px', color: '#FDA4AF', fontSize: '12px' }}>
                      {errorMsg}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                    <span>CONFIRMAR AGENDAMIENTO & BLOQUEO</span>
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(56, 189, 248, 0.1)', 
                    border: '1px solid #38BDF8',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Check size={24} strokeWidth={2} color="#38BDF8" />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#F4F4F6' }}>
                    Clase Agendada con Éxito
                  </h4>
                  <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '6px' }}>
                    Se ha bloqueado la pista en la agenda general y abierto la cuenta en el sistema de recepción.
                  </p>
                  <div className="font-tabular" style={{ fontSize: '15px', color: '#C5A880', fontWeight: 700, marginTop: '12px' }}>
                    Código: {confirmation.code}
                  </div>

                  <button onClick={closeDrawer} className="btn-secondary" style={{ width: '100%', marginTop: '24px' }}>
                    <span>CERRAR</span>
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
