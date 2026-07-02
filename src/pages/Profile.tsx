import { ChangeEvent, useRef, useState } from 'react';
import { Briefcase, Calendar, Camera, ChevronDown, ChevronLeft, GraduationCap, MapPin, MoreHorizontal, Plus, QrCode, Search, X } from 'lucide-react';
import { AppActions } from '../App';
import { currentUser, people } from '../data/people';

const LOGO_DEV_TOKEN = 'pk_HOeQqXbFRCG-0PJjNVf_Vw';

const companyDomains: Record<string, string> = {
  Dior: 'dior.com',
  Tesla: 'tesla.com',
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
  Mitsubishi: 'mitsubishi.com',
  Hitachi: 'hitachi.com',
  Fujitsu: 'fujitsu.com',
  NEC: 'nec.com',
  Canon: 'canon.com',
  Nikon: 'nikon.com',
  Toshiba: 'global.toshiba',
  SoftBank: 'softbank.jp',
  NTT: 'group.ntt',
  KDDI: 'kddi.com',
  LINE: 'line.me',
  DeNA: 'dena.com',
  GREE: 'gree.co.jp',
  Sansan: 'sansan.com',
  Freee: 'freee.co.jp',
  MoneyForward: 'moneyforward.com',
  Wantedly: 'wantedly.com',
  note: 'note.com',
  Cookpad: 'cookpad.com',
  ZOZO: 'zozo.com',
  Uniqlo: 'uniqlo.com',
  SevenEleven: '7-eleven.com',
  Lawson: 'lawson.jp',
  FamilyMart: 'family.co.jp',
  Muji: 'muji.com',
  Shiseido: 'shiseido.com',
  Kao: 'kao.com',
  Suntory: 'suntory.com',
  Asahi: 'asahigroup-holdings.com',
  Kirin: 'kirinholdings.com',
  Ajinomoto: 'ajinomoto.com',
  Meiji: 'meiji.com',
  Nissin: 'nissin.com',
  ANA: 'ana.co.jp',
  JAL: 'jal.com',
  JR: 'jreast.co.jp',
  Dentsu: 'dentsu.co.jp',
  Hakuhodo: 'hakuhodo.co.jp',
  McKinsey: 'mckinsey.com',
  BCG: 'bcg.com',
  Bain: 'bain.com',
  Deloitte: 'deloitte.com',
  PwC: 'pwc.com',
  EY: 'ey.com',
  KPMG: 'kpmg.com',
  Accenture: 'accenture.com',
  IBM: 'ibm.com',
  Oracle: 'oracle.com',
  Adobe: 'adobe.com',
  Nvidia: 'nvidia.com',
  Intel: 'intel.com',
  Samsung: 'samsung.com',
  Netflix: 'netflix.com',
  Spotify: 'spotify.com',
  Uber: 'uber.com',
  Airbnb: 'airbnb.com',
  Stripe: 'stripe.com',
  Shopify: 'shopify.com',
  Notion: 'notion.so',
  OpenAI: 'openai.com',
  Yahoo: 'yahoo.co.jp',
  ZOZOTOWN: 'zozo.jp',
  PayPay: 'paypay.ne.jp',
  Mizuho: 'mizuhogroup.com',
  SMBC: 'smbc.co.jp',
  MUFG: 'mufg.jp',
  Nomura: 'nomura.com',
  Daiwa: 'daiwa-grp.jp',
  Keyence: 'keyence.co.jp',
  Murata: 'murata.com',
  TDK: 'tdk.com',
  Omron: 'omron.com',
  Kyocera: 'kyocera.com',
  Yamaha: 'yamaha.com',
  BandaiNamco: 'bandainamco.co.jp',
  Capcom: 'capcom.co.jp',
  SquareEnix: 'square-enix.com',
  Konami: 'konami.com',
  Sega: 'sega.co.jp',
  Casio: 'casio.com',
  Ricoh: 'ricoh.com',
  Sharp: 'global.sharp',
  Fujifilm: 'fujifilm.com',
  Olympus: 'olympus-global.com',
  Terumo: 'terumo.com',
  Eisai: 'eisai.com',
  Takeda: 'takeda.com',
  Astellas: 'astellas.com',
  Otsuka: 'otsuka.com',
  MitsubishiUFJ: 'mufg.jp',
  Itochu: 'itochu.co.jp',
  Marubeni: 'marubeni.com',
  Mitsui: 'mitsui.com',
  Sumitomo: 'sumitomocorp.com',
  Nitori: 'nitori-net.jp',
  Aeon: 'aeon.info',
  MitsubishiEstate: 'mec.co.jp',
  MitsuiFudosan: 'mitsuifudosan.co.jp',
  NomuraRealEstate: 'nomura-re.co.jp',
  Obayashi: 'obayashi.co.jp',
  Kajima: 'kajima.co.jp',
  Shimizu: 'shimz.co.jp',
  Taisei: 'taisei.co.jp',
  Yamato: 'yamato-hd.co.jp',
  Sagawa: 'sagawa-exp.co.jp',
  JapanPost: 'japanpost.jp',
  Medley: 'medley.jp',
  Ubie: 'ubie.life',
  Visional: 'visional.inc',
  Cybozu: 'cybozu.co.jp',
  GMO: 'gmo.jp',
  Mixi: 'mixi.co.jp',
  Hatena: 'hatena.ne.jp',
  BASE: 'binc.jp',
  PLAID: 'plaid.co.jp',
  Uzabase: 'uzabase.com',
  Moneytree: 'moneytree.jp',
  Aidemy: 'aidemy.co.jp',
  PreferredNetworks: 'preferred.jp',
  LayerXInc: 'layerx.co.jp',
};

