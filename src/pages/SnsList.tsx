import { Instagram, Linkedin, Music2, Plus, Youtube } from 'lucide-react';
import { AppActions } from '../App';
import { people } from '../data/people';

export function SnsList({ actions }: { actions: AppActions }) {
  const sns = [
    ['Instagram', Instagram],
    ['X', Plus],
    ['LinkedIn', Linkedin],
    ['YouTube', Youtube],
    ['TikTok', Music2],
    ['Threads', Plus],
  ];
  return (
    <div className="page-stack">
      <section className="screen-card sns-grid">
        {sns.map(([label, Icon]) => (
          <button key={label as string}><Icon size={26} /><span>{label as string}</span></button>
        ))}
      </section>
      <section className="screen-card feed-card">
        <h2>最近の投稿</h2>
        <button onClick={() => actions.go('detail', people[0].id)}>
          <img src={people[0].avatar} alt="" />
          <span>{people[0].name}<small>今日のつながり記録を投稿しました。</small></span>
        </button>
      </section>
    </div>
  );
}
