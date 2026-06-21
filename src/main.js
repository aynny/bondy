import { AUTH_CONFIG } from './auth-config.js';

const app = document.querySelector('#root');
const STORAGE_KEY = 'bondy.profile.v1';
const LAST_EMAIL_KEY = 'bondy.auth.email.v1';
const SIGNUP_PENDING_KEY = 'bondy.auth.pendingSignup.v1';
const MAP_POSITIONS_KEY = 'bondy.map.positions.v1';
const REMOTE_PROFILE_TABLE = 'profiles';
const CONNECTION_REQUEST_TABLE = 'connection_requests';
const SUPPORT_EMAIL = 'bondy1.app@gmail.com';
const savedUser = loadUser();
const authState = {
  client: null,
  configured: Boolean(AUTH_CONFIG.supabaseUrl && AUTH_CONFIG.supabaseAnonKey),
  user: null,
  ready: false
};

const state = {
  screen: savedUser ? 'map' : 'login',
  authMode: 'signin',
  introTab: '申請',
  connectionFilter: 'すべて',
  mapMode: 'マップ',
  filter: 'すべて',
  mapCenter: 'you',
  zoom: 1,
  mapPan: { x: 0, y: 0 },
  overlay: null,
  toast: '',
  handledRequests: {},
  handledConnectToken: '',
  saved: false,
  user: savedUser,
  connections: [],
  requests: [],
  notifications: [],
  mapNodePositions: loadMapNodePositions()
};

const universityOptions = buildUniversityOptions();
const locationOptions = buildLocationOptions();
const mapInteraction = {
  active: false,
  mode: '',
  node: null,
  pointerId: null,
  startX: 0,
  startY: 0,
  startPanX: 0,
  startPanY: 0,
  dragged: false,
  pointers: new Map(),
  pinchStartDistance: 0,
  pinchStartZoom: 1,
  pinchStartPanX: 0,
  pinchStartPanY: 0,
  pinchStartCenterX: 0,
  pinchStartCenterY: 0,
  raf: null
};

function buildUniversityOptions() {
  const core = [
    '北海道大学', '北海道教育大学', '室蘭工業大学', '小樽商科大学', '帯広畜産大学', '旭川医科大学', '北見工業大学', '弘前大学', '岩手大学', '東北大学',
    '宮城教育大学', '秋田大学', '山形大学', '福島大学', '茨城大学', '筑波大学', '筑波技術大学', '宇都宮大学', '群馬大学', '埼玉大学',
    '千葉大学', '東京大学', '東京医科歯科大学', '東京外国語大学', '東京学芸大学', '東京農工大学', '東京芸術大学', '東京工業大学', '東京海洋大学', 'お茶の水女子大学',
    '電気通信大学', '一橋大学', '横浜国立大学', '新潟大学', '長岡技術科学大学', '上越教育大学', '富山大学', '金沢大学', '福井大学', '山梨大学',
    '信州大学', '岐阜大学', '静岡大学', '浜松医科大学', '名古屋大学', '愛知教育大学', '名古屋工業大学', '豊橋技術科学大学', '三重大学', '滋賀大学',
    '滋賀医科大学', '京都大学', '京都教育大学', '京都工芸繊維大学', '大阪大学', '大阪教育大学', '神戸大学', '兵庫教育大学', '奈良教育大学', '奈良女子大学',
    '和歌山大学', '鳥取大学', '島根大学', '岡山大学', '広島大学', '山口大学', '徳島大学', '鳴門教育大学', '香川大学', '愛媛大学',
    '高知大学', '九州大学', '九州工業大学', '福岡教育大学', '佐賀大学', '長崎大学', '熊本大学', '大分大学', '宮崎大学', '鹿児島大学',
    '鹿屋体育大学', '琉球大学', '慶應義塾大学', '早稲田大学', '上智大学', '明治大学', '青山学院大学', '立教大学', '中央大学', '法政大学',
    '学習院大学', '成蹊大学', '成城大学', '明治学院大学', '國學院大學', '武蔵大学', '日本大学', '東洋大学', '駒澤大学', '専修大学',
    '東京理科大学', '芝浦工業大学', '東京都市大学', '工学院大学', '東京電機大学', '東京農業大学', '北里大学', '順天堂大学', '昭和大学', '東邦大学',
    '日本医科大学', '東京慈恵会医科大学', '聖路加国際大学', '国際基督教大学', '津田塾大学', '東京女子大学', '日本女子大学', '大妻女子大学', '共立女子大学', '実践女子大学',
    '同志社大学', '立命館大学', '関西大学', '関西学院大学', '京都産業大学', '近畿大学', '甲南大学', '龍谷大学', '大阪工業大学', '摂南大学',
    '関西外国語大学', '同志社女子大学', '京都女子大学', '武庫川女子大学', '神戸女学院大学', '南山大学', '名城大学', '中京大学', '愛知大学', '愛知学院大学',
    '金城学院大学', '椙山女学園大学', '藤田医科大学', '福岡大学', '西南学院大学', '久留米大学', '立命館アジア太平洋大学', '東北学院大学', '北海学園大学', '広島修道大学'
  ];
  const areas = [
    '北海道', '札幌', '函館', '旭川', '青森', '弘前', '岩手', '盛岡', '宮城', '仙台', '秋田', '山形', '福島', '郡山', '茨城', '水戸',
    '栃木', '宇都宮', '群馬', '高崎', '埼玉', '浦和', '千葉', '柏', '東京', '多摩', '神奈川', '横浜', '川崎', '新潟', '長岡', '富山',
    '石川', '金沢', '福井', '山梨', '甲府', '長野', '松本', '岐阜', '静岡', '浜松', '愛知', '名古屋', '三重', '津', '滋賀', '京都',
    '大阪', '堺', '兵庫', '神戸', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '福山', '山口', '徳島', '香川', '高松', '愛媛',
    '松山', '高知', '福岡', '北九州', '久留米', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄', '那覇'
  ];
  const suffixes = ['大学', '学院大学', '国際大学', '工科大学', '情報大学', '医療大学', '看護大学', '医療福祉大学', '経済大学', '産業大学', '文理大学'];
  return [...new Set([...core, ...areas.flatMap((area) => suffixes.map((suffix) => `${area}${suffix}`))])];
}

function buildLocationOptions() {
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県',
    '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県',
    '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  const cities = [
    '札幌市', '仙台市', 'さいたま市', '千葉市', '新宿区', '渋谷区', '港区', '世田谷区', '目黒区', '品川区',
    '横浜市', '川崎市', '相模原市', '新潟市', '金沢市', '静岡市', '浜松市', '名古屋市', '京都市', '大阪市',
    '堺市', '神戸市', '岡山市', '広島市', '北九州市', '福岡市', '熊本市', '那覇市'
  ];
  return [...prefectures, ...cities];
}

const icons = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4.5-4.5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  mapPin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  hand: '<path d="M8.6 12.4 5.4 9.2a2.8 2.8 0 0 1 0-4l.2-.2a2.8 2.8 0 0 1 3.9 0l1.4 1.4"/><path d="m15.4 12.4 3.2-3.2a2.8 2.8 0 0 0 0-4l-.2-.2a2.8 2.8 0 0 0-3.9 0l-4.7 4.7a1.8 1.8 0 0 0 2.5 2.5l1.2-1.2"/><path d="m7.5 11.5 5.2 5.2a2 2 0 0 0 2.8 0l.4-.4a2 2 0 0 0 0-2.8l-3.1-3.1"/><path d="m9.2 15.2 2.2 2.2a2 2 0 0 0 2.8 0"/><path d="m6.1 10.1-2.1 2.1 5.9 5.9a2 2 0 0 0 2.8 0l.2-.2"/><path d="m17.9 10.1 2.1 2.1-4.7 4.7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  share: '<path d="M4 12v8h16v-8"/><path d="M12 16V3"/><path d="m7 8 5-5 5 5"/>',
  camera: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3Z"/><circle cx="12" cy="13" r="3"/>',
  grad: '<path d="m22 10-10-5-10 5 10 5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2"/><path d="M3 12h18"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
  map: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3Z"/><path d="M9 3v15M15 6v15"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
  flag: '<path d="M5 22V4h12l-1 5 1 5H5"/>',
  heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1Z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>',
  userPlus: '<path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7 18.3 18.3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/>',
  palette: '<path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-1.8c-.8 0-1.2 1-.7 1.6l.4.5c1.1 1.4.1 3.9-1.8 4.5-1 .3-2 .4-3.1.4Z"/><circle cx="7.5" cy="10.5" r=".7"/><circle cx="10" cy="7.5" r=".7"/><circle cx="14" cy="7.5" r=".7"/><circle cx="16.5" cy="10.5" r=".7"/>',
  document: '<path d="M6 2h9l5 5v15H6Z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  logout: '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 4h5v16h-5"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c-.8 1.3-2.4 1.7-2.7 3"/><path d="M12 17h.01"/>',
  building: '<path d="M4 21V5l8-3 8 3v16"/><path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>',
  external: '<path d="M15 3h6v6"/><path d="m10 14 11-11"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h2v2h-2zM18 14h3v3h-2v4h-5v-2h3v-2h-3z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.6a5.1 5.1 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.8 12.8 0 0 0-6.7 0C6.7 1.4 5.6 1.7 5.6 1.7a4.8 4.8 0 0 0-.1 3.6A5.1 5.1 0 0 0 4.1 9c0 5.1 3.1 6.3 6.1 6.6a3.4 3.4 0 0 0-.9 2.6V22"/>',
  youtube: '<path d="M22 12s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C17.9 4.5 12 4.5 12 4.5s-5.9 0-7.5.4A3 3 0 0 0 2.4 7C2 8.6 2 12 2 12s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.6.4 7.5.4 7.5.4s5.9 0 7.5-.4a3 3 0 0 0 2.1-2.1c.4-1.6.4-5 .4-5Z"/><path d="m10 15 5-3-5-3Z"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/>',
  music: '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  messageCircle: '<path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4.5A8 8 0 1 1 21 12Z"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>'
};

