import { toMsg91Msisdn } from '../utils/phoneValidator.js';

export interface Msg91SendResult {
  success: boolean;
  requestId?: string;
  type?: string;
  message?: string;
}

export interface Msg91VerifyResult {
  success: boolean;
  type?: string;
  message?: string;
}

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'QTPAY';
const MSG91_OTP_LENGTH = parseInt(process.env.MSG91_OTP_LENGTH || '6', 10);
const MSG91_OTP_EXPIRY_MINUTES = parseInt(process.env.MSG91_OTP_EXPIRY_MINUTES || '10', 10);

// In-memory test store for sandbox development when real MSG91 keys are not configured
const sandboxOtpStore = new Map<string, { otp: string; expiresAt: number }>();

export class Msg91Service {
  private isConfigured(): boolean {
    const authKey = process.env.MSG91_AUTH_KEY || MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID || MSG91_TEMPLATE_ID;
    return Boolean(
      authKey &&
      authKey !== '<placeholder>' &&
      authKey.trim() !== '' &&
      templateId &&
      templateId !== '<placeholder>' &&
      templateId.trim() !== ''
    );
  }

  private isSandbox(): boolean {
    return process.env.OTP_SANDBOX === 'true';
  }

  /**
   * Send OTP via MSG91 API v5
   */
  async sendOtp(e164Phone: string): Promise<Msg91SendResult> {
    const msisdn = toMsg91Msisdn(e164Phone);

    // Sandbox fallback allowed ONLY when process.env.OTP_SANDBOX === 'true'
    if (!this.isConfigured()) {
      if (this.isSandbox()) {
        const testOtp = '582904';
        const expiresAt = Date.now() + MSG91_OTP_EXPIRY_MINUTES * 60 * 1000;
        sandboxOtpStore.set(msisdn, { otp: testOtp, expiresAt });
        console.log(`[MSG91 Sandbox] Sent OTP to ${msisdn}: ${testOtp} (Expires in ${MSG91_OTP_EXPIRY_MINUTES}m)`);

        return {
          success: true,
          requestId: `sandbox_${Date.now()}`,
          message: 'OTP sent in development sandbox mode',
        };
      }

      // Fail closed when MSG91 is not configured and OTP_SANDBOX is not enabled
      return {
        success: false,
        message: 'SMS provider is not configured. Service unavailable.',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: MSG91_AUTH_KEY!,
        },
        body: JSON.stringify({
          template_id: MSG91_TEMPLATE_ID,
          mobile: msisdn,
          sender: MSG91_SENDER_ID,
          otp_length: MSG91_OTP_LENGTH,
          otp_expiry: MSG91_OTP_EXPIRY_MINUTES,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data: any = await response.json();

      // Check for MSG91 type: "error" even on HTTP 200
      if (data.type === 'error' || !response.ok) {
        return {
          success: false,
          type: data.type || 'error',
          message: data.message || 'Failed to send OTP via SMS gateway',
        };
      }

      return {
        success: true,
        requestId: data.request_id || data.message,
        type: data.type || 'success',
      };
    } catch (err: any) {
      console.error('[MSG91 Send Error]', err);
      return {
        success: false,
        message: err.name === 'AbortError' ? 'SMS provider request timed out' : 'SMS gateway connection failed',
      };
    }
  }

  /**
   * Verify OTP via MSG91 API v5
   */
  async verifyOtp(e164Phone: string, otp: string): Promise<Msg91VerifyResult> {
    const msisdn = toMsg91Msisdn(e164Phone);

    // Sandbox / Test fallback allowed ONLY when process.env.OTP_SANDBOX === 'true'
    if (!this.isConfigured()) {
      if (this.isSandbox()) {
        if (otp === '582904') {
          return { success: true, message: 'Verified via master QA test credentials' };
        }
        return {
          success: false,
          message: 'Invalid code. Strict demo access: Please enter the demo OTP shown (582904).',
        };
      }

      // Fail closed when MSG91 is not configured and OTP_SANDBOX is not enabled
      return {
        success: false,
        message: 'SMS provider is not configured. Service unavailable.',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const url = new URL('https://control.msg91.com/api/v5/otp/verify');
      url.searchParams.set('mobile', msisdn);
      url.searchParams.set('otp', otp);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          authkey: MSG91_AUTH_KEY!,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data: any = await response.json();

      if (data.type === 'error' || !response.ok) {
        return {
          success: false,
          type: data.type || 'error',
          message: data.message || 'Invalid verification code',
        };
      }

      return {
        success: true,
        type: data.type || 'success',
        message: data.message,
      };
    } catch (err: any) {
      console.error('[MSG91 Verify Error]', err);
      return {
        success: false,
        message: err.name === 'AbortError' ? 'Verification request timed out' : 'SMS gateway verification failed',
      };
    }
  }

  /**
   * Resend / Retry OTP via MSG91 API v5
   */
  async resendOtp(e164Phone: string): Promise<Msg91SendResult> {
    const msisdn = toMsg91Msisdn(e164Phone);

    if (!this.isConfigured()) {
      return this.sendOtp(e164Phone);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const url = new URL('https://control.msg91.com/api/v5/otp/retry');
      url.searchParams.set('mobile', msisdn);
      url.searchParams.set('retrytype', 'text');

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          authkey: MSG91_AUTH_KEY!,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data: any = await response.json();

      if (data.type === 'error' || !response.ok) {
        return {
          success: false,
          type: data.type || 'error',
          message: data.message || 'Failed to resend verification code',
        };
      }

      return {
        success: true,
        requestId: data.request_id || data.message,
      };
    } catch (err: any) {
      console.error('[MSG91 Retry Error]', err);
      return {
        success: false,
        message: 'SMS gateway retry failed',
      };
    }
  }
}

export const msg91Service = new Msg91Service();
