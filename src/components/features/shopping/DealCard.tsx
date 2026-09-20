import React from 'react';
import { Tag, ChevronRight } from 'lucide-react';
import type { DealItem } from './shoppingData';

interface DealCardProps {
  deal: DealItem;
  isRtl: boolean;
  onSelect: (deal: DealItem) => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, isRtl, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(deal)}
      className="interactive-tap"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '16px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
            color: 'var(--brand-green, #7FE87F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Tag size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>{deal.store}</div>
          <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '2px' }}>{deal.title}</div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--brand-green, #7FE87F)',
              marginTop: '3px',
              fontWeight: 800,
            }}
          >
            {deal.offer}
          </div>
        </div>
      </div>
      <ChevronRight
        size={18}
        color="#8E9BAE"
        style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}
      />
    </div>
  );
};