const companyOptions = Object.keys(companyDomains);

const universityOptions = [
  '北海道大学', '東北大学', '筑波大学', '千葉大学', '東京大学', '東京科学大学', '一橋大学', '東京外国語大学', 'お茶の水女子大学',
  '横浜国立大学', '名古屋大学', '京都大学', '大阪大学', '神戸大学', '広島大学', '九州大学', '早稲田大学', '慶應義塾大学',
  '上智大学', '東京理科大学', '明治大学', '青山学院大学', '立教大学', '中央大学', '法政大学', '学習院大学', '成蹊大学',
  '成城大学', '明治学院大学', '國學院大學', '武蔵大学', '日本大学', '東洋大学', '駒澤大学', '専修大学', '国際基督教大学',
  '津田塾大学', '東京女子大学', '日本女子大学', '同志社大学', '立命館大学', '関西大学', '関西学院大学', '近畿大学',
  '南山大学', '名城大学', '中京大学', '愛知大学', '愛知学院大学', '名古屋市立大学', '名古屋工業大学', '大阪公立大学',
  '東京都立大学', '横浜市立大学', '福岡大学', '西南学院大学', '立命館アジア太平洋大学',
  '小樽商科大学', '帯広畜産大学', '旭川医科大学', '弘前大学', '岩手大学', '秋田大学', '山形大学', '福島大学',
  '茨城大学', '宇都宮大学', '群馬大学', '埼玉大学', '東京学芸大学', '東京農工大学', '電気通信大学', '東京海洋大学',
  '長岡技術科学大学', '新潟大学', '富山大学', '金沢大学', '福井大学', '山梨大学', '信州大学', '岐阜大学',
  '静岡大学', '三重大学', '滋賀大学', '滋賀医科大学', '京都工芸繊維大学', '奈良女子大学', '和歌山大学',
  '鳥取大学', '島根大学', '岡山大学', '山口大学', '徳島大学', '鳴門教育大学', '香川大学', '愛媛大学',
  '高知大学', '佐賀大学', '長崎大学', '熊本大学', '大分大学', '宮崎大学', '鹿児島大学', '琉球大学',
  '札幌医科大学', '青森公立大学', '岩手県立大学', '国際教養大学', '会津大学', '高崎経済大学', '前橋工科大学',
  '埼玉県立大学', '千葉県立保健医療大学', '東京医科歯科大学', '産業技術大学院大学', '神奈川県立保健福祉大学',
  '新潟県立大学', '富山県立大学', '石川県立大学', '福井県立大学', '都留文科大学', '長野県立大学',
  '岐阜薬科大学', '静岡県立大学', '愛知県立大学', '京都府立大学', '兵庫県立大学', '奈良県立大学',
  '島根県立大学', '岡山県立大学', '県立広島大学', '高知県立大学', '福岡県立大学', '熊本県立大学',
  '宮崎公立大学', '沖縄県立芸術大学', '北海学園大学', '東北学院大学', '獨協大学', '国際武道大学',
  '千葉工業大学', '亜細亜大学', '桜美林大学', '大妻女子大学', '共立女子大学', '工学院大学', '国士舘大学',
  '駒沢女子大学', '芝浦工業大学', '順天堂大学', '昭和女子大学', '白百合女子大学', '聖心女子大学',
  '創価大学', '大東文化大学', '拓殖大学', '玉川大学', '帝京大学', '東海大学', '東京電機大学',
  '東京都市大学', '東京農業大学', '東邦大学', '東洋英和女学院大学', '二松学舎大学', '文教大学',
  '武蔵野大学', '明星大学', '立正大学', '神奈川大学', '関東学院大学', 'フェリス女学院大学',
  '金沢工業大学', '愛知淑徳大学', '椙山女学園大学', '中部大学', '豊田工業大学', '名古屋外国語大学',
  '名古屋学芸大学', '京都産業大学', '京都女子大学', '同志社女子大学', '佛教大学', '龍谷大学',
  '大阪工業大学', '大阪経済大学', '関西外国語大学', '甲南大学', '神戸学院大学', '神戸女学院大学',
  '武庫川女子大学', '岡山理科大学', '広島修道大学', '松山大学', '久留米大学', '熊本学園大学',
  'Harvard University', 'Stanford University', 'Massachusetts Institute of Technology', 'University of California, Berkeley',
  'University of California, Los Angeles', 'Columbia University', 'Yale University', 'Princeton University', 'University of Oxford',
  'University of Cambridge', 'Imperial College London', 'University College London', 'National University of Singapore',
  'Nanyang Technological University', 'Seoul National University', 'Yonsei University', 'Korea University', 'Peking University',
  'Tsinghua University', 'University of Hong Kong', 'University of Toronto', 'University of British Columbia',
];

