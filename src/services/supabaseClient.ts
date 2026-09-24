import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Transaction, User } from '../types';

const globalProc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
const envObj = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : (globalProc && globalProc.env ? globalProc.env : {});
const SUPABASE_URL = envObj.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = envObj.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[Supabase Config Error] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    return null;
  }
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('[Supabase Config Error] Initialization failed:', err);
    return null;
  }
}

// Apply Server-Issued Session and Cache User
export async function setSessionFromServer(sessionData: {
  user: User;
  session?: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
}): Promise<User> {
  const { user, session } = sessionData;
  localStorage.setItem('qpay_user_session', JSON.stringify(user));

  if (session?.access_token) {
    localStorage.setItem('qpay_auth_token', session.access_token);
    const supabase = getSupabase();
    if (supabase && session.refresh_token) {
      try {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      } catch (err) {
        console.warn('[Supabase] Failed to set client session:', err);
      }
    }
  }

  return user;
}

// Sync Transaction to Supabase
// Per audit Item 3: Direct client-side insert is removed to prevent unauthorized status injection.
// Transactions are authoritatively recorded server-side by backend payment services.
export async function syncTransactionToSupabase(_tx: Transaction): Promise<void> {
  return;
}

// Realtime Transactions Listener scoped by owner_profile_id filter
export function subscribeToTransactions(
  onNewTransaction: (tx: Transaction) => void,
  ownerProfileId?: string
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  try {
    const channelName = ownerProfileId ? `public:transactions:${ownerProfileId}` : 'public:transactions:user';
    const filter = ownerProfileId ? `owner_profile_id=eq.${ownerProfileId}` : undefined;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          const row = payload.new as any;
          if (row) {
            const tx: Transaction = {
              id: row.id || `tx-${Date.now()}`,
              title: row.receiver_name || row.sender_name || 'Payment',
              subTitle: `${row.payment_method?.toUpperCase()} • ${row.category || 'Instant'}`,
              amount: Number(row.amount),
              type: row.sender_id ? 'sent' : 'received',
              date: 'JUST NOW',
              timestamp: new Date(row.created_at || Date.now()),
              utr: row.order_ref || `SARIE${Date.now()}`,
              avatarInitials: (row.receiver_name || 'QP').slice(0, 2).toUpperCase(),
            };
            onNewTransaction(tx);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Subscription notice:', err);
    return () => {};
  }
}
