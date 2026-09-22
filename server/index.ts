/**
 * QPay Express Backend Server
 * Shared backend for Customer + Merchant apps
 * 
 * Routes:
 *   POST /api/auth/otp/send
 *   POST /api/auth/otp/resend
 *   POST /api/auth/otp/verify
 *   GET  /api/me
 *   GET  /api/merchants/:code
 *   POST /api/payments
 *   GET  /api/transactions
 */

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

try {
  (process as any).loadEnvFile?.();
} catch {
  // ignore if .env does not exist or already loaded
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '5000', 10);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || '';
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || '';
const OTP_SANDBOX = process.env.OTP_SANDBOX === 'true';

// Production safety check: refuse to start if sandbox mode is enabled in production
if (OTP_SANDBOX && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: OTP_SANDBOX cannot be enabled in production environment (NODE_ENV=production). Refusing to start.');
}

if (OTP_SANDBOX) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  [SECURITY WARNING] OTP_SANDBOX IS ACTIVE! Real SMS delivery via MSG91 is bypassed. Code 123456 is accepted for all numbers. Do NOT use in production.');
}

// ---------------------------------------------------------------------------
// Supabase clients
// ---------------------------------------------------------------------------
let _supabase: SupabaseClient | null = null;
function getServiceClient(): SupabaseClient {
  if (!_supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
}

const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getServiceClient();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      'https://qpay-merchant.vercel.app',
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    ],
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Rate limiting (simple in-memory for OTP endpoints)
// ---------------------------------------------------------------------------
const otpRateMap = new Map<string, { count: number; resetAt: number }>();
const OTP_RATE_LIMIT = 5; // max per window
const OTP_RATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function checkOtpRate(phone: string): boolean {
  const now = Date.now();
  const entry = otpRateMap.get(phone);
  if (!entry || now > entry.resetAt) {
    otpRateMap.set(phone, { count: 1, resetAt: now + OTP_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= OTP_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// MSG91 helpers
// ---------------------------------------------------------------------------
async function msg91SendOtp(phone: string): Promise<{ success: boolean; message?: string; status?: number }> {
  if (OTP_SANDBOX) {
    console.log(`[OTP_SANDBOX] Simulated OTP sent to ${phone}`);
    return { success: true, message: 'OTP sent (sandbox mode - use 123456)' };
  }
  const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  try {
    const res = await fetch(
      `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${cleanPhone}&authkey=${MSG91_AUTH_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );
    const data = (await res.json()) as any;
    console.log(`[MSG91] Send OTP to ${cleanPhone} response status: ${res.status}, body:`, data);
    const isSuccess = res.ok && res.status >= 200 && res.status < 300 && data.type === 'success';
    return {
      success: isSuccess,
      message: data.message || (isSuccess ? 'OTP sent successfully' : 'Could not send OTP, please try again'),
      status: res.status,
    };
  } catch (err: any) {
    console.error('[MSG91] Send OTP error:', err.message);
    return { success: false, message: err.message || 'Could not send OTP, please try again' };
  }
}

async function msg91ResendOtp(phone: string): Promise<{ success: boolean; message?: string; status?: number }> {
  if (OTP_SANDBOX) {
    return { success: true, message: 'OTP resent (sandbox mode - use 123456)' };
  }
  const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  try {
    const res = await fetch(
      `https://control.msg91.com/api/v5/otp/retry?authkey=${MSG91_AUTH_KEY}&mobile=${cleanPhone}&retrytype=text`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );
    const data = (await res.json()) as any;
    console.log(`[MSG91] Resend OTP to ${cleanPhone} response status: ${res.status}, body:`, data);
    const isSuccess = res.ok && res.status >= 200 && res.status < 300 && data.type === 'success';
    return {
      success: isSuccess,
      message: data.message || (isSuccess ? 'OTP resent successfully' : 'Could not send OTP, please try again'),
      status: res.status,
    };
  } catch (err: any) {
    console.error('[MSG91] Resend OTP error:', err.message);
    return { success: false, message: err.message || 'Could not send OTP, please try again' };
  }
}

async function msg91VerifyOtp(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
  if (OTP_SANDBOX) {
    console.log(`[OTP_SANDBOX] Verifying ${phone} with OTP: ${otp}`);
    if (otp && (otp.length === 6 || otp === '123456')) {
      return { success: true, message: 'OTP verified (sandbox mode)' };
    }
    return { success: false, message: 'Invalid OTP length (expected 6 digits)' };
  }
  const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  try {
    const res = await fetch(
      `https://control.msg91.com/api/v5/otp/verify?authkey=${MSG91_AUTH_KEY}&mobile=${cleanPhone}&otp=${otp}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );
    const data = (await res.json()) as any;
    return { success: data.type === 'success', message: data.message };
  } catch (err: any) {
    console.error('[MSG91] Verify OTP error:', err.message);
    return { success: false, message: err.message };
  }
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------
function signToken(profileId: string, appRole: string): { access_token: string; expires_in: number } {
  const expiresIn = 86400; // 24h
  const payload = {
    sub: profileId,
    role: 'authenticated',
    aud: 'authenticated',
    app_role: appRole,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };
  const access_token = jwt.sign(payload, SUPABASE_JWT_SECRET, { algorithm: 'HS256' });
  return { access_token, expires_in: expiresIn };
}

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------
interface AuthRequest extends express.Request {
  profileId?: string;
  appRole?: string;
}

function authMiddleware(req: AuthRequest, res: express.Response, next: express.NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ['HS256'] }) as any;
    req.profileId = decoded.sub;
    req.appRole = decoded.app_role;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalid or expired' });
  }
}

// ---------------------------------------------------------------------------
// Helper: generate unique merchant code
// ---------------------------------------------------------------------------
async function generateMerchantCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = 'QM' + String(Math.floor(100000 + Math.random() * 900000));
    const { data } = await supabase.from('merchants').select('id').eq('merchant_code', code).maybeSingle();
    if (!data) return code;
  }
  throw new Error('Failed to generate unique merchant code');
}

// ---------------------------------------------------------------------------
// Helper: normalize phone to +966XXXXXXXXX or +91XXXXXXXXXX
// ---------------------------------------------------------------------------
function normalizePhone(phone: string): string {
  let clean = phone.replace(/[\s\-()]+/g, '');

  // Saudi numbers
  if (clean.startsWith('+9660')) clean = '+966' + clean.slice(5);
  else if (clean.startsWith('00966')) clean = '+966' + clean.slice(5);
  else if (clean.startsWith('966')) clean = '+' + clean;
  else if (clean.startsWith('05') && clean.length === 10) clean = '+966' + clean.slice(1);
  else if (clean.startsWith('5') && clean.length === 9) clean = '+966' + clean;

  // Indian numbers
  else if (clean.startsWith('+910')) clean = '+91' + clean.slice(4);
  else if (clean.startsWith('0091')) clean = '+91' + clean.slice(4);
  else if (clean.startsWith('91') && clean.length === 12) clean = '+' + clean;
  else if (clean.startsWith('0') && clean.length === 11 && /^[6-9]/.test(clean.slice(1))) clean = '+91' + clean.slice(1);
  else if (clean.length === 10 && /^[6-9]/.test(clean)) clean = '+91' + clean;

  else if (!clean.startsWith('+')) clean = '+' + clean;
  return clean;
}

function isValidPhone(phone: string): boolean {
  // Saudi: +9665XXXXXXXX (exactly +966 followed by 5 and 8 digits)
  // India: +91[6-9]XXXXXXXXX (exactly +91 followed by 6-9 and 9 digits)
  return /^\+9665\d{8}$/.test(phone) || /^\+91[6-9]\d{9}$/.test(phone);
}

// ===========================================================================
// ROUTES
// ===========================================================================

// POST /api/auth/otp/send
app.post('/api/auth/otp/send', async (req: express.Request, res: express.Response) => {
  try {
    const { phone, role } = req.body;
    if (!phone) {
      res.status(400).json({ error: 'MISSING_PHONE', message: 'Phone number is required' });
      return;
    }
    if (role && !['customer', 'merchant'].includes(role)) {
      res.status(400).json({ error: 'INVALID_ROLE', message: 'Role must be customer or merchant' });
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      res.status(400).json({
        error: 'INVALID_PHONE',
        message: 'Invalid phone number format. Must be a valid Saudi (+966 5XXXXXXXX) or Indian (+91 [6-9]XXXXXXXXX) mobile number.',
      });
      return;
    }

    if (!checkOtpRate(normalizedPhone)) {
      res.status(429).json({ error: 'RATE_LIMITED', message: 'Too many OTP requests. Try again later.' });
      return;
    }

    // Check if phone already exists with a different role
    if (role) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('role')
        .eq('mobile', normalizedPhone)
        .maybeSingle();
      if (existing && existing.role !== role) {
        res.status(409).json({ error: 'ROLE_MISMATCH', message: `This number is registered as a ${existing.role}` });
        return;
      }
    }

    const result = await msg91SendOtp(normalizedPhone);
    if (!result.success) {
      res.status(502).json({
        error: 'OTP_SEND_FAILED',
        message: 'Could not send OTP, please try again',
        details: result.message,
      });
      return;
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err: any) {
    console.error('[/api/auth/otp/send]', err);
    res.status(500).json({ error: 'INTERNAL', message: 'Internal server error' });
  }
});

// POST /api/auth/otp/resend
app.post('/api/auth/otp/resend', async (req: express.Request, res: express.Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: 'MISSING_PHONE', message: 'Phone number is required' });
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      res.status(400).json({
        error: 'INVALID_PHONE',
        message: 'Invalid phone number format. Must be a valid Saudi (+966 5XXXXXXXX) or Indian (+91 [6-9]XXXXXXXXX) mobile number.',
      });
      return;
    }

    if (!checkOtpRate(normalizedPhone)) {
      res.status(429).json({ error: 'RATE_LIMITED', message: 'Too many OTP requests. Try again later.' });
      return;
    }

    const result = await msg91ResendOtp(normalizedPhone);
    if (!result.success) {
      res.status(502).json({
        error: 'OTP_RESEND_FAILED',
        message: 'Could not send OTP, please try again',
        details: result.message,
      });
      return;
    }

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err: any) {
    console.error('[/api/auth/otp/resend]', err);
    res.status(500).json({ error: 'INTERNAL', message: 'Internal server error' });
  }
});

// POST /api/auth/otp/verify
app.post('/api/auth/otp/verify', async (req: express.Request, res: express.Response) => {
  try {
    const { phone, otp, role, fullName, businessName } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'phone and otp are required' });
      return;
    }
    if (String(otp).length !== 6) {
      res.status(400).json({ error: 'INVALID_OTP_LENGTH', message: 'OTP must be 6 digits' });
      return;
    }
    const effectiveRole = role || 'customer';
    if (!['customer', 'merchant'].includes(effectiveRole)) {
      res.status(400).json({ error: 'INVALID_ROLE', message: 'Role must be customer or merchant' });
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      res.status(400).json({
        error: 'INVALID_PHONE',
        message: 'Invalid phone number format. Must be a valid Saudi (+966 5XXXXXXXX) or Indian (+91 [6-9]XXXXXXXXX) mobile number.',
      });
      return;
    }

    // Verify OTP with MSG91
    const verifyResult = await msg91VerifyOtp(normalizedPhone, otp);
    if (!verifyResult.success) {
      res.status(401).json({ error: 'INVALID_OTP', message: verifyResult.message || 'Invalid or expired OTP' });
      return;
    }

    // Find existing profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('mobile', normalizedPhone)
      .maybeSingle();

    if (existingProfile && existingProfile.role !== effectiveRole) {
      res.status(409).json({ error: 'ROLE_MISMATCH', message: `This number is registered as a ${existingProfile.role}` });
      return;
    }

    let profile = existingProfile;

    if (!profile) {
      // Create new profile
      const name = fullName || 'QPay User';
      const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'QP';
      const cleanPhone = normalizedPhone.replace(/\D/g, '');
      const upiId = `${cleanPhone}@sarie`;

      const { data: newProfile, error: insertErr } = await supabase
        .from('profiles')
        .insert({
          mobile: normalizedPhone,
          full_name: name,
          avatar_initials: initials,
          upi_id: upiId,
          role: effectiveRole,
          is_kyc_verified: false,
        })
        .select()
        .single();

      if (insertErr || !newProfile) {
        console.error('[verify] Profile insert error:', insertErr);
        res.status(500).json({ error: 'PROFILE_CREATE_FAILED', message: 'Failed to create profile' });
        return;
      }
      profile = newProfile;

      // Create wallet
      if (effectiveRole === 'customer') {
        // Demo balance of 5000 SAR for new customers
        await supabase.from('wallets').insert({
          profile_id: profile.id,
          balance: 5000.00,
          currency: 'SAR',
        });
      } else if (effectiveRole === 'merchant') {
        // Create merchant record
        const merchantCode = await generateMerchantCode();
        const bName = businessName || name;
        await supabase.from('merchants').insert({
          profile_id: profile.id,
          business_name: bName,
          merchant_code: merchantCode,
        });
        // Merchant wallet starts at 0
        await supabase.from('wallets').insert({
          profile_id: profile.id,
          balance: 0,
          currency: 'SAR',
        });
      }
    }

    // Build response user object
    let merchantInfo: { merchantCode?: string; businessName?: string } = {};
    if (profile.role === 'merchant') {
      const { data: merchant } = await supabase
        .from('merchants')
        .select('merchant_code, business_name')
        .eq('profile_id', profile.id)
        .maybeSingle();
      if (merchant) {
        merchantInfo = {
          merchantCode: merchant.merchant_code,
          businessName: merchant.business_name,
        };
      }
    }

    // Sign JWT
    const session = signToken(profile.id, profile.role);

    res.json({
      success: true,
      user: {
        id: profile.id,
        role: profile.role,
        name: profile.full_name,
        mobile: profile.mobile,
        ...merchantInfo,
      },
      session,
    });
  } catch (err: any) {
    console.error('[/api/auth/otp/verify]', err);
    res.status(500).json({ error: 'INTERNAL', message: 'Internal server error' });
  }
});

// GET /api/me
app.get('/api/me', authMiddleware, async (req: AuthRequest, res: express.Response) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.profileId)
      .single();

    if (!profile) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Profile not found' });
      return;
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance, currency')
      .eq('profile_id', req.profileId)
      .single();

    let merchantData: any = null;
    if (profile.role === 'merchant') {
      const { data: merchant } = await supabase
        .from('merchants')
        .select('merchant_code, business_name')
        .eq('profile_id', req.profileId)
        .maybeSingle();
      merchantData = merchant;
    }

    res.json({
      id: profile.id,
      name: profile.full_name,
      mobile: profile.mobile,
      role: profile.role,
      merchantCode: merchantData?.merchant_code,
      businessName: merchantData?.business_name,
      walletBalance: Number(wallet?.balance || 0),
      walletCurrency: wallet?.currency || 'SAR',
      profile: {
        id: profile.id,
        name: profile.full_name,
        mobile: profile.mobile,
        role: profile.role,
        avatarInitials: profile.avatar_initials,
      },
      wallet: wallet ? { balance: Number(wallet.balance), currency: wallet.currency } : { balance: 0, currency: 'SAR' },
      merchant: merchantData ? {
        merchantCode: merchantData.merchant_code,
        merchant_code: merchantData.merchant_code,
        businessName: merchantData.business_name,
        business_name: merchantData.business_name,
      } : null,
    });
  } catch (err: any) {
    console.error('[/api/me]', err);
    res.status(500).json({ error: 'INTERNAL', message: 'Internal server error' });
  }
});

// GET /api/merchants/:code
app.get('/api/merchants/:code', authMiddleware, async (req: AuthRequest, res: express.Response) => {
  try {
    const code = String(req.params.code || '');
    const { data: merchant } = await supabase
      .from('merchants')
      .select('merchant_code, business_name')
      .eq('merchant_code', code.toUpperCase())
      .maybeSingle();

    if (!merchant) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Merchant not found' });
      return;
    }

    res.json({
      merchantCode: merchant.merchant_code,
      businessName: merchant.business_name,
    });
  } catch (err: any) {
    console.error('[/api/merchants/:code]', err);
    res.status(500).json({ error: 'INTERNAL', message: 'Internal server error' });
  }
});

// POST /api/payments
app.post('/api/payments', authMiddleware, async (req: AuthRequest, res: express.Response) => {
  try {
    if (req.appRole !== 'customer') {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Only customers can make payments' });
      return;
    }

    const { merchantCode, amount, idempotencyKey } = req.body;
    if (!merchantCode || !amount || !idempotencyKey) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'merchantCode, amount, and idempotencyKey are required' });
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 10000) {
      res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Amount must be > 0 and <= 10000' });
      return;
    }
    // Max 2 decimal places
    if (Math.round(numAmount * 100) !== numAmount * 100) {
      res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Amount must have at most 2 decimal places' });
      return;
    }

    // Call process_payment via RPC (service-role client bypasses RLS)
    const { data, error } = await supabase.rpc('process_payment', {
      p_payer: req.profileId,
      p_merchant_code: merchantCode.toUpperCase(),
      p_amount: numAmount,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('INVALID_AMOUNT')) {
        res.status(400).json({
          error: 'INVALID_AMOUNT',
          message: 'Invalid payment amount / مبلغ الدفع غير صالح',
          message_en: 'Invalid payment amount',
          message_ar: 'مبلغ الدفع غير صالح',
        });
        return;
      }
      if (msg.includes('PAYEE_WALLET_NOT_FOUND')) {
        res.status(400).json({
          error: 'PAYEE_WALLET_NOT_FOUND',
          message: 'Merchant wallet not found / محفظة التاجر غير موجودة',
          message_en: 'Merchant wallet not found',
          message_ar: 'محفظة التاجر غير موجودة',
        });
        return;
      }
      if (msg.includes('IDEMPOTENCY_KEY_CONFLICT')) {
        res.status(409).json({
          error: 'IDEMPOTENCY_KEY_CONFLICT',
          message: 'Transaction reference conflict / تعارض في مرجع المعاملة',
          message_en: 'Transaction reference conflict',
          message_ar: 'تعارض في مرجع المعاملة',
        });
        return;
      }
      if (msg.includes('INSUFFICIENT_BALANCE')) {
        res.status(400).json({
          error: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient wallet balance / رصيد المحفظة غير كافٍ',
          message_en: 'Insufficient wallet balance',
          message_ar: 'رصيد المحفظة غير كافٍ',
        });
        return;
      }
      if (msg.includes('INVALID_MERCHANT')) {
        res.status(400).json({
          error: 'INVALID_MERCHANT',
          message: 'Merchant not found / التاجر غير موجود',
          message_en: 'Merchant not found',
          message_ar: 'التاجر غير موجود',
        });
        return;
      }
      if (msg.includes('SELF_PAYMENT')) {
        res.status(400).json({
          error: 'SELF_PAYMENT',
          message: 'Cannot pay yourself / لا يمكن الدفع لحسابك الخاص',
          message_en: 'Cannot pay yourself',
          message_ar: 'لا يمكن الدفع لحسابك الخاص',
        });
        return;
      }
      if (error.code === '23505' || msg.includes('duplicate key') || msg.includes('transactions_order_ref_key')) {
        const { data: existingTx } = await supabase
          .from('transactions')
          .select('*')
          .eq('order_ref', idempotencyKey)
          .maybeSingle();

        if (existingTx && existingTx.payer_profile_id === req.profileId) {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('profile_id', req.profileId)
            .single();

          res.json({
            transaction: existingTx,
            balance: wallet?.balance ?? 0,
          });
          return;
        }
      }
      console.error('[/api/payments] RPC error:', error);
      res.status(500).json({
        error: 'PAYMENT_FAILED',
        message: 'Payment processing failed / فشلت عملية معالجة الدفع',
        message_en: 'Payment processing failed',
        message_ar: 'فشلت عملية معالجة الدفع',
      });
      return;
    }

    const transaction = Array.isArray(data) ? data[0] : data;

    // Fetch updated balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('profile_id', req.profileId)
      .single();

    res.json({
      transaction,
      balance: wallet?.balance ?? 0,
    });
  } catch (err: any) {
    console.error('[/api/payments]', err);
    res.status(500).json({ error: 'INTERNAL', message: 'Internal server error' });
  }
});

// GET /api/transactions
app.get('/api/transactions', authMiddleware, async (req: AuthRequest, res: express.Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`payer_profile_id.eq.${req.profileId},payee_profile_id.eq.${req.profileId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[/api/transactions] Query error:', error);
      res.status(500).json({ error: 'QUERY_FAILED', message: 'Failed to fetch transactions' });
      return;
    }

    res.json({ transactions: data || [] });
  } catch (err: any) {
    console.error('[/api/transactions]', err);
    res.status(500).json({ error: 'INTERNAL', message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Start server (only when run directly, not when imported by Vercel)
// ---------------------------------------------------------------------------
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`[QPay Server] Running on http://localhost:${PORT}`);
    console.log(`[QPay Server] Supabase: ${SUPABASE_URL ? '✓ configured' : '✗ missing'}`);
    console.log(`[QPay Server] JWT Secret: ${SUPABASE_JWT_SECRET ? '✓ configured' : '✗ missing'}`);
    console.log(`[QPay Server] MSG91: ${MSG91_AUTH_KEY ? '✓ configured' : '✗ missing'}`);
  });
}

export default app;
