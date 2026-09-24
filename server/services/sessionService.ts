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
    terms_version?: string;
    privacy_version?: string;
    termsVersion?: string;
    privacyVersion?: string;
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
  termsVersion?: string;
  privacyVersion?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<UserSessionResult> {
  const { phone, fullName = 'QPay User', termsVersion, privacyVersion, ipAddress, userAgent } = params;
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
    terms_version: termsVersion,
    privacy_version: privacyVersion,
    termsVersion: termsVersion,
    privacyVersion: privacyVersion,
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
    const nowIso = new Date().toISOString();

    // 1. Check if profile exists by mobile
    const { data: existingProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('mobile', cleanPhone)
      .maybeSingle();

    if (existingProfile && !profileErr) {
      const updateData: Record<string, any> = {
        phone_verified: true,
        phone_verified_at: nowIso,
        updated_at: nowIso,
      };

      if (termsVersion) {
        updateData.terms_accepted_at = nowIso;
        updateData.terms_version = termsVersion;
      }
      if (privacyVersion) {
        updateData.privacy_accepted_at = nowIso;
        updateData.privacy_version = privacyVersion;
      }
      if (ipAddress) {
        updateData.consent_ip = ipAddress;
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', existingProfile.id);

      // Append to consent_audit_log
      if (termsVersion || privacyVersion) {
        const auditRows = [];
        if (termsVersion) {
          auditRows.push({
            profile_id: existingProfile.id,
            document_type: 'TERMS',
            version: termsVersion,
            accepted_at: nowIso,
            ip_address: ipAddress || 'unknown',
            user_agent: userAgent || 'unknown',
          });
        }
        if (privacyVersion) {
          auditRows.push({
            profile_id: existingProfile.id,
            document_type: 'PRIVACY_POLICY',
            version: privacyVersion,
            accepted_at: nowIso,
            ip_address: ipAddress || 'unknown',
            user_agent: userAgent || 'unknown',
          });
        }
        try {
          await supabase.from('consent_audit_log').insert(auditRows);
        } catch (err: any) {
          console.warn('[ConsentAuditLog] Audit log insert warning:', err);
        }
      }

      return {
        user: {
          id: existingProfile.id,
          mobile: existingProfile.mobile,
          name: existingProfile.full_name || defaultUser.name,
          avatarInitials: existingProfile.avatar_initials || defaultUser.avatarInitials,
          upiId: existingProfile.upi_id || defaultUser.upiId,
          email: existingProfile.email || defaultUser.email,
          role: existingProfile.role || 'customer',
          terms_version: termsVersion || existingProfile.terms_version,
          privacy_version: privacyVersion || existingProfile.privacy_version,
          termsVersion: termsVersion || existingProfile.terms_version,
          privacyVersion: privacyVersion || existingProfile.privacy_version,
        },
        session: {
          access_token: `sb_session_${existingProfile.id}_${Date.now()}`,
          expires_in: 86400,
          token_type: 'bearer',
        },
      };
    }

    // 2. Provision new profile in Supabase
    const insertData: Record<string, any> = {
      mobile: cleanPhone,
      full_name: fullName,
      avatar_initials: initials,
      upi_id: defaultUser.upiId,
      email: defaultUser.email,
      role: 'customer',
      is_kyc_verified: false,
      phone_verified: true,
      phone_verified_at: nowIso,
    };

    if (termsVersion) {
      insertData.terms_accepted_at = nowIso;
      insertData.terms_version = termsVersion;
    }
    if (privacyVersion) {
      insertData.privacy_accepted_at = nowIso;
      insertData.privacy_version = privacyVersion;
    }
    if (ipAddress) {
      insertData.consent_ip = ipAddress;
    }

    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .insert(insertData)
      .select()
      .single();

    if (newProfile && !insertErr) {
      if (termsVersion || privacyVersion) {
        const auditRows = [];
        if (termsVersion) {
          auditRows.push({
            profile_id: newProfile.id,
            document_type: 'TERMS',
            version: termsVersion,
            accepted_at: nowIso,
            ip_address: ipAddress || 'unknown',
            user_agent: userAgent || 'unknown',
          });
        }
        if (privacyVersion) {
          auditRows.push({
            profile_id: newProfile.id,
            document_type: 'PRIVACY_POLICY',
            version: privacyVersion,
            accepted_at: nowIso,
            ip_address: ipAddress || 'unknown',
            user_agent: userAgent || 'unknown',
          });
        }
        try {
          await supabase.from('consent_audit_log').insert(auditRows);
        } catch (err: any) {
          console.warn('[ConsentAuditLog] Audit log insert warning:', err);
        }
      }

      return {
        user: {
          id: newProfile.id,
          mobile: newProfile.mobile,
          name: newProfile.full_name,
          avatarInitials: newProfile.avatar_initials,
          upiId: newProfile.upi_id,
          email: newProfile.email,
          role: newProfile.role,
          terms_version: termsVersion,
          privacy_version: privacyVersion,
          termsVersion: termsVersion,
          privacyVersion: privacyVersion,
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
