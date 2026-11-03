import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { CLUB_WHATSAPP_URL } from '../../config/contact';

const FINISHED = ['Finalizado', 'Finalizada', 'Cerrado'];

const whatsappFor = (title) => `${CLUB_WHATSAPP_URL}?text=${encodeURIComponent(
  title
    ? `Hola Black Club, quiero inscribirme o recibir información sobre: ${title}.`
    : 'Hola Black Club, quiero recibir novedades de los próximos torneos.'
)}`;

export function TournamentsView() {
  const { tournaments } = useClub();
  const finished = tournaments.filter(t => FINISHED.includes(t.status));
  const upcoming = tournaments.filter(t => !FINISHED.includes(t.status));
  const flagship = finished.find(t => t.isFlagship) || null;

  return (
    <div className="sec">
      <div className="sec-head">
        <span className="eyebrow">Circuito & eventos</span>
        <h2 className="sec-title">Competir en casa</h2>
        <p className="sec-lead">Torneos por categoría, eventos sociales y el Circuito Black Pádel, nuestro torneo insignia.</p>
      </div>

      {flagship && (
        <section className="sec-banner event-hero" style={{ backgroundImage: 'url(/images/court_panoramic.jpg)' }} aria-label={flagship.title}>
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
              <a className="lux-btn" href={whatsappFor()} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> Avisame de la próxima edición
              </a>
            </div>
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="sec" style={{ gap: 16 }} aria-label="Próximos eventos">
          <h3 className="menu-group-title" style={{ margin: 0 }}>Próximos eventos</h3>
          <div className="grid-cards is-3">
            {upcoming.map(t => {
              const fill = t.slots ? Math.min(100, Math.round((t.registeredCount / t.slots) * 100)) : 0;
              const left = Math.max(0, t.slots - t.registeredCount);
              return (
                <article key={t.id} className={`card ${t.isFlagship ? 'is-featured' : ''}`}>
                  <span className="card-tag is-muted">{t.type}</span>
                  <div>
                    <h4 className="card-title">{t.title}</h4>
                    <div className="card-sub" style={{ marginTop: 8 }}>{t.dates}</div>
                  </div>
                  <p className="card-text">{t.description}</p>
                  {t.categories?.length > 0 && (
                    <div className="chip-row">{t.categories.map(c => <span key={c} className="chip">{c}</span>)}</div>
                  )}
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div className="progress" aria-hidden="true"><span style={{ width: `${fill}%` }} /></div>
                    <span className="card-sub">{left > 0 ? `Quedan ${left} lugares` : 'Cupos completos'} · {t.status}</span>
                  </div>
                  <div className="card-price">
                    <strong>{formatGs(t.entryFee).replace(' Gs.', '')}</strong><span>Gs. inscripción</span>
                  </div>
                  <a className="lux-btn" href={whatsappFor(t.title)} target="_blank" rel="noopener noreferrer">
                    Inscribirme <ArrowRight size={16} />
                  </a>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
