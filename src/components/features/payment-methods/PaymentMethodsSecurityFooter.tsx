import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PaymentPartnerLogo } from '../../PaymentPartnerLogo';

interface PaymentMethodsSecurityFooterProps {
  language: string;
  t: (key: string, fallback?: string) => string;
}

export const PaymentMethodsSecurityFooter: React.FC<PaymentMethodsSecurityFooterProps> = ({
  language,
  t,
}) => {
  return (
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <ShieldCheck size={13} color="var(--brand-green, #7FE87F)" />
        <span style={{ fontSize: '11px', color: '#A2A2BA', fontWeight: 600 }}>
          {language === 'العربية'
            ? 'مدفوعات بطاقات مشفرة • معتمدة من ساما وسريع'
            : 'Tokenized Card Payments • SAMA & Sarie Secured'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            fontSize: '10px',
            color: '#6E6E85',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {t('home.payment_partner', 'Official Partner:')}
        </span>
        <PaymentPartnerLogo height={16} themeMode="dark" />
      </div>
    </div>
  );
};
