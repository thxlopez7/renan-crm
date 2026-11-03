import React, { useState } from 'react';
import { ArrowDown, Award, Calendar, Dumbbell, MapPin, Search, Trophy, UtensilsCrossed } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { BookingFlow } from './BookingFlow';
import { MyBookingView } from './MyBookingView';
import { BlackBarMenuView } from './BlackBarMenuView';
import { BlackTeamView } from './BlackTeamView';
import { BlackGymView } from './BlackGymView';
import { TournamentsView } from './TournamentsView';
import { CLUB_PHONE_DISPLAY, CLUB_WHATSAPP_URL } from '../../config/contact';
import { clubNow, weekdayOf } from '../../utils/clubTime';
import '../../styles/lux.css';

const SECTIONS = [
  { id: 'courts', label: 'Pádel', fullLabel: 'Reservar', icon: Calendar },
  { id: 'gym', label: 'Gym', fullLabel: 'BlackGym', icon: Dumbbell },
  { id: 'team', label: 'Clases', fullLabel: 'Academia', icon: Award },
  { id: 'tournaments', label: 'Torneos', fullLabel: 'Torneos', icon: Trophy },
  { id: 'bar', label: 'Bar', fullLabel: 'Bar & Lounge', icon: UtensilsCrossed }
];

// Opening hours in club time. Gym: Mon-Fri 07-12 / 14-21, Sat 08-13. Bar: every day 17-00.
function venueStatus() {
  const now = clubNow();
  const day = weekdayOf(now.date);
  const h = now.minutes / 60;
  const gymOpen = (day >= 1 && day <= 5 && ((h >= 7 && h < 12) || (h >= 14 && h < 21))) || (day === 6 && h >= 8 && h < 13);
  const barOpen = h >= 17;
  return [
    { label: 'Canchas', value: 'Hasta medianoche', open: h >= 7 },
    { label: 'BlackGym', value: gymOpen ? 'Abierto ahora' : 'Cerrado', open: gymOpen },
    { label: 'Bar & Lounge', value: barOpen ? 'Abierto hasta 00:00' : 'Abre 17:00', open: barOpen }
  ];
}

export function PublicPortal() {
  const { courts } = useClub();
  const [activeTab, setActiveTab] = useState('courts');
  // "#mi-reserva" opens the self-service view (shareable link)
  const [showMyBooking, setShowMyBooking] = useState(() => typeof window !== 'undefined' && window.location.hash === '#mi-reserva');
  const openCourts = courts.filter(c => c.status === 'operational').length;

  const goTo = (id) => {
    setActiveTab(id);
    setShowMyBooking(false);
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    document.getElementById('contenido')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openMyBooking = () => {
    setActiveTab('courts');
    setShowMyBooking(true);
    window.history.replaceState(null, '', '#mi-reserva');
    document.getElementById('contenido')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const closeMyBooking = () => {
    setShowMyBooking(false);
    window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div className="lux">
      <header className="lux-hero">
        <div className="lux-hero-media" />
        <div className="lux-hero-inner">
          <span className="eyebrow">Asunción · Paraguay</span>
          <h1 className="display lux-hero-title">
            Black Club
            <em>pádel, cuerpo y sobremesa.</em>
          </h1>
          <p className="lux-hero-copy">
            {openCourts} canchas de nivel profesional, gimnasio Biostrength y un lounge para el tercer tiempo.
            Reservá en segundos, sin seña.
          </p>
          <div className="lux-hero-actions">
            <button type="button" className="lux-btn is-solid" onClick={() => goTo('courts')}>
              Reservar cancha <ArrowDown size={16} />
            </button>
            <button type="button" className="lux-btn" onClick={openMyBooking}>
              <Search size={15} /> Mi reserva
            </button>
          </div>
          <dl className="lux-status">
            {venueStatus().map(s => (
              <div key={s.label}>
                <dt><span className={`lux-dot ${s.open ? 'is-open' : ''}`} />{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <nav className="lux-tabs hide-mobile" aria-label="Secciones">
        {SECTIONS.map(item => (
          <button
            key={item.id}
            type="button"
            className={activeTab === item.id ? 'is-active' : ''}
            aria-current={activeTab === item.id ? 'page' : undefined}
            onClick={() => goTo(item.id)}
          >
            {item.fullLabel}
          </button>
        ))}
      </nav>

      <main id="contenido" className="lux-main">
        {activeTab === 'courts' && (showMyBooking
          ? <MyBookingView onBack={closeMyBooking} />
          : <BookingFlow onOpenMyBooking={openMyBooking} />)}
        {activeTab === 'gym' && <BlackGymView />}
        {activeTab === 'team' && <BlackTeamView />}
        {activeTab === 'tournaments' && <TournamentsView />}
        {activeTab === 'bar' && <BlackBarMenuView />}
      </main>

      <footer className="lux-footer">
        <div>
          <div className="display lux-footer-brand">Black Club</div>
          <p>Pádel · BlackGym · Academia · Bar & Lounge</p>
        </div>
        <div className="lux-footer-links">
          <a href="https://maps.google.com/?q=Black+Club+Padel+Paraguay" target="_blank" rel="noopener noreferrer">
            <MapPin size={14} /> Cómo llegar
          </a>
          <a href="https://instagram.com/blackclubparaguay" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={CLUB_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp {CLUB_PHONE_DISPLAY}</a>
        </div>
        <small>© {new Date().getFullYear()} Black Club Paraguay</small>
      </footer>

      <nav className="lux-bottom-nav show-mobile-flex" aria-label="Secciones">
        {SECTIONS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? 'is-active' : ''}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => goTo(item.id)}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
