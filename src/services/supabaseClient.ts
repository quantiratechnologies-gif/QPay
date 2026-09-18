import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Transaction, User } from '../types';

const globalProc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
const envObj = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : (globalProc && globalProc.env ? globalProc.env : {});
const SUPABASE_URL = envObj.VITE_SUPABASE_URL || 'https://sb-qpay-saudi.supabase.co';
const SUPABASE_ANON_KEY = envObj.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fiRLd5ddXPUH_onp8AH86w_JQoVgAmH';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  try {
    const isPlaceholder = !SUPABASE_URL || SUPABASE_URL.includes('sb-qpay-saudi.supabase.co');
    if (!isPlaceholder && SUPABASE_URL && SUPABASE_ANON_KEY) {
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
    }
  } catch (err) {
    console.warn('[Supabase] Initialization warning:', err);
  }
  return null;
}

// Universal Auth & Auto-Provisioning
export async function authenticateWithAnyOtp(
  mobile: string,
  _otp: string,
  fullName: string = 'Fahad Al-Harbi'
): Promise<User> {
  const cleanMobile = mobile.replace(/\s+/g, '');
  const supabase = getSupabase();

  const defaultUser: User = {
    name: fullName,
    avatarInitials: fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'QP',
    upiId: `${cleanMobile.slice(-4)}@sarie`,
    mobile: cleanMobile.startsWith('+966') ? cleanMobile : `+966 ${cleanMobile}`,
    email: `${cleanMobile.slice(-6)}@qpay.sa`,
  };

  if (!supabase) {
    localStorage.setItem('qpay_user_session', JSON.stringify(defaultUser));
    return defaultUser;
  }

  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('mobile', cleanMobile)
      .maybeSingle();

    if (existingProfile && !fetchErr) {
      const user: User = {
        name: existingProfile.full_name || defaultUser.name,
        avatarInitials: existingProfile.avatar_initials || defaultUser.avatarInitials,
        upiId: existingProfile.upi_id || defaultUser.upiId,
        mobile: existingProfile.mobile,
        email: `${cleanMobile.slice(-6)}@qpay.sa`,
      };
      localStorage.setItem('qpay_user_session', JSON.stringify(user));
      return user;
    }

    // Auto-provision new user profile in Supabase
    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .insert({
        mobile: cleanMobile,
        role: 'customer',
        full_name: fullName,
        avatar_initials: defaultUser.avatarInitials,
        upi_id: defaultUser.upiId,
        is_kyc_verified: true,
      })
      .select()
      .single();

    if (newProfile && !insertErr) {
      const user: User = {
        name: newProfile.full_name,
        avatarInitials: newProfile.avatar_initials,
        upiId: newProfile.upi_id,
        mobile: newProfile.mobile,
        email: `${cleanMobile.slice(-6)}@qpay.sa`,
      };
      localStorage.setItem('qpay_user_session', JSON.stringify(user));
      return user;
    }
  } catch (e) {
    console.warn('[Supabase] Live auth sync fallback to local session:', e);
  }

  localStorage.setItem('qpay_user_session', JSON.stringify(defaultUser));
  return defaultUser;
}

// Sync Transaction to Supabase
export async function syncTransactionToSupabase(tx: Transaction): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('transactions').insert({
      order_ref: tx.utr || `SAR-${Date.now().toString().slice(-6)}`,
      sender_name: tx.title,
      receiver_name: tx.subTitle || 'Merchant / Recipient',
      amount: tx.amount,
      vat_amount: Number((tx.amount * 0.15).toFixed(2)),
      net_amount: Number((tx.amount * 0.85).toFixed(2)),
      payment_method: 'mada',
      status: 'settled',
      card_last4: '9082',
      category: tx.category || 'Instant Transfer',
      created_at: tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Supabase] Transaction sync notice:', err);
  }
}

// Realtime Transactions Listener
export function subscribeToTransactions(onNewTransaction: (tx: Transaction) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('public:transactions:user')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
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
