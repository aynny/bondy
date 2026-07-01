import { AppActions } from '../App';
import { people } from '../data/people';

const socialAccounts = [
  { label: 'Instagram', logo: '/assets/social/instagram.png', registered: false },
  { label: 'X', logo: '/assets/social/x.png', registered: false },
  { label: 'Threads', logo: '/assets/social/threads.svg', registered: false },
  { label: 'TikTok', logo: '/assets/social/tiktok.png', registered: false },
  { label: 'BeReal', logo: '/assets/social/bereal.png', registered: false },
  { label: 'Setlog', logo: '/assets/social/setlog.webp', registered: false },
  { label: 'Facebook', logo: '/assets/social/facebook.png', registered: false },
  { label: 'YouTube', logo: '/assets/social/youtube.png', registered: false },
  { label: 'LinkedIn', logo: '/assets/social/linkedin.png', registered: false },
  { label: 'note', logo: '/assets/social/note.svg', registered: false },
];

export function SnsList({ actions }: { actions: AppActions }) {
  return (
    <div className="sns-screen reference-style">
      <section>
        <h1>SNS</h1>
        <p>入力したSNSは自分のプロフィールでは確認できます。公開にしたSNSだけ友達に表示されます。</p>
        <div className="sns-reference-grid">
          {socialAccounts.map((sns) => (
            <button className="sns-register-card" key={sns.label}>
              <img src={sns.logo} alt={sns.label} />
              <strong>{sns.registered ? '登録済み' : '未登録'}</strong>
              <span>
                <b>公開</b>
                <i>非公開</i>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="screen-card feed-card sns-feed">
        <h2>最近の投稿</h2>
        <button onClick={() => actions.go('detail', people[0].id)}>
          <img src={people[0].avatar} alt="" />
          <span>{people[0].name}<small>今日のつながり記録を投稿しました。</small></span>
        </button>
      </section>
    </div>
  );
}
