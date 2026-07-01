import { AppActions } from '../App';
import { people } from '../data/people';

export function Ranking({ actions }: { actions: AppActions }) {
  return (
    <div className="page-stack">
      <div className="ranking-header">
        <span>つながりが強い10人</span>
        <button onClick={() => actions.go('list')}>リスト表示</button>
      </div>
      <div className="ranking-list">
        {[...people].sort((a, b) => b.score - a.score).slice(0, 10).map((person, index) => (
          <button key={person.id} className="ranking-row" onClick={() => actions.go('detail', person.id)}>
            <em>{index + 1}</em>
            <img src={person.avatar} alt={person.name} />
            <span>
              <strong>{person.name}</strong>
              <small>{person.metCount}回 会った</small>
            </span>
            <b>{person.score}</b>
            <i style={{ width: `${Math.max(28, person.score)}%` }} />
          </button>
        ))}
      </div>
    </div>
  );
}
