import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { CourtsBookingView } from './CourtsBookingView';
import { BlackBarMenuView } from './BlackBarMenuView';
import { BlackTeamView } from './BlackTeamView';
import { BlackGymView } from './BlackGymView';
import { TournamentsView } from './TournamentsView';
import { 
  Calendar, 
  UtensilsCrossed, 
  Award, 
  Dumbbell, 
  Trophy, 
  MapPin, 
  Phone,
  ExternalLink 
} from 'lucide-react';

export function PublicPortal() {
  const { kpis } = useClub();
  const [activeTab, setActiveTab] = useState('courts');

  // Business units aligned with @blackclubparaguay
  const navItems = [
    { id: 'courts', label: 'Pádel', fullLabel: 'Reservar Cancha', icon: Calendar },
    { id: 'gym', label: 'BlackGym', fullLabel: 'BlackGym', icon: Dumbbell },
    { id: 'team', label: 'BlackTeam', fullLabel: 'BlackTeam', icon: Award },
    { id: 'tournaments', label: 'Circuito', fullLabel: 'Circuito & Torneos', icon: Trophy, isHighlight: true },
    { id: 'bar', label: 'Bar & Merch', fullLabel: 'Bar & Merch', icon: UtensilsCrossed }
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px 100px', width: '100%' }}>
      {/* Quiet Athletic Header */}
      <section style={{ padding: '20px 0 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h1 className="title-hero" style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                BLACK CLUB
              </h1>
            </div>

            <a
              href="https://wa.me/595981000000"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '7px 14px',
                backgroundColor: '#18181B',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                color: '#FFFFFF', 
                fontSize: '11.5px', 
                fontWeight: 600, 
                textDecoration: 'none',
                transition: 'all 120ms ease'
              }}
            >
              <Phone size={12} strokeWidth={1.5} />
              <span>Contacto</span>
            </a>
          </div>

          {/* Clean Real-Time Operational Indicators (Horizontal Scrollable Mobile-First) */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            overflowX: 'auto', 
            paddingBottom: '6px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {/* Padel Status */}
            <div style={{ 
              backgroundColor: 'rgba(17, 17, 19, 0.88)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '6px', 
              padding: '8px 14px',
              minWidth: '170px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="status-dot emerald"></span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>3 Canchas Habilitadas</span>
              </div>
              <div className="font-tabular" style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '2px' }}>
                {kpis.courtsInPlayCount} en juego · Turnos de 1 hora
              </div>
            </div>

            {/* BlackGym Status */}
            <div style={{ 
              backgroundColor: 'rgba(17, 17, 19, 0.88)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '6px', 
              padding: '8px 14px',
              minWidth: '190px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="status-dot blue"></span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>BlackGym Abierto</span>
              </div>
              <div className="font-tabular" style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '2px' }}>
                07:00-12:00 / 14:00-21:00
              </div>
            </div>

            {/* Bar & Merch Status */}
            <div style={{ 
              backgroundColor: 'rgba(17, 17, 19, 0.88)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '6px', 
              padding: '8px 14px',
              minWidth: '170px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="status-dot amber"></span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>Bar & Delivery</span>
              </div>
              <div className="font-tabular" style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '2px' }}>
                17:00 a 00:00 hs
              </div>
            </div>

            {/* Direct Google Maps Button */}
            <a
              href="https://maps.google.com/?q=Black+Club+Padel+Paraguay"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                backgroundColor: 'rgba(17, 17, 19, 0.88)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)', 
                borderRadius: '6px', 
                padding: '8px 14px',
                minWidth: '190px',
                flexShrink: 0,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 120ms ease',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={12} strokeWidth={2} color="#FFFFFF" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>Cómo Llegar</span>
                </div>
                <ExternalLink size={11} strokeWidth={1.5} color="#A1A1AA" />
              </div>
              <div style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '2px' }}>
                Abrir en Google Maps
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Desktop Navigation Tabs (Screens > 768px) */}
      <nav className="hide-mobile" style={{ 
        gap: '6px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)', 
        margin: '18px 0 24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 16px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : '#71717A',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 120ms ease'
              }}
            >
              <Icon 
                size={14} 
                strokeWidth={isActive ? 2 : 1.5} 
                color={item.isHighlight && !isActive ? '#FB7185' : isActive ? '#FFFFFF' : '#71717A'} 
              />
              <span>{item.fullLabel}</span>
              {item.isHighlight && (
                <span style={{ 
                  fontSize: '9px', 
                  fontWeight: 700, 
                  backgroundColor: 'rgba(225, 29, 72, 0.2)', 
                  color: '#FB7185', 
                  padding: '1px 5px', 
                  borderRadius: '3px' 
                }}>
                  2da Ed.
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Content Modules */}
      <main style={{ marginTop: '16px' }}>
        {activeTab === 'courts' && <CourtsBookingView />}
        {activeTab === 'gym' && <BlackGymView />}
        {activeTab === 'team' && <BlackTeamView />}
        {activeTab === 'tournaments' && <TournamentsView />}
        {activeTab === 'bar' && <BlackBarMenuView />}
      </main>

      {/* Institutional Minimal Footer */}
      <footer style={{ 
        marginTop: '60px', 
        paddingTop: '24px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        color: '#71717A',
        fontSize: '11.5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>BLACK CLUB</span>
          <span>·</span>
          <span>A 2 cuadras de la ruta principal · Paraguay</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a 
            href="https://instagram.com/blackclubparaguay" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#A1A1AA', textDecoration: 'none' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <span>@blackclubparaguay</span>
          </a>

          <a 
            href="https://wa.me/595981000000" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}
          >
            <Phone size={12} strokeWidth={1.5} />
            <span>WhatsApp</span>
          </a>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Quiet Monochromatic with Athletic Touch) */}
      <nav className="mobile-bottom-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.fullLabel}
            >
              {isActive && <div className="nav-icon-indicator" />}
              <Icon 
                size={17} 
                strokeWidth={isActive ? 2.2 : 1.5} 
                color={isActive ? '#FFFFFF' : item.isHighlight ? '#FB7185' : '#71717A'} 
              />
              <span style={{ 
                fontSize: '9.5px', 
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : '#71717A',
                letterSpacing: '0.01em'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