function icon(name, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

function render() {
  app.innerHTML = `${state.screen === 'login' ? loginScreen() : state.screen === 'register' ? registerScreen() : appScreen()}${overlay()}${state.toast ? `<div class="toast">${state.toast}</div>` : ''}`;
}

function loadUser() {
  return loadStoredUser(STORAGE_KEY);
}

function loadMapNodePositions() {
  try {
    const value = JSON.parse(localStorage.getItem(MAP_POSITIONS_KEY));
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function saveMapNodePosition(node) {
  if (!node?.id) return;
  state.mapNodePositions[node.id] = { x: node.x, y: node.y };
  localStorage.setItem(MAP_POSITIONS_KEY, JSON.stringify(state.mapNodePositions));
}

function loadStoredUser(key) {
  try {
    const user = JSON.parse(localStorage.getItem(key));
    return user ? normalizeUser(user) : null;
  } catch {
    return null;
  }
}

function saveUserLocal(user) {
  state.user = normalizeUser(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
  const key = accountProfileKey();
  if (key) localStorage.setItem(key, JSON.stringify(state.user));
  return state.user;
}

async function saveUser(user, options = {}) {
  const saved = saveUserLocal(user);
  if (options.remote !== false) {
    await saveRemoteUser(saved, options);
  }
  return saved;
}

function loadLastEmail() {
  return localStorage.getItem(LAST_EMAIL_KEY) || '';
}

function saveLastEmail(email) {
  const cleanEmail = String(email || '').trim();
  if (cleanEmail) localStorage.setItem(LAST_EMAIL_KEY, cleanEmail);
}

function accountProfileKey() {
  const identity = authState.user?.id || authState.user?.email || '';
  return identity ? `bondy.profile.account.${encodeURIComponent(identity)}.v1` : '';
}

function loadAccountUser() {
  const key = accountProfileKey();
  return key ? loadStoredUser(key) : null;
}

async function loadRemoteUser() {
  if (!authState.client || !authState.user) return null;
  const { data, error } = await authState.client
    .from(REMOTE_PROFILE_TABLE)
    .select('profile')
    .eq('id', authState.user.id)
    .maybeSingle();
  if (error) {
    console.warn('Remote profile load failed', error);
    return null;
  }
  return data?.profile ? normalizeUser(data.profile) : null;
}

async function saveRemoteUser(user, options = {}) {
  if (!authState.client || !authState.user) return false;
  const profile = normalizeUser({
    ...user,
    email: user.email || authState.user.email || ''
  });
  const { error } = await authState.client
    .from(REMOTE_PROFILE_TABLE)
    .upsert({
      id: authState.user.id,
      email: authState.user.email || profile.email,
      handle: profile.handle || authState.user.id,
      profile,
      updated_at: new Date().toISOString()
    });
  if (error) {
    console.warn('Remote profile save failed', error);
    if (!options.silent) showToast('プロフィールのクラウド保存設定を確認してください');
    return false;
  }
  return true;
}

function profileFromRemoteRow(row) {
  if (!row) return null;
  const profile = normalizeUser(row.profile || {});
  return {
    id: row.id,
    email: row.email || profile.email,
    handle: row.handle || profile.handle,
    profile: {
      ...profile,
      email: profile.email || row.email || '',
      handle: profile.handle || row.handle || ''
    }
  };
}

function connectTokenFromValue(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.searchParams.get('connect') || url.pathname.split('/').filter(Boolean).pop() || raw;
  } catch {
    return raw.replace(/^@/, '');
  }
}

async function findProfileByIdOrHandle(value) {
  if (!authState.client || !authState.user) {
    showToast('ログインすると検索できます');
    return null;
  }
  const token = connectTokenFromValue(value);
  if (!token) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
  const query = authState.client
    .from(REMOTE_PROFILE_TABLE)
    .select('id,email,handle,profile')
    .limit(1);
  const { data, error } = isUuid
    ? await query.eq('id', token)
    : await query.ilike('handle', token);
  if (error) {
    console.warn('Profile search failed', error);
    showToast('プロフィール検索の設定を確認してください');
    return null;
  }
  const found = profileFromRemoteRow(data?.[0]);
  if (!found) showToast('該当するユーザーが見つかりません');
  return found;
}

async function sendConnectionRequest(targetId, message = '') {
  if (!authState.client || !authState.user) {
    showToast('ログインすると申請できます');
    return false;
  }
  if (!targetId || targetId === authState.user.id) {
    showToast('自分には申請できません');
    return false;
  }
  const { error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .insert({
      requester_id: authState.user.id,
      recipient_id: targetId,
      message: relationshipFromValue(message) || '紹介',
      status: 'pending'
    });
  if (error) {
    if (error.code === '23505') {
      const { error: retryError } = await authState.client
        .from(CONNECTION_REQUEST_TABLE)
        .update({
          status: 'pending',
          message: relationshipFromValue(message) || '紹介',
          updated_at: new Date().toISOString()
        })
        .eq('requester_id', authState.user.id)
        .eq('recipient_id', targetId);
      if (!retryError) {
        showToast('申請を送信しました');
        return true;
      }
      console.warn('Connection request retry failed', retryError);
      showToast('すでに申請済みです');
      return false;
    }
    console.warn('Connection request failed', error);
    showToast('申請保存の設定を確認してください');
    return false;
  }
  showToast('申請を送信しました');
  return true;
}

async function showConnectTarget(value) {
  const target = await findProfileByIdOrHandle(value);
  if (!target) return false;
  state.overlay = { type: 'connect-profile', target };
  render();
  return true;
}

async function handleIncomingConnect() {
  const token = new URLSearchParams(window.location.search).get('connect');
  if (!token || token === state.handledConnectToken) return;
  const shown = await showConnectTarget(token);
  if (shown) state.handledConnectToken = token;
}

function requestPersonFromRow(row, profilesById) {
  const remote = profilesById.get(row.requester_id);
  const profile = remote?.profile || {};
  const name = profile.name || remote?.handle || 'ユーザー';
  const tag = relationshipFromValue(row.message) || (profile.school ? '大学' : profile.company ? 'ビジネス' : '紹介');
  return {
    id: row.id,
    requesterId: row.requester_id,
    name,
    tag,
    desc: profile.company || profile.school || (remote?.handle ? `@${remote.handle}` : 'Bondyユーザー'),
    common: `${tag}として申請`,
    time: relativeTime(row.created_at),
    photo: profile.photo || ''
  };
}

function relationshipTypes() {
  return ['大学', 'ビジネス', '地元', '家族', 'イベント', '恋人'];
}

function relationshipFromValue(value) {
  const cleanValue = String(value || '').trim();
  return relationshipTypes().includes(cleanValue) ? cleanValue : '';
}

function removalPayload(userId, relationship) {
  return `removed:${userId}:${relationshipFromValue(relationship) || '紹介'}`;
}

function removalFromValue(value) {
  const match = String(value || '').match(/^removed:([^:]+):(.+)$/);
  if (!match) return null;
  return { userId: match[1], relationship: relationshipFromValue(match[2]) || '紹介' };
}

function relativeTime(value) {
  const time = new Date(value).getTime();
  if (!time) return '';
  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return `${Math.floor(days / 7)}週間前`;
}

async function loadIncomingRequests(options = {}) {
  if (!authState.client || !authState.user) return false;
  const { data, error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id,requester_id,recipient_id,status,message,created_at,updated_at')
    .eq('recipient_id', authState.user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Connection request load failed', error);
    if (!options.silent) showToast('申請の読み込み設定を確認してください');
    return false;
  }
  const requesterIds = [...new Set((data || []).map((row) => row.requester_id).filter(Boolean))];
  const profilesById = new Map();
  if (requesterIds.length) {
    const { data: profiles, error: profileError } = await authState.client
      .from(REMOTE_PROFILE_TABLE)
      .select('id,email,handle,profile')
      .in('id', requesterIds);
    if (profileError) {
      console.warn('Request profile load failed', profileError);
    } else {
      (profiles || []).forEach((row) => profilesById.set(row.id, profileFromRemoteRow(row)));
    }
  }
  state.requests = (data || []).map((row) => requestPersonFromRow(row, profilesById));
  render();
  return true;
}

function connectionPersonFromRow(row, profilesById) {
  const currentId = authState.user?.id;
  const otherId = row.requester_id === currentId ? row.recipient_id : row.requester_id;
  const remote = profilesById.get(otherId);
  const profile = remote?.profile || {};
  const tag = relationshipFromValue(row.message) || (profile.school ? '大学' : profile.company ? 'ビジネス' : '紹介');
  const name = profile.name || remote?.handle || 'ユーザー';
  return {
    id: otherId,
    requestId: row.id,
    requesterId: row.requester_id,
    recipientId: row.recipient_id,
    name,
    tag,
    desc: profile.company || profile.school || (remote?.handle ? `@${remote.handle}` : 'Bondyユーザー'),
    common: `${tag}のつながり`,
    time: relativeTime(row.updated_at || row.created_at),
    photo: profile.photo || ''
  };
}

async function loadAcceptedConnections(options = {}) {
  if (!authState.client || !authState.user) return false;
  const { data, error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id,requester_id,recipient_id,status,message,created_at,updated_at')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${authState.user.id},recipient_id.eq.${authState.user.id}`)
    .order('updated_at', { ascending: false });
  if (error) {
    console.warn('Accepted connections load failed', error);
    if (!options.silent) showToast('つながりの読み込み設定を確認してください');
    return false;
  }
  const otherIds = [...new Set((data || []).map((row) => row.requester_id === authState.user.id ? row.recipient_id : row.requester_id).filter(Boolean))];
  const profilesById = new Map();
  if (otherIds.length) {
    const { data: profiles, error: profileError } = await authState.client
      .from(REMOTE_PROFILE_TABLE)
      .select('id,email,handle,profile')
      .in('id', otherIds);
    if (profileError) {
      console.warn('Connection profile load failed', profileError);
    } else {
      (profiles || []).forEach((row) => profilesById.set(row.id, profileFromRemoteRow(row)));
    }
  }
  state.connections = (data || []).map((row) => connectionPersonFromRow(row, profilesById));
  render();
  return true;
}

async function loadRemovalNotifications(options = {}) {
  if (!authState.client || !authState.user) return false;
  const { data, error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id,requester_id,recipient_id,status,message,updated_at,created_at')
    .eq('status', 'rejected')
    .or(`requester_id.eq.${authState.user.id},recipient_id.eq.${authState.user.id}`)
    .order('updated_at', { ascending: false })
    .limit(30);
  if (error) {
    console.warn('Removal notifications load failed', error);
    if (!options.silent) showToast('通知の読み込み設定を確認してください');
    return false;
  }
  const rows = (data || [])
    .map((row) => ({ row, removal: removalFromValue(row.message) }))
    .filter(({ removal }) => removal && removal.userId !== authState.user.id);
  const userIds = [...new Set(rows.map(({ removal }) => removal.userId))];
  const profilesById = new Map();
  if (userIds.length) {
    const { data: profiles } = await authState.client
      .from(REMOTE_PROFILE_TABLE)
      .select('id,email,handle,profile')
      .in('id', userIds);
    (profiles || []).forEach((row) => profilesById.set(row.id, profileFromRemoteRow(row)));
  }
  state.notifications = rows.map(({ row, removal }) => {
    const remote = profilesById.get(removal.userId);
    const profile = remote?.profile || {};
    const name = profile.name || remote?.handle || 'ユーザー';
    return {
      id: row.id,
      name,
      relationship: removal.relationship,
      time: relativeTime(row.updated_at || row.created_at),
      body: `${name}さんが${removal.relationship}のつながりを削除しました`
    };
  });
  render();
  return true;
}

async function updateConnectionRequestStatus(requestId, result) {
  if (!authState.client || !authState.user) return false;
  const status = result === '承認' ? 'accepted' : 'rejected';
  const { error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('recipient_id', authState.user.id);
  if (error) {
    console.warn('Connection request update failed', error);
    showToast('申請の更新設定を確認してください');
    return false;
  }
  if (status === 'accepted') await loadAcceptedConnections({ silent: true });
  return true;
}

async function updateConnectionRelationship(requestId, relationship) {
  if (!authState.client || !authState.user) return false;
  const cleanRelationship = relationshipFromValue(relationship);
  if (!requestId || !cleanRelationship) return false;
  const { error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .update({ message: cleanRelationship, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('status', 'accepted');
  if (error) {
    console.warn('Connection relationship update failed', error);
    showToast('関係の変更設定を確認してください');
    return false;
  }
  await loadAcceptedConnections({ silent: true });
  return true;
}

async function removeConnection(requestId, relationship) {
  if (!authState.client || !authState.user) return false;
  const { error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .update({
      status: 'rejected',
      message: removalPayload(authState.user.id, relationship),
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'accepted');
  if (error) {
    console.warn('Connection removal failed', error);
    showToast('つながり削除の設定を確認してください');
    return false;
  }
  state.connections = state.connections.filter((person) => person.requestId !== requestId);
  if (!state.connections.some((person) => person.id === state.mapCenter)) {
    state.mapCenter = 'you';
  }
  await loadAcceptedConnections({ silent: true });
  return true;
}

async function startQrScanner() {
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
    showToast('このブラウザではID検索を使ってください');
    return;
  }
  const root = document.createElement('div');
  root.className = 'qr-scanner-root';
  root.innerHTML = `
    <div class="scrim"></div>
    <section class="qr-scanner">
      <h2>QRコードを読み取る</h2>
      <video playsinline muted></video>
      <p>相手のBondy QRコードを枠内に入れてください。</p>
      <button type="button">閉じる</button>
    </section>
  `;
  document.body.appendChild(root);
  const video = root.querySelector('video');
  const close = root.querySelector('button');
  let stream;
  let scanning = true;
  const stop = () => {
    scanning = false;
    stream?.getTracks().forEach((track) => track.stop());
    root.remove();
  };
  close.addEventListener('click', stop);
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    await video.play();
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const scan = async () => {
      if (!scanning) return;
      try {
        const codes = await detector.detect(video);
        const value = codes[0]?.rawValue;
        if (value) {
          stop();
          await showConnectTarget(value);
          return;
        }
      } catch (error) {
        console.warn('QR scan failed', error);
      }
      requestAnimationFrame(scan);
    };
    scan();
  } catch (error) {
    console.warn('Camera unavailable', error);
    stop();
    showToast('カメラを使えませんでした。ID検索を使ってください');
  }
}

async function restoreAccountUser() {
  if (!authState.user) return false;
  const email = authState.user.email || '';
  const remoteUser = await loadRemoteUser();
  if (remoteUser) {
    saveUserLocal({ ...remoteUser, email: remoteUser.email || email });
    return true;
  }
  const accountUser = loadAccountUser();
  if (accountUser) {
    saveUserLocal({ ...accountUser, email: accountUser.email || email });
    await saveRemoteUser(state.user, { silent: true });
    return true;
  }
  if (state.user && (!state.user.email || state.user.email === email)) {
    saveUserLocal({ ...state.user, email: state.user.email || email });
    await saveRemoteUser(state.user, { silent: true });
    return true;
  }
  state.user = null;
  localStorage.removeItem(STORAGE_KEY);
  return false;
}

function profileIsComplete(user = state.user) {
  const profile = normalizeUser(user || {});
  return Boolean(profile.name && profile.handle && profile.school && profile.birthday);
}

async function finishAuthenticatedEntry(message = '', options = {}) {
  await loadIncomingRequests({ silent: true });
  await loadAcceptedConnections({ silent: true });
  await loadRemovalNotifications({ silent: true });
  await handleIncomingConnect();
  if (state.overlay?.type === 'connect-profile') return;
  if (!options.requireProfile || profileIsComplete()) {
    go('map', message);
    return;
  }
  go('register', 'プロフィールを登録してください');
}

async function initAuth() {
  if (!authState.configured) {
    authState.ready = true;
    return;
  }
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    authState.client = createClient(AUTH_CONFIG.supabaseUrl, AUTH_CONFIG.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    const { data } = await authState.client.auth.getSession();
    authState.user = data.session?.user || null;
    if (authState.user?.email) saveLastEmail(authState.user.email);
    if (authState.user) await restoreAccountUser();
    const hasPendingSignup = Boolean(localStorage.getItem(SIGNUP_PENDING_KEY));
    const needsSignupProfile = hasPendingSignup && authState.user && !profileIsComplete();
    if (authState.user && state.authMode !== 'updatePassword' && (state.screen === 'login' || needsSignupProfile)) {
      await finishAuthenticatedEntry('', { requireProfile: hasPendingSignup });
    } else if (authState.user) {
      await loadIncomingRequests({ silent: true });
      await loadAcceptedConnections({ silent: true });
      await loadRemovalNotifications({ silent: true });
      await handleIncomingConnect();
    }
    if (!authState.user && state.screen !== 'login' && state.screen !== 'register') {
      state.authMode = 'signin';
      go('login');
    }
    authState.client.auth.onAuthStateChange(async (event, session) => {
      authState.user = session?.user || null;
      if (authState.user?.email) saveLastEmail(authState.user.email);
      if (authState.user) await restoreAccountUser();
      if (event === 'PASSWORD_RECOVERY') {
        state.screen = 'login';
        state.authMode = 'updatePassword';
        render();
        return;
      }
      if (event === 'SIGNED_IN') {
        const hasPendingSignup = Boolean(localStorage.getItem(SIGNUP_PENDING_KEY));
        await finishAuthenticatedEntry(hasPendingSignup ? '' : 'ログインしました', { requireProfile: hasPendingSignup });
        return;
      }
      if (authState.user) {
        await loadIncomingRequests({ silent: true });
        await loadAcceptedConnections({ silent: true });
        await loadRemovalNotifications({ silent: true });
        await handleIncomingConnect();
      }
    });
  } catch (error) {
    console.error(error);
    showToast('認証サービスの読み込みに失敗しました');
  } finally {
    authState.ready = true;
  }
}

async function signUpWithEmail(email, password) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を入れると認証メールを送れます');
    return;
  }
  saveLastEmail(email);
  localStorage.setItem(SIGNUP_PENDING_KEY, email);
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { data, error } = await authState.client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo }
  });
  if (error) {
    showToast(error.message);
    return;
  }
  if (data.session?.user) {
    authState.user = data.session.user;
    await restoreAccountUser();
    go('register', 'プロフィールを登録してください');
    return;
  }
  showToast('認証メールを送信しました');
}

async function sendPasswordReset(email) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を入れると再設定メールを送れます');
    return;
  }
  saveLastEmail(email);
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await authState.client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    showToast(error.message);
    return;
  }
  showToast('再設定メールを送信しました');
}

async function updatePassword(password) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を確認してください');
    return;
  }
  const { error } = await authState.client.auth.updateUser({ password });
  if (error) {
    showToast(error.message);
    return;
  }
  state.authMode = 'signin';
  go('map', 'パスワードを更新しました');
}

async function signInWithEmail(email, password) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を入れるとログインできます');
    return;
  }
  saveLastEmail(email);
  localStorage.removeItem(SIGNUP_PENDING_KEY);
  const { data, error } = await authState.client.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message);
    return;
  }
  authState.user = data.user || authState.user;
  await restoreAccountUser();
  await finishAuthenticatedEntry('ログインしました');
}

