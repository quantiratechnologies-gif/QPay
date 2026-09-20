import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, UserCheck, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';

type KycStep = 'FORM' | 'VERIFYING' | 'CERTIFIED';

export const OnboardingKycScreen: React.FC = () => {
  const { navigateTo, goBack, setIsKycVerified, kycData, isRtl, language } = useApp();

  const [step, setStep] = useState<KycStep>('FORM');
  const [nationalId, setNationalId] = useState(kycData?.nationalId || '');
  const [dob, setDob] = useState(kycData?.dob || '');
  const [errorMsg, setErrorMsg] = useState('');

  const validateDob = (dobStr: string): string | null => {
    if (!dobStr || dobStr.trim() === '') {
      return language === 'العربية' ? 'يرجى إدخال تاريخ الميلاد.' : 'Please enter your date of birth.';
    }
    const birthDate = new Date(dobStr);
    if (isNaN(birthDate.getTime())) {
      return language === 'العربية' ? 'يرجى إدخال تاريخ ميلاد صحيح.' : 'Please enter a valid date of birth.';
    }
    const today = new Date();
    if (birthDate > today) {
      return language === 'العربية'
        ? 'لا يمكن أن يكون تاريخ الميلاد في المستقبل.'
        : 'Date of birth cannot be in the future.';
    }
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return language === 'العربية'
        ? 'يجب أن يكون عمرك ١٨ عاماً أو أكثر لإتمام توثيق الهوية (متطلبات البنك المركزي).'
        : 'You must be at least 18 years old to complete verification (SAMA regulation).';
    }
    if (age > 120) {
      return language === 'العربية' ? 'يرجى إدخال تاريخ ميلاد صحيح.' : 'Please enter a valid date of birth.';
    }
    return null;
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = nationalId.replace(/\D/g, '');
    if (!/^[12]\d{9}$/.test(cleanId)) {
      setErrorMsg(
        language === 'العربية'
          ? 'يرجى إدخال رقم هوية وطنية صحيح يبدأ بـ ١ أو ٢ ومكون من ١٠ أرقام.'
          : 'Please enter a valid 10-digit National ID starting with 1 or 2.'
      );
      return;
    }

    const dobError = validateDob(dob);
    if (dobError) {
      setErrorMsg(dobError);
      return;
    }

    setErrorMsg('');
    setStep('VERIFYING');
    setTimeout(() => {
      setIsKycVerified(true, {
        nationalId,
        dob,
        verifiedAt: new Date().toLocaleDateString('en-GB'),
      });
      setStep('CERTIFIED');
    }, 750);
  };

  const handleContinueToBank = () => {
    navigateTo('ONBOARDING_BANK');
  };

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#070D0A',
        backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(127, 232, 127, 0.14) 0%, rgba(7, 13, 10, 0.98) 60%)',
        minHeight: '100vh',
        paddingBottom: '40px',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppHeader
        title={language === 'العربية' ? 'توثيق الهوية' : 'Identity Verification'}
        showBack={true}
        onBack={goBack}
        showSettings={false}
      />

      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
        <div
          className="main-card fade-in"
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '24px',
            padding: '24px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'none',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Identity Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                backgroundColor: 'var(--brand-green-tint)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} color="var(--brand-green)" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                {language === 'العربية' ? 'توثيق الهوية' : 'Verify Identity'}
              </h3>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, marginTop: '2px', display: 'block' }}>
                {language === 'العربية' ? 'توثيق سريع عبر منصة أبشر' : 'Quick verification with Absher'}
              </span>
            </div>
          </div>

          {/* STEP 1: FORM */}
          {step === 'FORM' && (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* National ID Input */}
              <div>
                <label
                  htmlFor="onboarding-national-id"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  {language === 'العربية' ? 'رقم الهوية الوطنية / الإقامة' : 'National ID / Iqama'}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px',
                    padding: '13px 16px',
                    gap: '12px',
                  }}
                >
                  <UserCheck size={18} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                  <input
                    id="onboarding-national-id"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10XXXXXXXX"
                    required
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      flex: 1,
                      minWidth: 0,
                      fontVariantNumeric: 'tabular-nums',
                      direction: 'ltr',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="onboarding-dob"
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  {language === 'العربية' ? 'تاريخ الميلاد' : 'Date of Birth'}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px',
                    padding: '13px 16px',
                    gap: '12px',
                  }}
                >
                  <Calendar size={18} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                  <input
                    id="onboarding-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => {
                      setErrorMsg('');
                      setDob(e.target.value);
                    }}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    min="1900-01-01"
                    required
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      flex: 1,
                      minWidth: 0,
                      colorScheme: 'dark',
                    }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div style={{ fontSize: '12px', color: '#FF4757', fontWeight: 700 }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={nationalId.length < 10 || !dob}
                className="action-btn interactive-tap"
                style={{
                  marginTop: '6px',
                  width: '100%',
                  padding: '15px',
                  backgroundColor: nationalId.length >= 10 && dob ? 'var(--brand-green)' : '#1f293d',
                  color: nationalId.length >= 10 && dob ? 'var(--brand-green-ink)' : '#6b7280',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: nationalId.length >= 10 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{language === 'العربية' ? 'توثيق الهوية ومتابعة' : 'Verify & Continue'}</span>
                <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
              </button>
            </form>
          )}

          {/* STEP 2: VERIFYING */}
          {step === 'VERIFYING' && (
            <div style={{ padding: '36px 10px', textAlign: 'center' }} className="fade-in">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: '1.5px solid var(--brand-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Loader2 size={32} color="var(--brand-green)" className="animate-spin" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                {language === 'العربية' ? 'جاري التحقق من الهوية الرقمية...' : 'Verifying Digital Identity...'}
              </h4>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                {language === 'العربية' ? 'المطابقة المباشرة مع السجل الوطني الموحد' : 'Matching records with national registry'}
              </p>
            </div>
          )}

          {/* STEP 3: CERTIFIED CONFIRMATION */}
          {step === 'CERTIFIED' && (
            <div className="fade-in" style={{ textAlign: 'center', padding: '10px 4px 4px 4px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: '1.5px solid var(--brand-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <CheckCircle2 size={36} color="var(--brand-green)" />
              </div>

              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
                {language === 'العربية' ? 'تم توثيق الهوية بنجاح' : 'Identity Verified'}
              </h4>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  padding: '16px',
                  marginBottom: '20px',
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'رقم الهوية' : 'National ID'}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>
                    {nationalId}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'حالة التوثيق' : 'Status'}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--brand-green)' }}>
                    {language === 'العربية' ? 'موثق بنجاح' : 'Verified'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueToBank}
                className="action-btn interactive-tap"
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: 'var(--brand-green)',
                  color: 'var(--brand-green-ink)',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'none',
                }}
              >
                <span>{language === 'العربية' ? 'متابعة لربط الحساب البنكي' : 'Continue to Link Bank'}</span>
                <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
