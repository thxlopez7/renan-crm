import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Loader2, X } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';
import { formatPyPhone, normalizePyPhone } from '../../utils/phone';
import '../../styles/booking.css';

function ApplySheet({ plan, onClose }) {
  const { applyGymMembership } = useClub();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) return setError('Ingresá tu nombre.');
    if (!normalizePyPhone(phone)) return setError('Ingresá un celular válido, por ejemplo 0981 123 456.');
    setSaving(true);
    applyGymMembership({ planId: plan.id, clientName: name.trim(), clientPhone: normalizePyPhone(phone), email: email.trim() });
    setSaving(false);
    setSent(true);
  };

  return (
    <div className="bk-sheet-backdrop" onClick={onClose}>
      <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="gym-title" onClick={(e) => e.stopPropagation()}>
        <div className="bk-sheet-handle" />
        {sent ? (
          <div className="bk-success">
            <div className="bk-success-icon"><Check size={28} strokeWidth={2.5} /></div>
            <h3 id="gym-title" className="bk-sheet-title">Solicitud enviada</h3>
            <p className="bk-subtitle" style={{ margin: '8px 0 18px' }}>
              Te escribimos por WhatsApp para coordinar tu evaluación inicial y el alta en {plan.name}.
            </p>
            <button type="button" className="bk-primary" onClick={onClose}>Listo</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="bk-sheet-head">
              <div>
                <span className="eyebrow">Gimnasio BlackGym</span>
                <h3 id="gym-title" className="bk-sheet-title">{plan.name}</h3>
              </div>
              <button type="button" className="bk-icon-btn" aria-label="Cerrar" onClick={onClose}><X size={18} /></button>
            </div>
            <div className="bk-summary">
              <div className="bk-summary-row"><span>{plan.period}</span><strong>{formatGs(plan.price)}</strong></div>
            </div>
            <div className="bk-field">
              <label htmlFor="gym-name">Nombre y apellido</label>
              <input id="gym-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="gym-phone">Celular (WhatsApp)</label>
              <input
                id="gym-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0981 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => normalizePyPhone(phone) && setPhone(formatPyPhone(phone))}
              />
            </div>
            <div className="bk-field">
              <label htmlFor="gym-email">Correo electrónico (opcional)</label>
              <input id="gym-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <div className="bk-error" role="alert">{error}</div>}
            <button type="submit" className="bk-primary" disabled={saving}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : 'Solicitar alta'}
            </button>
            <p className="bk-hint" style={{ textAlign: 'center', marginTop: 10 }}>Sin compromiso. El pago se hace en el club.</p>
          </form>
        )}
      </div>
    </div>
  );
}

export function BlackGymView() {
  const { gymPlans } = useClub();
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="sec">
      <div className="sec-banner" style={{ backgroundImage: 'url(/images/gym-rack.jpg)' }}>
        <div className="sec-head">
          <span className="eyebrow">Gimnasio BlackGym</span>
          <h2 className="sec-title">Fuerza para jugar mejor</h2>
          <p className="sec-lead">Sala de musculación con máquinas de última generación, evaluación física y rutinas pensadas para el pádel.</p>
          <div className="sec-meta">
            <span><strong>Lun a Vie</strong> 07:00–12:00 · 14:00–21:00</span>
            <span><strong>Sábados</strong> 08:00–13:00</span>
          </div>
        </div>
      </div>

      <div className="grid-cards is-3">
        {gymPlans.map(plan => (
          <article key={plan.id} className={`card ${plan.featured ? 'is-featured' : ''}`}>
            <span className={`card-tag ${plan.featured ? '' : 'is-muted'}`}>{plan.badge}</span>
            <div>
              <h3 className="card-title">{plan.name}</h3>
              <div className="card-sub" style={{ marginTop: 6 }}>{plan.period}</div>
            </div>
            <div className="card-price"><strong>{formatGs(plan.price).replace(' Gs.', '')}</strong><span>Gs. / mes</span></div>
            <p className="card-text">{plan.description}</p>
            <ul className="card-list">
              {plan.features.map(f => <li key={f}><Check size={15} strokeWidth={2.2} />{f}</li>)}
            </ul>
            <button type="button" className={`lux-btn ${plan.featured ? 'is-solid' : ''}`} onClick={() => setSelectedPlan(plan)}>
              Quiero este plan <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>

      {selectedPlan && <ApplySheet plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}
