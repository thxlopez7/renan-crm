import React, { useEffect, useMemo, useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { fetchPaymentsSince, fetchRecentRegisters } from '../../services/clubService';
import { addDays, clubNow, toMinutes } from '../../utils/clubTime';
import { formatGs } from '../../utils/formatters';
import { formatPyPhone } from '../../utils/phone';
import '../../styles/booking.css';
import '../../styles/admin.css';

const RANGES = [
  { id: 1, label: 'Hoy' },
  { id: 7, label: '7 días' },
  { id: 30, label: '30 días' }
];
const BANDS = [
  { label: 'Mañana', from: 7 * 60, to: 12 * 60 },
  { label: 'Siesta', from: 12 * 60, to: 16 * 60 },
  { label: 'Tarde', from: 16 * 60, to: 19 * 60 },
  { label: 'Noche', from: 19 * 60, to: 24 * 60 }
];
const OCCUPYING = ['Pendiente', 'Confirmada', 'Jugando', 'Finalizada'];

// Single-hue magnitude bars with the value printed as text; color never carries meaning alone
function BarList({ rows, format = (v) => v, max }) {
  const top = max ?? Math.max(1, ...rows.map(r => r.value));
  return (
    <div className="dash-bars">
      {rows.map(row => (
        <div key={row.label} className="dash-bar-row" title={`${row.label}: ${format(row.value)}`}>
          <span className="dash-bar-label">{row.label}</span>
          <span className="dash-bar-track">
            <span className="dash-bar-fill" style={{ width: `${Math.max(row.value > 0 ? 2 : 0, (row.value / top) * 100)}%` }} />
          </span>
          <span className="dash-bar-value">{format(row.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function OwnerDashboard() {
  const { bookings, tabs, courts, pricingConfig, calculateTabBalances } = useClub();
  const [range, setRange] = useState(7);
  const [registers, setRegisters] = useState([]);
  const [payments, setPayments] = useState(null);
  const today = clubNow().date;
  const from = addDays(today, -(range - 1));

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    fetchRecentRegisters(5).then(setRegisters).catch(() => setRegisters([]));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    fetchPaymentsSince(from).then(setPayments).catch(() => setPayments(null));
  }, [from]);

  const stats = useMemo(() => {
    const inRange = (date) => date >= from && date <= today;
    const rangeBookings = bookings.filter(b => inRange(b.date) && b.category !== 'Bloqueo');
    const played = rangeBookings.filter(b => OCCUPYING.includes(b.status));
    const settled = tabs.filter(t => t.status === 'settled' && t.cashedDate && inRange(t.cashedDate));

    const revenue = { court: 0, bar: 0, total: 0 };
    const byMethod = {};
    settled.forEach(t => {
      const b = calculateTabBalances(t);
      revenue.court += b.courtBase + b.racketCharge + b.ballTubeCharge;
      revenue.bar += b.itemsTotal;
      revenue.total += b.grossTotal;
      byMethod[t.paymentMethod || 'Sin dato'] = (byMethod[t.paymentMethod || 'Sin dato'] || 0) + b.netPending;
    });

    // Real split per method from tab_payments (a "Mixto" tab counts in each method it used);
    // change is handed back in cash, so it comes off the cash total
    let methodTotals = byMethod;
    if (payments) {
      methodTotals = {};
      payments.forEach(p => { methodTotals[p.method] = (methodTotals[p.method] || 0) + p.amount; });
      const paidTabIds = new Set(payments.map(p => p.tab_id));
      const change = tabs.filter(t => paidTabIds.has(t.id)).reduce((sum, t) => sum + (t.changeGiven || 0), 0);
      if (change && methodTotals.Efectivo) methodTotals.Efectivo -= change;
    }

    const openMin = Number(pricingConfig.openHour) * 60;
    const closeMin = Number(pricingConfig.closeHour) * 60;
    const activeCourts = courts.filter(c => c.status === 'operational');
    const capacity = activeCourts.length * (closeMin - openMin) * range;
    const bookedMinutes = played.reduce((sum, b) => sum + b.durationMinutes, 0);

    const bands = BANDS.map(band => {
      const start = Math.max(band.from, openMin);
      const end = Math.min(band.to, closeMin);
      const bandCapacity = Math.max(0, end - start) * activeCourts.length * range;
      const used = played.reduce((sum, b) => {
        const s = toMinutes(b.startTime);
        const e = s + b.durationMinutes;
        return sum + Math.max(0, Math.min(e, end) - Math.max(s, start));
      }, 0);
      return { label: band.label, value: bandCapacity ? Math.round((used / bandCapacity) * 100) : 0 };
    });

    const perCourt = courts.map(c => {
      const minutes = played.filter(b => b.courtId === c.id).reduce((sum, b) => sum + b.durationMinutes, 0);
      const cap = (closeMin - openMin) * range;
      return { label: c.name.replace(/\s*\(.*\)/, ''), value: cap ? Math.round((minutes / cap) * 100) : 0 };
    });

    const clients = {};
    played.forEach(b => {
      const key = b.clientPhone || b.clientName;
      if (!clients[key]) clients[key] = { name: b.clientName, phone: b.clientPhone, games: 0, spent: 0 };
      clients[key].games += 1;
      clients[key].spent += b.courtAmount || 0;
    });

    return {
      revenue,
      byMethod: Object.entries(methodTotals)
        .filter(([, value]) => value > 0)
        .map(([label, value]) => ({ label, value }))
        .sort((x, y) => y.value - x.value),
      occupancy: capacity ? Math.round((bookedMinutes / capacity) * 100) : 0,
      bookingsCount: played.length,
      hours: Math.round(bookedMinutes / 60),
      noShows: rangeBookings.filter(b => b.status === 'No vino').length,
      cancelled: rangeBookings.filter(b => b.status === 'Cancelada').length,
      bands,
      perCourt,
      topClients: Object.values(clients).sort((a, b) => b.spent - a.spent).slice(0, 5)
    };
  }, [bookings, tabs, courts, pricingConfig, calculateTabBalances, from, today, range, payments]);

  return (
    <div className="ag dash">
      <div className="dash-head">
        <div>
          <h2 className="bk-title" style={{ fontSize: 34 }}>Panel del dueño</h2>
          <p className="bk-subtitle">{range === 1 ? 'Hoy' : `Últimos ${range} días`}</p>
        </div>
        <div className="ag-chips">
          {RANGES.map(r => (
            <button key={r.id} type="button" className={`ag-chip ${range === r.id ? 'is-active' : ''}`} onClick={() => setRange(r.id)}>{r.label}</button>
          ))}
        </div>
      </div>

      <div className="dash-tiles">
        <div className="dash-tile is-hero">
          <span>Facturado</span>
          <strong>{formatGs(stats.revenue.total)}</strong>
          <small>Canchas {formatGs(stats.revenue.court)} · Bar {formatGs(stats.revenue.bar)}</small>
        </div>
        <div className="dash-tile"><span>Ocupación</span><strong>{stats.occupancy}%</strong><small>{stats.hours} h jugadas</small></div>
        <div className="dash-tile"><span>Reservas</span><strong>{stats.bookingsCount}</strong><small>{stats.cancelled} canceladas</small></div>
        <div className="dash-tile"><span>No vinieron</span><strong>{stats.noShows}</strong><small>turnos perdidos</small></div>
      </div>

      <div className="dash-grid">
        <section className="set-card">
          <div className="set-head"><h3>Ocupación por franja</h3></div>
          <BarList rows={stats.bands} max={100} format={(v) => `${v}%`} />
          <p className="bk-hint" style={{ marginTop: 10 }}>Dónde conviene hacer promociones: las franjas más vacías.</p>
        </section>

        <section className="set-card">
          <div className="set-head"><h3>Ocupación por cancha</h3></div>
          <BarList rows={stats.perCourt} max={100} format={(v) => `${v}%`} />
        </section>

        <section className="set-card">
          <div className="set-head"><h3>Cobrado por medio de pago</h3></div>
          {stats.byMethod.length === 0
            ? <p className="bk-hint">Todavía no hay cobros en este período.</p>
            : <BarList rows={stats.byMethod} format={formatGs} />}
        </section>

        <section className="set-card">
          <div className="set-head"><h3>Mejores clientes</h3></div>
          {stats.topClients.length === 0 ? <p className="bk-hint">Sin reservas en este período.</p> : (
            <div className="dash-clients">
              {stats.topClients.map((c, i) => (
                <div key={c.phone || c.name} className="dash-client">
                  <span className="dash-rank">{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{c.name}</strong>
                    <small>{c.phone ? formatPyPhone(c.phone) : 'sin celular'} · {c.games} {c.games === 1 ? 'turno' : 'turnos'}</small>
                  </div>
                  <span className="dash-bar-value">{formatGs(c.spent)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {registers.length > 0 && (
          <section className="set-card">
            <div className="set-head"><h3>Últimos cierres de caja</h3></div>
            <div className="dash-clients">
              {registers.map(r => (
                <div key={r.id} className="dash-client">
                  <div style={{ flex: 1 }}>
                    <strong>{new Date(r.openedAt).toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Asuncion' })}</strong>
                    <small>{r.status === 'open' ? 'Abierta ahora' : `Cobrado ${formatGs(r.totalCollected)}`}</small>
                  </div>
                  {r.status === 'closed' && (
                    <span className="dash-bar-value" style={{ color: r.cashDifference === 0 ? '#34D399' : '#F87171' }}>
                      {r.cashDifference === 0 ? 'Cuadró' : `${r.cashDifference > 0 ? '+' : ''}${formatGs(r.cashDifference)}`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
