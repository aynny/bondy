import { useState } from 'react';

type AuthGateProps = {
  onAuthenticated: () => void;
};

type StoredAccount = {
  email: string;
  password: string;
  name: string;
  handle: string;
};

const ACCOUNT_KEY = 'bondyAccount';
const SESSION_KEY = 'bondySession';

function readAccount(): StoredAccount | null {
  try {
    const value = window.localStorage.getItem(ACCOUNT_KEY);
    return value ? JSON.parse(value) as StoredAccount : null;
  } catch {
    return null;
  }
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(() => readAccount()?.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setMessage('');
    if (!email.trim() || !password.trim()) {
      setMessage('メールアドレスとパスワードを入力してください');
      return;
    }
    if (mode === 'register' && (!name.trim() || !handle.trim())) {
      setMessage('必須項目を入力してください');
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      if (mode === 'register') {
        const account: StoredAccount = {
          email: email.trim(),
          password,
          name: name.trim(),
          handle: handle.trim().replace(/^@/, ''),
        };
        window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
        window.localStorage.setItem('bondyProfile', JSON.stringify({
          form: {
            name: account.name,
            handle: account.handle,
          },
        }));
        window.localStorage.setItem(SESSION_KEY, 'true');
        onAuthenticated();
        return;
      }

      const account = readAccount();
      if (!account || account.email !== email.trim() || account.password !== password) {
        setBusy(false);
        setMessage('ログイン情報が一致しません。新規登録から始めてください。');
        return;
      }
      window.localStorage.setItem(SESSION_KEY, 'true');
      onAuthenticated();
    }, 420);
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-logo">Bondy</div>
        <p>人との出会いを、資産に。</p>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>ログイン</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>新規登録</button>
        </div>
        {mode === 'register' && (
          <>
            <label>名前 <em>*</em><input value={name} onChange={(event) => setName(event.target.value)} placeholder="山田 太郎" /></label>
            <label>ユーザーID <em>*</em><input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="taro" /></label>
          </>
        )}
        <label>メールアドレス <em>*</em><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="bondy@example.com" /></label>
        <label>パスワード <em>*</em><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="8文字以上" /></label>
        {message && <strong className="auth-message">{message}</strong>}
        <button className="auth-submit" onClick={submit}>{busy ? (mode === 'login' ? 'ログイン中...' : '登録中...') : (mode === 'login' ? 'ログイン' : '登録して始める')}</button>
      </section>
    </main>
  );
}
