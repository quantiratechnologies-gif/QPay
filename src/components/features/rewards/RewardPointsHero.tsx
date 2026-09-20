import React from 'react';
import { Trophy } from 'lucide-react';
import { formatLocalizedNumber, translateText } from '../../../utils/i18n';

interface RewardPointsHeroProps {
  points: number;
  language: string;
}

export const RewardPointsHero: React.FC<RewardPointsHeroProps> = ({ points, language }) => {
  const isAr = language === 'العربية' || language === 'ar';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '20px',
        padding: '24px 20px',
        textAlign: 'center',
        marginBottom: '20px',
        color: '#FFFFFF',
      }}
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
        <Trophy size={28} />
      </div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: 'var(--brand-green, #7FE87F)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {translateText('Total Reward Balance', language)}
      </div>
      <h2
        style={{
          fontSize: '26px',
          fontWeight: 900,
          color: '#FFFFFF',
          margin: '4px 0 6px 0',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatLocalizedNumber(points, language)} {isAr ? 'نقاط كيو تي' : 'QTPoints'}
      </h2>
      <p style={{ fontSize: '12px', color: '#8E9BAE', margin: 0 }}>
        {isAr
          ? 'اكسب ١٠ نقاط مكافأة على كل ١٠٠ ر.س تنفقها عبر كيو تي باي'
          : 'Earn 10 QTPoints on every SAR 100 spent via QTPay'}
      </p>
    </div>
  );
};
