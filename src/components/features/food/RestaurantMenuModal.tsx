import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { formatSaudiCurrency, formatLocalizedNumber, translateText } from '../../../utils/i18n';
import type { Restaurant, MenuItem } from './types';

interface RestaurantMenuModalProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onPlaceOrder: () => void;
  subtotal: number;
  language: string;
  isAr: boolean;
}

export const RestaurantMenuModal: React.FC<RestaurantMenuModalProps> = ({
  restaurant,
  menuItems,
  onClose,
  onUpdateQty,
  onPlaceOrder,
  subtotal,
  language,
  isAr,
}) => {
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface, #111726)',
          borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '24px 20px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{restaurant.name}</h3>
            <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '2px 0 0 0' }}>{translateText('Select items to order', language)}</p>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                borderRadius: '14px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{item.name}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-green, #7FE87F)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                  {formatSaudiCurrency(item.price, language)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => onUpdateQty(item.id, -1)}
                  className="interactive-tap"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-surface, #111726)',
                    border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                  }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '16px', textAlign: 'center', color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
                  {formatLocalizedNumber(item.qty, language)}
                </span>
                <button
                  onClick={() => onUpdateQty(item.id, 1)}
                  className="interactive-tap"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-green, #7FE87F)',
                    border: 'none',
                    color: 'var(--brand-green-ink, #080C14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingTop: '12px', borderTop: '1px dashed var(--color-border, rgba(255, 255, 255, 0.12))' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#8E9BAE' }}>{translateText('Total Bill Amount', language)}</span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)', fontVariantNumeric: 'tabular-nums' }}>
            {formatSaudiCurrency(subtotal, language)}
          </span>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={subtotal <= 0}
          className="interactive-tap"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: subtotal > 0 ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface-elevated, #182236)',
            border: 'none',
            color: subtotal > 0 ? 'var(--brand-green-ink, #080C14)' : '#6B7A90',
            fontSize: '14px',
            fontWeight: 800,
            cursor: subtotal > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          {isAr
            ? `??? ???? ${formatSaudiCurrency(subtotal, language)} ??? ??? ?????`
            : `Order & Pay SAR ${subtotal.toLocaleString()} via Sarie PIN`}
        </button>
      </div>
    </div>
  );
};
