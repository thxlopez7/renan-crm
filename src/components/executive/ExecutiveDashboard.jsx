import React from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  TrendingUp, 
  Calendar, 
  Receipt, 
  Users, 
  Clock, 
  UtensilsCrossed, 
  ShieldAlert, 
  ChevronRight,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function ExecutiveDashboard({ onNavigate }) {
  const { kpis, bookings, tabs, selectedDate } = useClub();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <div className="tracking-luxury" style={{ color: '#C5A880' }}>
          DIRECCIÓN GENERAL · CENTRO DE CONTROL EJECUTIVO
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', marginTop: '2px' }}>
          Monitoreo Operativo & Financiero
        </h2>
        <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '4px' }}>
          Consolidación en tiempo real del estado de pistas, recaudación y comandas gastronómicas.
        </p>
      </div>

      {/* 4 Executive KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '20px' 
      }}>
        {/* KPI 1: Facturación Total del Día */}
        <div className="card-obsidian" style={{ padding: '24px', backgroundColor: '#121216' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="tracking-luxury">FACTURACIÓN CONCILIADA HOY</span>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '4px', 
              backgroundColor: 'rgba(197, 168, 128, 0.1)', 
              border: '1px solid rgba(197, 168, 128, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={14} strokeWidth={1.5} color="#C5A880" />
            </div>
          </div>

          <div className="font-tabular" style={{ fontSize: '28px', fontWeight: 800, color: '#F4F4F6', marginBottom: '12px' }}>
            {formatGs(kpis.totalRevenueToday)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span>Pádel & Equipamiento:</span>
              <span className="font-tabular" style={{ color: '#F4F4F6', fontWeight: 600 }}>{formatGs(kpis.courtRevenueToday)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span>BlackBar & Gastronomía:</span>
              <span className="font-tabular" style={{ color: '#C5A880', fontWeight: 600 }}>{formatGs(kpis.barRevenueToday)}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Tasa de Ocupación de Pistas */}
        <div className="card-obsidian" style={{ padding: '24px', backgroundColor: '#121216' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="tracking-luxury">OCUPACIÓN DE PISTAS</span>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '4px', 
              backgroundColor: 'rgba(56, 189, 248, 0.1)', 
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={14} strokeWidth={1.5} color="#38BDF8" />
            </div>
          </div>

          <div className="font-tabular" style={{ fontSize: '28px', fontWeight: 800, color: '#38BDF8', marginBottom: '12px' }}>
            {kpis.occupancyRate}%
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span>Turnos Reservados:</span>
              <span className="font-tabular" style={{ color: '#F4F4F6', fontWeight: 600 }}>{kpis.activeBookingsCount} de {kpis.totalSlotsPossible} bloques</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span>Pistas Actualmente en Juego:</span>
              <span className="font-tabular" style={{ color: '#10B981', fontWeight: 600 }}>{kpis.courtsInPlayCount} pistas</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Saldo en Cuentas Abiertas */}
        <div className="card-obsidian" style={{ padding: '24px', backgroundColor: '#121216' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="tracking-luxury">SALDO EN CUENTAS ABIERTAS</span>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '4px', 
              backgroundColor: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Receipt size={14} strokeWidth={1.5} color="#F59E0B" />
            </div>
          </div>

          <div className="font-tabular" style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B', marginBottom: '12px' }}>
            {formatGs(kpis.openTabsTotal)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span>Cuentas por Liquidar en POS:</span>
              <span className="font-tabular" style={{ color: '#F4F4F6', fontWeight: 600 }}>
                {tabs.filter(t => t.status === 'open').length} activas
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span>Estado Financiero:</span>
              <span style={{ color: '#FCD34D' }}>En consumo activo</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Monitor de Operaciones */}
        <div className="card-obsidian" style={{ padding: '24px', backgroundColor: '#121216' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="tracking-luxury">MONITOR DE OPERACIONES</span>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '4px', 
              backgroundColor: 'rgba(244, 63, 94, 0.1)', 
              border: '1px solid rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={14} strokeWidth={1.5} color="#F43F5E" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
            <span className="font-tabular" style={{ fontSize: '28px', fontWeight: 800, color: '#F43F5E' }}>
              {kpis.pendingDepositsCount}
            </span>
            <span style={{ fontSize: '12px', color: '#A1A1AA' }}>señas pendientes</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span>Mesas Solicitadas en Bar:</span>
              <span className="font-tabular" style={{ color: '#C5A880', fontWeight: 600 }}>
                {kpis.barTableRequestsCount} mesas post-partido
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span>Pistas en Juego:</span>
              <span className="font-tabular" style={{ color: '#34D399', fontWeight: 600 }}>
                {kpis.courtsInPlayCount} pistas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Highlights & Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Quick action 1: Master Schedule preview */}
        <div 
          onClick={() => onNavigate('schedule')}
          className="card-obsidian"
          style={{ 
            padding: '24px', 
            backgroundColor: '#121216', 
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} strokeWidth={1.5} color="#C5A880" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#F4F4F6' }}>
                Gestión de Agenda Maestra
              </span>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} color="#A1A1AA" />
          </div>
          <p style={{ fontSize: '12.5px', color: '#A1A1AA', lineHeight: 1.45 }}>
            Visualice el estado de las 3 pistas en tiempo real. Asigne abonos fijos semanales, confirme señas bancarias recibidas y habilite turnos en pista.
          </p>
        </div>

        {/* Quick action 2: POS terminal preview */}
        <div 
          onClick={() => onNavigate('pos')}
          className="card-obsidian"
          style={{ 
            padding: '24px', 
            backgroundColor: '#121216', 
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={16} strokeWidth={1.5} color="#38BDF8" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#F4F4F6' }}>
                Terminal POS & Split-Bill
              </span>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} color="#A1A1AA" />
          </div>
          <p style={{ fontSize: '12.5px', color: '#A1A1AA', lineHeight: 1.45 }}>
            Liquidación rápida en barra y recepción. Cargue consumos a pistas activas con un solo clic y divida la cuenta equitativamente entre los 4 jugadores.
          </p>
        </div>
      </div>
    </div>
  );
}
