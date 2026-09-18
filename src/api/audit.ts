/**
 * QPay Fintech Audit Logger
 * Phase 2 — Backend API Layer
 * 
 * Rules:
 * - Records critical financial, KYC, security, and limit events to `fintech_audit_logs`.
 * - Sanitizes all sensitive data (NEVER logs passwords, MPINs, OTPs, or biometric secrets).
 * - Preserves immutable audit trail.
 */

import { getSupabase } from '../services/supabaseClient';

export interface AuditEventParams {
  actorId?: string;
  actorRole?: 'customer' | 'merchant' | 'admin' | 'compliance_auditor';
  eventCategory: 'PAYMENT' | 'KYC' | 'LIMIT_CHANGE' | 'SPLIT_RTP' | 'TRAVEL_BOOKING' | 'AUTH' | 'SECURITY_SETTINGS';
  eventType: string;
  resourceType: string;
  resourceId?: string;
  oldState?: Record<string, any>;
  newState?: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'DENIED';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Sanitizes object by removing all security-sensitive fields before audit persistence
   */
  static sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveKeys = [
      'pin',
      'mpin',
      'password',
      'otp',
      'secret',
      'token',
      'authorization',
      'apikey',
      'privatekey',
      'cvv',
      'cardnumber',
      'biometricdata',
      'key',
    ];

    const clean: Record<string, any> = Array.isArray(obj) ? [] : {};

    for (const [k, v] of Object.entries(obj)) {
      const lowerKey = k.toLowerCase().replace(/[^a-z]/g, '');
      if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
        clean[k] = '[REDACTED]';
      } else if (typeof v === 'object' && v !== null) {
        clean[k] = this.sanitize(v);
      } else {
        clean[k] = v;
      }
    }

    return clean;
  }

  /**
   * Appends an immutable audit log entry
   */
  static async log(params: AuditEventParams): Promise<void> {
    const supabase = getSupabase();

    const sanitizedOld = params.oldState ? this.sanitize(params.oldState) : null;
    const sanitizedNew = params.newState ? this.sanitize(params.newState) : null;

    if (supabase) {
      try {
        await supabase.from('fintech_audit_logs').insert({
          actor_id: params.actorId || null,
          actor_role: params.actorRole || 'customer',
          event_category: params.eventCategory,
          event_type: params.eventType,
          resource_type: params.resourceType,
          resource_id: params.resourceId || null,
          old_state: sanitizedOld,
          new_state: sanitizedNew,
          status: params.status,
          error_message: params.errorMessage || null,
          ip_address: params.ipAddress || null,
          user_agent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
        });
      } catch (err) {
        console.warn('[AuditService] Failed to insert audit log entry:', err);
      }
    } else {
      // In-memory / console trace for dev preview
      console.info('[FINTECH_AUDIT_LOG]', {
        event: `${params.eventCategory}:${params.eventType}`,
        actor: params.actorId,
        status: params.status,
        resource: `${params.resourceType}:${params.resourceId}`,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
