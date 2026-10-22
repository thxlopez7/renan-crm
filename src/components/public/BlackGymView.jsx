import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Clock, 
  Check, 
  X, 
  ChevronRight, 
  Send
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
      {/* Header Banner */}
      <div 
        className="card-obsidian"
        style={{
          position: 'relative',
          padding: '20px',
          marginBottom: '20px',
          backgroundImage: 'linear-gradient(to right, rgba(9, 9, 11, 0.95) 45%, rgba(9, 9, 11, 0.6) 100%), url(/images/blackgym.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255, 255, 255, 0.07)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="status-dot blue"></span>
            <span className="tracking-luxury">BLACKGYM · CENTRO FITNESS & BIOSTRENGTH</span>
          </div>

          <h2 className="title-section" style={{ color: '#FFFFFF' }}>
            Acondicionamiento Físico & Biomecánica
          </h2>

          {/* Operating schedule info badge (Real Instagram Bio Hours) */}
          <div style={{ 
            display: 'inline-flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            marginTop: '10px', 
            padding: '6px 12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.04)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: '6px',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} strokeWidth={1.5} color="#FFFFFF" />
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Lun a Vie:</span>
              <span className="font-tabular" style={{ color: '#A1A1AA' }}>07:00 a 12:00 y 14:00 a 21:00</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Sáb:</span>
              <span className="font-tabular" style={{ color: '#A1A1AA' }}>08:00 a 13:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
        gap: '14px' 
      }}>
        {gymPlans.map(plan => {
          const isFeatured = plan.featured;

          return (
            <div
              key={plan.id}
              className="card-obsidian"
              style={{
                backgroundColor: '#111113',
                border: isFeatured ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.07)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '8px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className={`status-pill ${isFeatured ? 'emerald' : 'muted'}`}>
                    {plan.badge}
                  </span>
                  <span style={{ fontSize: '11px', color: '#71717A' }}>
                    {plan.period}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                  {plan.name}
                </h3>

                <div className="font-tabular" style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
                  {formatGs(plan.price)}
                </div>

                <p style={{ fontSize: '12px', color: '#A1A1AA', lineHeight: 1.45, marginBottom: '14px' }}>
                  {plan.description}
                </p>

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginBottom: '16px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11.5px', color: '#D4D4D8' }}>
                      <Check size={12} strokeWidth={2.5} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={isFeatured ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', minHeight: '42px' }}
              >
                <span>Solicitar Admisión</span>
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Slide-over / Mobile Bottom Sheet Membership Application Drawer */}
      {selectedPlan && (
        <div className="drawer-backdrop" onClick={closeDrawer}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle"></div>

            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: '#0E0E10'
            }}>
              <div>
                <div className="tracking-luxury">MEMBRESÍA · BLACKGYM</div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  {selectedPlan.name}
                </h3>
              </div>
              <button onClick={closeDrawer} className="btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {!successApp ? (
                <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="card-obsidian" style={{ padding: '12px 14px', backgroundColor: '#131316' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11.5px', color: '#71717A' }}>Plan Seleccionado:</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{selectedPlan.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11.5px', color: '#71717A' }}>Cuota:</span>
                      <span className="font-tabular" style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                        {formatGs(selectedPlan.price)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '6px' }}>
                      DATOS PERSONALES
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Nombre y Apellido *"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="input-luxury"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Teléfono / WhatsApp *"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="input-luxury"
                      />
                      <input
                        type="email"
                        placeholder="Correo electrónico (Opcional)"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '46px', marginTop: '6px' }}>
                    <Send size={14} strokeWidth={2} />
                    <span>Enviar Solicitud a Admisiones</span>
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
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
                    <span className="status-pill emerald" style={{ marginBottom: '6px' }}>
                      SOLICITUD REGISTRADA
                    </span>
                    <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                      Recepción Notificada
                    </h4>
                    <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '2px' }}>
                      Coordinaremos tu acceso y entrega de credenciales en el club.
                    </p>
                  </div>
                  <button onClick={closeDrawer} className="btn-secondary" style={{ width: '100%', minHeight: '42px' }}>
                    Finalizar
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
