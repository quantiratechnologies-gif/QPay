import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../../../state/AppContext';

export const KycBanner: React.FC = () => {
  const { isKycVerified, navigateTo, language } = useApp();

  if (isKycVerified) return null;

  const isAr = language === 'العربية';

  return (
    <div style={{ padding: '14px 20px 0 20px' }}>
      <div
        className="interactive-tap"
        onClick={() => navigateTo('ONBOARDING_KYC')}
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--brand-green-border)',
          borderRadius: '20px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--brand-green-tint)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} color="var(--brand-green)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              {isAr ? 'توثيق الهوية' : 'Verify Identity'}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '2px' }}>
              {isAr ? 'وثّق هويتك لتفعيل كافة الخدمات والمزايا' : 'Verify your identity to activate all features'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigateTo('ONBOARDING_KYC');
          }}
          className="interactive-tap"
          style={{
            width: 'auto',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800,
            backgroundColor: 'var(--brand-green)',
            color: 'var(--brand-green-ink)',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {isAr ? 'توثيق' : 'Verify'}
        </button>
      </div>
    </div>
  );
};
