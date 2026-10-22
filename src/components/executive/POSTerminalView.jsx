import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Check 
} from 'lucide-react';

export function POSTerminalView({ highlightedTabId }) {
  const { 
    tabs, 
    menuItems, 
    calculateTabBalances, 
    addItemToTab, 
    settleTab 
  } = useClub();

  const [activeTabFilter, setActiveTabFilter] = useState('open'); // 'open' | 'settled'
  const [selectedTabId, setSelectedTabId] = useState(() => {
    if (highlightedTabId) return highlightedTabId;
    const firstOpen = tabs.find(t => t.status === 'open');
    return firstOpen ? firstOpen.id : (tabs[0] ? tabs[0].id : null);
  });

  const [splitCount, setSplitCount] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta');
  const [settleSuccessMsg, setSettleSuccessMsg] = useState(false);

  const displayedTabs = tabs.filter(t => t.status === activeTabFilter);
  const currentTab = tabs.find(t => t.id === selectedTabId) || displayedTabs[0] || null;

  const currentBalances = currentTab ? calculateTabBalances(currentTab) : null;
  const splitAmount = currentBalances ? Math.round(currentBalances.netPending / splitCount) : 0;

  // Real Authentic Paraguayan Padel Club Items for Quick-Add Botonera
  const quickItems = [
    menuItems.find(i => i.id === 'menu-1') || { id: 'menu-1', name: 'Picada Black Club', price: 95000 },
    menuItems.find(i => i.id === 'menu-4') || { id: 'menu-4', name: 'Promo 2x1 Chopp', price: 25000 },
    menuItems.find(i => i.id === 'menu-5') || { id: 'menu-5', name: 'Balde x6 Stella Artois', price: 85000 },
    menuItems.find(i => i.id === 'menu-2') || { id: 'menu-2', name: 'Black Angus Burger', price: 55000 },
    menuItems.find(i => i.id === 'menu-8') || { id: 'menu-8', name: 'Gatorade Cool Blue', price: 15000 },
    menuItems.find(i => i.id === 'menu-10') || { id: 'menu-10', name: 'Tubo Bullpadel Pro', price: 65000 }
  ];

  const handleSettle = async () => {
    if (!currentTab) return;
    try {
      await settleTab(currentTab.id, paymentMethod);
      setSettleSuccessMsg(true);
      setTimeout(() => {
        setSettleSuccessMsg(false);
      }, 2500);
    } catch (err) {
      console.error('[POSTerminalView] Settle error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
          Terminal POS & Caja
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '2px' }}>
          Cuentas Corrientes & Liquidación
        </h2>
      </div>

      {/* Settle Feedback Banner */}
      {settleSuccessMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10B981',
          borderRadius: '6px',
          color: '#34D399',
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} strokeWidth={2.5} />
          <span>Cuenta liquidada exitosamente. Facturación diaria conciliada en caja.</span>
        </div>
      )}

      {/* Tabs Filter & Horizontal Selector */}
      <div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <button
            onClick={() => setActiveTabFilter('open')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              border: activeTabFilter === 'open' ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.06)',
              backgroundColor: activeTabFilter === 'open' ? '#FFFFFF' : 'transparent',
              color: activeTabFilter === 'open' ? '#09090B' : '#71717A',
              cursor: 'pointer',
              transition: 'all 120ms ease'
            }}
          >
            Abiertas ({tabs.filter(t => t.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveTabFilter('settled')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              border: activeTabFilter === 'settled' ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.06)',
              backgroundColor: activeTabFilter === 'settled' ? '#FFFFFF' : 'transparent',
              color: activeTabFilter === 'settled' ? '#09090B' : '#71717A',
              cursor: 'pointer',
              transition: 'all 120ms ease'
            }}
          >
            Liquidadas ({tabs.filter(t => t.status === 'settled').length})
          </button>
        </div>

        {/* Tab Cards Carousel with En Cancha vs Tercer Tiempo badges */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
          {displayedTabs.map(tab => {
            const isSelected = currentTab?.id === tab.id;
            const b = calculateTabBalances(tab);
            const isInPlay = tab.activityStatus === 'en_cancha' || tab.activityStatus === 'en_pista';

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTabId(tab.id)}
                style={{
                  minWidth: '200px',
                  padding: '12px 14px',
                  backgroundColor: isSelected ? '#18181C' : '#111113',
                  border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flexShrink: 0,
                  transition: 'all 120ms ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>
                    {tab.courtName}
                  </span>
                  {tab.status === 'open' ? (
                    <span style={{
                      fontSize: '8.5px',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                      backgroundColor: isInPlay ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: isInPlay ? '#10B981' : '#F59E0B',
                      border: isInPlay ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      {isInPlay ? 'En Cancha' : '3er Tiempo'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '8.5px', color: '#71717A' }}>Conciliada</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#A1A1AA' }}>
                  {tab.clientName}
                </div>
                <div className="font-tabular" style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                  {formatGs(b.netPending)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {currentTab && currentBalances ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Quick-Add Botonera Matrix */}
          {currentTab.status === 'open' && (
            <div style={{ backgroundColor: '#111113', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase', marginBottom: '10px' }}>
                Botonera Rápida de Comanda (1 Clic)
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))', 
                gap: '8px' 
              }}>
                {quickItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItemToTab(currentTab.id, item, 1)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#161619',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      transition: 'all 120ms ease'
                    }}
                  >
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <span className="font-tabular" style={{ fontSize: '11.5px', fontWeight: 700, color: '#E4E4E7' }}>
                      {formatGs(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab Consumption Details Card */}
          <div style={{ backgroundColor: '#111113', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: '#71717A', textTransform: 'uppercase' }}>
                  Cuenta Corriente
                </span>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#FFFFFF', marginTop: '1px' }}>
                  {currentTab.courtName} · {currentTab.clientName}
                </div>
              </div>

              {currentTab.status === 'open' ? (
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  backgroundColor: (currentTab.activityStatus === 'en_cancha' || currentTab.activityStatus === 'en_pista') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: (currentTab.activityStatus === 'en_cancha' || currentTab.activityStatus === 'en_pista') ? '#10B981' : '#F59E0B',
                  border: (currentTab.activityStatus === 'en_cancha' || currentTab.activityStatus === 'en_pista') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  {(currentTab.activityStatus === 'en_cancha' || currentTab.activityStatus === 'en_pista') ? 'En Cancha' : 'En Barra · 3er Tiempo'}
                </span>
              ) : (
                <span style={{ fontSize: '9.5px', color: '#71717A', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#18181B' }}>
                  Conciliada
                </span>
              )}
            </div>

            {/* Consumptions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#A1A1AA' }}>Alquiler de Cancha (1h):</span>
                <span className="font-tabular" style={{ fontWeight: 600, color: '#E4E4E7' }}>{formatGs(currentBalances.courtBase)}</span>
              </div>

              {currentBalances.depositDeduction > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#10B981' }}>
                  <span>Seña Previa Acreditada:</span>
                  <span className="font-tabular" style={{ fontWeight: 600 }}>- {formatGs(currentBalances.depositDeduction)}</span>
                </div>
              )}

              {currentBalances.racketCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#A1A1AA' }}>Alquiler Paletas ({currentTab.racketCount}):</span>
                  <span className="font-tabular" style={{ fontWeight: 600, color: '#E4E4E7' }}>{formatGs(currentBalances.racketCharge)}</span>
                </div>
              )}

              {currentBalances.ballTubeCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#A1A1AA' }}>Tubos Pelotas ({currentTab.ballTubeCount}):</span>
                  <span className="font-tabular" style={{ fontWeight: 600, color: '#E4E4E7' }}>{formatGs(currentBalances.ballTubeCharge)}</span>
                </div>
              )}

              {currentTab.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#FFFFFF' }}>{item.name}</span>
                    <span style={{ color: '#71717A', fontSize: '10.5px' }}>x{item.qty}</span>
                  </div>
                  <span className="font-tabular" style={{ fontWeight: 600, color: '#E4E4E7' }}>
                    {formatGs(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Balances Summary */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
                  Saldo Neto a Cobrar
                </div>
                <div style={{ fontSize: '11px', color: '#71717A' }}>Deduciendo seña de reserva</div>
              </div>
              <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
                {formatGs(currentBalances.netPending)}
              </div>
            </div>
          </div>

          {/* Split-Bill & Payment Action (If open) */}
          {currentTab.status === 'open' && (
            <div style={{ backgroundColor: '#111113', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Split count buttons */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
                    División Split-Bill
                  </div>
                  <span className="font-tabular" style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                    {formatGs(splitAmount)} <span style={{ fontSize: '10.5px', color: '#71717A', fontWeight: 400 }}>/ jugador</span>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setSplitCount(num)}
                      style={{
                        padding: '10px 0',
                        borderRadius: '6px',
                        border: splitCount === num ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: splitCount === num ? '#FFFFFF' : '#161619',
                        color: splitCount === num ? '#09090B' : '#A1A1AA',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 120ms ease'
                      }}
                    >
                      {num} {num === 1 ? 'Jugador' : 'Jugadores'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Método de Cobro
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {['Tarjeta', 'Efectivo', 'Transferencia Itaú'].map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '6px',
                        border: paymentMethod === m ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: paymentMethod === m ? '#1F1F24' : '#161619',
                        color: paymentMethod === m ? '#FFFFFF' : '#71717A',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 120ms ease'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settle Action Button - Pure White High Contrast Button */}
              <button
                onClick={handleSettle}
                className="btn-primary"
                style={{ width: '100%', minHeight: '50px', fontSize: '13.5px', marginTop: '4px' }}
              >
                <Check size={16} strokeWidth={2.5} />
                <span>Liquidar Cuenta ({formatGs(currentBalances.netPending)})</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#71717A' }}>
          No hay cuentas en este filtro.
        </div>
      )}
    </div>
  );
}
