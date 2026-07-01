import { AppActions } from '../App';
import { people } from '../data/people';

export function Requests({ actions }: { actions: AppActions }) {
  return (
    <div className="page-stack">
      <section className="screen-card">
        {people.slice(0, 3).map((person) => (
          <div className="request-row" key={person.id}>
            <img src={person.avatar} alt={person.name} />
            <span><strong>{person.name}</strong><small>共通のつながり {person.connections.length}人</small></span>
            <button onClick={() => actions.go('detail', person.id)}>承認</button>
            <button>削除</button>
          </div>
        ))}
      </section>
    </div>
  );
}
