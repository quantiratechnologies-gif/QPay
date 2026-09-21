import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateAndFormatPhone } from '../utils/phoneValidator.js';
import { msg91Service } from '../services/msg91Service.js';
import { checkSendRateLimit, recordRateEvent } from '../middleware/rateLimiter.js';
import { logOtpAuditEvent } from '../utils/auditLog.js';
import { getSupabaseServer } from '../services/supabaseServer.js';
import { resolveOrProvisionUserSession } from '../services/sessionService.js';

export const otpRouter = Router();

// Local active verification fallback store
interface ActiveVerification {
  id: string;
  phone: string;
  status: 'pending' | 'verified' | 'expired' | 'failed' | 'max_attempts_exceeded';
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  createdAt: number;
}
const localVerifications = new Map<string, ActiveVerification>();

// Validation Schemas
const SendOtpSchema = z.object({
  phone: z.string().min(6).max(20),
  fullName: z.string().optional(),
  defaultCountry: z.string().optional(),
});

const VerifyOtpSchema = z.object({
  phone: z.string().min(6).max(20),
  otp: z.string().regex(/^\d{4,6}$/, 'OTP must be 4 to 6 numeric digits'),
  fullName: z.string().optional(),
});

const ResendOtpSchema = z.object({
  phone: z.string().min(6).max(20),
});

/**
 * Helper to get client IP
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * POST /api/auth/otp/send
 */
otpRouter.post('/send', async (req: Request, res: Response): Promise<void> => {
  const parsed = SendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      code: 'INVALID_REQUEST',
      error: parsed.error.issues[0]?.message || 'Invalid parameters',
    });
    return;
  }

  const { phone, fullName, defaultCountry } = parsed.data;
  const validation = validateAndFormatPhone(phone, (defaultCountry as any) || 'SA');

  if (!validation.isValid || !validation.e164) {
    res.status(400).json({
      success: false,
      code: 'INVALID_PHONE',
      error: validation.error || 'Invalid international phone number',
    });
    return;
  }

  const e164 = validation.e164;
  const ip = getClientIp(req);

  // Rate limit and cooldown check
  const rateCheck = await checkSendRateLimit(e164, ip);
  if (!rateCheck.allowed) {
    res.status(429).json({
      success: false,
      code: rateCheck.code,
      error: rateCheck.message,
      retryAfter: rateCheck.retryAfter,
    });
    return;
  }

  // Send OTP via MSG91
  const sendResult = await msg91Service.sendOtp(e164);
  if (!sendResult.success) {
    await logOtpAuditEvent({
      eventType: 'OTP_VERIFICATION_FAILED',
      phone: e164,
      ipAddress: ip,
      metadata: { error: sendResult.message },
    });

    res.status(503).json({
      success: false,
      code: 'PROVIDER_UNAVAILABLE',
      error: sendResult.message || 'SMS service unavailable. Please try again.',
    });
    return;
  }

  try {
    // Record verification tracking in Supabase or local memory
    const supabase = getSupabaseServer();
    const expiryMinutes = parseInt(process.env.MSG91_OTP_EXPIRY_MINUTES || '10', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    if (supabase) {
      try {
        await supabase.from('otp_verifications').insert([
          {
            phone: e164,
            provider: 'msg91',
            request_id: sendResult.requestId || null,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
            attempts: 0,
            max_attempts: 5,
            ip_address: ip !== 'unknown' ? ip : null,
          },
        ]);
      } catch (err) {
        console.warn('[OtpRoutes] Database record insert failed, keeping in-memory:', err);
      }
    }

    localVerifications.set(e164, {
      id: `ver_${Date.now()}`,
      phone: e164,
      status: 'pending',
      attempts: 0,
      maxAttempts: 5,
      expiresAt: Date.now() + expiryMinutes * 60 * 1000,
      createdAt: Date.now(),
    });

    // Audit event log
    await logOtpAuditEvent({
      eventType: 'OTP_REQUESTED',
      phone: e164,
      ipAddress: ip,
    });

    // Only record cooldown / rate limiting event after provider send and all steps succeed
    await recordRateEvent(e164, ip, 'send');

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phone: e164,
      resendCooldown: 60,
    });
  } catch (err: any) {
    console.error('[OtpRoutes] Failed to finalize OTP send:', err?.message, err?.stack);
    // If any later step fails, do not start the cooldown
    res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      error: 'Failed to complete OTP request. Please try again.',
    });
  }
});

/**
 * POST /api/auth/otp/verify
 */
