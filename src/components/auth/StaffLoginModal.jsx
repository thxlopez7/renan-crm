import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  X, 
  Loader2, 
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export function StaffLoginModal({ isOpen, onClose, onSuccess }) {
  const { signInStaff } = useClub();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      await signInStaff(email, password);
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      console.error('[Auth Error]:', err);
      if (err.message && err.message.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else {
        setErrorMsg(err.message || 'Error al iniciar sesión.');
      }
    }
  };

  return (
    <div 
      className="drawer-backdrop" 
      onClick={onClose}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 100
      }}
    >
      <div 
        className="card-obsidian"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'rgba(14, 14, 17, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '12px',
          padding: '28px 24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
          position: 'relative'
        }}
      >
        {/* Back / Close Buttons */}
        <button
          onClick={onClose}
          className="btn-secondary"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            padding: '5px 10px',
            fontSize: '11px',
            gap: '5px',
            borderRadius: '4px'
          }}
          aria-label="Volver atrás"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          <span>Volver</span>
        </button>

        <button
          onClick={onClose}
          className="btn-ghost"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            padding: 0,
            justifyContent: 'center',
            borderRadius: '50%'
          }}
          aria-label="Cerrar modal"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#09090B',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(255, 255, 255, 0.1)',
            marginBottom: '12px'
          }}>
            <img 
              src="/images/logo_black_club.png" 
              alt="Black Club Elite" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
            />
          </div>

          <div className="tracking-luxury" style={{ fontSize: '9px', marginBottom: '4px' }}>
            SUITE ADMINISTRATIVA
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Acceso para Staff & Recepción
          </h2>
          <p style={{ fontSize: '12px', color: '#71717A', marginTop: '4px' }}>
            Ingresa con tu cuenta oficial para gestionar canchas, caja y socios.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: 'rgba(225, 29, 72, 0.12)',
            border: '1px solid rgba(225, 29, 72, 0.35)',
            borderRadius: '6px',
            color: '#FB7185',
            fontSize: '12px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: '6px' }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717A' }}>
                <Mail size={15} />
              </div>
              <input
                type="email"
                required
                autoFocus
                placeholder="staff@blackclub.com.py"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#09090B',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '0 12px 0 38px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: '6px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717A' }}>
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#09090B',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '0 38px 0 38px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#71717A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                minHeight: '44px',
                fontSize: '13px',
                fontWeight: 700,
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <span>Ingresar al CRM</span>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ width: '100%', minHeight: '38px', fontSize: '12px', color: '#A1A1AA', gap: '6px' }}
            >
              <ArrowLeft size={13} />
              <span>Volver al Portal Público</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
