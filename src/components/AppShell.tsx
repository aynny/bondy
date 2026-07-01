import { Bell, ChevronLeft, Plus, Search } from 'lucide-react';
import { Page, AppActions } from '../App';
import { currentUser } from '../data/people';

const pageTitles: Partial<Record<Page, string>> = {
  ranking: 'つながりランキング',
  detail: 'つながり詳細',
  meeting: '会った記録',
  score: 'スコア内訳',
  common: '共通のつながり',
  memo: 'メモ',
  reminder: 'リマインド',
  list: 'つながりリスト',
  sns: 'SNS一覧',
  discover: '発見',
  profile: 'プロフィール',
  new: '新しいつながり',
  qr: 'QRコード',
  requests: 'リクエスト',
  calendar: 'カレンダー履歴',
  settings: '設定',
};

export function AppShell({ children, page, actions }: {
  children: React.ReactNode;
  page: Page;
  actions: AppActions;
}) {
  const isHome = page === 'home';

  return (
    <div className="min-h-screen bg-shell text-ink">
      <div className="phone-app">
        <header className="app-header">
          <div className="flex items-center gap-3">
            {!isHome && (
              <button className="icon-button subtle" onClick={() => actions.go('home')} aria-label="戻る">
                <ChevronLeft size={24} />
              </button>
            )}
            <div>
              <p className={isHome ? 'brand-title' : 'page-title'}>{isHome ? 'Bondy' : pageTitles[page]}</p>
              {!isHome && <p className="page-kicker">Bondy</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="icon-button" onClick={() => actions.go('discover')} aria-label="検索">
              <Search size={22} />
            </button>
            {isHome && (
              <button className="icon-button navy-button" onClick={() => actions.go('new')} aria-label="追加">
                <Plus size={25} />
              </button>
            )}
            {!isHome && (
              <button className="icon-button" onClick={() => actions.go('requests')} aria-label="通知">
                <Bell size={20} />
              </button>
            )}
            <button className="avatar-button" onClick={() => actions.go('profile')} aria-label="プロフィール">
              <img src={currentUser.avatar} alt={currentUser.name} />
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
