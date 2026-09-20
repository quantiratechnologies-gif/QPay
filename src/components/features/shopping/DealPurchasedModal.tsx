import React from 'react';
import { Check } from 'lucide-react';
import { formatSaudiCurrency, translateText } from '../../../utils/i18n';

interface DealPurchasedModalProps {
  purchasedDeal: {
    title: string;
    store: string;
    paidAmount: number;
  };
  language: string;
  isRtl: boolean;
  onClose: () => void;
}

export const DealPurchasedModal: React.FC<DealPurchasedModalProps> = ({
  purchasedDeal,
  language,
  isRtl,
  onClose,
}) => {
  const isAr = language === 'العربية' || language === 'ar';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 15, 25, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          backgroundColor: 'var(--color-surface, #111726)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
            color: 'var(--brand-green, #7FE87F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
          }}
        >
          <Check size={32} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
          {translateText('Order Placed!', language)}
        </h3>
        <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '0 0 20px 0' }}>
          {isAr
            ? `تم تفعيل قسيمة الخصم لدى ${purchasedDeal.store}`
            : `Discount voucher redeemed at ${purchasedDeal.store}`}
        </p>

        <div
          style={{
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: isRtl ? 'right' : 'left',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
            {purchasedDeal.title}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--brand-green, #7FE87F)',
              marginTop: '6px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {isAr
              ? `تم دفع ${formatSaudiCurrency(purchasedDeal.paidAmount, language)} عبر كيو تي باي`
              : `Paid ${formatSaudiCurrency(purchasedDeal.paidAmount, language)} via QTPay`}
          </div>
        </div>

        <button
          onClick={onClose}
          className="interactive-tap"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--brand-green, #7FE87F)',
            border: 'none',
            color: 'var(--brand-green-ink, #080C14)',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {translateText('Done & View Receipt', language)}
        </button>
      </div>
    </div>
  );
};