async function signInWithProvider(provider) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を確認してください');
    return;
  }
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await authState.client.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });
  if (error) showToast(error.message);
}

function currentUser() {
  const email = authState.user?.email || loadLastEmail();
  const fallbackHandle = email ? email.split('@')[0] : '';
  const user = state.user || {};
  return normalizeUser({
    ...user,
    email: user.email || email,
    handle: user.handle || fallbackHandle,
    name: user.name || fallbackHandle
  });
}

function normalizeUser(user) {
  const emptySns = Object.fromEntries(snsFields().map(({ key }) => [key, '']));
  return {
    name: '',
    handle: '',
    email: '',
    school: '',
    company: '',
    location: '',
    birthday: '',
    photo: '',
    locationPublic: true,
    birthdayPublic: false,
    sns: emptySns,
    ...user,
    sns: {
      ...emptySns,
      ...(user?.sns || {})
    },
    locationPublic: user?.locationPublic ?? true,
    birthdayPublic: user?.birthdayPublic ?? false
  };
}

function snsFields() {
  return [
    { key: 'instagram', label: 'Instagram', icon: icon('insta') },
    { key: 'x', label: 'X', icon: '<em>𝕏</em>' },
    { key: 'threads', label: 'Threads', icon: '<em>@</em>' },
    { key: 'tiktok', label: 'TikTok', icon: icon('music') },
    { key: 'facebook', label: 'Facebook', icon: icon('facebook') },
    { key: 'youtube', label: 'YouTube', icon: icon('youtube') },
    { key: 'linkedin', label: 'LinkedIn', icon: icon('linkedin') },
    { key: 'github', label: 'GitHub', icon: icon('github') },
    { key: 'discord', label: 'Discord', icon: icon('messageCircle') },
    { key: 'note', label: 'note', icon: '<em>n</em>' },
    { key: 'wantedly', label: 'Wantedly', icon: '<em>W</em>' },
    { key: 'website', label: 'Webサイト', icon: '<em>◎</em>' }
  ];
}

function snsFromForm(formData) {
  return Object.fromEntries(snsFields().map(({ key }) => [key, String(formData.get(key) || '').trim()]));
}

function statusBar() {
  return '';
}

function brand(small = false) {
  return `<div class="brand ${small ? 'brand-small' : ''}">B</div>`;
}

function avatar(type = 'man1', size = 58) {
  const source = {
    man1: 'man1.jpg',
    man2: 'man2.jpg',
    woman1: 'woman1.jpg',
    woman2: 'woman2.jpg',
    profile: 'profile.jpg'
  }[type] || 'man1.jpg';
  return `<div class="avatar ${type}" style="--size:${size}px"><img src="./assets/avatars/${source}" alt=""></div>`;
}

function profileAvatar(size = 58) {
  const user = currentUser();
  if (user.photo) {
    return `<div class="avatar profile-avatar" style="--size:${size}px"><img src="${user.photo}" alt=""></div>`;
  }
  return initialsAvatar(user.name || user.handle || user.email || 'あなた', size);
}

function initialsAvatar(name = 'ユーザー', size = 58) {
  const initials = String(name || 'ユーザー').trim().slice(0, 2).toUpperCase();
  return `<div class="avatar initial-avatar" style="--size:${size}px"><b>${escapeHtml(initials)}</b></div>`;
}

