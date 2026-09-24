import React, { useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { PinPad } from '../components/PinPad';
import { useApp } from '../state/AppContext';
import { formatCurrency } from '../utils/formatters';

export const PayBillPinModal: React.FC = () => {
  const { isPinModalOpen, closePinModal, pendingPaymentData, bankAccounts, t, language, verifyUserPin } = useApp();
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];

  if (!pendingPaymentData) return null;

  const isCheckBalance = pendingPaymentData.title.toLowerCase().includes('balance');
  const displayTitle = t(pendingPaymentData.title, pendingPaymentData.title);
  const displayBankName = primaryBank ? t(primaryBank.bankName, primaryBank.bankName) : 'Al Rajhi Bank';
  const displayBankIban = primaryBank ? primaryBank.accountNumberMasked : 'SA03 •••• 4821';

  const handlePinComplete = async (pin: string) => {
    setIsVerifying(true);
    setError('');
    try {
      const isValid = verifyUserPin(pin);
      if (isValid) {
        closePinModal();
        if (pendingPaymentData.onSuccess) {
          pendingPaymentData.onSuccess();
        }
      } else {
        setError(language === 'العربية' ? 'الرمز غير صحيح، حاول مرة أخرى' : 'Incorrect PIN, Try Again');
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
