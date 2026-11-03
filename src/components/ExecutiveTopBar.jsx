import React, { useEffect, useState } from 'react';
import { CloudOff, LayoutGrid, LogOut, RefreshCw, Store, UserRound } from 'lucide-react';
import { useClub } from '../context/ClubContext';

// One quiet bar for both worlds: brand on the left, the staff switch on the right
export function ExecutiveTopBar({ viewMode, setViewMode }) {
  const { user, userRole, syncStatus, pendingCount, retrySync, setShowAuthModal, signOutStaff } = useClub();
  const isPublic = viewMode === 'public';
  const [scrolled, setScrolled] = useState(false);

  // Over the hero the bar is transparent; once the page scrolls it gets a solid backdrop
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToCrm = () => (user ? setViewMode('executive') : setShowAuthModal(true));

  const handleSignOut = async () => {
    await signOutStaff();
    setViewMode('public');
  };

  return (
    <header className={`topbar ${isPublic ? 'is-public' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
      <button type="button" className="topbar-brand" onClick={() => setViewMode('public')} aria-label="Ir al inicio">
        <img src="/images/logo_black_club.png" alt="" width="30" height="30" />
        <span className="topbar-word">Black Club</span>
        {!isPublic && <span className="topbar-role">{userRole === 'owner' ? 'Dirección' : 'Recepción'}</span>}
      </button>

      <div className="topbar-actions">
        {!isPublic && syncStatus === 'offline' && (
          <span className="topbar-pill is-warn"><CloudOff size={14} /> Sin conexión</span>
        )}
        {!isPublic && syncStatus !== 'offline' && pendingCount > 0 && (
          <button type="button" className="topbar-pill is-warn" onClick={retrySync}>
            <RefreshCw size={14} /> {pendingCount} por sincronizar
          </button>
        )}

        {isPublic ? (
          <button type="button" className="topbar-btn" onClick={goToCrm}>
            {user ? <LayoutGrid size={15} /> : <UserRound size={15} />}
            <span>{user ? 'Ir al CRM' : 'Staff'}</span>
          </button>
        ) : (
          <>
            <button type="button" className="topbar-btn" onClick={() => setViewMode('public')}>
              <Store size={15} /> <span className="hide-on-xs">Ver web</span>
            </button>
            <button type="button" className="topbar-icon" onClick={handleSignOut} aria-label={`Cerrar sesión de ${user?.email || 'staff'}`} title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
