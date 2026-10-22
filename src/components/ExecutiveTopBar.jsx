import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { formatGs } from '../utils/formatters';
import { 
  Building2, 
  Smartphone, 
  MapPin, 
  Sliders,
  X,
  TrendingUp,
  Calendar,
  Phone,
  Clock,
  ShieldCheck,
  LogOut,
  UserCheck
} from 'lucide-react';

export function ExecutiveTopBar({ viewMode, setViewMode }) {
  const { kpis, isSupabaseLive, user, setShowAuthModal, signOutStaff } = useClub();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isPublic = viewMode === 'public';

  const handleStaffAccess = () => {
    if (user) {
      setViewMode('executive');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSignOut = async () => {
    await signOutStaff();
    setViewMode('public');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="topbar-wrapper">
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 16px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Brand Identity with Official Circular Isotype */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ 
            width: '34px', 
            height: '34px', 
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundColor: '#09090B',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 0 12px rgba(255, 255, 255, 0.08)'
          }}>
            <img 
              src="/images/logo_black_club.png" 
              alt="Black Club Elite" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '3px'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800, letterSpacing: '0.14em', color: '#FFFFFF' }}>BLACK CLUB</span>
              <span style={{ 
                fontSize: '9px', 
                fontWeight: 700, 
                letterSpacing: '0.18em', 
                color: isPublic ? '#A1A1AA' : '#FFFFFF', 
                borderLeft: '1px solid rgba(255,255,255,0.15)', 
                paddingLeft: '6px' 
              }}>
                {isPublic ? 'ELITE' : 'CRM'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Center Spacer */}
        <div className="hide-mobile" />

        {/* Right Section: Production Actions based on View Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isPublic ? (
            /* PUBLIC PRODUCTION HEADER */
            <>
              {/* Contacto Direct (Desktop only) */}
              <a
                href="https://wa.me/595981000000"
                target="_blank"
                rel="noopener noreferrer"
                className="hide-mobile"
                style={{
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  transition: 'all 120ms ease'
                }}
              >
                <Phone size={11} strokeWidth={1.5} />
                <span>Contacto</span>
              </a>

              {/* Staff / CRM Access Button with Auth Trigger */}
              <button
                onClick={handleStaffAccess}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: '#121215',
                  color: '#A1A1AA',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                  flexShrink: 0
                }}
                title="Acceso para Administración y Recepción"
              >
                <Building2 size={12} strokeWidth={1.5} />
                <span className="hide-mobile">{user ? 'Suite CRM' : 'Acceso Staff'}</span>
                <span className="show-mobile-only">{user ? 'CRM' : 'Staff'}</span>
              </button>
            </>
          ) : (
            /* CRM ADMINISTRATIVE HEADER: Live Revenue, Occupancy, Public View Switcher & Logout */
            <>
              {/* Desktop Financial Metrics */}
              <div className="hide-mobile" style={{ alignItems: 'center', gap: '14px', borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '14px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="tracking-luxury" style={{ fontSize: '8.5px' }}>FACTURACIÓN HOY</div>
                  <div className="font-tabular" style={{ fontSize: '12px', fontWeight: 700, color: '#E4E4E7' }}>
                    {formatGs(kpis.totalRevenueToday)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tracking-luxury" style={{ fontSize: '8.5px' }}>OCUPACIÓN</div>
                  <div className="font-tabular" style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                    {kpis.occupancyRate}%
                  </div>
                </div>
              </div>

              {/* Return to Public Portal */}
              <button
                onClick={() => setViewMode('public')}
                className="btn-secondary"
                style={{
                  padding: '6px 9px',
                  fontSize: '11px',
                  minHeight: '32px',
                  gap: '5px',
                  borderRadius: '4px',
                  flexShrink: 0
                }}
                title="Ver portal público de clientes"
              >
                <Smartphone size={12} strokeWidth={2} />
                <span className="hide-mobile">Portal Público</span>
                <span className="show-mobile-only">Portal</span>
              </button>

              {/* Staff Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="btn-ghost"
                style={{
                  padding: '6px 8px',
                  fontSize: '11px',
                  minHeight: '32px',
                  gap: '4px',
                  color: '#FB7185',
                  flexShrink: 0
                }}
                title={`Cerrar sesión de ${user?.email || 'personal'}`}
              >
                <LogOut size={12} strokeWidth={1.5} />
                <span>Salir</span>
              </button>
            </>
          )}

          {/* Mobile Options Trigger (Public Only) */}
          {isPublic && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="show-mobile-only"
              style={{
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#121215',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#FFFFFF',
                cursor: 'pointer',
                flexShrink: 0
              }}
              aria-label="Menú de opciones"
            >
              <Sliders size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ padding: '20px' }}>
            <div className="drawer-drag-handle"></div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#09090B',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src="/images/logo_black_club.png" alt="Black Club" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                </div>
                <div>
                  <div className="tracking-luxury" style={{ fontSize: '8.5px' }}>
                    {isPublic ? 'PORTAL OFICIAL' : 'CRM ADMINISTRATIVO'}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Black Club Elite</div>
                </div>
              </div>

              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-ghost" 
                style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Mobile View Content */}
            {isPublic ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Information cards */}
                <div style={{ padding: '14px', backgroundColor: '#111113', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Clock size={13} strokeWidth={1.5} color="#34D399" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>Horario de Atención</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#A1A1AA', lineHeight: 1.5 }}>
                    Canchas de Pádel: 07:00 a 00:00 hs<br />
                    BlackGym: 07:00-12:00 / 14:00-21:00 hs<br />
                    Lounge & Merch: 17:00 a 00:00 hs
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#111113', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MapPin size={13} strokeWidth={1.5} color="#FFFFFF" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>Ubicación</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#A1A1AA' }}>
                    A 2 cuadras de la ruta principal · Asunción / Luque, Paraguay
                  </div>
                </div>

                {/* Direct WhatsApp Concierge */}
                <a
                  href="https://wa.me/595981000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-athletic"
                  style={{ width: '100%', minHeight: '42px', textDecoration: 'none', justifyContent: 'center' }}
                >
                  <Phone size={14} strokeWidth={1.5} />
                  <span>Contactar Concierge WhatsApp</span>
                </a>

                {/* Staff Access Link */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleStaffAccess();
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', minHeight: '40px', justifyContent: 'center', gap: '8px' }}
                  >
                    <Building2 size={13} strokeWidth={1.5} />
                    <span>{user ? 'Ingresar a Suite CRM' : 'Acceso Staff / CRM'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CRM Mobile View */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="card-obsidian" style={{ padding: '14px', backgroundColor: '#111113' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <TrendingUp size={13} strokeWidth={1.5} color="#E4E4E7" />
                      <span className="tracking-luxury" style={{ fontSize: '8.5px' }}>FACTURACIÓN</span>
                    </div>
                    <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 800, color: '#E4E4E7' }}>
                      {formatGs(kpis.totalRevenueToday)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#71717A', marginTop: '2px' }}>Canchas + Barra</div>
                  </div>

                  <div className="card-obsidian" style={{ padding: '14px', backgroundColor: '#111113' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Calendar size={13} strokeWidth={1.5} color="#FFFFFF" />
                      <span className="tracking-luxury" style={{ fontSize: '8.5px' }}>OCUPACIÓN</span>
                    </div>
                    <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                      {kpis.occupancyRate}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#71717A', marginTop: '2px' }}>3 canchas oficiales</div>
                  </div>
                </div>

                {user && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#111113', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={14} color="#34D399" />
                    <span>Sesión iniciada: {user.email}</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setViewMode('public');
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-primary"
                  style={{ width: '100%', minHeight: '42px', justifyContent: 'center', gap: '8px' }}
                >
                  <Smartphone size={14} strokeWidth={2} />
                  <span>Ver Portal Público</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="btn-secondary"
                  style={{ width: '100%', minHeight: '40px', justifyContent: 'center', gap: '8px', color: '#FB7185', borderColor: 'rgba(225, 29, 72, 0.25)' }}
                >
                  <LogOut size={13} strokeWidth={1.5} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
