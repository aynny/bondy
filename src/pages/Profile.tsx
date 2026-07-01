import { useState } from 'react';
import { Briefcase, Calendar, ChevronDown, ChevronLeft, GraduationCap, MapPin, MoreHorizontal, Plus, QrCode, Save, Search, X } from 'lucide-react';
import { AppActions } from '../App';
import { currentUser } from '../data/people';

const LOGO_DEV_TOKEN = 'pk_HOeQqXbFRCG-0PJjNVf_Vw';

const companyDomains: Record<string, string> = {
  Dior: 'dior.com',
  Tesla: 'tesla.com',
  microsoft: 'microsoft.com',
  Microsoft: 'microsoft.com',
  'Fast Retailing': 'fastretailing.com',
  Apple: 'apple.com',
  Google: 'google.com',
  Amazon: 'amazon.com',
  Meta: 'meta.com',
  Mercari: 'mercari.com',
  SmartHR: 'smarthr.co.jp',
  LayerX: 'layerx.co.jp',
  Salesforce: 'salesforce.com',
  CyberAgent: 'cyberagent.co.jp',
  Recruit: 'recruit.co.jp',
  Rakuten: 'rakuten.co.jp',
  Sony: 'sony.com',
  Nintendo: 'nintendo.com',
  Toyota: 'toyota-global.com',
  Honda: 'honda.com',
  Panasonic: 'panasonic.com',
};

const featuredCompanies = [
  'Microsoft', 'Apple', 'Google', 'Amazon', 'Meta', 'Tesla', 'Dior', 'Fast Retailing', 'Mercari', 'SmartHR',
  'LayerX', 'Salesforce', 'CyberAgent', 'Recruit', 'Rakuten', 'Sony', 'Nintendo', 'Toyota', 'Honda', 'Panasonic',
];

const companyOptions = [
  ...featuredCompanies,
  ...Array.from({ length: 3980 }, (_, index) => `企業 ${String(index + 1).padStart(4, '0')}`),
];

type ProfileForm = {
  name: string;
  handle: string;
  highSchool: string;
  university: string;
  vocational: string;
  currentRole: string;
  currentCompany: string;
  currentYear: string;
  currentMonth: string;
  location: string;
  birthday: string;
};

type Career = {
  title: string;
  company: string;
  period: string;
};

const careers: Career[] = [
  { title: 'Women@Dior Mentee', company: 'Dior', period: '2024年2月 - 2025年4月' },
  { title: 'Sales Intern', company: 'Tesla', period: '2025年2月 - 2025年8月' },
  { title: 'Solution Engineer Intern', company: 'microsoft', period: '2025年8月 - 2025年9月' },
  { title: 'Global Brand Intern', company: 'Fast Retailing', period: '2026年3月 - 2026年4月' },
];

function logoUrl(company: string) {
  const domain = companyDomains[company] || '';
  if (!domain) {
    const name = company.trim();
    if (!name) return '';
    const url = `https://img.logo.dev/name/${encodeURIComponent(name)}?token=${LOGO_DEV_TOKEN}&size=256&format=png&fallback=404&v=141`;
    console.log('logo debug', company, '', url);
    return url;
  }
  const url = `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=256&format=png&fallback=404&v=140`;
  console.log('logo debug', company, domain, url);
  return url;
}

function CompanyLogo({ company }: { company: string }) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl(company);
  if (!src || failed) {
    return <span className="edit-company-logo fallback">{company.slice(0, 1).toUpperCase()}</span>;
  }
  return (
    <span className="edit-company-logo">
      <img src={src} alt={`${company} logo`} onError={() => setFailed(true)} />
    </span>
  );
}

function VisibilityToggle() {
  return (
    <span className="edit-privacy-toggle">
      <b>公開</b>
      <i>非公開</i>
    </span>
  );
}

