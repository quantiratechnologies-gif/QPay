import React, { useState } from 'react';
import { Shield, Zap, CreditCard, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SamaLogo } from '../components/SamaLogo';
import { useApp } from '../state/AppContext';
import { formatSaudiCurrency, translateText } from '../utils/i18n';

export const TransferLimitsScreen: React.FC = () => {
  const { transferLimits, updateTransferLimits, language } = useApp();
  const isAr = language === 'العربية' || language === 'ar';

  const [dailyLimit, setDailyLimit] = useState(transferLimits.dailyLimit);
  const [perTxnLimit, setPerTxnLimit] = useState(transferLimits.perTransactionLimit);
  const [contactlessLimit, setContactlessLimit] = useState(transferLimits.contactlessLimit);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveLimits = () => {
    updateTransferLimits({
      dailyLimit,
      perTransactionLimit: perTxnLimit,
      contactlessLimit,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const dailyUsedPct = Math.min(100, (transferLimits.dailyUsed / dailyLimit) * 100);
  const monthlyUsedPct = Math.min(100, (transferLimits.monthlyUsed / transferLimits.monthlyLimit) * 100);

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader title={translateText('Transfer Limits', language)} showBack />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* SAMA Official Compliance Badge */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
              color: 'var(--brand-green, #7FE87F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              {isAr ? 'حدود التحويل المعتمدة من ساما' : 'SAMA Regulated Transfer Limits'}
            </div>
            <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '2px' }}>
              {isAr ? 'حماية فورية وإدارة آمنة للحدود اليومية والشهرية' : 'Real-time protection & daily/monthly limit controls'}
            </div>
          </div>
        </div>

        {/* Daily Sarie Limit Card */}
        <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))', borderRadius: '18px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--brand-green, #7FE87F)" />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                {isAr ? 'الحد اليومي الفوري (سريع)' : 'Daily Instant Transfer Limit'}
              </span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
              {formatSaudiCurrency(dailyLimit, language)}
            </span>
          </div>

          {/* Progress bar of used vs remaining */}
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '999px', overflow: 'hidden', margin: '12px 0 8px 0' }}>
            <div style={{ width: `${dailyUsedPct}%`, height: '100%', backgroundColor: 'var(--brand-green, #7FE87F)', borderRadius: '999px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8E9BAE', marginBottom: '16px' }}>
            <span>{isAr ? `المستخدم اليوم: ${formatSaudiCurrency(transferLimits.dailyUsed, language)}` : `Used: ${formatSaudiCurrency(transferLimits.dailyUsed, language)}`}</span>
            <span>{isAr ? `المتبقي: ${formatSaudiCurrency(Math.max(0, dailyLimit - transferLimits.dailyUsed), language)}` : `Remaining: ${formatSaudiCurrency(Math.max(0, dailyLimit - transferLimits.dailyUsed), language)}`}</span>
          </div>

          {/* Limit Slider Adjustment */}
          <label style={{ fontSize: '11px', fontWeight: 800, color: '#8E9BAE', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            {isAr ? 'تعديل الحد اليومي' : 'Adjust Daily Limit'}
          </label>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--brand-green, #7FE87F)', cursor: 'pointer' }}
          />
        </div>

        {/* Per-Transaction Limit Card */}
        <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))', borderRadius: '18px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--brand-green, #7FE87F)" />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                {isAr ? 'حد العملية الواحدة' : 'Single Transaction Limit'}
              </span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
              {formatSaudiCurrency(perTxnLimit, language)}
            </span>
          </div>

          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={perTxnLimit}
            onChange={(e) => setPerTxnLimit(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--brand-green, #7FE87F)', cursor: 'pointer' }}
          />
        </div>

        {/* Contactless / mada Tap Limit */}
        <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))', borderRadius: '18px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                {isAr ? 'حد الدفع أثير (بدون رقم سري)' : 'mada Contactless Limit (No PIN)'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#8E9BAE', marginTop: '2px' }}>
                {isAr ? 'العمليات فوق هذا الحد تتطلب إدخال الرمز السري' : 'Transactions above this limit require PIN'}
              </div>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
              {formatSaudiCurrency(contactlessLimit, language)}
            </span>
          </div>

          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={contactlessLimit}
            onChange={(e) => setContactlessLimit(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--brand-green, #7FE87F)', cursor: 'pointer' }}
          />
        </div>

        {/* Monthly Limit Info */}
        <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))', borderRadius: '18px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              {isAr ? 'الحد الشهري الإجمالي' : 'Total Monthly Limit'}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
              {formatSaudiCurrency(transferLimits.monthlyLimit, language)}
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '999px', overflow: 'hidden', margin: '8px 0' }}>
            <div style={{ width: `${monthlyUsedPct}%`, height: '100%', backgroundColor: 'var(--brand-green, #7FE87F)', borderRadius: '999px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#8E9BAE' }}>
            <span>{isAr ? `المستخدم هذا الشهر: ${formatSaudiCurrency(transferLimits.monthlyUsed, language)}` : `Used this month: ${formatSaudiCurrency(transferLimits.monthlyUsed, language)}`}</span>
            <span>{isAr ? `المتبقي: ${formatSaudiCurrency(transferLimits.monthlyLimit - transferLimits.monthlyUsed, language)}` : `Remaining: ${formatSaudiCurrency(transferLimits.monthlyLimit - transferLimits.monthlyUsed, language)}`}</span>
          </div>
        </div>

        {isSaved && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--brand-green, #7FE87F)', fontWeight: 800, fontSize: '13px' }}>
            <CheckCircle2 size={18} /> {isAr ? 'تم تحديث حدود التحويل بنجاح' : 'Transfer limits updated successfully'}
          </div>
        )}

        <PrimaryButton onClick={handleSaveLimits}>
          {isAr ? 'حفظ إعدادات الحدود' : 'Save Transfer Limits'}
        </PrimaryButton>

        {/* SAMA Regulatory Footer */}
        <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <SamaLogo height={12} themeMode="green" />
          <span style={{ fontSize: '10.5px', color: '#9ca3af', fontWeight: 600 }}>
            {isAr
              ? 'حدود التحويل مطابقة لضوابط البنك المركزي السعودي (ساما)'
              : 'Transfer limits compliant with SAMA regulatory framework'}
          </span>
        </div>
      </div>
    </div>
  );
};
