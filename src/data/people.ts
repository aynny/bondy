export type Category = 'family' | 'local' | 'school' | 'business' | 'event' | 'heart';

export type Person = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  category: Category;
  company: string;
  school: string;
  title: string;
  location: string;
  score: number;
  metCount: number;
  strength: 'weak' | 'medium' | 'strong';
  lastMet: string;
  memo: string;
  sns: string[];
  connections: string[];
  position: { x: number; y: number; z: number };
};

export const categoryMeta: Record<Category, {
  label: string;
  shortLabel: string;
  countLabel: string;
  color: string;
  tint: string;
  glow: string;
}> = {
  family: {
    label: '家族',
    shortLabel: '家族',
    countLabel: '家族',
    color: '#F06292',
    tint: '#FCE7F0',
    glow: 'rgba(240, 98, 146, 0.26)',
  },
  local: {
    label: '地元',
    shortLabel: '地元',
    countLabel: '地元',
    color: '#2DC59A',
    tint: '#E5F8F2',
    glow: 'rgba(45, 197, 154, 0.24)',
  },
  school: {
    label: '学校',
    shortLabel: '学校',
    countLabel: '学校',
    color: '#A366F5',
    tint: '#F1E9FF',
    glow: 'rgba(163, 102, 245, 0.24)',
  },
  business: {
    label: 'ビジネス',
    shortLabel: '仕事',
    countLabel: 'ビジネス',
    color: '#2DA6E8',
    tint: '#E6F5FD',
    glow: 'rgba(45, 166, 232, 0.24)',
  },
  event: {
    label: 'イベント',
    shortLabel: 'イベント',
    countLabel: 'イベント',
    color: '#F6A21A',
    tint: '#FFF3DC',
    glow: 'rgba(246, 162, 26, 0.24)',
  },
  heart: {
    label: '♡',
    shortLabel: '♡',
    countLabel: '♡',
    color: '#F05AA6',
    tint: '#FDE8F3',
    glow: 'rgba(240, 90, 166, 0.24)',
  },
};

export const currentUser: Person = {
  id: 'me',
  name: '山本 彩乃',
  handle: '@ayano_bondy',
  avatar: '/assets/avatars/profile.jpg',
  category: 'business',
  company: '株式会社Mesh',
  school: '東京大学',
  title: 'プロダクトマネージャー',
  location: '東京都渋谷区',
  score: 96,
  metCount: 43,
  strength: 'strong',
  lastMet: '今日',
  memo: 'Bondyの中心ユーザー。紹介と記録をまめに残す。',
  sns: ['Instagram', 'X', 'LinkedIn'],
  connections: ['taro', 'saki', 'miku', 'ken', 'rina', 'yuta', 'mei', 'sho'],
  position: { x: 50, y: 48, z: 3 },
};

