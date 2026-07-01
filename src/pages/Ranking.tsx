import { useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { AppActions } from '../App';
import { people } from '../data/people';

export function Ranking({ actions }: { actions: AppActions }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return people
      .filter((person) => !text || [person.name, person.handle, person.company, person.school, person.title, person.location]
        .join(' ')
        .toLowerCase()
        .includes(text))
      .sort((a, b) => b.score - a.score);
  }, [query]);

  return (
    <div className="connections-screen compact">
      <div className="connection-search solo">
        <Search size={21} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="つながりを検索"
        />
      </div>

      <section className="connection-list-card clean">
        {filtered.map((person) => (
          <button key={person.id} className="connection-row clean" onClick={() => actions.go('detail', person.id)}>
            <img src={person.avatar} alt={person.name} />
            <span>
              <strong>{person.name}</strong>
              <small>{person.school || person.company}</small>
            </span>
            <time>{person.lastMet}</time>
            <ChevronRight size={24} />
          </button>
        ))}
      </section>
    </div>
  );
}
