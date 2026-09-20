import React from 'react';
import { User as UserIcon, Phone, Mail, AtSign } from 'lucide-react';
import { formatSaudiMobile } from '../../../utils/formatters';

interface ProfileFormFieldsProps {
  name: string;
  mobile: string;
  upiId: string;
  email: string;
  isRtl: boolean;
  language: string;
  t: (key: string, fallback: string) => string;
  setName: (v: string) => void;
  setMobile: (v: string) => void;
  setUpiId: (v: string) => void;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  name,
  mobile,
  upiId,
  email,
  isRtl,
  language,
  t,
  setName,
  setMobile,
  setUpiId,
  setEmail,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        textAlign: isRtl ? 'right' : 'left',
      }}
    >
      {/* Name */}
      <div>
        <label
          htmlFor="edit-name-input"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#B3B3C2',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          {t('auth.full_name', 'Full Name')}
        </label>
        <div style={{ position: 'relative' }}>
          <UserIcon
            size={18}
            style={{
              position: 'absolute',
              [isRtl ? 'right' : 'left']: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--brand-green, #7FE87F)',
            }}
          />
          <input
            id="edit-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'العربية' ? 'فهد الحربي' : 'Enter full name'}
            required
            style={{
              width: '100%',
              padding: isRtl ? '12px 42px 12px 14px' : '12px 14px 12px 42px',
              borderRadius: '12px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
              textAlign: isRtl ? 'right' : 'left',
            }}
          />
        </div>
      </div>

      {/* Mobile Number */}
      <div>
        <label
          htmlFor="edit-mobile-input"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#B3B3C2',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          {t('auth.mobile_number', 'Mobile Number')}
        </label>
        <div style={{ position: 'relative' }}>
          <Phone
            size={18}
            style={{
              position: 'absolute',
              [isRtl ? 'right' : 'left']: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--brand-green, #7FE87F)',
            }}
          />
          <input
            id="edit-mobile-input"
            type="tel"
            value={mobile}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              if (raw.length <= 12) {
                setMobile(formatSaudiMobile(e.target.value));
              }
            }}
            placeholder="+966 50 123 4567"
            maxLength={16}
            required
            style={{
              width: '100%',
              padding: isRtl ? '12px 42px 12px 14px' : '12px 14px 12px 42px',
              borderRadius: '12px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
              direction: 'ltr',
              textAlign: isRtl ? 'right' : 'left',
            }}
          />
        </div>
      </div>

      {/* UPI ID */}
      <div>
        <label
          htmlFor="edit-upi-input"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#B3B3C2',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          {t('pay.sarie_id', 'Primary Sarie ID')}
        </label>
        <div style={{ position: 'relative' }}>
          <AtSign
            size={18}
            style={{
              position: 'absolute',
              [isRtl ? 'right' : 'left']: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--brand-green, #7FE87F)',
            }}
          />
          <input
            id="edit-upi-input"
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="fahad@sarie"
            required
            style={{
              width: '100%',
              padding: isRtl ? '12px 42px 12px 14px' : '12px 14px 12px 42px',
              borderRadius: '12px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
              direction: 'ltr',
              textAlign: isRtl ? 'right' : 'left',
            }}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="edit-email-input"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#B3B3C2',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          {language === 'العربية' ? 'البريد الإلكتروني' : 'Email Address'}
        </label>
        <div style={{ position: 'relative' }}>
          <Mail
            size={18}
            style={{
              position: 'absolute',
              [isRtl ? 'right' : 'left']: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--brand-green, #7FE87F)',
            }}
          />
          <input
            id="edit-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="fahad@example.com"
            required
            style={{
              width: '100%',
              padding: isRtl ? '12px 42px 12px 14px' : '12px 14px 12px 42px',
              borderRadius: '12px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
              direction: 'ltr',
              textAlign: isRtl ? 'right' : 'left',
            }}
          />
        </div>
      </div>

      {/* Save Action Button */}
      <button
        type="submit"
        className="interactive-tap"
        style={{
          width: '100%',
          backgroundColor: 'var(--brand-green, #7FE87F)',
          color: 'var(--brand-green-ink, #080C14)',
          border: 'none',
          borderRadius: '12px',
          padding: '14px',
          fontWeight: 800,
          fontSize: '15px',
          cursor: 'pointer',
          marginTop: '10px',
        }}
      >
        {t('btn.save', 'Save Changes')}
      </button>
    </form>
  );
};
