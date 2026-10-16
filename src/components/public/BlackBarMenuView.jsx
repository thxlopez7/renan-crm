import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  UtensilsCrossed, 
  Wine, 
  Clock, 
  ShoppingBag, 
  Check, 
  X, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  Minus,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export function BlackBarMenuView() {
  const { menuItems, tabs, addItemToTab } = useClub();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = [
    'all',
    'Gastronomía Tercer Tiempo',
    'Burgers y Cocina Nocturna',
    'Cervecería y Coctelería',
    'Hidratación Deportiva y Pro-Shop'
  ];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.category === selectedCategory);

  // Active open tabs to which clients can link orders
  const activeTabs = tabs.filter(t => t.status === 'open');

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateCartQty = (itemId, delta) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === itemId) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const cartTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const cartItemCount = cart.reduce((acc, i) => acc + i.qty, 0);

  const handleSendOrder = (e) => {
    e.preventDefault();
    if (!selectedTabId && activeTabs.length > 0) {
      alert('Por favor seleccione una pista activa o mesa de destino.');
      return;
    }

    const targetTabId = selectedTabId || (activeTabs[0] ? activeTabs[0].id : null);

    if (targetTabId) {
      cart.forEach(item => {
        addItemToTab(targetTabId, item, item.qty);
      });
    }

    setOrderSuccess(true);
    setTimeout(() => {
      setCart([]);
      setIsOrderDrawerOpen(false);
      setOrderSuccess(false);
    }, 2000);
  };

  return (
    <div>
      {/* Editorial Header Banner */}
      <div 
        className="card-obsidian"
        style={{
          position: 'relative',
          padding: '40px 32px',
          marginBottom: '32px',
          backgroundImage: 'linear-gradient(to right, rgba(7, 7, 9, 0.95) 40%, rgba(7, 7, 9, 0.4) 100%), url(/images/lounge_bar.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="status-dot emerald"></span>
            <span className="tracking-luxury" style={{ color: '#C5A880' }}>
              BLACKBAR & LOUNGE GOURMET
            </span>
            <span style={{ fontSize: '11px', color: '#71717A' }}>·</span>
            <span style={{ fontSize: '12px', color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
              HORARIO OFICIAL 17:00 A 00:00
            </span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Gastronomía Ejecutiva & Servicio a Pista
          </h2>

          <p style={{ fontSize: '13.5px', color: '#A1A1AA', marginTop: '10px', lineHeight: 1.5 }}>
            Carta diseñada para el post-partido y encuentros corporativos. Todo pedido realizado desde esta carta puede imputarse directamente a la cuenta corriente de su pista o mesa del salón.
          </p>
        </div>
      </div>

      {/* Categories Bar & Floating Cart Trigger */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            const label = cat === 'all' ? 'Toda la Carta' : cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isSelected ? '#1E1E26' : '#111115',
                  color: isSelected ? '#FFFFFF' : '#71717A',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 150ms ease'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Cart Trigger Button */}
        {cartItemCount > 0 && (
          <button
            onClick={() => setIsOrderDrawerOpen(true)}
            className="btn-bronze"
            style={{ padding: '8px 16px', fontSize: '12.5px' }}
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
            <span>Comanda ({cartItemCount}) · {formatGs(cartTotal)}</span>
          </button>
        )}
      </div>

      {/* Menu Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredItems.map(item => {
          const inCart = cart.find(i => i.id === item.id);

          return (
            <div
              key={item.id}
              className="card-obsidian"
              style={{
                backgroundColor: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="tracking-luxury" style={{ color: '#C5A880', fontSize: '9.5px' }}>
                    {item.tag || item.category}
                  </span>
                  <div className="font-tabular" style={{ fontSize: '15px', fontWeight: 700, color: '#F4F4F6' }}>
                    {formatGs(item.price)}
                  </div>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#F4F4F6', marginBottom: '6px' }}>
                  {item.name}
                </h4>

                <p style={{ fontSize: '12.5px', color: '#A1A1AA', lineHeight: 1.45, marginBottom: '16px' }}>
                  {item.description}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#71717A' }}>
                  Disponibilidad en barra
                </span>

                {inCart ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="btn-secondary"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                    >
                      -
                    </button>
                    <span className="font-tabular" style={{ fontSize: '13px', fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>
                      {inCart.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="btn-secondary"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Plus size={13} strokeWidth={1.5} />
                    <span>Agregar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Comanda Drawer */}
      {isOrderDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsOrderDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: '#0D0D11'
            }}>
              <div>
                <div className="tracking-luxury">SERVICIO A PISTA & BAR</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6' }}>
                  Comanda Integrada al POS
                </h3>
              </div>
              <button onClick={() => setIsOrderDrawerOpen(false)} className="btn-ghost" style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {orderSuccess ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid #10B981',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Check size={24} strokeWidth={2} color="#10B981" />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#F4F4F6' }}>
                    Comanda Imputada al POS
                  </h4>
                  <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '6px' }}>
                    Los artículos han sido cargados directamente en la cuenta corriente de recepción.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendOrder} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Select Destination Tab / Court */}
                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                      IMPUTAR A CUENTA / PISTA ACTIVA
                    </label>
                    <select
                      value={selectedTabId}
                      onChange={(e) => setSelectedTabId(e.target.value)}
                      className="select-luxury"
                    >
                      {activeTabs.map(tab => (
                        <option key={tab.id} value={tab.id}>
                          {tab.courtName} · {tab.clientName}
                        </option>
                      ))}
                      <option value="salon-table">Mesa en Salón BlackBar (Mesa 04)</option>
                    </select>
                    <div style={{ fontSize: '11px', color: '#71717A', marginTop: '5px' }}>
                      El pedido se reflejará al instante en la terminal administrativa.
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                      DETALLE DE ARTÍCULOS
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {cart.map(item => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            backgroundColor: '#121216',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '4px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                            <div className="font-tabular" style={{ fontSize: '12px', color: '#A1A1AA' }}>
                              {formatGs(item.price)} x {item.qty} = {formatGs(item.price * item.qty)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, -1)}
                              className="btn-secondary"
                              style={{ width: '26px', height: '26px', padding: 0 }}
                            >
                              -
                            </button>
                            <span className="font-tabular" style={{ fontSize: '13px', minWidth: '16px', textAlign: 'center' }}>
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, 1)}
                              className="btn-secondary"
                              style={{ width: '26px', height: '26px', padding: 0 }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div style={{ 
                    borderTop: '1px solid rgba(255,255,255,0.08)', 
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div className="tracking-luxury">TOTAL COMANDA</div>
                      <div style={{ fontSize: '12px', color: '#A1A1AA' }}>A liquidar al cierre del encuentro</div>
                    </div>
                    <div className="font-tabular" style={{ fontSize: '20px', fontWeight: 700, color: '#F4F4F6' }}>
                      {formatGs(cartTotal)}
                    </div>
                  </div>

                  {/* Send Button */}
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                    <span>ENVIAR COMANDA A RECEPCIÓN</span>
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