const cityOptions = [
  '東京都渋谷区', '東京都新宿区', '東京都港区', '東京都目黒区', '東京都品川区', '東京都世田谷区', '東京都千代田区',
  '横浜市', '川崎市', 'さいたま市', '千葉市', '札幌市', '仙台市', '名古屋市', '京都市', '大阪市', '神戸市',
  '広島市', '福岡市', '那覇市', '岐阜県', '静岡市', '金沢市', '新潟市', '熊本市', '鹿児島市',
  'New York', 'Los Angeles', 'San Francisco', 'Seattle', 'Boston', 'Chicago', 'Austin', 'Washington D.C.',
  'Toronto', 'Vancouver', 'London', 'Paris', 'Berlin', 'Amsterdam', 'Madrid', 'Barcelona', 'Rome', 'Milan',
  'Zurich', 'Geneva', 'Stockholm', 'Copenhagen', 'Oslo', 'Helsinki', 'Dublin', 'Lisbon', 'Vienna',
  'Singapore', 'Seoul', 'Busan', 'Beijing', 'Shanghai', 'Shenzhen', 'Hong Kong', 'Taipei', 'Bangkok',
  'Ho Chi Minh City', 'Hanoi', 'Kuala Lumpur', 'Jakarta', 'Manila', 'Sydney', 'Melbourne', 'Auckland',
  'Dubai', 'Abu Dhabi', 'Doha', 'Tel Aviv', 'Istanbul', 'Mumbai', 'Bengaluru', 'Delhi', 'São Paulo',
  'Rio de Janeiro', 'Mexico City', 'Buenos Aires', 'Cape Town', 'Johannesburg',
];

const yearOptions = Array.from({ length: 62 }, (_, index) => String(1970 + index));
const birthdayYearOptions = Array.from({ length: 80 }, (_, index) => String(2026 - index));
const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
const dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1));

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
  period?: string;
  startYear?: string;
  startMonth?: string;
  endYear?: string;
  endMonth?: string;
};

type VisibilityValue = 'public' | 'private';
type VisibilityKey = 'location' | 'birthday' | 'highSchool' | 'university' | 'vocational' | 'currentWork';

type StoredProfile = {
  form?: Partial<ProfileForm>;
  photo?: string;
  crop?: { zoom: number; x: number; y: number };
  careerRows?: Career[];
  visibility?: Partial<Record<VisibilityKey, VisibilityValue>>;
};

