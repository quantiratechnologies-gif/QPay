import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { PinPad } from '../components/PinPad';
import { useApp } from '../state/AppContext';
import { formatCurrency } from '../utils/formatters';

export const PayBillPinModal: React.FC = () => {
  const { isPinModalOpen, closePinModal, pendingPaymentData, bankAccounts, t, language, verifyUserPin } = useApp();
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Reset errors whenever the modal opens or closes
  useEffect(() => {
    if (isPinModalOpen) {
      setError('');
      setIsVerifying(false);
    }
  }, [isPinModalOpen]);

  const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];

  if (!pendingPaymentData) return null;

  const isCheckBalance = pendingPaymentData.title.toLowerCase().includes('balance');
  const displayTitle = t(pendingPaymentData.title, pendingPaymentData.title);
  const displayBankName = primaryBank ? t(primaryBank.bankName, primaryBank.bankName) : 'Al Rajhi Bank';
  const displayBankIban = primaryBank ? primaryBank.accountNumberMasked : 'SA03 •••• 4821';

  const handlePinComplete = async (pin: string) => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(
        language === 'العربية'
          ? `يرجى الانتظار ${remainingSec} ثانية قبل المحاولة مجدداً`
          : `Please wait ${remainingSec}s before retrying`
      );
      return;
    }

    setIsVerifying(true);
    setError('');
    try {
      // Fast feedback delay for secure tactile feel
      await new Promise((res) => setTimeout(res, 120));
      const isValid = verifyUserPin(pin);
      if (isValid) {
        setFailedAttempts(0);
        setLockoutUntil(null);
        closePinModal();
        if (pendingPaymentData.onSuccess) {
          pendingPaymentData.onSuccess();
        }
      } else {
        const nextAttempts = failedAttempts + 1;
        if (nextAttempts >= 3) {
          const lockedTime = Date.now() + 30000;
          setLockoutUntil(lockedTime);
          setFailedAttempts(0);
          setError(
            language === 'العربية'
              ? 'تم تجاوز عدد المحاولات المسموح بها. تم قفل الإدخال لمدة 30 ثانية.'
              : 'Too many incorrect attempts. Locked for 30 seconds.'
          );
        } else {
          setFailedAttempts(nextAttempts);
          const remaining = 3 - nextAttempts;
          setError(
            language === 'العربية'
              ? `الرمز غير صحيح. (${remaining} محاولات متبقية)`
              : `Incorrect PIN. (${remaining} attempt${remaining > 1 ? 's' : ''} left)`
          );
        }
      }
    } catch (err) {
      setError(language === 'العربية' ? 'فشل التحقق من الرمز' : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const headerTitle = isCheckBalance
    ? (language === 'العربية' ? 'الرمز السري للرصيد' : 'Enter PIN to Check Balance')
    : displayTitle || (language === 'العربية' ? 'إدخال الرمز السري' : 'Enter PIN');

  return (
    <BottomSheet
      isOpen={isPinModalOpen}
      onClose={closePinModal}
      title={headerTitle}
    >
      <div style={{ paddingBottom: '8px' }}>
        {/* Payment Amount Bar if Transfer / Bill */}
        {pendingPaymentData.amount > 0 && !isCheckBalance && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
              marginBottom: '10px',
            }}
          >
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>
              {language === 'العربية' ? 'المبلغ المطلوب' : 'Amount'}
            </span>
            <span style={{ color: '#7FE87F', fontWeight: 700, fontSize: '16px' }}>
              {formatCurrency(pendingPaymentData.amount, language)}
            </span>
          </div>
        )}

        {/* Single-line Bank Info Pill */}
        <div className="bank-info-bar">
          <span className="bank-label">
            {language === 'العربية' ? 'الحساب' : 'Account'}
          </span>
          <span className="bank-value">
            {displayBankName} ({displayBankIban})
          </span>
        </div>

        {/* Keypad & PIN with dynamic labels and dots */}
        <PinPad
          length={4}
          onComplete={handlePinComplete}
          onClearError={() => setError('')}
          error={error}
          customTitle={
            isVerifying
              ? (language === 'العربية' ? 'جاري التحقق من الرمز السري...' : 'Verifying PIN...')
              : (language === 'العربية' ? 'أدخل الرمز السري المكون من ٤ أرقام' : 'Enter 4-Digit PIN')
          }
        />
      </div>
    </BottomSheet>
  );
};

