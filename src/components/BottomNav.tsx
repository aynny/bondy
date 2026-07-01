import { BadgeCheck, Map, Search, User, UsersRound } from 'lucide-react';
import { Page } from '../App';

const tabs: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: 'home', label: 'マップ', icon: Map },
  { page: 'ranking', label: 'つながり', icon: UsersRound },
  { page: 'sns', label: 'SNS', icon: BadgeCheck },
  { page: 'discover', label: '発見', icon: Search },
  { page: 'profile', label: 'プロフィール', icon: User },
];

export function BottomNav({ page, go }: { page: Page; go: (page: Page) => void }) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = page === tab.page || (page === 'list' && tab.page === 'ranking');
        return (
          <button key={tab.page} className={`bottom-tab ${active ? 'active' : ''}`} onClick={() => go(tab.page)}>
            <Icon size={21} strokeWidth={active ? 2.5 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
