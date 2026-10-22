import React, { useState, useEffect } from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { ExecutiveTopBar } from './components/ExecutiveTopBar';
import { PublicPortal } from './components/public/PublicPortal';
import { ExecutiveSuite } from './components/executive/ExecutiveSuite';
import { StaffLoginModal } from './components/auth/StaffLoginModal';

export function AppContent() {
  const [viewMode, setViewMode] = useState('public'); // 'public' | 'executive'
  const { user, showAuthModal, setShowAuthModal } = useClub();

  // If staff logs out while in executive view, gracefully fallback to public portal
  useEffect(() => {
    if (!user && viewMode === 'executive') {
      setViewMode('public');
    }
  }, [user, viewMode]);

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
