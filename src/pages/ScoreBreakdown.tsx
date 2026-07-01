import { CalendarDays, Clock, MessagesSquare, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppActions } from '../App';
import { Person } from '../data/people';

export function ScoreBreakdown({ person }: { person: Person; actions: AppActions }) {
  const rows: [string, string, string, LucideIcon][] = [
    ['会った回数', `${person.metCount}回`, '+40', CalendarDays],
    ['最近会った', '2日前', '+25', Clock],
    ['共通のつながり', `${person.connections.length}人`, '+15', UsersRound],
    ['メッセージ頻度', '高い', '+10', MessagesSquare],
  ];
  return (
    <div className="page-stack">
      <section className="score-hero"><strong>{person.score}</strong><span>とても強い</span></section>
      <section className="screen-card">
        <h2>スコアの内訳</h2>
        {rows.map(([label, value, point, Icon]) => (
          <div className="metric-row" key={label as string}>
            <Icon size={18} />
            <span>{label}</span>
            <small>{value}</small>
            <b>{point}</b>
          </div>
        ))}
      </section>
    </div>
  );
}
