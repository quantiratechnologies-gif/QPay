import React, { useState } from 'react';
import { Check, Share2, FileText, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { PaymentPartnerLogo } from '../components/PaymentPartnerLogo';
import { useApp } from '../state/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Transaction } from '../types';

export const PaymentSuccessScreen: React.FC = () => {
  const { screenParams, lastTransaction, navigateTo, t, language, isRtl } = useApp();
  const [downloadMsg, setDownloadMsg] = useState(false);

  const txn: Transaction = screenParams.transaction || lastTransaction || {
    id: 'QT98472910482',
    title: 'Saudi Electricity Company (SEC)',
    subTitle: 'Utility Bill Payment',
    amount: 2620.14,
    type: 'sent',
    date: 'TODAY',
    timestamp: new Date(),
    utr: 'SARIE984729104821',
  };

  const displayTitle = t(txn.title, txn.title);

  const handleDone = () => {
    navigateTo('HOME');
  };

  const handleShare = () => {
    const text = `${language === 'العربية' ? 'إيصال دفع عبر سريع - كيو تي باي' : 'Sarie Payment Receipt - QTPay'}\n` +
      `${language === 'العربية' ? 'المستلم:' : 'Payee:'} ${displayTitle}\n` +
      `${language === 'العربية' ? 'المبلغ:' : 'Amount:'} ${formatCurrency(txn.amount, language)}\n` +
      `${language === 'العربية' ? 'المرجع البنكي:' : 'Reference (UTR):'} ${txn.utr}\n` +
      `${language === 'العربية' ? 'رقم العملية:' : 'Txn ID:'} ${txn.id}`;

    if (navigator.share) {
      navigator.share({
        title: 'QTPay Receipt',
        text,
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      setDownloadMsg(true);
      setTimeout(() => setDownloadMsg(false), 2500);
    }
  };

  const handleDownloadReceipt = () => {
    const receiptHtml = `<!DOCTYPE html>
<html lang="${language === 'العربية' ? 'ar' : 'en'}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>QTPay Receipt - ${txn.id}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; background: #f8fafc; color: #0f172a; margin: 0; }
    .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
    .badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: bold; font-size: 13px; padding: 4px 12px; border-radius: 99px; margin-bottom: 8px; }
    .amount { font-size: 32px; font-weight: 800; color: #16a34a; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .label { color: #64748b; }
    .value { font-weight: 600; }
    .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">${language === 'العربية' ? 'عملية سريعة معتمدة • ساما' : 'Sarie Verified • SAMA Regulated'}</div>
      <div style="font-size: 18px; font-weight: 800; color: #0f172a;">QTPay Payment Receipt</div>
      <div class="amount">${formatCurrency(txn.amount, language)}</div>
      <div style="font-size: 14px; color: #475569;">${displayTitle}</div>
    </div>
    <div class="row"><span class="label">${language === 'العربية' ? 'رقم العملية' : 'Transaction ID'}</span><span class="value" style="font-family: monospace;">${txn.id}</span></div>
    <div class="row"><span class="label">${language === 'العربية' ? 'المرجع البنكي UTR' : 'Sarie Reference'}</span><span class="value" style="font-family: monospace; color: #16a34a;">${txn.utr}</span></div>
    <div class="row"><span class="label">${language === 'العربية' ? 'التاريخ والوقت' : 'Date & Time'}</span><span class="value">${formatDate(txn.timestamp, language)}</span></div>
    <div class="row"><span class="label">${language === 'العربية' ? 'طريقة الدفع' : 'Payment Method'}</span><span class="value">Al Rajhi Bank •••• 4821</span></div>
    <div class="row"><span class="label">${language === 'العربية' ? 'الحالة' : 'Status'}</span><span class="value" style="color: #16a34a;">${language === 'العربية' ? 'ناجحة فورياً' : 'Completed (Instant)'}</span></div>
    <div class="footer">
      Powered by Quantira Technologies • Sarie Instant Payments • SAMA
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QTPay_Receipt_${txn.id}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadMsg(true);
    setTimeout(() => setDownloadMsg(false), 2500);
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
              {t('Al Rajhi Bank', 'Al Rajhi Bank')} •••• 4821
            </span>
          </div>
        </div>

        {downloadMsg && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--brand-green)', fontWeight: '700', marginBottom: '16px' }}>
            <CheckCircle2 size={16} color="var(--brand-green)" /> {language === 'العربية' ? 'تم حفظ الإيصال بنجاح' : 'Receipt saved successfully'}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <SecondaryButton onClick={handleShare}>
            <Share2 size={16} /> {t('btn.share', 'Share')}
          </SecondaryButton>
          <SecondaryButton onClick={handleDownloadReceipt}>
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
