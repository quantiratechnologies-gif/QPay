import { Request, Response, NextFunction } from 'express';
import { getSupabaseServer } from '../services/supabaseServer.js';

interface RateCheckResult {
  allowed: boolean;
  code?: string;
  message?: string;
  retryAfter?: number;
}

// In-memory sliding window cache for fast rejection
const memoryEvents = new Map<string, number[]>();
const lastSendTimestamps = new Map<string, number>();

function cleanMemoryEvents(key: string, windowMs: number): number[] {
  const now = Date.now();
  const timestamps = (memoryEvents.get(key) || []).filter((t) => now - t < windowMs);
  memoryEvents.set(key, timestamps);
  return timestamps;
}

export async function checkSendRateLimit(phone: string, ip: string): Promise<RateCheckResult> {
  const now = Date.now();

  // 1. Cooldown Check (60s)
  const lastSend = lastSendTimestamps.get(phone) || 0;
  const timeSinceLast = Math.floor((now - lastSend) / 1000);
  if (timeSinceLast < 60) {
    return {
      allowed: false,
      code: 'COOLDOWN_ACTIVE',
      message: `Please wait ${60 - timeSinceLast} seconds before requesting a new code.`,
      retryAfter: 60 - timeSinceLast,
    };
  }

  // 2. Fast In-Memory Check
  const tenMinutesMs = 10 * 60 * 1000;
  const phoneHits = cleanMemoryEvents(`phone:${phone}`, tenMinutesMs);
  if (phoneHits.length >= 3) {
    return {
      allowed: false,
      code: 'RATE_LIMITED',
      message: 'Too many OTP requests for this phone number. Please try again in 10 minutes.',
      retryAfter: Math.ceil((phoneHits[0] + tenMinutesMs - now) / 1000),
    };
  }

  const ipHits = cleanMemoryEvents(`ip:${ip}`, tenMinutesMs);
  if (ipHits.length >= 5) {
    return {
      allowed: false,
      code: 'RATE_LIMITED',
      message: 'Too many OTP requests from this IP address. Please try again in 10 minutes.',
      retryAfter: Math.ceil((ipHits[0] + tenMinutesMs - now) / 1000),
    };
  }

  // 3. Database Rate Verification (if Supabase connected)
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const tenMinutesAgo = new Date(now - tenMinutesMs).toISOString();
      const { count: dbPhoneCount } = await supabase
        .from('otp_rate_events')
        .select('*', { count: 'exact', head: true })
        .eq('phone', phone)
        .eq('event_type', 'send')
        .gte('created_at', tenMinutesAgo);

      if (dbPhoneCount && dbPhoneCount >= 3) {
        return {
          allowed: false,
          code: 'RATE_LIMITED',
          message: 'Too many OTP requests. Please try again later.',
          retryAfter: 600,
        };
      }
    } catch (err) {
      console.warn('[RateLimiter] Database rate limit query failed, falling back to memory limit:', err);
    }
  }

  return { allowed: true };
}

export async function recordRateEvent(phone: string, ip: string, eventType: 'send' | 'resend' | 'verify'): Promise<void> {
  const now = Date.now();
  if (eventType === 'send' || eventType === 'resend') {
    lastSendTimestamps.set(phone, now);
    const phoneHits = memoryEvents.get(`phone:${phone}`) || [];
    phoneHits.push(now);
    memoryEvents.set(`phone:${phone}`, phoneHits);

    const ipHits = memoryEvents.get(`ip:${ip}`) || [];
    ipHits.push(now);
    memoryEvents.set(`ip:${ip}`, ipHits);
  }

  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      await supabase.from('otp_rate_events').insert([
        {
          phone,
          ip_address: ip !== 'unknown' ? ip : null,
          event_type: eventType,
        },
      ]);
    } catch (err) {
      // Non-blocking rate log
    }
  }
}
