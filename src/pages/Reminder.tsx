import { useState } from 'react';
import { AppActions } from '../App';
import { Person } from '../data/people';

export function Reminder({ person }: { person: Person; actions: AppActions }) {
  const [on, setOn] = useState(true);
  return (
    <div className="page-stack">
      <section className="screen-card form-card">
        <label>次に会う日<input defaultValue="2026年7月20日(土) 19:00" /></label>
        <label>内容<textarea defaultValue={`${person.name}さんに近況を聞く`} /></label>
        <div className="toggle-row">
          <span>通知を送る<small>設定した時間に通知します</small></span>
          <button className={on ? 'toggle active' : 'toggle'} onClick={() => setOn(!on)}><i /></button>
        </div>
      </section>
      <button className="primary-button">保存</button>
    </div>
  );
}
