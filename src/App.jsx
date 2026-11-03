import React, { useState } from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { ExecutiveTopBar } from './components/ExecutiveTopBar';
import { PublicPortal } from './components/public/PublicPortal';
import { ExecutiveSuite } from './components/executive/ExecutiveSuite';
import { StaffLoginModal } from './components/auth/StaffLoginModal';
import { SyncErrorToast } from './components/common/SyncErrorToast';

const VIEW_KEY = 'bc_view_mode';

export function AppContent() {
  // Staff stay on the CRM across reloads; the session loads async, so the view is derived from it
  const [preferredView, setPreferredView] = useState(() => {
    try { return localStorage.getItem(VIEW_KEY) || 'public'; } catch { return 'public'; }
  });
  const { user, showAuthModal, setShowAuthModal } = useClub();
  const viewMode = user ? preferredView : 'public';

  const setViewMode = (mode) => {
    setPreferredView(mode);
    try { localStorage.setItem(VIEW_KEY, mode); } catch { /* private mode */ }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', color: '#F4F4F6' }}>
      {/* Executive Switcher TopBar */}
      <ExecutiveTopBar viewMode={viewMode} setViewMode={setViewMode} />

      {/* Dynamic View Mode */}
      {viewMode === 'public' ? (
        <PublicPortal />
      ) : (
        <ExecutiveSuite />
      )}

      <SyncErrorToast />

      {/* Staff Authentication Modal */}
      <StaffLoginModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setViewMode('executive')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ClubProvider>
      <AppContent />
    </ClubProvider>
  );
}
