import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { toArabicNumerals } from '../utils/i18n';

interface PinPadProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: string;
  successMessage?: string;
  customTitle?: string;
}

export const PinPad: React.FC<PinPadProps> = ({
  length = 4,
  onComplete,
  error,
  successMessage,
  customTitle,
}) => {
  const { language } = useApp();
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const resetTimerRef = React.useRef<any>(null);

  useEffect(() => {
    setLocalError(error);
    if (error) {
      setIsShaking(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
    }
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [error]);

  const handleKeyPress = (num: string) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
      setIsShaking(false);
    }
    setLocalError(undefined);

    if (pin.length < length) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === length) {
        setTimeout(() => {
          onComplete(nextPin);
        }, 120);
      }
    }
  };

  const handleDelete = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
      setIsShaking(false);
    }
    setLocalError(undefined);

    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, length]);

  // Determine Title Text and Color
  let titleText = customTitle;
  let titleColor = '#9ca3af';

  if (localError) {
    titleText = localError;
    titleColor = '#f87171';
  } else if (successMessage) {
    titleText = successMessage;
    titleColor = '#7FE87F';
  } else if (!titleText) {
    titleText = language === 'العربية' ? 'أدخل الرمز السري المكون من ٤ أرقام' : 'Enter 4-Digit PIN';
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  return (
    <div
      className={isShaking ? 'shake' : ''}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* PIN Indicators Section */}
      <div className="pin-section" style={{ textAlign: 'center', marginBottom: '24px', width: '100%' }}>
        <div
          className="pin-title"
          id="pin-label"
          style={{
            fontSize: '11px',
            letterSpacing: '1.5px',
            color: titleColor,
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '16px',
            transition: 'color 0.2s',
          }}
        >
          {titleText}
        </div>

        <div
          className="pin-dots"
          id="pin-dots"
          role="group"
          aria-label={`PIN input, ${pin.length} of ${length} digits entered`}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            direction: 'ltr',
          }}
        >
          {Array.from({ length }).map((_, index) => {
            const isFilled = index < pin.length;
            const isError = Boolean(localError);
            return (
              <div
                key={index}
                className={`dot ${isFilled ? 'active' : ''} ${isError ? 'error' : ''}`}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isError
                    ? '#f87171'
                    : isFilled
                    ? '#7FE87F'
                    : 'rgba(255, 255, 255, 0.1)',
                  transform: isFilled ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: isError
                    ? '0 0 12px rgba(248, 113, 113, 0.5)'
                    : isFilled
                    ? '0 0 12px rgba(127, 232, 127, 0.5)'
                    : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Keypad Grid */}
      <div
        className="keypad"
        role="group"
        aria-label="Numeric PIN keypad"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          width: '100%',
          maxWidth: '380px',
          direction: 'ltr',
        }}
      >
        {keys.map((key, i) => {
          if (key === '') {
            return <div key={i} className="key action-key" style={{ background: 'transparent', border: 'none' }} />;
          }

          if (key === 'delete') {
            return (
              <button
                key={i}
                type="button"
                onClick={handleDelete}
                aria-label="Backspace"
                className="key action-key"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  borderRadius: '14px',
                  height: '56px',
                  fontSize: '22px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  userSelect: 'none',
                }}
              >
                ⌫
              </button>
            );
          }

          const displayDigit = language === 'العربية' ? toArabicNumerals(key) : key;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleKeyPress(key)}
              aria-label={`Digit ${key}`}
              className="key"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '14px',
                height: '56px',
                fontSize: '22px',
                fontWeight: 500,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                userSelect: 'none',
              }}
            >
              {displayDigit}
            </button>
          );
        })}
      </div>
    </div>
  );
};
