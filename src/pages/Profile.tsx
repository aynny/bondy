import { Settings } from 'lucide-react';
import { AppActions } from '../App';
import { currentUser } from '../data/people';

export function Profile({ actions }: { actions: AppActions }) {
  return (
    <div className="page-stack">
      <section className="profile-card-main">
        <button className="settings-button" onClick={() => actions.go('settings')}><Settings size={19} /></button>
        <img src={currentUser.avatar} alt={currentUser.name} />
        <h1>{currentUser.name}</h1>
        <p>{currentUser.handle}</p>
        <div>
          <span><b>352</b>つながり</span>
          <span><b>798</b>会った回数</span>
          <span><b>87</b>強さ</span>
        </div>
      </section>
      <section className="screen-card">
        <h2>自己紹介</h2>
        <p className="body-copy">デザインとテクノロジーで人とのつながりを育てることが好きです。</p>
      </section>
    </div>
  );
}