otpRouter.post('/verify', async (req: Request, res: Response): Promise<void> => {
  const parsed = VerifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      code: 'INVALID_OTP_FORMAT',
      error: parsed.error.issues[0]?.message || 'Invalid verification request',
    });
    return;
  }

  const { phone, otp, fullName } = parsed.data;
  const validation = validateAndFormatPhone(phone);
  const e164 = validation.isValid && validation.e164 ? validation.e164 : phone.trim();
  const ip = getClientIp(req);

  const supabase = getSupabaseServer();
  let currentRecord = localVerifications.get(e164);

  // Check database pending record if present
  let dbRecordId: string | null = null;
  if (supabase) {
    try {
      const { data: dbRecord } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', e164)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbRecord) {
        dbRecordId = dbRecord.id;
        currentRecord = {
          id: dbRecord.id,
          phone: dbRecord.phone,
          status: dbRecord.status,
          attempts: dbRecord.attempts,
          maxAttempts: dbRecord.max_attempts,
          expiresAt: new Date(dbRecord.expires_at).getTime(),
          createdAt: new Date(dbRecord.created_at).getTime(),
        };
      }
    } catch (e) {
      // Non-blocking
    }
  }

  if (!currentRecord) {
    res.status(404).json({
      success: false,
      code: 'OTP_NOT_FOUND',
      error: 'No active OTP verification found. Please request a new code.',
    });
    return;
  }

  // Check Expiry
  if (Date.now() > currentRecord.expiresAt) {
    currentRecord.status = 'expired';
    if (dbRecordId && supabase) {
      await supabase.from('otp_verifications').update({ status: 'expired' }).eq('id', dbRecordId);
    }
    await logOtpAuditEvent({ eventType: 'OTP_EXPIRED', phone: e164, ipAddress: ip });

    res.status(410).json({
      success: false,
      code: 'OTP_EXPIRED',
      error: 'OTP code has expired. Please request a new one.',
    });
    return;
  }

  // Atomic attempts check
  if (currentRecord.attempts >= currentRecord.maxAttempts) {
    currentRecord.status = 'max_attempts_exceeded';
    if (dbRecordId && supabase) {
      await supabase.from('otp_verifications').update({ status: 'max_attempts_exceeded' }).eq('id', dbRecordId);
    }
    await logOtpAuditEvent({ eventType: 'OTP_MAX_ATTEMPTS_EXCEEDED', phone: e164, ipAddress: ip });

    res.status(429).json({
      success: false,
      code: 'MAX_ATTEMPTS_EXCEEDED',
      error: 'Maximum verification attempts exceeded. Please restart verification.',
    });
    return;
  }

  // Increment attempts
  currentRecord.attempts += 1;
  if (dbRecordId && supabase) {
    await supabase
      .from('otp_verifications')
      .update({ attempts: currentRecord.attempts })
      .eq('id', dbRecordId);
  }

  // Verify code with MSG91
  const verifyResult = await msg91Service.verifyOtp(e164, otp);
  if (!verifyResult.success) {
    if (verifyResult.message?.includes('not configured')) {
      res.status(503).json({
        success: false,
        code: 'PROVIDER_UNAVAILABLE',
        error: verifyResult.message,
      });
      return;
    }

    const remaining = currentRecord.maxAttempts - currentRecord.attempts;
    await logOtpAuditEvent({
      eventType: 'OTP_VERIFICATION_FAILED',
      phone: e164,
      ipAddress: ip,
      metadata: { attempts: currentRecord.attempts },
    });

    res.status(401).json({
      success: false,
      code: 'OTP_INVALID',
      error: 'Incorrect verification code. Please try again.',
      remainingAttempts: remaining > 0 ? remaining : 0,
    });
    return;
  }

  // Verification Succeeded
  currentRecord.status = 'verified';
  localVerifications.delete(e164);

  if (dbRecordId && supabase) {
    await supabase
      .from('otp_verifications')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .eq('id', dbRecordId);
  }

  // Provision user profile and authenticated session
  const sessionResult = await resolveOrProvisionUserSession({
    phone: e164,
    fullName: fullName || 'QPay User',
  });

  await logOtpAuditEvent({
    eventType: 'OTP_VERIFIED',
    phone: e164,
    ipAddress: ip,
  });

  res.status(200).json({
    success: true,
    verified: true,
    message: 'Mobile number verified successfully',
    user: sessionResult.user,
    session: sessionResult.session,
  });
});

/**
 * POST /api/auth/otp/resend
 */
otpRouter.post('/resend', async (req: Request, res: Response): Promise<void> => {
  const parsed = ResendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, code: 'INVALID_REQUEST', error: 'Invalid phone parameter' });
    return;
  }

  const { phone } = parsed.data;
  const validation = validateAndFormatPhone(phone);
  const e164 = validation.isValid && validation.e164 ? validation.e164 : phone.trim();
  const ip = getClientIp(req);

  const rateCheck = await checkSendRateLimit(e164, ip);
  if (!rateCheck.allowed) {
    res.status(429).json({
      success: false,
      code: rateCheck.code,
      error: rateCheck.message,
      retryAfter: rateCheck.retryAfter,
    });
    return;
  }

  const resendResult = await msg91Service.resendOtp(e164);
  if (!resendResult.success) {
    res.status(503).json({
      success: false,
      code: 'PROVIDER_UNAVAILABLE',
      error: resendResult.message || 'Unable to resend OTP at this time',
    });
    return;
  }

  await recordRateEvent(e164, ip, 'resend');
  await logOtpAuditEvent({ eventType: 'OTP_RESENT', phone: e164, ipAddress: ip });

  res.status(200).json({
    success: true,
    message: 'Verification code resent successfully',
    resendCooldown: 60,
  });
});
