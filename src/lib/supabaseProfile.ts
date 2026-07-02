import { AUTH_CONFIG } from '../auth-config';

export type SupabaseClient = {
  auth: {
    signUp: (input: { email: string; password: string; options?: { emailRedirectTo?: string; data?: Record<string, string> } }) => Promise<{ data?: { user?: { id?: string; email?: string } | null }; error?: { message: string } | null }>;
    signInWithPassword: (input: { email: string; password: string }) => Promise<{ data?: { user?: { id?: string; email?: string } | null }; error?: { message: string } | null }>;
    resetPasswordForEmail: (email: string, options?: { redirectTo?: string }) => Promise<{ error?: { message: string } | null }>;
    updateUser: (input: { password: string }) => Promise<{ error?: { message: string } | null }>;
    getSession: () => Promise<{ data?: { session?: { user?: { id?: string; email?: string } } | null } }>;
  };
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data?: { profile?: unknown; handle?: string; email?: string } | null; error?: { message: string } | null }>;
      };
    };
    upsert: (row: Record<string, unknown>, options?: { onConflict?: string }) => Promise<{ error?: { message: string } | null }>;
  };
};

let clientPromise: Promise<SupabaseClient> | null = null;

export async function getSupabaseClient() {
  if (!clientPromise) {
    const supabaseModuleUrl = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
    clientPromise = import(/* @vite-ignore */ supabaseModuleUrl)
      .then(({ createClient }) => createClient(AUTH_CONFIG.supabaseUrl, AUTH_CONFIG.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
      }) as SupabaseClient);
  }
  return clientPromise;
}

export async function loadRemoteProfile() {
  const client = await getSupabaseClient();
  const session = await client.auth.getSession();
  const user = session.data?.session?.user;
  if (!user?.id) return null;
  const { data, error } = await client
    .from('profiles')
    .select('profile, handle, email')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !data?.profile) return null;
  return data.profile;
}

export async function saveRemoteProfile(profile: unknown, handle?: string) {
  const client = await getSupabaseClient();
  const session = await client.auth.getSession();
  const user = session.data?.session?.user;
  if (!user?.id) return false;
  const { error } = await client.from('profiles').upsert({
    id: user.id,
    email: user.email || '',
    handle: handle || '',
    profile,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  return !error;
}
