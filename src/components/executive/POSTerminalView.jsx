import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Receipt, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Plus, 
  Minus, 
  Check, 
  Users, 
  UtensilsCrossed, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

export function POSTerminalView({ highlightedTabId }) {
  const { 
    tabs, 
    menuItems, 
    calculateTabBalances, 
    addItemToTab, 
    updateTabItemQty, 
    updateTabEquipment, 
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

  // High-rotation items for the Quick-Add matrix
  const quickItems = [
    menuItems.find(i => i.id === 'menu-9') || { id: 'menu-9', name: 'Chopp Stella Artois 500ml', price: 28000 },
    menuItems.find(i => i.id === 'menu-10') || { id: 'menu-10', name: 'Patagonia 24.7 IPA', price: 32000 },
    menuItems.find(i => i.id === 'menu-14') || { id: 'menu-14', name: 'Gatorade Cool Blue', price: 18000 },
    menuItems.find(i => i.id === 'menu-16') || { id: 'menu-16', name: 'Agua Alcalina Black', price: 15000 },
    menuItems.find(i => i.id === 'menu-5') || { id: 'menu-5', name: 'Black Angus Truffle Burger', price: 68000 },
    menuItems.find(i => i.id === 'menu-17') || { id: 'menu-17', name: 'Tubo Bullpadel Next Pro', price: 70000 }
  ];

  const handleSettle = () => {
    if (!currentTab) return;
    settleTab(currentTab.id, paymentMethod);
    setSettleSuccessMsg(true);
    setTimeout(() => {
      setSettleSuccessMsg(false);
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div className="tracking-luxury" style={{ color: '#C5A880' }}>
          TERMINAL PUNTO DE VENTA & LIQUIDACIÓN
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', marginTop: '2px' }}>
          Gestión de Cuentas Corrientes & Split-Bill
        </h2>
      </div>

      {/* Settle feedback banner */}
      {settleSuccessMsg && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10B981',
          borderRadius: '4px',
          color: '#34D399',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} strokeWidth={2} />
          <span>Cuenta liquidada y conciliada exitosamente. Facturación diaria actualizada.</span>
        </div>
      )}

      {/* Dual Column Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(300px, 360px) 1fr', 
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Open and Settled Tabs List */}
        <div className="card-obsidian" style={{ backgroundColor: '#0D0D11', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Subheader and Filter */}
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setActiveTabFilter('open')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: activeTabFilter === 'open' ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: activeTabFilter === 'open' ? 'rgba(197, 168, 128, 0.1)' : 'transparent',
                  color: activeTabFilter === 'open' ? '#C5A880' : '#71717A',
                  cursor: 'pointer'
                }}
              >
                Cuentas Abiertas ({tabs.filter(t => t.status === 'open').length})
              </button>

              <button
                onClick={() => setActiveTabFilter('settled')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: activeTabFilter === 'settled' ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: activeTabFilter === 'settled' ? '#1E1E26' : 'transparent',
                  color: activeTabFilter === 'settled' ? '#FFFFFF' : '#71717A',
                  cursor: 'pointer'
                }}
              >
                Liquidadas ({tabs.filter(t => t.status === 'settled').length})
              </button>
            </div>
          </div>

          {/* List of tabs */}
          <div style={{ maxHeight: '680px', overflowY: 'auto' }}>
            {displayedTabs.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#52525B', fontSize: '13px' }}>
                No hay cuentas en este estado.
              </div>
            ) : (
              displayedTabs.map(tab => {
                const isSelected = currentTab && currentTab.id === tab.id;
                const tabBalance = calculateTabBalances(tab);

                return (
                  <div
                    key={tab.id}
                    onClick={() => setSelectedTabId(tab.id)}
                    style={{
                      padding: '16px 18px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #C5A880' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#C5A880' : '#A1A1AA' }}>
                        {tab.courtName}
                      </span>
                      <span className="font-tabular" style={{ fontSize: '13.5px', fontWeight: 700, color: tab.status === 'open' ? '#F4F4F6' : '#71717A' }}>
                        {formatGs(tabBalance.netPending)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#F4F4F6' }}>
                        {tab.clientName}
                      </span>

                      {tab.barTableRequested && (
                        <span style={{ fontSize: '10px', color: '#C5A880', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <UtensilsCrossed size={10} strokeWidth={1.5} />
                          <span>Mesa Bar</span>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#71717A', marginTop: '4px' }}>
                      <Clock size={11} strokeWidth={1.5} />
                      <span>{tab.status === 'open' ? `Abierta a las ${tab.openedAt}` : `Liquidada con ${tab.paymentMethod}`}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Detail Statement, Quick-Add Matrix, Split-Bill & Settle */}
        {currentTab && currentBalances ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Account Statement Card */}
            <div className="card-obsidian" style={{ backgroundColor: '#111116', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tracking-luxury" style={{ color: '#C5A880' }}>
                      ESTADO DE CUENTA
                    </span>
                    <span className={`status-pill ${currentTab.status === 'open' ? 'emerald' : 'amber'}`}>
                      {currentTab.status === 'open' ? 'Cuenta Abierta' : 'Liquidada'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#F4F4F6', marginTop: '4px' }}>
                    {currentTab.clientName} · {currentTab.courtName}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tracking-luxury">SALDO NETO PENDIENTE</div>
                  <div className="font-tabular" style={{ fontSize: '24px', fontWeight: 800, color: currentTab.status === 'open' ? '#F4F4F6' : '#71717A' }}>
                    {formatGs(currentBalances.netPending)}
                  </div>
                </div>
              </div>

              {/* Itemized charges table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {/* Court Fee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#D4D4D8' }}>Cargo base uso de pista (90 min)</span>
                  <span className="font-tabular" style={{ fontWeight: 600 }}>{formatGs(currentBalances.courtBase)}</span>
                </div>

                {/* Deposit deduction */}
                {currentBalances.depositDeduction > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#38BDF8' }}>
                    <span>Deducción por seña entregada previa</span>
                    <span className="font-tabular" style={{ fontWeight: 600 }}>-{formatGs(currentBalances.depositDeduction)}</span>
                  </div>
                )}

                {/* Equipment Controls */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '10px 12px', 
                  backgroundColor: '#16161D', 
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>Alquiler Paletas Pro ({formatGs(currentTab.racketUnitFee || 30000)} c/u)</div>
                    <div className="font-tabular" style={{ fontSize: '12px', color: '#A1A1AA' }}>
                      Subtotal: {formatGs(currentBalances.racketCharge)}
                    </div>
                  </div>
                  {currentTab.status === 'open' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => updateTabEquipment(currentTab.id, { racketCount: Math.max(0, (currentTab.racketCount || 0) - 1) })}
                        className="btn-secondary"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        -
                      </button>
                      <span className="font-tabular" style={{ minWidth: '18px', textAlign: 'center', fontSize: '13px' }}>
                        {currentTab.racketCount || 0}
                      </span>
                      <button
                        onClick={() => updateTabEquipment(currentTab.id, { racketCount: (currentTab.racketCount || 0) + 1 })}
                        className="btn-secondary"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '10px 12px', 
                  backgroundColor: '#16161D', 
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>Tubo Pelotas Bullpadel Next Pro ({formatGs(currentTab.ballTubeUnitFee || 70000)} c/u)</div>
                    <div className="font-tabular" style={{ fontSize: '12px', color: '#A1A1AA' }}>
                      Subtotal: {formatGs(currentBalances.ballTubeCharge)}
                    </div>
                  </div>
                  {currentTab.status === 'open' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => updateTabEquipment(currentTab.id, { ballTubeCount: Math.max(0, (currentTab.ballTubeCount || 0) - 1) })}
                        className="btn-secondary"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        -
                      </button>
                      <span className="font-tabular" style={{ minWidth: '18px', textAlign: 'center', fontSize: '13px' }}>
                        {currentTab.ballTubeCount || 0}
                      </span>
                      <button
                        onClick={() => updateTabEquipment(currentTab.id, { ballTubeCount: (currentTab.ballTubeCount || 0) + 1 })}
                        className="btn-secondary"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Gastronomy Items */}
                {currentTab.items && currentTab.items.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <div className="tracking-luxury" style={{ marginBottom: '8px' }}>CONSUMOS BLACKBAR</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentTab.items.map(item => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '13px'
                          }}
                        >
                          <div>
                            <span style={{ color: '#F4F4F6' }}>{item.name}</span>
                            <span className="font-tabular" style={{ color: '#71717A', marginLeft: '8px' }}>
                              ({formatGs(item.price)} c/u)
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="font-tabular" style={{ fontWeight: 600 }}>
                              {formatGs(item.price * item.qty)}
                            </span>
                            {currentTab.status === 'open' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  onClick={() => updateTabItemQty(currentTab.id, item.id, -1)}
                                  className="btn-secondary"
                                  style={{ width: '24px', height: '24px', padding: 0 }}
                                >
                                  -
                                </button>
                                <span className="font-tabular" style={{ minWidth: '16px', textAlign: 'center', fontSize: '12px' }}>
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() => updateTabItemQty(currentTab.id, item.id, 1)}
                                  className="btn-secondary"
                                  style={{ width: '24px', height: '24px', padding: 0 }}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botonera de Carga Rápida (Quick-Add Matrix) */}
              {currentTab.status === 'open' && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginBottom: '20px' }}>
                  <div className="tracking-luxury" style={{ color: '#C5A880', marginBottom: '10px' }}>
                    BOTONERA DE CARGA RÁPIDA (UN SOLO CLIC)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                    {quickItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => addItemToTab(currentTab.id, item, 1)}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: '#16161D',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '4px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          transition: 'all 120ms ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#C5A880';
                          e.currentTarget.style.backgroundColor = '#1E1E28';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.backgroundColor = '#16161D';
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#F4F4F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          + {item.name}
                        </span>
                        <span className="font-tabular" style={{ fontSize: '11px', color: '#C5A880' }}>
                          {formatGs(item.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Calculadora Split-Bill Engine */}
              <div style={{ 
                backgroundColor: '#16161D', 
                border: '1px solid rgba(197, 168, 128, 0.25)', 
                borderRadius: '6px', 
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} strokeWidth={1.5} color="#C5A880" />
                    <div>
                      <div className="tracking-luxury" style={{ color: '#C5A880' }}>MOTOR SPLIT-BILL (DIVISIÓN EXACTA)</div>
                      <div style={{ fontSize: '11.5px', color: '#A1A1AA' }}>Cálculo instantáneo por jugador en caja</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setSplitCount(num)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          border: splitCount === num ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.1)',
                          backgroundColor: splitCount === num ? '#C5A880' : '#121216',
                          color: splitCount === num ? '#070709' : '#A1A1AA',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#D4D4D8' }}>
                    Monto individual ({splitCount} partes iguales):
                  </span>
                  <span className="font-tabular" style={{ fontSize: '20px', fontWeight: 800, color: '#F4F4F6' }}>
                    {formatGs(splitAmount)} <span style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 400 }}>/ persona</span>
                  </span>
                </div>
              </div>

              {/* Liquidación definitiva */}
              {currentTab.status === 'open' ? (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <div className="tracking-luxury" style={{ marginBottom: '10px' }}>MEDIO DE PAGO PARA LIQUIDACIÓN</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    {[
                      { id: 'Tarjeta', label: 'Tarjeta Crédito/Débito', icon: CreditCard },
                      { id: 'Transferencia / QR', label: 'Transferencia / QR', icon: QrCode },
                      { id: 'Efectivo', label: 'Efectivo Guaraníes', icon: Banknote }
                    ].map(method => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;

                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          style={{
                            padding: '12px 10px',
                            borderRadius: '4px',
                            border: isSelected ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.08)',
                            backgroundColor: isSelected ? 'rgba(197, 168, 128, 0.1)' : '#16161D',
                            color: isSelected ? '#C5A880' : '#A1A1AA',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Icon size={16} strokeWidth={1.5} />
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>{method.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSettle}
                    className="btn-primary"
                    style={{ width: '100%', padding: '16px', fontSize: '14px' }}
                  >
                    <span>LIQUIDAR CUENTA Y CERRAR PISTA ({formatGs(currentBalances.netPending)})</span>
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#A1A1AA'
                }}>
                  Cuenta liquidada a las {currentTab.settledAt} con {currentTab.paymentMethod}. Saldo conciliado en tesorería.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
