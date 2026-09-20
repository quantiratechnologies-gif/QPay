import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sb-qpay-saudi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let serverSupabaseInstance: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  if (serverSupabaseInstance) return serverSupabaseInstance;

  try {
    const isMock = !SUPABASE_URL || SUPABASE_URL.includes('sb-qpay-saudi.supabase.co');
    if (!isMock && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      serverSupabaseInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return serverSupabaseInstance;
    }
  } catch (err) {
    console.warn('[SupabaseServer] Failed to initialize Supabase server client:', err);
  }

  return null;
}
