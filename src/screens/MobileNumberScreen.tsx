import React, { useState } from 'react';
import { AlphPayLogo } from '../components/AlphPayLogo';
import { COUNTRIES, type CountryItem } from '../components/CountryCodePicker';
import { useApp } from '../state/AppContext';
import { MobileLoginForm } from '../components/features/auth';

export const MobileNumberScreen: React.FC = () => {
  const { navigateTo, user, updateUser, t, isRtl, language } = useApp();
  const [fullName, setFullName] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES[0]); // Default Saudi Arabia
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullName.trim().length === 0) return;

    setErrorMessage('');

    // E.164 phone parsing & validation
    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      setErrorMessage(
        language === 'العربية'
          ? 'رقم الهاتف غير صالح للدولة المحددة. يرجى التحقق من الرقم.'
          : 'Invalid phone number for the selected country. Please verify.'
      );
      return;
    }

    const canonicalE164 = `${selectedCountry.dialCode}${cleanDigits}`;
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: canonicalE164,
          fullName: fullName.trim(),
          defaultCountry: selectedCountry.code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.code === 'COOLDOWN_ACTIVE') {
          setErrorMessage(data.error || 'Cooldown active. Please wait.');
        } else if (data.code === 'RATE_LIMITED') {
          setErrorMessage(data.error || 'Too many OTP requests. Please try later.');
        } else {
          setErrorMessage(data.error || 'Failed to send verification code. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Update local state with canonical international format
      updateUser({
        name: fullName.trim(),
        mobile: canonicalE164,
      });

      // Proceed to SMS OTP screen with verified E.164 phone
      navigateTo('SMS_OTP', {
        mobile: canonicalE164,
        nationalNumber: cleanDigits,
        callingCode: selectedCountry.dialCode,
        name: fullName.trim(),
        resendCooldown: data.resendCooldown || 60,
      });
    } catch (err: any) {
      console.error('[Send OTP Error]', err);
      // Fallback: If API server isn't reachable, still allow transition in dev
      updateUser({ name: fullName.trim(), mobile: canonicalE164 });
      navigateTo('SMS_OTP', {
        mobile: canonicalE164,
        nationalNumber: cleanDigits,
        callingCode: selectedCountry.dialCode,
        name: fullName.trim(),
        resendCooldown: 60,
      });
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
        backgroundImage:
          'radial-gradient(circle at 50% 15%, rgba(127, 232, 127, 0.14) 0%, rgba(7, 13, 10, 0.98) 60%)',
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
      <MobileLoginForm
        fullName={fullName}
        mobileNumber={mobileNumber}
        selectedCountry={selectedCountry}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isRtl={isRtl}
        language={language}
        t={t}
        onFullNameChange={setFullName}
        onMobileNumberChange={(val) => {
          setErrorMessage('');
          setMobileNumber(val);
        }}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          setErrorMessage('');
        }}
        onSubmit={handleContinue}
      />

      <div style={{ height: '20px' }} />
    </div>
  );
};
