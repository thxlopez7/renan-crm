import React from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  TrendingUp, 
  Calendar, 
  Receipt, 
  Users, 
  ChevronRight
} from 'lucide-react';

export function ExecutiveDashboard({ onNavigate }) {
  const { kpis, bookings, tabs, selectedDate } = useClub();

  const todayBookings = bookings.filter(b => b.date === selectedDate);
  const openTabs = tabs.filter(t => t.status === 'open');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header - Direct and concise */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
            Centro de Control
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '2px' }}>
            Monitoreo en Tiempo Real
          </h2>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', 
        gap: '12px' 
      }}>
        {/* KPI 1: Facturación Total del Día */}
        <div style={{ padding: '18px', backgroundColor: '#111113', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#71717A', textTransform: 'uppercase' }}>
              Facturación Conciliada
            </span>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '6px', 
              backgroundColor: '#18181B', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <TrendingUp size={14} color="#FFFFFF" />
            </div>
          </div>

          <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
            {formatGs(kpis.totalRevenueToday)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717A' }}>
              <span>Pádel:</span>
              <span className="font-tabular" style={{ color: '#D4D4D8', fontWeight: 600 }}>{formatGs(kpis.courtRevenueToday)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717A' }}>
              <span>Bar & Merch:</span>
              <span className="font-tabular" style={{ color: '#D4D4D8', fontWeight: 600 }}>{formatGs(kpis.barRevenueToday)}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Tasa de Ocupación */}
        <div style={{ padding: '18px', backgroundColor: '#111113', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#71717A', textTransform: 'uppercase' }}>
              Ocupación Canchas
            </span>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '6px', 
              backgroundColor: '#18181B', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calendar size={14} color="#38BDF8" />
            </div>
          </div>

          <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#38BDF8', marginBottom: '8px' }}>
            {kpis.occupancyRate}%
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717A' }}>
              <span>Turnos:</span>
              <span className="font-tabular" style={{ color: '#D4D4D8', fontWeight: 600 }}>{kpis.activeBookingsCount} de {kpis.totalSlotsPossible}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717A' }}>
              <span>En Juego Ahora:</span>
              <span className="font-tabular" style={{ color: '#10B981', fontWeight: 600 }}>{kpis.courtsInPlayCount} activas</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Cuentas Abiertas */}
        <div style={{ padding: '18px', backgroundColor: '#111113', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#71717A', textTransform: 'uppercase' }}>
              Cuentas por Liquidar
            </span>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '6px', 
              backgroundColor: '#18181B', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Receipt size={14} color="#F59E0B" />
            </div>
          </div>

          <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#F59E0B', marginBottom: '8px' }}>
            {formatGs(kpis.openTabsTotal)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717A' }}>
              <span>Cuentas Abiertas:</span>
              <span className="font-tabular" style={{ color: '#D4D4D8', fontWeight: 600 }}>{openTabs.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717A' }}>
              <span>Señas Previas:</span>
              <span className="font-tabular" style={{ color: '#10B981', fontWeight: 600 }}>{formatGs(kpis.collectedDepositsToday)}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Turnos Totales Hoy */}
        <div style={{ padding: '18px', backgroundColor: '#111113', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#71717A', textTransform: 'uppercase' }}>
              Actividad del Día
            </span>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '6px', 
              backgroundColor: '#18181B', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Users size={14} color="#E4E4E7" />
            </div>
          </div>

          <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
            {todayBookings.length}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717A' }}>
              <span>Abonos Fijos:</span>
              <span className="font-tabular" style={{ color: '#D4D4D8', fontWeight: 600 }}>
                {todayBookings.filter(b => b.category === 'Abono Fijo Semanal').length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717A' }}>
              <span>Clases BlackTeam:</span>
              <span className="font-tabular" style={{ color: '#38BDF8', fontWeight: 600 }}>
                {todayBookings.filter(b => b.category === 'Clase BlackTeam').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Action Navigation Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '10px' }}>
        <button
          onClick={() => onNavigate('schedule')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            backgroundColor: '#111113',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 120ms ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} color="#FFFFFF" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Agenda de Canchas</div>
              <div style={{ fontSize: '11px', color: '#71717A' }}>Ver grilla y canchas en vivo</div>
            </div>
          </div>
          <ChevronRight size={15} color="#71717A" />
        </button>

        <button
          onClick={() => onNavigate('pos')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            backgroundColor: '#111113',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 120ms ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={16} color="#FFFFFF" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Caja & Cuentas</div>
              <div style={{ fontSize: '11px', color: '#71717A' }}>{openTabs.length} cuentas pendientes</div>
            </div>
          </div>
          <ChevronRight size={15} color="#71717A" />
        </button>
      </div>

      {/* Live Operations Monitor: En Cancha vs Tercer Tiempo */}
      <div style={{ backgroundColor: '#111113', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
              Monitor Operativo
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
              Cuentas Activas (En Cancha & Tercer Tiempo)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('pos')}
            className="btn-ghost"
            style={{ fontSize: '11.5px', color: '#FFFFFF', padding: '4px 10px' }}
          >
            Ver Cuentas
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {openTabs.map(tab => {
            const isInPlay = tab.activityStatus === 'en_cancha' || tab.activityStatus === 'en_pista';

            return (
              <div
                key={tab.id}
                onClick={() => onNavigate('pos')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#161619',
                  border: isInPlay ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        fontSize: '9px', 
                        fontWeight: 700, 
                        padding: '1px 6px', 
                        borderRadius: '3px',
                        textTransform: 'uppercase',
                        backgroundColor: isInPlay ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isInPlay ? '#10B981' : '#F59E0B',
                        border: isInPlay ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      {isInPlay ? 'En Cancha' : 'En Barra · 3er Tiempo'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{tab.courtName}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#A1A1AA', marginTop: '3px' }}>
                    {tab.clientName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-tabular" style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                    {formatGs(tab.netPending || 0)}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#71717A' }}>
                    {tab.items?.length || 0} consumos
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
