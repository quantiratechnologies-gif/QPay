import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { formatSaudiCurrency } from '../../../utils/i18n';
import type { TravelItem } from './types';

interface TravelCardProps {
  item: TravelItem;
  language: string;
  isAr: boolean;
  isRtl: boolean;
  onClick: () => void;
}

export const TravelCard: React.FC<TravelCardProps> = ({
  item,
  language,
  isAr,
  isRtl,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="interactive-tap"
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '20px',
        padding: '20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginInlineEnd: '12px' }}>
          {item.badge && (
            <span
              style={{
                display: 'inline-block',
                fontSize: '10.5px',
                fontWeight: 800,
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                padding: '3px 8px',
                borderRadius: '6px',
                marginBottom: '8px',
              }}
            >
              {item.badge}
            </span>
          )}
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{item.title}</h3>
          <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '4px' }}>{item.subtitle}</div>
        </div>

        <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', color: '#8E9BAE', fontWeight: 700 }}>{isAr ? '??????? ??' : 'From'}</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
            {formatSaudiCurrency(item.price, language)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
        }}
      >
        <span style={{ fontSize: '12px', color: '#8E9BAE', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={13} color="var(--brand-green, #7FE87F)" /> {item.location}
        </span>

        <span
          style={{
            fontSize: '12.5px',
            fontWeight: 800,
            color: 'var(--brand-green, #7FE87F)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {item.category === 'holidays' ? (isAr ? '??????? ????' : 'Explore') : (isAr ? '??? ????' : 'Book')}{' '}
          <ChevronRight size={15} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
        </span>
      </div>
    </div>
  );
};
