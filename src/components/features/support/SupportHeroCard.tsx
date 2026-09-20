import React from 'react';
import { HelpCircle } from 'lucide-react';

interface SupportHeroCardProps {
  isAr: boolean;
}

export const SupportHeroCard: React.FC<SupportHeroCardProps> = ({ isAr }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '20px',
        padding: '24px 20px',
        marginBottom: '20px',
        textAlign: 'center',
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
          margin: '0 auto 12px auto',
        }}
      >
        <HelpCircle size={24} />
      </div>
      <h3
        style={{
          fontSize: '17px',
          fontWeight: 800,
          marginBottom: '4px',
          color: '#FFFFFF',
          margin: 0,
        }}
      >
        {isAr ? 'كيف نقدر نساعدك؟' : 'How can we help?'}
      </h3>
      <p style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '4px', marginBottom: 0 }}>
        {isAr ? 'فريق الدعم متواجد على مدار الساعة' : 'Support team available 24/7'}
      </p>
    </div>
  );
};
