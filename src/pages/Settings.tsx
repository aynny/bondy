import { ChevronRight } from 'lucide-react';
import { AppActions } from '../App';

export function Settings(_: { actions: AppActions }) {
  const sections = [
    ['アカウント', 'プロフィール編集', 'アカウント設定', '通知設定'],
    ['表示・プライバシー', 'プロフィールの公開範囲', 'プライバシー設定', '表示設定'],
    ['その他', 'ヘルプ・サポート', '利用規約', 'プライバシーポリシー', 'ログアウト'],
  ];
  return (
    <div className="page-stack">
      {sections.map(([title, ...items]) => (
        <section className="settings-section" key={title}>
          <h2>{title}</h2>
          {items.map((item) => (
            <button key={item}>{item}<ChevronRight size={18} /></button>
          ))}
        </section>
      ))}
    </div>
  );
}
