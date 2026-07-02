import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { AppActions } from '../App';
import { people } from '../data/people';

type SocialKey = 'Instagram' | 'X' | 'Threads' | 'TikTok' | 'BeReal' | 'Setlog' | 'Facebook' | 'YouTube' | 'LinkedIn' | 'note';

type SocialAccount = {
  label: SocialKey;
  logo: string;
  placeholder: string;
};

const socialAccounts: SocialAccount[] = [
  { label: 'Instagram', logo: './assets/social/instagram.png', placeholder: 'Instagram ユーザー名またはURL' },
  { label: 'X', logo: './assets/social/x.png', placeholder: 'X ユーザー名またはURL' },
  { label: 'Threads', logo: './assets/social/threads.svg', placeholder: 'Threads ユーザー名またはURL' },
  { label: 'TikTok', logo: './assets/social/tiktok.png', placeholder: 'TikTok ユーザー名またはURL' },
  { label: 'BeReal', logo: './assets/social/bereal.png', placeholder: 'BeReal ユーザー名またはURL' },
  { label: 'Setlog', logo: './assets/social/setlog.webp', placeholder: 'Setlog ユーザー名またはURL' },
  { label: 'Facebook', logo: './assets/social/facebook.png', placeholder: 'Facebook URL' },
  { label: 'YouTube', logo: './assets/social/youtube.png', placeholder: 'YouTube チャンネルURL' },
  { label: 'LinkedIn', logo: './assets/social/linkedin.png', placeholder: 'LinkedIn URL' },
  { label: 'note', logo: './assets/social/note.svg', placeholder: 'note URL' },
];

const socialLinks: Record<SocialKey, string> = {
  Instagram: 'https://www.instagram.com/',
  X: 'https://x.com/',
  Threads: 'https://www.threads.net/',
  TikTok: 'https://www.tiktok.com/',
  BeReal: 'https://bereal.com/',
  Setlog: 'https://setlog.app/',
  Facebook: 'https://www.facebook.com/',
  YouTube: 'https://www.youtube.com/',
  LinkedIn: 'https://www.linkedin.com/',
  note: 'https://note.com/',
};

export function SnsList({ actions }: { actions: AppActions }) {
  const [values, setValues] = useState<Record<string, string>>({
    Instagram: '',
    X: '',
    Threads: '',
    TikTok: '',
    BeReal: '',
    Setlog: '',
    Facebook: '',
    YouTube: '',
    LinkedIn: '',
    note: '',
  });
  const [publicMap, setPublicMap] = useState<Record<string, boolean>>(
    Object.fromEntries(socialAccounts.map((sns) => [sns.label, true])),
  );
  const [active, setActive] = useState<SocialAccount | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const openEditor = (sns: SocialAccount) => {
    setActive(sns);
    setDraft(values[sns.label] || '');
  };

  const save = () => {
    if (!active) return;
    setSaving(true);
    window.setTimeout(() => {
      setValues((prev) => ({ ...prev, [active.label]: draft.trim() }));
      setSaving(false);
      setActive(null);
    }, 360);
  };

  return (
    <div className="sns-screen reference-style">
      <section>
        <h1>SNS</h1>
        <p>入力したSNSは自分のプロフィールでは確認できます。公開にしたSNSだけ友達に表示されます。</p>
        <div className="sns-reference-grid">
          {socialAccounts.map((sns) => {
            const registered = Boolean(values[sns.label]);
            return (
              <button className="sns-register-card" key={sns.label} onClick={() => openEditor(sns)}>
                <img src={sns.logo} alt={sns.label} />
                <strong className={registered ? 'registered' : ''}>
                  {registered ? <><Check size={16} />登録済み</> : '未登録'}
                </strong>
                <span onClick={(event) => event.stopPropagation()}>
                  <b className={publicMap[sns.label] ? 'active' : ''} onClick={() => setPublicMap((prev) => ({ ...prev, [sns.label]: true }))}>公開</b>
                  <i className={!publicMap[sns.label] ? 'active' : ''} onClick={() => setPublicMap((prev) => ({ ...prev, [sns.label]: false }))}>非公開</i>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="screen-card feed-card sns-feed">
        <h2>最近の投稿</h2>
        {people[0] ? (
          <button onClick={() => actions.go('detail', people[0].id)}>
            <img src={people[0].avatar} alt="" />
            <span>{people[0].name}<small>今日のつながり記録を投稿しました。</small></span>
          </button>
        ) : (
          <p className="empty-feed-note">SNSを登録すると、プロフィールから確認できます。</p>
        )}
      </section>

      {active && (
        <div className="sns-editor-overlay">
          <section className="sns-editor-sheet">
            <header>
              <div>
                <img src={active.logo} alt="" />
                <h2>{active.label}を登録</h2>
              </div>
              <button onClick={() => setActive(null)} aria-label="閉じる"><X size={21} /></button>
            </header>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={active.placeholder}
              autoFocus
            />
            <div className="sns-editor-privacy">
              <button className={publicMap[active.label] ? 'active' : ''} onClick={() => setPublicMap((prev) => ({ ...prev, [active.label]: true }))}>公開</button>
              <button className={!publicMap[active.label] ? 'active' : ''} onClick={() => setPublicMap((prev) => ({ ...prev, [active.label]: false }))}>非公開</button>
            </div>
            <button
              className="sns-open-button"
              onClick={() => window.open(socialLinks[active.label], '_blank', 'noopener,noreferrer')}
            >
              {active.label}を開く
            </button>
            <button className="sns-save-button" onClick={save}>{saving ? '保存中...' : '保存'}</button>
          </section>
        </div>
      )}
    </div>
  );
}
