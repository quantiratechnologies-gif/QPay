import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { designSystem } from '../design-system';
import { ProfileAvatarPicker, ProfileFormFields } from '../components/features/profile';

interface EditProfileModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { user, updateUser, isEditProfileModalOpen, setIsEditProfileModalOpen, t, isRtl, language } =
    useApp();

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(language === 'العربية' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 9) {
      setErrorMsg(
        language === 'العربية'
          ? 'يرجى إدخال رقم جوال صحيح'
          : 'Please enter a valid mobile number'
      );
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      setErrorMsg(
        language === 'العربية'
          ? 'يرجى إدخال معرف سريع صحيح (مثال: name@sarie)'
          : 'Please enter a valid Sarie ID (e.g. name@sarie)'
      );
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(
        language === 'العربية'
          ? 'يرجى إدخال بريد إلكتروني صحيح'
          : 'Please enter a valid email address'
      );
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
      window.dispatchEvent(new Event('profile-updated'));
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3
            id="edit-profile-title"
            style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}
          >
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

        <ProfileAvatarPicker
          name={name}
          mobile={mobile}
          upiId={upiId}
          avatarUrl={avatarUrl}
          avatarBgColor={avatarBgColor}
          isRtl={isRtl}
          language={language}
          onAvatarUrlChange={setAvatarUrl}
          onAvatarBgColorChange={setAvatarBgColor}
          onError={setErrorMsg}
        />

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
              {language === 'العربية'
                ? 'تم تحديث الملف الشخصي بنجاح!'
                : 'Profile Updated Successfully!'}
            </h4>
          </div>
        ) : (
          <ProfileFormFields
            name={name}
            mobile={mobile}
            upiId={upiId}
            email={email}
            isRtl={isRtl}
            language={language}
            t={t}
            setName={setName}
            setMobile={setMobile}
            setUpiId={setUpiId}
            setEmail={setEmail}
            onSubmit={handleSave}
          />
        )}
      </div>
    </div>
  );
};
