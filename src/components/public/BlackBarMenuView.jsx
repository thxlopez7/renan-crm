import React, { useMemo, useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatGs } from '../../utils/formatters';

export function BlackBarMenuView() {
  const { menuItems } = useClub();
  const categories = useMemo(() => [...new Set(menuItems.map(i => i.category))], [menuItems]);
  const [category, setCategory] = useState('all');

  const groups = (category === 'all' ? categories : [category])
    .map(cat => ({ cat, items: menuItems.filter(i => i.category === cat) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="sec">
      <div className="sec-banner" style={{ backgroundImage: 'url(/images/bar-tercer-tiempo.jpg)' }}>
        <div className="sec-head">
          <span className="eyebrow">Bar & Lounge · Todos los días de 17:00 a 00:00</span>
          <h2 className="sec-title">El tercer tiempo</h2>
          <p className="sec-lead">Picadas, chopp bien frío y la mesa lista para después del partido. Pedí en la barra o reservá mesa al reservar cancha.</p>
        </div>
      </div>

      <div className="menu-cats" role="tablist" aria-label="Categorías">
        {['all', ...categories].map(c => (
          <button key={c} type="button" role="tab" aria-selected={category === c} className={category === c ? 'is-active' : ''} onClick={() => setCategory(c)}>
            {c === 'all' ? 'Toda la carta' : c}
          </button>
        ))}
      </div>

      {groups.map(group => (
        <section key={group.cat} className="menu-group" aria-label={group.cat}>
          <h3 className="menu-group-title">{group.cat}</h3>
          {group.items.map(item => {
            const off = item.available === false || item.stock === 0;
            return (
              <article key={item.id} className={`menu-item ${off ? 'is-off' : ''}`}>
                <h4>{item.name}</h4>
                <span className="menu-item-price">{off ? 'Agotado' : formatGs(item.price)}</span>
                {item.description && <p>{item.description}</p>}
                {item.tag && !off && <span className="card-tag is-muted">{item.tag}</span>}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
