import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { clubNow } from '../../utils/clubTime';
import { PaymentSheet } from './PaymentSheet';
import { CashRegisterBar } from './CashRegisterBar';
import '../../styles/booking.css';
import '../../styles/admin.css';

function Stepper({ value, onChange, label, max = 8 }) {
  return (
    <div className="bk-stepper" aria-label={label}>
      <button type="button" aria-label={`Quitar ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)}><Minus size={16} /></button>
      <span>{value}</span>
      <button type="button" aria-label={`Agregar ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}><Plus size={16} /></button>
    </div>
  );
}

function ProductPicker({ onAdd }) {
  const { menuItems } = useClub();
  const categories = useMemo(() => [...new Set(menuItems.map(m => m.category))], [menuItems]);
  const [category, setCategory] = useState('Todo');
  const [query, setQuery] = useState('');
  const [lastAdded, setLastAdded] = useState(null);

  const visible = menuItems.filter(m =>
    (category === 'Todo' || m.category === category) &&
    m.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const add = (item) => {
    onAdd(item);
    setLastAdded(item.id);
    setTimeout(() => setLastAdded(current => (current === item.id ? null : current)), 700);
  };

  return (
    <div className="cash-picker">
      <div className="cash-search">
        <Search size={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto" aria-label="Buscar producto" />
      </div>
      <div className="ag-chips cash-cats">
        {['Todo', ...categories].map(c => (
          <button key={c} type="button" className={`ag-chip ${c === category ? 'is-active' : ''}`} onClick={() => setCategory(c)}>
            {c.split(' & ')[0]}
          </button>
        ))}
      </div>
      <div className="cash-products">
        {visible.map(item => (
          <button
            key={item.id}
            type="button"
            className={`cash-product ${lastAdded === item.id ? 'is-added' : ''}`}
            disabled={item.available === false || item.stock === 0}
            onClick={() => add(item)}
          >
            <span className="cash-product-name">{item.name}</span>
            <span className="cash-product-price">{item.available === false || item.stock === 0 ? 'Sin stock' : formatGs(item.price)}</span>
          </button>
        ))}
        {visible.length === 0 && <p className="bk-hint">No hay productos con ese nombre.</p>}
      </div>
    </div>
  );
}

function TabSheet({ tab, onClose, onCharge }) {
  const { calculateTabBalances, addItemToTab, updateTabItemQty, updateTabEquipment, bookings } = useClub();
  const [picking, setPicking] = useState(false);
  const balances = calculateTabBalances(tab);
  const booking = bookings.find(b => b.id === tab.linkedBookingId);
  const isOpen = tab.status === 'open';

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  return (
    <div className="bk-sheet-backdrop" onClick={onClose}>
      <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="tab-title" onClick={(e) => e.stopPropagation()}>
        <div className="bk-sheet-handle" />
        <div className="bk-sheet-head">
          <div>
            <h3 id="tab-title" className="bk-sheet-title">{tab.clientName}</h3>
            <p className="bk-hint">
              {tab.isWalkin ? 'Venta de barra' : tab.courtName}
              {booking ? ` · ${booking.startTime} a ${booking.endTime}` : ''}
              {!isOpen && ` · cobrada ${tab.settledAt || ''} (${tab.paymentMethod})`}
            </p>
          </div>
          <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
        </div>

        {picking ? (
          <>
            <ProductPicker onAdd={(item) => addItemToTab(tab.id, item, 1)} />
            <button type="button" className="bk-primary" style={{ marginTop: 12 }} onClick={() => setPicking(false)}>
              Listo · {formatGs(balances.netPending)}
            </button>
          </>
        ) : (
          <>
            <div className="bk-summary">
              {!tab.isWalkin && (
                <div className="bk-summary-row"><span>Cancha</span><strong>{formatGs(balances.courtBase)}</strong></div>
              )}
              {!tab.isWalkin && (
                <div className="bk-extra-row">
                  <div>Paletas<small>{formatGs(tab.racketUnitFee)} c/u</small></div>
                  {isOpen
                    ? <Stepper value={tab.racketCount} max={4} label="paletas" onChange={(v) => updateTabEquipment(tab.id, { racketCount: v })} />
                    : <strong>{tab.racketCount}</strong>}
                </div>
              )}
              {!tab.isWalkin && (
                <div className="bk-extra-row">
                  <div>Tubos de pelotas<small>{formatGs(tab.ballTubeUnitFee)} c/u</small></div>
                  {isOpen
                    ? <Stepper value={tab.ballTubeCount} max={6} label="tubos" onChange={(v) => updateTabEquipment(tab.id, { ballTubeCount: v })} />
                    : <strong>{tab.ballTubeCount}</strong>}
                </div>
              )}
              {tab.items.map(item => (
                <div key={item.id} className="bk-extra-row">
                  <div>{item.name}<small>{formatGs(item.price)} c/u · {formatGs(item.price * item.qty)}</small></div>
                  {isOpen
                    ? <Stepper value={item.qty} max={50} label={item.name} onChange={(v) => updateTabItemQty(tab.id, item.id, v - item.qty)} />
                    : <strong>×{item.qty}</strong>}
                </div>
              ))}
              {balances.depositDeduction > 0 && (
                <div className="bk-summary-row"><span>Seña ya pagada</span><strong>−{formatGs(balances.depositDeduction)}</strong></div>
              )}
              <div className="bk-summary-row bk-summary-total"><span>{isOpen ? 'A cobrar' : 'Total cobrado'}</span><strong>{formatGs(balances.netPending)}</strong></div>
            </div>

            {!isOpen && tab.invoiceRuc && (
              <p className="bk-hint" style={{ marginBottom: 12 }}>Factura: {tab.invoiceName} · RUC {tab.invoiceRuc}</p>
            )}

            {isOpen && (
              <div className="bk-stack">
                <button type="button" className="bk-secondary" onClick={() => setPicking(true)}>
                  <ShoppingBag size={17} /> Agregar consumo
                </button>
                <button type="button" className="bk-primary" disabled={balances.netPending <= 0 && tab.items.length === 0 && tab.isWalkin} onClick={() => onCharge(tab, balances.netPending)}>
                  Cobrar {formatGs(balances.netPending)}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function CashView({ highlightedTabId }) {
  const { tabs, bookings, calculateTabBalances, openWalkinTab } = useClub();
  const [filter, setFilter] = useState('open');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(highlightedTabId || null);
  const [charging, setCharging] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const today = clubNow().date;

  useEffect(() => { if (highlightedTabId) setSelectedId(highlightedTabId); }, [highlightedTabId]);

  const bookingOf = (tab) => bookings.find(b => b.id === tab.linkedBookingId);

  const visible = useMemo(() => tabs
    .filter(t => (filter === 'open' ? t.status === 'open' : t.status === 'settled' && t.cashedDate === today))
    // Open tabs of future bookings are not charged yet: show today's play and walk-ins
    .filter(t => filter !== 'open' || t.isWalkin || !bookingOf(t) || bookingOf(t).date <= today)
    .filter(t => t.clientName.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (bookingOf(a)?.startTime || a.openedAt || '').localeCompare(bookingOf(b)?.startTime || b.openedAt || '')),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [tabs, bookings, filter, query, today]);

  const totalOpen = visible.reduce((sum, t) => sum + (filter === 'open' ? calculateTabBalances(t).netPending : 0), 0);
  const totalToday = tabs.filter(t => t.status === 'settled' && t.cashedDate === today)
    .reduce((sum, t) => sum + calculateTabBalances(t).netPending, 0);
  const selected = tabs.find(t => t.id === selectedId);

  // Walk-in bar sale: opens straight into the product picker
  const startWalkin = () => setSelectedId(openWalkinTab(query.trim() || 'Venta de barra'));

  return (
    <div className="ag">
      <CashRegisterBar refreshKey={refreshKey} tabs={tabs} />

      <div className="ag-summary" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="ag-stat"><strong>{formatGs(totalOpen)}</strong><span>pendiente de cobro</span></div>
        <div className="ag-stat"><strong>{formatGs(totalToday)}</strong><span>cobrado hoy</span></div>
      </div>

      <div className="cash-toolbar">
        <div className="bk-segment" style={{ gridTemplateColumns: '1fr 1fr', flex: 1 }}>
          <button type="button" className={filter === 'open' ? 'is-active' : ''} onClick={() => setFilter('open')}>Por cobrar</button>
          <button type="button" className={filter === 'settled' ? 'is-active' : ''} onClick={() => setFilter('settled')}>Cobradas hoy</button>
        </div>
        <button type="button" className="ag-btn is-primary" onClick={startWalkin}><Plus size={16} /> Venta</button>
      </div>

      <div className="cash-search">
        <Search size={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre" aria-label="Buscar cuenta" />
      </div>

      <div className="cash-list">
        {visible.length === 0 && (
          <div className="bk-empty">
            <strong>{filter === 'open' ? 'No hay cuentas por cobrar' : 'Todavía no se cobró nada hoy'}</strong>
            {filter === 'open' ? 'Las reservas de hoy aparecen acá cuando llegan los jugadores.' : ''}
          </div>
        )}
        {visible.map(tab => {
          const booking = bookingOf(tab);
          const { netPending } = calculateTabBalances(tab);
          return (
            <button key={tab.id} type="button" className={`cash-tab ${tab.id === highlightedTabId ? 'is-highlight' : ''}`} onClick={() => setSelectedId(tab.id)}>
              <div style={{ minWidth: 0 }}>
                <div className="cash-tab-name">{tab.clientName}</div>
                <div className="cash-tab-meta">
                  {tab.isWalkin ? 'Venta de barra' : tab.courtName?.replace(/\s*\(.*\)/, '')}
                  {booking && ` · ${booking.startTime}–${booking.endTime}`}
                  {booking?.status === 'Jugando' && ' · jugando'}
                  {tab.items.length > 0 && (() => {
                    const count = tab.items.reduce((sum, i) => sum + i.qty, 0);
                    return ` · ${count} ${count === 1 ? 'consumo' : 'consumos'}`;
                  })()}
                  {filter === 'settled' && ` · ${tab.paymentMethod}`}
                </div>
              </div>
              <div className="cash-tab-amount">{formatGs(netPending)}</div>
              <ChevronRight size={18} color="#71717A" />
            </button>
          );
        })}
      </div>

      {selected && !charging && (
        <TabSheet tab={selected} onClose={() => setSelectedId(null)} onCharge={(tab, total) => setCharging({ tab, total })} />
      )}
      {charging && (
        <PaymentSheet
          tab={charging.tab}
          total={charging.total}
          onClose={() => { setCharging(null); setSelectedId(null); }}
          onPaid={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}