export function Profile({ actions }: { actions: AppActions }) {
  const [editing, setEditing] = useState(false);
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [form, setForm] = useState<ProfileForm>({
    name: currentUser.name,
    handle: currentUser.handle.replace('@', ''),
    highSchool: '岐阜高校',
    university: currentUser.school,
    vocational: '',
    currentRole: currentUser.title,
    currentCompany: currentUser.company === '株式会社Mesh' ? 'Microsoft' : currentUser.company,
    currentYear: '2025',
    currentMonth: '8',
    location: currentUser.location,
    birthday: '2026/06/25',
  });

  const update = (key: keyof ProfileForm, value: string) => {
    setSaveState('idle');
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const companyMatches = companyOptions
    .filter((company) => company.toLowerCase().includes(companyQuery.trim().toLowerCase()))
    .slice(0, 36);

  const chooseCompany = (company: string) => {
    update('currentCompany', company);
    setCompanyQuery('');
    setCompanyPickerOpen(false);
  };

  const saveProfile = () => {
    setSaveState('saving');
    window.setTimeout(() => setSaveState('saved'), 520);
  };

  const info = [
    { label: '学校', value: form.university, icon: GraduationCap },
    { label: '会社', value: `${form.currentCompany} / ${form.currentRole}`, icon: Briefcase },
    { label: '所在地', value: form.location, icon: MapPin },
    { label: '誕生日', value: form.birthday, icon: Calendar },
  ];

  if (editing) {
    return (
      <div className="profile-edit-screen">
        <header className="profile-edit-title">
          <button onClick={() => setEditing(false)} aria-label="戻る"><ChevronLeft size={26} /></button>
          <div>
            <h1>プロフィール編集</h1>
            <p>登録時と同じ項目をまとめて編集できます。</p>
          </div>
          <button className="profile-edit-save-top" onClick={saveProfile}>
            <Save size={15} />{saveState === 'saving' ? '保存中' : saveState === 'saved' ? '保存済み' : '保存'}
          </button>
        </header>

        <section className="edit-section-card">
          <h2>基本情報</h2>
          <label>名前 <em>*</em><input value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
          <label>ユーザーID <em>*</em><input value={form.handle} onChange={(event) => update('handle', event.target.value)} /></label>
          <div className="edit-inline-field">
            <div className="edit-field-head"><strong>所在地</strong><VisibilityToggle /></div>
            <button className="edit-select-button">{form.location}<ChevronDown size={18} /></button>
          </div>
          <div className="edit-inline-field">
            <div className="edit-field-head"><strong>誕生日</strong><VisibilityToggle /></div>
            <input value={form.birthday} onChange={(event) => update('birthday', event.target.value)} />
          </div>
        </section>

        <section className="edit-section-card">
          <h2>学歴 <em>学校または会社 必須</em></h2>
          <p>学校または会社のどちらかを入力してください。学校を分けて入れると、つながりの共通点が見つけやすくなります。</p>
          {[
            ['高校', 'highSchool', '例:東京都立 Bondy 高校'],
            ['大学', 'university', '例:名古屋大学'],
            ['専門学校', 'vocational', '例:Bondy デザイン専門学校'],
          ].map(([label, key, placeholder]) => (
            <div className="education-edit-card" key={key}>
              <div className="edit-field-head"><strong>{label}</strong><VisibilityToggle /></div>
              <div className="editable-with-clear">
                <input
                  value={form[key as keyof ProfileForm]}
                  onChange={(event) => update(key as keyof ProfileForm, event.target.value)}
                  placeholder={placeholder}
                />
                {form[key as keyof ProfileForm] && (
                  <button onClick={() => update(key as keyof ProfileForm, '')} aria-label={`${label}を削除`}><X size={17} /></button>
                )}
              </div>
              <label className="student-check"><input type="checkbox" />現在在学中</label>
            </div>
          ))}
        </section>

        <section className="edit-section-card">
          <h2>現在の仕事 <em>学校または会社 必須</em></h2>
          <p>いまの仕事や所属している会社を入力できます。</p>
          <div className="current-work-card">
            <div className="edit-field-head"><strong>現在</strong><VisibilityToggle /></div>
            <input value={form.currentRole} onChange={(event) => update('currentRole', event.target.value)} placeholder="職種・役割 例: Solution Engineer" />
            <div className="company-input-row">
              <CompanyLogo company={form.currentCompany} />
              <button onClick={() => setCompanyPickerOpen((prev) => !prev)}>
                {form.currentCompany || '企業を選択または入力'}<ChevronDown size={18} />
              </button>
            </div>
            {companyPickerOpen && (
              <div className="company-picker-panel">
                <label><Search size={17} /><input value={companyQuery} onChange={(event) => setCompanyQuery(event.target.value)} placeholder="企業名を検索（約4,000社）" /></label>
                <div>
                  {companyMatches.map((company) => (
                    <button key={company} onClick={() => chooseCompany(company)}>
                      <CompanyLogo company={company} />
                      <span>{company}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="period-grid">
              <span>開始</span>
              <select value={form.currentYear} onChange={(event) => update('currentYear', event.target.value)}>
                {['2024', '2025', '2026'].map((year) => <option key={year}>{year}</option>)}
              </select>
              <select value={form.currentMonth} onChange={(event) => update('currentMonth', event.target.value)}>
                {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((month) => <option key={month}>{month}</option>)}
              </select>
            </div>
            <div className="period-grid single">
              <span>終了</span>
              <button>現在</button>
            </div>
            <input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="場所 例: 日本 東京都 品川区" />
          </div>
        </section>

        <section className="edit-section-card career-history-card">
          <div className="career-title-row">
            <div>
              <h2>今までの職歴</h2>
              <p>インターン、前職、プロジェクトなどを追加できます。</p>
            </div>
            <button><Plus size={24} /></button>
          </div>
          <div className="career-list-preview">
            {careers.map((career) => (
              <div className="career-preview-row" key={`${career.company}-${career.title}`}>
                <CompanyLogo company={career.company} />
                <span>
                  <strong>{career.title}</strong>
                  <b>{career.company}</b>
                  <small>{career.period}</small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <button className="profile-edit-save-bottom" onClick={saveProfile}>
          {saveState === 'saving' ? '保存中...' : saveState === 'saved' ? '保存しました' : 'プロフィールを保存'}
        </button>
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
            <p>@{form.handle}</p>
            <span>プレミアム</span>
          </div>
        </div>
        <div className="profile-actions">
          <button onClick={() => setEditing(true)}>プロフィールを編集</button>
          <button onClick={() => actions.go('qr')}>プロフィールを共有</button>
        </div>
        <div className="profile-stats">
          <span><b>128</b>つながり</span>
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
