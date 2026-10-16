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
  Clock, 
  Share2, 
  Phone, 
  ShieldCheck 
} from 'lucide-react';

export function PublicPortal() {
  const { kpis } = useClub();
  const [activeTab, setActiveTab] = useState('courts');

  const navItems = [
    { id: 'courts', label: 'Pádel (Pistas & Reservas)', icon: Calendar },
    { id: 'bar', label: 'Bar y Gastronomía (Menú)', icon: UtensilsCrossed },
    { id: 'team', label: 'BlackTeam (Academia)', icon: Award },
    { id: 'gym', label: 'BlackGym (Fitness Center)', icon: Dumbbell },
    { id: 'tournaments', label: 'Eventos & Torneos', icon: Trophy }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 80px', width: '100%' }}>
      {/* Club Brand Presentation & Real-Time Operational Indicators */}
      <section style={{ padding: '36px 0 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tracking-luxury" style={{ color: '#C5A880' }}>
                CLUB DEPORTIVO, SOCIAL Y GASTRONÓMICO
              </span>
              <span style={{ fontSize: '11px', color: '#71717A' }}>·</span>
              <span style={{ fontSize: '11px', color: '#A1A1AA', letterSpacing: '0.04em' }}>PARAGUAY</span>
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              BLACK CLUB <span style={{ color: '#C5A880', fontWeight: 300 }}>ELITE</span>
            </h1>

            <p style={{ fontSize: '14px', color: '#A1A1AA', marginTop: '8px', maxWidth: '780px', lineHeight: 1.5 }}>
              Ecosistema de hospitalidad privada y alto rendimiento deportivo. Pistas de pádel panorámicas World Padel Tour, carta gastronómica ejecutiva, academia de competición y centro de fitness integral.
            </p>
          </div>

          {/* Operational Status Badges Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '12px' 
          }}>
            {/* Padel Status */}
            <div style={{ 
              backgroundColor: '#111115', 
              border: '1px solid rgba(255, 255, 255, 0.07)', 
              borderRadius: '4px', 
              padding: '12px 14px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="status-dot emerald"></span>
                <span className="tracking-luxury" style={{ fontSize: '9px' }}>PISTAS DE PÁDEL</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F6' }}>
                3 Pistas Operativas
              </div>
              <div className="font-tabular" style={{ fontSize: '11.5px', color: '#A1A1AA', marginTop: '2px' }}>
                {kpis.courtsInPlayCount} en juego · Turnos de 90 min
              </div>
            </div>

            {/* BlackBar Status */}
            <div style={{ 
              backgroundColor: '#111115', 
              border: '1px solid rgba(255, 255, 255, 0.07)', 
              borderRadius: '4px', 
              padding: '12px 14px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="status-dot bronze"></span>
                <span className="tracking-luxury" style={{ fontSize: '9px' }}>BAR & GASTRONOMÍA</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F6' }}>
                Cocina & Salón Abiertos
              </div>
              <div className="font-tabular" style={{ fontSize: '11.5px', color: '#A1A1AA', marginTop: '2px' }}>
                Horario: 17:00 a 00:00
              </div>
            </div>

            {/* BlackGym Status */}
            <div style={{ 
              backgroundColor: '#111115', 
              border: '1px solid rgba(255, 255, 255, 0.07)', 
              borderRadius: '4px', 
              padding: '12px 14px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="status-dot blue"></span>
                <span className="tracking-luxury" style={{ fontSize: '9px' }}>BLACKGYM FITNESS</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F6' }}>
                Musculación & Biostrength
              </div>
              <div className="font-tabular" style={{ fontSize: '11.5px', color: '#A1A1AA', marginTop: '2px' }}>
                Lun-Vie 7-12 / 14-21 · Sáb 8-13
              </div>
            </div>

            {/* Geographic Location */}
            <div style={{ 
              backgroundColor: '#111115', 
              border: '1px solid rgba(255, 255, 255, 0.07)', 
              borderRadius: '4px', 
              padding: '12px 14px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <MapPin size={11} strokeWidth={1.5} color="#A1A1AA" />
                <span className="tracking-luxury" style={{ fontSize: '9px' }}>UBICACIÓN DEL COMPLEJO</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F6' }}>
                A 2 cuadras de la ruta principal
              </div>
              <div style={{ fontSize: '11.5px', color: '#71717A', marginTop: '2px' }}>
                Estacionamiento privado vigilado
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <nav style={{ 
        display: 'flex', 
        gap: '8px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        margin: '28px 0 32px',
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
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : '#71717A',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #C5A880' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 150ms ease'
              }}
            >
              <Icon size={15} strokeWidth={1.5} color={isActive ? '#C5A880' : '#71717A'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Modules */}
      <main>
        {activeTab === 'courts' && <CourtsBookingView />}
        {activeTab === 'bar' && <BlackBarMenuView />}
        {activeTab === 'team' && <BlackTeamView />}
        {activeTab === 'gym' && <BlackGymView />}
        {activeTab === 'tournaments' && <TournamentsView />}
      </main>

      {/* Institutional Luxury Footer */}
      <footer style={{ 
        marginTop: '80px', 
        paddingTop: '36px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        color: '#71717A',
        fontSize: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, color: '#F4F4F6' }}>BLACK CLUB ELITE</span>
            <span>·</span>
            <span>Paraguay</span>
          </div>
          <div>Acceso a 2 cuadras de la ruta principal. Valet Parking & Seguridad 24/7.</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a 
            href="https://instagram.com/blackclubparaguay" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A1A1AA', textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C5A880', textDecoration: 'none' }}
          >
            <Phone size={14} strokeWidth={1.5} />
            <span>Concierge Directo</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
