import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, Lock, Unlock, X } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  PAYMENT_METHODS,
  describeServerError,
  fetchOpenRegister,
  fetchRegisterPayments,
  rpcCloseCashRegister,
  rpcOpenCashRegister
} from '../../services/clubService';
import { formatGs } from '../../utils/formatters';

const parseGs = (value) => Number(String(value).replace(/\D/g, '')) || 0;
const showGs = (value) => (value ? Number(value).toLocaleString('es-PY') : '');
const timeOf = (iso) => new Date(iso).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Asuncion' });

// Shift cash register: open with a float, close with a cash count against the expected amount
export function CashRegisterBar({ refreshKey, tabs }) {
  const [register, setRegister] = useState(null);
  const [payments, setPayments] = useState([]);
  const [sheet, setSheet] = useState(null); // 'open' | 'close' | 'summary'
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [closed, setClosed] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const live = isSupabaseConfigured();

  const load = useCallback(async () => {
    if (!live) return;
    try {
      const open = await fetchOpenRegister();
      setRegister(open);
      setPayments(open ? await fetchRegisterPayments(open.id) : []);
    } catch {
      // Shown as "caja cerrada"; the cash screen keeps working
    }
  }, [live]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const breakdown = PAYMENT_METHODS.map(method => ({
    method,
    total: payments.filter(p => p.method === method).reduce((sum, p) => sum + p.amount, 0)
  })).filter(b => b.total > 0);
  const collected = payments.reduce((sum, p) => sum + p.amount, 0);
  const changeGiven = [...new Set(payments.map(p => p.tab_id))]
    .reduce((sum, id) => sum + (tabs.find(t => t.id === id)?.changeGiven || 0), 0);
  const cashIn = breakdown.find(b => b.method === 'Efectivo')?.total || 0;
  const expectedCash = register ? register.openingBalance + cashIn - changeGiven : 0;

  const close = () => { setSheet(null); setError(''); setAmount(''); setNotes(''); setClosed(null); };

  const handleOpen = async () => {
    setSaving(true);
    setError('');
    try {
      const opened = live
        ? await rpcOpenCashRegister(parseGs(amount))
        : { id: 'demo', status: 'open', openedAt: new Date().toISOString(), openingBalance: parseGs(amount) };
      setRegister(opened);
      setPayments([]);
      close();
    } catch (err) {
      setError(describeServerError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    setSaving(true);
    setError('');
    try {
      const result = live
        ? await rpcCloseCashRegister(register.id, parseGs(amount), notes)
        : { ...register, status: 'closed', expectedCash, countedCash: parseGs(amount), cashDifference: parseGs(amount) - expectedCash, totalCollected: collected };
      setClosed(result);
      setRegister(null);
      setPayments([]);
    } catch (err) {
      setError(describeServerError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={`cash-register ${register ? 'is-open' : ''}`}>
        <div>
          <div className="cash-register-title">
            {register ? <Unlock size={15} /> : <Lock size={15} />}
            {register ? `Caja abierta desde las ${timeOf(register.openedAt)}` : 'Caja cerrada'}
          </div>
          <div className="cash-register-meta">
            {register
              ? `Cobrado: ${formatGs(collected)} · efectivo esperado ${formatGs(expectedCash)}`
              : 'Abrila al empezar el turno para llevar el arqueo.'}
          </div>
        </div>
        <button type="button" className={`ag-btn ${register ? '' : 'is-primary'}`} onClick={() => setSheet(register ? 'close' : 'open')}>
          {register ? 'Cerrar caja' : 'Abrir caja'}
        </button>
      </div>

      {sheet && (
        <div className="bk-sheet-backdrop" onClick={close}>
          <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="reg-title" onClick={(e) => e.stopPropagation()}>
            <div className="bk-sheet-handle" />
            <div className="bk-sheet-head">
              <h3 id="reg-title" className="bk-sheet-title">
                {closed ? 'Caja cerrada' : sheet === 'open' ? 'Abrir caja' : 'Cerrar caja'}
              </h3>
              <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={close}><X size={18} /></button>
            </div>

            {closed ? (
              <>
                <div className="bk-summary">
                  <div className="bk-summary-row"><span>Total cobrado</span><strong>{formatGs(closed.totalCollected)}</strong></div>
                  <div className="bk-summary-row"><span>Efectivo esperado</span><strong>{formatGs(closed.expectedCash)}</strong></div>
                  <div className="bk-summary-row"><span>Efectivo contado</span><strong>{formatGs(closed.countedCash)}</strong></div>
                  <div className="bk-summary-row bk-summary-total">
                    <span>Diferencia</span>
                    <strong style={{ color: closed.cashDifference === 0 ? '#34D399' : '#F87171' }}>
                      {closed.cashDifference > 0 ? '+' : ''}{formatGs(closed.cashDifference)}
                    </strong>
                  </div>
                </div>
                <button type="button" className="bk-primary" onClick={close}>Listo</button>
              </>
            ) : sheet === 'open' ? (
              <>
                <div className="bk-field">
                  <label htmlFor="reg-float">Fondo inicial en efectivo (Gs.)</label>
                  <input id="reg-float" inputMode="numeric" value={showGs(amount)} onChange={(e) => setAmount(parseGs(e.target.value))} placeholder="0" autoFocus />
                  <span className="bk-hint">El cambio con el que arranca el turno.</span>
                </div>
                {error && <div className="bk-error" role="alert"><AlertCircle size={16} />{error}</div>}
                <button type="button" className="bk-primary" disabled={saving} onClick={handleOpen}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : 'Abrir caja'}
                </button>
              </>
            ) : (
              <>
                <div className="bk-summary">
                  <div className="bk-summary-row"><span>Fondo inicial</span><strong>{formatGs(register.openingBalance)}</strong></div>
                  {breakdown.map(b => (
                    <div key={b.method} className="bk-summary-row"><span>{b.method}</span><strong>{formatGs(b.total)}</strong></div>
                  ))}
                  {changeGiven > 0 && <div className="bk-summary-row"><span>Vueltos dados</span><strong>−{formatGs(changeGiven)}</strong></div>}
                  <div className="bk-summary-row bk-summary-total"><span>Efectivo que debería haber</span><strong>{formatGs(expectedCash)}</strong></div>
                </div>
                <div className="bk-field">
                  <label htmlFor="reg-count">Efectivo contado en caja (Gs.)</label>
                  <input id="reg-count" inputMode="numeric" value={showGs(amount)} onChange={(e) => setAmount(parseGs(e.target.value))} placeholder="0" autoFocus />
                  {amount !== '' && (
                    <span className="bk-hint" style={{ color: parseGs(amount) === expectedCash ? '#34D399' : '#FBBF24' }}>
                      Diferencia: {formatGs(parseGs(amount) - expectedCash)}
                    </span>
                  )}
                </div>
                <div className="bk-field">
                  <label htmlFor="reg-notes">Observaciones (opcional)</label>
                  <input id="reg-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. faltante por vuelto mal dado" />
                </div>
                {error && <div className="bk-error" role="alert"><AlertCircle size={16} />{error}</div>}
                <button type="button" className="bk-primary" disabled={saving || amount === ''} onClick={handleClose}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : 'Cerrar caja'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
