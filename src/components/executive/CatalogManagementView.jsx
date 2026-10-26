import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Check, 
  UtensilsCrossed, 
  Calendar, 
  Edit2,
  Plus,
  Package,
  X
} from 'lucide-react';

export function CatalogManagementView() {
  const { courts, menuItems, updateCourtRate, updateMenuItem, addMenuItem } = useClub();

  // Court Editing state
  const [editingCourtId, setEditingCourtId] = useState(null);
  const [courtRateInput, setCourtRateInput] = useState('');
  const [courtPrimeRateInput, setCourtPrimeRateInput] = useState('');

  // Item Editing state
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemPriceInput, setItemPriceInput] = useState('');
  const [itemStockInput, setItemStockInput] = useState('');

  // New Consumable Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Hidratación & Bebidas');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('50');
  const [newTag, setNewTag] = useState('');

  const [savedNotice, setSavedNotice] = useState('');

  const categories = [
    'Comida & Picadas',
    'Cervezas & Chopp',
    'Hidratación & Bebidas',
    'Pro-Shop & Merch'
  ];

  const handleStartEditCourt = (court) => {
    setEditingCourtId(court.id);
    setCourtRateInput(court.rate.toString());
    setCourtPrimeRateInput((court.primeRate || Math.round(court.rate * 1.2)).toString());
  };

  const handleSaveCourtRate = (courtId) => {
    const rateVal = Number(courtRateInput);
    const primeVal = Number(courtPrimeRateInput) || rateVal;
    if (!rateVal || rateVal <= 0) return;

    updateCourtRate(courtId, rateVal, primeVal);
    setEditingCourtId(null);
    setSavedNotice('Tarifas de la cancha actualizadas exitosamente en el sistema.');
    setTimeout(() => setSavedNotice(''), 2500);
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
    setItemStockInput((item.stock !== undefined ? item.stock : 50).toString());
  };

  const handleSaveItemChanges = (item) => {
    const priceVal = Number(itemPriceInput);
    const stockVal = parseInt(itemStockInput, 10);
    if (!priceVal || priceVal <= 0) return;

    updateMenuItem({
      ...item,
      price: priceVal,
      stock: isNaN(stockVal) ? (item.stock || 0) : stockVal
    });
    setEditingItemId(null);
    setSavedNotice(`Datos de "${item.name}" actualizados.`);
    setTimeout(() => setSavedNotice(''), 2000);
  };

  const handleAdjustStock = (item, delta) => {
    const currentStock = item.stock !== undefined ? item.stock : 50;
    const nextStock = Math.max(0, currentStock + delta);
    updateMenuItem({
      ...item,
      stock: nextStock
    });
  };

  const handleCreateConsumable = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;

    const priceNum = Number(newPrice);
    const stockNum = parseInt(newStock, 10) || 0;

    addMenuItem({
      name: newName.trim(),
      category: newCategory,
      price: priceNum,
      stock: stockNum,
      available: true,
      tag: newTag.trim() || newCategory
    });

    setNewName('');
    setNewPrice('');
    setNewStock('50');
    setNewTag('');
    setShowAddForm(false);
    setSavedNotice(`Nuevo consumible "${newName.trim()}" agregado al inventario.`);
    setTimeout(() => setSavedNotice(''), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
            Administración del Club
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '2px' }}>
            Tarifas de Canchas & Inventario de Consumibles
          </h2>
        </div>

        <button
          onClick={() => setShowAddForm(prev => !prev)}
          className="btn-primary"
          style={{ minHeight: '40px', gap: '6px', fontSize: '12px' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>{showAddForm ? 'Cerrar Formulario' : 'Agregar Nuevo Consumible'}</span>
        </button>
      </div>

      {savedNotice && (
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
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Formulario para Agregar Nuevo Consumible al Inventario */}
      {showAddForm && (
        <form 
          onSubmit={handleCreateConsumable}
          style={{
            padding: '20px',
            backgroundColor: '#161619',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} color="#FFFFFF" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                Nuevo Producto para el Inventario
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-ghost"
              style={{ padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#A1A1AA', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                Nombre del Artículo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Balde x6 Cervezas"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-luxury"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#A1A1AA', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                Categoría *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="select-luxury"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#A1A1AA', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                Precio Unitario (Gs.) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Ej. 25000"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="input-luxury font-tabular"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#A1A1AA', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                Stock Inicial *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Ej. 50"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="input-luxury font-tabular"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-ghost"
              style={{ minHeight: '38px', fontSize: '12px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ minHeight: '38px', padding: '0 18px', fontSize: '12px' }}
            >
              Guardar en Inventario
            </button>
          </div>
        </form>
      )}

      {/* Sección 1: Tarifas de Canchas */}
      <div style={{ backgroundColor: '#111113', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} strokeWidth={2} color="#FFFFFF" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              Tarifas por Cancha (Turno de 1 Hora)
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: '#A1A1AA' }}>
            Podés modificar las tarifas en cualquier momento
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px' }}>
          {courts.map(court => (
            <div
              key={court.id}
              style={{
                backgroundColor: '#161619',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '10px', color: '#71717A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '2px' }}>
                  {court.code}
                </div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  {court.name}
                </h4>
                <p style={{ fontSize: '11px', color: '#71717A' }}>
                  {court.specs ? court.specs.split('·')[0] : 'Cancha Oficial'}
                </p>
              </div>

              {editingCourtId === court.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#A1A1AA', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                      Tarifa Estándar (Gs.)
                    </label>
                    <input
                      type="number"
                      value={courtRateInput}
                      onChange={(e) => setCourtRateInput(e.target.value)}
                      className="input-luxury font-tabular"
                      style={{ fontSize: '13px', minHeight: '36px', padding: '6px 10px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', color: '#A1A1AA', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                      Tarifa Horario Prime (Gs.)
                    </label>
                    <input
                      type="number"
                      value={courtPrimeRateInput}
                      onChange={(e) => setCourtPrimeRateInput(e.target.value)}
                      className="input-luxury font-tabular"
                      style={{ fontSize: '13px', minHeight: '36px', padding: '6px 10px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <button
                      onClick={() => handleSaveCourtRate(court.id)}
                      className="btn-primary"
                      style={{ flex: 1, minHeight: '36px', fontSize: '12px' }}
                    >
                      Guardar Tarifa
                    </button>
                    <button
                      onClick={() => setEditingCourtId(null)}
                      className="btn-ghost"
                      style={{ minHeight: '36px', padding: '0 12px', fontSize: '12px' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#71717A' }}>Tarifa Actual</div>
                    <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                      {formatGs(court.rate)}
                    </div>
                    {court.primeRate && (
                      <div style={{ fontSize: '10.5px', color: '#A1A1AA' }}>
                        Prime: <strong className="font-tabular" style={{ color: '#E4E4E7' }}>{formatGs(court.primeRate)}</strong>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartEditCourt(court)}
                    className="btn-ghost"
                    style={{ minHeight: '34px', padding: '4px 12px', fontSize: '11.5px', border: '1px solid rgba(255,255,255,0.1)' }}
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

      {/* Sección 2: Inventario de Consumibles */}
      <div style={{ backgroundColor: '#111113', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UtensilsCrossed size={16} strokeWidth={2} color="#FFFFFF" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              Inventario de Consumibles & Productos ({menuItems.length} ítems)
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: '#A1A1AA' }}>
            Control de stock en tiempo real y precios de venta
          </span>
        </div>

        {/* 1. Vista Móvil (Tarjetas) */}
        <div className="show-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {menuItems.map(item => {
            const stockQty = item.stock !== undefined ? item.stock : 50;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#161619',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#71717A' }}>{item.category}</div>
                  </div>
                  <div className="font-tabular" style={{ fontSize: '14px', fontWeight: 800, color: '#E4E4E7' }}>
                    {formatGs(item.price)}
                  </div>
                </div>

                {editingItemId === item.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#0E0E10', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', color: '#71717A' }}>Precio (Gs.)</span>
                        <input
                          type="number"
                          value={itemPriceInput}
                          onChange={(e) => setItemPriceInput(e.target.value)}
                          className="input-luxury font-tabular"
                          style={{ minHeight: '32px', fontSize: '12px' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', color: '#71717A' }}>Stock</span>
                        <input
                          type="number"
                          value={itemStockInput}
                          onChange={(e) => setItemStockInput(e.target.value)}
                          className="input-luxury font-tabular"
                          style={{ minHeight: '32px', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleSaveItemChanges(item)}
                        className="btn-primary"
                        style={{ flex: 1, minHeight: '32px', fontSize: '11.5px' }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="btn-ghost"
                        style={{ minHeight: '32px', fontSize: '11.5px' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#A1A1AA' }}>Stock:</span>
                      <button
                        onClick={() => handleAdjustStock(item, -1)}
                        className="btn-secondary"
                        style={{ minHeight: '26px', width: '26px', padding: 0, justifyContent: 'center', fontSize: '13px' }}
                      >
                        -
                      </button>
                      <span className="font-tabular" style={{ fontSize: '12.5px', fontWeight: 800, color: stockQty < 10 ? '#FB7185' : '#FFFFFF', minWidth: '24px', textAlign: 'center' }}>
                        {stockQty}
                      </span>
                      <button
                        onClick={() => handleAdjustStock(item, 1)}
                        className="btn-secondary"
                        style={{ minHeight: '26px', width: '26px', padding: 0, justifyContent: 'center', fontSize: '13px' }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleToggleItemAvailability(item)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: item.available ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                          backgroundColor: item.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                          color: item.available ? '#34D399' : '#FDA4AF',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {item.available ? 'Disponible' : 'Agotado'}
                      </button>

                      <button
                        onClick={() => handleStartEditItem(item)}
                        className="btn-ghost"
                        style={{ padding: '3px 8px', fontSize: '10.5px' }}
                      >
                        <Edit2 size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 2. Vista Escritorio (Tabla Completa con Stock) */}
        <div className="hide-mobile" style={{ backgroundColor: '#09090B', overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '6px' }}>
          <table className="table-executive" style={{ minWidth: '780px' }}>
            <thead>
              <tr>
                <th>Producto / Consumible</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Precio Unitario</th>
                <th style={{ textAlign: 'center' }}>Stock en Inventario</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => {
                const stockQty = item.stock !== undefined ? item.stock : 50;

                return (
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
                        <input
                          type="number"
                          value={itemPriceInput}
                          onChange={(e) => setItemPriceInput(e.target.value)}
                          className="input-luxury font-tabular"
                          style={{ width: '100px', padding: '4px 8px', fontSize: '12px', minHeight: '30px' }}
                        />
                      ) : (
                        <span className="font-tabular" style={{ fontWeight: 700, color: '#E4E4E7' }}>
                          {formatGs(item.price)}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          value={itemStockInput}
                          onChange={(e) => setItemStockInput(e.target.value)}
                          className="input-luxury font-tabular"
                          style={{ width: '70px', padding: '4px 6px', fontSize: '12px', minHeight: '30px', textAlign: 'center' }}
                        />
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleAdjustStock(item, -1)}
                            className="btn-secondary"
                            style={{ minHeight: '26px', width: '26px', padding: 0, justifyContent: 'center', fontSize: '13px' }}
                            title="Disminuir stock en 1"
                          >
                            -
                          </button>
                          <span className="font-tabular" style={{ fontWeight: 800, color: stockQty < 10 ? '#FB7185' : '#FFFFFF', minWidth: '32px' }}>
                            {stockQty}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(item, 1)}
                            className="btn-secondary"
                            style={{ minHeight: '26px', width: '26px', padding: 0, justifyContent: 'center', fontSize: '13px' }}
                            title="Aumentar stock en 1"
                          >
                            +
                          </button>
                        </div>
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
                      {editingItemId === item.id ? (
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            onClick={() => handleSaveItemChanges(item)}
                            className="btn-primary"
                            style={{ minHeight: '30px', padding: '0 10px', fontSize: '11px' }}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="btn-ghost"
                            style={{ minHeight: '30px', padding: '0 6px', fontSize: '11px' }}
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditItem(item)}
                          className="btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
                        >
                          <Edit2 size={11} strokeWidth={1.5} />
                          <span>Editar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
