import { AUTH_CONFIG } from './auth-config.js';

const app = document.querySelector('#root');
const STORAGE_KEY = 'bondy.profile.v1';
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
  saved: false,
  user: savedUser,
  connections: [],
  requests: []
};

const people = [];
const network = [];
const connectionRows = [];
const mapNodes = [];
const friendOfFriendNodes = [];
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
  pinchStartZoom: 1
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
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return user ? normalizeUser(user) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  state.user = normalizeUser(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
}

async function initAuth() {
  if (!authState.configured) {
    authState.ready = true;
    return;
  }
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    authState.client = createClient(AUTH_CONFIG.supabaseUrl, AUTH_CONFIG.supabaseAnonKey);
    const { data } = await authState.client.auth.getSession();
    authState.user = data.session?.user || null;
    authState.client.auth.onAuthStateChange((event, session) => {
      authState.user = session?.user || null;
      if (event === 'PASSWORD_RECOVERY') {
        state.screen = 'login';
        state.authMode = 'updatePassword';
        render();
        return;
      }
      if (event === 'SIGNED_IN' && !state.user) {
        go('register', 'メール認証が完了しました');
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
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await authState.client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo }
  });
  if (error) {
    showToast(error.message);
    return;
  }
  showToast('認証メールを送信しました');
}

async function sendPasswordReset(email) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を入れると再設定メールを送れます');
    return;
  }
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
  go(state.user ? 'map' : 'login', 'パスワードを更新しました');
}

async function signInWithEmail(email, password) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を入れるとログインできます');
    return;
  }
  const { error } = await authState.client.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message);
    return;
  }
  go(state.user ? 'map' : 'register', 'ログインしました');
}

