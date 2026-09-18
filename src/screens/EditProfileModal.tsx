import React, { useState, useEffect, useRef } from 'react';
import { X, User as UserIcon, Phone, Mail, AtSign, Check, AlertCircle, Camera } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { designSystem } from '../design-system';
import { formatSaudiMobile } from '../utils/formatters';

interface EditProfileModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const COLOR_PRESETS = [
  { name: 'Brand Green', color: '#7FE87F' },
  { name: 'Light Mint', color: '#7FE87F' },
  { name: 'Forest Green', color: '#059669' },
  { name: 'Deep Navy', color: '#111726' },
  { name: 'Surface Dark', color: '#182236' },
  { name: 'Slate Accent', color: '#1E293B' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { user, updateUser, isEditProfileModalOpen, setIsEditProfileModalOpen, t, isRtl, language } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpen = propIsOpen !== undefined ? propIsOpen : isEditProfileModalOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setIsEditProfileModalOpen(false);
  };

  const [name, setName] = useState(user.name);
  const [mobile, setMobile] = useState(user.mobile);
  const [upiId, setUpiId] = useState(user.upiId);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [avatarBgColor, setAvatarBgColor] = useState(user.avatarBgColor || '#7FE87F');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setMobile(user.mobile);
      setUpiId(user.upiId);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || '');
      setAvatarBgColor(user.avatarBgColor || '#7FE87F');
      setErrorMsg('');
      setSuccessMsg(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, user]);

  if (!isOpen) return null;

  const previewInitials = name
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'QP';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(language === 'العربية' ? 'يجب أن يكون حجم الصورة أقل من ٥ ميجابايت' : 'Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(language === 'العربية' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 9) {
      setErrorMsg(language === 'العربية' ? 'يرجى إدخال رقم جوال صحيح' : 'Please enter a valid mobile number');
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      setErrorMsg(language === 'العربية' ? 'يرجى إدخال معرف سريع صحيح (مثال: name@sarie)' : 'Please enter a valid Sarie ID (e.g. name@sarie)');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(language === 'العربية' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }

    updateUser({
      name: name.trim(),
      mobile: mobile.trim(),
      upiId: upiId.trim(),
      email: email.trim(),
      avatarUrl: avatarUrl || undefined,
      avatarBgColor,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 15, 26, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={handleClose}
    >
      <div
        className="fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#151524',
          border: '1px solid #2C2C44',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 id="edit-profile-title" style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
            {language === 'العربية' ? 'تعديل بيانات الملف الشخصي' : 'Edit Profile Details'}
          </h3>
          <button
            onClick={handleClose}
            aria-label={t('btn.close', 'Close')}
            style={{
              backgroundColor: '#3A3A52',
              border: 'none',
              color: '#B3B3C2',
              width: '32px',
              height: '32px',
              borderRadius: designSystem.radii.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Profile Header Preview */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px',
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            borderRadius: '14px',
            marginBottom: '20px',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: avatarBgColor,
                color: 'var(--brand-green-ink, #080C14)',
                fontWeight: 900,
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: 'none',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                previewInitials
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload photo"
              style={{
                position: 'absolute',
                bottom: '-2px',
                [isRtl ? 'left' : 'right']: '-2px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-green, #7FE87F)',
                color: 'var(--brand-green-ink, #080C14)',
                border: '2px solid #080c14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={language === 'العربية' ? 'رفع صورة شخصية' : 'Upload Profile Picture'}
            >
              <Camera size={12} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0, textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name || (language === 'العربية' ? 'اسمك الكامل' : 'Your Name')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--brand-green, #7FE87F)', fontWeight: 700, marginTop: '2px' }} dir="ltr">
              {upiId || 'name@sarie'} &bull; {mobile || '+966...'}
            </div>
          </div>
        </div>

        {/* Color Presets */}
        <div style={{ marginBottom: '20px', textAlign: isRtl ? 'right' : 'left' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#B3B3C2', display: 'block', marginBottom: '8px' }}>
            {language === 'العربية' ? 'اختر لون الملف الشخصي' : 'Choose Avatar Color Theme'}
          </span>
          <div role="radiogroup" aria-label="Avatar Color Presets" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                role="radio"
                aria-checked={avatarBgColor === preset.color && !avatarUrl}
                aria-label={preset.name}
                onClick={() => {
                  setAvatarBgColor(preset.color);
                  setAvatarUrl('');
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: preset.color,
                  border: avatarBgColor === preset.color && !avatarUrl ? '3px solid #FFFFFF' : '2px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  transform: avatarBgColor === preset.color && !avatarUrl ? 'scale(1.15)' : 'scale(1)',
                }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 71, 87, 0.15)',
              border: '1px solid #FF4757',
              color: '#FF4757',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        {successMsg ? (
          <div style={{ padding: '30px 0', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <Check size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {language === 'العربية' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile Updated Successfully!'}
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: isRtl ? 'right' : 'left' }}>
            {/* Name */}
            <div>
              <label htmlFor="edit-name-input" style={{ fontSize: '12px', fontWeight: 700, color: '#B3B3C2', display: 'block', marginBottom: '6px' }}>
                {t('auth.full_name', 'Full Name')}
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-green, #7FE87F)' }} />
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
              <label htmlFor="edit-mobile-input" style={{ fontSize: '12px', fontWeight: 700, color: '#B3B3C2', display: 'block', marginBottom: '6px' }}>
                {t('auth.mobile_number', 'Mobile Number')}
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-green, #7FE87F)' }} />
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
              <label htmlFor="edit-upi-input" style={{ fontSize: '12px', fontWeight: 700, color: '#B3B3C2', display: 'block', marginBottom: '6px' }}>
                {t('pay.sarie_id', 'Primary Sarie ID')}
              </label>
              <div style={{ position: 'relative' }}>
                <AtSign size={18} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-green, #7FE87F)' }} />
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
              <label htmlFor="edit-email-input" style={{ fontSize: '12px', fontWeight: 700, color: '#B3B3C2', display: 'block', marginBottom: '6px' }}>
                {language === 'العربية' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-green, #7FE87F)' }} />
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
        )}
      </div>
    </div>
  );
};
