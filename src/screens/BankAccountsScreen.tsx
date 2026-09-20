import React, { useState } from 'react';
import { Landmark } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { SamaLogo } from '../components/SamaLogo';
import { useApp } from '../state/AppContext';
import {
  BankOverviewHero,
  BankCardItem,
  BankPinModal,
  RemoveBankModal,
} from '../components/features/banking';
import type { BankAccount } from '../types';

export const BankAccountsScreen: React.FC = () => {
  const {
    bankAccounts,
    toggleShowBalance,
    setPrimaryBank,
    removeBankAccount,
    setIsAddBankModalOpen,
    openPinModal,
    t,
    language,
  } = useApp();

  const isAr = language === '???????' || language === 'ar';
  const [bankToRemove, setBankToRemove] = useState<string | null>(null);
  const [bankForPin, setBankForPin] = useState<string | null>(null);

  const confirmRemove = () => {
    if (bankToRemove) {
      removeBankAccount(bankToRemove);
      setBankToRemove(null);
    }
  };

  const handleBalanceCheck = (bank: BankAccount) => {
    const displayBankName = t(bank.bankName, bank.bankName);
    const displayAccType = t(bank.accountType, bank.accountType);

    if (bank.showBalance) {
      toggleShowBalance(bank.id);
    } else {
      openPinModal({
        title: `${t('banks.check_balance', 'Check Balance')} - ${displayBankName}`,
        subTitle: `${displayAccType} • ${bank.accountNumberMasked}`,
        amount: bank.balance,
        onSuccess: () => toggleShowBalance(bank.id),
      });
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#07090E',
        minHeight: '100%',
        paddingBottom: '96px',
        color: '#F3F6F9',
      }}
    >
      <AppHeader title={t('banks.title', 'Bank Accounts')} showBack showSettings />

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <BankOverviewHero
          accountsCount={bankAccounts.length}
          onAddBank={() => setIsAddBankModalOpen(true)}
          isAr={isAr}
          t={t}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {bankAccounts.length === 0 ? (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(14, 38, 26, 0.35) 0%, rgba(10, 15, 24, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '22px',
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(127, 232, 127, 0.12)',
                  color: '#7FE87F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Landmark size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F3F6F9' }}>
                  {isAr ? '?? ???? ?????? ????? ?????? ???' : 'No bank accounts linked yet'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#8A9BB0', marginTop: '4px', maxWidth: '280px' }}>
                  {isAr
                    ? '???? ????? ?????? ??????? ????? ?? ????? ??????? ??????? ?????? ??? ????.'
                    : 'Link your Saudi bank account to start sending and receiving instant payments via Sarie.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddBankModalOpen(true)}
                className="interactive-tap"
                style={{
                  background: 'rgba(127, 232, 127, 0.12)',
                  border: '1px solid rgba(127, 232, 127, 0.3)',
                  color: '#7FE87F',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                + {t('banks.add_bank', 'Link Bank Account')}
              </button>
            </div>
          ) : (
            bankAccounts.map((bank) => (
              <BankCardItem
                key={bank.id}
                bank={bank}
                onBalanceCheck={handleBalanceCheck}
                onSetPrimary={setPrimaryBank}
                onSetPin={setBankForPin}
                onRemove={setBankToRemove}
                isAr={isAr}
                language={language}
                t={t}
              />
            ))
          )}
        </div>

        {/* SAMA Trust Footer */}
        <div
          style={{
            marginTop: '8px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
          }}
        >
          <SamaLogo height={12} themeMode="green" />
          <span style={{ fontSize: '11px', color: '#8A9BB0', fontWeight: 600 }}>
            &bull; {isAr ? '??????? ????? ???? ????? ?????? ????? ??????? ??????? (????)' : 'Secured under Saudi Central Bank (SAMA) Regulations'}
          </span>
        </div>
      </div>

      <BankPinModal
        bankId={bankForPin}
        isOpen={Boolean(bankForPin)}
        onClose={() => setBankForPin(null)}
        isAr={isAr}
      />

      <RemoveBankModal
        isOpen={Boolean(bankToRemove)}
        onClose={() => setBankToRemove(null)}
        onConfirm={confirmRemove}
        isAr={isAr}
        cancelLabel={t('btn.cancel', 'Cancel')}
      />
    </div>
  );
};
export default BankAccountsScreen;
