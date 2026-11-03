import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';

// Shows writes the server rejected, so staff never assume a failed change was saved
export function SyncErrorToast() {
  const { syncError, clearSyncError } = useClub();

  useEffect(() => {
    if (!syncError) return;
    const timer = setTimeout(clearSyncError, 8000);
    return () => clearTimeout(timer);
  }, [syncError, clearSyncError]);

  if (!syncError) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'calc(100% - 32px)',
        maxWidth: '440px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '10px',
        backgroundColor: '#18181B',
        border: '1px solid rgba(239, 68, 68, 0.45)',
        color: '#F4F4F6',
        fontSize: '13px',
        lineHeight: 1.4,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)'
      }}
    >
      <AlertTriangle size={16} color="#F87171" style={{ flexShrink: 0, marginTop: '1px' }} />
      <span style={{ flex: 1 }}>{syncError}</span>
      <button
        onClick={clearSyncError}
        aria-label="Cerrar aviso"
        style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', padding: 0 }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