function personModalContent(person) {
  const name = person?.name || 'ユーザー';
  const avatarHtml = person?.photo
    ? `<div class="avatar" style="--size:70px"><img src="${escapeHtml(person.photo)}" alt=""></div>`
    : person?.avatar
      ? avatar(person.avatar, 70)
      : initialsAvatar(name, 70);
  const desc = person?.desc || '登録したプロフィール情報を確認できます。';
  const isConnection = Boolean(person?.requestId);
  return `
    <div class="modal-avatar">${avatarHtml}</div>
    <h2>${escapeHtml(name)}</h2>
    <p>${escapeHtml(desc)}</p>
    ${isConnection ? `
      <fieldset class="relationship-picker manage-relationship">
        <legend>関係を変更</legend>
        ${relationshipTypes().map((type) => `<label><input type="radio" name="manageRelationshipType" value="${escapeHtml(type)}" ${person.tag === type ? 'checked' : ''}>${type === '恋人' ? icon('heart', 15) : escapeHtml(type)}</label>`).join('')}
      </fieldset>
      <button data-action="update-relationship" data-request-id="${escapeHtml(person.requestId)}">関係を保存</button>
      <button class="danger-button" data-action="remove-connection" data-request-id="${escapeHtml(person.requestId)}" data-relationship="${escapeHtml(person.tag || '')}">つながりを削除</button>
    ` : ''}
    <button data-close>閉じる</button>
  `;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function loginScreen() {
  const mode = state.authMode;
  const rememberedEmail = escapeHtml(loadLastEmail() || authState.user?.email || state.user?.email || '');
  const authCopy = {
    signin: {
      title: 'おかえりなさい',
      lead: 'メールアドレスとパスワードでログイン',
      submit: 'ログイン',
      intent: 'signin',
      autocomplete: 'current-password'
    },
    signup: {
      title: '新規登録',
      lead: 'メール認証でBondyを始める',
      submit: '認証メールを送る',
      intent: 'signup',
      autocomplete: 'new-password'
    },
    forgot: {
      title: 'パスワード再設定',
      lead: '登録メールに再設定リンクを送ります',
      submit: '再設定メールを送る',
      intent: 'reset'
    },
    updatePassword: {
      title: '新しいパスワード',
      lead: 'これから使うパスワードを設定してください',
      submit: 'パスワードを更新',
      intent: 'update-password',
      autocomplete: 'new-password'
    }
  }[mode] || {};
  const needsPassword = mode !== 'forgot';
  const needsEmail = mode !== 'updatePassword';
  return `
    <main class="phone login-screen">
      ${statusBar()}
      <section class="login-brand">
        ${brand()}
        <h1>Bondy</h1>
        <p>人との出会いを、資産に。</p>
      </section>
      <form class="email-auth-form auth-card" data-auth-form>
        <div class="auth-card-title">
          <h2>${authCopy.title}</h2>
          <p>${authCopy.lead}</p>
        </div>
        ${needsEmail ? `<label>メールアドレス<input name="email" type="email" autocomplete="email" required placeholder="you@example.com" value="${rememberedEmail}"></label>` : ''}
        ${needsPassword ? `<label>パスワード<input name="password" type="password" autocomplete="${authCopy.autocomplete}" required minlength="8" placeholder="8文字以上"></label>` : ''}
        ${mode === 'signup' || mode === 'updatePassword' ? '<label>パスワード確認<input name="passwordConfirm" type="password" autocomplete="new-password" required minlength="8" placeholder="もう一度入力"></label>' : ''}
        <button class="pill primary" name="intent" value="${authCopy.intent}" type="submit">${mode === 'signin' ? '' : icon('mail', 25)}${authCopy.submit}</button>
        ${mode === 'signin' ? '<button class="auth-text-button" type="button" data-action="auth-mode" data-auth-mode="forgot">パスワードを忘れた方</button>' : ''}
        ${mode === 'signin' ? '<button class="pill secondary" type="button" data-action="auth-mode" data-auth-mode="signup">新規登録</button>' : '<button class="pill secondary" type="button" data-action="auth-mode" data-auth-mode="signin">ログインに戻る</button>'}
        ${authState.configured ? '' : '<p class="auth-note">メール認証を使うには Supabase の設定が必要です。</p>'}
      </form>
      ${mode === 'signin' ? `<section class="login-actions compact">
        <div class="divider"><span></span><em>または</em><span></span></div>
        <button class="social google" data-action="google-login"><b>G</b><span>Googleで続ける</span></button>
      </section>` : ''}
      <p class="terms">ログインすることで、利用規約とプライバシーポリシーに<br>同意したものとみなされます</p>
      <div class="home-indicator"></div>
    </main>
  `;
}

function registerScreen() {
  return `
    <main class="phone register-screen">
      ${statusBar()}
      <header class="register-header">
        ${brand(true)}
        <div>
          <h1>プロフィール登録</h1>
          <p>あなたの情報を入力して、Bondyを始めましょう。</p>
        </div>
      </header>
      <form class="register-form" data-register-form>
        ${profileFormFields()}
        <button class="pill primary" type="submit">登録して始める</button>
      </form>
      <button class="register-reset" data-action="back-login">戻る</button>
      <div class="home-indicator"></div>
    </main>
  `;
}

function profileFormFields(user = normalizeUser({}), mode = 'register') {
  return `
    <section class="form-section">
      <h2>基本情報</h2>
      <label>名前<input name="name" required value="${escapeHtml(user.name)}" placeholder="あなたの名前"></label>
      <label>ユーザーID<input name="handle" required value="${escapeHtml(user.handle)}" placeholder="好きなID"></label>
      ${universityField('school', user.school)}
      <label>会社・所属<input name="company" value="${escapeHtml(user.company)}" placeholder="会社名・役職・所属"></label>
    </section>
    <section class="form-section">
      <h2>公開設定</h2>
      ${locationField('location', user.location)}
      ${visibilityField('locationPublic', '所在地', user.locationPublic)}
      <label>誕生日<input name="birthday" type="date" value="${escapeHtml(user.birthday)}" required></label>
      ${visibilityField('birthdayPublic', '誕生日', user.birthdayPublic)}
    </section>
    <fieldset class="form-section sns-fieldset">
      <legend>SNS</legend>
      ${snsFields().map(({ key, label }) => `<input name="${key}" type="url" value="${escapeHtml(user.sns[key])}" placeholder="${label} URL">`).join('')}
    </fieldset>
    <section class="form-section">
      <h2>写真</h2>
      <label>プロフィール写真<input name="photo" type="file" accept="image/*"></label>
      ${mode === 'edit' && user.photo ? '<p class="form-note">新しい写真を選ばない場合、現在の写真を使います。</p>' : ''}
    </section>
  `;
}

function universityField(name, value = '') {
  const label = value || '大学名を検索して選択';
  return `
    <label class="university-field">大学
      <input type="hidden" name="${name}" value="${escapeHtml(value)}" required>
      <button type="button" class="university-select" data-university-open>
        <span>${escapeHtml(label)}</span>
        ${icon('chevronDown', 18)}
      </button>
    </label>
  `;
}

function locationField(name, value = '') {
  const label = value || '地域を選択';
  return `
    <label class="location-field">所在地
      <input type="hidden" name="${name}" value="${escapeHtml(value)}">
      <button type="button" class="university-select location-select" data-location-open>
        <span>${escapeHtml(label)}</span>
        ${icon('chevronDown', 18)}
      </button>
    </label>
  `;
}

function visibilityField(name, label, isPublic) {
  return `
    <fieldset class="visibility-field">
      <legend>${label}</legend>
      <label><input type="radio" name="${name}" value="true" ${isPublic ? 'checked' : ''}>公開</label>
      <label><input type="radio" name="${name}" value="false" ${!isPublic ? 'checked' : ''}>非公開</label>
    </fieldset>
  `;
}

function appScreen() {
  return `
    <main class="phone app-phone ${state.screen}-screen">
      ${statusBar()}
      ${state.screen === 'map' ? mapScreen() : ''}
      ${state.screen === 'connections' ? connectionsScreen() : ''}
      ${state.screen === 'intro' ? introScreen() : ''}
      ${state.screen === 'profile' ? profileScreen() : ''}
      ${state.screen === 'settings' ? settingsScreen() : ''}
      ${state.screen === 'editProfile' ? editProfileScreen() : ''}
      ${['settings', 'editProfile'].includes(state.screen) ? '' : bottomNav()}
      <div class="home-indicator"></div>
    </main>
  `;
}

function appHeader(title = '', extra = '') {
  return `
    <header class="app-header">
      <div><h1 class="app-wordmark">Bondy</h1>${title ? `<span>${title}</span>` : ''}</div>
      <nav>${extra}</nav>
    </header>
  `;
}

function topHeader(title, extra = '') {
  return appHeader(title, extra);
}

function mapScreen() {
  const rows = connectionRowsData();
  const visibleNodes = mapVisibleNodes();
  const filtered = state.filter === 'すべて'
    ? visibleNodes
    : visibleNodes.filter((node) => node.tag === state.filter);
  return `
    ${appHeader('', `${buttonIcon('search', 'search')}${buttonIcon('sliders', 'filter')}${buttonIcon('plus', 'add', 'circle')}`)}
    <div class="map-mode-pill">
      ${switchButton('マップ', 'map')}
    </div>
    <div class="chips">
      ${mapFilters().map((filter) => `<button class="${state.filter === filter ? 'active' : ''} ${filter === '恋人' ? 'heart-chip' : ''}" data-filter="${filter}" aria-label="${filter}">${chipIcon(filter)}${chipLabel(filter)}</button>`).join('')}
    </div>
    <button class="all-filter" data-action="filter">すべてのつながり ${icon('chevronDown', 18)}</button>
    <section class="map-interactive-panel">
      ${state.mapMode === 'マップ' ? networkGraph(filtered) : mapList()}
      <button class="display-settings" data-action="display">${icon('menu', 19)}表示設定</button>
      ${state.mapCenter !== 'you' ? `<button class="map-self-button" data-action="locate">${icon('user', 18)}自分に戻す</button>` : ''}
      <div class="graph-controls">
        <button data-action="locate">${icon('locate')}</button>
        <div><button data-action="zoom-in">${icon('plus')}</button><button data-action="zoom-out">${icon('minus')}</button></div>
      </div>
    </section>
    <section class="map-stats">
      <div>${icon('users')}<span>つながり数</span><b>${rows.length} 人</b><small>承認済み</small></div>
      <div>${icon('building')}<span>共通の会社・学校</span><b>0 件</b></div>
      <div>${icon('users')}<span>共通の知人</span><b>0 人</b></div>
    </section>
  `;
}

function switchButton(label, ic) {
  return `<button class="${state.mapMode === label ? 'active' : ''}" data-mode="${label}">${icon(ic, 23)}${label}</button>`;
}

function chipIcon(filter) {
  return icon({ 'すべて': 'users', '大学': 'grad', 'ビジネス': 'brief', '地元': 'home', '家族': 'users', 'イベント': 'flag', '恋人': 'heart' }[filter], 18);
}

function chipLabel(filter) {
  return filter === '恋人' ? '' : filter === 'イベント' ? '<span>イベント<small>留学・趣味・活動</small></span>' : filter;
}

function mapFilters() {
  return ['すべて', '大学', 'ビジネス', '地元', '家族', 'イベント', '恋人'];
}

function connectionRowsData() {
  return state.connections || [];
}

function mapNodeData() {
  const colors = {
    '大学': '#3b82f6',
    'ビジネス': '#22c55e',
    '地元': '#f59e0b',
    '家族': '#ef476f',
    'イベント': '#8b5cf6',
    '恋人': '#ec4899',
    '紹介': '#111'
  };
  const positions = [
    [50, 18], [74, 30], [80, 58], [68, 78], [50, 84], [30, 78],
    [20, 58], [27, 30], [88, 44], [12, 44], [38, 16], [62, 16]
  ];
  return connectionRowsData().map((person, index) => {
    const [x, y] = positions[index % positions.length];
    const saved = state.mapNodePositions[person.id] || {};
    return {
      ...person,
      x: Number.isFinite(saved.x) ? saved.x : x,
      y: Number.isFinite(saved.y) ? saved.y : y,
      color: colors[person.tag] || '#111',
      centerable: state.mapCenter === 'you'
    };
  });
}

function networkGraph(nodes) {
  const center = mapCenterProfile();
  return `
    <section class="network" data-map-workspace>
      <div class="map-canvas" data-map-canvas style="${mapCanvasStyle()}">
        <svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          ${nodes.map((node) => `<line data-line-node="${escapeHtml(node.id || node.name)}" x1="50" y1="50" x2="${node.x}" y2="${node.y}" stroke="${node.color}" />`).join('')}
        </svg>
        <div class="center-node">${mapCenterAvatar(center)}<h3>${escapeHtml(center.name)}</h3><span>${escapeHtml(center.badge)}</span></div>
        ${nodes.map((node) => `<button class="map-node ${node.centerable ? 'centerable' : 'profile-only'}" type="button" style="left:${node.x}%;top:${node.y}%" data-map-node="${escapeHtml(node.id || node.name)}" data-centerable="${node.centerable ? 'true' : 'false'}" data-person-id="${escapeHtml(node.id || '')}" data-person="${escapeHtml(node.name)}">${personAvatar(node, 54)}<b>${escapeHtml(node.name)}</b><em>${node.centerable ? '中心にする' : escapeHtml(node.tag)}</em></button>`).join('')}
        ${nodes.length ? '' : '<div class="empty-map">まだつながりはありません<br>右上の＋から追加できます</div>'}
      </div>
    </section>
  `;
}

function mapCanvasStyle() {
  return `transform: translate3d(${state.mapPan.x}px, ${state.mapPan.y}px, 0) scale(${state.zoom})`;
}

function mapVisibleNodes() {
  if (state.mapCenter === 'you') {
    return mapNodeData().map((node) => {
      node.centerable = true;
      return node;
    });
  }
  return connectionRowsData()
    .filter((node) => node.id !== state.mapCenter)
    .slice(0, 8)
    .map((node, index) => {
      const positions = [[50, 22], [72, 34], [76, 62], [50, 78], [28, 62], [28, 34], [86, 50], [14, 50]];
      const [x, y] = positions[index % positions.length];
      const saved = state.mapNodePositions[node.id] || {};
      return {
        ...node,
        x: Number.isFinite(saved.x) ? saved.x : x,
        y: Number.isFinite(saved.y) ? saved.y : y,
        color: '#d9d9d9',
        centerable: false
      };
    });
}

function personByIdOrName(value) {
  return connectionRowsData().find((person) => person.id === value || person.name === value)
    || state.requests.find((person) => person.id === value || person.name === value);
}

function personAvatar(person, size = 58) {
  if (person?.photo) return `<div class="avatar" style="--size:${size}px"><img src="${escapeHtml(person.photo)}" alt=""></div>`;
  if (person?.avatar) return avatar(person.avatar, size);
  return initialsAvatar(person?.name || 'ユーザー', size);
}

function mapCenterProfile() {
  const user = currentUser();
  if (state.mapCenter === 'you') {
    return {
      name: user.name || user.handle || 'あなた',
      badge: 'あなた',
      avatar: 'user'
    };
  }
  const selected = personByIdOrName(state.mapCenter) || connectionRowsData()[0] || {};
  return {
    name: selected.name || 'ユーザー',
    badge: selected.tag || 'つながり',
    avatar: selected.avatar,
    photo: selected.photo
  };
}

function mapCenterAvatar(center = mapCenterProfile()) {
  if (center.photo) return `<div class="avatar profile-avatar" style="--size:82px"><img src="${escapeHtml(center.photo)}" alt=""></div>`;
  if (center.avatar === 'user') return profileAvatar(82);
  return avatar(center.avatar, 82);
}

function mapList() {
  const rows = state.mapMode === 'リスト'
    ? emptyPanel('まだつながりはありません', '新しい人を追加すると、ここに一覧で表示されます。')
    : emptyPanel('タイムラインは空です', 'つながりが増えると、出会いや紹介の履歴がここに並びます。');
  return `<section class="mode-panel"><h3>${state.mapMode}</h3>${rows}</section>`;
}

function emptyPanel(title, body) {
  return `<div class="empty-state">${icon('users', 34)}<h4>${title}</h4><p>${body}</p></div>`;
}

function connectionsScreen() {
  const filters = ['すべて', '大学', 'ビジネス', '地元', '家族', 'イベント', '恋人'];
  const allRows = connectionRowsData();
  const rows = state.connectionFilter === 'すべて'
    ? allRows
    : allRows.filter((person) => person.tag === state.connectionFilter);
  return `
    ${appHeader('', `${buttonIcon('search', 'search')}${buttonIcon('bell', 'notifications', state.notifications.length ? 'dot' : '')}`)}
    <section class="connection-filter-bar">
      <h2>つながり</h2>
      <div class="connection-filter-scroll">
        ${filters.map((filter) => `<button class="${state.connectionFilter === filter ? 'active' : ''} ${filter === '恋人' ? 'heart-chip' : ''}" data-connection-filter="${filter}" aria-label="${filter}">${chipIcon(filter)}${chipLabel(filter)}</button>`).join('')}
      </div>
    </section>
    <section class="connections-list">
      ${rows.length ? rows.map(connectionRow).join('') : emptyPanel('該当するつながりはありません', '別の種類を選ぶと一覧を切り替えられます。')}
    </section>
  `;
}

function connectionRow(person) {
  return `
    <article class="connection-row" data-person-id="${escapeHtml(person.id || '')}" data-person="${escapeHtml(person.name)}">
      ${personAvatar(person, 58)}
      <button class="connection-copy" type="button">
        <h3>${escapeHtml(person.name)}${connectionTag(person.tag)}</h3>
        <p>${escapeHtml(person.desc)}</p>
        <p>共通のつながり：${escapeHtml(person.common)}</p>
      </button>
      <time>${escapeHtml(person.time)}</time>
      ${icon('chevronRight', 25)}
    </article>
  `;
}

function connectionTag(tag) {
  return tag === '恋人'
    ? `<small aria-label="恋人">${icon('heart', 15)}</small>`
    : `<small>${escapeHtml(tag)}</small>`;
}

function pendingIntroRequests() {
  return state.requests.filter((request) => !state.handledRequests[request.id]);
}

function introScreen() {
  const pendingCount = pendingIntroRequests().length;
  const hasIntroNotice = pendingCount > 0 || state.notifications.length > 0;
  return `
    ${appHeader('', `${buttonIcon('search', 'search')}${buttonIcon('bell', 'notifications', hasIntroNotice ? 'dot' : '')}`)}
    <div class="screen-tabs tabs">
      ${['申請', '紹介された', '紹介した'].map((tab) => `<button class="${state.introTab === tab ? 'active' : ''}" data-tab="${tab}">${tab}${tab === '申請' && pendingCount ? `<b>${pendingCount}</b>` : ''}</button>`).join('')}
    </div>
    <section class="request-list">
      ${introRows()}
    </section>
  `;
}

function introRows() {
  if (state.introTab !== '申請') {
    return `<div class="intro-empty">${emptyPanel(`${state.introTab}はまだありません`, '紹介が届くとここに表示されます。')}</div>`;
  }
  if (!state.requests.length) {
    return `<div class="intro-empty">${emptyPanel('申請はまだありません', '紹介申請が届くと、承認や拒否をここで管理できます。')}</div>`;
  }
  return state.requests.map((person) => {
    const handled = state.handledRequests[person.id];
    const requestAvatar = person.photo
      ? `<div class="avatar" style="--size:58px"><img src="${escapeHtml(person.photo)}" alt=""></div>`
      : initialsAvatar(person.name, 58);
    return `
      <article class="request-row ${handled ? 'handled' : ''}">
        <button class="request-avatar-button" data-person-id="${person.id}" data-person="${escapeHtml(person.name)}" aria-label="${escapeHtml(person.name)}のプロフィールを見る">${requestAvatar}</button>
        <button class="request-copy" data-person-id="${person.id}" data-person="${escapeHtml(person.name)}">
          <h3>${escapeHtml(person.name)}<small>${escapeHtml(person.tag)}</small></h3>
          <p>${escapeHtml(person.desc)}</p>
          <p>共通のつながり：${escapeHtml(person.common)}</p>
        </button>
        <div class="request-side">
          <time>${person.time} ${icon('chevronRight', 18)}</time>
          ${handled ? `<span>${handled}済み</span>` : `<div><button data-request="${person.id}" data-result="拒否">拒否</button><button class="accept" data-request="${person.id}" data-result="承認">承認</button></div>`}
        </div>
      </article>
    `;
  }).join('');
}

function profileScreen() {
  const user = currentUser();
  const profileUrl = profileLink(user);
  return `
    <header class="profile-actions">
      <button data-action="settings">${icon('settings', 32)}</button>
      <span></span>
      <button data-action="edit">${icon('edit', 31)}</button>
      <button data-action="share">${icon('share', 32)}</button>
    </header>
    <section class="profile-hero">
      <label class="profile-photo" aria-label="プロフィール写真を変更">${profileAvatar(132)}<input type="file" accept="image/*" data-photo-input><span>${icon('camera', 24)}</span></label>
      <div><h1>${escapeHtml(user.name || '未設定')} <span>登録済み</span></h1><p>@${escapeHtml(user.handle || 'your.id')}</p></div>
    </section>
    <section class="info-rows">
      ${infoRow('grad', '大学', user.school || '未入力')}
      ${infoRow('brief', '会社・所属', user.company || '未入力')}
      ${infoRow('mapPin', '所在地', user.locationPublic ? (user.location || '未入力') : '非公開')}
      ${infoRow('calendar', '誕生日', user.birthdayPublic ? (user.birthday || '未入力') : '非公開')}
      <div class="info-row">${icon('link', 25)}<span>SNS</span><strong class="sns">${snsLinks(user)}</strong></div>
    </section>
    <section class="stats-card">${[['users', 'つながり', String(connectionRowsData().length)], ['user', '共通の知人', '0'], ['users', '所属グループ', '0'], ['copy', '保存した人', state.saved ? '1' : '0']].map(([ic, label, value]) => `<div>${icon(ic, 28)}<span>${label}</span><b>${value}</b></div>`).join('')}</section>
    <section class="share-card">
      <h2>${icon('external', 28)}プロフィールを共有</h2>
      <div class="share-content"><p>QRコードをシェアして、<br>あなたのプロフィールを<br>簡単に共有できます。</p><div><div class="qr" aria-label="${escapeHtml(profileUrl)}">${profileQr(profileUrl)}</div><button data-action="save-qr">${icon('download', 18)}QRコードを保存</button></div></div>
      <button class="copy-link" data-action="copy-link">${icon('link', 22)}プロフィールリンクをコピー</button>
    </section>
  `;
}

function profileLink(user = currentUser()) {
  const token = authState.user?.id || user.handle || 'me';
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?connect=${encodeURIComponent(token)}`;
}

function profileQr(value) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(value)}`;
  return `<img src="${src}" alt="プロフィール交換用QRコード" loading="lazy">`;
}

function settingsScreen() {
  const sections = [
    {
      title: 'アカウント',
      rows: [
        ['user', 'プロフィールを編集', 'edit', ''],
        ['lock', 'アカウントとセキュリティ', 'account-security', ''],
        ['bell', '通知設定', 'notifications', '']
      ]
    },
    {
      title: 'つながり',
      rows: [
        ['users', 'つながりの管理', 'manage-connections', ''],
        ['userPlus', '知り合いかもを管理', 'suggested-users', ''],
        ['ban', 'ブロックしたユーザー', 'blocked-users', '']
      ]
    },
    {
      title: '表示・プライバシー',
      rows: [
        ['eye', 'プロフィールの公開範囲', 'profile-visibility', ''],
        ['shield', 'プライバシー設定', 'privacy-settings', ''],
        ['palette', '表示設定', 'display', '']
      ]
    },
    {
      title: 'その他',
      rows: [
        ['help', 'ヘルプ・サポート', 'help-support', ''],
        ['document', '利用規約', 'terms', ''],
        ['shield', 'プライバシーポリシー', 'privacy-policy', ''],
        ['info', 'バージョン情報', 'version-info', 'Ver. 1.2.0']
      ]
    }
  ];

  return `
    <section class="settings-screen-content">
      <header class="settings-header">
        <button data-nav="profile">${icon('chevronRight', 24)}</button>
        <h1>設定</h1>
      </header>
      ${sections.map((section) => `
        <section class="settings-section">
          <h2>${section.title}</h2>
          ${section.rows.map(([ic, label, action, meta]) => settingsRow(ic, label, action, meta)).join('')}
        </section>
      `).join('')}
      <button class="settings-row logout-row" data-action="logout">
        ${icon('logout', 25)}
        <span>ログアウト</span>
        ${icon('chevronRight', 25)}
      </button>
    </section>
  `;
}

function settingsRow(ic, label, action, meta = '') {
  return `
    <button class="settings-row" data-action="${action}">
      ${icon(ic, 25)}
      <span>${label}</span>
      ${meta ? `<em>${meta}</em>` : ''}
      ${icon('chevronRight', 25)}
    </button>
  `;
}

function editProfileScreen() {
  const user = currentUser();
  return `
    <section class="edit-profile-screen">
      <header class="edit-profile-header">
        <button data-nav="profile">${icon('chevronRight', 24)}</button>
        <div>
          <h1>プロフィール編集</h1>
          <p>登録時と同じ項目をまとめて編集できます。</p>
        </div>
      </header>
      <form class="register-form edit-profile-form" data-edit-form>
        ${profileFormFields(user, 'edit')}
        <button class="pill primary" type="submit">保存</button>
      </form>
    </section>
  `;
}

function infoRow(ic, label, value) {
  return `<div class="info-row">${icon(ic, 25)}<span>${label}</span><strong>${value}</strong></div>`;
}

function snsLinks(user) {
  const links = snsFields()
    .map(({ key, icon: label }) => [key, label, user.sns[key]])
    .filter(([, , url]) => url);
  if (!links.length) return '<small>未連携</small>';
  return links.map(([name, label, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="${name}">${label}</a>`).join('');
}

function buttonIcon(ic, action, cls = '') {
  return `<button class="${cls}" data-action="${action}">${icon(ic, 30)}</button>`;
}

function bottomNav() {
  const items = [['map', 'mapPin', 'マップ'], ['connections', 'users', 'つながり'], ['intro', 'heart', '紹介'], ['profile', 'user', 'プロフィール']];
  return `<nav class="bottom-nav">${items.map(([screen, ic, label]) => `<button class="${isActiveNav(screen, label) ? 'active' : ''}" data-nav="${screen}">${icon(ic, 31)}<span>${label}</span></button>`).join('')}</nav>`;
}

function isActiveNav(screen, label) {
  if (state.screen === 'intro') return label === '紹介';
  return state.screen === screen;
}

function overlay() {
  if (!state.overlay) return '';
  const type = state.overlay.type;
  const user = currentUser();
  if (type === 'person') return modal(personModalContent(state.overlay));
  if (type === 'connect-profile') return modal(connectProfileContent(state.overlay.target), 'connect-modal');
  if (type === 'search') return modal(idSearchContent('検索'), 'connect-modal');
  if (type === 'filter') return modal(`<h2>絞り込み</h2><div class="modal-grid">${mapFilters().map((f) => `<button class="${state.filter === f ? 'selected' : ''} ${f === '恋人' ? 'heart-filter-button' : ''}" data-filter="${f}" aria-label="${f}">${f === '恋人' ? icon('heart', 18) : f}</button>`).join('')}</div><button data-close>閉じる</button>`);
  if (type === 'display') return modal(`<h2>表示設定</h2><label><input type="checkbox" checked> つながりの強さを表示</label><label><input type="checkbox" checked> 共通点を表示</label><label><input type="checkbox"> 名前だけ表示</label><button data-close>完了</button>`);
  if (type === 'settings') return modal(`<h2>設定</h2><p>登録データはこの端末内に保存されています。</p><button data-action="restart-registration">最初から登録し直す</button><button data-close>閉じる</button>`);
  if (type === 'notifications') return modal(notificationsContent(), 'connect-modal');
  if (type === 'account-security') return modal(`<h2>アカウントとセキュリティ</h2><p>ログイン中のメールアドレス：${escapeHtml(authState.user?.email || currentUser().email || '未ログイン')}</p><p>パスワードを変更したい場合は、ログイン画面の「パスワードを忘れた方」から再設定できます。</p><button data-action="logout">ログアウト</button><button data-close>閉じる</button>`);
  if (type === 'manage-connections') return modal(`<h2>つながりの管理</h2><p>現在のつながり数は ${connectionRowsData().length} 人です。承認済みの申請がここに反映されます。</p><button data-action="add">つながりを追加</button><button data-close>閉じる</button>`);
  if (type === 'profile-visibility') return modal(`<h2>プロフィールの公開範囲</h2><p>所在地と誕生日はプロフィール編集から公開・非公開を選べます。SNSリンクは入力したものだけプロフィールに表示されます。</p><button data-action="edit">プロフィールを編集</button><button data-close>閉じる</button>`);
  if (type === 'privacy-settings') return modal(`<h2>プライバシー設定</h2><p>プロフィール情報はログイン中のアカウントに紐づいて保存されます。公開範囲はプロフィール編集から変更できます。</p><button data-action="edit">公開設定を変更</button><button data-close>閉じる</button>`);
  if (type === 'version-info') return modal(`<h2>バージョン情報</h2><p>Bondy Web App<br>Ver. 1.3.0</p><p>プロフィールのクラウド保存、Googleログイン、マップ操作改善に対応しています。</p><button data-close>閉じる</button>`);
  if (type === 'help-support') return modal(helpSupportContent(), 'document-modal');
  if (type === 'terms') return modal(termsContent(), 'document-modal');
  if (type === 'privacy-policy') return modal(privacyPolicyContent(), 'document-modal');
  return modal(addConnectionContent(), 'connect-modal');
}

function addConnectionContent() {
  return `
    <h2>つながりを追加</h2>
    <p>QRコードを読み取るか、相手のIDを検索して申請を送れます。</p>
    <button data-action="scan-qr">${icon('qr', 20)}QRコードを読み取る</button>
    ${idSearchContent('IDで検索', false)}
    <button data-nav="profile">自分のQRコードを表示</button>
    <button data-close>閉じる</button>
  `;
}

function notificationsContent() {
  return `
    <h2>通知</h2>
    ${state.notifications.length
      ? `<div class="notification-list">${state.notifications.map((item) => `
        <article>
          <strong>${escapeHtml(item.body)}</strong>
          <time>${escapeHtml(item.time)}</time>
        </article>
      `).join('')}</div>`
      : '<p>通知はまだありません。</p>'}
    <button data-close>閉じる</button>
  `;
}

function idSearchContent(title = 'IDで検索', wrap = true) {
  const form = `
    <form class="id-search-form" data-id-search-form>
      <h3>${title}</h3>
      <label>@ID またはプロフィールURL<input name="query" class="modal-input" placeholder="@your.id"></label>
      <button type="submit">${icon('search', 18)}検索する</button>
    </form>
  `;
  return wrap ? `${form}<button data-close>閉じる</button>` : form;
}

function connectProfileContent(target) {
  if (!target) return `<h2>ユーザーが見つかりません</h2><p>IDを確認してもう一度検索してください。</p><button data-action="add">検索に戻る</button>`;
  const profile = target.profile;
  const title = profile.name || target.handle || 'ユーザー';
  const subtitle = [profile.school, profile.company].filter(Boolean).join(' / ') || `@${target.handle || 'unknown'}`;
  return `
    <div class="connect-preview">
      <div class="avatar initial-avatar" style="--size:72px"><b>${escapeHtml((title || 'U').slice(0, 2).toUpperCase())}</b></div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(subtitle)}</p>
      <small>@${escapeHtml(target.handle || profile.handle || '')}</small>
    </div>
    <fieldset class="relationship-picker">
      <legend>何の関係でつながりますか？</legend>
      ${relationshipTypes().map((type, index) => `<label><input type="radio" name="relationshipType" value="${escapeHtml(type)}" ${index === 0 ? 'checked' : ''}>${type === '恋人' ? icon('heart', 15) : escapeHtml(type)}</label>`).join('')}
    </fieldset>
    <button data-action="send-request" data-target-id="${escapeHtml(target.id)}">申請を送る</button>
    <button data-action="add">別の人を探す</button>
  `;
}

function helpSupportContent() {
  return `
    <header><h2>ヘルプ・サポート</h2><button data-close>閉じる</button></header>
    <div class="document-body">
      <section><h3>お問い合わせ</h3><p>不具合、ログイン、プロフィール、データ保存に関する相談はメールで受け付けています。</p><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></section>
      <section><h3>返信について</h3><p>内容を確認のうえ、順次返信します。お問い合わせ時は、利用している端末、ブラウザ、発生した画面を一緒に送ると確認しやすくなります。</p></section>
      <section><h3>よくある確認</h3><p>Googleログインがうまく開けない場合は、SafariまたはChromeで開き直してください。プロフィールが復元されない場合は、同じアカウントでログインしているか確認してください。</p></section>
    </div>
  `;
}

function termsContent() {
  return `
    <header><h2>利用規約</h2><button data-close>閉じる</button></header>
    <div class="document-body">
      <p class="document-date">最終更新日：2026年6月21日</p>
      <section><h3>1. 適用</h3><p>本規約は、Bondyの利用条件を定めるものです。ユーザーは本アプリを利用することで、本規約に同意したものとみなされます。</p></section>
      <section><h3>2. アカウント</h3><p>ユーザーは正確な情報を登録し、自分の責任でアカウントを管理するものとします。不正利用が疑われる場合は、速やかにサポートへ連絡してください。</p></section>
      <section><h3>3. 禁止事項</h3><p>虚偽情報の登録、第三者へのなりすまし、迷惑行為、法令または公序良俗に反する行為、本アプリの運営を妨げる行為を禁止します。</p></section>
      <section><h3>4. サービスの変更</h3><p>本アプリは、機能の追加、変更、停止を行う場合があります。重要な変更がある場合は、可能な範囲でアプリ内またはその他の方法で通知します。</p></section>
      <section><h3>5. 免責</h3><p>本アプリは、つながりや紹介に関する情報の完全性、正確性、有用性を保証するものではありません。ユーザー間のやり取りは各自の責任で行ってください。</p></section>
      <section><h3>6. お問い合わせ</h3><p>本規約に関する問い合わせ先：<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p></section>
    </div>
  `;
}

function privacyPolicyContent() {
  return `
    <header><h2>プライバシーポリシー</h2><button data-close>閉じる</button></header>
    <div class="document-body">
      <p class="document-date">最終更新日：2026年6月21日</p>
      <section><h3>1. 取得する情報</h3><p>メールアドレス、プロフィール情報、大学、所在地、誕生日、SNSリンク、プロフィール写真、ログインに必要な認証情報を取得する場合があります。</p></section>
      <section><h3>2. 利用目的</h3><p>アカウント管理、プロフィール表示、つながりや紹介機能の提供、問い合わせ対応、品質改善、不正利用防止のために利用します。</p></section>
      <section><h3>3. 保存と復元</h3><p>ログインしたアカウントで同じ情報を復元できるよう、プロフィール情報をSupabaseに保存します。端末内にも表示高速化のため一部情報を保存することがあります。</p></section>
      <section><h3>4. 第三者提供</h3><p>法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。ログインやデータ保存にはSupabaseおよびGoogle等の外部サービスを利用する場合があります。</p></section>
      <section><h3>5. 公開範囲</h3><p>プロフィールの所在地や誕生日など、一部項目は公開・非公開を選択できます。公開設定はユーザー自身で管理してください。</p></section>
      <section><h3>6. お問い合わせ</h3><p>個人情報の確認、修正、削除などの相談先：<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p></section>
    </div>
  `;
}

function modal(content, cls = '') {
  return `<div class="scrim" data-close></div><section class="modal-sheet ${cls}">${content}</section>`;
}

function go(screen, message = '') {
  state.screen = screen;
  state.overlay = null;
  if (message) showToast(message);
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showToast(message) {
  state.toast = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    state.toast = '';
    render();
  }, 1700);
}

function openOverlay(type) {
  state.overlay = { type };
  render();
}

app.addEventListener('click', async (event) => {
  const universityButton = event.target.closest('[data-university-open]');
  const locationButton = event.target.closest('[data-location-open]');
  const action = event.target.closest('[data-action]')?.dataset.action;
  const nav = event.target.closest('[data-nav]')?.dataset.nav;
  const tab = event.target.closest('[data-tab]')?.dataset.tab;
  const connectionFilter = event.target.closest('[data-connection-filter]')?.dataset.connectionFilter;
  const mode = event.target.closest('[data-mode]')?.dataset.mode;
  const filter = event.target.closest('[data-filter]')?.dataset.filter;
  const request = event.target.closest('[data-request]');
  const mapNodeButton = event.target.closest('[data-map-node]');
  const personElement = event.target.closest('[data-person], [data-person-id]');
  const person = personElement?.dataset.person;
  const personId = personElement?.dataset.personId;
  const toastButton = event.target.closest('[data-toast]')?.dataset.toast;

  if (universityButton) {
    openOptionPicker(universityButton, {
      fieldSelector: '.university-field',
      title: '大学を選択',
      searchPlaceholder: '大学名で検索',
      freeInputLabel: '入力した名前を使う',
      options: universityOptions
    });
    return;
  }
  if (locationButton) {
    openOptionPicker(locationButton, {
      fieldSelector: '.location-field',
      title: '地域を選択',
      searchPlaceholder: '地域名で検索',
      freeInputLabel: '入力した地域を使う',
      options: locationOptions
    });
    return;
  }
  if (event.target.closest('[data-close]')) {
    state.overlay = null;
    render();
    return;
  }
  if (nav) {
    go(nav);
    if (nav === 'intro') await loadIncomingRequests({ silent: true });
    if (nav === 'connections' || nav === 'map' || nav === 'profile') await loadAcceptedConnections({ silent: true });
    if (nav === 'connections' || nav === 'map' || nav === 'profile') await loadRemovalNotifications({ silent: true });
    return;
  }
  if (tab) {
    state.introTab = tab;
    render();
    if (tab === '申請') await loadIncomingRequests({ silent: true });
    return;
  }
  if (connectionFilter) {
    state.connectionFilter = connectionFilter;
    render();
    return;
  }
  if (mode) {
    state.mapMode = mode;
    showToast(`${mode}表示に切り替えました`);
    render();
    return;
  }
  if (filter) {
    state.filter = filter;
    state.overlay = null;
    showToast(`${filter}で絞り込みました`);
    render();
    return;
  }
  if (request) {
    const requestId = request.dataset.request;
    const result = request.dataset.result;
    const updated = await updateConnectionRequestStatus(requestId, result);
    if (!updated) return;
    state.handledRequests[requestId] = result;
    state.requests = state.requests.filter((item) => item.id !== requestId);
    if (result === '承認') await loadAcceptedConnections({ silent: true });
    showToast(`${result}しました`);
    render();
    return;
  }
  if (mapNodeButton) {
    if (mapInteraction.dragged) {
      mapInteraction.dragged = false;
      return;
    }
    const name = mapNodeButton.dataset.mapNode;
    if (mapNodeButton.dataset.centerable === 'true') {
      state.mapCenter = name;
      state.filter = 'すべて';
      state.mapPan = { x: 0, y: 0 };
      state.zoom = 1;
      showToast(`${name}を中心にしました`);
      render();
      return;
    }
    const node = personByIdOrName(name);
    state.overlay = {
      type: 'person',
      name: node?.name || name,
      avatar: node?.avatar,
      photo: node?.photo || '',
      desc: node?.tag ? `${node.tag}のつながりです。` : '',
      tag: node?.tag,
      requestId: node?.requestId
    };
    render();
    return;
  }
  if (person || personId) {
    const requestPerson = personByIdOrName(personId || person);
    state.overlay = {
      type: 'person',
      name: requestPerson?.name || person,
      photo: requestPerson?.photo || '',
      desc: requestPerson?.desc || '登録したプロフィール情報を確認できます。',
      tag: requestPerson?.tag,
      requestId: requestPerson?.requestId
    };
    render();
    return;
  }
  if (toastButton) {
    state.overlay = null;
    showToast(toastButton);
    render();
    return;
  }
  if (!action) return;
  if (action === 'auth-mode') {
    state.authMode = event.target.closest('[data-auth-mode]')?.dataset.authMode || 'signin';
    render();
    return;
  }
  if (action === 'google-login') return signInWithProvider('google');
  if (action === 'notifications') {
    await loadRemovalNotifications({ silent: true });
    return openOverlay(action);
  }
  if (action === 'back-login') {
    state.authMode = 'signin';
    return go('login');
  }
  if (action === 'settings') return go('settings');
  if (action === 'edit') return go('editProfile');
  if (action === 'restart-registration') {
    const key = accountProfileKey();
    localStorage.removeItem(STORAGE_KEY);
    if (key) localStorage.removeItem(key);
    state.user = null;
    state.connections = [];
    state.requests = [];
    state.overlay = null;
    return go('register', '最初から登録できます');
  }
  if (['search', 'filter', 'add', 'display', 'help-support', 'terms', 'privacy-policy', 'account-security', 'manage-connections', 'profile-visibility', 'privacy-settings', 'version-info'].includes(action)) return openOverlay(action);
  if (action === 'scan-qr') return startQrScanner();
  if (action === 'send-request') {
    const targetId = event.target.closest('[data-target-id]')?.dataset.targetId;
    const relationship = event.target.closest('.modal-sheet')?.querySelector('input[name="relationshipType"]:checked')?.value || '紹介';
    const sent = await sendConnectionRequest(targetId, relationship);
    if (sent) {
      state.overlay = null;
      render();
    }
    return;
  }
  if (action === 'update-relationship') {
    const requestId = event.target.closest('[data-request-id]')?.dataset.requestId;
    const relationship = event.target.closest('.modal-sheet')?.querySelector('input[name="manageRelationshipType"]:checked')?.value || '';
    const updated = await updateConnectionRelationship(requestId, relationship);
    if (updated) {
      state.overlay = null;
      showToast('関係を変更しました');
      render();
    }
    return;
  }
  if (action === 'remove-connection') {
    const button = event.target.closest('[data-request-id]');
    const requestId = button?.dataset.requestId;
    const relationship = button?.dataset.relationship || '';
    const removed = await removeConnection(requestId, relationship);
    if (removed) {
      state.overlay = null;
      showToast('つながりを削除しました');
      render();
    }
    return;
  }
  if (action === 'logout') {
    state.overlay = null;
    await authState.client?.auth.signOut();
    state.authMode = 'signin';
    return go('login', 'ログアウトしました');
  }
  if (['suggested-users', 'blocked-users'].includes(action)) {
    return showToast('この設定は準備中です');
  }
  if (action === 'locate') {
    state.mapCenter = 'you';
    state.mapPan = { x: 0, y: 0 };
    state.zoom = 1;
    render();
    return showToast('あなたを中心に戻しました');
  }
  if (action === 'zoom-in' || action === 'zoom-out') {
    state.zoom = clampZoom(state.zoom + (action === 'zoom-in' ? 0.12 : -0.12));
    state.mapPan = constrainMapPan(state.mapPan);
    showToast(`ズーム ${Math.round(state.zoom * 100)}%`);
    render();
    return;
  }
  if (action === 'share') {
    navigator.share?.({ title: 'Bondy プロフィール', url: 'https://bondy.app/yuta.mesh' }).catch(() => {});
    return showToast('共有メニューを開きました');
  }
  if (action === 'copy-link') {
    navigator.clipboard?.writeText(profileLink()).catch(() => {});
    return showToast('プロフィールリンクをコピーしました');
  }
  if (action === 'save-qr') {
    state.saved = true;
    showToast('QRコードを保存しました');
    render();
    return;
  }
  if (action === 'camera') return showToast('写真変更を開きました');
});

function openOptionPicker(trigger, config) {
  document.querySelector('.university-picker-root')?.remove();
  const field = trigger.closest(config.fieldSelector);
  const hiddenInput = field.querySelector('input[type="hidden"]');
  const currentValue = hiddenInput.value;
  const root = document.createElement('div');
  root.className = 'university-picker-root';
  root.innerHTML = `
    <div class="university-picker-scrim" data-university-close></div>
    <section class="university-picker">
      <header>
        <h2>${escapeHtml(config.title)}</h2>
        <button type="button" data-university-close>閉じる</button>
      </header>
      <input class="university-search" type="search" placeholder="${escapeHtml(config.searchPlaceholder)}" value="${escapeHtml(currentValue)}" autocomplete="off">
      <div class="university-list"></div>
      <button type="button" class="university-free-input">${escapeHtml(config.freeInputLabel)}</button>
    </section>
  `;
  document.body.appendChild(root);

  const search = root.querySelector('.university-search');
  const list = root.querySelector('.university-list');
  const freeInputButton = root.querySelector('.university-free-input');

  const updateList = () => {
    const query = search.value.trim().toLowerCase();
    const normalizedQuery = search.value.trim();
    const matches = config.options
      .filter((name) => !query || name.toLowerCase().includes(query) || name.includes(normalizedQuery))
      .slice(0, 80);
    list.innerHTML = matches.map((name) => `<button type="button" data-university-value="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('')
      || '<p>候補がありません。入力した名前を使えます。</p>';
  };

  const choose = (value) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    hiddenInput.value = cleanValue;
    trigger.querySelector('span').textContent = cleanValue;
    root.remove();
  };

  search.addEventListener('input', updateList);
  list.addEventListener('click', (event) => {
    const option = event.target.closest('[data-university-value]');
    if (option) choose(option.dataset.universityValue);
  });
  freeInputButton.addEventListener('click', () => choose(search.value));
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-university-close]')) root.remove();
  });

  updateList();
  setTimeout(() => search.focus(), 50);
}

