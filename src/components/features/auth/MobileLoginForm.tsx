import React from 'react';
import { User as UserIcon, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { PrimaryButton } from '../../PrimaryButton';
import { CountryCodePicker, type CountryItem } from '../../CountryCodePicker';

interface MobileLoginFormProps {
  fullName: string;
  mobileNumber: string;
  selectedCountry: CountryItem;
  isLoading: boolean;
  errorMessage: string;
  isRtl: boolean;
  language: string;
  t: (key: string, fallback?: string) => string;
  onFullNameChange: (val: string) => void;
  onMobileNumberChange: (val: string) => void;
  onSelectCountry: (country: CountryItem) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

export const MobileLoginForm: React.FC<MobileLoginFormProps> = ({
  fullName,
  mobileNumber,
  selectedCountry,
  isLoading,
  errorMessage,
  isRtl,
  language,
  t,
  onFullNameChange,
  onMobileNumberChange,
  onSelectCountry,
  onSubmit,
}) => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
        backgroundColor: 'rgba(21, 21, 36, 0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '24px 20px',
        boxSizing: 'border-box',
      }}
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Full Name Input */}
        <div>
          <label
            htmlFor="fullname-input"
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#A2A2BA',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            {language === 'العربية'
              ? 'الاسم الكامل (حسب الهوية / الجواز)'
              : 'Full Name (as per ID / Passport)'}
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#151524',
              border: '1px solid #2C2C44',
              borderRadius: '14px',
              padding: '14px 16px',
              transition: 'border-color 0.2s ease',
            }}
          >
            <UserIcon
              size={18}
              color="#7FE87F"
              style={{ marginInlineEnd: '12px', flexShrink: 0 }}
            />
            <input
              id="fullname-input"
              type="text"
              maxLength={60}
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value.slice(0, 60))}
              placeholder={language === 'العربية' ? 'فهد الحربي' : 'Fahad Al-Harbi'}
              required
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                fontWeight: 700,
                color: '#FFFFFF',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* International Mobile Number Input */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <label
              htmlFor="mobile-input"
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#A2A2BA',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                margin: 0,
              }}
            >
              {t('auth.mobile_number', 'Mobile Number')}
            </label>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
            }}
          >
            {/* Dynamic Country Selector */}
            <CountryCodePicker
              selectedCountry={selectedCountry}
              onSelect={onSelectCountry}
              isRtl={isRtl}
            />

            {/* National Phone Number Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#151524',
                border: errorMessage ? '1px solid #EF4444' : '1px solid #2C2C44',
                borderRadius: '14px',
                padding: '14px 16px',
                flex: 1,
                height: '48px',
                boxSizing: 'border-box',
              }}
            >
              <input
                id="mobile-input"
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^\d\s]/g, '');
                  // Format as XXX XXX XXXX for UX
                  const rawDigits = clean.replace(/\D/g, '');
                  let formatted = rawDigits;
                  if (rawDigits.length > 2 && rawDigits.length <= 5) {
                    formatted = `${rawDigits.slice(0, 2)} ${rawDigits.slice(2)}`;
                  } else if (rawDigits.length > 5) {
                    formatted = `${rawDigits.slice(0, 2)} ${rawDigits.slice(2, 5)} ${rawDigits.slice(5)}`;
                  }
                  onMobileNumberChange(formatted);
                }}
                placeholder="50 123 4567"
                maxLength={15}
                required
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  width: '100%',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.05em',
                  direction: 'ltr',
                  textAlign: isRtl ? 'right' : 'left',
                }}
              />
            </div>
          </div>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#F87171',
              fontSize: '12px',
              lineHeight: '1.4',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Submit Button */}
        <div style={{ marginTop: '6px' }}>
          <PrimaryButton
            type="submit"
            disabled={
              mobileNumber.replace(/\s/g, '').trim().length < 9 || fullName.trim().length === 0 || isLoading
            }
          >
            {isLoading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Loader2 size={18} className="spin-animation" />
                <span>{language === 'العربية' ? 'جاري الإرسال...' : 'Sending code...'}</span>
              </div>
            ) : (
              <>
                {t('auth.get_otp', 'Get OTP & Verify')}{' '}
                <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
              </>
            )}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};
