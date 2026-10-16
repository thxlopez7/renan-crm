import React from 'react';
import { useClub } from '../context/ClubContext';
import { formatGs } from '../utils/formatters';
import { 
  Building2, 
  Smartphone, 
  RotateCcw, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Layers
} from 'lucide-react';

export function ExecutiveTopBar({ viewMode, setViewMode }) {
  const { kpis, resetToSeedData } = useClub();

  return (
    <header className="executive-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '52px', backgroundColor: '#070709', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 90 }}>
      {/* Brand & Concept Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            backgroundColor: '#121216', 
            border: '1px solid #C5A880', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: '#C5A880' }}>B</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', color: '#F4F4F6' }}>BLACK CLUB</span>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', color: '#C5A880', borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: '8px' }}>ELITE</span>
            </div>
            <div style={{ fontSize: '9.5px', color: '#71717A', letterSpacing: '0.08em' }}>PARAGUAY · HOSPITALIDAD & PÁDEL</div>
          </div>
        </div>

        {/* Live sync indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span className="status-dot emerald"></span>
          <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: '#34D399', letterSpacing: '0.06em' }}>STORE REACTIVO SINCRONIZADO</span>
        </div>

        {/* Location Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#A1A1AA' }}>
          <MapPin size={12} strokeWidth={1.5} color="#A1A1AA" />
          <span>A 2 cuadras de la ruta principal</span>
        </div>
      </div>

      {/* Center/Right: View Switcher & Demo Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Quick KPI preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="tracking-luxury" style={{ fontSize: '9px' }}>FACTURACIÓN HOY</div>
            <div className="font-tabular" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C5A880' }}>
              {formatGs(kpis.totalRevenueToday)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tracking-luxury" style={{ fontSize: '9px' }}>OCUPACIÓN</div>
            <div className="font-tabular" style={{ fontSize: '12.5px', fontWeight: 600, color: '#38BDF8' }}>
              {kpis.occupancyRate}%
            </div>
          </div>
        </div>

        {/* Mode Switcher Segmented Control */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#121216', 
          padding: '3px', 
          borderRadius: '6px', 
          border: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
          <button
            onClick={() => setViewMode('public')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'public' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'public' ? '#070709' : '#A1A1AA',
              transition: 'all 150ms ease'
            }}
          >
            <Smartphone size={13} strokeWidth={1.5} />
            <span>PORTAL SOCIO</span>
          </button>

          <button
            onClick={() => setViewMode('executive')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'executive' ? '#C5A880' : 'transparent',
              color: viewMode === 'executive' ? '#070709' : '#A1A1AA',
              transition: 'all 150ms ease'
            }}
          >
            <Building2 size={13} strokeWidth={1.5} />
            <span>SUITE DIRECCIÓN · CRM & POS</span>
          </button>
        </div>

        {/* Reset Demo Data button */}
        <button
          onClick={resetToSeedData}
          title="Restablecer escenario y datos de prueba"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#71717A',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#F4F4F6'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#71717A'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <RotateCcw size={12} strokeWidth={1.5} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
