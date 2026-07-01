import { Camera, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { AppActions } from '../App';
import { Person } from '../data/people';

export function MeetingRecord({ person }: { person: Person; actions: AppActions }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="page-stack">
      <section className="success-card">
        <CheckCircle2 size={54} />
        <h1>{saved ? '保存しました' : '記録しましょう'}</h1>
        <p>{person.name}さんと会った内容を残すと、つながりが強くなります。</p>
      </section>
      <section className="screen-card form-card">
        <label>日時<input defaultValue="2026/07/20 19:00" /></label>
        <label>場所<input defaultValue="名古屋駅 カフェ" /></label>
        <label>メモ<textarea defaultValue="次はプロダクトの相談をする。" /></label>
        <button className="photo-field"><Camera size={20} />写真を追加</button>
      </section>
      <button className="primary-button" onClick={() => setSaved(true)}>{saved ? '保存済み' : '保存'}</button>
    </div>
  );
}
