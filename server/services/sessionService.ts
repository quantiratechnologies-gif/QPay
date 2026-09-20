import { getSupabaseServer } from './supabaseServer.js';

export interface UserSessionResult {
  user: {
    id: string;
    mobile: string;
    name: string;
    avatarInitials: string;
    upiId: string;
    email?: string;
    role: string;
  };
  session?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
  };
}

export async function resolveOrProvisionUserSession(params: {
  phone: string;
  fullName?: string;
}): Promise<UserSessionResult> {
  const { phone, fullName = 'QPay User' } = params;
  const cleanPhone = phone.trim();
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'QP';

  const defaultUser = {
    id: `usr_${Date.now()}`,
    mobile: cleanPhone,
    name: fullName,
    avatarInitials: initials,
    upiId: `${cleanPhone.slice(-4)}@sarie`,
    email: `${cleanPhone.replace(/[^0-9]/g, '').slice(-6)}@qpay.sa`,
    role: 'customer',
  };

  const supabase = getSupabaseServer();
  if (!supabase) {
    // Local / offline mock session token
    return {
      user: defaultUser,
      session: {
        access_token: `mock_jwt_token_${Buffer.from(cleanPhone).toString('base64')}`,
        expires_in: 86400,
        token_type: 'bearer',
      },
    };
  }

  try {
    // 1. Check if profile exists by mobile
    const { data: existingProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('mobile', cleanPhone)
      .maybeSingle();

    if (existingProfile && !profileErr) {
      // Mark verified
      await supabase
        .from('profiles')
        .update({
          phone_verified: true,
          phone_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id);

      return {
        user: {
          id: existingProfile.id,
          mobile: existingProfile.mobile,
          name: existingProfile.full_name || defaultUser.name,
          avatarInitials: existingProfile.avatar_initials || defaultUser.avatarInitials,
          upiId: existingProfile.upi_id || defaultUser.upiId,
          email: existingProfile.email || defaultUser.email,
          role: existingProfile.role || 'customer',
        },
        session: {
          access_token: `sb_session_${existingProfile.id}_${Date.now()}`,
          expires_in: 86400,
          token_type: 'bearer',
        },
      };
    }

    // 2. Provision new profile in Supabase
    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .insert({
        mobile: cleanPhone,
        full_name: fullName,
        avatar_initials: initials,
        upi_id: defaultUser.upiId,
        email: defaultUser.email,
        role: 'customer',
        is_kyc_verified: false,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (newProfile && !insertErr) {
      return {
        user: {
          id: newProfile.id,
          mobile: newProfile.mobile,
          name: newProfile.full_name,
          avatarInitials: newProfile.avatar_initials,
          upiId: newProfile.upi_id,
          email: newProfile.email,
          role: newProfile.role,
        },
        session: {
          access_token: `sb_session_${newProfile.id}_${Date.now()}`,
          expires_in: 86400,
          token_type: 'bearer',
        },
      };
    }
  } catch (err) {
    console.error('[SessionService] Error provisioning session:', err);
  }

  return {
    user: defaultUser,
    session: {
      access_token: `mock_jwt_token_${Date.now()}`,
      expires_in: 86400,
      token_type: 'bearer',
    },
  };
}
