import { useState } from 'react';
import { AppActions } from '../App';
import { Person } from '../data/people';

export function Memo({ person }: { person: Person; actions: AppActions }) {
  const [memo, setMemo] = useState(person.memo);
  return (
    <div className="page-stack">
      <section className="screen-card form-card">
        <label>メモ<textarea value={memo} onChange={(event) => setMemo(event.target.value)} /></label>
        <div className="note-history">
          <p>2026.06.10<small>おすすめのレストランを教えてくれた</small></p>
          <p>2026.05.20<small>一緒にイベントに参加した</small></p>
        </div>
      </section>
      <button className="primary-button">+ 新しいメモ</button>
    </div>
  );
}
