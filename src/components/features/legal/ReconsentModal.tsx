import React, { useState } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { useApp } from '../../../state/AppContext';
import { TERMS_VERSION, PRIVACY_VERSION } from '../../../config/legal';
import { PrimaryButton } from '../../PrimaryButton';

export const ReconsentModal: React.FC = () => {
  const { user, updateUser, currentScreen, navigateTo, language, isRtl } = useApp();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only check if user is logged in (has mobile) and has arrived at main screens (like HOME)
  const isPostLogin =
    currentScreen !== 'SPLASH' &&
    currentScreen !== 'ONBOARDING' &&
    currentScreen !== 'MOBILE_NUMBER' &&
    currentScreen !== 'SMS_OTP' &&
    currentScreen !== 'SET_PIN' &&
    currentScreen !== 'PERMISSIONS' &&
    currentScreen !== 'ONBOARDING_KYC' &&
    currentScreen !== 'ONBOARDING_BANK';

  const userTermsVersion = user?.terms_version || user?.termsVersion;
  const needsReconsent = !!user?.mobile && isPostLogin && userTermsVersion !== TERMS_VERSION;

  if (!needsReconsent) {
    return null;
  }

  const handleAccept = async () => {
    if (!agreed || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('qpay_auth_token') : null;
      await fetch('/api/auth/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mobile: user.mobile,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
        }),
      }).catch(() => null);

      // Update state locally
      updateUser({
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_VERSION,
        termsVersion: TERMS_VERSION,
        privacyVersion: PRIVACY_VERSION,
        terms_accepted_at: new Date().toISOString(),
        privacy_accepted_at: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <div
        className="slide-up"
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#111726',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '28px 24px 34px 24px',
          boxSizing: 'border-box',
          color: '#FFFFFF',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(127, 232, 127, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7FE87F',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              {language === 'العربية'
                ? 'تحديث الشروط والخصوصية'
                : 'Terms & Privacy Update'}
            </h3>
            <span
              style={{
                fontSize: '11px',
                color: '#7FE87F',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {language === 'العربية' ? `الإصدار ${TERMS_VERSION}` : `Version ${TERMS_VERSION}`}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#9CA3AF', marginBottom: '20px' }}>
          {language === 'العربية'
            ? 'قمنا بتحديث الشروط والأحكام وسياسة الخصوصية الخاصة بنا لتتوافق مع أحدث المتطلبات التنظيمية للبنك المركزي السعودي (ساما). يرجى مراجعة الوثائق المحدثة والموافقة عليها للمتابعة.'
            : 'We have updated our Terms & Conditions and Privacy Policy to comply with the latest Saudi Central Bank (SAMA) guidelines. Please review and accept the updated terms to continue using AlphPay.'}
        </p>

        {/* Links to documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => navigateTo('TERMS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#182236',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            <span>{language === 'العربية' ? 'الشروط والأحكام المحدثة' : 'View Terms & Conditions'}</span>
            <ExternalLink size={16} color="#7FE87F" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('PRIVACY_POLICY')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#182236',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            <span>{language === 'العربية' ? 'سياسة الخصوصية المحدثة' : 'View Privacy Policy'}</span>
            <ExternalLink size={16} color="#7FE87F" />
          </button>
        </div>

        {/* Consent Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '22px',
            cursor: 'pointer',
            fontSize: '12.5px',
            color: '#E5E7EB',
            lineHeight: '1.5',
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#7FE87F',
              cursor: 'pointer',
              marginTop: '2px',
              flexShrink: 0,
            }}
          />
          <span>
            {language === 'العربية'
              ? 'أوافق على الشروط والأحكام المحدثة وسياسة الخصوصية المنقحة.'
              : 'I acknowledge that I have read and agree to the updated Terms & Conditions and Privacy Policy.'}
          </span>
        </label>

        <PrimaryButton onClick={handleAccept} disabled={!agreed || isSubmitting}>
          {isSubmitting
            ? (language === 'العربية' ? 'جاري التأكيد...' : 'Confirming...')
            : (language === 'العربية' ? 'الموافقة والمتابعة' : 'Accept & Continue')}
        </PrimaryButton>
      </div>
    </div>
  );
};