function currentUser() {
  return normalizeUser(state.user || {});
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
  const initials = (user.name || 'あなた').trim().slice(0, 2);
  return `<div class="avatar initial-avatar" style="--size:${size}px"><b>${escapeHtml(initials)}</b></div>`;
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
        ${needsEmail ? '<label>メールアドレス<input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label>' : ''}
        ${needsPassword ? `<label>パスワード<input name="password" type="password" autocomplete="${authCopy.autocomplete}" required minlength="8" placeholder="8文字以上"></label>` : ''}
        ${mode === 'signup' || mode === 'updatePassword' ? '<label>パスワード確認<input name="passwordConfirm" type="password" autocomplete="new-password" required minlength="8" placeholder="もう一度入力"></label>' : ''}
        <button class="pill primary" name="intent" value="${authCopy.intent}" type="submit">${mode === 'signin' ? '' : icon('mail', 25)}${authCopy.submit}</button>
        ${mode === 'signin' ? '<button class="auth-text-button" type="button" data-action="auth-mode" data-auth-mode="forgot">パスワードを忘れた方</button>' : ''}
        ${mode === 'signin' ? '<button class="pill secondary" type="button" data-action="auth-mode" data-auth-mode="signup">新規登録</button>' : '<button class="pill secondary" type="button" data-action="auth-mode" data-auth-mode="signin">ログインに戻る</button>'}
        ${authState.configured ? '' : '<p class="auth-note">メール認証を使うには Supabase の設定が必要です。</p>'}
      </form>
      ${mode === 'signin' ? `<section class="login-actions compact">
        <div class="divider"><span></span><em>または</em><span></span></div>
        ${socialButton('apple', '●', 'Appleで続ける')}
        ${socialButton('google', 'G', 'Googleで続ける')}
        ${socialButton('line', 'LINE', 'LINEで続ける')}
        ${socialButton('twitter', '♞', 'Twitterで続ける')}
      </section>` : ''}
      <p class="terms">ログインすることで、利用規約とプライバシーポリシーに<br>同意したものとみなされます</p>
      <div class="home-indicator"></div>
    </main>
  `;
}

function socialButton(kind, mark, label) {
  return `<button class="social ${kind}" data-action="start-register"><b>${mark}</b><span>${label}</span></button>`;
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
      <div>${icon('users')}<span>つながり数</span><b>${connectionRows.length} 人</b><small>登録後に追加</small></div>
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

function networkGraph(nodes) {
  const center = mapCenterProfile();
  return `
    <section class="network" data-map-workspace>
      <div class="map-canvas" data-map-canvas style="${mapCanvasStyle()}">
        <svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          ${nodes.map((node) => `<line x1="50" y1="50" x2="${node.x}" y2="${node.y}" stroke="${node.color}" />`).join('')}
        </svg>
        <div class="center-node">${mapCenterAvatar(center)}<h3>${escapeHtml(center.name)}</h3><span>${escapeHtml(center.badge)}</span></div>
        ${nodes.map((node) => `<button class="map-node ${node.centerable ? 'centerable' : 'profile-only'}" type="button" style="left:${node.x}%;top:${node.y}%" data-map-node="${node.name}" data-centerable="${node.centerable ? 'true' : 'false'}" data-person="${node.name}">${avatar(node.avatar, 54)}<b>${node.name}</b><em>${node.centerable ? '中心にする' : node.tag}</em></button>`).join('')}
        ${nodes.length ? '<div class="more-node left">+2<span>他2人</span></div><div class="more-node right">+3<span>他3人</span></div><div class="more-node bottom">+4<span>他4人</span></div>' : '<div class="empty-map">まだつながりはありません<br>右上の＋から追加できます</div>'}
      </div>
    </section>
  `;
}

function mapCanvasStyle() {
  return `transform: translate(${state.mapPan.x}px, ${state.mapPan.y}px) scale(${state.zoom})`;
}

function mapVisibleNodes() {
  if (state.mapCenter === 'you') {
    return mapNodes.map((node) => {
      node.centerable = true;
      return node;
    });
  }
  return friendOfFriendNodes.map((node) => {
    node.centerable = false;
    return node;
  });
}

function mapCenterProfile() {
  const user = currentUser();
  if (state.mapCenter === 'you') {
    return {
      name: user.name || 'ゆうた',
      badge: 'あなた',
      avatar: user.photo ? 'user' : 'profile'
    };
  }
  const selected = mapNodes.find((node) => node.name === state.mapCenter) || mapNodes[0];
  return {
    name: selected.name,
    badge: selected.tag,
    avatar: selected.avatar
  };
}

function mapCenterAvatar(center = mapCenterProfile()) {
  const user = currentUser();
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
  const rows = state.connectionFilter === 'すべて'
    ? connectionRows
    : connectionRows.filter((person) => person.tag === state.connectionFilter);
  return `
    ${appHeader('', `${buttonIcon('search', 'search')}${buttonIcon('bell', 'notifications')}`)}
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
    <article class="connection-row" data-person="${person.name}">
      <div class="connection-placeholder">${icon('user', 31)}</div>
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

function introScreen() {
  return `
    ${appHeader('', `${buttonIcon('search', 'search')}${buttonIcon('bell', 'notifications', 'dot')}`)}
    <div class="screen-tabs tabs">
      ${['申請', '紹介された', '紹介した'].map((tab) => `<button class="${state.introTab === tab ? 'active' : ''}" data-tab="${tab}">${tab}${tab === '申請' ? '<b>3</b>' : ''}</button>`).join('')}
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
    return `
      <article class="request-row ${handled ? 'handled' : ''}">
        ${avatar(person.avatar, 58)}
        <button class="request-copy" data-person="${person.name}">
          <h3>${person.name}<small>${person.tag}</small></h3>
          <p>${person.desc}</p>
          <p>共通のつながり：${person.common}</p>
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
    <section class="stats-card">${[['users', 'つながり', String(state.connections.length)], ['user', '共通の知人', '0'], ['users', '所属グループ', '0'], ['copy', '保存した人', state.saved ? '1' : '0']].map(([ic, label, value]) => `<div>${icon(ic, 28)}<span>${label}</span><b>${value}</b></div>`).join('')}</section>
    <section class="share-card">
      <h2>${icon('external', 28)}プロフィールを共有</h2>
      <div class="share-content"><p>QRコードをシェアして、<br>あなたのプロフィールを<br>簡単に共有できます。</p><div><div class="qr" aria-label="${escapeHtml(profileUrl)}">${profileQr(profileUrl)}</div><button data-action="save-qr">${icon('download', 18)}QRコードを保存</button></div></div>
      <button class="copy-link" data-action="copy-link">${icon('link', 22)}プロフィールリンクをコピー</button>
    </section>
  `;
}

function profileLink(user = currentUser()) {
  return `https://bondy.app/${encodeURIComponent(user.handle || 'me')}`;
}

function profileQr(value) {
  const size = 17;
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) >>> 0;
  }
  const finder = (x, y) => {
    const inTopLeft = x < 5 && y < 5;
    const inTopRight = x >= size - 5 && y < 5;
    const inBottomLeft = x < 5 && y >= size - 5;
    if (!inTopLeft && !inTopRight && !inBottomLeft) return null;
    const localX = inTopRight ? x - (size - 5) : x;
    const localY = inBottomLeft ? y - (size - 5) : y;
    return localX === 0 || localX === 4 || localY === 0 || localY === 4 || (localX >= 2 && localX <= 2 && localY >= 2 && localY <= 2);
  };
  const cells = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const marker = finder(x, y);
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const filled = marker ?? (((seed >>> 24) + x * 7 + y * 11) % 3 !== 0);
      cells.push(`<span class="${filled ? 'on' : ''}"></span>`);
    }
  }
  return `<div class="qr-grid" style="--qr-size:${size}">${cells.join('')}</div>`;
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
  if (type === 'person') return modal(`<div class="modal-avatar">${profileAvatar(70)}</div><h2>${escapeHtml(state.overlay.name)}</h2><p>登録したプロフィール情報を確認できます。</p><button data-close>閉じる</button>`);
  if (type === 'search') return modal(`<h2>検索</h2><input class="modal-input" placeholder="名前・会社・学校で検索"><p>まだ検索できるつながりはありません。</p><button data-close>閉じる</button>`);
  if (type === 'filter') return modal(`<h2>絞り込み</h2><div class="modal-grid">${mapFilters().map((f) => `<button class="${state.filter === f ? 'selected' : ''} ${f === '恋人' ? 'heart-filter-button' : ''}" data-filter="${f}" aria-label="${f}">${f === '恋人' ? icon('heart', 18) : f}</button>`).join('')}</div><button data-close>閉じる</button>`);
  if (type === 'display') return modal(`<h2>表示設定</h2><label><input type="checkbox" checked> つながりの強さを表示</label><label><input type="checkbox" checked> 共通点を表示</label><label><input type="checkbox"> 名前だけ表示</label><button data-close>完了</button>`);
  if (type === 'settings') return modal(`<h2>設定</h2><p>登録データはこの端末内に保存されています。</p><button data-action="restart-registration">最初から登録し直す</button><button data-close>閉じる</button>`);
  if (type === 'notifications') return modal(`<h2>通知</h2><p>通知はまだありません。</p><button data-close>閉じる</button>`);
  return modal(`<h2>追加</h2><p>QRコード、連絡先、紹介リンクから新しいつながりを追加できます。</p><button data-toast="招待リンクを作成しました">招待リンクを作成</button><button data-close>閉じる</button>`);
}

