import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  Award, 
  ChevronRight,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div className="tracking-luxury" style={{ color: '#C5A880' }}>
          CRM EJECUTIVO & FIDELIZACIÓN
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', marginTop: '2px' }}>
          Directorio de Socios & Jugadores
        </h2>
        <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '4px' }}>
          Historial consolidado de turnos, condición de titular de abono fijo y recaudación acumulada.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} strokeWidth={1.5} color="#71717A" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-luxury"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <button
          onClick={() => setFilterFixedPass(!filterFixedPass)}
          style={{
            padding: '9px 16px',
            borderRadius: '4px',
            border: filterFixedPass ? '1px solid #C5A880' : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: filterFixedPass ? 'rgba(197, 168, 128, 0.1)' : '#121216',
            color: filterFixedPass ? '#C5A880' : '#A1A1AA',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Filter size={13} strokeWidth={1.5} />
          <span>Solo Titulares de Abono Fijo ({players.filter(p => p.isFixedPassHolder).length})</span>
        </button>
      </div>

      {/* High Density Table */}
      <div className="card-obsidian" style={{ backgroundColor: '#0E0E12', border: '1px solid rgba(255, 255, 255, 0.08)', overflowX: 'auto' }}>
        <table className="table-executive" style={{ minWidth: '880px' }}>
          <thead>
            <tr>
              <th>Socio / Jugador</th>
              <th>Contacto</th>
              <th>Categoría</th>
              <th>Abono Fijo Semanal</th>
              <th style={{ textAlign: 'right' }}>Reservas Históricas</th>
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
                      backgroundColor: player.isFixedPassHolder ? 'rgba(197, 168, 128, 0.15)' : '#191921',
                      border: player.isFixedPassHolder ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: player.isFixedPassHolder ? '#C5A880' : '#F4F4F6'
                    }}>
                      {player.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#F4F4F6' }}>{player.name}</div>
                      <div style={{ fontSize: '11px', color: '#71717A' }}>{player.status}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#A1A1AA' }}>
                    <Phone size={12} strokeWidth={1.5} />
                    <span className="font-tabular">{player.phone}</span>
                  </div>
                </td>

                <td>
                  <span className="status-pill blue" style={{ fontSize: '10px' }}>
                    {player.category}
                  </span>
                </td>

                <td>
                  {player.isFixedPassHolder ? (
                    <div>
                      <span className="status-pill bronze" style={{ fontSize: '10px' }}>
                        Titular Activo
                      </span>
                      {player.fixedPassDay && (
                        <div style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '2px' }}>
                          {player.fixedPassDay}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#52525B' }}>No asignado</span>
                  )}
                </td>

                <td style={{ textAlign: 'right' }}>
                  <span className="font-tabular" style={{ fontWeight: 600 }}>{player.totalBookings} turnos</span>
                </td>

                <td style={{ textAlign: 'right' }}>
                  <span className="font-tabular" style={{ fontWeight: 700, color: '#C5A880' }}>
                    {formatGs(player.totalSpent)}
                  </span>
                </td>

                <td>
                  <span style={{ fontSize: '12px', color: '#A1A1AA' }}>{player.lastVisit || 'Hoy'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
