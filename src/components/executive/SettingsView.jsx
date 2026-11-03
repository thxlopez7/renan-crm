import React, { useMemo, useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import '../../styles/booking.css';
import '../../styles/admin.css';

const parseGs = (value) => Number(String(value).replace(/\D/g, '')) || 0;
const showGs = (value) => (value || value === 0 ? Number(value).toLocaleString('es-PY') : '');

function SavedBadge({ show }) {
  if (!show) return null;
  return <span className="set-saved"><Check size={14} /> Guardado</span>;
}

function useFlash() {
  const [flash, setFlash] = useState(false);
  return [flash, () => { setFlash(true); setTimeout(() => setFlash(false), 1800); }];
}

function ClubSection() {
  const { pricingConfig, updateClubSettings } = useClub();
  const [form, setForm] = useState({
    openHour: pricingConfig.openHour,
    closeHour: pricingConfig.closeHour,
    holdExpiresMinutes: pricingConfig.holdExpiresMinutes,
    bookingWindowDays: pricingConfig.bookingWindowDays,
    cancelNoticeHours: pricingConfig.cancelNoticeHours,
    racketRentalFee: pricingConfig.racketRentalFee,
    ballTubeFee: pricingConfig.ballTubeFee
  });
  const [saved, flash] = useFlash();
  const [error, setError] = useState('');
  const set = (key, value) => setForm({ ...form, [key]: value });

  const save = () => {
    setError('');
    if (Number(form.closeHour) <= Number(form.openHour)) return setError('La hora de cierre tiene que ser después de la apertura.');
    updateClubSettings(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)])));
    flash();
  };

  const hours = Array.from({ length: 25 }, (_, h) => h);

  return (
    <section className="set-card">
      <div className="set-head"><h3>Horarios y reservas online</h3><SavedBadge show={saved} /></div>
      <div className="ag-row">
        <div className="bk-field">
          <label htmlFor="set-open">Abre</label>
          <select id="set-open" className="ag-select" value={form.openHour} onChange={(e) => set('openHour', e.target.value)}>
            {hours.slice(0, 24).map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
          </select>
        </div>
        <div className="bk-field">
          <label htmlFor="set-close">Cierra (último turno termina)</label>
          <select id="set-close" className="ag-select" value={form.closeHour} onChange={(e) => set('closeHour', e.target.value)}>
            {hours.slice(1).map(h => <option key={h} value={h}>{h === 24 ? '00:00' : `${String(h).padStart(2, '0')}:00`}</option>)}
          </select>
        </div>
      </div>
      <div className="ag-row">
        <div className="bk-field">
          <label htmlFor="set-hold">Minutos para confirmar una solicitud</label>
          <input id="set-hold" inputMode="numeric" value={form.holdExpiresMinutes} onChange={(e) => set('holdExpiresMinutes', parseGs(e.target.value))} />
        </div>
        <div className="bk-field">
          <label htmlFor="set-window">Días de anticipación online</label>
          <input id="set-window" inputMode="numeric" value={form.bookingWindowDays} onChange={(e) => set('bookingWindowDays', parseGs(e.target.value))} />
        </div>
      </div>
      <div className="ag-row">
        <div className="bk-field">
          <label htmlFor="set-cancel">Cancelación online hasta (horas antes)</label>
          <input id="set-cancel" inputMode="numeric" value={form.cancelNoticeHours} onChange={(e) => set('cancelNoticeHours', parseGs(e.target.value))} />
        </div>
        <div />
      </div>
      <div className="ag-row">
        <div className="bk-field">
          <label htmlFor="set-racket">Alquiler de paleta (Gs.)</label>
          <input id="set-racket" inputMode="numeric" value={showGs(form.racketRentalFee)} onChange={(e) => set('racketRentalFee', parseGs(e.target.value))} />
        </div>
        <div className="bk-field">
          <label htmlFor="set-balls">Tubo de pelotas (Gs.)</label>
          <input id="set-balls" inputMode="numeric" value={showGs(form.ballTubeFee)} onChange={(e) => set('ballTubeFee', parseGs(e.target.value))} />
        </div>
      </div>
      {error && <div className="bk-error">{error}</div>}
      <button type="button" className="bk-primary" onClick={save}>Guardar horarios y precios</button>
    </section>
  );
}

