import React, { useState, useRef } from 'react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { ShieldCheck, MessageSquare, Loader } from 'lucide-react';
import { toArabicNumerals } from '../utils/i18n';
import { formatCurrency } from '../utils/formatters';

export const SendAmountScreen: React.FC = () => {
  const { screenParams, openPinModal, navigateTo, walletBalance, setWalletBalance, t, language, accessToken } = useApp();

  // Merchant info from ScanScreen
  const merchantCode: string = screenParams.merchantCode || '';
  const businessName: string = screenParams.businessName || merchantCode || 'Merchant';

  const initialAmount = screenParams.defaultAmount ? String(screenParams.defaultAmount) : '';
  const [amountStr, setAmountStr] = useState<string>(initialAmount);
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [payError, setPayError] = useState<string>('');

  // Idempotency key per payment attempt — reuse on retry, regenerate on new attempt
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const numAmount = parseFloat(amountStr) || 0;
  const isExceedingBalance = numAmount > walletBalance;
  const isValidAmount = numAmount > 0 && numAmount <= 10000 && !isExceedingBalance;
  const hasTwoDecimalsMax = /^\d+(\.\d{0,2})?$/.test(amountStr) || amountStr === '';

  const handlePayClick = () => {
    if (!isValidAmount || isLoading) return;
    setPayError('');

    openPinModal({
      title: `${t('nav.pay', 'Pay')} ${businessName}`,
      amount: numAmount,
      subTitle: merchantCode,
      onSuccess: async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              merchantCode,
              amount: numAmount,
              idempotencyKey: idempotencyKeyRef.current,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            const code = data.error;
            if (code === 'INSUFFICIENT_BALANCE') {
              setPayError(
                language === 'العربية'
                  ? 'رصيد المحفظة غير كافٍ.'
                  : 'Insufficient wallet balance.'
              );
            } else if (code === 'INVALID_MERCHANT') {
              setPayError(
                language === 'العربية'
                  ? 'رمز التاجر غير صحيح.'
                  : 'Merchant not found.'
              );
            } else if (code === 'SELF_PAYMENT') {
              setPayError(
                language === 'العربية'
                  ? 'لا يمكن الدفع لحسابك الخاص.'
                  : 'Cannot pay your own account.'
              );
            } else {
              setPayError(data.message || 'Payment failed. Please try again.');
            }
            return;
          }

          // Update wallet balance in context
          if (typeof data.balance === 'number') {
            setWalletBalance(data.balance);
          }

          navigateTo('PAYMENT_SUCCESS', {
            transaction: {
              id: data.transaction?.id,
              title: businessName,
              subTitle: `Merchant Payment • ${merchantCode}`,
              amount: numAmount,
              type: 'sent',
              date: 'TODAY',
              timestamp: new Date(),
              utr: data.transaction?.order_ref || data.transaction?.id,
              category: 'Merchant Payment',
              payeeName: businessName,
            },
            merchantCode,
            businessName,
            amount: numAmount,
            newBalance: data.balance,
          });

          // Generate new idempotency key for next payment
          idempotencyKeyRef.current = crypto.randomUUID();
        } catch {
          setPayError(
            language === 'العربية'
              ? 'فشل الاتصال بالخادم. تحقق من الإنترنت.'
              : 'Connection error. Please check your internet.'
          );
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0B14', minHeight: '100%', paddingBottom: '32px' }}>
      <AppHeader title={t('pay.send_money', 'Pay Merchant')} showBack />

      <div style={{ padding: '20px', textAlign: 'center' }}>
        {/* Merchant Profile Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px 20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-green-tint)',
              color: 'var(--brand-green)',
              fontWeight: 800,
              fontSize: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            {businessName.slice(0, 2).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            {businessName}
          </h2>
          <div style={{ fontSize: '12.5px', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{merchantCode}</span>
            <span style={{ color: '#4b5563' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--brand-green)', fontWeight: 700 }}>
              <ShieldCheck size={14} /> {language === 'العربية' ? 'تاجر موثوق' : 'Verified Merchant'}
            </span>
          </div>
        </div>

        {/* Amount Input Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px 20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#9ca3af',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            {t('pay.enter_amount', 'Enter Amount')}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-green)' }}>
              {language === 'العربية' ? 'ر.س' : 'SAR'}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
                  setAmountStr(val);
                  setPayError('');
                  // Generate new idempotency key on amount change
                  idempotencyKeyRef.current = crypto.randomUUID();
                }
              }}
              placeholder="0"
              autoFocus
              className="tabular-nums"
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#FFFFFF',
                background: 'none',
                border: 'none',
                outline: 'none',
                width: '200px',
                textAlign: 'center',
                padding: 0,
              }}
            />
          </div>

          {/* Wallet balance indicator */}
          <div style={{ fontSize: '12px', color: '#6E6E85', marginBottom: '16px' }}>
            {language === 'العربية'
              ? `الرصيد المتاح: ${formatCurrency(walletBalance, language)}`
              : `Available: ${formatCurrency(walletBalance, language)}`}
          </div>

          {/* Quick Amount Chips */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
            {['50', '100', '500', '1000', '2000'].map((val) => {
              const isSelected = amountStr === val;
              const formattedVal = language === 'العربية' ? `${toArabicNumerals(val)} ر.س` : `SAR ${val}`;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (amountStr === val) {
                      setAmountStr('');
                    } else {
                      setAmountStr(val);
                      idempotencyKeyRef.current = crypto.randomUUID();
                    }
                    setPayError('');
                  }}
                  className="interactive-tap"
                  style={{
                    backgroundColor: isSelected ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.2))' : 'var(--color-surface-elevated, #182236)',
                    border: isSelected ? '2px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                    color: isSelected ? 'var(--brand-green, #7FE87F)' : '#FFFFFF',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {formattedVal}
                </button>
              );
            })}
          </div>

          {/* Note Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: '12px',
              padding: '10px 14px',
              border: '1px solid var(--color-border)',
            }}
          >
            <MessageSquare size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              maxLength={80}
              placeholder={language === 'العربية' ? 'إضافة ملاحظة (اختياري)...' : 'Add a note (optional)...'}
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 80))}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                width: '100%',
                padding: 0,
              }}
            />
          </div>

          {/* Error Banners */}
          {isExceedingBalance && !payError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '8px 12px',
                marginTop: '12px',
                fontSize: '12px',
                color: '#EF4444',
                fontWeight: 700,
              }}
            >
              {language === 'العربية'
                ? `الرصيد غير كافٍ (المتاح: ${formatCurrency(walletBalance, language)})`
                : `Insufficient Balance (Available: ${formatCurrency(walletBalance, language)})`}
            </div>
          )}

          {numAmount > 10000 && !payError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '8px 12px',
                marginTop: '12px',
                fontSize: '12px',
                color: '#EF4444',
                fontWeight: 700,
              }}
            >
              {language === 'العربية' ? 'الحد الأقصى 10,000 ر.س للعملية الواحدة' : 'Maximum 10,000 SAR per transaction'}
            </div>
          )}

          {payError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '8px 12px',
                marginTop: '12px',
                fontSize: '12px',
                color: '#EF4444',
                fontWeight: 700,
              }}
            >
              {payError}
            </div>
          )}
        </div>

        <PrimaryButton onClick={handlePayClick} disabled={!isValidAmount || isLoading || !hasTwoDecimalsMax}>
          {isLoading ? (
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : isExceedingBalance ? (
            language === 'العربية' ? 'الرصيد غير كافٍ' : 'Insufficient Balance'
          ) : numAmount > 0 ? (
            `${t('nav.pay', 'Pay')} ${formatCurrency(numAmount, language)}`
          ) : (
            t('pay.enter_valid_amount', 'Enter Valid Amount')
          )}
        </PrimaryButton>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#7FE87F" />
          <span style={{ fontSize: '11.5px', color: '#9ca3af', fontWeight: 600 }}>
            {language === 'العربية'
              ? 'محفظة QPay • آمنة ومشفرة • دفع فوري'
              : 'QPay Wallet • Instant & Secure Payment'}
          </span>
        </div>
      </div>
    </div>
  );
};
