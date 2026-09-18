import React, { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import type { ElectricityBill } from '../types';
import { formatCurrency } from '../utils/formatters';

export const ElectricityScreen: React.FC = () => {
  const { fetchElectricityBill, openPinModal, completePayment, navigateTo, t, isRtl, language } = useApp();

  const [consumerNo, setConsumerNo] = useState<string>('134567');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bill, setBill] = useState<ElectricityBill | null>(null);

  const handleFetchBill = async () => {
    if (!consumerNo) return;
    setIsLoading(true);
    try {
      const b = await fetchElectricityBill(consumerNo);
      setBill(b);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayBill = () => {
    if (!bill) return;

    openPinModal({
      title: t(bill.providerName, 'Saudi Electricity Company (SEC)'),
      amount: bill.amount,
      subTitle: `${language === 'العربية' ? 'فاتورة الكهرباء • حساب المشترك:' : 'SEC Bill • Consumer Account:'} ${bill.consumerNumber}`,
      onSuccess: async () => {
        const txn = await completePayment({
          title: bill.providerName,
          subTitle: language === 'العربية' ? 'دفع فاتورة الكهرباء' : 'Electricity Bill Payment',
          amount: bill.amount,
          avatarInitials: 'SEC',
          category: 'Bills',
        });
        navigateTo('PAYMENT_SUCCESS', { transaction: txn });
      },
    });
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0B14', minHeight: '100%', paddingBottom: '24px' }}>
      <AppHeader title={t('home.electricity', 'Electricity')} showBack showSettings />

      <div style={{ padding: '20px' }}>
        {/* Electricity Header Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#151524',
            border: '1px solid #2C2C44',
            borderRadius: '16px',
            padding: '24px 20px',
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: 'none',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#1E1E32',
              color: '#7FE87F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              border: '1px solid #2C2C44',
            }}
          >
            <Zap size={28} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
            {language === 'العربية' ? 'فاتورة الكهرباء' : 'Electricity Bill'}
          </h2>
          <div style={{ fontSize: '12px', color: '#7FE87F', fontWeight: 700, marginTop: '4px' }}>
            {language === 'العربية' ? 'الشركة السعودية للكهرباء (SEC)' : 'Saudi Electricity Company (SEC)'}
          </div>
        </div>

        {/* Input Consumer ID */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="elec-consumer-input"
            style={{
              fontSize: '11.5px',
              color: '#9ca3af',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '8px',
              display: 'block',
              marginInlineStart: '4px',
            }}
          >
            {t('bills.consumer_num', 'Account Number')}
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#151524',
              border: '1px solid #2C2C44',
              borderRadius: '12px',
              padding: '12px 14px',
              boxShadow: 'none',
            }}
          >
            <Zap size={18} color="#7FE87F" style={{ marginInlineEnd: '10px', flexShrink: 0 }} />
            <input
              id="elec-consumer-input"
              type="text"
              inputMode="numeric"
              maxLength={14}
              value={consumerNo}
              onChange={(e) => setConsumerNo(e.target.value.replace(/\D/g, '').slice(0, 14))}
              placeholder={language === 'العربية' ? 'أدخل رقم الحساب / المشترك' : 'Enter consumer number'}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '700',
                outline: 'none',
                fontVariantNumeric: 'tabular-nums',
                direction: 'ltr',
                textAlign: isRtl ? 'right' : 'left',
              }}
            />
          </div>
        </div>

        {!bill ? (
          <PrimaryButton onClick={handleFetchBill} disabled={isLoading || !consumerNo}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                {language === 'العربية' ? 'جاري الاستعلام عن الفاتورة...' : 'Fetching Bill...'}
              </>
            ) : (
              language === 'العربية' ? 'استعلام عن الفاتورة' : 'Fetch Bill'
            )}
          </PrimaryButton>
        ) : (
          <div className="slide-up">
            {/* Fetched Bill Info Card */}
            <div
              style={{
                backgroundColor: '#151524',
                border: '1px solid #2C2C44',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#A2A2BA', fontSize: '13px' }}>{language === 'العربية' ? 'مقدم الخدمة' : 'Biller'}</span>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#FFFFFF' }}>{t(bill.providerName, bill.providerName)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#A2A2BA', fontSize: '13px' }}>{t('bills.consumer_num', 'Consumer No')}</span>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>{bill.consumerNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#A2A2BA', fontSize: '13px' }}>{t('bills.due_date', 'Due Date')}</span>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#FF4757' }}>{bill.dueDate}</span>
              </div>

              <div style={{ borderTop: '1px solid #2C2C44', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#A2A2BA', fontSize: '13px', fontWeight: '700' }}>{t('bills.bill_amount', 'Amount Due')}</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#7FE87F', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(bill.amount, language)}
                </span>
              </div>
            </div>

            <PrimaryButton onClick={handlePayBill}>
              {language === 'العربية' ? `سداد ${formatCurrency(bill.amount, language)}` : `Pay ${formatCurrency(bill.amount)}`}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};
