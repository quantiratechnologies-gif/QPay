import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import type { Contact } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  RecipientCard,
  AmountInputCard,
  TransferSecurityFooter,
} from '../components/features/transfer';

export const SendAmountScreen: React.FC = () => {
  const {
    screenParams,
    openPinModal,
    contacts,
    bankAccounts,
    navigateTo,
    completePayment,
    t,
    language,
    transferLimits,
  } = useApp();

  const contact: Contact =
    screenParams.contact ||
    contacts[0] || {
      id: 'default',
      name: 'Tariq Al-Otaibi',
      upiId: 'tariq@sarie',
      avatarInitials: 'TO',
      mobile: '+966 50 234 5678',
    };

  const totalBalance =
    bankAccounts && bankAccounts.length > 0
      ? bankAccounts.reduce((acc, bank) => acc + bank.balance, 0)
      : 24850.0;

  const perTransactionLimit = transferLimits?.perTransactionLimit || 20000;

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
  const isExceedingLimit = numAmount > perTransactionLimit;
  const isValidAmount = numAmount > 0 && !isExceedingBalance && !isExceedingLimit;
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
    <div
      className="fade-in"
      style={{ backgroundColor: '#0B0B14', minHeight: '100%', paddingBottom: '32px' }}
    >
      <AppHeader title={t('pay.send_money', 'Send Money')} showBack />

      <div style={{ padding: '20px', textAlign: 'center' }}>
        <RecipientCard
          contact={contact}
          displayName={displayName}
          language={language}
        />

        <AmountInputCard
          amountStr={amountStr}
          activeChips={activeChips}
          note={note}
          totalBalance={totalBalance}
          perTransactionLimit={perTransactionLimit}
          isExceedingBalance={isExceedingBalance}
          isExceedingLimit={isExceedingLimit}
          language={language}
          t={t}
          onAmountChange={setAmountStr}
          onChipClick={handleChipClick}
          onNoteChange={setNote}
        />

        <PrimaryButton onClick={handlePayClick} disabled={!isValidAmount}>
          {isExceedingBalance
            ? language === 'العربية'
              ? 'الرصيد غير كافٍ'
              : 'Insufficient Balance'
            : isExceedingLimit
            ? language === 'العربية'
              ? 'تجاوز الحد'
              : 'Limit Exceeded'
            : numAmount > 0
            ? `${t('nav.pay', 'Pay')} ${formatCurrency(numAmount, language)}`
            : t('pay.enter_valid_amount', 'Enter Valid Amount')}
        </PrimaryButton>

        <TransferSecurityFooter language={language} />
      </div>
    </div>
  );
};
