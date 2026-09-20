import React from 'react';

interface QaOtpBannerProps {
  isRtl: boolean;
  language: string;
  onQuickFill: () => void;
}

export const QaOtpBanner: React.FC<QaOtpBannerProps> = ({ isRtl, language, onQuickFill }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(24, 34, 54, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 255, 36, 0.3)',
        borderRadius: '16px',
        padding: '10px 16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(0, 255, 36, 0.15)',
        marginBottom: '20px',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto 20px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>🔐</span>
        <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 800,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {language === 'العربية' ? 'رمز الاختبار المعتمد' : 'Master QA Test Code'}
          </div>
          <div style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>
            <strong style={{ color: '#00FF24', fontSize: '14px', letterSpacing: '1px' }}>
              582904
            </strong>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onQuickFill}
        style={{
          backgroundColor: '#00FF24',
          color: '#070D0A',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {language === 'العربية' ? 'تعبئة' : 'Autofill'}
      </button>
    </div>
  );
};
