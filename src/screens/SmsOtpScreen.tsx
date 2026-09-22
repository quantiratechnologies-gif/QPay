import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Loader } from 'lucide-react';
import { AlphPayLogo } from '../components/AlphPayLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { toArabicNumerals } from '../utils/i18n';
import { authService } from '../services/authService';
import { setRealtimeAuth } from '../services/supabaseClient';

export const SmsOtpScreen: React.FC = () => {
  const { navigateTo, screenParams, goBack, t, isRtl, language, updateUser, setAuthToken } = useApp();
  const mobile = screenParams.mobile || '';
  const phone = screenParams.phone || (mobile.startsWith('+') ? mobile : `+966${mobile}`);
  const fullName = screenParams.name || '';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(28);
  const [isResent, setIsResent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    setErrorMsg('');
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  const isComplete = otp.every((digit) => digit.length > 0);

  const handleVerify = async () => {
    if (!isComplete || isLoading) return;
    setErrorMsg('');
    setIsLoading(true);

    const enteredCode = otp.join('');
    try {
      const result = await authService.verifyOtp({
        phone,
        otp: enteredCode,
        role: 'customer',
        fullName,
      });

      // Store session
      authService.storeSession(result.user, result.session.access_token);

      // Set Realtime auth
      setRealtimeAuth(result.session.access_token);

      // Update app state
      updateUser({
        id: result.user.id,
        name: result.user.name,
        mobile: result.user.mobile,
        role: result.user.role,
        avatarInitials: result.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'QP',
        upiId: '',
        email: '',
      });
      setAuthToken(result.session.access_token, result.user.id);

      const hasPin = typeof window !== 'undefined' ? localStorage.getItem('qpay_user_pin') : null;
      if (!hasPin) {
        navigateTo('SET_PIN');
      } else {
        navigateTo('HOME');
      }
    } catch (err: any) {
      setErrorMsg(
        language === 'العربية'
          ? 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى.'
          : err.message || 'Invalid verification code. Please try again.'
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await authService.resendOtp(phone);
      setTimer(30);
      setIsResent(true);
      setTimeout(() => setIsResent(false), 3000);
    } catch (err: any) {
      setErrorMsg(
        language === 'العربية'
          ? 'تعذر إعادة إرسال الرمز. حاول مجدداً.'
          : err.message || 'Failed to resend OTP. Please try again.'
      );
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
        }}
      >
        <AlphPayLogo variant="horizontal" size={32} themeMode="dark" />
      </div>

      {/* Main OTP Verification Form */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          margin: '0 auto',
          backgroundColor: '#111726',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '24px 20px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
            {t('auth.enter_otp', 'Enter 6-Digit Code')}
          </h2>
          <p style={{ fontSize: '13px', color: '#A2A2BA', margin: '0 0 10px 0' }}>
            {t('auth.otp_sent_to', 'Sent via SMS to')}{' '}
            <span style={{ color: 'var(--brand-green, #7FE87F)', fontWeight: 700 }} dir="ltr">
              {phone || `+966 ${mobile}`}
            </span>
          </p>
          <button
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#6E6E85',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {language === 'العربية' ? 'تغيير الرقم' : 'Change Number'}
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
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
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* 6-Digit OTP Boxes */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', direction: 'ltr' }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoFocus={i === 0}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="tabular-nums"
              style={{
                width: '46px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: '#182236',
                border: digit ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '20px',
                fontWeight: 800,
                color: '#FFFFFF',
                textAlign: 'center',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
            />
          ))}
        </div>

        {/* Resend Counter */}
        <div style={{ textAlign: 'center', fontSize: '12.5px', color: '#A2A2BA', marginBottom: '18px' }}>
          {language === 'العربية' ? 'لم تستلم الرمز؟ ' : "Didn't receive SMS? "}
          <button
            disabled={timer > 0}
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: timer > 0 ? '#6E6E85' : 'var(--brand-green, #7FE87F)',
              fontWeight: 800,
              cursor: timer > 0 ? 'not-allowed' : 'pointer',
              padding: 0,
            }}
          >
            {language === 'العربية'
              ? timer > 0
                ? `إعادة الإرسال بعد (${toArabicNumerals(timer < 10 ? `0${timer}` : timer)} ثانية)`
                : 'إعادة إرسال الرمز'
              : `Resend Code ${timer > 0 ? `(00:${timer < 10 ? `0${timer}` : timer}s)` : ''}`}
          </button>
        </div>

        {isResent && (
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--brand-green, #7FE87F)', fontWeight: 700, marginBottom: '14px' }}>
            {language === 'العربية' ? 'تم إعادة إرسال الرمز بنجاح' : 'Code resent successfully!'}
          </div>
        )}

        <PrimaryButton onClick={handleVerify} disabled={!isComplete || isLoading}>
          {isLoading ? (
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              {t('auth.verify_continue', 'Verify & Continue')}{' '}
              <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
            </>
          )}
        </PrimaryButton>
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
};