function CourtsSection() {
  const { courts, updateCourt } = useClub();
  const [rates, setRates] = useState(() => Object.fromEntries(courts.map(c => [c.id, c.rate])));
  const [savedId, setSavedId] = useState(null);

  const save = (court) => {
    updateCourt(court.id, { rate: parseGs(rates[court.id]) });
    setSavedId(court.id);
    setTimeout(() => setSavedId(null), 1800);
  };

  return (
    <section className="set-card">
      <div className="set-head"><h3>Canchas</h3></div>
      <p className="bk-hint" style={{ marginTop: -6, marginBottom: 12 }}>
        Precio por hora de la cancha completa. Un turno de 1 h 30 cobra 1,5 veces este valor.
      </p>
      <div className="bk-stack">
        {courts.map(court => (
          <div key={court.id} className="set-court">
            <div className="set-court-top">
              <strong>{court.name}</strong>
              <SavedBadge show={savedId === court.id} />
            </div>
            <div className="set-court-row">
              <div className="bk-field" style={{ marginBottom: 0 }}>
                <label htmlFor={`rate-${court.id}`}>Gs. por hora</label>
                <input id={`rate-${court.id}`} inputMode="numeric" value={showGs(rates[court.id])} onChange={(e) => setRates({ ...rates, [court.id]: parseGs(e.target.value) })} />
              </div>
              <button type="button" className="ag-btn" onClick={() => save(court)}>Guardar</button>
            </div>
            <span className="bk-hint">
              1 h {formatGs(parseGs(rates[court.id]))} · 1 h 30 {formatGs(Math.round(parseGs(rates[court.id]) * 1.5))} · 2 h {formatGs(parseGs(rates[court.id]) * 2)}
            </span>
            <label className="bk-check" style={{ justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-primary)' }}>
                {court.status === 'operational' ? 'Habilitada para reservas online' : 'Fuera de servicio (no aparece en la web)'}
              </span>
              <input
                type="checkbox"
                checked={court.status === 'operational'}
                onChange={(e) => updateCourt(court.id, { status: e.target.checked ? 'operational' : 'maintenance' })}
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

function MenuSection() {
  const { menuItems, updateMenuItem, addMenuItem } = useClub();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', category: '', price: '', stock: '' });
  const categories = useMemo(() => [...new Set(menuItems.map(m => m.category))], [menuItems]);

  const visible = menuItems.filter(m => `${m.name} ${m.category}`.toLowerCase().includes(query.trim().toLowerCase()));

  const startEdit = (item) => {
    setAdding(false);
    setEditing(item.id);
    setDraft({ name: item.name, category: item.category, price: item.price, stock: item.stock });
  };

  const saveEdit = (item) => {
    updateMenuItem({ ...item, name: draft.name.trim() || item.name, category: draft.category || item.category, price: parseGs(draft.price), stock: parseGs(draft.stock) });
    setEditing(null);
  };

  const saveNew = () => {
    if (!draft.name.trim() || !draft.category.trim() || !parseGs(draft.price)) return;
    addMenuItem({ name: draft.name.trim(), category: draft.category.trim(), price: parseGs(draft.price), stock: parseGs(draft.stock), available: true });
    setAdding(false);
    setDraft({ name: '', category: '', price: '', stock: '' });
  };

  const form = (onSave, onCancel) => (
    <div className="set-edit">
      <div className="bk-field"><label>Nombre</label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
      <div className="bk-field">
        <label>Categoría</label>
        <input list="menu-categories" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
        <datalist id="menu-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
      </div>
      <div className="ag-row">
        <div className="bk-field"><label>Precio (Gs.)</label><input inputMode="numeric" value={showGs(draft.price)} onChange={(e) => setDraft({ ...draft, price: parseGs(e.target.value) })} /></div>
        <div className="bk-field"><label>Stock</label><input inputMode="numeric" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: parseGs(e.target.value) })} /></div>
      </div>
      <div className="ag-row">
        <button type="button" className="bk-secondary" onClick={onCancel}>Cancelar</button>
        <button type="button" className="bk-primary" onClick={onSave}>Guardar</button>
      </div>
    </div>
  );

  return (
    <section className="set-card">
      <div className="set-head">
        <h3>Bar y productos</h3>
        <button type="button" className="ag-btn" onClick={() => { setEditing(null); setAdding(true); setDraft({ name: '', category: categories[0] || '', price: '', stock: '' }); }}>
          <Plus size={16} /> Producto
        </button>
      </div>
      {adding && form(saveNew, () => setAdding(false))}
      <div className="cash-search" style={{ marginBottom: 10 }}>
        <Search size={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto" aria-label="Buscar producto" />
      </div>
      <div className="set-menu">
        {visible.map(item => (
          editing === item.id ? <div key={item.id}>{form(() => saveEdit(item), () => setEditing(null))}</div> : (
            <div key={item.id} className={`set-menu-row ${item.available === false ? 'is-off' : ''}`}>
              <button type="button" className="set-menu-main" onClick={() => startEdit(item)}>
                <span className="set-menu-name">{item.name}</span>
                <span className="set-menu-meta">
                  {formatGs(item.price)} · {item.stock <= 5 ? <b style={{ color: item.stock === 0 ? '#F87171' : '#FBBF24' }}>stock {item.stock}</b> : `stock ${item.stock}`}
                </span>
              </button>
              <label className="set-switch" aria-label={`${item.name} disponible`}>
                <input type="checkbox" checked={item.available !== false} onChange={(e) => updateMenuItem({ ...item, available: e.target.checked })} />
                <span />
              </label>
            </div>
          )
        ))}
      </div>
    </section>
  );
}

export function SettingsView() {
  return (
    <div className="ag set-view">
      <div>
        <h2 className="bk-title" style={{ fontSize: 34 }}>Ajustes del club</h2>
        <p className="bk-subtitle">Los cambios se aplican al instante en la web y en la agenda.</p>
      </div>
      <ClubSection />
      <CourtsSection />
      <MenuSection />
    </div>
  );
}
