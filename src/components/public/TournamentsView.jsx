import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { CLUB_WHATSAPP_URL } from '../../config/contact';

const FINISHED = ['Finalizado', 'Finalizada', 'Cerrado'];

const NEXT_EDITION_URL = `${CLUB_WHATSAPP_URL}?text=${encodeURIComponent('Hola Black Club, quiero recibir novedades de la próxima edición del Circuito.')}`;

export function TournamentsView() {
  const { tournaments } = useClub();
  const finished = tournaments.filter(t => FINISHED.includes(t.status));
  const flagship = finished.find(t => t.isFlagship) || null;

  return (
    <div className="sec">
      <div className="sec-head">
        <span className="eyebrow">Torneos del club</span>
        <h2 className="sec-title">Competir en casa</h2>
        <p className="sec-lead">El Circuito Black Pádel es nuestro torneo insignia. Seguinos para enterarte de la próxima edición.</p>
      </div>

      {flagship && (
        <section className="sec-banner event-hero" style={{ backgroundImage: 'url(/images/torneo-paletas.jpg)' }} aria-label={flagship.title}>
          <div style={{ display: 'grid', gap: 14, width: '100%' }}>
            <span className="card-tag">Edición finalizada</span>
            <h3 className="sec-title" style={{ fontSize: 'clamp(30px, 6vw, 46px)' }}>{flagship.title}</h3>
            <p className="sec-lead" style={{ maxWidth: 560 }}>
              Gracias a todas las parejas que hicieron de esta edición la más competitiva del club. Muy pronto anunciamos la próxima.
            </p>
            <div className="event-results">
              <div className="event-fact"><span>Fechas</span><strong>{flagship.dates}</strong></div>
              <div className="event-fact"><span>Parejas</span><strong>{flagship.registeredCount}</strong></div>
              <div className="event-fact"><span>Bolsa de premios</span><strong>{formatGs(flagship.prizePool)}</strong></div>
            </div>
            <div>
              <a className="lux-btn" href={NEXT_EDITION_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> Avisame de la próxima edición
              </a>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
