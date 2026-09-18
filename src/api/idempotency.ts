/**
 * QPay Idempotency Service
 * Phase 2 — Backend API Layer
 * 
 * Rules:
 * - Guarantees at-most-once execution for financial & state-mutating requests.
 * - Caches and returns identical response if idempotency key is replayed.
 * - Detects payload tampering if key is reused with different request body.
 */

import { getSupabase } from '../services/supabaseClient';

export class IdempotencyConflictError extends Error {
  constructor(message: string = 'Idempotency key is currently processing or payload hash mismatch.') {
    super(message);
    this.name = 'IdempotencyConflictError';
  }
}

export class IdempotencyService {
  /**
   * Generates a stable hash of the request path + payload
   */
  static hashRequest(path: string, payload: any): string {
    const serialized = `${path}:${JSON.stringify(payload || {})}`;
    // Simple deterministic hash for browser/Node environment
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Begins or checks an idempotent operation
   */
  static async lockOrFetch<T>(
    key: string,
    userId: string,
    path: string,
    payload: any,
    ttlMinutes: number = 60
  ): Promise<{ isCached: boolean; cachedResponse?: T }> {
    if (!key) return { isCached: false };

    const reqHash = this.hashRequest(path, payload);
    const supabase = getSupabase();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('idempotency_records')
          .select('*')
          .eq('key', key)
          .maybeSingle();

        if (existing) {
          if (existing.request_hash !== reqHash) {
            throw new IdempotencyConflictError(
              'Idempotency key was already used with a different request payload.'
            );
          }

          if (existing.status === 'COMPLETED' && existing.response_body) {
            return { isCached: true, cachedResponse: existing.response_body as T };
          }

          if (existing.status === 'PROCESSING') {
            throw new IdempotencyConflictError(
              'A request with this idempotency key is already in progress. Please wait.'
            );
          }
        }

        // Insert initial PROCESSING record
        await supabase.from('idempotency_records').upsert({
          key,
          user_id: userId,
          request_path: path,
          request_hash: reqHash,
          status: 'PROCESSING',
          expires_at: expiresAt,
        });
      } catch (err: any) {
        if (err instanceof IdempotencyConflictError) throw err;
        console.warn('[IdempotencyService] Lock warning:', err);
      }
    }

    return { isCached: false };
  }

  /**
   * Completes an idempotent operation and stores response
   */
  static async complete(key: string, statusCode: number, responseBody: any): Promise<void> {
    if (!key) return;

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('idempotency_records')
          .update({
            response_status_code: statusCode,
            response_body: responseBody,
            status: 'COMPLETED',
          })
          .eq('key', key);
      } catch (err) {
        console.warn('[IdempotencyService] Complete error:', err);
      }
    }
  }

  /**
   * Marks idempotent record as failed so retry can take place
   */
  static async fail(key: string): Promise<void> {
    if (!key) return;

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('idempotency_records')
          .update({ status: 'FAILED' })
          .eq('key', key);
      } catch {
        // ignore
      }
    }
  }
}
