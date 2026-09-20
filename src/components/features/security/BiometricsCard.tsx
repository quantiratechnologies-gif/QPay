import React from 'react';
import { Fingerprint } from 'lucide-react';

interface BiometricsCardProps {
  biometricsEnabled: boolean;
  onToggle: () => void;
  isAr: boolean;
  isRtl: boolean;
}

export const BiometricsCard: React.FC<BiometricsCardProps> = ({
  biometricsEnabled,
  onToggle,
  isAr,
  isRtl,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#111726',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, paddingInlineEnd: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: biometricsEnabled ? 'rgba(127, 232, 127, 0.15)' : 'rgba(255, 255, 255, 0.06)',
            color: biometricsEnabled ? '#7FE87F' : '#8E9BAE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.3s ease',
          }}
        >
          <Fingerprint size={26} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>
            {isAr ? '???? ????? / ?????? (Biometrics)' : 'Face ID / Fingerprint'}
          </div>
          <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '3px', lineHeight: 1.4 }}>
            {isAr
              ? '????? ?????? ?????? ???????? ?????? ??? ???????? ??????'
              : 'Fast authentication for app login and Sarie instant transfers'}
          </div>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={biometricsEnabled}
        aria-label={isAr ? '????? ??????' : 'Toggle Biometrics'}
        onClick={onToggle}
        className="interactive-tap"
        style={{
          width: '54px',
          height: '30px',
          borderRadius: '15px',
          backgroundColor: biometricsEnabled ? '#7FE87F' : '#2A344A',
          border: 'none',
          padding: '3px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: biometricsEnabled ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start'),
          transition: 'background-color 0.25s ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: biometricsEnabled ? '#080C14' : '#8E9BAE',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
            transition: 'all 0.25s ease',
          }}
        />
      </button>
    </div>
  );
};
