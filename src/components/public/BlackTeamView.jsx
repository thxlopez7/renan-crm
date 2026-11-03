import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MessageCircle, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatFullDate } from '../../utils/formatters';
import { addDays, clubNow, isStartPast, weekdayOf } from '../../utils/clubTime';
import { CLUB_WHATSAPP_URL } from '../../config/contact';
import '../../styles/booking.css';

const DAY_NAMES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

// Classes are coordinated with the coach, so the request goes to the club's WhatsApp
// with day and time already filled in instead of blocking a court automatically.
function ClassSheet({ coach, onClose }) {
  const today = clubNow().date;
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today]);
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const slots = (coach.enabledSlots || []).filter(s => !isStartPast(date, s.split(' - ')[0]));
  const message = `Hola Black Club, quiero una clase con ${coach.name}` +
    (slot ? ` el ${formatFullDate(date)} a las ${slot.split(' - ')[0]}` : '') +
    (name.trim() ? `. Mi nombre es ${name.trim()}` : '') + '.';

  return (
    <div className="bk-sheet-backdrop" onClick={onClose}>
      <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="class-title" onClick={(e) => e.stopPropagation()}>
        <div className="bk-sheet-handle" />
        <div className="bk-sheet-head">
          <div>
            <span className="eyebrow">Clase particular</span>
            <h3 id="class-title" className="bk-sheet-title">{coach.name}</h3>
          </div>
          <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="bk-field">
          <label>Día</label>
          <div className="bk-days" style={{ margin: 0, padding: '2px 0 6px' }}>
            {days.map((d, i) => (
              <button key={d} type="button" className={`bk-day ${d === date ? 'is-active' : ''}`} onClick={() => { setDate(d); setSlot(''); }}>
                <span className="bk-day-name">{i === 0 ? 'hoy' : DAY_NAMES[weekdayOf(d)]}</span>
                <span className="bk-day-num">{Number(d.slice(8, 10))}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bk-field">
          <label>Horario</label>
          {slots.length === 0
            ? <span className="bk-hint">No quedan horarios de {coach.name.split(' ')[0]} este día.</span>
            : (
              <div className="slot-row">
                {slots.map(s => (
                  <button key={s} type="button" className={slot === s ? 'is-active' : ''} onClick={() => setSlot(s)}>
                    {s.split(' - ')[0]}
                  </button>
                ))}
              </div>
            )}
        </div>

        <div className="bk-field">
          <label htmlFor="class-name">Tu nombre</label>
          <input id="class-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="bk-summary">
          <div className="bk-summary-row"><span>Clase de 1 hora</span><strong>{formatGs(coach.rate)}</strong></div>
        </div>

        <a
          className="bk-primary is-whatsapp"
          aria-disabled={!slot}
          style={!slot ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          href={`${CLUB_WHATSAPP_URL}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={18} /> Pedir la clase por WhatsApp
        </a>
        <p className="bk-hint" style={{ textAlign: 'center', marginTop: 10 }}>El coach te confirma y el club reserva la cancha.</p>
      </div>
    </div>
  );
}

export function BlackTeamView() {
  const { coaches } = useClub();
  const [activeCoach, setActiveCoach] = useState(null);

  return (
    <div className="sec">
      <div className="sec-head">
        <span className="eyebrow">Academia BlackTeam</span>
        <h2 className="sec-title">Aprendé con los que compiten</h2>
        <p className="sec-lead">Clases particulares y clínicas para todos los niveles, de la iniciación a la competencia.</p>
      </div>

      <div className="grid-cards is-3">
        {coaches.map(coach => (
          <article key={coach.id} className="card">
            <div className="card-media" style={{ backgroundImage: `url(${coach.avatar || '/images/blackteam.jpg'})` }} />
            <div>
              <div className="card-sub">{coach.role}</div>
              <h3 className="card-title" style={{ marginTop: 6 }}>{coach.name}</h3>
            </div>
            <p className="card-text">{coach.bio}</p>
            {coach.credentials && (
              <div className="chip-row">
                {coach.credentials.split('·').map(c => <span key={c} className="chip">{c.trim()}</span>)}
              </div>
            )}
            <div className="card-price"><strong>{formatGs(coach.rate).replace(' Gs.', '')}</strong><span>Gs. / clase</span></div>
            <button type="button" className="lux-btn" onClick={() => setActiveCoach(coach)}>
              Reservar clase <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>

      {activeCoach && <ClassSheet coach={activeCoach} onClose={() => setActiveCoach(null)} />}
    </div>
  );
}
