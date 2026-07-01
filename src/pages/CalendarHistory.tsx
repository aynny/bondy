import { AppActions } from '../App';
import { people } from '../data/people';

export function CalendarHistory({ actions }: { actions: AppActions }) {
  return (
    <div className="page-stack">
      <section className="calendar-card">
        <div className="calendar-grid">
          {Array.from({ length: 31 }).map((_, index) => <button key={index} className={index === 1 || index === 20 ? 'active' : ''}>{index + 1}</button>)}
        </div>
      </section>
      <section className="screen-card">
        {people.slice(0, 2).map((person) => (
          <button className="person-list-row" key={person.id} onClick={() => actions.go('detail', person.id)}>
            <img src={person.avatar} alt={person.name} />
            <span><strong>{person.name}</strong><small>名古屋駅 カフェ</small></span>
          </button>
        ))}
      </section>
    </div>
  );
}