app.addEventListener('submit', async (event) => {
  const authForm = event.target.closest('[data-auth-form]');
  const registerForm = event.target.closest('[data-register-form]');
  const editForm = event.target.closest('[data-edit-form]');
  const idSearchForm = event.target.closest('[data-id-search-form]');
  if (!authForm && !registerForm && !editForm && !idSearchForm) return;
  event.preventDefault();

  if (idSearchForm) {
    const formData = new FormData(idSearchForm);
    await showConnectTarget(String(formData.get('query') || ''));
    return;
  }

  if (authForm) {
    const formData = new FormData(authForm);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const passwordConfirm = String(formData.get('passwordConfirm') || '');
    const intent = event.submitter?.value || 'signin';
    if (intent === 'reset') {
      await sendPasswordReset(email);
      return;
    }
    if (!email && intent !== 'update-password') {
      showToast('メールアドレスを入力してください');
      return;
    }
    if (!password) {
      showToast('パスワードを入力してください');
      return;
    }
    if (password.length < 8) {
      showToast('パスワードは8文字以上にしてください');
      return;
    }
    if ((intent === 'signup' || intent === 'update-password') && password !== passwordConfirm) {
      showToast('確認用パスワードが一致しません');
      return;
    }
    if (intent === 'signin') {
      await signInWithEmail(email, password);
      return;
    }
    if (intent === 'update-password') {
      await updatePassword(password);
      return;
    }
    await signUpWithEmail(email, password);
    return;
  }

  if (registerForm) {
    const formData = new FormData(registerForm);
    const photo = formData.get('photo');
    const user = {
      name: String(formData.get('name') || '').trim(),
      handle: String(formData.get('handle') || '').trim().replace(/^@/, ''),
      school: String(formData.get('school') || '').trim(),
      company: String(formData.get('company') || '').trim(),
      location: String(formData.get('location') || '').trim(),
      birthday: String(formData.get('birthday') || '').trim(),
      email: authState.user?.email || '',
      photo: photo && photo.size ? await readFileAsDataUrl(photo) : '',
      locationPublic: formData.get('locationPublic') === 'true',
      birthdayPublic: formData.get('birthdayPublic') === 'true',
      sns: snsFromForm(formData)
    };
    if (!user.name || !user.handle || !user.school || !user.birthday) {
      showToast('名前・ID・大学・誕生日を入力してください');
      return;
    }
    await saveUser(user);
    localStorage.removeItem(SIGNUP_PENDING_KEY);
    go('profile', '登録しました');
    return;
  }

  if (editForm) {
    const formData = new FormData(editForm);
    const photo = formData.get('photo');
    const current = currentUser();
    await saveUser({
      ...current,
      name: String(formData.get('name') || '').trim(),
      handle: String(formData.get('handle') || '').trim().replace(/^@/, ''),
      school: String(formData.get('school') || '').trim(),
      company: String(formData.get('company') || '').trim(),
      location: String(formData.get('location') || '').trim(),
      birthday: String(formData.get('birthday') || '').trim(),
      photo: photo && photo.size ? await readFileAsDataUrl(photo) : current.photo,
      locationPublic: formData.get('locationPublic') === 'true',
      birthdayPublic: formData.get('birthdayPublic') === 'true',
      sns: snsFromForm(formData)
    });
    state.overlay = null;
    go('profile', 'プロフィールを保存しました');
  }
});

