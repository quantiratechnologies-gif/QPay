import React from 'react';
import { Lock } from 'lucide-react';

interface MpinCardProps {
  onNavigateSetPin: () => void;
  isAr: boolean;
}

export const MpinCard: React.FC<MpinCardProps> = ({ onNavigateSetPin, isAr }) => {
  return (
    <div
      style={{
        backgroundColor: '#111726',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'rgba(127, 232, 127, 0.12)',
            color: '#7FE87F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Lock size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>
            {isAr ? '??? ?????? ????? (MPIN)' : 'Security PIN (MPIN)'}
          </div>
          <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '2px' }}>
            {isAr ? '????? ????? ????? ?????? ?? ? ?????' : 'Change your 4-digit transaction PIN'}
          </div>
        </div>
      </div>
      <button
        onClick={onNavigateSetPin}
        className="interactive-tap"
        style={{
          backgroundColor: 'rgba(127, 232, 127, 0.12)',
          border: '1px solid rgba(127, 232, 127, 0.3)',
          color: '#7FE87F',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {isAr ? '?????' : 'Change'}
      </button>
    </div>
  );
};
