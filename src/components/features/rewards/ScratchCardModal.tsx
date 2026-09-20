import React from 'react';
import { Gift, Sparkles, X } from 'lucide-react';
import { translateText } from '../../../utils/i18n';
import type { ScratchCardItem } from './rewardsData';

interface ScratchCardModalProps {
  card: ScratchCardItem;
  isRevealed: boolean;
  isScratching: boolean;
  isRtl: boolean;
  language: string;
  onClose: () => void;
  onScratch: () => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  card,
  isRevealed,
  isScratching,
  isRtl,
  language,
  onClose,
  onScratch,
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
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: isRtl ? 'auto' : '16px',
            left: isRtl ? '16px' : 'auto',
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

        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '8px 0 4px 0',
          }}
        >
          {card.title}
        </h3>
        <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '0 0 20px 0' }}>
          {card.subtitle}
        </p>

        {/* Scratch Surface Box */}
        <div
          onClick={onScratch}
          style={{
            width: '200px',
            height: '200px',
            margin: '0 auto 20px auto',
            borderRadius: '20px',
            backgroundColor: isRevealed
              ? 'var(--color-surface, #111726)'
              : 'var(--color-surface-elevated, #182236)',
            border: isRevealed
              ? '2px solid var(--brand-green, #7FE87F)'
              : '2px dashed var(--brand-green, #7FE87F)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isRevealed ? 'default' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {isScratching ? (
            <div>
              <Sparkles
                size={36}
                color="var(--brand-green, #7FE87F)"
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  marginTop: '10px',
                }}
              >
                {translateText('Revealing Reward...', language)}
              </div>
            </div>
          ) : isRevealed ? (
            <div style={{ padding: '16px' }}>
              <Gift
                size={40}
                color="var(--brand-green, #7FE87F)"
                style={{ margin: '0 auto 10px auto' }}
              />
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                {card.rewardText}
              </div>
              {card.code && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: 'var(--color-surface-elevated, #182236)',
                    border: '1px dashed var(--brand-green, #7FE87F)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: 'var(--brand-green, #7FE87F)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {translateText('CODE', language)}: {card.code}
                </div>
              )}
            </div>
          ) : (
            <div>
              <Sparkles
                size={40}
                color="var(--brand-green, #7FE87F)"
                style={{ margin: '0 auto 10px auto' }}
              />
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                {translateText('Tap to Scratch', language)}
              </div>
              <div style={{ fontSize: '11px', color: '#8E9BAE', marginTop: '4px' }}>
                {translateText('Click to reveal your reward!', language)}
              </div>
            </div>
          )}
        </div>

        {isRevealed ? (
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
            {translateText('Claimed & Saved', language)}
          </button>
        ) : (
          <button
            onClick={onScratch}
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
            {translateText('Scratch Now', language)}
          </button>
        )}
      </div>
    </div>
  );
};