app.addEventListener('change', async (event) => {
  const photoInput = event.target.closest('[data-photo-input]');
  if (!photoInput) return;
  const file = photoInput.files?.[0];
  if (!file) return;
  await saveUser({
    ...currentUser(),
    photo: await readFileAsDataUrl(file)
  });
  showToast('プロフィール写真を変更しました');
  render();
});

app.addEventListener('pointerdown', (event) => {
  const workspace = event.target.closest('[data-map-workspace]');
  if (!workspace || state.screen !== 'map') return;
  event.preventDefault();
  const nodeButton = event.target.closest('[data-map-node]');
  mapInteraction.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (mapInteraction.pointers.size === 2) {
    const center = pointerCenter();
    mapInteraction.mode = 'pinch';
    mapInteraction.active = false;
    mapInteraction.node = null;
    mapInteraction.pinchStartDistance = pointerDistance();
    mapInteraction.pinchStartZoom = state.zoom;
    mapInteraction.pinchStartPanX = state.mapPan.x;
    mapInteraction.pinchStartPanY = state.mapPan.y;
    mapInteraction.pinchStartCenterX = center.x;
    mapInteraction.pinchStartCenterY = center.y;
    return;
  }

  mapInteraction.active = true;
  mapInteraction.mode = nodeButton ? 'node' : 'pan';
  mapInteraction.node = nodeButton ? mapVisibleNodes().find((node) => (node.id || node.name) === nodeButton.dataset.mapNode) : null;
  mapInteraction.pointerId = event.pointerId;
  mapInteraction.startX = event.clientX;
  mapInteraction.startY = event.clientY;
  mapInteraction.startPanX = state.mapPan.x;
  mapInteraction.startPanY = state.mapPan.y;
  mapInteraction.dragged = false;
  workspace.setPointerCapture?.(event.pointerId);
});

