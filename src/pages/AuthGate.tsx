import { useMemo, useState } from 'react';
import { getSupabaseClient, loadRemoteProfile, saveRemoteProfile } from '../lib/supabaseProfile';

type AuthGateProps = {
  onAuthenticated: (destination?: 'home' | 'profile') => void;
};

type AuthMode = 'login' | 'register' | 'reset' | 'updatePassword' | 'verify';

const PROFILE_KEY = 'bondyProfile';
const SESSION_KEY = 'bondySession';
const ACCOUNT_KEY = 'bondyAccount';
const SIGNUP_PENDING_KEY = 'bondySignupPendingEmail';

function authRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function saveSession(email: string) {
  window.localStorage.setItem(SESSION_KEY, 'supabase');
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ email }));
}

function savePendingProfile(name: string, handle: string, email: string) {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify({
    form: {
      name: name.trim(),
      handle: handle.trim().replace(/^@/, ''),
    },
  }));
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify({
    email: email.trim(),
    name: name.trim(),
    handle: handle.trim().replace(/^@/, ''),
  }));
}

async function restoreRemoteProfile() {
  const remote = await loadRemoteProfile();
  if (remote) window.localStorage.setItem(PROFILE_KEY, JSON.stringify(remote));
}

async function syncPendingProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return;
    const profile = JSON.parse(raw) as { form?: { handle?: string } };
    await saveRemoteProfile(profile, profile.form?.handle);
  } catch {
    // Local profile remains usable even if cloud sync is temporarily unavailable.
  }
}

