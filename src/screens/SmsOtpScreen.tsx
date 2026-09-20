import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { AlphPayLogo } from '../components/AlphPayLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { setSessionFromServer } from '../services/supabaseClient';
import {
  QaOtpBanner,
  OtpDigitsInput,
  OtpResendSection,
} from '../components/features/auth';

export const SmsOtpScreen: React.FC = () => {
  const { navigateTo, screenParams, goBack, t, isRtl, language, updateUser } = useApp();
  const mobile = screenParams.mobile || '+966501234567';
  const initialCooldown =
    typeof screenParams.resendCooldown === 'number' ? screenParams.resendCooldown : 60;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(initialCooldown);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [, setRemainingAttempts] = useState<number | null>(null);

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
    if (!isComplete || isVerifying) return;
    setErrorMsg('');
    setIsVerifying(true);

    const enteredCode = otp.join('');

    // Strict access: Only the demo OTP shown is permitted
    if (enteredCode !== '582904') {
      setErrorMsg(
        language === 'العربية'
          ? 'وصول مقيد: يجب إدخال رمز التحقق التجريبي المعروض أعلاه (582904).'
          : 'Strict access: You must enter the demo OTP shown above (582904).'
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
      return;
    }

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobile,
          otp: enteredCode,
          fullName: screenParams.name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.code === 'OTP_INVALID') {
          const attemptsLeft =
            typeof data.remainingAttempts === 'number' ? data.remainingAttempts : null;
          setRemainingAttempts(attemptsLeft);
          setErrorMsg(
            language === 'العربية'
              ? `رمز التحقق غير صحيح.${attemptsLeft !== null ? ` المحاولات المتبقية: ${attemptsLeft}` : ''}`
              : `Incorrect code.${attemptsLeft !== null ? ` Remaining attempts: ${attemptsLeft}` : ''}`
          );
        } else if (data.code === 'MAX_ATTEMPTS_EXCEEDED') {
          setErrorMsg(
            language === 'العربية'
              ? 'تم تجاوز الحد الأقصى للمحاولات. يرجى طلب رمز جديد.'
              : 'Maximum attempts exceeded. Please request a new code.'
          );
        } else if (data.code === 'OTP_EXPIRED') {
          setErrorMsg(
            language === 'العربية'
              ? 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.'
              : 'Verification code expired. Please request a new one.'
          );
        } else {
          setErrorMsg(data.error || 'Verification failed. Please try again.');
        }

        setOtp(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
        setIsVerifying(false);
        return;
      }

      // Server verification succeeded
      if (data.user) {
        await setSessionFromServer({
          user: data.user,
          session: data.session,
        });
        updateUser(data.user);
      }

      // Transition to PIN setup or Home
      const hasPin =
        typeof window !== 'undefined' ? localStorage.getItem('qpay_user_pin') : null;
      if (!hasPin) {
        navigateTo('SET_PIN');
      } else {
        navigateTo('PERMISSIONS');
      }
    } catch (err: any) {
      console.error('[Verify OTP Network Error]', err);
      // Fallback in local sandbox mode if backend proxy interrupted
      if (enteredCode === '582904') {
        const fallbackUser = {
          name: screenParams.name || 'Fahad Al-Harbi',
          mobile,
          avatarInitials: 'QP',
          upiId: `${mobile.slice(-4)}@sarie`,
        };
        updateUser(fallbackUser);
        navigateTo('SET_PIN');
        return;
      }

      setErrorMsg(
        language === 'العربية'
          ? 'تعذر الاتصال بخادم التحقق. يرجى المحاولة مرة أخرى.'
          : 'Unable to connect to verification server. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setErrorMsg('');
    setIsResending(true);

    try {
      const response = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: mobile }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTimer(data.resendCooldown || 60);
        setOtp(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
      } else if (data.code === 'COOLDOWN_ACTIVE') {
        setTimer(data.retryAfter || 60);
      } else {
        setErrorMsg(data.error || 'Failed to resend code');
      }
    } catch (err) {
      console.error('[Resend OTP Error]', err);
      setTimer(60);
    } finally {
      setIsResending(false);
    }
  };

  // Master Test OTP autofill helper for sandbox development
  const handleQuickFill = () => {
    const targetCode = '582904';
    const digits = targetCode.split('');
    setOtp(digits);
    setErrorMsg('');
    inputRefs[5].current?.focus();
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
      <QaOtpBanner isRtl={isRtl} language={language} onQuickFill={handleQuickFill} />

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
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 6px 0',
            }}
          >
            {t('auth.enter_otp', 'Enter 6-Digit Code')}
          </h2>
          <p style={{ fontSize: '13px', color: '#A2A2BA', margin: '0 0 10px 0' }}>
            {t('auth.otp_sent_to', 'Sent via SMS to')}{' '}
            <span style={{ color: 'var(--brand-green, #7FE87F)', fontWeight: 700 }} dir="ltr">
              {mobile}
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

        {/* Error Alert if incorrect OTP */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 700,
              textAlign: isRtl ? 'right' : 'left',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <OtpDigitsInput
          otp={otp}
          inputRefs={inputRefs}
          onOtpChange={handleOtpChange}
          onKeyDown={handleKeyDown}
        />

        {/* Submit Verification Button */}
        <PrimaryButton onClick={handleVerify} disabled={!isComplete || isVerifying}>
          {isVerifying ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Loader2 size={18} className="spin-animation" />
              <span>{language === 'العربية' ? 'جاري التحقق...' : 'Verifying...'}</span>
            </div>
          ) : (
            <>
              {t('auth.verify_continue', 'Verify & Continue')}{' '}
              <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
            </>
          )}
        </PrimaryButton>

        <OtpResendSection
          timer={timer}
          isResending={isResending}
          language={language}
          t={t}
          onResend={handleResend}
        />
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
};
