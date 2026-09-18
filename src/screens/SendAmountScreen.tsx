import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import type { Contact } from '../types';
import { ShieldCheck, MessageSquare } from 'lucide-react';
import { toArabicNumerals } from '../utils/i18n';
import { formatCurrency } from '../utils/formatters';

export const SendAmountScreen: React.FC = () => {
  const { screenParams, openPinModal, contacts, bankAccounts, navigateTo, completePayment, t, language } = useApp();
  const contact: Contact = screenParams.contact || contacts[0] || {
    id: 'default',
    name: 'Tariq Al-Otaibi',
    upiId: 'tariq@sarie',
    avatarInitials: 'TO',
    mobile: '+966 50 234 5678',
  };

  const totalBalance = bankAccounts && bankAccounts.length > 0
    ? bankAccounts.reduce((acc, bank) => acc + bank.balance, 0)
    : 24850.0;

  const initialAmount = screenParams.defaultAmount ? String(screenParams.defaultAmount) : '';
  const [amountStr, setAmountStr] = useState<string>(initialAmount);
  const [activeChips, setActiveChips] = useState<number[]>([]);
  const [note, setNote] = useState<string>('');

  const handleChipClick = (valNum: number) => {
    const currentNum = parseFloat(amountStr) || 0;
    if (activeChips.includes(valNum)) {
      setActiveChips(activeChips.filter((c) => c !== valNum));
      const newAmt = Math.max(0, currentNum - valNum);
      setAmountStr(newAmt > 0 ? String(newAmt) : '');
    } else {
      setActiveChips([...activeChips, valNum]);
      const newAmt = currentNum + valNum;
      setAmountStr(String(newAmt));
    }
  };

  const numAmount = parseFloat(amountStr) || 0;
  const isExceedingBalance = numAmount > totalBalance;
  const isValidAmount = numAmount > 0 && !isExceedingBalance;
  const displayName = t(contact.name, contact.name);

  const handlePayClick = () => {
    if (!isValidAmount) return;

    openPinModal({
      title: `${t('nav.pay', 'Pay')} ${displayName}`,
      amount: numAmount,
      subTitle: `${language === 'العربية' ? 'إلى' : 'To'} ${contact.upiId}`,
      onSuccess: async () => {
        const txn = await completePayment({
          title: contact.name,
          subTitle: `${language === 'العربية' ? 'إلى' : 'To'} ${contact.upiId}`,
          amount: numAmount,
          avatarInitials: contact.avatarInitials,
          category: 'Transfer',
        });
        navigateTo('PAYMENT_SUCCESS', {
          transaction: txn,
          recipientName: contact.name,
          amount: numAmount,
          upiId: contact.upiId,
          type: 'sent',
        });
      },
    });
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0B14', minHeight: '100%', paddingBottom: '32px' }}>
      <AppHeader title={t('pay.send_money', 'Send Money')} showBack />

      <div style={{ padding: '20px', textAlign: 'center' }}>
        {/* Recipient Profile Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px 20px',
            marginBottom: '20px',
            boxShadow: 'none',
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
              border: 'none',
            }}
          >
            {contact.avatarInitials}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            {displayName}
          </h2>
          <div style={{ fontSize: '12.5px', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span>{contact.upiId}</span>
            <span style={{ color: '#4b5563' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--brand-green)', fontWeight: 700 }}>
              <ShieldCheck size={14} /> {language === 'العربية' ? 'موثوق' : 'Verified'}
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
            boxShadow: 'none',
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
              marginBottom: '20px',
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
                width: '240px',
                textAlign: 'center',
                padding: 0,
              }}
            />
          </div>

          {/* Quick Amount Chips with Toggle Select & Deselect */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
            {['50', '100', '500', '1000', '2000'].map((val) => {
              const valNum = Number(val);
              const isSelected = activeChips.includes(valNum);
              const formattedVal = language === 'العربية' ? `+${toArabicNumerals(val)} ر.س` : `+SAR ${val}`;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleChipClick(valNum)}
                  className="interactive-tap"
                  style={{
                    backgroundColor: isSelected ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.2))' : 'var(--color-surface-elevated, #182236)',
                    border: isSelected ? '2px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                    color: isSelected ? 'var(--brand-green, #7FE87F)' : '#FFFFFF',
                    boxShadow: isSelected ? '0 0 12px rgba(127, 232, 127, 0.25)' : 'none',
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

          {/* Insufficient Balance Error Banner */}
          {isExceedingBalance && (
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
                ? `الرصيد غير كافٍ (المتاح: ${formatCurrency(totalBalance, language)})`
                : `Insufficient Balance (Available: ${formatCurrency(totalBalance, language)})`}
            </div>
          )}
        </div>

        <PrimaryButton onClick={handlePayClick} disabled={!isValidAmount}>
          {isExceedingBalance
            ? (language === 'العربية' ? 'الرصيد غير كافٍ' : 'Insufficient Balance')
            : (numAmount > 0
                ? `${t('nav.pay', 'Pay')} ${formatCurrency(numAmount, language)}`
                : t('pay.enter_valid_amount', 'Enter Valid Amount'))}
        </PrimaryButton>

        {/* Smart Routing & Settlement Guarantee */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#7FE87F" />
          <span style={{ fontSize: '11.5px', color: '#9ca3af', fontWeight: 600 }}>
            {language === 'العربية'
              ? 'تحويل فوري عبر سريع • بدون رسوم • مدعوم بحماية مدى'
              : 'Sarie Real-Time • 0 SAR Fee • mada Fallback Active'}
          </span>
        </div>
      </div>
    </div>
  );
};
