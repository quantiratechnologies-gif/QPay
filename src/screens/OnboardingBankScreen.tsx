import React, { useState, useRef } from 'react';
import { ArrowRight, Loader2, CheckCircle2, Landmark, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { formatSaudiIban, cleanSaudiIban, formatSaudiMobile } from '../utils/formatters';

interface SaudiBankOption {
  name: string;
  category: string;
}

const SAUDI_BANKS: SaudiBankOption[] = [
  { name: 'Al Rajhi Bank', category: 'Fast Connect' },
  { name: 'Saudi National Bank (SNB)', category: 'Fast Connect' },
  { name: 'Riyad Bank', category: 'Fast Connect' },
  { name: 'Alinma Bank', category: 'Fast Connect' },
  { name: 'Saudi Awwal Bank (SAB)', category: 'Fast Connect' },
  { name: 'Banque Saudi Fransi (BSFR)', category: 'Fast Connect' },
  { name: 'Arab National Bank (ANB)', category: 'Fast Connect' },
  { name: 'Bank AlJazira', category: 'Fast Connect' },
  { name: 'Gulf International Bank (GIB)', category: 'Fast Connect' },
  { name: 'D360 Bank', category: 'Digital Bank' },
];

type BankStep = 'SELECT_AND_MATCH' | 'AUTHORIZE_AND_CONNECT';

export const OnboardingBankScreen: React.FC = () => {
  const { navigateTo, goBack, setSingleOnboardingBank, user, t, language, isRtl } = useApp();

  const [step, setStep] = useState<BankStep>('SELECT_AND_MATCH');
  const [selectedBank, setSelectedBank] = useState<string>('Al Rajhi Bank');
  const [matchMethod, setMatchMethod] = useState<'mobile' | 'iban'>('mobile');
  const [customIban, setCustomIban] = useState<string>('');
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
          language === 'العربية'
            ? 'يرجى إدخال رقم آيبان سعودي (SA...)'
            : 'Please enter a Saudi IBAN (starting with SA).'
        );
        return;
      }
      if (!cleanIban.startsWith('SA')) {
        setErrorMessage(
          language === 'العربية'
            ? 'قيود البنك المركزي السعودي: يجب أن يبدأ رقم الآيبان بـ SA'
            : 'SAMA Restriction: Saudi IBAN must start with SA.'
        );
        return;
      }
      if (cleanIban.length !== 24) {
        setErrorMessage(
          language === 'العربية'
            ? `قيود الآيبان السعودي: يجب أن يتكون الآيبان من ٢٤ خانة بالضبط (المدخل: ${cleanIban.length} خانة)`
            : `Saudi Banking Restriction: Saudi IBAN must be exactly 24 characters (Entered: ${cleanIban.length}).`
        );
        return;
      }
      if (!/^SA\d{2}[A-Z0-9]{20}$/.test(cleanIban)) {
        setErrorMessage(
          language === 'العربية'
            ? 'صيغة الآيبان غير مطابقة لمعايير البنوك السعودية'
            : 'Invalid Saudi IBAN format for selected bank.'
        );
        return;
      }
    } else if (matchMethod === 'mobile') {
      const cleanMobile = user.mobile.replace(/\D/g, '');
      if (!cleanMobile.startsWith('9665') && !cleanMobile.startsWith('05') && !cleanMobile.startsWith('5')) {
        setErrorMessage(
          language === 'العربية'
            ? 'قيود الربط: رقم الجوال يجب أن يكون رقم سعودي مسجل يبدأ بـ 05'
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
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    if (cleanValue && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleQuickFillOtp = () => {
    setOtpDigits(['4', '8', '2', '1']);
    otpInputRefs[3].current?.focus();
  };

  const handleVerifyOtpAndLink = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 4) {
      setErrorMessage(
        language === 'العربية'
          ? 'يرجى إدخال رمز التحقق المكون من ٤ أرقام'
          : 'Please enter the 4-digit verification code.'
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
        backgroundColor: '#080c14',
        backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(127, 232, 127, 0.08) 0%, rgba(7, 13, 10, 0.98) 60%)',
        minHeight: '100%',
        paddingBottom: '40px',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppHeader
        title={language === 'العربية' ? 'ربط الحساب البنكي' : 'Link Bank Account'}
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
                {language === 'العربية' ? 'اختر البنك' : 'Select Bank'}
              </h3>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, marginTop: '2px', display: 'block' }}>
                {language === 'العربية' ? 'ربط فوري ومباشر مع حسابك البنكي' : 'Instant and direct account connection'}
              </span>
            </div>
          </div>

          {/* STEP 1: SELECT BANK & MATCH METHOD */}
          {step === 'SELECT_AND_MATCH' && (
            <div id="selectionView" className="fade-in">
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '10px',
                  display: 'block',
                }}
              >
                {language === 'العربية' ? 'البنوك المتاحة' : 'Available Banks'}
              </div>

              <div
                className="bank-list"
                role="radiogroup"
                aria-label="Available Banks"
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingInlineEnd: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                {SAUDI_BANKS.map((bank) => {
                  const isSelected = selectedBank === bank.name;
                  const displayBankName = t(bank.name, bank.name);
                  return (
                    <div
                      key={bank.name}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => setSelectedBank(bank.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedBank(bank.name);
                      }}
                      className={`bank-item interactive-tap ${isSelected ? 'selected' : ''}`}
                      style={{
                        backgroundColor: isSelected ? 'rgba(127, 232, 127, 0.14)' : '#182236',
                        border: isSelected ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="bank-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          className="bank-icon"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(127, 232, 127, 0.14)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Landmark size={20} color="#7FE87F" />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{displayBankName}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginTop: '2px' }}>
                            {language === 'العربية' ? 'ربط مباشر وسريع' : 'Online Banking • Fast Connect'}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid #7FE87F' : '1.5px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: isSelected ? '#080c14' : 'transparent',
                          transition: 'all 0.15s ease',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Account Match Method */}
              <div className="match-section" style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '10px',
                  }}
                >
                  {language === 'العربية' ? 'طريقة الربط' : 'Link With'}
                </div>
                <div className="match-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    className={`match-tab interactive-tap ${matchMethod === 'mobile' ? 'active' : ''}`}
                    onClick={() => setMatchMethod('mobile')}
                    style={{
                      backgroundColor: matchMethod === 'mobile' ? 'rgba(127, 232, 127, 0.14)' : '#182236',
                      border: matchMethod === 'mobile' ? '1px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: matchMethod === 'mobile' ? '#7FE87F' : '#9ca3af',
                      borderRadius: '14px',
                      padding: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Smartphone size={16} color={matchMethod === 'mobile' ? '#7FE87F' : '#9ca3af'} />
                    <span>{language === 'العربية' ? 'رقم الجوال' : 'Mobile Number'}</span>
                  </div>
                  <div
                    className={`match-tab interactive-tap ${matchMethod === 'iban' ? 'active' : ''}`}
                    onClick={() => setMatchMethod('iban')}
                    style={{
                      backgroundColor: matchMethod === 'iban' ? 'rgba(127, 232, 127, 0.14)' : '#182236',
                      border: matchMethod === 'iban' ? '1px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: matchMethod === 'iban' ? '#7FE87F' : '#9ca3af',
                      borderRadius: '14px',
                      padding: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <CreditCard size={16} color={matchMethod === 'iban' ? '#7FE87F' : '#9ca3af'} />
                    <span>{language === 'العربية' ? 'الآيبان (IBAN)' : 'IBAN'}</span>
                  </div>
                </div>

                {matchMethod === 'iban' && (
                  <div style={{ marginTop: '12px' }} className="fade-in">
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={customIban}
                        onChange={(e) => {
                          setCustomIban(formatSaudiIban(e.target.value));
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="SA03 8000 0000 6080 1012 3456"
                        maxLength={29}
                        style={{
                          width: '100%',
                          padding: '13px 60px 13px 16px',
                          borderRadius: '14px',
                          backgroundColor: '#182236',
                          border: cleanSaudiIban(customIban).length === 24 ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#FFFFFF',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          boxSizing: 'border-box',
                          outline: 'none',
                          letterSpacing: '0.04em',
                        }}
                        dir="ltr"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: cleanSaudiIban(customIban).length === 24 ? '#7FE87F' : '#6B7280',
                          fontFamily: 'monospace',
                        }}
                      >
                        {cleanSaudiIban(customIban).length}/24
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', marginInlineStart: '4px' }}>
                      {language === 'العربية' ? 'يبدأ بـ SA متبوعاً بـ 22 خانة' : 'Starts with SA followed by 22 digits/letters'}
                    </div>
                  </div>
                )}

                {matchMethod === 'mobile' && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(127, 232, 127, 0.08)',
                      border: '1px solid rgba(127, 232, 127, 0.25)',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    className="fade-in"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Smartphone size={18} color="#7FE87F" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em' }} dir="ltr">
                          {formatSaudiMobile(user.mobile) || '+966 50 123 4567'}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#7FE87F', fontWeight: 600 }}>
                          {language === 'العربية' ? 'رقم الجوال المسجل والمعتمد' : 'Registered & Verified Mobile'}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 size={18} color="#7FE87F" />
                  </div>
                )}
              </div>

              {errorMessage && (
                <div style={{ fontSize: '12px', color: '#FF4757', fontWeight: 700, marginBottom: '14px' }}>
                  {errorMessage}
                </div>
              )}

              <button
                className="action-btn interactive-tap"
                onClick={handleRequestOtp}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#7FE87F',
                  color: '#080c14',
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
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>{language === 'العربية' ? 'طلب رمز التحقق البنكي' : 'Request Bank OTP'}</span>
                    <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: OTP ENTRY VIEW */}
          {step === 'AUTHORIZE_AND_CONNECT' && (
            <div id="otpView" className="otp-container" style={{ display: 'block', textAlign: 'center' }}>
              {!isAuthorized ? (
                <>
                  <div
                    style={{
                      fontSize: '16.5px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      marginBottom: '8px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {language === 'العربية' ? 'إدخال رمز التحقق البنكي' : 'Enter Bank OTP'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#9ca3af', marginBottom: '22px', lineHeight: '1.5' }}>
                    {language === 'العربية'
                      ? `يرجى إدخال رمز التحقق المرسل إلى رقم جوالك المسجل لدى ${t(selectedBank, selectedBank)}.`
                      : `Please enter the verification code sent to your registered mobile number for ${selectedBank}.`}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px', direction: 'ltr' }}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpInputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        style={{
                          width: '52px',
                          height: '56px',
                          backgroundColor: '#182236',
                          border: digit ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '14px',
                          fontSize: '22px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          textAlign: 'center',
                          outline: 'none',
                          transition: 'border-color 0.15s ease',
                        }}
                      />
                    ))}
                  </div>

                  {errorMessage && (
                    <div style={{ fontSize: '12px', color: '#FF4757', fontWeight: 700, marginBottom: '14px' }}>
                      {errorMessage}
                    </div>
                  )}

                  <button
                    className="action-btn interactive-tap"
                    onClick={handleVerifyOtpAndLink}
                    disabled={isLoading || otpDigits.some((d) => !d)}
                    style={{
                      width: '100%',
                      padding: '15px',
                      backgroundColor: otpDigits.every((d) => d) ? '#7FE87F' : '#1f293d',
                      color: otpDigits.every((d) => d) ? '#080c14' : '#6b7280',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '14.5px',
                      fontWeight: 800,
                      cursor: otpDigits.every((d) => d) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <span>{language === 'العربية' ? 'تأكيد وربط الحساب' : 'Authorize & Link Account'}</span>
                        <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={handleQuickFillOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6E6E85',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      {language === 'العربية' ? 'رمز تجريبي: 4821' : 'Demo OTP: 4821'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="fade-in" style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(127, 232, 127, 0.14)',
                      color: '#7FE87F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                    }}
                  >
                    <CheckCircle2 size={32} color="#7FE87F" />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                    {language === 'العربية' ? 'تم ربط الحساب بنجاح' : 'Bank Account Linked'}
                  </h3>

                  <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: '0 0 20px 0' }}>
                    {language === 'العربية' ? 'حسابك البنكي جاهز الآن للدفع والتحويل الفوري.' : 'Your account is ready for instant payments and transfers.'}
                  </p>

                  <div
                    style={{
                      backgroundColor: '#182236',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '16px',
                      marginBottom: '20px',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'البنك' : 'Bank'}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{t(selectedBank, selectedBank)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'معرّف الدفع (الاسم المستعار)' : 'Payment Alias'}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#7FE87F', fontFamily: 'monospace' }}>
                        {user.upiId || 'fahad@sarie'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'حالة الربط' : 'Status'}</span>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#7FE87F', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} color="#7FE87F" />
                        {language === 'العربية' ? 'نشط وموثق' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <button
                    className="action-btn interactive-tap"
                    onClick={handleFinishOnboarding}
                    style={{
                      width: '100%',
                      padding: '15px',
                      backgroundColor: '#7FE87F',
                      color: '#080c14',
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
                    <span>{language === 'العربية' ? 'إتمام الإعداد والدخول للرئيسية' : 'Complete Setup & Go to Home'}</span>
                    <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};