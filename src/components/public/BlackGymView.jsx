import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Dumbbell, 
  Clock, 
  Check, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Calendar,
  HeartPulse
} from 'lucide-react';

export function BlackGymView() {
  const { gymPlans, applyGymMembership } = useClub();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [successApp, setSuccessApp] = useState(null);

  const handleApply = (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    const newApp = applyGymMembership({
      planId: selectedPlan.id,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      email: clientEmail.trim()
    });

    setSuccessApp(newApp);
  };

  const closeDrawer = () => {
    setSelectedPlan(null);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setSuccessApp(null);
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
          backgroundImage: 'linear-gradient(to right, rgba(7, 7, 9, 0.95) 45%, rgba(7, 7, 9, 0.45) 100%), url(/images/blackgym.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="status-dot bronze"></span>
            <span className="tracking-luxury" style={{ color: '#C5A880' }}>
              BLACKGYM · FITNESS & RECOVERY CENTER
            </span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Acondicionamiento Físico & Biomecánica
          </h2>

          <p style={{ fontSize: '13.5px', color: '#A1A1AA', marginTop: '10px', lineHeight: 1.5 }}>
            Centro de musculación, biostrength y recuperación física de alto nivel, adaptado a deportistas de élite y socios que priorizan la sobriedad y la exclusividad.
          </p>

          {/* Operating schedule info badge */}
          <div style={{ 
            display: 'inline-flex', 
            flexWrap: 'wrap', 
            gap: '14px', 
            marginTop: '18px', 
            padding: '10px 16px', 
            backgroundColor: 'rgba(255, 255, 255, 0.04)', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} strokeWidth={1.5} color="#C5A880" />
              <span style={{ color: '#F4F4F6', fontWeight: 600 }}>Lun a Vie:</span>
              <span className="font-tabular" style={{ color: '#A1A1AA' }}>07:00 a 12:00 y 14:00 a 21:00</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '14px' }}>
              <span style={{ color: '#F4F4F6', fontWeight: 600 }}>Sábados:</span>
              <span className="font-tabular" style={{ color: '#A1A1AA' }}>08:00 a 13:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '24px' }}>
        {gymPlans.map(plan => {
          const isFeatured = plan.featured;
          const isElite = plan.id === 'gym-3';

          return (
            <div
              key={plan.id}
              className="card-obsidian"
              style={{
                backgroundColor: isElite ? 'rgba(197, 168, 128, 0.04)' : '#121216',
                border: isElite ? '1px solid #C5A880' : isFeatured ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span className={`status-pill ${isElite ? 'bronze' : isFeatured ? 'blue' : 'emerald'}`}>
                    {plan.badge}
                  </span>
                  <span style={{ fontSize: '11px', color: '#71717A' }}>
                    {plan.period}
                  </span>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#F4F4F6', marginBottom: '8px' }}>
                  {plan.name}
                </h3>

                <div className="font-tabular" style={{ fontSize: '26px', fontWeight: 800, color: '#F4F4F6', marginBottom: '16px' }}>
                  {formatGs(plan.price)}
                </div>

                <p style={{ fontSize: '13px', color: '#A1A1AA', lineHeight: 1.5, marginBottom: '20px' }}>
                  {plan.description}
                </p>

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px', marginBottom: '24px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', color: '#D4D4D8' }}>
                      <Check size={14} strokeWidth={2} color={isElite ? '#C5A880' : '#10B981'} style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={isElite ? 'btn-bronze' : 'btn-primary'}
                style={{ width: '100%', padding: '12px' }}
              >
                <span>SOLICITAR ADMISIÓN</span>
                <ChevronRight size={15} strokeWidth={1.5} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Slide-over Membership Application Drawer */}
      {selectedPlan && (
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
                <div className="tracking-luxury">SOLICITUD DE MEMBRESÍA · BLACKGYM</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6' }}>
                  {selectedPlan.name}
                </h3>
              </div>
              <button onClick={closeDrawer} className="btn-ghost" style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {!successApp ? (
                <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div className="card-obsidian" style={{ padding: '16px', backgroundColor: '#131318' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#71717A' }}>Plan Seleccionado</span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedPlan.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#71717A' }}>Cuota Periódica</span>
                      <span className="font-tabular" style={{ fontSize: '15px', fontWeight: 700, color: '#C5A880' }}>
                        {formatGs(selectedPlan.price)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                      DATOS PERSONALES DEL SOLICITANTE
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
                      <input
                        type="email"
                        placeholder="Correo electrónico corporativo"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                    <span>ENVIAR SOLICITUD A ADMISIONES</span>
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid #10B981',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Check size={24} strokeWidth={2} color="#10B981" />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#F4F4F6' }}>
                    Solicitud Recibida por Recepción
                  </h4>
                  <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '6px' }}>
                    El equipo de concierge de BlackGym coordinará su sesión de evaluación biométrica inicial y la entrega de credenciales.
                  </p>
                  <button onClick={closeDrawer} className="btn-secondary" style={{ width: '100%', marginTop: '24px' }}>
                    <span>FINALIZAR</span>
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
