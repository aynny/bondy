import { Search } from 'lucide-react';
import { AppActions } from '../App';
import { people } from '../data/people';

export function Discover({ actions }: { actions: AppActions }) {
  return (
    <div className="page-stack">
      <div className="discover-search"><Search size={18} /><input placeholder="名前・ID・会社・学校などを入力" /></div>
      <div className="discover-grid">
        {people.slice(0, 4).map((person) => (
          <button key={person.id} onClick={() => actions.go('detail', person.id)}>
            <img src={person.avatar} alt={person.name} />
            <strong>{person.name}</strong>
            <small>{person.company}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
