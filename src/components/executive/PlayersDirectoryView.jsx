import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Search, 
  ShieldCheck, 
  Phone, 
  Filter
} from 'lucide-react';

export function PlayersDirectoryView() {
  const { players } = useClub();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFixedPass, setFilterFixedPass] = useState(false);

  const filteredPlayers = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm);
    const matchFixed = filterFixedPass ? p.isFixedPassHolder : true;
    return matchSearch && matchFixed;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
          Directorio de Clientes & CRM
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '2px' }}>
          Clientes & Jugadores
        </h2>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={15} strokeWidth={1.5} color="#71717A" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-luxury"
            style={{ paddingLeft: '38px', minHeight: '42px' }}
          />
        </div>

        <button
          onClick={() => setFilterFixedPass(!filterFixedPass)}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            border: filterFixedPass ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: filterFixedPass ? '#FFFFFF' : '#111113',
            color: filterFixedPass ? '#09090B' : '#A1A1AA',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '42px',
            transition: 'all 120ms ease'
          }}
        >
          <Filter size={13} strokeWidth={1.5} />
          <span>Turnos Fijos ({players.filter(p => p.isFixedPassHolder).length})</span>
        </button>
      </div>

      {/* 1. Mobile Cards List (Visible on Mobile) */}
      <div className="show-mobile-only">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredPlayers.map(player => (
            <div
              key={player.id}
              style={{
                padding: '14px',
                backgroundColor: '#111113',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: player.isFixedPassHolder ? '#FFFFFF' : '#18181B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                    color: player.isFixedPassHolder ? '#09090B' : '#FFFFFF'
                  }}>
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>
                      {player.name}
                    </div>
                    <a 
                      href={`tel:${player.phone}`}
                      style={{ fontSize: '11px', color: '#71717A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}
                    >
                      <Phone size={10} />
                      <span>{player.phone}</span>
                    </a>
                  </div>
                </div>

                <span style={{ 
                  fontSize: '9.5px', 
                  fontWeight: 600, 
                  padding: '2px 7px', 
                  borderRadius: '4px',
                  backgroundColor: '#18181B',
                  color: '#A1A1AA',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {player.category}
                </span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px', 
                padding: '10px', 
                backgroundColor: '#09090B', 
                borderRadius: '6px', 
                border: '1px solid rgba(255, 255, 255, 0.04)',
                fontSize: '11px' 
              }}>
                <div>
                  <span style={{ color: '#71717A' }}>Reservas:</span>
                  <div className="font-tabular" style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '1px' }}>
                    {player.bookingsCount || player.totalBookings || 0} partidos
                  </div>
                </div>
                <div>
                  <span style={{ color: '#71717A' }}>Consumo Total:</span>
                  <div className="font-tabular" style={{ fontWeight: 800, color: '#E4E4E7', marginTop: '1px' }}>
                    {formatGs(player.totalSpend || player.totalSpent || 0)}
                  </div>
                </div>
              </div>

              {player.isFixedPassHolder && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#A1A1AA' }}>
                  <ShieldCheck size={13} color="#10B981" />
                  <span>Turno Fijo Semanal Habilitado</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Desktop High Density Table (Visible on Desktop) */}
      <div className="hide-mobile" style={{ backgroundColor: '#09090B', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflowX: 'auto' }}>
        <table className="table-executive" style={{ minWidth: '860px' }}>
          <thead>
            <tr>
              <th>Cliente / Jugador</th>
              <th>Contacto</th>
              <th>Categoría</th>
              <th>Turno Fijo Semanal</th>
              <th style={{ textAlign: 'right' }}>Partidos Jugados</th>
              <th style={{ textAlign: 'right' }}>Consumo Acumulado</th>
              <th>Última Visita</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(player => (
              <tr key={player.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: player.isFixedPassHolder ? '#FFFFFF' : '#18181B',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 700, 
                      fontSize: '12px', 
                      color: player.isFixedPassHolder ? '#09090B' : '#FFFFFF'
                    }}>
                      {player.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{player.name}</span>
                  </div>
                </td>
                <td className="font-tabular" style={{ color: '#A1A1AA' }}>{player.phone}</td>
                <td>
                  <span style={{ 
                    fontSize: '9.5px', 
                    fontWeight: 600, 
                    padding: '2px 7px', 
                    borderRadius: '4px',
                    backgroundColor: '#18181B',
                    color: '#A1A1AA',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {player.category}
                  </span>
                </td>
                <td>
                  {player.isFixedPassHolder ? (
                    <span style={{ 
                      fontSize: '9.5px', 
                      fontWeight: 700, 
                      padding: '2px 7px', 
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                      Turno Fijo
                    </span>
                  ) : (
                    <span style={{ color: '#52525B', fontSize: '11.5px' }}>—</span>
                  )}
                </td>
                <td className="font-tabular" style={{ textAlign: 'right', fontWeight: 600, color: '#FFFFFF' }}>
                  {player.bookingsCount || player.totalBookings || 0} partidos
                </td>
                <td className="font-tabular" style={{ textAlign: 'right', fontWeight: 700, color: '#E4E4E7' }}>
                  {formatGs(player.totalSpend || player.totalSpent || 0)}
                </td>
                <td style={{ color: '#71717A', fontSize: '11.5px' }}>{player.lastVisit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
