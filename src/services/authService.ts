/**
 * QPay Auth Service
 * Calls the real Express API for OTP and user data.
 */

import { session, SESSION_KEYS } from './sessionStorage';
import { API_BASE } from './apiConfig';

export interface AuthUser {
  id: string;
  role: string;
  name: string;
  mobile: string;
  merchantCode?: string;
  businessName?: string;
}

export interface AuthSession {
  access_token: string;
  expires_in: number;
}

export interface VerifyOtpResult {
  success: boolean;
  user: AuthUser;
  session: AuthSession;
}

export interface MeResponse {
  profile: {
    id: string;
    name: string;
    mobile: string;
    role: string;
    avatarInitials: string;
  };
  wallet: {
    balance: number;
    currency: string;
  };
  merchant?: {
    merchant_code: string;
    business_name: string;
  } | null;
}

function getAuthHeaders(): Record<string, string> {
  const token = session.get(SESSION_KEYS.ACCESS_TOKEN);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export const authService = {
  async sendOtp(phone: string, role: 'customer' | 'merchant' = 'customer'): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role }),
    });
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data.message || 'Failed to send OTP'), { code: data.error });
  },

  async resendOtp(phone: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/otp/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data.message || 'Failed to resend OTP'), { code: data.error });
  },

  async verifyOtp(params: {
    phone: string;
    otp: string;
    role?: string;
    fullName?: string;
    businessName?: string;
  }): Promise<VerifyOtpResult> {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data.message || 'Verification failed'), { code: data.error });
    return data as VerifyOtpResult;
  },

  async getMe(): Promise<MeResponse> {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw Object.assign(new Error(data.message || 'Failed to fetch profile'), { code: data.error });
    }
    return res.json();
  },

  storeSession(user: AuthUser, token: string): void {
    session.set(SESSION_KEYS.ACCESS_TOKEN, token);
    session.set(SESSION_KEYS.USER, JSON.stringify(user));
  },

  loadSession(): { user: AuthUser; token: string } | null {
    const token = session.get(SESSION_KEYS.ACCESS_TOKEN);
    const userStr = session.get(SESSION_KEYS.USER);
    if (!token || !userStr) return null;
    try {
      return { user: JSON.parse(userStr) as AuthUser, token };
    } catch {
      return null;
    }
  },

  clearSession(): void {
    session.clear();
  },
};
