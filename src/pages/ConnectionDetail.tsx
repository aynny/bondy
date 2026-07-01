import { Calendar, HeartHandshake, MessageCircle, Network, NotebookPen, PieChart } from 'lucide-react';
import { AppActions } from '../App';
import { Person, relatedPeople } from '../data/people';

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
      <div className="action-grid">
        <button onClick={() => actions.go('memo', person.id)}><NotebookPen size={19} />メモ</button>
        <button onClick={() => actions.go('reminder', person.id)}><Calendar size={19} />リマインド</button>
        <button onClick={() => actions.go('common', person.id)}><Network size={19} />共通</button>
        <button onClick={() => actions.go('score', person.id)}><PieChart size={19} />スコア</button>
      </div>
      <section className="screen-card">
        <h2>つながりの履歴</h2>
        {['名古屋駅 カフェ', '展示会ブース', 'オンラインMTG'].map((item, index) => (
          <div className="timeline-row" key={item}>
            <span />
            <p>{item}<small>2026.07.{String(index + 2).padStart(2, '0')} 19:30</small></p>
          </div>
        ))}
      </section>
      <button className="primary-button" onClick={() => actions.go('meeting', person.id)}>
        <HeartHandshake size={18} />会った記録を追加
      </button>
      <button className="secondary-button" onClick={() => actions.openPerson(relatedPeople(person.id)[0] ?? person)}>
        <MessageCircle size={18} />近い人を見る
      </button>
    </div>
  );
}
