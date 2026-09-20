import { getSupabaseServer } from '../services/supabaseServer.js';
import { maskPhone } from './phoneValidator.js';

export type OtpAuditEventType =
  | 'OTP_REQUESTED'
  | 'OTP_VERIFIED'
  | 'OTP_VERIFICATION_FAILED'
  | 'OTP_EXPIRED'
  | 'OTP_MAX_ATTEMPTS_EXCEEDED'
  | 'OTP_RESENT'
  | 'OTP_RATE_LIMITED';

export async function logOtpAuditEvent(params: {
  eventType: OtpAuditEventType;
  phone: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const supabase = getSupabaseServer();
  const masked = maskPhone(params.phone);

  const payload = {
    action: params.eventType,
    entity_type: 'OTP_VERIFICATION',
    entity_id: masked,
    actor_role: 'system',
    status: params.eventType.includes('FAIL') || params.eventType.includes('EXCEED') || params.eventType.includes('RATE') ? 'FAILED' : 'SUCCESS',
    details: {
      phone_masked: masked,
      ip: params.ipAddress || 'unknown',
      userAgent: params.userAgent || 'unknown',
      ...params.metadata,
    },
    created_at: new Date().toISOString(),
  };

  if (!supabase) {
    console.log('[Audit Log]', JSON.stringify(payload));
    return;
  }

  try {
    await supabase.from('fintech_audit_logs').insert([payload]);
  } catch (err) {
    console.warn('[Audit Log] Failed to insert audit record:', err);
  }
}
