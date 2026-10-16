import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Sliders, 
  Check, 
  UtensilsCrossed, 
  Calendar, 
  Tag, 
  ShieldCheck,
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
    setSavedNotice('Tarifa de pista actualizada exitosamente.');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <div className="tracking-luxury" style={{ color: '#C5A880' }}>
          ADMINISTRACIÓN DE TARIFAS & CATÁLOGO
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', marginTop: '2px' }}>
          Gestión de Precios & Disponibilidad de Inventario
        </h2>
        <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '4px' }}>
          Todo ajuste tarifario o de disponibilidad se propaga en tiempo real al portal público de clientes.
        </p>
      </div>

      {savedNotice && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10B981',
          borderRadius: '4px',
          color: '#34D399',
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={14} strokeWidth={2} />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Courts Tariffs Section */}
      <div className="card-obsidian" style={{ backgroundColor: '#111116', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Calendar size={16} strokeWidth={1.5} color="#C5A880" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F4F4F6' }}>
            Tarifario Base de Pistas (Bloques de 90 Minutos)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {courts.map(court => (
            <div
              key={court.id}
              style={{
                backgroundColor: '#16161D',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '4px',
                padding: '18px'
              }}
            >
              <div style={{ fontSize: '11px', color: '#C5A880', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
                {court.code}
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#F4F4F6', marginBottom: '6px' }}>
                {court.name}
              </h4>
              <p style={{ fontSize: '11.5px', color: '#A1A1AA', marginBottom: '14px' }}>
                {court.specs}
              </p>

              {editingCourtId === court.id ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={courtRateInput}
                    onChange={(e) => setCourtRateInput(e.target.value)}
                    className="input-luxury font-tabular"
                    style={{ fontSize: '13px' }}
                  />
                  <button
                    onClick={() => handleSaveCourtRate(court.id)}
                    className="btn-primary"
                    style={{ padding: '0 12px', fontSize: '12px' }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingCourtId(null)}
                    className="btn-ghost"
                    style={{ padding: '0 8px', fontSize: '12px' }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#71717A' }}>Tarifa Actual</div>
                    <div className="font-tabular" style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6' }}>
                      {formatGs(court.rate)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartEditCourt(court)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11.5px' }}
                  >
                    <Edit2 size={12} strokeWidth={1.5} />
                    <span>Modificar</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Menu Catalog & Availability Section */}
      <div className="card-obsidian" style={{ backgroundColor: '#111116', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <UtensilsCrossed size={16} strokeWidth={1.5} color="#C5A880" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F4F4F6' }}>
            Carta Digital BlackBar & Pro-Shop (Precios y Disponibilidad)
          </h3>
        </div>

        <div className="card-obsidian" style={{ backgroundColor: '#0E0E12', overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <table className="table-executive" style={{ minWidth: '780px' }}>
            <thead>
              <tr>
                <th>Producto / Artículo</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Precio Unitario</th>
                <th>Estado de Inventario</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#F4F4F6' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#71717A' }}>{item.tag || item.category}</div>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#A1A1AA' }}>{item.category}</span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {editingItemId === item.id ? (
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <input
                          type="number"
                          value={itemPriceInput}
                          onChange={(e) => setItemPriceInput(e.target.value)}
                          className="input-luxury font-tabular"
                          style={{ width: '120px', padding: '6px 8px', fontSize: '12px' }}
                        />
                        <button
                          onClick={() => handleSaveItemPrice(item)}
                          className="btn-primary"
                          style={{ padding: '0 10px', fontSize: '11px' }}
                        >
                          Ok
                        </button>
                      </div>
                    ) : (
                      <span className="font-tabular" style={{ fontWeight: 700, color: '#C5A880' }}>
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
                      <span>{item.available ? 'En Carta (Disponible)' : 'Agotado'}</span>
                    </button>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleStartEditItem(item)}
                      className="btn-ghost"
                      style={{ padding: '6px 10px', fontSize: '11.5px' }}
                    >
                      <Edit2 size={12} strokeWidth={1.5} />
                      <span>Editar Precio</span>
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
