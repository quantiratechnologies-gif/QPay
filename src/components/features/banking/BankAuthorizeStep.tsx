import React from 'react';
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BankAuthorizeStepProps {
  selectedBank: string;
  isAuthorized: boolean;
  otpDigits: string[];
  otpInputRefs: React.RefObject<HTMLInputElement | null>[];
  onOtpChange: (idx: number, val: string) => void;
  onOtpKeyDown: (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onVerifyAndLink: () => void;
  onBackToSelection: () => void;
  onClose: () => void;
  errorMessage: string;
  isLoading: boolean;
  userAlias: string;
  isAr: boolean;
  isRtl: boolean;
  t: (key: string, fallback: string) => string;
}

export const BankAuthorizeStep: React.FC<BankAuthorizeStepProps> = ({
  selectedBank,
  isAuthorized,
  otpDigits,
  otpInputRefs,
  onOtpChange,
  onOtpKeyDown,
  onVerifyAndLink,
  onBackToSelection,
  onClose,
  errorMessage,
  isLoading,
  userAlias,
  isAr,
  isRtl,
  t,
}) => {
  return (
    <div id="otpView" className="otp-container" style={{ display: 'block', textAlign: 'center' }}>
      {!isAuthorized ? (
        <>
          <div
            style={{
              fontSize: '16.5px',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            {isAr ? '????? ??? ?????? ??????' : 'Enter Bank OTP'}
          </div>
          <div style={{ fontSize: '12.5px', color: '#9ca3af', marginBottom: '22px', lineHeight: '1.5' }}>
            {isAr
              ? `???? ????? ??? ?????? ?????? ??? ??? ????? ?????? ???????? ?? ${t(selectedBank, selectedBank)}.`
              : `Please enter the verification code sent to your registered mobile number linked with ${selectedBank}.`}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '22px', direction: 'ltr' }}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={otpInputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onOtpChange(idx, e.target.value)}
                onKeyDown={(e) => onOtpKeyDown(idx, e)}
                className="otp-box"
                autoFocus={idx === 0}
                style={{
                  width: '48px',
                  height: '52px',
                  backgroundColor: '#182236',
                  border: digit ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            ))}
          </div>

          {errorMessage && (
            <div style={{ fontSize: '12px', color: '#FF4757', fontWeight: 700, marginBottom: '14px' }}>
              {errorMessage}
            </div>
          )}

          <button
            className="action-btn interactive-tap"
            onClick={onVerifyAndLink}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#7FE87F',
              color: '#0b0f19',
              border: 'none',
              borderRadius: '16px',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px -5px rgba(127, 232, 127, 0.3)',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />{' '}
                <span>{isAr ? '???? ?????...' : 'Authorizing...'}</span>
              </>
            ) : (
              <span>{isAr ? '????? ???? ??????' : 'Authorize & Link Account'}</span>
            )}
          </button>

          <button
            onClick={onBackToSelection}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '16px',
            }}
          >
            {isAr ? '? ?????? ??????? ?????' : '? Back to bank selection'}
          </button>
        </>
      ) : (
        <div className="fade-in" style={{ padding: '8px 0', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(127, 232, 127, 0.16)',
              border: '1.5px solid #7FE87F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <CheckCircle2 size={36} color="#7FE87F" />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
            {isAr ? '?? ??? ?????? ?????' : 'Bank Account Linked'}
          </h3>

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
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? '?????' : 'Bank'}</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{t(selectedBank, selectedBank)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? '????? ????? (????? ????????)' : 'Payment Alias'}</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#7FE87F', fontFamily: 'monospace' }}>
                {userAlias || 'fahad@sarie'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? '???? ?????' : 'Status'}</span>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#7FE87F', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} color="#7FE87F" />
                {isAr ? '??? ?????' : 'Active'}
              </span>
            </div>
          </div>

          <button
            className="action-btn interactive-tap"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#7FE87F',
              color: '#080c14',
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
            <span>{isAr ? '?? ???????' : 'Done & Return'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