app.addEventListener('pointermove', (event) => {
  if (mapInteraction.pointers.has(event.pointerId)) {
    mapInteraction.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }
  const workspace = document.querySelector('[data-map-workspace]');
  if (!workspace || state.screen !== 'map') return;
  if (mapInteraction.pointers.has(event.pointerId) || mapInteraction.active) {
    event.preventDefault();
  }

  if (mapInteraction.mode === 'pinch' && mapInteraction.pointers.size >= 2) {
    const rect = workspace.getBoundingClientRect();
    const distance = pointerDistance();
    if (mapInteraction.pinchStartDistance) {
      const nextZoom = clampZoom(mapInteraction.pinchStartZoom * (distance / mapInteraction.pinchStartDistance));
      const center = pointerCenter();
      const originX = mapInteraction.pinchStartCenterX - rect.left;
      const originY = mapInteraction.pinchStartCenterY - rect.top;
      const startScale = mapInteraction.pinchStartZoom;
      const worldX = (originX - mapInteraction.pinchStartPanX) / startScale;
      const worldY = (originY - mapInteraction.pinchStartPanY) / startScale;
      state.zoom = nextZoom;
      state.mapPan = constrainMapPan({
        x: center.x - rect.left - worldX * nextZoom,
        y: center.y - rect.top - worldY * nextZoom
      }, rect);
      scheduleMapCanvasUpdate();
      mapInteraction.dragged = true;
    }
    return;
  }

  if (!mapInteraction.active || event.pointerId !== mapInteraction.pointerId) return;
  const dx = event.clientX - mapInteraction.startX;
  const dy = event.clientY - mapInteraction.startY;
  if (Math.hypot(dx, dy) > 4) mapInteraction.dragged = true;

  if (mapInteraction.mode === 'node' && mapInteraction.node) {
    const point = clientToMapPoint(event.clientX, event.clientY, workspace);
    mapInteraction.node.x = point.x;
    mapInteraction.node.y = point.y;
    updateDraggedNode(mapInteraction.node);
    return;
  }

  if (mapInteraction.mode === 'pan') {
    state.mapPan = constrainMapPan({
      x: mapInteraction.startPanX + dx,
      y: mapInteraction.startPanY + dy
    }, workspace.getBoundingClientRect());
    scheduleMapCanvasUpdate();
  }
}, { passive: false });

