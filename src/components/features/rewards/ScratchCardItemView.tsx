import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { translateText } from '../../../utils/i18n';
import type { ScratchCardItem } from './rewardsData';

interface ScratchCardItemViewProps {
  card: ScratchCardItem;
  language: string;
  onClick: () => void;
}

export const ScratchCardItemView: React.FC<ScratchCardItemViewProps> = ({
  card,
  language,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="interactive-tap"
      style={{
        backgroundColor: card.isScratched
          ? 'var(--color-surface, #111726)'
          : 'var(--color-surface-elevated, #182236)',
        border: card.isScratched
          ? '1px solid var(--color-border, rgba(255, 255, 255, 0.08))'
          : '1px dashed var(--brand-green-border, rgba(127, 232, 127, 0.35))',
        borderRadius: '16px',
        padding: '18px 14px',
        textAlign: 'center',
        cursor: 'pointer',
        color: '#FFFFFF',
      }}
    >
      {card.isScratched ? (
        <>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
              color: 'var(--brand-green, #7FE87F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto',
            }}
          >
            <Check size={20} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '13px', color: '#FFFFFF' }}>
            {card.rewardText}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--brand-green, #7FE87F)',
              marginTop: '4px',
              fontWeight: 800,
            }}
          >
            {translateText('Claimed', language)}
          </div>
        </>
      ) : (
        <>
          <Sparkles
            size={28}
            color="var(--brand-green, #7FE87F)"
            style={{ margin: '0 auto 8px auto' }}
          />
          <div style={{ fontWeight: 800, fontSize: '13px', color: '#FFFFFF' }}>
            {translateText('Tap to Scratch', language)}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#8E9BAE',
              marginTop: '4px',
              fontWeight: 700,
            }}
          >
            {card.title}
          </div>
        </>
      )}
    </div>
  );
};
