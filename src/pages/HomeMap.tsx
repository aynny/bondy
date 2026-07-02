import { type CSSProperties, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, CalendarDays, ChevronRight, IdCard, MessageSquarePlus, QrCode, SlidersHorizontal } from 'lucide-react';
import { AppActions } from '../App';
import { categoryMeta, currentUser, findPerson, people, Person, relatedPeople, secondDegreePeople } from '../data/people';

type Filter = 'all' | 'medium' | 'strong';

export function HomeMap({ centerPerson, actions }: { centerPerson: Person; actions: AppActions }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [toolOpen, setToolOpen] = useState(false);

  const direct = relatedPeople(centerPerson.id);
  const visible = direct
    .filter((person) => filter === 'all' || person.strength === filter || (filter === 'medium' && person.strength === 'strong'))
    .slice(0, 8);
  const searchPool = [...direct, ...secondDegreePeople(centerPerson.id)];
  const searchResults = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return [];
    return searchPool
      .filter((person) => [person.name, person.handle, person.company, person.school, person.title, person.location]
        .join(' ')
        .toLowerCase()
        .includes(text))
      .slice(0, 5);
  }, [query, searchPool]);

  return (
    <div className="home-screen">
      <div className="map-search">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="名前・ID・会社・学校などを入力"
        />
        <button onClick={() => setQuery('')}><SlidersHorizontal size={18} /></button>
      </div>

      {searchResults.length > 0 && (
        <div className="search-popover">
          {searchResults.map((person) => (
            <button key={person.id} onClick={() => actions.openPerson(person)}>
              <Avatar person={person} />
              <span>
                <strong>{person.name}</strong>
                <small>{direct.some((item) => item.id === person.id) ? '自分のつながり' : `${centerPerson.name}のつながり`}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="map-stage">
        <div className="ring ring-one" />
        <div className="ring ring-two" />
        <div className="ring ring-three" />
        <svg className="connection-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {visible.map((person) => {
            const meta = categoryMeta[person.category];
            return (
              <line
                key={person.id}
                x1="50"
                y1="50"
                x2={person.position.x}
                y2={person.position.y}
                stroke={meta.color}
                strokeWidth={person.strength === 'strong' ? 0.55 : 0.34}
                opacity={person.strength === 'weak' ? 0.32 : 0.48}
              />
            );
          })}
        </svg>
        <div className="central-node">
          <div className="central-avatar">
            <Avatar person={centerPerson} />
          </div>
          <h1>{centerPerson.id === currentUser.id ? 'あなた' : centerPerson.name}</h1>
          <p><span />つながり {direct.length}人</p>
        </div>
        {visible.map((person, index) => (
          <PersonNode key={person.id} person={person} index={index} actions={actions} />
        ))}
        {visible.length === 0 && (
          <div className="empty-map-state">
            <strong>まだつながりがありません</strong>
            <span>QR交換やID検索から、最初のつながりを追加できます。</span>
            <button onClick={() => actions.go('new')}>つながりを追加</button>
          </div>
        )}
      </div>

      <ToolDock open={toolOpen} setOpen={setToolOpen} actions={actions} />

      <div className="map-filter">
        {[
          ['all', 'すべて'],
          ['medium', '中以上'],
          ['strong', '強い人だけ'],
        ].map(([key, label]) => (
          <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key as Filter)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonNode({ person, index, actions }: { person: Person; index: number; actions: AppActions }) {
  const meta = categoryMeta[person.category];
  const size = person.strength === 'strong' ? 72 : person.strength === 'medium' ? 62 : 54;

  return (
    <motion.button
      className="person-node"
      style={{
        left: `${person.position.x}%`,
        top: `${person.position.y}%`,
        '--node-color': meta.color,
        '--node-glow': meta.glow,
      } as CSSProperties}
      initial={{ opacity: 0, y: 18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.08 + index * 0.035 }}
      onClick={() => actions.openPerson(person)}
      onDoubleClick={() => actions.setCenter(person.id)}
    >
      <span className="node-orb" style={{ width: size, height: size }}>
        <Avatar person={person} />
      </span>
      <strong>{person.name.split(' ')[0]}</strong>
      <small style={{ color: meta.color, background: meta.tint }}>{meta.label}</small>
    </motion.button>
  );
}

function Avatar({ person }: { person: Person }) {
  if (person.avatar) return <img src={person.avatar} alt={person.name} />;
  return <span>{person.name.slice(0, 2).toUpperCase()}</span>;
}

function ToolDock({ open, setOpen, actions }: {
  open: boolean;
  setOpen: (open: boolean) => void;
  actions: AppActions;
}) {
  const tools = [
    { label: 'QR交換', icon: QrCode, page: 'qr' as const },
    { label: 'リクエスト', icon: BellRing, page: 'requests' as const },
    { label: '招待', icon: MessageSquarePlus, page: 'new' as const },
    { label: '名刺交換', icon: IdCard, page: 'list' as const },
    { label: '履歴', icon: CalendarDays, page: 'calendar' as const },
  ];

  return (
    <div className="tool-dock">
      {open && tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button key={tool.label} className="tool-bubble" onClick={() => actions.go(tool.page)}>
            <Icon size={20} />
            <span>{tool.label}</span>
          </button>
        );
      })}
      <button className="plus-bubble" onClick={() => setOpen(!open)} aria-label="メニュー">
        <ChevronRight className={open ? 'rotate-90' : ''} size={28} />
      </button>
    </div>
  );
}
