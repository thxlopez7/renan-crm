import React, { useState, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatShortDate } from '../../utils/formatters';
import { isSlotPast } from '../../utils/dateHelpers';
import { ConciergeDrawer } from './ConciergeDrawer';
import { Calendar } from 'lucide-react';

export function CourtsBookingView() {
  const { courts, timeSlots, bookings, selectedDate, setSelectedDate } = useClub();

  const [selectedCourtFilter, setSelectedCourtFilter] = useState('all');
  const [activeSlotData, setActiveSlotData] = useState(null);

  // Generate 7 consecutive days starting from today
  const dateOptions = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return {
        dateStr,
        dayName: i === 0 ? 'Hoy' : days[d.getDay()],
        dayNumber: d.getDate(),
        formatted: formatShortDate(dateStr)
      };
    });
  }, []);

  const filteredCourts = selectedCourtFilter === 'all'
    ? courts
    : courts.filter(c => c.id === selectedCourtFilter);

  return (
    <div>
      {/* Date Carousel Selector (Ultra-Fast 3-second selection) */}
      <div style={{ marginBottom: '18px' }}>
        <div className="date-carousel">
          {dateOptions.map(option => {
            const isSelected = option.dateStr === selectedDate;
            return (
              <button
                key={option.dateStr}
                onClick={() => setSelectedDate(option.dateStr)}
                style={{
                  minWidth: '72px',
                  padding: '9px 8px',
                  backgroundColor: isSelected ? '#FFFFFF' : '#111113',
                  color: isSelected ? '#09090B' : '#A1A1AA',
                  border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  transition: 'all 120ms ease',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {option.dayName}
                </span>
                <span className="font-tabular" style={{ fontSize: '17px', fontWeight: 800 }}>
                  {option.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Court Filter Pills with Right Fade Indicator */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingRight: '36px',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          <button
            onClick={() => setSelectedCourtFilter('all')}
            style={{
              padding: '7px 14px',
              fontSize: '11.5px',
              fontWeight: 700,
              borderRadius: '20px',
              border: selectedCourtFilter === 'all' ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: selectedCourtFilter === 'all' ? '#FFFFFF' : '#111113',
              color: selectedCourtFilter === 'all' ? '#09090B' : '#A1A1AA',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 120ms ease'
            }}
          >
            Todas ({courts.length})
          </button>
          {courts.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCourtFilter(c.id)}
              style={{
                padding: '7px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '20px',
                border: selectedCourtFilter === c.id ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: selectedCourtFilter === c.id ? '#FFFFFF' : '#111113',
                color: selectedCourtFilter === c.id ? '#09090B' : '#A1A1AA',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 120ms ease'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
        {/* Right edge fade gradient indicating horizontal scroll */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '32px',
          background: 'linear-gradient(to right, transparent, rgba(9, 9, 11, 0.95))',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Visual Status Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '18px',
        padding: '7px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '11px',
        color: '#A1A1AA',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span className="status-dot emerald" style={{ width: '6px', height: '6px' }}></span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Disponible</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span className="status-dot muted" style={{ width: '5px', height: '5px' }}></span>
          <span>Ocupado / Reservado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '10px', color: '#52525B', fontWeight: 700 }}>✕</span>
          <span style={{ color: '#71717A' }}>Hora Pasada</span>
        </div>
      </div>

      {/* Courts & Slots Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredCourts.map(court => {
          return (
            <div 
              key={court.id} 
              className="card-obsidian" 
              style={{ backgroundColor: '#111113', border: '1px solid rgba(255, 255, 255, 0.07)' }}
            >
              {/* Court Header: Shows Court Name, Specs, Total Rate */}
              <div style={{ 
                padding: '14px 18px', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#141417'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="status-dot emerald"></span>
                    <span className="tracking-luxury" style={{ color: '#A1A1AA' }}>{court.code}</span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                    {court.name}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#71717A', marginTop: '1px' }}>
                    {court.specs?.split('·')[0]}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                    {formatGs(court.rate)} <span style={{ fontSize: '11px', fontWeight: 400, color: '#71717A' }}>/ hora</span>
                  </div>
                </div>
              </div>

              {/* Clean Time Pill Grid with Real-Time Availability */}
              <div style={{ padding: '14px 16px' }}>
                <div className="slots-grid">
                  {timeSlots.map(slot => {
                    const booking = bookings.find(
                      b => b.courtId === court.id && b.date === selectedDate && b.timeSlot === slot && b.status !== 'Cancelada'
                    );

                    const startTime = slot.split(' - ')[0];
                    const isPast = isSlotPast(slot, selectedDate);

                    if (isPast) {
                      return (
                        <button
                          key={slot}
                          disabled
                          className="time-pill past"
                          title={`Turno pasado: ${slot}`}
                        >
                          <span>{startTime}</span>
                          <span style={{ fontSize: '9px', color: '#52525B', lineHeight: 1 }}>✕</span>
                        </button>
                      );
                    }

                    if (booking) {
                      return (
                        <button
                          key={slot}
                          disabled
                          className="time-pill occupied"
                          title={`Ocupado: ${slot}`}
                        >
                          <span>{startTime}</span>
                          <span className="status-dot muted" style={{ width: '4px', height: '4px' }}></span>
                        </button>
                      );
                    }

                    // Available Clean Time Pill
                    return (
                      <button
                        key={slot}
                        onClick={() => setActiveSlotData({ court, timeSlot: slot, date: selectedDate })}
                        className="time-pill available"
                        title={`Disponible: ${slot} (1 hora)`}
                      >
                        <span>{startTime}</span>
                        <span className="status-dot emerald" style={{ width: '5px', height: '5px' }}></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over / Mobile Bottom Sheet Drawer */}
      {activeSlotData && (
        <ConciergeDrawer
          slotData={activeSlotData}
          onClose={() => setActiveSlotData(null)}
        />
      )}
    </div>
  );
}