const careers: Career[] = [
  { title: 'Women@Dior Mentee', company: 'Dior', startYear: '2024', startMonth: '2', endYear: '2025', endMonth: '4' },
  { title: 'Sales Intern', company: 'Tesla', startYear: '2025', startMonth: '2', endYear: '2025', endMonth: '8' },
  { title: 'Solution Engineer Intern', company: 'Microsoft', startYear: '2025', startMonth: '8', endYear: '2025', endMonth: '9' },
  { title: 'Global Brand Intern', company: 'Fast Retailing', startYear: '2026', startMonth: '3', endYear: '2026', endMonth: '4' },
];

const defaultVisibility: Record<VisibilityKey, VisibilityValue> = {
  location: 'public',
  birthday: 'public',
  highSchool: 'public',
  university: 'public',
  vocational: 'public',
  currentWork: 'public',
};

function readStoredProfile(): StoredProfile {
  try {
    const raw = window.localStorage.getItem('bondyProfile');
    return raw ? JSON.parse(raw) as StoredProfile : {};
  } catch {
    return {};
  }
}

function readStoredAccount() {
  try {
    const raw = window.localStorage.getItem('bondyAccount');
    return raw ? JSON.parse(raw) as { name?: string; handle?: string } : {};
  } catch {
    return {};
  }
}

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
  if (!company.trim()) {
    return <span className="edit-company-logo empty">+</span>;
  }
  if (!src || failed) {
    return <span className="edit-company-logo fallback">{company.slice(0, 1).toUpperCase()}</span>;
  }
  return (
    <span className="edit-company-logo">
      <img src={src} alt={`${company} logo`} onError={() => setFailed(true)} />
    </span>
  );
}

function parseBirthday(value: string) {
  const [year = '2000', month = '1', day = '1'] = value.replace(/-/g, '/').split('/');
  return { year, month: String(Number(month) || 1), day: String(Number(day) || 1) };
}

function formatBirthday(year: string, month: string, day: string) {
  return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
}

function normalizeCareer(career: Career): Career {
  if (career.startYear && career.endYear) return career;
  const parts = career.period?.match(/(\d{4})年(\d{1,2})月\s*-\s*(\d{4})年(\d{1,2})月/);
  return {
    ...career,
    startYear: parts?.[1] || '2025',
    startMonth: parts?.[2] || '1',
    endYear: parts?.[3] || '2025',
    endMonth: parts?.[4] || '12',
  };
}

function careerPeriodLabel(career: Career) {
  const normalized = normalizeCareer(career);
  return `${normalized.startYear}年${normalized.startMonth}月 - ${normalized.endYear}年${normalized.endMonth}月`;
}

function VisibilityToggle({ value, onChange }: { value: VisibilityValue; onChange: (value: VisibilityValue) => void }) {
  return (
    <span className="edit-privacy-toggle">
      <button className={value === 'public' ? 'active' : ''} onClick={() => onChange('public')}>公開</button>
      <button className={value === 'private' ? 'active' : ''} onClick={() => onChange('private')}>非公開</button>
    </span>
  );
}

