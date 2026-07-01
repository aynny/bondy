import { Bell, HeartHandshake, Link2, Network, NotebookPen } from 'lucide-react';
import { AppActions } from '../App';
import { Person } from '../data/people';

export function ConnectionDetail({ person, actions }: { person: Person; actions: AppActions }) {
  return (
    <div className="detail-page">
      <section className="profile-hero">
        <img src={person.avatar} alt={person.name} />
        <div>
          <h1>{person.name}</h1>
          <p>{person.company} / {person.title}</p>
          <small>{person.handle}</small>
        </div>
        <strong>{person.score}<span>とても強い</span></strong>
      </section>
      <div className="detail-action-grid">
        <button onClick={() => actions.go('memo', person.id)}><NotebookPen size={17} />メモ</button>
        <button onClick={() => actions.go('reminder', person.id)}><Bell size={17} />リマインド</button>
        <button onClick={() => actions.go('sns', person.id)}><Link2 size={17} />SNS</button>
        <button onClick={() => actions.go('common', person.id)}><Network size={17} />共通</button>
      </div>
      <section className="screen-card connection-history-card">
        <h2>つながりの履歴</h2>
        <div className="history-timeline">
          {['名古屋駅 カフェで会った', '展示会ブースで再会', 'オンラインMTG', '紹介イベント'].map((item, index) => (
          <div className="timeline-row refined" key={item}>
            <span />
            <p>{item}<small>2026.07.{String(index + 2).padStart(2, '0')} 19:30</small></p>
          </div>
          ))}
        </div>
      </section>
      <button className="primary-button compact-record" onClick={() => actions.go('meeting', person.id)}>
        <HeartHandshake size={18} />会った記録を追加
      </button>
    </div>
  );
}
