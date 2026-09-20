import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import {
  UtilitiesGrid,
  FinanceGrid,
  LifestyleServicesGrid,
  ServicePaymentModal,
} from '../components/features/services';
import type { ServiceOpenParam } from '../components/features/services';

export const AllServicesScreen: React.FC = () => {
  const { navigateTo, openPinModal, completePayment, language, t } = useApp();

  const [selectedService, setSelectedService] = useState<ServiceOpenParam | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>('9876543210');
  const [amount, setAmount] = useState<string>('');

  const handleOpenService = (param: ServiceOpenParam) => {
    setSelectedService(param);
    setAmount(param.defaultAmount.toString());
  };

  const handleProceedPayment = () => {
    if (!selectedService) return;
    const payAmt = parseFloat(amount) || selectedService.defaultAmount;
    const serviceTitle = selectedService.title;
    const serviceSubTitle = `${selectedService.subTitle} (${accountNumber})`;

    const modalTitle = serviceTitle;
    const modalSubTitle = serviceSubTitle;

    setSelectedService(null);

    openPinModal({
      title: modalTitle,
      amount: payAmt,
      subTitle: modalSubTitle,
      onSuccess: () => {
        completePayment({
          title: serviceTitle,
          subTitle: serviceSubTitle,
          amount: payAmt,
          category: 'Bill Payment',
        }).then((txn) => {
          navigateTo('PAYMENT_SUCCESS', { transaction: txn });
        });
      },
    });
  };

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#0B0F19',
        minHeight: '100%',
        paddingBottom: '24px',
        color: '#FFFFFF',
      }}
    >
      <AppHeader
        title={t('services.all', 'All Services & Utilities')}
        showBack
        showSettings
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <UtilitiesGrid
          language={language}
          onNavigate={navigateTo}
          onOpenService={handleOpenService}
        />

        <FinanceGrid
          language={language}
          onNavigate={navigateTo}
          onOpenService={handleOpenService}
        />

        <LifestyleServicesGrid
          language={language}
          onOpenService={handleOpenService}
        />
      </div>

      <ServicePaymentModal
        selectedService={selectedService}
        accountNumber={accountNumber}
        amount={amount}
        language={language}
        t={t}
        onClose={() => setSelectedService(null)}
        onAccountNumberChange={setAccountNumber}
        onAmountChange={setAmount}
        onProceedPayment={handleProceedPayment}
      />
    </div>
  );
};
