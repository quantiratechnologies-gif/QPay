import React, { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { formatSaudiCurrency, translateText } from '../../../utils/i18n';
import type { DealItem } from './shoppingData';

interface DealCheckoutModalProps {
  deal: DealItem;
  language: string;
  t: (key: string, fallback?: string) => string;
  onClose: () => void;
  onBuyNow: () => void;
}

export const DealCheckoutModal: React.FC<DealCheckoutModalProps> = ({
  deal,
  language,
  t,
  onClose,
  onBuyNow,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 15, 25, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface, #111726)',
          borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '24px 20px',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {deal.store}
            </h3>
            <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '2px 0 0 0' }}>
              {deal.category}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#8E9BAE',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            borderRadius: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>{deal.title}</div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--brand-green, #7FE87F)',
              marginTop: '4px',
            }}
          >
            {deal.offer}
          </div>

          {/* Coupon Copy Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: 'var(--color-surface, #111726)',
              border: '1px dashed var(--brand-green-border, rgba(127, 232, 127, 0.35))',
              borderRadius: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#8E9BAE', display: 'block' }}>
                {translateText('Coupon Code', language)}
              </span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '0.05em',
                }}
              >
                {deal.couponCode}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCode(deal.couponCode)}
              className="interactive-tap"
              style={{
                backgroundColor: 'var(--brand-green, #7FE87F)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--brand-green-ink, #080C14)',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              {copiedCode ? translateText('Copied!', language) : t('copy')}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '10px',
              borderTop: '1px dashed var(--color-border, rgba(255, 255, 255, 0.12))',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#8E9BAE' }}>
              {translateText('Special Discount Price', language)}
            </span>
            <div>
              <span
                style={{
                  fontSize: '13px',
                  color: '#6B7A90',
                  textDecoration: 'line-through',
                  marginInlineEnd: '8px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatSaudiCurrency(deal.originalPrice, language)}
              </span>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: 'var(--brand-green, #7FE87F)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatSaudiCurrency(deal.discountedPrice, language)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onBuyNow}
          className="interactive-tap"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: 'var(--brand-green, #7FE87F)',
            border: 'none',
            color: 'var(--brand-green-ink, #080C14)',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {translateText('Order Now', language)} (
          {formatSaudiCurrency(deal.discountedPrice, language)})
        </button>
      </div>
    </div>
  );
};
