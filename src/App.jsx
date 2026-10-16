import React, { useState } from 'react';
import { ClubProvider } from './context/ClubContext';
import { ExecutiveTopBar } from './components/ExecutiveTopBar';
import { PublicPortal } from './components/public/PublicPortal';
import { ExecutiveSuite } from './components/executive/ExecutiveSuite';

export function AppContent() {
  const [viewMode, setViewMode] = useState('public'); // 'public' | 'executive'

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#070709', color: '#F4F4F6' }}>
      {/* Executive Switcher TopBar */}
      <ExecutiveTopBar viewMode={viewMode} setViewMode={setViewMode} />

      {/* Dynamic View Mode */}
      {viewMode === 'public' ? (
        <PublicPortal />
      ) : (
        <ExecutiveSuite />
      )}
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
