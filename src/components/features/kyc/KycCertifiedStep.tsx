import React from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface KycCertifiedStepProps {
  nationalId: string;
  verifiedAt: string;
  onUpdate: () => void;
  onClose: () => void;
  isAr: boolean;
  isRtl: boolean;
}

export const KycCertifiedStep: React.FC<KycCertifiedStepProps> = ({
  nationalId,
  verifiedAt,
  onUpdate,
  onClose,
  isAr,
  isRtl,
}) => {
  return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '10px 4px 4px 4px' }}>
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
        <CheckCircle2 size={36} color="#7FE87F" />
      </div>

      <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
        {isAr ? '?? ????? ?????? ??????? ?????' : 'National ID Verified'}
      </h4>
      <div style={{ fontSize: '12px', color: '#7FE87F', fontWeight: 700, marginBottom: '18px' }}>
        {isAr ? '????? ????? ????? ??????? ??? ?????' : 'Fully certified & compliant with SAMA regulations'}
      </div>

      <div
        style={{
          backgroundColor: '#182236',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px',
          marginBottom: '20px',
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? '??? ??????' : 'National ID'}</span>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>
            {nationalId}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? '???? ???????' : 'Status'}</span>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#7FE87F' }}>
            {isAr ? '????? ????? (Nafath)' : 'Certified (Nafath)'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? '???? ?????? ??????' : 'Daily Sarie Limit'}</span>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#7FE87F' }}>SAR 50,000</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? '????? ???????' : 'Verified At'}</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#8E9BAE' }}>
            {verifiedAt}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={onUpdate}
          className="action-btn interactive-tap"
          style={{
            width: '100%',
            padding: '13px',
            backgroundColor: '#182236',
            color: '#7FE87F',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={16} />
          <span>{isAr ? '????? ??????? / ????? ???????' : 'Update Documents / KYC'}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="action-btn interactive-tap"
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#7FE87F',
            color: '#080C14',
            border: 'none',
            borderRadius: '16px',
            fontSize: '14.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'none',
          }}
        >
          <span>{isAr ? '????? ???????' : 'Done & Return'}</span>
        </button>
      </div>
    </div>
  );
};
