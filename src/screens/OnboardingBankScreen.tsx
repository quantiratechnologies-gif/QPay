import React, { useState, useRef } from 'react';
import { Landmark } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { cleanSaudiIban } from '../utils/formatters';
import {
  BankSelectionStep,
  BankAuthorizeStep,
} from '../components/features/banking';
import type { MatchMethod, BankStep } from '../components/features/banking';

export const OnboardingBankScreen: React.FC = () => {
  const { navigateTo, goBack, setSingleOnboardingBank, user, t, language, isRtl } = useApp();
  const isAr = language === '???????' || language === 'ar';

  const [step, setStep] = useState<BankStep>('SELECT_AND_MATCH');
  const [selectedBank, setSelectedBank] = useState<string>('Al Rajhi Bank');
  const [matchMethod, setMatchMethod] = useState<MatchMethod>('mobile');
  const [customIban, setCustomIban] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleRequestOtp = () => {
    if (matchMethod === 'iban') {
      const cleanIban = cleanSaudiIban(customIban);
      if (!cleanIban || cleanIban.length === 0) {
        setErrorMessage(
          isAr
            ? 'يرجى إدخال رقم الآيبان السعودي (SA...)'
            : 'Please enter a Saudi IBAN (starting with SA).'
        );
        return;
      }
      if (!cleanIban.startsWith('SA')) {
        setErrorMessage(
          isAr
            ? 'قيود البنك المركزي: يجب أن يبدأ الآيبان بـ SA'
            : 'SAMA Restriction: Saudi IBAN must start with SA.'
        );
        return;
      }
      if (cleanIban.length !== 24) {
        setErrorMessage(
          isAr
            ? `قيود المصرفية السعودية: يجب أن يتكون الآيبان من ٢٤ خانة (المُدخل: ${cleanIban.length})`
            : `Saudi Banking Restriction: Saudi IBAN must be exactly 24 characters (Entered: ${cleanIban.length}).`
        );
        return;
      }
      if (!/^SA\d{2}[A-Z0-9]{20}$/.test(cleanIban)) {
        setErrorMessage(
          isAr
            ? 'صيغة الآيبان غير صحيحة للبنك المختار.'
            : 'Invalid Saudi IBAN format for selected bank.'
        );
        return;
      }
    } else if (matchMethod === 'mobile') {
      const cleanMobile = user.mobile.replace(/\D/g, '');
      if (!cleanMobile.startsWith('9665') && !cleanMobile.startsWith('05') && !cleanMobile.startsWith('5')) {
        setErrorMessage(
          isAr
            ? 'تنبيه: يجب أن يكون رقم الجوال سعودياً صحيحاً يبدأ بـ 05'
            : 'Restriction: Mobile number must be a valid Saudi number starting with 05.'
        );
        return;
      }
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthorized(false);
      setStep('AUTHORIZE_AND_CONNECT');
    }, 400);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    
    // Handle paste or autofill
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 4).split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 4) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(digits.length, 3);
      otpInputRefs[nextIndex].current?.focus();
      return;
    }

    // Handle single character typed
    const singleVal = cleanVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleVal;
    setOtpDigits(newDigits);

    if (singleVal && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const isOtpComplete = otpDigits.every((digit) => digit.length > 0);

  const handleVerifyOtpAndLink = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 4) {
      setErrorMessage(
        isAr
          ? 'يرجى إدخال رمز الأمان المكون من ٤ أرقام.'
          : 'Please enter the 4-digit verification code.'
      );
      return;
    }
    if (fullOtp !== '4829') {
      setErrorMessage(
        isAr
          ? 'رمز الأمان البنكي غير صحيح. (رمز العرض: 4829)'
          : 'Incorrect Bank OTP code. (Demo OTP: 4829)'
      );
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    setSingleOnboardingBank(selectedBank, {
      iban: customIban || undefined,
      accountType: 'Current Account',
      matchedWith: matchMethod === 'mobile' ? user.mobile : customIban,
    });

    setIsLoading(false);
    setIsAuthorized(true);
  };

  const handleFinishOnboarding = () => {
    try {
      localStorage.setItem('hasCompletedOnboarding', 'true');
    } catch {
      // Ignore
    }
    navigateTo('HOME');
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
        title={isAr ? 'ربط الحساب البنكي' : 'Link Bank Account'}
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
            backgroundColor: '#111726',
            borderRadius: '24px',
            padding: '24px 20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'none',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Bank Identity Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                backgroundColor: 'rgba(127, 232, 127, 0.14)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Landmark size={24} color="#7FE87F" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                {isAr ? 'اختر البنك' : 'Select Bank'}
              </h3>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, marginTop: '2px', display: 'block' }}>
                {isAr ? 'ربط فوري ومباشر للحساب البنكي' : 'Instant and direct account connection'}
              </span>
            </div>
          </div>

          {step === 'SELECT_AND_MATCH' && (
            <BankSelectionStep
              selectedBank={selectedBank}
              onSelectBank={setSelectedBank}
              matchMethod={matchMethod}
              onSelectMatchMethod={setMatchMethod}
              userMobile={user.mobile}
              cardNumber={cardNumber}
              onCardNumberChange={setCardNumber}
              cardExpiry={cardExpiry}
              onCardExpiryChange={setCardExpiry}
              cardCvv={cardCvv}
              onCardCvvChange={setCardCvv}
              customIban={customIban}
              onCustomIbanChange={setCustomIban}
              errorMessage={errorMessage}
              isLoading={isLoading}
              onRequestOtp={handleRequestOtp}
              isAr={isAr}
              isRtl={isRtl}
              t={t}
            />
          )}

          {step === 'AUTHORIZE_AND_CONNECT' && (
            <BankAuthorizeStep
              selectedBank={selectedBank}
              isAuthorized={isAuthorized}
              otpDigits={otpDigits}
              otpInputRefs={otpInputRefs}
              onOtpChange={handleOtpChange}
              onOtpKeyDown={handleOtpKeyDown}
              onVerifyAndLink={handleVerifyOtpAndLink}
              onBackToSelection={() => setStep('SELECT_AND_MATCH')}
              onClose={handleFinishOnboarding}
              errorMessage={errorMessage}
              isLoading={isLoading}
              userAlias={user.upiId}
              isAr={isAr}
              isRtl={isRtl}
              t={t}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default OnboardingBankScreen;
