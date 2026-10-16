import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs, formatShortDate } from '../../utils/formatters';
import { ConciergeDrawer } from './ConciergeDrawer';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  ChevronRight,
  Filter
} from 'lucide-react';

export function CourtsBookingView() {
  const { courts, timeSlots, bookings, selectedDate, setSelectedDate } = useClub();

  const [selectedCourtFilter, setSelectedCourtFilter] = useState('all');
  const [activeSlotData, setActiveSlotData] = useState(null);

  // Generate 7 consecutive days starting from today
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
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

  const filteredCourts = selectedCourtFilter === 'all'
    ? courts
    : courts.filter(c => c.id === selectedCourtFilter);

  return (
    <div>
      {/* Date Selector Bar */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="tracking-luxury">FECHA DE JUEGO SELECCIONADA</span>
          <span style={{ fontSize: '12px', color: '#A1A1AA' }}>Bloques oficiales de 90 minutos</span>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          overflowX: 'auto', 
          paddingBottom: '8px' 
        }}>
          {dateOptions.map(option => {
            const isSelected = option.dateStr === selectedDate;
            return (
              <button
                key={option.dateStr}
                onClick={() => setSelectedDate(option.dateStr)}
                style={{
                  minWidth: '85px',
                  padding: '12px 10px',
                  backgroundColor: isSelected ? '#F4F4F6' : '#111115',
                  color: isSelected ? '#070709' : '#A1A1AA',
                  border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 150ms ease'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {option.dayName}
                </span>
                <span className="font-tabular" style={{ fontSize: '18px', fontWeight: 700 }}>
                  {option.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Court Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCourtFilter('all')}
          style={{
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '4px',
            border: selectedCourtFilter === 'all' ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: selectedCourtFilter === 'all' ? '#1E1E26' : 'transparent',
            color: selectedCourtFilter === 'all' ? '#FFFFFF' : '#71717A',
            cursor: 'pointer'
          }}
        >
          Todas las Pistas (3)
        </button>
        {courts.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCourtFilter(c.id)}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '4px',
              border: selectedCourtFilter === c.id ? '1px solid #C5A880' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: selectedCourtFilter === c.id ? 'rgba(197, 168, 128, 0.1)' : 'transparent',
              color: selectedCourtFilter === c.id ? '#C5A880' : '#71717A',
              cursor: 'pointer'
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Courts & Slots Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {filteredCourts.map(court => {
          return (
            <div 
              key={court.id} 
              className="card-obsidian" 
              style={{ backgroundColor: '#0D0D11', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              {/* Court Header Card */}
              <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                backgroundColor: '#121216'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="status-dot emerald"></span>
                    <span className="tracking-luxury" style={{ color: '#C5A880' }}>{court.code}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F4F4F6', marginTop: '3px' }}>
                    {court.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '4px' }}>
                    {court.specs}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tracking-luxury">TARIFA POR 90 MINUTOS</div>
                  <div className="font-tabular" style={{ fontSize: '20px', fontWeight: 700, color: '#F4F4F6', marginTop: '2px' }}>
                    {formatGs(court.rate)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#71717A' }}>
                    Equivale a {formatGs(Math.round(court.rate / 4))} / jugador
                  </div>
                </div>
              </div>

              {/* Slot Matrix */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#71717A', marginBottom: '12px' }}>
                  DISPONIBILIDAD HORARIA · 90 MINUTOS
                </div>

                <div className="slots-grid">
                  {timeSlots.map(slot => {
                    const booking = bookings.find(
                      b => b.courtId === court.id && b.date === selectedDate && b.timeSlot === slot && b.status !== 'Cancelada'
                    );

                    if (booking) {
                      // Slot occupied
                      const isFixedPass = booking.category === 'Abono Fijo Semanal';
                      const isBlackTeam = booking.category === 'Clase BlackTeam';

                      return (
                        <div
                          key={slot}
                          style={{
                            padding: '12px 10px',
                            backgroundColor: '#141419',
                            border: isFixedPass ? '1px solid rgba(197, 168, 128, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '4px',
                            opacity: 0.75,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className="font-tabular" style={{ fontSize: '11.5px', color: '#A1A1AA', fontWeight: 500 }}>
                              {slot.split(' - ')[0]}
                            </span>
                            <span 
                              className={`status-dot ${isFixedPass ? 'bronze' : isBlackTeam ? 'blue' : 'terracotta'}`}
                            ></span>
                          </div>

                          <div style={{ 
                            fontSize: '11px', 
                            fontWeight: 600, 
                            color: isFixedPass ? '#C5A880' : isBlackTeam ? '#38BDF8' : '#A1A1AA',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {isFixedPass ? 'Abono Fijo' : isBlackTeam ? 'BlackTeam' : 'Reservada'}
                          </div>

                          <div style={{ fontSize: '10px', color: '#52525B' }}>
                            No disponible
                          </div>
                        </div>
                      );
                    }

                    // Slot available
                    return (
                      <button
                        key={slot}
                        onClick={() => setActiveSlotData({ court, timeSlot: slot, date: selectedDate })}
                        style={{
                          padding: '12px 10px',
                          backgroundColor: '#16161D',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px',
                          textAlign: 'left',
                          transition: 'all 150ms ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#FFFFFF';
                          e.currentTarget.style.backgroundColor = '#1E1E28';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.backgroundColor = '#16161D';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="font-tabular" style={{ fontSize: '12px', fontWeight: 600, color: '#F4F4F6' }}>
                            {slot.split(' - ')[0]}
                          </span>
                          <span className="status-dot emerald"></span>
                        </div>

                        <div className="font-tabular" style={{ fontSize: '12px', color: '#C5A880', fontWeight: 600 }}>
                          {formatGs(court.rate)}
                        </div>

                        <div style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span>Disponible</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Concierge Drawer */}
      {activeSlotData && (
        <ConciergeDrawer
          slotData={activeSlotData}
          onClose={() => setActiveSlotData(null)}
        />
      )}
    </div>
  );
}
