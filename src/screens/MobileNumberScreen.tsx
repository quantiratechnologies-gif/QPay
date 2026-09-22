import React, { useState } from 'react';
import { User as UserIcon, ArrowRight, Loader, ChevronDown } from 'lucide-react';
import { AlphPayLogo } from '../components/AlphPayLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { authService } from '../services/authService';

export const MobileNumberScreen: React.FC = () => {
  const { navigateTo, updateUser, t, isRtl, language } = useApp();
  const [fullName, setFullName] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+966');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const cleanDigits = (() => {
    let digits = mobileNumber.replace(/\D/g, '');
    if (countryCode === '+966') {
      if (digits.startsWith('0')) digits = digits.slice(1);
      return digits.slice(0, 9);
    } else if (countryCode === '+91') {
      if (digits.startsWith('0')) digits = digits.slice(1);
      return digits.slice(0, 10);
    }
    return digits;
  })();

  const mismatchWarning = (() => {
    if (!cleanDigits) return null;
    if (countryCode === '+966' && !cleanDigits.startsWith('5')) {
      return language === 'العربية'
        ? '⚠️ الأرقام السعودية تبدأ بـ 5. للأرقام الهندية اختر 🇮🇳 +91 أعلاه.'
        : '⚠️ Saudi numbers must start with 5. For Indian numbers, select 🇮🇳 +91 above.';
    }
    if (countryCode === '+91' && !/^[6-9]/.test(cleanDigits)) {
      return language === 'العربية'
        ? '⚠️ الأرقام الهندية تبدأ بـ 6-9. للأرقام السعودية اختر 🇸🇦 +966 أعلاه.'
        : '⚠️ Indian numbers must start with 6-9. For Saudi numbers, select 🇸🇦 +966 above.';
    }
    return null;
  })();

  const isPhoneValid = countryCode === '+966'
    ? /^5\d{8}$/.test(cleanDigits)
    : /^[6-9]\d{9}$/.test(cleanDigits);

  const isFormValid = isPhoneValid && fullName.trim().length > 0 && !isLoading;

  const handleContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!fullName.trim()) {
      setError(language === 'العربية' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full legal name');
      return;
    }

    if (countryCode === '+966') {
      if (!cleanDigits.startsWith('5') || cleanDigits.length !== 9) {
        setError(
          language === 'العربية'
            ? 'رقم الجوال السعودي غير صحيح. يجب أن يبدأ بالرقم 5 ويتكون من 9 أرقام (مثال: 50 123 4567). للأرقام الهندية يرجى اختيار 🇮🇳 +91.'
            : 'Invalid Saudi mobile number. Must start with 5 and be 9 digits (e.g. 50 123 4567). For Indian numbers, select 🇮🇳 +91.'
        );
        return;
      }
    } else if (countryCode === '+91') {
      if (!/^[6-9]/.test(cleanDigits) || cleanDigits.length !== 10) {
        setError(
          language === 'العربية'
            ? 'رقم الجوال الهندي غير صحيح. يجب أن يبدأ بالأرقام 6-9 ويتكون من 10 أرقام (مثال: 98765 43210). للأرقام السعودية يرجى اختيار 🇸🇦 +966.'
            : 'Invalid Indian mobile number. Must start with 6-9 and be 10 digits (e.g. 98765 43210). For Saudi numbers, select 🇸🇦 +966.'
        );
        return;
      }
    }

    if (!isPhoneValid) return;

    setError('');
    setIsLoading(true);

    const phone = `${countryCode}${cleanDigits}`;
    try {
      await authService.sendOtp(phone, 'customer');
      updateUser({ name: fullName.trim(), mobile: `${countryCode} ${cleanDigits}` });
      navigateTo('SMS_OTP', { mobile: cleanDigits, phone, countryCode, name: fullName.trim() });
    } catch (err: any) {
      if (err.code === 'ROLE_MISMATCH') {
        setError(
          language === 'العربية'
            ? 'هذا الرقم مسجل كحساب تاجر. استخدم تطبيق التاجر للدخول.'
            : 'This number is registered as a merchant account. Use the merchant app to sign in.'
        );
      } else if (err.code === 'SMS_UNAVAILABLE' || (err.message && err.message.includes('Saudi SMS'))) {
        setError(
          language === 'العربية'
            ? 'الرسائل النصية للسعودية غير متوفرة حالياً'
            : (err.message || 'Saudi SMS not available yet')
        );
      } else {
        setError(
          language === 'العربية'
            ? 'تعذر إرسال رمز التحقق. حاول مجدداً.'
            : err.message || 'Could not send OTP, please try again'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100vh',
        backgroundColor: '#070D0A',
        backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(127, 232, 127, 0.14) 0%, rgba(7, 13, 10, 0.98) 60%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '50px 24px 36px 24px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* Top Center: App Brand Logo */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          position: 'relative',
        }}
      >
        <AlphPayLogo variant="horizontal" size={32} themeMode="dark" />
      </div>

      {/* Main Form: Input Fields & Action Button */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          margin: '0 auto',
          backgroundColor: 'rgba(21, 21, 36, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '24px 20px',
          boxSizing: 'border-box',
        }}
      >

        <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name Input */}
          <div>
            <label
              htmlFor="fullname-input"
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#A2A2BA',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              {language === 'العربية' ? 'الاسم الكامل (حسب الهوية الوطنية / الإقامة)' : 'Full Name (as per National ID / Iqama)'}
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#151524',
                border: '1px solid #2C2C44',
                borderRadius: '14px',
                padding: '14px 16px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <UserIcon size={18} color="#7FE87F" style={{ marginInlineEnd: '12px', flexShrink: 0 }} />
              <input
                id="fullname-input"
                type="text"
                maxLength={60}
                value={fullName}
                onChange={(e) => setFullName(e.target.value.slice(0, 60))}
                placeholder={language === 'العربية' ? 'فهد الحربي' : 'Fahad Al-Harbi'}
                required
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Mobile Number Input with Country Selector */}
          <div>
            <label
              htmlFor="mobile-input"
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#A2A2BA',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              {language === 'العربية' ? 'رقم الجوال' : (countryCode === '+91' ? 'Indian Mobile Number' : 'Saudi Mobile Number')}
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#151524',
                border: '1px solid #2C2C44',
                borderRadius: '14px',
                padding: '14px 16px',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Country Code Selector Pill */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  paddingInlineEnd: '10px',
                  marginInlineEnd: '10px',
                  borderInlineEnd: '1px solid #2C2C44',
                }}
              >
                <select
                  id="country-select"
                  aria-label="Country Code"
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setMobileNumber('');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    paddingInlineEnd: '18px',
                    direction: 'ltr',
                  }}
                >
                  <option value="+966" style={{ background: '#151524', color: '#FFF' }}>🇸🇦 +966</option>
                  <option value="+91" style={{ background: '#151524', color: '#FFF' }}>🇮🇳 +91</option>
                </select>
                <ChevronDown size={14} color="#7FE87F" style={{ position: 'absolute', right: '4px', pointerEvents: 'none' }} />
              </div>

              <input
                id="mobile-input"
                type="tel"
                value={
                  countryCode === '+966'
                    ? (cleanDigits.length <= 2
                        ? cleanDigits
                        : cleanDigits.length <= 5
                        ? `${cleanDigits.slice(0, 2)} ${cleanDigits.slice(2)}`
                        : `${cleanDigits.slice(0, 2)} ${cleanDigits.slice(2, 5)} ${cleanDigits.slice(5)}`)
                    : (cleanDigits.length <= 5
                        ? cleanDigits
                        : `${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`)
                }
                onChange={(e) => {
                  let raw = e.target.value;
                  setError('');
                  // Auto-switch country if user pasted +91 or +966 prefix
                  if (raw.includes('+91') || raw.startsWith('0091')) {
                    setCountryCode('+91');
                    let val = raw.replace(/\D/g, '');
                    if (val.startsWith('0091')) val = val.slice(4);
                    else if (val.startsWith('91')) val = val.slice(2);
                    if (val.startsWith('0')) val = val.slice(1);
                    setMobileNumber(val.slice(0, 10));
                    return;
                  }
                  if (raw.includes('+966') || raw.startsWith('00966')) {
                    setCountryCode('+966');
                    let val = raw.replace(/\D/g, '');
                    if (val.startsWith('00966')) val = val.slice(5);
                    else if (val.startsWith('966')) val = val.slice(3);
                    if (val.startsWith('0')) val = val.slice(1);
                    setMobileNumber(val.slice(0, 9));
                    return;
                  }

                  let val = raw.replace(/\D/g, '');
                  if (countryCode === '+966') {
                    if (val.startsWith('00966')) val = val.slice(5);
                    else if (val.startsWith('966')) val = val.slice(3);
                    if (val.startsWith('0')) val = val.slice(1);
                    val = val.slice(0, 9);
                  } else if (countryCode === '+91') {
                    if (val.startsWith('0091')) val = val.slice(4);
                    else if (val.startsWith('91') && val.length > 10) val = val.slice(2);
                    if (val.startsWith('0')) val = val.slice(1);
                    val = val.slice(0, 10);
                  }
                  setMobileNumber(val);
                }}
                placeholder={countryCode === '+91' ? '98765 43210' : '50 123 4567'}
                maxLength={countryCode === '+91' ? 11 : 12}
                required
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  width: '100%',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.05em',
                  direction: 'ltr',
                  textAlign: isRtl ? 'right' : 'left',
                }}
              />
            </div>
            {/* Live Country / Format Mismatch Warning */}
            {mismatchWarning && (
              <div
                style={{
                  marginTop: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#FBBF24',
                  lineHeight: '1.4',
                }}
              >
                {mismatchWarning}
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* Primary Submit Button */}
          <div style={{ marginTop: '6px' }}>
            <PrimaryButton
              type="submit"
              disabled={!isFormValid}
            >
              {isLoading ? (
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  {t('auth.get_otp', 'Get OTP & Verify')}{' '}
                  <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                </>
              )}
            </PrimaryButton>
          </div>
        </form>
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
};
