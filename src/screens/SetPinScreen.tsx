import React, { useState } from 'react';
import { Lock, Delete, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { toArabicNumerals } from '../utils/i18n';

export const SetPinScreen: React.FC = () => {
  const { setUserPin, navigateTo, goBack, language, isRtl, screenParams } = useApp();
  const isAr = language === 'العربية';
  const fromSettings = screenParams?.fromSettings === true;

  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleKeyPress = (digit: string) => {
    setErrorMsg('');
    if (step === 'create') {
      if (pin.length < 4) {
        const next = pin + digit;
        setPin(next);
        if (next.length === 4) {
          // Instantly switch to confirm to prevent lost digits from fast typing
          setStep('confirm');
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const next = confirmPin + digit;
        setConfirmPin(next);
        if (next.length === 4) {
          if (next === pin) {
            setIsSuccess(true);
            setUserPin(pin);
            setTimeout(() => {
              if (fromSettings) {
                goBack();
              } else {
                navigateTo('PERMISSIONS');
              }
            }, 1000);
          } else {
            setErrorMsg(isAr ? 'الرمز غير متطابق. يرجى إعادة الإدخال.' : 'PINs do not match. Please try again.');
            setTimeout(() => {
              setConfirmPin('');
            }, 600);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setErrorMsg('');
    if (step === 'create') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (confirmPin.length > 0) {
        setConfirmPin((prev) => prev.slice(0, -1));
      } else {
        setStep('create');
        setPin((prev) => prev.slice(0, -1));
      }
    }
  };

  const currentPin = step === 'create' ? pin : confirmPin;
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100vh',
        backgroundColor: '#070D0A',
        backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(0, 255, 36, 0.12) 0%, rgba(7, 13, 10, 0.98) 65%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px 32px 20px',
        boxSizing: 'border-box',
        userSelect: 'none',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      {/* Top Header & Back Button */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={goBack}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7FE87F', fontSize: '12px', fontWeight: 700 }}>
            <ShieldCheck size={16} />
            <span>{isAr ? 'حماية الحساب SAMA' : 'SAMA 256-Bit Shield'}</span>
          </div>
        </div>

        {/* Icon & Title */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: 'rgba(127, 232, 127, 0.14)',
              border: '1px solid rgba(127, 232, 127, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#7FE87F',
            }}
          >
            {isSuccess ? <CheckCircle2 size={36} color="#7FE87F" /> : <Lock size={30} />}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {isSuccess
              ? (isAr ? 'تم تعيين الرمز السري بنجاح!' : 'Security PIN Set Successfully!')
              : step === 'create'
              ? (isAr ? 'تعيين الرمز السري (MPIN)' : 'Create Your 4-Digit MPIN')
              : (isAr ? 'تأكيد الرمز السري (MPIN)' : 'Confirm Your 4-Digit MPIN')}
          </h2>

          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0, padding: '0 16px', lineHeight: '1.5' }}>
            {isSuccess
              ? (isAr ? 'تم تفعيل الحماية البيومترية والمصرفية لحسابك' : 'Your banking-grade security PIN is now active.')
              : step === 'create'
              ? (isAr ? 'أدخل ٤ أرقام ستستخدمها لتأكيد الحوالات والاطلاع على الرصيد' : 'This PIN is required to approve payments, transfers, and reveal your bank balance.')
              : (isAr ? 'أعد إدخال نفس الرمز السري للتأكيد' : 'Re-enter the same 4 digits to confirm.')}
          </p>

          {/* 4 PIN Dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              margin: '28px 0 12px 0',
            }}
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = currentPin.length > index;
              return (
                <div
                  key={index}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: errorMsg && isFilled ? '#EF4444' : isFilled ? '#7FE87F' : 'transparent',
                    border: errorMsg && isFilled ? '2px solid #EF4444' : isFilled ? '2px solid #7FE87F' : '2px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: errorMsg && isFilled ? '0 0 12px rgba(239, 68, 68, 0.5)' : isFilled ? '0 0 12px rgba(127, 232, 127, 0.5)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              );
            })}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                color: '#EF4444',
                fontSize: '13px',
                fontWeight: 600,
                marginTop: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '6px 14px',
                borderRadius: '8px',
                display: 'inline-block',
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Numeric Keypad */}
      <div style={{ maxWidth: '340px', width: '100%', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {digits.map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isSuccess}
              onClick={() => handleKeyPress(digit)}
              style={{
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onPointerDown={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(127, 232, 127, 0.15)';
                e.currentTarget.style.borderColor = '#7FE87F';
              }}
              onPointerUp={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {isAr ? toArabicNumerals(digit) : digit}
            </button>
          ))}

          {/* Empty Slot */}
          <div />

          {/* Zero */}
          <button
            type="button"
            disabled={isSuccess}
            onClick={() => handleKeyPress('0')}
            style={{
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              fontSize: '22px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 255, 36, 0.15)';
              e.currentTarget.style.borderColor = '#00FF24';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            {isAr ? toArabicNumerals('0') : '0'}
          </button>

          {/* Delete Key */}
          <button
            type="button"
            disabled={isSuccess}
            onClick={handleDelete}
            style={{
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = '#EF4444';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <Delete size={22} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPinScreen;
