import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });
  return supabaseInstance;
}

/**
 * Set the Supabase Realtime auth token after login.
 * This allows filtered Realtime channels to work with RLS.
 */
export function setRealtimeAuth(accessToken: string): void {
  try {
    const sb = getSupabase();
    sb.realtime.setAuth(accessToken);
  } catch (err) {
    console.warn('[Supabase] setRealtimeAuth error:', err);
  }
}

/**
 * Subscribe to wallet balance changes for a specific profile.
 * Returns an unsubscribe function.
 */
export function subscribeToWalletUpdates(
  profileId: string,
  onUpdate: (newBalance: number) => void
): () => void {
  try {
    const sb = getSupabase();
    const channel = sb
      .channel(`wallet:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (typeof row?.balance === 'number' || typeof row?.balance === 'string') {
            onUpdate(Number(row.balance));
          }
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] subscribeToWalletUpdates error:', err);
    return () => {};
  }
}

/**
 * Subscribe to new incoming transactions for a specific payer.
 * Returns an unsubscribe function.
 */
export function subscribeToNewTransactions(
  profileId: string,
  onNew: (row: any) => void
): () => void {
  try {
    const sb = getSupabase();
    const channel = sb
      .channel(`txns:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `payer_profile_id=eq.${profileId}`,
        },
        (payload) => {
          if (payload.new) onNew(payload.new);
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] subscribeToNewTransactions error:', err);
    return () => {};
  }
}