function modal(content) {
  return `<div class="scrim" data-close></div><section class="modal-sheet">${content}</section>`;
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
  const person = event.target.closest('[data-person]')?.dataset.person;
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
  if (nav) return go(nav);
  if (tab) {
    state.introTab = tab;
    render();
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
    state.handledRequests[request.dataset.request] = request.dataset.result;
    showToast(`${request.dataset.result}しました`);
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
    state.overlay = { type: 'person', name };
    render();
    return;
  }
  if (person) {
    state.overlay = { type: 'person', name: person };
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
  if (action === 'start-register') {
    state.authMode = 'signup';
    return go('login');
  }
  if (action === 'back-login') {
    state.authMode = 'signin';
    return go('login');
  }
  if (action === 'settings') return go('settings');
  if (action === 'edit') return go('editProfile');
  if (action === 'restart-registration') {
    localStorage.removeItem(STORAGE_KEY);
    state.user = null;
    state.connections = [];
    state.requests = [];
    state.overlay = null;
    return go('register', '最初から登録できます');
  }
  if (action === 'login') return go('map', 'ログインしました');
  if (['search', 'filter', 'add', 'display', 'notifications'].includes(action)) return openOverlay(action);
  if (action === 'logout') {
    state.overlay = null;
    await authState.client?.auth.signOut();
    state.authMode = 'signin';
    return go('login', 'ログアウトしました');
  }
  if (['account-security', 'manage-connections', 'suggested-users', 'blocked-users', 'profile-visibility', 'privacy-settings', 'help-support', 'terms', 'privacy-policy', 'version-info'].includes(action)) {
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
  if (!authForm && !registerForm && !editForm) return;
  event.preventDefault();

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
    saveUser(user);
    go('profile', '登録しました');
    return;
  }

  if (editForm) {
    const formData = new FormData(editForm);
    const photo = formData.get('photo');
    const current = currentUser();
    saveUser({
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
  saveUser({
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
    mapInteraction.mode = 'pinch';
    mapInteraction.active = false;
    mapInteraction.node = null;
    mapInteraction.pinchStartDistance = pointerDistance();
    mapInteraction.pinchStartZoom = state.zoom;
    return;
  }

  mapInteraction.active = true;
  mapInteraction.mode = nodeButton ? 'node' : 'pan';
  mapInteraction.node = nodeButton ? mapVisibleNodes().find((node) => node.name === nodeButton.dataset.mapNode) : null;
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
    const distance = pointerDistance();
    if (mapInteraction.pinchStartDistance) {
      state.zoom = clampZoom(mapInteraction.pinchStartZoom * (distance / mapInteraction.pinchStartDistance));
      updateMapCanvas();
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
    state.mapPan = {
      x: mapInteraction.startPanX + dx,
      y: mapInteraction.startPanY + dy
    };
    updateMapCanvas();
  }
}, { passive: false });

app.addEventListener('pointerup', finishMapPointer);
app.addEventListener('pointercancel', finishMapPointer);

app.addEventListener('wheel', (event) => {
  const workspace = event.target.closest('[data-map-workspace]');
  if (!workspace || state.screen !== 'map') return;
  event.preventDefault();
  const nextZoom = clampZoom(state.zoom + (event.deltaY < 0 ? 0.08 : -0.08));
  state.zoom = nextZoom;
  updateMapCanvas();
}, { passive: false });

function finishMapPointer(event) {
  mapInteraction.pointers.delete(event.pointerId);
  if (mapInteraction.pointers.size < 2 && mapInteraction.mode === 'pinch') {
    mapInteraction.mode = '';
  }
  if (event.pointerId !== mapInteraction.pointerId) return;
  mapInteraction.active = false;
  mapInteraction.node = null;
  mapInteraction.pointerId = null;
}

function pointerDistance() {
  const points = [...mapInteraction.pointers.values()];
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function clampZoom(value) {
  return Math.max(0.65, Math.min(2.4, Number(value.toFixed(2))));
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
  if (canvas) canvas.style.transform = `translate(${state.mapPan.x}px, ${state.mapPan.y}px) scale(${state.zoom})`;
}

function updateDraggedNode(node) {
  const button = document.querySelector(`[data-map-node="${cssEscape(node.name)}"]`);
  if (button) {
    button.style.left = `${node.x}%`;
    button.style.top = `${node.y}%`;
  }
  const line = [...document.querySelectorAll('.lines line')].find((item) => item.getAttribute('stroke') === node.color);
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
