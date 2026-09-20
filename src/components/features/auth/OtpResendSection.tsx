import React from 'react';
import { Loader2 } from 'lucide-react';

interface OtpResendSectionProps {
  timer: number;
  isResending: boolean;
  language: string;
  t: (key: string, fallback?: string) => string;
  onResend: () => void;
}

export const OtpResendSection: React.FC<OtpResendSectionProps> = ({
  timer,
  isResending,
  language,
  t,
  onResend,
}) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {timer > 0 ? (
        <p style={{ fontSize: '13px', color: '#A2A2BA', margin: 0 }}>
          {t('auth.resend_in', 'Resend code in')}{' '}
          <span style={{ color: '#FFFFFF', fontWeight: 800, fontFamily: 'monospace' }}>
            00:{timer < 10 ? `0${timer}` : timer}
          </span>
        </p>
      ) : (
        <button
          onClick={onResend}
          disabled={isResending}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--brand-green, #7FE87F)',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isResending ? (
            <>
              <Loader2 size={14} className="spin-animation" />
              <span>{language === 'العربية' ? 'جاري الإرسال...' : 'Resending...'}</span>
            </>
          ) : (
            t('auth.resend_otp', 'Resend OTP')
          )}
        </button>
      )}
    </div>
  );
};
