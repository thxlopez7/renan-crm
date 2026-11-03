import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { OwnerDashboard } from './OwnerDashboard';
import { ScheduleView } from './ScheduleView';
import { CashView } from './CashView';
import { ClientsView } from './ClientsView';
import { SettingsView } from './SettingsView';
import { TrendingUp, Calendar, Receipt, Users, Sliders } from 'lucide-react';
import '../../styles/admin.css';

export function ExecutiveSuite() {
  const { userRole, kpis } = useClub();
  const isOwner = userRole === 'owner';
  const [selectedSection, setActiveSection] = useState('schedule');
  const [highlightedTabId, setHighlightedTabId] = useState(null);

  // Agenda first: it is what reception uses all day. Panel and pricing are owner-only (RLS too).
  const sections = [
    { id: 'schedule', label: 'Agenda', fullLabel: 'Agenda de canchas', icon: Calendar, badge: kpis.pendingRequestsCount },
    { id: 'pos', label: 'Caja', fullLabel: 'Caja y cuentas', icon: Receipt },
    { id: 'players', label: 'Clientes', fullLabel: 'Clientes', icon: Users },
    { id: 'dashboard', label: 'Panel', fullLabel: 'Panel del dueño', icon: TrendingUp, ownerOnly: true },
    { id: 'catalog', label: 'Ajustes', fullLabel: 'Precios, stock y ajustes', icon: Sliders, ownerOnly: true }
  ].filter(item => isOwner || !item.ownerOnly);

  const activeSection = sections.some(item => item.id === selectedSection) ? selectedSection : sections[0].id;

  const go = (id) => {
    setActiveSection(id);
    if (id !== 'pos') setHighlightedTabId(null);
    window.scrollTo({ top: 0 });
  };

  const handleOpenPosTab = (tabId) => {
    setHighlightedTabId(tabId);
    setActiveSection('pos');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="crm-shell">
      <aside className="crm-sidebar hide-mobile">
        <div className="crm-sidebar-title">
          <span>Black Club</span>
          <strong>{isOwner ? 'Administración' : 'Recepción'}</strong>
        </div>
        <nav className="crm-sidebar-nav">
          {sections.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`crm-nav-item ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => go(item.id)}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.6} />
                <span>{item.fullLabel}</span>
                {item.badge > 0 && <span className="crm-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="crm-main">
        <div className="crm-content">
          {activeSection === 'schedule' && <ScheduleView onOpenPosTab={handleOpenPosTab} />}
          {activeSection === 'pos' && <CashView highlightedTabId={highlightedTabId} />}
          {activeSection === 'players' && <ClientsView />}
          {activeSection === 'dashboard' && <OwnerDashboard />}
          {activeSection === 'catalog' && <SettingsView />}
        </div>
      </main>

      <nav className="crm-tabbar show-mobile-flex" aria-label="Secciones">
        {sections.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`crm-tab ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => go(item.id)}
            >
              <span className="crm-tab-icon">
                <Icon size={21} strokeWidth={isActive ? 2.2 : 1.6} />
                {item.badge > 0 && <span className="crm-badge is-dot">{item.badge}</span>}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
