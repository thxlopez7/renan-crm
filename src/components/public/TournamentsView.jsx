import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Calendar, 
  Check, 
  X, 
  ChevronRight, 
  Trophy,
  Award
} from 'lucide-react';

export function TournamentsView() {
  const { tournaments, registerTournament } = useClub();

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [pairName, setPairName] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [successReg, setSuccessReg] = useState(null);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!player1.trim() || !player2.trim() || !phone.trim() || !category) return;

    const reg = registerTournament({
      tournamentId: selectedTournament.id,
      pairName: pairName.trim() || `${player1} / ${player2}`,
      player1: player1.trim(),
      player2: player2.trim(),
      phone: phone.trim(),
      category
    });

    setSuccessReg(reg);
  };

  const closeDrawer = () => {
    setSelectedTournament(null);
    setPairName('');
    setPlayer1('');
    setPlayer2('');
    setPhone('');
    setCategory('');
    setSuccessReg(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Flagship Hero Card - Circuito Black Pádel */}
      <div 
        style={{
          position: 'relative',
          padding: '28px 22px',
          borderRadius: '8px',
          backgroundImage: 'linear-gradient(135deg, rgba(14, 14, 17, 0.98) 0%, rgba(20, 20, 26, 0.94) 100%)',
          border: '1px solid rgba(225, 29, 72, 0.35)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span 
            style={{ 
              backgroundColor: '#E11D48', 
              color: '#FFFFFF', 
              fontSize: '9.5px', 
              fontWeight: 800, 
              letterSpacing: '0.08em', 
              padding: '3px 8px', 
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}
          >
            Evento Insignia
          </span>
          <span style={{ fontSize: '11px', color: '#A1A1AA', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            FIP Ranking & Premios
          </span>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: '4px 0 10px' }}>
          Circuito Black Pádel · 2da Edición
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#D4D4D8', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="#E11D48" />
            <span>24 al 27 de Noviembre 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={14} color="#E4E4E7" />
            <span>Bolsa: <strong className="font-tabular" style={{ color: '#FFFFFF' }}>20.000.000 Gs.</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} color="#E4E4E7" />
            <span>Categorías: <strong>2da a 6ta</strong></span>
          </div>
        </div>

        <button
          onClick={() => {
            const flagship = tournaments.find(t => t.isFlagship) || tournaments[0];
            setSelectedTournament(flagship);
            setCategory(flagship.categories[0] || '');
          }}
          className="btn-primary"
          style={{ 
            backgroundColor: '#FFFFFF', 
            color: '#09090B', 
            minHeight: '44px', 
            padding: '0 20px', 
            fontWeight: 700 
          }}
        >
          <span>Inscribir Pareja Titular</span>
          <ChevronRight size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* Grid of All Tournaments & Events */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F4F4F6' }}>
            Calendario de Competencias & Sorteos
          </h3>
          <span style={{ fontSize: '11.5px', color: '#71717A' }}>
            {tournaments.length} eventos habilitados
          </span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', 
          gap: '14px' 
        }}>
          {tournaments.map(tournament => {
            const slotsLeft = tournament.slots - tournament.registeredCount;
            const isFlagship = tournament.isFlagship;

            return (
              <div
                key={tournament.id}
                style={{
                  backgroundColor: '#111113',
                  border: isFlagship ? '1px solid rgba(225, 29, 72, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span 
                      style={{ 
                        fontSize: '9.5px', 
                        fontWeight: 700,
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        backgroundColor: isFlagship ? 'rgba(225, 29, 72, 0.15)' : '#18181B',
                        color: isFlagship ? '#FB7185' : '#A1A1AA',
                        border: isFlagship ? '1px solid rgba(225, 29, 72, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      {tournament.type}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10B981' }}>
                      <span className="status-dot emerald"></span>
                      <span>{slotsLeft} cupos</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                    {tournament.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#A1A1AA', marginBottom: '14px' }}>
                    <Calendar size={13} strokeWidth={1.5} />
                    <span>{tournament.dates}</span>
                  </div>

                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#09090B', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    marginBottom: '14px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#71717A' }}>Premios</div>
                      <div className="font-tabular" style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                        {formatGs(tournament.prizePool)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#71717A' }}>Inscripción</div>
                      <div className="font-tabular" style={{ fontSize: '14px', fontWeight: 800, color: '#E4E4E7' }}>
                        {formatGs(tournament.entryFee)}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#71717A', marginBottom: '16px' }}>
                    Categorías: <strong style={{ color: '#D4D4D8' }}>{tournament.categories.join(' · ')}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTournament(tournament);
                    setCategory(tournament.categories[0] || '');
                  }}
                  className="btn-primary"
                  style={{ width: '100%', minHeight: '42px', fontSize: '12.5px' }}
                >
                  <span>Inscribir Pareja</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration Bottom Sheet Drawer */}
      {selectedTournament && (
        <div className="drawer-backdrop" onClick={closeDrawer}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle"></div>

            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: '#09090B'
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#A1A1AA', textTransform: 'uppercase' }}>
                  Inscripción Oficial
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                  {selectedTournament.title}
                </h3>
              </div>
              <button onClick={closeDrawer} className="btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {!successReg ? (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '12px 14px', backgroundColor: '#14141A', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '12px', color: '#71717A' }}>Tarifa de Inscripción:</span>
                      <span className="font-tabular" style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                        {formatGs(selectedTournament.entryFee)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#71717A' }}>
                      Mínimo 2 partidos garantizados y Welcome Pack oficial.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#A1A1AA', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="select-luxury"
                    >
                      {selectedTournament.categories.map(cat => (
                        <option key={cat} value={cat}>Categoría {cat}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Jugador 1 *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nombre y Apellido"
                        value={player1}
                        onChange={(e) => setPlayer1(e.target.value)}
                        className="input-luxury"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Jugador 2 *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nombre y Apellido"
                        value={player2}
                        onChange={(e) => setPlayer2(e.target.value)}
                        className="input-luxury"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', color: '#A1A1AA', marginBottom: '4px', textTransform: 'uppercase' }}>
                        WhatsApp de Contacto *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+595 981 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '46px', marginTop: '6px' }}>
                    <span>Confirmar Inscripción</span>
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid #10B981', 
                    color: '#10B981',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <Check size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
                      Inscripción Registrada
                    </h4>
                    <p style={{ fontSize: '12.5px', color: '#A1A1AA', marginTop: '4px' }}>
                      Binomio: <strong>{successReg.pairName}</strong> (Categoría {successReg.category})
                    </p>
                  </div>
                  <button onClick={closeDrawer} className="btn-primary" style={{ width: '100%', minHeight: '42px' }}>
                    Listo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
