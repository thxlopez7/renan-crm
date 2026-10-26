import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Check,
  Calculator
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

  const [playerCount, setPlayerCount] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta');
  const [settleSuccessMsg, setSettleSuccessMsg] = useState(false);

  const displayedTabs = tabs.filter(t => t.status === activeTabFilter);
  const currentTab = tabs.find(t => t.id === selectedTabId) || displayedTabs[0] || null;

  const currentBalances = currentTab ? calculateTabBalances(currentTab) : null;
  const courtPerPlayer = currentBalances ? Math.round(currentBalances.courtBase / playerCount) : 0;
  const totalPerPlayer = currentBalances ? Math.round(currentBalances.netPending / playerCount) : 0;

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
          Terminal de Cobro & Caja
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '2px' }}>
          Cuentas Corrientes & Liquidación de Canchas
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
                <div style={{ fontSize: '11px', color: '#71717A' }}>Deduciendo seña previa si la hubiera</div>
              </div>
              <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
                {formatGs(currentBalances.netPending)}
              </div>
            </div>
          </div>

          {/* Calculadora por Jugadores y Acción de Pago (si la cuenta está abierta) */}
          {currentTab.status === 'open' && (
            <div style={{ backgroundColor: '#111113', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Calculadora por Cantidad de Jugadores */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calculator size={14} color="#FFFFFF" />
                    <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#FFFFFF', textTransform: 'uppercase' }}>
                      Calculadora de Pago por Jugadores
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#A1A1AA' }}>
                    {playerCount} {playerCount === 1 ? 'jugador' : 'jugadores'}
                  </span>
                </div>

                {/* Controles de selección de jugadores */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#D4D4D8', fontWeight: 600 }}>Jugaron:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setPlayerCount(prev => Math.max(1, prev - 1))}
                      className="btn-secondary"
                      style={{ minHeight: '34px', width: '34px', padding: 0, justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={playerCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setPlayerCount(isNaN(val) || val < 1 ? 1 : val);
                      }}
                      className="input-luxury font-tabular"
                      style={{ width: '60px', textAlign: 'center', fontSize: '15px', fontWeight: 800, padding: '4px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPlayerCount(prev => prev + 1)}
                      className="btn-secondary"
                      style={{ minHeight: '34px', width: '34px', padding: 0, justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>

                  {/* Botones rápidos (2, 4, 6, 8 jugadores) */}
                  <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                    {[2, 4, 6, 8].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPlayerCount(num)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: playerCount === num ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                          backgroundColor: playerCount === num ? '#FFFFFF' : '#161619',
                          color: playerCount === num ? '#09090B' : '#A1A1AA',
                          transition: 'all 120ms ease'
                        }}
                      >
                        {num} jug.
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumen del cálculo por jugador */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '8px' }}>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#161619', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)' 
                  }}>
                    <div style={{ fontSize: '10px', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Solo Cancha ({formatGs(currentBalances.courtBase)})
                    </div>
                    <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                      {formatGs(courtPerPlayer)}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#71717A', marginTop: '2px' }}>
                      por cada jugador
                    </div>
                  </div>

                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#161619', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(16, 185, 129, 0.35)' 
                  }}>
                    <div style={{ fontSize: '10px', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Cuenta ({formatGs(currentBalances.netPending)})
                    </div>
                    <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 800, color: '#34D399', marginTop: '4px' }}>
                      {formatGs(totalPerPlayer)}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#71717A', marginTop: '2px' }}>
                      cancha + consumos por jugador
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Método de Pago
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
