import React, { useState } from 'react';
import { Copy, CheckCircle2, Share2, Landmark, Zap, ShieldCheck } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { QRCodeView } from '../components/QRCodeView';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { qrService } from '../services/qrService';

export const ReceiveScreen: React.FC = () => {
  const { user, navigateTo, receiveMoney, bankAccounts, t, language, isRtl } = useApp();
  const [copied, setCopied] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [receivedToast, setReceivedToast] = useState<{ show: boolean; amount: number; sender: string } | null>(null);

  const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];
  const fullIban = 'SA03 8000 0000 6080 1014 4821';
  const numAmount = parseFloat(customAmount) || 0;
  const upiQrString = qrService.getUpiQrString(user.upiId, user.name, numAmount > 0 ? numAmount : undefined);
  const displayName = t(user.name, user.name);

  const upiQrString = qrService.getUpiQrString(sarieAlias, user.name);

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(sarieAlias);
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText(fullIban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText(fullIban.replace(/\s+/g, ''));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'QTPay Sarie & IBAN Details',
          text: `${isAr ? 'بيانات التحويل عبر سريع والآيبان:' : 'Sarie & IBAN Payment Details:'}\n${isAr ? 'الاسم:' : 'Name:'} ${displayName}\n${isAr ? 'معرّف سريع:' : 'SARIE Alias:'} ${sarieAlias}\n${isAr ? 'الآيبان:' : 'IBAN:'} ${formattedIban}`,
        })
        .catch(() => {});
    } else {
      handleCopyIban();
    }
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '120px' }}>
      <AppHeader title={t('receive.title', 'Receive Money')} showBack />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Main QR and Identity Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '24px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* User Avatar */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
              color: 'var(--brand-green, #7FE87F)',
              fontWeight: 800,
              fontSize: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              user.avatarInitials
            )}
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            {displayName}
          </h2>
          <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="var(--brand-green, #7FE87F)" />
            <span>{primaryBank ? t(primaryBank.bankName, primaryBank.bankName) : 'Al Rajhi Bank'} • {isAr ? 'حساب معتمد' : 'Verified Sarie Account'}</span>
          </div>

          {/* QR Code Container */}
          <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '18px', margin: '20px 0' }}>
            <QRCodeView value={upiQrString} size={180} />
          </div>

          <div style={{ fontSize: '11.5px', color: '#8E9BAE', fontWeight: 600 }}>
            {isAr ? 'امسح الرمز للدفع الفوري عبر أي تطبيق بنكي سعودي' : 'Scan to pay instantly via any Saudi Banking App'}
          </div>
        </div>

        {/* 1. SARIE Alias Box + Copy Alias */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#8E9BAE', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isAr ? 'معرّف سريع (SARIE Alias)' : 'SARIE Alias'}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', fontFamily: 'monospace' }} dir="ltr">
                {sarieAlias}
              </div>
            </div>
          </div>

          {/* Identifiers Container: Sarie Alias & Full Saudi IBAN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '10px', marginBottom: '14px' }}>
            {/* Sarie Alias Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>{language === 'العربية' ? 'معرّف سريع:' : 'Sarie Alias:'}</span>
              <button
                onClick={handleCopy}
                className="interactive-tap"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  color: 'var(--brand-green, #7FE87F)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span>{user.upiId}</span>
                {copied ? <CheckCircle2 size={13} color="var(--brand-green, #7FE87F)" /> : <Copy size={12} />}
              </button>
            </div>

            {/* Full Saudi IBAN Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>{language === 'العربية' ? 'الآيبان البنكي:' : 'Saudi IBAN:'}</span>
              <button
                onClick={handleCopyIban}
                className="interactive-tap"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span>{fullIban}</span>
                {copiedIban ? <CheckCircle2 size={13} color="var(--brand-green, #7FE87F)" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Machine-Readable QR Code */}
          <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
            <QRCodeView value={upiQrString} size={180} />
          </div>

          {numAmount > 0 ? (
            <div
              className="tabular-nums"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--brand-green, #7FE87F)',
                marginTop: '12px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
                padding: '4px 14px',
                borderRadius: '12px',
              }}
            >
              {language === 'العربية' ? 'المبلغ المحدد:' : 'Amount:'} {formatCurrency(numAmount, language)}
            </div>
          ) : (
            <div
              style={{
                fontSize: '11.5px',
                color: '#A2A2BA',
                marginTop: '12px',
                fontWeight: 700,
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                padding: '4px 12px',
                borderRadius: '12px',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              }}
            >
              {language === 'العربية'
                ? `أي تطبيق بنكي سعودي • إيداع مباشر في ${primaryBankName}`
                : `Any Sarie App • Direct to ${primaryBankName || 'Bank'}`}
            </div>
          )}

          {/* Payment Partner Trust Badge */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '10.5px', color: '#A2A2BA', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {t('home.payment_partner', 'Official Payment Partner')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PaymentPartnerLogo height={22} themeMode="dark" />
            </div>
          </div>
        </div>

        {/* 2. IBAN Box + Copy IBAN */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Landmark size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#8E9BAE', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isAr ? 'رقم الآيبان (IBAN)' : 'IBAN Number'}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', fontFamily: 'monospace', letterSpacing: '0.04em' }} dir="ltr">
                {formattedIban}
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyIban}
            className="interactive-tap"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: copiedIban ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface-elevated, #182236)',
              color: copiedIban ? '#080C14' : 'var(--brand-green, #7FE87F)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copiedIban ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            <span>{copiedIban ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الآيبان' : 'Copy IBAN')}</span>
          </button>
        </div>

        {/* Share Action Button */}
        <PrimaryButton onClick={handleShare}>
          <Share2 size={18} /> {isAr ? 'مشاركة بيانات الحساب والرمز' : 'Share QR & Account Details'}
        </PrimaryButton>
      </div>
    </div>
  );
};
