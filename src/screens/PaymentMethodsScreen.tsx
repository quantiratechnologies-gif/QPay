import React from 'react';
import { Plus } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import {
  DigitalPlatinumCard,
  LinkedAccountsList,
  SavedCardsList,
  PaymentMethodsSecurityFooter,
} from '../components/features/payment-methods';

export const PaymentMethodsScreen: React.FC = () => {
  const { navigateTo, setIsAddBankModalOpen, user, t, language } = useApp();
  const displayName = t(user.name, user.name);

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#0B0B14',
        minHeight: '100vh',
        paddingBottom: '36px',
        color: '#FFFFFF',
      }}
    >
      <AppHeader title={t('cards.title', 'Payment Methods')} showBack showSettings={false} />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <DigitalPlatinumCard displayName={displayName} t={t} />

        <LinkedAccountsList
          t={t}
          onNavigateBankAccounts={() => navigateTo('BANK_ACCOUNTS')}
        />

        <SavedCardsList language={language} t={t} />

        {/* Add New Bank / Card Button */}
        <div style={{ marginTop: '8px' }}>
          <PrimaryButton onClick={() => setIsAddBankModalOpen(true)}>
            <Plus size={18} /> {t('banks.add_bank', 'Add New Bank or Card')}
          </PrimaryButton>
        </div>

        <PaymentMethodsSecurityFooter language={language} t={t} />
      </div>
    </div>
  );
};
