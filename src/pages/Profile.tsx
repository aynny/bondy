import { Briefcase, Calendar, GraduationCap, Link, MapPin, MoreHorizontal, QrCode, Share2 } from 'lucide-react';
import { AppActions } from '../App';
import { currentUser } from '../data/people';

export function Profile({ actions }: { actions: AppActions }) {
  const info = [
    { label: '学校', value: currentUser.school, icon: GraduationCap },
    { label: '会社', value: `${currentUser.company} / ${currentUser.title}`, icon: Briefcase },
    { label: '所在地', value: currentUser.location, icon: MapPin },
    { label: '誕生日', value: '1998/07/02', icon: Calendar },
  ];

  return (
    <div className="profile-screen">
      <section className="profile-top-card">
        <button className="profile-more" onClick={() => actions.go('settings')} aria-label="設定">
          <MoreHorizontal size={23} />
        </button>
        <div className="profile-identity">
          <img src={currentUser.avatar} alt={currentUser.name} />
          <div>
            <h1>{currentUser.name}</h1>
            <p>{currentUser.handle}</p>
            <span>プレミアム</span>
          </div>
        </div>
        <div className="profile-actions">
          <button onClick={() => actions.go('settings')}>プロフィールを編集</button>
          <button onClick={() => actions.go('qr')}>プロフィールを共有</button>
        </div>
        <div className="profile-stats">
          <span><b>128</b>つながり</span>
          <span><b>56</b>共通の知人</span>
          <span><b>12</b>所属グループ</span>
        </div>
      </section>

      <section className="profile-info-card">
        {info.map((item) => {
          const Icon = item.icon;
          return (
            <div className="profile-info-row" key={item.label}>
              <Icon size={21} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <button>公開</button>
            </div>
          );
        })}
      </section>

      <section className="profile-info-card">
        <div className="profile-info-row sns-row">
          <Link size={21} />
          <span>SNS</span>
          <strong>
            {currentUser.sns.map((sns) => <i key={sns}>{sns}</i>)}
          </strong>
        </div>
      </section>

      <section className="profile-share-card">
        <div>
          <h2>プロフィールを共有</h2>
          <p>QRコードやリンクで、あなたのプロフィールを簡単に共有できます。</p>
        </div>
        <div className="share-buttons">
          <button onClick={() => actions.go('qr')}><QrCode size={18} />QRコード</button>
          <button><Share2 size={18} />リンクをコピー</button>
        </div>
      </section>
    </div>
  );
}
