import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { translateText } from '../../../utils/i18n';

interface ShoppingHeroBannerProps {
  language: string;
}

export const ShoppingHeroBanner: React.FC<ShoppingHeroBannerProps> = ({ language }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        color: '#FFFFFF',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
          color: 'var(--brand-green, #7FE87F)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ShoppingBag size={22} />
      </div>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
          {translateText('QTPay Partner Deals', language)}
        </h3>
        <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '3px 0 0 0' }}>
          {translateText(
            'Exclusive promo codes & instant discounts on top shopping brands',
            language
          )}
        </p>
      </div>
    </div>
  );
};
