import React from 'react';
import { Loader2 } from 'lucide-react';

interface KycVerifyingStepProps {
  isAr: boolean;
}

export const KycVerifyingStep: React.FC<KycVerifyingStepProps> = ({ isAr }) => {
  return (
    <div style={{ textAlign: 'center', padding: '36px 10px' }} className="fade-in">
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(127, 232, 127, 0.15)',
          border: '1.5px solid #7FE87F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        <Loader2 size={32} color="#7FE87F" className="animate-spin" />
      </div>
      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
        {isAr ? '???? ?????? ????????? ?? ?????? ??????...' : 'Verifying with Nafath Registry...'}
      </h4>
      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
        {isAr ? '?????? ??????? ??????? ???? ????? ??????? ???????' : 'Matching attached documents with SAMA & Absher records'}
      </p>
    </div>
  );
};
