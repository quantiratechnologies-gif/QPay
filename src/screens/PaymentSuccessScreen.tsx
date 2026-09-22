import React, { useState } from 'react';
import { Check, Share2, FileText, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { PaymentPartnerLogo } from '../components/PaymentPartnerLogo';
import { useApp } from '../state/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Transaction } from '../types';

import { receiptGenerator } from '../utils/receiptGenerator';

export const PaymentSuccessScreen: React.FC = () => {
  const { screenParams, lastTransaction, navigateTo, t, language, isRtl } = useApp();
  const [downloadMsg, setDownloadMsg] = useState(false);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);

  const txn: Transaction = screenParams.transaction || lastTransaction || {
    id: 'QPay-' + Date.now(),
    title: screenParams.businessName || 'Merchant',
    subTitle: screenParams.merchantCode ? `Merchant Payment • ${screenParams.merchantCode}` : 'Merchant Payment',
    amount: screenParams.amount || 0,
    type: 'sent' as const,
    date: 'TODAY',
    timestamp: new Date(),
    utr: 'QPay-' + Date.now(),
  };

  const newBalance: number | undefined = screenParams.newBalance;

  const displayTitle = t(txn.title, txn.title);
  const isAr = language === 'العربية' || language === 'ar';

  const handleDone = () => {
    navigateTo('HOME');
  };

  const handleShare = async () => {
    setIsProcessingReceipt(true);
    try {
      await receiptGenerator.shareReceipt(txn, displayTitle, isAr);
    } catch {
      // fallback
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const handleDownloadReceipt = async () => {
    setIsProcessingReceipt(true);
    try {
      await receiptGenerator.downloadReceipt(txn, displayTitle, isAr);
      setDownloadMsg(true);
      setTimeout(() => setDownloadMsg(false), 3000);
    } catch {
      // ignore
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0B14', minHeight: '100%', paddingBottom: '30px' }}>
      <AppHeader title={language === 'العربية' ? 'إيصال التحويل' : 'Receipt'} showSettings={false} />

      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        {/* Animated Diamond Checkmark */}
        <div style={{ margin: '12px 0 20px 0' }}>
          <div className="diamond-check-container">
            <div className="diamond-shape" />
            <Check size={38} className="diamond-icon" strokeWidth={3.5} />
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
          {t('pay.success_title', 'Payment Successful')}
        </h2>
        <div style={{ fontSize: '13px', color: '#A2A2BA', marginBottom: '14px' }}>
          {language === 'العربية' ? 'تم الدفع إلى ' : 'Paid to '}<strong style={{ color: '#FFFFFF' }}>{displayTitle}</strong>
        </div>

        {/* Large Amount Display */}
        <div
          style={{
            fontSize: '34px',
            fontWeight: '900',
            color: 'var(--brand-green)',
            marginBottom: '20px',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}
        >
          {formatCurrency(txn.amount, language)}
        </div>

        {/* Transaction Details Breakdown Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: isRtl ? 'right' : 'left',
            boxShadow: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>{t('pay.recipient', 'Payee')}</span>
            <span style={{ fontWeight: '700', fontSize: '13px', color: '#FFFFFF' }}>{displayTitle}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>{language === 'العربية' ? 'رقم العملية' : 'Transaction ID'}</span>
            <span style={{ fontWeight: '600', fontSize: '12px', color: '#FFFFFF', fontFamily: 'monospace' }}>{txn.id}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>{t('pay.txn_reference', 'Reference / UTR')}</span>
            <span style={{ fontWeight: '600', fontSize: '12px', color: 'var(--brand-green)', fontFamily: 'monospace' }}>{txn.utr}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>{language === 'العربية' ? 'التاريخ والوقت' : 'Date & Time'}</span>
            <span style={{ fontWeight: '600', fontSize: '13px', color: '#FFFFFF' }}>{formatDate(txn.timestamp, language)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>{t('pay.source_account', 'Payment Method')}</span>
            <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--brand-green)' }}>
              {language === 'العربية' ? 'محفظة كيو باي' : 'QPay Wallet'}
            </span>
          </div>

          {newBalance !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>{language === 'العربية' ? 'الرصيد المتبقي' : 'New Wallet Balance'}</span>
              <span style={{ fontWeight: '700', fontSize: '13px', color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(newBalance, language)}
              </span>
            </div>
          )}
        </div>

        {downloadMsg && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--brand-green)', fontWeight: '700', marginBottom: '16px' }}>
            <CheckCircle2 size={16} color="var(--brand-green)" /> {language === 'العربية' ? 'تم حفظ الإيصال بنجاح' : 'Receipt saved successfully'}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <SecondaryButton onClick={handleShare} disabled={isProcessingReceipt}>
            <Share2 size={16} /> {t('btn.share', 'Share')}
          </SecondaryButton>
          <SecondaryButton onClick={handleDownloadReceipt} disabled={isProcessingReceipt}>
            <FileText size={16} /> {language === 'العربية' ? 'الإيصال' : 'Receipt'}
          </SecondaryButton>
        </div>

        <PrimaryButton onClick={handleDone}>{t('btn.done', 'Done')}</PrimaryButton>

        {/* Verified Payment Partner Footer */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#6E6E85', fontWeight: 600 }}>
            {language === 'العربية' ? 'معتمد عبر' : 'Verified by'}
          </span>
          <PaymentPartnerLogo size={18} width={54} height={30} themeMode="dark" />
        </div>
      </div>
    </div>
  );
};