function authErrorMessage(error?: { message: string } | null) {
  const message = error?.message || '';
  if (message.includes('Invalid login credentials')) return 'メールアドレスまたはパスワードが違います。';
  if (message.includes('Email not confirmed')) return 'メール認証がまだ完了していません。確認メールを開いてください。';
  if (message.includes('User already registered')) return 'このメールアドレスはすでに登録されています。ログインしてください。';
  if (message.includes('Password should be')) return 'パスワードは8文字以上で入力してください。';
  return message || '処理に失敗しました。少し時間を置いてもう一度お試しください。';
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const needsUpdatePassword = params.get('type') === 'recovery' || hashParams.get('type') === 'recovery';
  const needsVerify = params.get('type') === 'signup' || hashParams.get('type') === 'signup';
  const [mode, setMode] = useState<AuthMode>(needsUpdatePassword ? 'updatePassword' : needsVerify ? 'verify' : 'login');
  const [email, setEmail] = useState(() => {
    try {
      const account = JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) || '{}') as { email?: string };
      return account.email || window.localStorage.getItem(SIGNUP_PENDING_KEY) || '';
    } catch {
      return window.localStorage.getItem(SIGNUP_PENDING_KEY) || '';
    }
  });
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const copy = useMemo(() => {
    if (mode === 'register') return { title: '新規登録', button: '確認メールを送る', helper: 'メール認証が完了したら、プロフィール登録に進めます。' };
    if (mode === 'reset') return { title: 'パスワード再設定', button: '再設定メールを送る', helper: '登録済みメールアドレスに再設定リンクを送ります。' };
    if (mode === 'updatePassword') return { title: '新しいパスワード', button: 'パスワードを更新', helper: '新しいパスワードを設定してください。' };
    if (mode === 'verify') return { title: 'メールを確認してください', button: '認証済みなので始める', helper: 'メールの確認リンクを開いたあと、このボタンを押してください。' };
    return { title: 'ログイン', button: 'ログイン', helper: 'ログインすると保存されたプロフィールを復元します。' };
  }, [mode]);

  const submit = async () => {
    setMessage('');
    setBusy(true);
    try {
      const client = await getSupabaseClient();
      const cleanEmail = email.trim();

      if (mode === 'reset') {
        if (!cleanEmail) {
          setMessage('メールアドレスを入力してください。');
          return;
        }
        const { error } = await client.auth.resetPasswordForEmail(cleanEmail, { redirectTo: authRedirectUrl() });
        if (error) {
          setMessage(authErrorMessage(error));
          return;
        }
        setMessage('再設定メールを送信しました。メールを確認してください。');
        return;
      }

      if (mode === 'updatePassword') {
        if (!password || password.length < 8) {
          setMessage('パスワードは8文字以上で入力してください。');
          return;
        }
        if (password !== passwordConfirm) {
          setMessage('確認用パスワードが一致しません。');
          return;
        }
        const { error } = await client.auth.updateUser({ password });
        if (error) {
          setMessage(authErrorMessage(error));
          return;
        }
        const session = await client.auth.getSession();
        saveSession(session.data?.session?.user?.email || cleanEmail);
        await restoreRemoteProfile();
        onAuthenticated('home');
        return;
      }

      if (mode === 'verify') {
        const session = await client.auth.getSession();
        const verifiedEmail = session.data?.session?.user?.email || cleanEmail;
        if (!session.data?.session?.user) {
          setMessage('まだ認証が確認できません。メール内のリンクを開いてからもう一度押してください。');
          return;
        }
        saveSession(verifiedEmail);
        await syncPendingProfile();
        onAuthenticated('profile');
        return;
      }

      if (!cleanEmail || !password) {
        setMessage('メールアドレスとパスワードを入力してください。');
        return;
      }

      if (mode === 'register') {
        if (!name.trim() || !handle.trim()) {
          setMessage('必須項目を入力してください。');
          return;
        }
        if (password.length < 8) {
          setMessage('パスワードは8文字以上で入力してください。');
          return;
        }
        if (password !== passwordConfirm) {
          setMessage('確認用パスワードが一致しません。');
          return;
        }
        const { error } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: authRedirectUrl(),
            data: {
              name: name.trim(),
              handle: handle.trim().replace(/^@/, ''),
            },
          },
        });
        if (error) {
          setMessage(authErrorMessage(error));
          return;
        }
        savePendingProfile(name, handle, cleanEmail);
        window.localStorage.setItem(SIGNUP_PENDING_KEY, cleanEmail);
        setMode('verify');
        setMessage('確認メールを送信しました。メール認証後にプロフィール登録へ進めます。');
        return;
      }

      const { data, error } = await client.auth.signInWithPassword({ email: cleanEmail, password });
      if (error || !data?.user) {
        setMessage(authErrorMessage(error));
        return;
      }
      window.localStorage.removeItem(SIGNUP_PENDING_KEY);
      saveSession(data.user.email || cleanEmail);
      await restoreRemoteProfile();
      onAuthenticated('home');
    } catch {
      setMessage('認証サービスに接続できませんでした。通信環境を確認してください。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-logo">Bondy</div>
        <p>{copy.helper}</p>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>ログイン</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setMessage(''); }}>新規登録</button>
        </div>
        <h1 className="auth-title">{copy.title}</h1>
        {mode === 'register' && (
          <>
            <label><span className="required-label">名前<em>*</em></span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="山田 太郎" /></label>
            <label><span className="required-label">ユーザーID<em>*</em></span><input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="taro" /></label>
          </>
        )}
        {mode !== 'updatePassword' && (
          <label><span className="required-label">メールアドレス<em>*</em></span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="bondy@example.com" /></label>
        )}
        {mode !== 'reset' && mode !== 'verify' && (
          <label><span className="required-label">パスワード<em>*</em></span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="8文字以上" /></label>
        )}
        {(mode === 'register' || mode === 'updatePassword') && (
          <label><span className="required-label">パスワード確認<em>*</em></span><input value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} type="password" placeholder="もう一度入力" /></label>
        )}
        {message && <strong className="auth-message">{message}</strong>}
        <button className="auth-submit" onClick={submit} disabled={busy}>{busy ? '処理中...' : copy.button}</button>
        {mode === 'login' && <button className="auth-link-button" onClick={() => { setMode('reset'); setMessage(''); }}>パスワードを忘れた方</button>}
        {(mode === 'reset' || mode === 'verify' || mode === 'updatePassword') && <button className="auth-link-button" onClick={() => { setMode('login'); setMessage(''); }}>ログインに戻る</button>}
      </section>
    </main>
  );
}
