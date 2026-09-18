import React, { useState } from 'react';
import { Download, Share2, Copy, CheckCircle2, ArrowDownLeft, Sparkles } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { QRCodeView } from '../components/QRCodeView';
import { PaymentPartnerLogo } from '../components/PaymentPartnerLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { useApp } from '../state/AppContext';
import { qrService } from '../services/qrService';
import { formatCurrency } from '../utils/formatters';
import { toArabicNumerals } from '../utils/i18n';

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
  const primaryBankName = primaryBank ? t(primaryBank.bankName, primaryBank.bankName) : '';

  const playSuccessChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880, now + 0.1); // A5
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);
      }
    } catch {
      // Audio not permitted without interaction
    }

    if (navigator.vibrate) {
      navigator.vibrate([60, 80, 60]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(user.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          title: 'QTPay Sarie ID',
          text: `${language === 'العربية' ? 'ادفع إلى' : 'Pay'} ${displayName} via QTPay: ${user.upiId}${numAmount > 0 ? ` (${language === 'العربية' ? 'المبلغ' : 'Amount'}: ${formatCurrency(numAmount, language)})` : ''}`,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleSimulateReceive = async (presetAmt?: number) => {
    const amt = presetAmt || (numAmount > 0 ? numAmount : 500);
    const senders = ['Tariq Al-Otaibi', 'Sara Al-Mansoor', 'Mohammed Al-Ghamdi', 'Abdullah Al-Shehri'];
    const randomSender = senders[Math.floor(Math.random() * senders.length)];

    await receiveMoney({
      senderName: randomSender,
      senderUpi: `${randomSender.toLowerCase().replace(/[^a-z]/g, '')}@sarie`,
      amount: amt,
      note: 'Payment via QTPay Sarie QR',
    });

    playSuccessChime();
    setReceivedToast({ show: true, amount: amt, sender: randomSender });
    setTimeout(() => setReceivedToast(null), 3500);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '120px' }}>
      <AppHeader title={t('receive.title', 'Receive Money')} showBack />

      {/* Floating Success Toast when Money is Received */}
      {receivedToast && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            width: '90%',
            maxWidth: '500px',
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--brand-green, #7FE87F)',
            color: '#FFFFFF',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowDownLeft size={20} color="var(--brand-green, #7FE87F)" />
            </div>
            <div>
              <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)' }}>
                +{formatCurrency(receivedToast.amount, language)} {language === 'العربية' ? 'تم الاستلام' : 'Received'}
              </div>
              <div style={{ fontSize: '12px', color: '#A2A2BA' }}>
                {language === 'العربية' ? 'من' : 'From'} {t(receivedToast.sender, receivedToast.sender)}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigateTo('HISTORY')}
            style={{
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {language === 'العربية' ? 'عرض' : 'View'}
          </button>
        </div>
      )}

      <div style={{ padding: '20px', textAlign: 'center' }}>
        {/* Dark QR Showcase Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            borderRadius: '20px',
            padding: '24px 20px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'none',
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
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              border: 'none',
              overflow: 'hidden',
            }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.avatarInitials
            )}
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            {displayName}
          </h2>

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

        {/* Set Specific Amount Box */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '16px',
            textAlign: isRtl ? 'right' : 'left',
            boxShadow: 'none',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
            {language === 'العربية' ? 'تحديد المبلغ (اختياري)' : 'Set Amount (Optional)'}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                borderRadius: '8px',
                padding: '0 12px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', marginInlineEnd: '6px' }}>
                {language === 'العربية' ? 'ر.س' : 'SAR'}
              </span>
              <input
                type="number"
                placeholder={language === 'العربية' ? 'أدخل المبلغ' : 'Enter amount'}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  padding: '10px 0',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textAlign: isRtl ? 'right' : 'left',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
              {customAmount && (
                <button
                  onClick={() => setCustomAmount('')}
                  style={{ background: 'none', border: 'none', color: '#6E6E85', cursor: 'pointer', fontSize: '12px' }}
                >
                  {language === 'العربية' ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[50, 100, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => setCustomAmount(String(amt))}
                className="interactive-tap"
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '6px',
                  border: customAmount === String(amt) ? '1px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  backgroundColor: customAmount === String(amt) ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))' : 'var(--color-surface-elevated, #182236)',
                  color: customAmount === String(amt) ? 'var(--brand-green, #7FE87F)' : '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {language === 'العربية' ? `${toArabicNumerals(amt)} ر.س` : `SAR ${amt}`}
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation & Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => handleSimulateReceive()}
            className="interactive-tap"
            style={{
              width: '100%',
              minHeight: '52px',
              backgroundColor: 'var(--brand-green, #7FE87F)',
              color: 'var(--brand-green-ink, #080C14)',
              border: 'none',
              borderRadius: '14px',
              padding: '0 20px',
              fontSize: '14.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: 'none',
              boxSizing: 'border-box',
            }}
          >
            <Sparkles size={18} color="var(--brand-green-ink, #080C14)" />{' '}
            {language === 'العربية'
              ? `استلام دفعة تجريبية (${formatCurrency(numAmount > 0 ? numAmount : 500, language)})`
              : `Receive Demo Payment (${formatCurrency(numAmount > 0 ? numAmount : 500)})`}
          </button>

          <PrimaryButton onClick={() => navigateTo('REQUEST_MONEY')}>
            <Download size={18} /> {t('home.request_money', 'Request Money')}
          </PrimaryButton>

          <SecondaryButton onClick={handleShare}>
            <Share2 size={18} /> {t('receive.share_qr', 'Share QR Code')}
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};
