import React from 'react';
import { Sliders, ChevronRight } from 'lucide-react';
import { formatSaudiCurrency } from '../../../utils/i18n';

interface DailyLimitCardProps {
  dailyLimit: number;
  usedToday: number;
  onOpenLimitModal: () => void;
  onNavigateLimits: () => void;
  language: string;
  isAr: boolean;
  isRtl: boolean;
}

export const DailyLimitCard: React.FC<DailyLimitCardProps> = ({
  dailyLimit,
  usedToday,
  onOpenLimitModal,
  onNavigateLimits,
  language,
  isAr,
  isRtl,
}) => {
  const remainingLimit = Math.max(0, dailyLimit - usedToday);
  const usedPercentage = Math.min(100, Math.round((usedToday / dailyLimit) * 100));

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '16px',
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isAr ? '???? ?????? ??????? (????)' : 'Daily Sarie Limit'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#7FE87F', fontVariantNumeric: 'tabular-nums' }}>
            {formatSaudiCurrency(dailyLimit, language)}
          </span>
          <button
            onClick={onOpenLimitModal}
            className="interactive-tap"
            style={{
              backgroundColor: 'rgba(127, 232, 127, 0.12)',
              border: '1px solid rgba(127, 232, 127, 0.3)',
              color: 'var(--brand-green, #7FE87F)',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sliders size={12} />
            <span>{isAr ? '?????' : 'Modify'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--color-surface-elevated, #182236)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div style={{ width: `${usedPercentage}%`, height: '100%', backgroundColor: '#7FE87F', borderRadius: '999px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#9ca3af', marginBottom: '12px' }}>
        <span>{isAr ? `???????? ?????: ${usedToday.toLocaleString()} ?.?` : `Used Today: SAR ${usedToday.toLocaleString()}`}</span>
        <span>{isAr ? `???????: ${remainingLimit.toLocaleString()} ?.?` : `Remaining: SAR ${remainingLimit.toLocaleString()}`}</span>
      </div>

      <button
        onClick={onNavigateLimits}
        className="interactive-tap"
        style={{
          width: '100%',
          backgroundColor: '#182236',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#FFFFFF',
          borderRadius: '12px',
          padding: '10px 14px',
          fontSize: '12px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
      >
        <span>{isAr ? '????? ???? ???????' : 'Adjust Transfer Limits'}</span>
        <ChevronRight size={14} color="#7FE87F" style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
      </button>
    </div>
  );
};
