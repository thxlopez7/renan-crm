import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { PAYMENT_METHODS } from '../../services/clubService';
import { formatGs } from '../../utils/formatters';
import { isValidRuc } from '../../utils/ruc';

const parseGs = (value) => Number(String(value).replace(/\D/g, '')) || 0;
const showGs = (value) => (value ? Number(value).toLocaleString('es-PY') : '');

export function PaymentSheet({ tab, total, onClose, onPaid }) {
  const { payTab } = useClub();
  const [rows, setRows] = useState([{ method: 'Efectivo', amount: total }]);
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const paid = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const cash = rows.filter(r => r.method === 'Efectivo').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const remaining = total - paid;
  const change = Math.max(0, paid - total);
  const changeTooBig = change > cash;

  const updateRow = (index, patch) => setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  // Typical club split: the four players pay their share with whatever they have
  const splitInto = (parts) => {
    const share = Math.floor(total / parts / 1000) * 1000;
    const last = total - share * (parts - 1);
    setRows(Array.from({ length: parts }, (_, i) => ({ method: 'Efectivo', amount: i === parts - 1 ? last : share })));
  };

  const addRow = () => setRows([...rows, { method: 'Transferencia', amount: Math.max(0, remaining) }]);

  const handleConfirm = async () => {
    setError('');
    if (remaining > 0) return setError(`Faltan ${formatGs(remaining)} para cubrir la cuenta.`);
    if (changeTooBig) return setError('El vuelto solo puede salir del efectivo. Revisá los montos.');
    if (wantsInvoice) {
      if (!isValidRuc(ruc)) return setError('El RUC no es válido. Formato 1234567-8, con el dígito verificador.');
      if (razonSocial.trim().length < 2) return setError('Ingresá la razón social para la factura.');
    }
    setSaving(true);
    try {
      await payTab(tab.id, rows.filter(r => Number(r.amount) > 0), wantsInvoice ? { ruc: ruc.trim(), name: razonSocial.trim() } : {});
      setDone({ change });
      onPaid?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bk-sheet-backdrop" onClick={onClose}>
      <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="pay-title" onClick={(e) => e.stopPropagation()}>
        <div className="bk-sheet-handle" />
        {done ? (
          <div className="bk-success">
            <div className="bk-success-icon"><Check size={28} strokeWidth={2.5} /></div>
            <h3 id="pay-title" className="bk-sheet-title">Cuenta cobrada</h3>
            <p className="bk-subtitle">{tab.clientName} · {formatGs(total)}</p>
            {done.change > 0 && (
              <div className="bk-code" style={{ fontSize: 18 }}>Vuelto: {formatGs(done.change)}</div>
            )}
            {wantsInvoice && <p className="bk-hint" style={{ marginBottom: 12 }}>Factura a {razonSocial} · RUC {ruc}</p>}
            <button type="button" className="bk-primary" onClick={onClose}>Listo</button>
          </div>
        ) : (
          <>
            <div className="bk-sheet-head">
              <div>
                <h3 id="pay-title" className="bk-sheet-title">Cobrar {formatGs(total)}</h3>
                <p className="bk-hint">{tab.clientName}{tab.courtName ? ` · ${tab.courtName}` : ''}</p>
              </div>
              <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
            </div>

            <div className="ag-chips" style={{ marginBottom: 14 }}>
              <button type="button" className="ag-chip" onClick={() => setRows([{ method: 'Efectivo', amount: total }])}>Todo junto</button>
              <button type="button" className="ag-chip" onClick={() => splitInto(2)}>Dividir en 2</button>
              <button type="button" className="ag-chip" onClick={() => splitInto(4)}>Dividir en 4</button>
            </div>

            <div className="bk-stack" style={{ marginBottom: 12 }}>
              {rows.map((row, index) => (
                <div key={index} className="cash-pay-row">
                  <select
                    className="ag-select"
                    aria-label="Medio de pago"
                    value={row.method}
                    onChange={(e) => updateRow(index, { method: e.target.value })}
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input
                    className="cash-amount"
                    inputMode="numeric"
                    aria-label="Monto"
                    value={showGs(row.amount)}
                    onChange={(e) => updateRow(index, { amount: parseGs(e.target.value) })}
                  />
                  {rows.length > 1 && (
                    <button type="button" className="bk-icon-btn" aria-label="Quitar pago" onClick={() => setRows(rows.filter((_, i) => i !== index))}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="bk-secondary" onClick={addRow}><Plus size={16} /> Agregar otro medio de pago</button>
            </div>

            <div className="bk-summary">
              <div className="bk-summary-row"><span>Total</span><strong>{formatGs(total)}</strong></div>
              <div className="bk-summary-row"><span>Pagan</span><strong>{formatGs(paid)}</strong></div>
              {remaining > 0 && <div className="bk-summary-row" style={{ color: '#FBBF24' }}><span>Falta</span><strong style={{ color: '#FBBF24' }}>{formatGs(remaining)}</strong></div>}
              {change > 0 && <div className="bk-summary-row bk-summary-total"><span>Vuelto</span><strong>{formatGs(change)}</strong></div>}
            </div>

            <label className="bk-check">
              <input type="checkbox" checked={wantsInvoice} onChange={(e) => setWantsInvoice(e.target.checked)} />
              Quiere factura con RUC
            </label>
            {wantsInvoice && (
              <div className="ag-row">
                <div className="bk-field">
                  <label htmlFor="pay-ruc">RUC</label>
                  <input id="pay-ruc" value={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="1234567-8" inputMode="numeric" aria-invalid={ruc.length > 4 && !isValidRuc(ruc)} />
                </div>
                <div className="bk-field">
                  <label htmlFor="pay-name">Razón social</label>
                  <input id="pay-name" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Nombre o empresa" />
                </div>
              </div>
            )}

            {error && <div className="bk-error" role="alert"><AlertCircle size={16} style={{ flexShrink: 0 }} />{error}</div>}

            <button type="button" className="bk-primary" disabled={saving || remaining > 0} onClick={handleConfirm}>
              {saving ? <><Loader2 size={18} className="animate-spin" /> Cobrando…</> : remaining > 0 ? `Faltan ${formatGs(remaining)}` : 'Confirmar cobro'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