export const people: Person[] = [
  {
    id: 'taro',
    name: '山田 太郎',
    handle: '@taro_y',
    avatar: '/assets/avatars/man1.jpg',
    category: 'business',
    company: 'LayerX',
    school: '慶應義塾大学',
    title: 'プロダクトマネージャー',
    location: '東京都港区',
    score: 92,
    metCount: 12,
    strength: 'strong',
    lastMet: '12日前',
    memo: '新規事業の相談相手。次回は採用の話をする。',
    sns: ['LinkedIn', 'X'],
    connections: ['me', 'saki', 'ken', 'yuta', 'ayaka'],
    position: { x: 28, y: 24, z: 3 },
  },
  {
    id: 'saki',
    name: '鈴木 咲',
    handle: '@saki',
    avatar: '/assets/avatars/woman1.jpg',
    category: 'school',
    company: 'Google Japan',
    school: '東京大学',
    title: 'UXリサーチャー',
    location: '東京都目黒区',
    score: 87,
    metCount: 9,
    strength: 'strong',
    lastMet: '9日前',
    memo: '大学時代からの友人。共通の知人が多い。',
    sns: ['Instagram', 'Threads'],
    connections: ['me', 'taro', 'rina', 'haru', 'nao', 'sho'],
    position: { x: 72, y: 25, z: 3 },
  },
  {
    id: 'miku',
    name: '田中 美咲',
    handle: '@miku_t',
    avatar: '/assets/avatars/woman2.jpg',
    category: 'family',
    company: 'Freelance',
    school: '名古屋大学',
    title: 'デザイナー',
    location: '愛知県名古屋市',
    score: 78,
    metCount: 7,
    strength: 'medium',
    lastMet: '7日前',
    memo: '家族ぐるみのつながり。紹介依頼がしやすい。',
    sns: ['Instagram'],
    connections: ['me', 'rina', 'haru'],
    position: { x: 23, y: 53, z: 2 },
  },
  {
    id: 'ken',
    name: '佐藤 健',
    handle: '@ken_sato',
    avatar: '/assets/avatars/man2.jpg',
    category: 'business',
    company: 'Salesforce Japan',
    school: '早稲田大学',
    title: 'ソリューションエンジニア',
    location: '東京都品川区',
    score: 72,
    metCount: 7,
    strength: 'medium',
    lastMet: '7日前',
    memo: '営業領域の情報交換。大企業の導入に詳しい。',
    sns: ['LinkedIn'],
    connections: ['me', 'taro', 'mei'],
    position: { x: 78, y: 52, z: 2 },
  },
  {
    id: 'rina',
    name: '伊藤 里奈',
    handle: '@rina_local',
    avatar: '/assets/avatars/woman1.jpg',
    category: 'local',
    company: 'Nagoya Works',
    school: '岐阜高校',
    title: 'コミュニティマネージャー',
    location: '岐阜県',
    score: 65,
    metCount: 6,
    strength: 'medium',
    lastMet: '6日前',
    memo: '地元つながり。地域イベントに詳しい。',
    sns: ['Instagram', 'note'],
    connections: ['me', 'saki', 'miku'],
    position: { x: 24, y: 76, z: 1 },
  },
  {
    id: 'yuta',
    name: '中村 優太',
    handle: '@yuta_n',
    avatar: '/assets/avatars/man1.jpg',
    category: 'event',
    company: 'EventHub',
    school: '明治大学',
    title: 'イベントプランナー',
    location: '東京都新宿区',
    score: 58,
    metCount: 5,
    strength: 'medium',
    lastMet: '5日前',
    memo: '展示会で会った。次はBondyのQR導線を相談。',
    sns: ['X', 'YouTube'],
    connections: ['me', 'taro', 'nao'],
    position: { x: 72, y: 76, z: 1 },
  },
  {
    id: 'mei',
    name: '加藤 芽衣',
    handle: '@mei_k',
    avatar: '/assets/avatars/woman2.jpg',
    category: 'heart',
    company: 'SmartHR',
    school: '京都大学',
    title: 'カスタマーサクセス',
    location: '大阪府',
    score: 51,
    metCount: 4,
    strength: 'weak',
    lastMet: '4日前',
    memo: '価値観が近い。次回はランチ。',
    sns: ['Instagram', 'BeReal'],
    connections: ['me', 'ken'],
    position: { x: 50, y: 84, z: 1 },
  },
  {
    id: 'sho',
    name: '渡辺 翔',
    handle: '@sho_w',
    avatar: '/assets/avatars/man2.jpg',
    category: 'school',
    company: 'Apple Inc.',
    school: '東京工業大学',
    title: 'エンジニア',
    location: '神奈川県',
    score: 48,
    metCount: 4,
    strength: 'weak',
    lastMet: '4日前',
    memo: '技術相談ができる。共通の友人が多い。',
    sns: ['X', 'LinkedIn'],
    connections: ['me', 'saki'],
    position: { x: 49, y: 18, z: 1 },
  },
  {
    id: 'ayaka',
    name: '小林 彩花',
    handle: '@ayaka_k',
    avatar: '/assets/avatars/woman1.jpg',
    category: 'local',
    company: 'Mercari',
    school: '名古屋大学',
    title: 'マーケター',
    location: '愛知県',
    score: 42,
    metCount: 3,
    strength: 'weak',
    lastMet: '3日前',
    memo: '地元イベントで知り合った。',
    sns: ['Instagram'],
    connections: ['taro'],
    position: { x: 17, y: 36, z: 1 },
  },
  {
    id: 'haru',
    name: '藤井 悠',
    handle: '@haru_f',
    avatar: '/assets/avatars/man1.jpg',
    category: 'family',
    company: 'Dior',
    school: '青山学院大学',
    title: 'PR',
    location: '東京都中央区',
    score: 38,
    metCount: 3,
    strength: 'weak',
    lastMet: '2日前',
    memo: '家族紹介でつながった。',
    sns: ['Instagram'],
    connections: ['saki', 'miku'],
    position: { x: 84, y: 35, z: 1 },
  },
  {
    id: 'nao',
    name: '森 直人',
    handle: '@nao_m',
    avatar: '/assets/avatars/man2.jpg',
    category: 'event',
    company: 'CyberAgent',
    school: '法政大学',
    title: 'プロデューサー',
    location: '東京都渋谷区',
    score: 35,
    metCount: 2,
    strength: 'weak',
    lastMet: '1日前',
    memo: 'イベント後に短く話した。',
    sns: ['TikTok', 'YouTube'],
    connections: ['saki', 'yuta'],
    position: { x: 84, y: 68, z: 1 },
  },
  {
    id: 'riku',
    name: '高橋 陸',
    handle: '@riku_t',
    avatar: '/assets/avatars/man1.jpg',
    category: 'business',
    company: 'Microsoft',
    school: '大阪大学',
    title: 'Solution Engineer',
    location: '東京都品川区',
    score: 31,
    metCount: 2,
    strength: 'weak',
    lastMet: '30日前',
    memo: '名刺交換済み。少し距離がある。',
    sns: ['LinkedIn'],
    connections: ['ken'],
    position: { x: 15, y: 68, z: 1 },
  },
];

export const allPeople = [currentUser, ...people];

export const findPerson = (id: string) => allPeople.find((person) => person.id === id) ?? currentUser;

export const relatedPeople = (personId: string) => {
  const center = findPerson(personId);
  return center.connections.map(findPerson).filter((person) => person.id !== center.id);
};

export const secondDegreePeople = (personId: string) => {
  const direct = new Set(relatedPeople(personId).map((person) => person.id));
  const ids = new Set<string>();
  relatedPeople(personId).forEach((person) => {
    person.connections.forEach((id) => {
      if (id !== personId && !direct.has(id)) ids.add(id);
    });
  });
  return Array.from(ids).map(findPerson);
};
