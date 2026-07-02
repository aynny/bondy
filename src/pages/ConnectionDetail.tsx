import { Bell, BriefcaseBusiness, CalendarCheck2, ChevronLeft, Clock3, Info, Instagram, MessageCircle, MoreHorizontal, PencilLine, UsersRound } from 'lucide-react';
import { AppActions } from '../App';
import { Person } from '../data/people';

const historyItems = [
  { date: '2024.07.02', time: '19:30', title: '名古屋駅 カフェ', color: '#ff5470', image: './assets/avatars/profile.jpg' },
  { date: '2024.06.10', time: '13:15', title: '恵比寿 第３オフィスにて', color: '#ff8d4a', image: './assets/avatars/man1.jpg' },
  { date: '2024.05.20', time: '18:45', title: '渋谷 イベント', color: '#ffbd45', image: './assets/avatars/woman1.jpg' },
  { date: '2024.04.15', time: '12:00', title: '新宿 ランチ', color: '#58cc87', image: './assets/avatars/man2.jpg' },
  { date: '2024.03.01', time: '17:20', title: 'オンラインMTG', color: '#7a86ff', image: './assets/avatars/woman2.jpg' },
];

export function ConnectionDetail({ person, actions }: { person: Person; actions: AppActions }) {
  return (
    <div className="bond-detail-screen">
      <header className="bond-detail-header">
        <button onClick={actions.back} aria-label="戻る"><ChevronLeft size={28} /></button>
        <h1>つながりの詳細</h1>
        <button aria-label="その他"><MoreHorizontal size={27} /></button>
      </header>

      <section className="bond-detail-hero">
        <img className="bond-detail-avatar" src={person.avatar} alt={person.name} />
        <div className="bond-detail-copy">
          <p>つながって1年2ヶ月</p>
          <h2>{person.name}</h2>
          <span>{person.company}　{person.title}</span>
          <span>{person.location}</span>
          <div className="bond-detail-tags">
            <b><BriefcaseBusiness size={14} />ビジネス</b>
            <b><UsersRound size={14} />大学の同級生</b>
          </div>
        </div>
        <div className="bond-score-ring">
          <strong>{person.score}</strong>
          <span>とても強い</span>
        </div>
      </section>

      <div className="bond-detail-actions">
        <button onClick={() => actions.go('memo', person.id)}><PencilLine size={24} strokeWidth={1.9} /><span>メモ</span></button>
        <button onClick={() => actions.go('reminder', person.id)}><Bell size={24} /><span>リマインド</span></button>
        <button onClick={() => actions.go('sns', person.id)}><Instagram size={24} /><span>SNS</span></button>
        <button onClick={() => actions.go('common', person.id)}><UsersRound size={24} /><span>共通</span></button>
      </div>

      <section className="bond-score-card">
        <h3>つながりスコアの理由 <Info size={15} /></h3>
        <div className="bond-score-metrics">
          <div><CalendarCheck2 size={22} /><strong>{person.metCount}回</strong><span>会った回数</span></div>
          <div><Clock3 size={22} /><strong>2日前</strong><span>最後に会った</span></div>
          <div><UsersRound size={22} /><strong>5人</strong><span>共通のつながり</span></div>
          <div><MessageCircle size={22} /><strong>高い</strong><span>メッセージ頻度</span></div>
        </div>
        <div className="bond-score-bar"><span /></div>
        <div className="bond-score-labels"><span>弱い</span><span>中</span><span>強い</span></div>
      </section>

      <section className="bond-history-section">
        <div className="bond-section-title">
          <h3>つながりの履歴</h3>
          <button>すべて見る</button>
        </div>
        <div className="bond-history-list">
          {historyItems.map((item) => (
            <div className="bond-history-row" key={item.title}>
              <span className="bond-history-dot" style={{ background: item.color }} />
              <time>{item.date}</time>
              <em>{item.time}</em>
              <strong>{item.title}</strong>
              <img src={item.image} alt="" />
            </div>
          ))}
        </div>
      </section>

      <button className="bond-message-button">
        <MessageCircle size={21} />メッセージを送る
      </button>
    </div>
  );
}
