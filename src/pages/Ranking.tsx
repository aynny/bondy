import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { Briefcase, Flag, GraduationCap, Heart, Home, MapPin, Search, UsersRound } from 'lucide-react';
import { AppActions } from '../App';
import { categoryMeta, Category, people } from '../data/people';

const filters: { key: Category | 'all'; label: string; icon: ElementType }[] = [
  { key: 'all', label: 'すべて', icon: UsersRound },
  { key: 'school', label: '学校', icon: GraduationCap },
  { key: 'business', label: 'ビジネス', icon: Briefcase },
  { key: 'local', label: '地元', icon: Home },
  { key: 'family', label: '家族', icon: UsersRound },
  { key: 'event', label: 'イベント', icon: Flag },
  { key: 'heart', label: '♡', icon: Heart },
];

export function Ranking({ actions }: { actions: AppActions }) {
  const [active, setActive] = useState<Category | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return people
      .filter((person) => active === 'all' || person.category === active)
      .filter((person) => !text || [person.name, person.handle, person.company, person.school, person.title, person.location]
        .join(' ')
        .toLowerCase()
        .includes(text))
      .sort((a, b) => b.score - a.score);
  }, [active, query]);

  return (
    <div className="connections-screen">
      <div className="connection-filter-grid">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const meta = filter.key === 'all' ? null : categoryMeta[filter.key];
          return (
            <button
              key={filter.key}
              className={active === filter.key ? 'active' : ''}
              onClick={() => setActive(filter.key)}
              style={meta && active !== filter.key ? { color: meta.color } : undefined}
            >
              <Icon size={18} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      <div className="connection-search">
        <Search size={20} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="つながりを検索"
        />
      </div>

      <section className="connection-list-card">
        {filtered.map((person) => {
          const meta = categoryMeta[person.category];
          return (
            <button key={person.id} className="connection-row" onClick={() => actions.go('detail', person.id)}>
              <img src={person.avatar} alt={person.name} />
              <span>
                <strong>{person.name}</strong>
                <small>{person.school || person.company}</small>
              </span>
              <em style={{ color: meta.color, background: meta.tint }}>{meta.label}</em>
              <time>{person.lastMet}</time>
              <MapPin size={19} />
            </button>
          );
        })}
      </section>
    </div>
  );
}
