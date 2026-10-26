import React from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { 
  Calendar, 
  Trophy,
  Award,
  Phone,
  ArrowUpRight,
  MessageCircle
} from 'lucide-react';

const TOURNAMENTS_WHATSAPP_NUMBER = '595983573396';
const TOURNAMENTS_PHONE_DISPLAY = '+595 983 573 396';

export function TournamentsView() {
  const { tournaments } = useClub();

  const getWhatsAppLink = (tournamentTitle) => {
    const text = tournamentTitle 
      ? `Hola Black Club Elite, me gustaría recibir información y consultar sobre las inscripciones para el torneo: ${tournamentTitle}.`
      : 'Hola Black Club Elite, me gustaría recibir información sobre los torneos y competencias.';
    return `https://wa.me/${TOURNAMENTS_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#D4D4D8', marginBottom: '20px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <a
            href={getWhatsAppLink('Circuito Black Pádel · 2da Edición')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ 
              backgroundColor: '#FFFFFF', 
              color: '#09090B', 
              minHeight: '44px', 
              padding: '0 20px', 
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Phone size={15} strokeWidth={2.2} />
            <span>Contactar por WhatsApp</span>
            <ArrowUpRight size={15} strokeWidth={2.5} />
          </a>

          <span style={{ fontSize: '12px', color: '#A1A1AA' }}>
            WhatsApp Oficial: <strong style={{ color: '#FFFFFF' }}>{TOURNAMENTS_PHONE_DISPLAY}</strong>
          </span>
        </div>
      </div>

      {/* Official Tournaments Coordination Banner */}
      <div 
        style={{
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: '#111113',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981',
            flexShrink: 0
          }}>
            <MessageCircle size={18} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
              Coordinación & Consultas de Torneos
            </div>
            <div style={{ fontSize: '11.5px', color: '#A1A1AA', marginTop: '2px' }}>
              Para inscripción de parejas, reglamento y cuadros oficiales, contactá directamente a la organización.
            </div>
          </div>
        </div>

        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ 
            textDecoration: 'none', 
            padding: '8px 16px', 
            fontSize: '12px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px' 
          }}
        >
          <Phone size={13} strokeWidth={2} />
          <span>{TOURNAMENTS_PHONE_DISPLAY}</span>
          <ArrowUpRight size={13} />
        </a>
      </div>

      {/* Grid of All Tournaments & Events */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F4F4F6' }}>
            Calendario de Competencias & Eventos
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#A1A1AA', marginBottom: '12px' }}>
                    <Calendar size={13} strokeWidth={1.5} />
                    <span>{tournament.dates}</span>
                  </div>

                  {tournament.description && (
                    <p style={{ fontSize: '12px', color: '#8E8E93', lineHeight: 1.45, marginBottom: '14px' }}>
                      {tournament.description}
                    </p>
                  )}

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

                <a
                  href={getWhatsAppLink(tournament.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ 
                    width: '100%', 
                    minHeight: '42px', 
                    fontSize: '12.5px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Phone size={14} strokeWidth={2} />
                  <span>Contactar por WhatsApp</span>
                  <ArrowUpRight size={14} strokeWidth={2} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
