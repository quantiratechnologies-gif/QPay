import React from 'react';

interface OtpDigitsInputProps {
  otp: string[];
  inputRefs: React.RefObject<HTMLInputElement | null>[];
  onOtpChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const OtpDigitsInput: React.FC<OtpDigitsInputProps> = ({
  otp,
  inputRefs,
  onOtpChange,
  onKeyDown,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
        marginBottom: '24px',
        direction: 'ltr',
      }}
    >
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onOtpChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          style={{
            width: '44px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#151524',
            border: digit ? '1.5px solid var(--brand-green, #7FE87F)' : '1px solid #2C2C44',
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: 800,
            textAlign: 'center',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
        />
      ))}
    </div>
  );
};