export function Profile({ actions }: { actions: AppActions }) {
  const storedProfile = readStoredProfile();
  const storedAccount = readStoredAccount();
  const [editing, setEditing] = useState(false);
  const [companyQuery, setCompanyQuery] = useState('');
  const [universityQuery, setUniversityQuery] = useState('');
  const [universityPickerOpen, setUniversityPickerOpen] = useState(false);
  const [companyPickerTarget, setCompanyPickerTarget] = useState<'current' | `career-${number}` | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [photo, setPhoto] = useState(storedProfile.photo || currentUser.avatar);
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState(storedProfile.crop || { zoom: 112, x: 50, y: 50 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [careerRows, setCareerRows] = useState((storedProfile.careerRows?.length ? storedProfile.careerRows : careers).map(normalizeCareer));
  const [visibility, setVisibility] = useState<Record<VisibilityKey, VisibilityValue>>({ ...defaultVisibility, ...storedProfile.visibility });
  const [locationQuery, setLocationQuery] = useState('');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: storedProfile.form?.name || storedAccount.name || currentUser.name,
    handle: storedProfile.form?.handle || storedAccount.handle || currentUser.handle.replace('@', ''),
    highSchool: '岐阜高校',
    university: currentUser.school,
    vocational: '',
    currentRole: currentUser.title,
    currentCompany: currentUser.company === '株式会社Mesh' ? 'Microsoft' : currentUser.company,
    currentYear: '2025',
    currentMonth: '8',
    location: currentUser.location,
    birthday: '2026/06/25',
    ...storedProfile.form,
  });

  const update = (key: keyof ProfileForm, value: string) => {
    setSaveState('idle');
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const companyMatches = companyOptions
    .filter((company) => company.toLowerCase().includes(companyQuery.trim().toLowerCase()))
    .slice(0, 40);

  const universityMatches = universityOptions
    .filter((university) => university.includes(universityQuery.trim()) || university.toLowerCase().includes(universityQuery.trim().toLowerCase()))
    .slice(0, 36);

  const locationMatches = cityOptions
    .filter((city) => city.includes(locationQuery.trim()) || city.toLowerCase().includes(locationQuery.trim().toLowerCase()))
    .slice(0, 48);

  const ownHandle = (storedAccount.handle || currentUser.handle).replace(/^@/, '').trim().toLowerCase();
  const normalizedHandle = form.handle.replace(/^@/, '').trim().toLowerCase();
  const handleTaken = normalizedHandle.length > 0 && normalizedHandle !== ownHandle && people.some((person) => person.handle.replace(/^@/, '').toLowerCase() === normalizedHandle);
  const birthdayParts = parseBirthday(form.birthday);

  const updateVisibility = (key: VisibilityKey, value: VisibilityValue) => {
    setSaveState('idle');
    setVisibility((prev) => ({ ...prev, [key]: value }));
  };

  const chooseCompany = (company: string) => {
    if (companyPickerTarget === 'current') {
      update('currentCompany', company);
    } else if (companyPickerTarget?.startsWith('career-')) {
      const index = Number(companyPickerTarget.replace('career-', ''));
      setSaveState('idle');
      setCareerRows((prev) => prev.map((career, careerIndex) => (careerIndex === index ? { ...career, company } : career)));
    }
    setCompanyQuery('');
    setCompanyPickerTarget(null);
  };

  const chooseUniversity = (university: string) => {
    update('university', university);
    setUniversityQuery('');
    setUniversityPickerOpen(false);
  };

  const chooseLocation = (city: string) => {
    update('location', city);
    setLocationQuery('');
    setLocationPickerOpen(false);
  };

  const updateCareer = (index: number, key: keyof Career, value: string) => {
    setSaveState('idle');
    setCareerRows((prev) => prev.map((career, careerIndex) => (careerIndex === index ? { ...career, [key]: value } : career)));
  };

  const addCareer = () => {
    setCareerRows((prev) => [...prev, { title: '', company: 'Microsoft', startYear: '2025', startMonth: '1', endYear: '2025', endMonth: '12' }]);
  };

  const removeCareer = (index: number) => {
    setCareerRows((prev) => prev.filter((_, careerIndex) => careerIndex !== index));
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    if (handleTaken) {
      window.alert('このIDはすでに使われています。別のIDを入力してください。');
      return;
    }
    setSaveState('saving');
    window.localStorage.setItem('bondyProfile', JSON.stringify({ form, photo, crop, careerRows, visibility }));
    window.setTimeout(() => setSaveState('saved'), 520);
  };

  const clearCurrentWork = () => {
    setSaveState('idle');
    setForm((prev) => ({
      ...prev,
      currentRole: '',
      currentCompany: '',
      currentYear: '',
      currentMonth: '',
    }));
  };

  const info = [
    { label: '学校', value: form.university, icon: GraduationCap },
    { label: '会社', value: [form.currentCompany, form.currentRole].filter(Boolean).join(' / ') || '未設定', icon: Briefcase },
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
        </header>

        <section className="edit-photo-card">
          <button className="edit-photo-button" onClick={() => fileInputRef.current?.click()}>
            <span className="edit-photo-preview">
              <img
                src={photo}
                alt={form.name}
                style={{ transform: `scale(${crop.zoom / 100})`, transformOrigin: `${crop.x}% ${crop.y}%` }}
              />
            </span>
            <i><Camera size={18} />写真を変更</i>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} hidden />
        </section>

        <section className="edit-section-card">
          <h2>基本情報</h2>
          <label><span className="required-label">名前<em>*</em></span><input value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
          <label>
            <span className="required-label">ユーザーID<em>*</em></span>
            <input value={form.handle} onChange={(event) => update('handle', event.target.value)} />
            {form.handle.trim() && (
              <small className={`id-check ${handleTaken ? 'bad' : 'good'}`}>
                {handleTaken ? 'このIDはすでに使われています' : 'このIDは使用できます'}
              </small>
            )}
          </label>
          <div className="edit-inline-field">
            <div className="edit-field-head"><strong>所在地</strong><VisibilityToggle value={visibility.location} onChange={(value) => updateVisibility('location', value)} /></div>
            <button className="edit-select-button" onClick={() => setLocationPickerOpen((prev) => !prev)}>{form.location || '都市を選択'}<ChevronDown size={18} /></button>
            {locationPickerOpen && (
              <div className="company-picker-panel location-picker-panel">
                <label><Search size={17} /><input value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder="都市名を検索" /></label>
                <div>
                  {locationMatches.map((city) => (
                    <button key={city} onClick={() => chooseLocation(city)}><span>{city}</span></button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="edit-inline-field">
            <div className="edit-field-head"><strong>誕生日</strong><VisibilityToggle value={visibility.birthday} onChange={(value) => updateVisibility('birthday', value)} /></div>
            <div className="birthday-picker">
              <select value={birthdayParts.year} onChange={(event) => update('birthday', formatBirthday(event.target.value, birthdayParts.month, birthdayParts.day))}>
                {birthdayYearOptions.map((year) => <option key={year}>{year}</option>)}
              </select>
              <select value={birthdayParts.month} onChange={(event) => update('birthday', formatBirthday(birthdayParts.year, event.target.value, birthdayParts.day))}>
                {monthOptions.map((month) => <option key={month}>{month}</option>)}
              </select>
              <select value={birthdayParts.day} onChange={(event) => update('birthday', formatBirthday(birthdayParts.year, birthdayParts.month, event.target.value))}>
                {dayOptions.map((day) => <option key={day}>{day}</option>)}
              </select>
            </div>
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
              <div className="edit-field-head"><strong>{label}</strong><VisibilityToggle value={visibility[key as VisibilityKey]} onChange={(value) => updateVisibility(key as VisibilityKey, value)} /></div>
              {key === 'university' ? (
                <>
                  <div className={`editable-with-clear ${form.university ? '' : 'single'}`}>
                    <button className="edit-select-button" onClick={() => setUniversityPickerOpen((prev) => !prev)}>
                      <span className={form.university ? '' : 'placeholder'}>{form.university || placeholder}</span><ChevronDown size={18} />
                    </button>
                    {form.university && <button onClick={() => update('university', '')} aria-label="大学を削除"><X size={17} /></button>}
                  </div>
                  {universityPickerOpen && (
                    <div className="company-picker-panel university-picker-panel">
                      <label><Search size={17} /><input value={universityQuery} onChange={(event) => setUniversityQuery(event.target.value)} placeholder="大学名を検索" /></label>
                      <div>
                        {universityMatches.map((university) => (
                          <button key={university} onClick={() => chooseUniversity(university)}><span>{university}</span></button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
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
              )}
              <label className="student-check"><input type="checkbox" />現在在学中</label>
            </div>
          ))}
        </section>

        <section className="edit-section-card">
          <h2>現在の仕事 <em>学校または会社 必須</em></h2>
          <p>いまの仕事や所属している会社を入力できます。</p>
          <div className="current-work-card">
            <div className="edit-field-head"><strong>現在</strong><VisibilityToggle value={visibility.currentWork} onChange={(value) => updateVisibility('currentWork', value)} /></div>
            <input value={form.currentRole} onChange={(event) => update('currentRole', event.target.value)} placeholder="職種・役割 例: Solution Engineer" />
            <div className="company-input-row">
              <CompanyLogo company={form.currentCompany} />
              <button onClick={() => setCompanyPickerTarget(companyPickerTarget === 'current' ? null : 'current')}>
                {form.currentCompany || '企業を選択または入力'}<ChevronDown size={18} />
              </button>
            </div>
            {companyPickerTarget === 'current' && (
              <div className="company-picker-panel">
                <label><Search size={17} /><input value={companyQuery} onChange={(event) => setCompanyQuery(event.target.value)} placeholder="公式ロゴ対応企業を検索" /></label>
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
                {yearOptions.map((year) => <option key={year}>{year}</option>)}
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
            {(form.currentRole || form.currentCompany || form.currentYear || form.currentMonth) && (
              <button className="clear-current-work-button" onClick={clearCurrentWork}>現在の仕事を削除</button>
            )}
          </div>
        </section>

        <section className="edit-section-card career-history-card">
          <div className="career-title-row">
            <div>
              <h2>今までの職歴</h2>
              <p>インターン、前職、プロジェクトなどを追加できます。</p>
            </div>
            <button onClick={addCareer}><Plus size={24} /></button>
          </div>
          <div className="career-list-preview">
            {careerRows.map((career, index) => (
              <div className="career-preview-row editable-career-row" key={`${career.company}-${index}`}>
                <CompanyLogo company={career.company} />
                <span>
                  <input value={career.title} onChange={(event) => updateCareer(index, 'title', event.target.value)} placeholder="職種・役割" />
                  <button onClick={() => setCompanyPickerTarget(companyPickerTarget === `career-${index}` ? null : `career-${index}`)}>{career.company}<ChevronDown size={16} /></button>
                  {companyPickerTarget === `career-${index}` && (
                    <div className="company-picker-panel career-company-picker">
                      <label><Search size={17} /><input value={companyQuery} onChange={(event) => setCompanyQuery(event.target.value)} placeholder="企業名を検索" /></label>
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
                  <div className="career-period-picker">
                    <label>
                      <small>開始</small>
                      <select value={career.startYear} onChange={(event) => updateCareer(index, 'startYear', event.target.value)}>
                        {yearOptions.map((year) => <option key={year}>{year}</option>)}
                      </select>
                      <select value={career.startMonth} onChange={(event) => updateCareer(index, 'startMonth', event.target.value)}>
                        {monthOptions.map((month) => <option key={month}>{month}</option>)}
                      </select>
                    </label>
                    <label>
                      <small>終了</small>
                      <select value={career.endYear} onChange={(event) => updateCareer(index, 'endYear', event.target.value)}>
                        {yearOptions.map((year) => <option key={year}>{year}</option>)}
                      </select>
                      <select value={career.endMonth} onChange={(event) => updateCareer(index, 'endMonth', event.target.value)}>
                        {monthOptions.map((month) => <option key={month}>{month}</option>)}
                      </select>
                    </label>
                    <em>{careerPeriodLabel(career)}</em>
                  </div>
                </span>
                <button className="career-remove-button" onClick={() => removeCareer(index)} aria-label="職歴を削除"><X size={17} /></button>
              </div>
            ))}
          </div>
        </section>

        <button className="profile-edit-save-bottom" onClick={saveProfile}>
          {saveState === 'saving' ? '保存中...' : saveState === 'saved' ? '保存しました' : 'プロフィールを保存'}
        </button>

        {cropOpen && (
          <div className="crop-editor-overlay">
            <section className="crop-editor-sheet">
              <header>
                <h2>写真を調整</h2>
                <button onClick={() => setCropOpen(false)}><X size={21} /></button>
              </header>
              <div className="crop-preview">
                <img
                  src={photo}
                  alt=""
                  style={{ transform: `scale(${crop.zoom / 100})`, transformOrigin: `${crop.x}% ${crop.y}%` }}
                />
              </div>
              <label>拡大<input type="range" min="100" max="180" value={crop.zoom} onChange={(event) => setCrop((prev) => ({ ...prev, zoom: Number(event.target.value) }))} /></label>
              <label>左右<input type="range" min="20" max="80" value={crop.x} onChange={(event) => setCrop((prev) => ({ ...prev, x: Number(event.target.value) }))} /></label>
              <label>上下<input type="range" min="20" max="80" value={crop.y} onChange={(event) => setCrop((prev) => ({ ...prev, y: Number(event.target.value) }))} /></label>
              <button onClick={() => setCropOpen(false)}>この写真にする</button>
            </section>
          </div>
        )}
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
          <img src={photo} alt={form.name} />
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
          <span><b>43</b>会った回数</span>
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
