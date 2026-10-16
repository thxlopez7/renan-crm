import React, { useState } from 'react';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { MasterScheduleView } from './MasterScheduleView';
import { POSTerminalView } from './POSTerminalView';
import { PlayersDirectoryView } from './PlayersDirectoryView';
import { CatalogManagementView } from './CatalogManagementView';
import { 
  TrendingUp, 
  Calendar, 
  Receipt, 
  Users, 
  Sliders, 
  ShieldCheck, 
  Building2,
  ChevronRight
} from 'lucide-react';

export function ExecutiveSuite() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [highlightedTabId, setHighlightedTabId] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: TrendingUp },
    { id: 'schedule', label: 'Agenda Maestra (Pistas)', icon: Calendar },
    { id: 'pos', label: 'Terminal POS (Cuentas)', icon: Receipt },
    { id: 'players', label: 'Directorio de Socios (CRM)', icon: Users },
    { id: 'catalog', label: 'Catálogo & Tarifas', icon: Sliders }
  ];

  const handleOpenPosTab = (tabId) => {
    setHighlightedTabId(tabId);
    setActiveSection('pos');
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 52px)', width: '100%' }}>
      {/* Fixed Executive Left Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#0A0A0D', 
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          <div style={{ padding: '0 8px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '18px' }}>
            <div className="tracking-luxury" style={{ color: '#C5A880' }}>SUITE ADMINISTRATIVA</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F4F4F6', marginTop: '2px' }}>
              BLACKCLUB RECEPCIÓN
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    if (item.id !== 'pos') setHighlightedTabId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: isActive ? '#191921' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#71717A',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 120ms ease',
                    borderLeft: isActive ? '3px solid #C5A880' : '3px solid transparent'
                  }}
                >
                  <Icon size={15} strokeWidth={1.5} color={isActive ? '#C5A880' : '#71717A'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div style={{ 
          padding: '14px', 
          backgroundColor: '#121216', 
          borderRadius: '4px', 
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '11px',
          color: '#71717A'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span className="status-dot emerald"></span>
            <span style={{ color: '#F4F4F6', fontWeight: 600 }}>Caja & Pistas Activas</span>
          </div>
          <div>Terminal autorizada para recepción y barra. Moneda: Gs.</div>
        </div>
      </aside>

      {/* Main Executive Content View */}
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', backgroundColor: '#070709' }}>
        {activeSection === 'dashboard' && <ExecutiveDashboard onNavigate={setActiveSection} />}
        {activeSection === 'schedule' && <MasterScheduleView onOpenPosTab={handleOpenPosTab} />}
        {activeSection === 'pos' && <POSTerminalView highlightedTabId={highlightedTabId} />}
        {activeSection === 'players' && <PlayersDirectoryView />}
        {activeSection === 'catalog' && <CatalogManagementView />}
      </main>
    </div>
  );
}
