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
  Sliders
} from 'lucide-react';

export function ExecutiveSuite() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [highlightedTabId, setHighlightedTabId] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', fullLabel: 'Dashboard Ejecutivo', icon: TrendingUp },
    { id: 'schedule', label: 'Agenda', fullLabel: 'Agenda de Canchas', icon: Calendar },
    { id: 'pos', label: 'POS', fullLabel: 'Terminal POS (Cuentas)', icon: Receipt },
    { id: 'players', label: 'Clientes CRM', fullLabel: 'Directorio de Clientes (CRM)', icon: Users },
    { id: 'catalog', label: 'Catálogo', fullLabel: 'Catálogo & Tarifas', icon: Sliders }
  ];

  const handleOpenPosTab = (tabId) => {
    setHighlightedTabId(tabId);
    setActiveSection('pos');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)', width: '100%' }}>
      {/* Mobile Top Sub-Nav Bar (Screens < 769px) */}
      <nav 
        className="show-mobile-only"
        style={{
          backgroundColor: '#09090B',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: '56px',
          zIndex: 80,
          padding: '8px 12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isActive ? '#FFFFFF' : '#111113',
                  color: isActive ? '#09090B' : '#A1A1AA',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 120ms ease'
                }}
              >
                <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} color={isActive ? '#09090B' : '#71717A'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Suite Layout with Desktop Sidebar */}
      <div style={{ display: 'flex', flex: 1, width: '100%' }}>
        {/* Fixed Desktop Sidebar (Hidden on Mobile) */}
        <aside 
          className="crm-desktop-sidebar hide-mobile"
          style={{ 
            width: '260px', 
            backgroundColor: 'rgba(9, 9, 11, 0.88)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px 16px',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div>
            <div style={{ padding: '0 8px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '18px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
                Suite Operativa
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                Recepción & Gestión
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
                      padding: '11px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? '#18181B' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#71717A',
                      fontSize: '12.5px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 120ms ease',
                      borderLeft: isActive ? '3px solid #FFFFFF' : '3px solid transparent'
                    }}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2 : 1.5} color={isActive ? '#FFFFFF' : '#71717A'} />
                    <span>{item.fullLabel}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Desktop Sidebar Footer */}
          <div style={{ 
            padding: '14px', 
            backgroundColor: '#111113', 
            borderRadius: '6px', 
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            color: '#71717A'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="status-dot emerald"></span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Caja & Canchas Activas</span>
            </div>
            <div>Terminal operativa · Moneda: Gs.</div>
          </div>
        </aside>

        {/* Content View Area */}
        <main style={{ 
          flex: 1, 
          padding: '16px 12px 90px', 
          overflowY: 'auto', 
          backgroundColor: 'transparent',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {activeSection === 'dashboard' && <ExecutiveDashboard onNavigate={setActiveSection} />}
            {activeSection === 'schedule' && <MasterScheduleView onOpenPosTab={handleOpenPosTab} />}
            {activeSection === 'pos' && <POSTerminalView highlightedTabId={highlightedTabId} />}
            {activeSection === 'players' && <PlayersDirectoryView />}
            {activeSection === 'catalog' && <CatalogManagementView />}
          </div>
        </main>
      </div>
    </div>
  );
}
