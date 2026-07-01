import { AppActions } from '../App';
import { categoryMeta, people } from '../data/people';

export function ConnectionList({ actions }: { actions: AppActions }) {
  return (
    <div className="page-stack">
      <div className="chip-row">
        {Object.values(categoryMeta).map((meta) => <button key={meta.label}>{meta.label}</button>)}
      </div>
      <section className="screen-card">
        {people.map((person) => (
          <button className="person-list-row" key={person.id} onClick={() => actions.go('detail', person.id)}>
            <img src={person.avatar} alt={person.name} />
            <span><strong>{person.name}</strong><small>{person.company} / {person.title}</small></span>
            <b>{person.score}</b>
          </button>
        ))}
      </section>
    </div>
  );
}
