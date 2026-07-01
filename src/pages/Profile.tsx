import { useState } from 'react';
import { Briefcase, Calendar, GraduationCap, MapPin, MoreHorizontal, QrCode, Save, X } from 'lucide-react';
import { AppActions } from '../App';
import { currentUser } from '../data/people';

type ProfileForm = {
  name: string;
  handle: string;
  school: string;
  company: string;
  title: string;
  location: string;
  birthday: string;
};

export function Profile({ actions }: { actions: AppActions }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: currentUser.name,
    handle: currentUser.handle,
    school: currentUser.school,
    company: currentUser.company,
    title: currentUser.title,
    location: currentUser.location,
    birthday: '1998/07/02',
  });

  const update = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const info = [
    { label: '学校', value: form.school, icon: GraduationCap },
    { label: '会社', value: `${form.company} / ${form.title}`, icon: Briefcase },
    { label: '所在地', value: form.location, icon: MapPin },
    { label: '誕生日', value: form.birthday, icon: Calendar },
  ];

  if (editing) {
    return (
      <div className="profile-screen">
        <section className="profile-edit-panel">
          <div className="profile-edit-head">
            <button onClick={() => setEditing(false)} aria-label="閉じる"><X size={20} /></button>
            <h1>プロフィールを編集</h1>
            <button className="save" onClick={() => setEditing(false)}><Save size={16} />保存</button>
          </div>
          <div className="profile-photo-edit">
            <img src={currentUser.avatar} alt={form.name} />
            <button>写真を変更</button>
          </div>
          <div className="profile-edit-fields">
            <label>名前<input value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
            <label>ID<input value={form.handle} onChange={(event) => update('handle', event.target.value)} /></label>
            <label>学校<input value={form.school} onChange={(event) => update('school', event.target.value)} /></label>
            <label>会社<input value={form.company} onChange={(event) => update('company', event.target.value)} /></label>
            <label>役職<input value={form.title} onChange={(event) => update('title', event.target.value)} /></label>
            <label>所在地<input value={form.location} onChange={(event) => update('location', event.target.value)} /></label>
            <label>誕生日<input value={form.birthday} onChange={(event) => update('birthday', event.target.value)} /></label>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="profile-screen compact-profile">
      <section className="profile-top-card">
        <button className="profile-more" onClick={() => actions.go('settings')} aria-label="設定">
          <MoreHorizontal size={23} />
        </button>
        <div className="profile-identity">
          <img src={currentUser.avatar} alt={form.name} />
          <div>
            <h1>{form.name}</h1>
            <p>{form.handle}</p>
            <span>プレミアム</span>
          </div>
        </div>
        <div className="profile-actions">
          <button onClick={() => setEditing(true)}>プロフィールを編集</button>
          <button onClick={() => actions.go('qr')}>プロフィールを共有</button>
        </div>
        <div className="profile-stats">
          <span><b>128</b>繋がり</span>
          <span><b>43</b>あった回数</span>
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

      <section className="profile-direct-share">
        <QrCode size={24} />
        <div>
          <h2>プロフィールを共有</h2>
          <p>カメラで読み取るか、QRコードを直接見せて交換できます。</p>
        </div>
        <button onClick={() => actions.go('qr')}>QRを開く</button>
      </section>
    </div>
  );
}
