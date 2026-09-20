import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

export const COLOR_PRESETS = [
  { name: 'Brand Green', color: '#7FE87F' },
  { name: 'Light Mint', color: '#7FE87F' },
  { name: 'Forest Green', color: '#059669' },
  { name: 'Deep Navy', color: '#111726' },
  { name: 'Surface Dark', color: '#182236' },
  { name: 'Slate Accent', color: '#1E293B' },
];

interface ProfileAvatarPickerProps {
  name: string;
  mobile: string;
  upiId: string;
  avatarUrl: string;
  avatarBgColor: string;
  isRtl: boolean;
  language: string;
  onAvatarUrlChange: (url: string) => void;
  onAvatarBgColorChange: (color: string) => void;
  onError: (msg: string) => void;
}

export const ProfileAvatarPicker: React.FC<ProfileAvatarPickerProps> = ({
  name,
  mobile,
  upiId,
  avatarUrl,
  avatarBgColor,
  isRtl,
  language,
  onAvatarUrlChange,
  onAvatarBgColorChange,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewInitials =
    name
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
        onError(
          language === 'العربية'
            ? 'يجب أن يكون حجم الصورة أقل من ٥ ميجابايت'
            : 'Image size should be less than 5MB'
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onAvatarUrlChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
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
              <img
                src={avatarUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name || (language === 'العربية' ? 'اسمك الكامل' : 'Your Name')}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--brand-green, #7FE87F)',
              fontWeight: 700,
              marginTop: '2px',
            }}
            dir="ltr"
          >
            {upiId || 'name@sarie'} &bull; {mobile || '+966...'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', textAlign: isRtl ? 'right' : 'left' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#B3B3C2',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          {language === 'العربية' ? 'اختر لون الملف الشخصي' : 'Choose Avatar Color Theme'}
        </span>
        <div
          role="radiogroup"
          aria-label="Avatar Color Presets"
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.color}
              type="button"
              role="radio"
              aria-checked={avatarBgColor === preset.color && !avatarUrl}
              aria-label={preset.name}
              onClick={() => {
                onAvatarBgColorChange(preset.color);
                onAvatarUrlChange('');
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: preset.color,
                border:
                  avatarBgColor === preset.color && !avatarUrl
                    ? '3px solid #FFFFFF'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                transform:
                  avatarBgColor === preset.color && !avatarUrl ? 'scale(1.15)' : 'scale(1)',
              }}
              title={preset.name}
            />
          ))}
        </div>
      </div>
    </>
  );
};
