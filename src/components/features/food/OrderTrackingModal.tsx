import React from 'react';
import { Check, Clock } from 'lucide-react';
import { formatSaudiCurrency, translateText } from '../../../utils/i18n';
import type { ConfirmedOrder } from './types';

interface OrderTrackingModalProps {
  order: ConfirmedOrder | null;
  onClose: () => void;
  language: string;
  isAr: boolean;
  isRtl: boolean;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  language,
  isAr,
  isRtl,
}) => {
  if (!order) return null;

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
          {translateText('Order Confirmed!', language)}
        </h3>
        <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '0 0 20px 0' }}>
          {isAr ? `${order.restaurantName} ???? ????? ????` : `${order.restaurantName} is preparing your meal`}
        </p>

        <div style={{ backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '16px', padding: '16px', textAlign: isRtl ? 'right' : 'left', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={16} color="var(--brand-green, #7FE87F)" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)' }}>
              {isAr ? `??????? ???? ${order.estimatedTime}` : `Delivering in ${order.estimatedTime}`}
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
            {isAr ? `?? ??? ${formatSaudiCurrency(order.totalAmount, language)} ??? ??? ?? ???` : `Paid SAR ${order.totalAmount} via QTPay`}
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
          {translateText('Track Order Status', language)}
        </button>
      </div>
    </div>
  );
};
