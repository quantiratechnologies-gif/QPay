import React, { useState, useRef } from 'react';
import { Loader2, CheckCircle2, Landmark, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
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

const SAUDI_MADA_BINS = [
  '458838', '588845', '440647', '440795', '446404', '457865', '968201', '484783', // Al Rajhi
  '588846', '417633', '446393', '409201', '486094', '489318', // SNB
  '455708', '455036', '446672', '543357', '588847', '483010', // Riyad
  '422817', '422818', '422819', '428671', '428672', '428673', // Alinma
  '406136', '410621', '432328', '422674', '486095', // SAB
  '458456', '462220', // BSFR
  '419356', '439954', '530060', '588848', // ANB
  '446394', '604906', // AlJazira
  '457997', // GIB
  '428331', // D360
];

type BankStep = 'SELECT_AND_MATCH' | 'AUTHORIZE_AND_CONNECT';

export const AddBankModal: React.FC = () => {
  const { isAddBankModalOpen, setIsAddBankModalOpen, addBankAccount, user, t, language, isRtl } = useApp();

  const [step, setStep] = useState<BankStep>('SELECT_AND_MATCH');
  const [selectedBank, setSelectedBank] = useState<string>('Al Rajhi Bank');
  const [matchMethod, setMatchMethod] = useState<'mobile' | 'iban' | 'card'>('mobile');
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

  const handleClose = () => {
    if (isLoading) return;
    setIsAddBankModalOpen(false);
    setTimeout(() => {
      setStep('SELECT_AND_MATCH');
      setIsAuthorized(false);
      setErrorMessage('');
    }, 300);
  };

  const handleRequestOtp = () => {
    if (matchMethod === 'iban') {
      const cleanIban = cleanSaudiIban(customIban);
      if (!cleanIban || cleanIban.length === 0) {
        setErrorMessage(
          language === 'العربية'
            ? 'يرجى إدخال رقم الآيبان السعودي (SA...)'
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
    } else if (matchMethod === 'card') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 16) {
        setErrorMessage(
          language === 'العربية'
            ? 'يرجى إدخال رقم بطاقة مدى مكون من ١٦ رقماً'
            : 'Please enter a valid 16-digit card number.'
        );
        return;
      }
      const isMada = SAUDI_MADA_BINS.some((b) => cleanCard.startsWith(b));
      if (!isMada) {
        setErrorMessage(
          language === 'العربية'
            ? 'عذراً، يُسمح فقط ببطاقات مدى وبطاقات البنوك السعودية المعتمدة من ساما (SAMA).'
            : 'Unsupported card. Only Saudi mada cards and SAMA-regulated bank cards are accepted.'
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

    const generatedIban =
      matchMethod === 'iban' && customIban
        ? customIban.toUpperCase()
        : `SA${Math.floor(10 + Math.random() * 89)} •••• ${Math.floor(1000 + Math.random() * 9000)}`;

    const matchedValue =
      matchMethod === 'mobile'
        ? user.mobile
        : matchMethod === 'card'
        ? `mada •••• ${cardNumber.replace(/\s+/g, '').slice(-4)}`
        : generatedIban;

    await addBankAccount(selectedBank, {
      iban: generatedIban,
      accountType: matchMethod === 'card' ? 'mada Debit Card' : 'Primary Account',
      matchedWith: matchedValue,
    });

    setIsLoading(false);
    setIsAuthorized(true);
  };

  return (
    <BottomSheet
      isOpen={isAddBankModalOpen}
      onClose={handleClose}
      title={language === 'العربية' ? 'ربط الحساب البنكي' : 'Link Bank Account'}
    >
      <div style={{ paddingBottom: '8px' }}>
        {/* Header Bank Identity Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(127, 232, 127, 0.14)',
              border: '1px solid rgba(127, 232, 127, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Landmark size={20} color="#7FE87F" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              {language === 'العربية' ? 'اختر البنك' : 'Select Bank'}
            </h3>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, marginTop: '2px', display: 'block' }}>
              {language === 'العربية' ? 'ربط فوري عبر نظام سريع' : 'Instant linking with Sarie'}
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
                maxHeight: '240px',
                overflowY: 'auto',
                paddingInlineEnd: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '18px',
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
                      backgroundColor: isSelected ? 'var(--brand-green-tint)' : 'var(--color-surface-elevated)',
                      border: isSelected ? '1.5px solid var(--brand-green)' : '1px solid var(--color-border)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div className="bank-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        className="bank-icon"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--brand-green-tint)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Landmark size={20} color="var(--brand-green)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{displayBankName}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginTop: '2px' }}>
                          {language === 'العربية' ? 'ربط مباشر وسريع' : 'Online Banking • Fast Connect'}
                        </div>
                      </div>
                    </div>
                    <div className="radio-dot" />
                  </div>
                );
              })}
            </div>

            {/* Account Match Method */}
            <div className="match-section" style={{ marginBottom: '18px' }}>
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
              <div className="match-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div
                  className={`match-tab interactive-tap ${matchMethod === 'mobile' ? 'active' : ''}`}
                  onClick={() => setMatchMethod('mobile')}
                  style={{
                    backgroundColor: matchMethod === 'mobile' ? 'var(--brand-green-tint)' : 'var(--color-surface-elevated)',
                    border: matchMethod === 'mobile' ? '1px solid var(--brand-green)' : '1px solid var(--color-border)',
                    color: matchMethod === 'mobile' ? 'var(--brand-green)' : '#9ca3af',
                    borderRadius: '14px',
                    padding: '10px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Smartphone size={14} color={matchMethod === 'mobile' ? 'var(--brand-green)' : '#9ca3af'} />
                  <span>{language === 'العربية' ? 'الجوال' : 'Mobile'}</span>
                </div>
                <div
                  className={`match-tab interactive-tap ${matchMethod === 'iban' ? 'active' : ''}`}
                  onClick={() => setMatchMethod('iban')}
                  style={{
                    backgroundColor: matchMethod === 'iban' ? 'var(--brand-green-tint)' : 'var(--color-surface-elevated)',
                    border: matchMethod === 'iban' ? '1px solid var(--brand-green)' : '1px solid var(--color-border)',
                    color: matchMethod === 'iban' ? 'var(--brand-green)' : '#9ca3af',
                    borderRadius: '14px',
                    padding: '10px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <CreditCard size={14} color={matchMethod === 'iban' ? 'var(--brand-green)' : '#9ca3af'} />
                  <span>{language === 'العربية' ? 'الآيبان' : 'IBAN'}</span>
                </div>
                <div
                  className={`match-tab interactive-tap ${matchMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setMatchMethod('card')}
                  style={{
                    backgroundColor: matchMethod === 'card' ? 'var(--brand-green-tint)' : 'var(--color-surface-elevated)',
                    border: matchMethod === 'card' ? '1px solid var(--brand-green)' : '1px solid var(--color-border)',
                    color: matchMethod === 'card' ? 'var(--brand-green)' : '#9ca3af',
                    borderRadius: '14px',
                    padding: '10px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <CreditCard size={14} color={matchMethod === 'card' ? 'var(--brand-green)' : '#9ca3af'} />
                  <span>{language === 'العربية' ? 'بطاقة مدى' : 'mada Card'}</span>
                </div>
              </div>

              {matchMethod === 'card' && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }} className="fade-in">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCardNumber(v.replace(/(\d{4})(?=\d)/g, '$1 '));
                    }}
                    placeholder={language === 'العربية' ? 'رقم بطاقة مدى (١٦ رقماً)' : 'mada Card Number (16 digits)'}
                    maxLength={19}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    dir="ltr"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                      placeholder="MM/YY"
                      maxLength={5}
                      style={{
                        padding: '13px 16px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border)',
                        color: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                        outline: 'none',
                        textAlign: 'center',
                      }}
                      dir="ltr"
                    />
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="CVV"
                      maxLength={3}
                      style={{
                        padding: '13px 16px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border)',
                        color: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                        outline: 'none',
                        textAlign: 'center',
                      }}
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

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
                        backgroundColor: 'var(--color-surface-elevated)',
                        border: cleanSaudiIban(customIban).length === 24 ? '1.5px solid #7FE87F' : '1px solid var(--color-border)',
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
                color: '#0b0f19',
                border: 'none',
                borderRadius: '16px',
                fontSize: '14.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px -5px rgba(127, 232, 127, 0.3)',
              }}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{language === 'العربية' ? 'طلب رمز التحقق البنكي' : 'Request Bank OTP'}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
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
                    ? `يرجى إدخال رمز التحقق المرسل إلى رقم جوالك المسجل والمرتبط بـ ${t(selectedBank, selectedBank)}.`
                    : `Please enter the verification code sent to your registered mobile number linked with ${selectedBank}.`}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '22px', direction: 'ltr' }}>
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
                      className="otp-box"
                      autoFocus={idx === 0}
                      style={{
                        width: '48px',
                        height: '52px',
                        backgroundColor: '#182236',
                        border: digit ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        fontSize: '20px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        textAlign: 'center',
                        outline: 'none',
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
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#7FE87F',
                    color: '#0b0f19',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 25px -5px rgba(127, 232, 127, 0.3)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />{' '}
                      <span>{language === 'العربية' ? 'جاري الربط...' : 'Authorizing...'}</span>
                    </>
                  ) : (
                    <span>{language === 'العربية' ? 'تأكيد وربط الحساب' : 'Authorize & Link Account'}</span>
                  )}
                </button>

                <button
                  onClick={() => setStep('SELECT_AND_MATCH')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '16px',
                  }}
                >
                  {language === 'العربية' ? '← العودة لاختيار البنك' : '← Back to bank selection'}
                </button>
              </>
            ) : (
              <div className="fade-in" style={{ padding: '8px 0', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(127, 232, 127, 0.16)',
                    border: '1.5px solid #7FE87F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                  }}
                >
                  <CheckCircle2 size={36} color="#7FE87F" />
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
                  {language === 'العربية' ? 'تم ربط الحساب بنجاح' : 'Bank Account Linked'}
                </h3>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'البنك' : 'Bank'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{t(selectedBank, selectedBank)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
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
                  onClick={handleClose}
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
                  <span>{language === 'العربية' ? 'تم ومتابعة' : 'Done & Return'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
