import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  UtensilsCrossed, 
  Beer, 
  Wine, 
  Package, 
  Info,
  Clock
} from 'lucide-react';

export function BlackBarMenuView() {
  const { menuItems } = useClub();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    'Comida & Picadas',
    'Cervezas & Chopp',
    'Hidratación & Bebidas',
    'Pro-Shop & Merch'
  ];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.category === selectedCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner - Informative Digital Menu */}
      <div 
        className="card-obsidian"
        style={{
          position: 'relative',
          padding: '20px',
          backgroundImage: 'linear-gradient(to right, rgba(9, 9, 11, 0.95) 50%, rgba(9, 9, 11, 0.65) 100%), url(/images/lounge_bar.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255, 255, 255, 0.07)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="status-dot amber"></span>
            <span className="tracking-luxury">CARTA DIGITAL · BAR & MERCH</span>
          </div>

          <h2 className="title-section" style={{ color: '#FFFFFF' }}>
            Carta del Tercer Tiempo & Merchandising
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '8px', fontSize: '11.5px', color: '#A1A1AA' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} color="#F59E0B" />
              <span>Barra habilitada de 17:00 a 00:00 hs</span>
            </span>
            <span>·</span>
            <span>Pedidos y consumo directo en barra & caja del club</span>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        overflowX: 'auto', 
        paddingBottom: '4px', 
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          const label = cat === 'all' ? 'Toda la Carta' : cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '7px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '20px',
                border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: isSelected ? '#FFFFFF' : '#111113',
                color: isSelected ? '#09090B' : '#71717A',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 120ms ease'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Menu Grid - Pure Informative Catalogue */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', 
        gap: '12px' 
      }}>
        {filteredItems.map(item => {
          return (
            <div
              key={item.id}
              className="card-obsidian"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '6px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="tracking-luxury" style={{ color: '#71717A', fontSize: '9px' }}>
                    {item.tag || item.category}
                  </span>
                  <div className="font-tabular" style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                    {formatGs(item.price)}
                  </div>
                </div>

                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  {item.name}
                </h4>

                <p style={{ fontSize: '12px', color: '#8E8E93', lineHeight: 1.45, marginBottom: '14px' }}>
                  {item.description}
                </p>
              </div>

              {/* Informative Footer Badge */}
              <div style={{ 
                borderTop: '1px solid rgba(255,255,255,0.05)', 
                paddingTop: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#71717A'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-dot emerald" style={{ width: '6px', height: '6px' }}></span>
                  <span style={{ color: '#D4D4D8' }}>Disponible en Barra</span>
                </span>

                <span style={{ fontSize: '10px', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pedir en Caja
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
