import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, MessageCircle, Search, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { addDays, clubNow, formatDuration } from '../../utils/clubTime';
import { formatGs } from '../../utils/formatters';
import { formatPyPhone, normalizePyPhone, whatsappLink } from '../../utils/phone';
import { longDate } from './ScheduleView';
import '../../styles/booking.css';
import '../../styles/admin.css';

const SEGMENTS = [
  { id: 'all', label: 'Todos' },
  { id: 'frequent', label: 'Frecuentes' },
  { id: 'inactive', label: 'Hace +30 días' },
  { id: 'noshow', label: 'Faltaron' }
];
const PLAYED = ['Confirmada', 'Jugando', 'Finalizada'];

function ClientSheet({ client, courtName, onClose }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const waUrl = whatsappLink(client.phone);

  return (
    <div className="bk-sheet-backdrop" onClick={onClose}>
      <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="cl-title" onClick={(e) => e.stopPropagation()}>
        <div className="bk-sheet-handle" />
        <div className="bk-sheet-head">
          <div>
            <h3 id="cl-title" className="bk-sheet-title">{client.name}</h3>
            <p className="bk-hint">{client.phone ? formatPyPhone(client.phone) : 'Sin celular'}</p>
          </div>
          <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ag-summary" style={{ marginBottom: 14 }}>
          <div className="ag-stat"><strong>{client.games}</strong><span>turnos</span></div>
          <div className="ag-stat"><strong style={{ fontSize: 14 }}>{formatGs(client.spent)}</strong><span>en canchas</span></div>
          <div className="ag-stat"><strong>{client.noShows}</strong><span>faltó</span></div>
        </div>

        {waUrl && (
          <a className="bk-primary is-whatsapp" style={{ marginBottom: 14 }} href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> Escribir por WhatsApp
          </a>
        )}

        <div className="set-head" style={{ marginBottom: 8 }}><h3>Historial</h3></div>
        <div className="dash-clients">
          {client.history.slice(0, 20).map(b => (
            <div key={b.id} className="dash-client">
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{longDate(b.date)}</strong>
                <small>{courtName(b.courtId)} · {b.startTime} · {formatDuration(b.durationMinutes)}</small>
              </div>
              <span className={`bk-status ${b.status === 'No vino' || b.status === 'Cancelada' ? 'is-cancelled' : b.status === 'Pendiente' ? 'is-pending' : 'is-neutral'}`}>
                {b.status === 'Finalizada' ? 'Jugó' : b.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClientsView() {
  const { players, bookings, courts } = useClub();
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [selectedKey, setSelectedKey] = useState(null);
  const today = clubNow().date;
  const monthAgo = addDays(today, -30);

  // One row per client, keyed by normalized phone so "0981…" and "+595981…" are the same person
  const clients = useMemo(() => {
    const map = new Map();
    const keyOf = (phone, name) => normalizePyPhone(phone) || `name:${(name || '').trim().toLowerCase()}`;

    players.forEach(p => {
      map.set(keyOf(p.phone, p.name), { key: keyOf(p.phone, p.name), name: p.name, phone: normalizePyPhone(p.phone), history: [] });
    });
    bookings
      .filter(b => b.category !== 'Bloqueo' && b.clientName)
      .forEach(b => {
        const key = keyOf(b.clientPhone, b.clientName);
        if (!map.has(key)) map.set(key, { key, name: b.clientName, phone: normalizePyPhone(b.clientPhone), history: [] });
        map.get(key).history.push(b);
      });

    return [...map.values()].map(c => {
      const history = c.history.sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
      const played = history.filter(b => PLAYED.includes(b.status) && b.date <= today);
      return {
        ...c,
        history,
        games: played.length,
        recentGames: played.filter(b => b.date >= monthAgo).length,
        spent: played.reduce((sum, b) => sum + (b.courtAmount || 0), 0),
        noShows: history.filter(b => b.status === 'No vino').length,
        lastPlayed: played[0]?.date || null,
        next: history.filter(b => b.date >= today && ['Pendiente', 'Confirmada'].includes(b.status)).pop() || null
      };
    });
  }, [players, bookings, today, monthAgo]);

  const visible = clients
    .filter(c => {
      if (segment === 'frequent') return c.recentGames >= 4;
      if (segment === 'inactive') return c.lastPlayed && c.lastPlayed < monthAgo && !c.next;
      if (segment === 'noshow') return c.noShows > 0;
      return true;
    })
    .filter(c => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const digits = q.replace(/\D/g, '');
      return c.name.toLowerCase().includes(q) || (digits.length >= 3 && (c.phone || '').includes(digits.replace(/^0/, '')));
    })
    .sort((a, b) => (b.lastPlayed || '').localeCompare(a.lastPlayed || '') || b.games - a.games);

  const courtName = (id) => courts.find(c => c.id === id)?.name.replace(/\s*\(.*\)/, '') || 'Cancha';
  const selected = clients.find(c => c.key === selectedKey);

  return (
    <div className="ag">
      <div>
        <h2 className="bk-title" style={{ fontSize: 34 }}>Clientes</h2>
        <p className="bk-subtitle">{clients.length} jugadores · se agregan solos al reservar</p>
      </div>

      <div className="cash-search">
        <Search size={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre o celular" aria-label="Buscar cliente" />
      </div>

      <div className="ag-chips cash-cats">
        {SEGMENTS.map(s => (
          <button key={s.id} type="button" className={`ag-chip ${segment === s.id ? 'is-active' : ''}`} onClick={() => setSegment(s.id)}>{s.label}</button>
        ))}
      </div>

      {segment === 'inactive' && visible.length > 0 && (
        <p className="bk-hint">Ideal para mandarles una promo por WhatsApp para que vuelvan.</p>
      )}

      <div className="cash-list">
        {visible.length === 0 && <div className="bk-empty"><strong>No hay clientes en esta lista</strong></div>}
        {visible.map(c => (
          <button key={c.key} type="button" className="cash-tab" onClick={() => setSelectedKey(c.key)}>
            <div style={{ minWidth: 0 }}>
              <div className="cash-tab-name">{c.name}</div>
              <div className="cash-tab-meta">
                {c.phone ? formatPyPhone(c.phone) : 'sin celular'}
                {' · '}{c.games} {c.games === 1 ? 'turno' : 'turnos'}
                {c.next ? ` · próximo ${c.next.date === today ? 'hoy' : c.next.date.slice(8, 10) + '/' + c.next.date.slice(5, 7)} ${c.next.startTime}` : c.lastPlayed ? ` · último ${c.lastPlayed.slice(8, 10)}/${c.lastPlayed.slice(5, 7)}` : ''}
                {c.noShows > 0 && ` · faltó ${c.noShows}`}
              </div>
            </div>
            <ChevronRight size={18} color="#71717A" />
          </button>
        ))}
      </div>

      {selected && <ClientSheet client={selected} courtName={courtName} onClose={() => setSelectedKey(null)} />}
    </div>
  );
}
