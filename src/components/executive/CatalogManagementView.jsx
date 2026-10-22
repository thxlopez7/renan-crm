import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Check, 
  UtensilsCrossed, 
  Calendar, 
  Edit2
} from 'lucide-react';

export function CatalogManagementView() {
  const { courts, menuItems, updateCourtRate, updateMenuItem } = useClub();

  const [editingCourtId, setEditingCourtId] = useState(null);
  const [courtRateInput, setCourtRateInput] = useState('');

  const [editingItemId, setEditingItemId] = useState(null);
  const [itemPriceInput, setItemPriceInput] = useState('');

  const [savedNotice, setSavedNotice] = useState('');

  const handleStartEditCourt = (court) => {
    setEditingCourtId(court.id);
    setCourtRateInput(court.rate.toString());
  };

  const handleSaveCourtRate = (courtId) => {
    const val = Number(courtRateInput);
    if (!val || val <= 0) return;

    updateCourtRate(courtId, val);
    setEditingCourtId(null);
    setSavedNotice('Tarifa de cancha actualizada.');
    setTimeout(() => setSavedNotice(''), 2000);
  };

  const handleToggleItemAvailability = (item) => {
    updateMenuItem({
      ...item,
      available: !item.available
    });
    setSavedNotice(`Disponibilidad de "${item.name}" actualizada.`);
    setTimeout(() => setSavedNotice(''), 2000);
  };

  const handleStartEditItem = (item) => {
    setEditingItemId(item.id);
    setItemPriceInput(item.price.toString());
  };

  const handleSaveItemPrice = (item) => {
    const val = Number(itemPriceInput);
    if (!val || val <= 0) return;

    updateMenuItem({
      ...item,
      price: val
    });
    setEditingItemId(null);
    setSavedNotice(`Precio de "${item.name}" actualizado.`);
    setTimeout(() => setSavedNotice(''), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
          Gestión de Tarifas & Menú
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '2px' }}>
          Precios & Catálogo
        </h2>
      </div>

      {savedNotice && (
        <div style={{
          padding: '10px 14px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10B981',
          borderRadius: '6px',
          color: '#34D399',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={14} strokeWidth={2.5} />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Courts Tariffs Section */}
      <div style={{ backgroundColor: '#111113', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Calendar size={15} strokeWidth={1.5} color="#FFFFFF" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
            Tarifas de Canchas (Bloque de 1 Hora)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
          {courts.map(court => (
            <div
              key={court.id}
              style={{
                backgroundColor: '#161619',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                padding: '14px'
              }}
            >
              <div style={{ fontSize: '10.5px', color: '#71717A', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '2px' }}>
                {court.code}
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                {court.name}
              </h4>
              <p style={{ fontSize: '11px', color: '#71717A', marginBottom: '12px' }}>
                {court.specs.split('·')[0]}
              </p>

              {editingCourtId === court.id ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="number"
                    value={courtRateInput}
                    onChange={(e) => setCourtRateInput(e.target.value)}
                    className="input-luxury font-tabular"
                    style={{ fontSize: '13px', minHeight: '38px', padding: '6px 10px' }}
                  />
                  <button
                    onClick={() => handleSaveCourtRate(court.id)}
                    className="btn-primary"
                    style={{ minHeight: '38px', padding: '0 12px', fontSize: '11.5px' }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingCourtId(null)}
                    className="btn-ghost"
                    style={{ minHeight: '38px', padding: '0 8px', fontSize: '11.5px' }}
                  >
                    X
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#71717A' }}>Tarifa Actual</div>
                    <div className="font-tabular" style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                      {formatGs(court.rate)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartEditCourt(court)}
                    className="btn-ghost"
                    style={{ minHeight: '32px', padding: '4px 10px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Edit2 size={11} strokeWidth={1.5} />
                    <span>Modificar</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Menu Catalog Section */}
      <div style={{ backgroundColor: '#111113', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <UtensilsCrossed size={15} strokeWidth={1.5} color="#FFFFFF" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
            Carta Digital & Stock
          </h3>
        </div>

        {/* 1. Mobile Cards for Menu Items */}
        <div className="show-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#161619',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                padding: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{item.name}</div>
                  <div style={{ fontSize: '10.5px', color: '#71717A' }}>{item.category}</div>
                </div>
                <div className="font-tabular" style={{ fontSize: '13px', fontWeight: 800, color: '#E4E4E7' }}>
                  {formatGs(item.price)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                <button
                  onClick={() => handleToggleItemAvailability(item)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: item.available ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                    backgroundColor: item.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    color: item.available ? '#34D399' : '#FDA4AF',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span className={`status-dot ${item.available ? 'emerald' : 'terracotta'}`}></span>
                  <span>{item.available ? 'Disponible' : 'Agotado'}</span>
                </button>

                {editingItemId === item.id ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="number"
                      value={itemPriceInput}
                      onChange={(e) => setItemPriceInput(e.target.value)}
                      className="input-luxury font-tabular"
                      style={{ width: '90px', padding: '4px 6px', fontSize: '11px', minHeight: '30px' }}
                    />
                    <button
                      onClick={() => handleSaveItemPrice(item)}
                      className="btn-primary"
                      style={{ minHeight: '30px', padding: '0 8px', fontSize: '11px' }}
                    >
                      Ok
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEditItem(item)}
                    className="btn-ghost"
                    style={{ minHeight: '30px', padding: '4px 8px', fontSize: '11px' }}
                  >
                    <Edit2 size={11} strokeWidth={1.5} />
                    <span>Editar Precio</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Desktop Table View */}
        <div className="hide-mobile" style={{ backgroundColor: '#09090B', overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '6px' }}>
          <table className="table-executive" style={{ minWidth: '740px' }}>
            <thead>
              <tr>
                <th>Producto / Artículo</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th>Disponibilidad</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#71717A' }}>{item.tag || item.category}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', color: '#A1A1AA' }}>{item.category}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {editingItemId === item.id ? (
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <input
                          type="number"
                          value={itemPriceInput}
                          onChange={(e) => setItemPriceInput(e.target.value)}
                          className="input-luxury font-tabular"
                          style={{ width: '110px', padding: '4px 8px', fontSize: '12px', minHeight: '32px' }}
                        />
                        <button
                          onClick={() => handleSaveItemPrice(item)}
                          className="btn-primary"
                          style={{ minHeight: '32px', padding: '0 10px', fontSize: '11px' }}
                        >
                          Ok
                        </button>
                      </div>
                    ) : (
                      <span className="font-tabular" style={{ fontWeight: 700, color: '#E4E4E7' }}>
                        {formatGs(item.price)}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleItemAvailability(item)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: item.available ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                        backgroundColor: item.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        color: item.available ? '#34D399' : '#FDA4AF',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span className={`status-dot ${item.available ? 'emerald' : 'terracotta'}`}></span>
                      <span>{item.available ? 'Disponible' : 'Agotado'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleStartEditItem(item)}
                      className="btn-ghost"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                    >
                      <Edit2 size={11} strokeWidth={1.5} />
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