app.addEventListener('pointerup', finishMapPointer);
app.addEventListener('pointercancel', finishMapPointer);

app.addEventListener('wheel', (event) => {
  const workspace = event.target.closest('[data-map-workspace]');
  if (!workspace || state.screen !== 'map') return;
  event.preventDefault();
  const rect = workspace.getBoundingClientRect();
  const nextZoom = clampZoom(state.zoom + (event.deltaY < 0 ? 0.08 : -0.08));
  const localX = event.clientX - rect.left;
  const localY = event.clientY - rect.top;
  const worldX = (localX - state.mapPan.x) / state.zoom;
  const worldY = (localY - state.mapPan.y) / state.zoom;
  state.zoom = nextZoom;
  state.mapPan = constrainMapPan({
    x: localX - worldX * nextZoom,
    y: localY - worldY * nextZoom
  }, rect);
  scheduleMapCanvasUpdate();
}, { passive: false });

function finishMapPointer(event) {
  mapInteraction.pointers.delete(event.pointerId);
  if (mapInteraction.pointers.size < 2 && mapInteraction.mode === 'pinch') {
    mapInteraction.mode = '';
  }
  if (event.pointerId !== mapInteraction.pointerId) return;
  if (mapInteraction.mode === 'node' && mapInteraction.node && mapInteraction.dragged) {
    saveMapNodePosition(mapInteraction.node);
  }
  mapInteraction.active = false;
  mapInteraction.node = null;
  mapInteraction.pointerId = null;
}

function pointerDistance() {
  const points = [...mapInteraction.pointers.values()];
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function pointerCenter() {
  const points = [...mapInteraction.pointers.values()];
  if (!points.length) return { x: 0, y: 0 };
  const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  return { x: total.x / points.length, y: total.y / points.length };
}

function clampZoom(value) {
  return Math.max(0.72, Math.min(2.8, Number(value.toFixed(3))));
}

function constrainMapPan(pan, rect = document.querySelector('[data-map-workspace]')?.getBoundingClientRect()) {
  if (!rect) return pan;
  const overflowX = Math.max(0, rect.width * state.zoom - rect.width);
  const overflowY = Math.max(0, rect.height * state.zoom - rect.height);
  const slackX = Math.max(54, rect.width * 0.16);
  const slackY = Math.max(54, rect.height * 0.14);
  return {
    x: Math.max(-overflowX - slackX, Math.min(slackX, pan.x)),
    y: Math.max(-overflowY - slackY, Math.min(slackY, pan.y))
  };
}

function clientToMapPoint(clientX, clientY, workspace) {
  const rect = workspace.getBoundingClientRect();
  const x = ((clientX - rect.left - state.mapPan.x) / (rect.width * state.zoom)) * 100;
  const y = ((clientY - rect.top - state.mapPan.y) / (rect.height * state.zoom)) * 100;
  return {
    x: Math.max(4, Math.min(96, Number(x.toFixed(1)))),
    y: Math.max(5, Math.min(95, Number(y.toFixed(1))))
  };
}

function updateMapCanvas() {
  const canvas = document.querySelector('[data-map-canvas]');
  if (canvas) canvas.style.transform = `translate3d(${state.mapPan.x}px, ${state.mapPan.y}px, 0) scale(${state.zoom})`;
}

function scheduleMapCanvasUpdate() {
  if (mapInteraction.raf) cancelAnimationFrame(mapInteraction.raf);
  mapInteraction.raf = requestAnimationFrame(() => {
    mapInteraction.raf = null;
    updateMapCanvas();
  });
}

function updateDraggedNode(node) {
  const nodeKey = node.id || node.name;
  const button = document.querySelector(`[data-map-node="${cssEscape(nodeKey)}"]`);
  if (button) {
    button.style.left = `${node.x}%`;
    button.style.top = `${node.y}%`;
  }
  const line = document.querySelector(`.lines line[data-line-node="${cssEscape(nodeKey)}"]`);
  if (line) {
    line.setAttribute('x2', node.x);
    line.setAttribute('y2', node.y);
  }
}

function cssEscape(value) {
  return window.CSS?.escape ? CSS.escape(value) : String(value).replace(/"/g, '\\"');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

render();
initAuth();
