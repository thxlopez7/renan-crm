import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Check, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Award,
  Sparkles
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
    <div>
      {/* Editorial Header */}
      <div 
        className="card-obsidian"
        style={{
          position: 'relative',
          padding: '40px 32px',
          marginBottom: '32px',
          backgroundImage: 'linear-gradient(to right, rgba(7, 7, 9, 0.95) 45%, rgba(7, 7, 9, 0.45) 100%), url(/images/court_panoramic.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="status-dot bronze"></span>
            <span className="tracking-luxury" style={{ color: '#C5A880' }}>
              CIRCUITO OFICIAL · BLACKCLUB ELITE
            </span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Campeonatos & Torneos Corporativos
          </h2>

          <p style={{ fontSize: '13.5px', color: '#A1A1AA', marginTop: '10px', lineHeight: 1.5 }}>
            Competencias de alto nivel regidas bajo el reglamento oficial de la FIP. Cuadros principales, premios en efectivo y servicio de hospitalidad post-partido.
          </p>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {tournaments.map(tournament => {
          const slotsLeft = tournament.slots - tournament.registeredCount;

          return (
            <div
              key={tournament.id}
              className="card-obsidian"
              style={{
                backgroundColor: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="status-pill bronze">
                    {tournament.status}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} strokeWidth={1.5} color="#A1A1AA" />
                    <span style={{ fontSize: '12px', color: '#A1A1AA' }}>{tournament.dates}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#F4F4F6', marginBottom: '6px' }}>
                  {tournament.name}
                </h3>

                <p style={{ fontSize: '13px', color: '#A1A1AA', lineHeight: 1.5, marginBottom: '18px' }}>
                  {tournament.description}
                </p>

                {/* Key specs */}
                <div style={{ 
                  backgroundColor: '#0D0D11', 
                  border: '1px solid rgba(255, 255, 255, 0.06)', 
                  borderRadius: '6px', 
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#71717A' }}>Inscripción por Pareja</span>
                    <span className="font-tabular" style={{ fontWeight: 700, color: '#C5A880' }}>
                      {formatGs(tournament.fee)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#71717A' }}>Bolsa de Premios</span>
                    <span className="font-tabular" style={{ fontWeight: 600, color: '#F4F4F6' }}>
                      {tournament.prizePool}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#71717A' }}>Cupos Disponibles</span>
                    <span className="font-tabular" style={{ color: slotsLeft <= 6 ? '#F43F5E' : '#38BDF8', fontWeight: 600 }}>
                      {slotsLeft} de {tournament.slots} parejas
                    </span>
                  </div>
                </div>

                {/* Welcome Kit & Sponsor */}
                <div style={{ fontSize: '11.5px', color: '#71717A', marginBottom: '20px' }}>
                  <div><strong style={{ color: '#A1A1AA' }}>Kit:</strong> {tournament.welcomeKit}</div>
                  <div style={{ marginTop: '3px' }}><strong style={{ color: '#A1A1AA' }}>Auspicio:</strong> {tournament.sponsor}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedTournament(tournament);
                  setCategory(tournament.categoryList[0] || '');
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                <span>INSCRIBIR PAREJA</span>
                <ChevronRight size={15} strokeWidth={1.5} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Slide-over Registration Drawer */}
      {selectedTournament && (
        <div className="drawer-backdrop" onClick={closeDrawer}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: '#0D0D11'
            }}>
              <div>
                <div className="tracking-luxury">INSCRIPCIÓN DE BINOMIO · CIRCUITO</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F4F4F6' }}>
                  {selectedTournament.name}
                </h3>
              </div>
              <button onClick={closeDrawer} className="btn-ghost" style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {!successReg ? (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div className="card-obsidian" style={{ padding: '16px', backgroundColor: '#131318' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#71717A' }}>Arancel por Pareja</span>
                      <span className="font-tabular" style={{ fontSize: '14px', fontWeight: 700, color: '#C5A880' }}>
                        {formatGs(selectedTournament.fee)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#A1A1AA' }}>
                      Incluye Welcome Kit y acceso al cocktail de clausura en BlackBar.
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                      CATEGORÍA DE COMPETICIÓN
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="select-luxury"
                    >
                      {selectedTournament.categoryList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Players inputs */}
                  <div>
                    <label className="tracking-luxury" style={{ display: 'block', marginBottom: '8px' }}>
                      INTEGRANTES DEL BINOMIO
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Jugador 1 (Titular)"
                        value={player1}
                        onChange={(e) => setPlayer1(e.target.value)}
                        className="input-luxury"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Jugador 2 (Pareja)"
                        value={player2}
                        onChange={(e) => setPlayer2(e.target.value)}
                        className="input-luxury"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Teléfono de contacto (+595 981 ...)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                    <span>CONFIRMAR REGISTRO DE PAREJA</span>
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid #10B981',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Check size={24} strokeWidth={2} color="#10B981" />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#F4F4F6' }}>
                    Pareja Inscripta con Éxito
                  </h4>
                  <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '6px' }}>
                    El cupo ha sido reservado. La organización del torneo enviará los horarios de las llaves y grupos por mensajería directa.
                  </p>
                  <button onClick={closeDrawer} className="btn-secondary" style={{ width: '100%', marginTop: '24px' }}>
                    <span>CERRAR</span>
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
