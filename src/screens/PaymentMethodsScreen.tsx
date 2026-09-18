import React from 'react';
import { CreditCard, Landmark, Plus, Star, Wifi, ShieldCheck } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { PaymentPartnerLogo } from '../components/PaymentPartnerLogo';
import { useApp } from '../state/AppContext';

export const PaymentMethodsScreen: React.FC = () => {
  const { navigateTo, setIsAddBankModalOpen, user, t, language } = useApp();
  const displayName = t(user.name, user.name);

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0B14', minHeight: '100vh', paddingBottom: '36px', color: '#FFFFFF' }}>
      <AppHeader title={t('cards.title', 'Payment Methods')} showBack showSettings={false} />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* QTPay Virtual Platinum Card (Gradient Green-Black) */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#C8E6C9',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              marginInlineStart: '4px',
            }}
          >
            {t('cards.digital_mada', 'Digital Debit Card (mada & Apple Pay)')}
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #052e16 0%, #064e3b 40%, #031c12 75%, #0e0e18 100%)',
              border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
              borderRadius: '20px',
              padding: '22px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '175px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Top Row: QTPay emblem + Contactless wave */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={18} color="var(--brand-green, #7FE87F)" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                    {t('cards.platinum', 'QTPay Platinum')}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--brand-green, #7FE87F)', fontWeight: 700 }}>
                    {t('cards.instant_debit', 'Sarie Instant Debit')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wifi size={18} color="var(--brand-green, #7FE87F)" style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>

            {/* Middle Row: Card Number */}
            <div style={{ margin: '14px 0 8px 0', direction: 'ltr' }}>
              <div
                className="tabular-nums"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '0.18em',
                  fontFamily: 'monospace',
                }}
              >
                •••• &nbsp;•••• &nbsp;•••• &nbsp;5192
              </div>
            </div>

            {/* Bottom Row: Holder Name, Expiry & mada Logo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#A2E6A2', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  {t('cards.cardholder', 'Cardholder')}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                  {displayName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '9px', color: '#A2E6A2', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  {t('cards.expires', 'Expires')}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', fontFamily: 'monospace' }}>
                  08/29
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)', letterSpacing: '0.05em' }}>
                  mada
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sarie Accounts Section */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#A2A2BA',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
              marginInlineStart: '4px',
            }}
          >
            {t('banks.linked', 'Linked Saudi Accounts')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Primary Al Rajhi Bank Card */}
            <div
              onClick={() => navigateTo('BANK_ACCOUNTS')}
              className="interactive-tap"
              style={{
                backgroundColor: 'var(--color-surface, #111726)',
                borderRadius: '16px',
                padding: '16px 18px',
                color: '#FFFFFF',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                boxShadow: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-green, #7FE87F)',
                  }}
                >
                  <Landmark size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                    {t('bank.alrajhi', 'Al Rajhi Bank')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px', fontFamily: 'monospace', letterSpacing: '0.05em' }} dir="ltr">
                    SA03 •••• 4821
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--brand-green, #7FE87F)',
                  color: 'var(--brand-green-ink, #080C14)',
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  padding: '4px 9px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Star size={10} fill="currentColor" color="currentColor" /> {t('banks.primary', 'PRIMARY')}
              </div>
            </div>

            {/* SNB Card */}
            <div
              onClick={() => navigateTo('BANK_ACCOUNTS')}
              className="interactive-tap"
              style={{
                backgroundColor: 'var(--color-surface, #111726)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                borderRadius: '16px',
                padding: '16px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-surface-elevated, #182236)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-green, #7FE87F)',
                  }}
                >
                  <Landmark size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                    {t('bank.snb', 'Saudi National Bank (SNB)')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px', fontFamily: 'monospace', letterSpacing: '0.05em' }} dir="ltr">
                    SA58 •••• 1092
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                  color: 'var(--brand-green, #7FE87F)',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '4px 9px',
                  borderRadius: '12px',
                }}
              >
                {t('banks.active', 'ACTIVE')}
              </div>
            </div>
          </div>
        </div>

        {/* Saved mada Debit & Credit Cards */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#A2A2BA',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
              marginInlineStart: '4px',
            }}
          >
            {t('cards.saved_cards', 'Saved mada & Credit Cards')}
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-surface, #111726)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-green, #7FE87F)',
                }}
              >
                <CreditCard size={20} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  {language === 'العربية' ? 'بطاقة مدى الرقمية (بنك الرياض)' : 'mada Debit Card (Riyad Bank)'}
                </div>
                <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  •••• 9901 &bull; {language === 'العربية' ? 'مدى باي وسريع' : 'Sarie & mada Pay'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wifi size={16} color="#6E6E85" />
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: 'var(--brand-green, #7FE87F)',
                  backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                  padding: '3px 8px',
                  borderRadius: '10px',
                }}
              >
                {language === 'العربية' ? 'مرتبطة' : 'LINKED'}
              </span>
            </div>
          </div>
        </div>

        {/* Add New Bank / Card Button */}
        <div style={{ marginTop: '8px' }}>
          <PrimaryButton onClick={() => setIsAddBankModalOpen(true)}>
            <Plus size={18} /> {t('banks.add_bank', 'Add New Bank or Card')}
          </PrimaryButton>
        </div>

        {/* Security & Partner Footer */}
        <div
          style={{
            marginTop: '8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={13} color="var(--brand-green, #7FE87F)" />
            <span style={{ fontSize: '11px', color: '#A2A2BA', fontWeight: 600 }}>
              {language === 'العربية' ? 'مدفوعات بطاقات مشفرة • معتمدة من ساما وسريع' : 'Tokenized Card Payments • SAMA & Sarie Secured'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#6E6E85', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('home.payment_partner', 'Official Partner:')}
            </span>
            <PaymentPartnerLogo height={16} themeMode="dark" />
          </div>
        </div>
      </div>
    </div>
  );
};
