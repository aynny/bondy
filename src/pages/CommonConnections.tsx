import { AppActions } from '../App';
import { findPerson, Person } from '../data/people';

export function CommonConnections({ person, actions }: { person: Person; actions: AppActions }) {
  const common = person.connections.map(findPerson).slice(0, 5);
  return (
    <div className="page-stack">
      <section className="screen-card">
        <h2>共通のつながり {common.length}人</h2>
        {common.map((item) => (
          <button className="person-list-row" key={item.id} onClick={() => actions.go('detail', item.id)}>
            <img src={item.avatar} alt={item.name} />
            <span><strong>{item.name}</strong><small>{item.company}</small></span>
          </button>
        ))}
      </section>
    </div>
  );
}
