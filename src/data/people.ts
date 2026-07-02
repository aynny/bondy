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
  name: 'あなた',
  handle: '@me',
  avatar: '',
  category: 'business',
  company: '',
  school: '',
  title: '',
  location: '',
  score: 0,
  metCount: 0,
  strength: 'strong',
  lastMet: '',
  memo: '',
  sns: [],
  connections: [],
  position: { x: 50, y: 48, z: 3 },
};

export const people: Person[] = [];

export const allPeople = [currentUser, ...people];

function storedCurrentUser() {
  if (typeof window === 'undefined') return currentUser;
  try {
    const raw = window.localStorage.getItem('bondyProfile');
    const stored = raw ? JSON.parse(raw) as {
      form?: Partial<Pick<Person, 'name' | 'company' | 'school' | 'title' | 'location'>> & { handle?: string; currentCompany?: string; currentRole?: string; university?: string };
      photo?: string;
    } : {};
    const form = stored.form || {};
    return {
      ...currentUser,
      name: form.name || currentUser.name,
      handle: form.handle ? `@${String(form.handle).replace(/^@/, '')}` : currentUser.handle,
      avatar: stored.photo || '',
      company: form.currentCompany || form.company || currentUser.company,
      school: form.university || form.school || currentUser.school,
      title: form.currentRole || form.title || currentUser.title,
      location: form.location || currentUser.location,
    };
  } catch {
    return currentUser;
  }
}

export const getCurrentUser = () => storedCurrentUser();

export const findPerson = (id: string) => {
  if (id === currentUser.id) return getCurrentUser();
  return people.find((person) => person.id === id) ?? getCurrentUser();
};

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
