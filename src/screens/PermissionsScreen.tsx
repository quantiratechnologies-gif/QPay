import React, { useState } from 'react';
import { MessageSquare, Phone, Users, Camera, MapPin, Mic, ArrowRight, Lock } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';

export const PermissionsScreen: React.FC = () => {
  const { navigateTo, goBack, t, isRtl, language } = useApp();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    sms: true,
    phone: true,
    contacts: true,
    camera: true,
    location: true,
    mic: false,
  });

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const permissions = [
    {
      key: 'sms',
      icon: <MessageSquare size={19} />,
      name: language === 'العربية' ? 'الرسائل النصية (SMS)' : 'SMS Verification',
      required: true,
    },
    {
      key: 'phone',
      icon: <Phone size={19} />,
      name: language === 'العربية' ? 'حالة الشريحة والجهاز' : 'Phone & SIM Status',
      required: true,
    },
    {
      key: 'contacts',
      icon: <Users size={19} />,
      name: language === 'العربية' ? 'جهات الاتصال' : 'Contacts',
      required: false,
    },
    {
      key: 'camera',
      icon: <Camera size={19} />,
      name: language === 'العربية' ? 'الكاميرا (مسح QR)' : 'Camera (QR Scanner)',
      required: false,
    },
    {
      key: 'location',
      icon: <MapPin size={19} />,
      name: language === 'العربية' ? 'الموقع الجغرافي' : 'Location',
      required: false,
    },
    {
      key: 'mic',
      icon: <Mic size={19} />,
      name: language === 'العربية' ? 'الميكروفون' : 'Microphone',
      required: false,
    },
  ];

  const handleGrantPermissions = () => {
    try {
      localStorage.setItem('hasGrantedPermissions', 'true');
    } catch {
      // Ignore
    }
    navigateTo('ONBOARDING_KYC');
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#070D0A', backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(127, 232, 127, 0.14) 0%, rgba(7, 13, 10, 0.98) 60%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '32px', color: '#FFFFFF' }}>
      <div>
        <AppHeader title={t('auth.permissions_title', 'App Permissions')} showBack={true} onBack={goBack} showSettings={false} />

        <div style={{ padding: '20px' }}>
          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#8E9BAE',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
              paddingInlineStart: '4px',
            }}
          >
            {language === 'العربية'
              ? `صلاحيات الجهاز (تم منح ${Object.values(toggles).filter(Boolean).length}/٦)`
              : `Device Permissions (${Object.values(toggles).filter(Boolean).length}/6 Granted)`}
          </div>

          {/* Grouped Permissions Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface, #111726)',
              borderRadius: '16px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              overflow: 'hidden',
            }}
          >
            {permissions.map((perm, index) => {
              const isOn = toggles[perm.key];
              return (
                <React.Fragment key={perm.key}>
                  {index > 0 && <div style={{ height: '1px', backgroundColor: 'var(--color-border, rgba(255, 255, 255, 0.06))', margin: '0 16px' }} />}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: isOn ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))' : 'var(--color-surface-elevated, #182236)',
                          color: isOn ? 'var(--brand-green, #7FE87F)' : '#8E9BAE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {perm.icon}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>
                          {perm.name}
                        </span>
                        {perm.required && (
                          <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))', color: 'var(--brand-green, #7FE87F)', padding: '2px 6px', borderRadius: '4px' }}>
                            {language === 'العربية' ? 'إلزامي' : 'REQUIRED'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Switch Toggle */}
                    <div
                      role="switch"
                      aria-checked={isOn}
                      aria-label={perm.name}
                      tabIndex={0}
                      onClick={() => handleToggle(perm.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleToggle(perm.key);
                        }
                      }}
                      style={{
                        width: '46px',
                        height: '26px',
                        borderRadius: '9999px',
                        backgroundColor: isOn ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface-elevated, #182236)',
                        border: isOn ? 'none' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0,
                        direction: 'ltr',
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: isOn ? 'var(--brand-green-ink, #080C14)' : '#8E9BAE',
                          transform: isOn ? 'translateX(20px)' : 'translateX(0px)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <PrimaryButton onClick={handleGrantPermissions}>
          {t('auth.allow_continue', 'Allow & Continue')}{' '}
          <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
        </PrimaryButton>

        <div style={{ textAlign: 'center', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Lock size={12} color="#6B7A90" />
          <span style={{ fontSize: '11px', color: '#6B7A90', fontWeight: 600 }}>
            {language === 'العربية' ? 'تشفير أجهزة متقدم بمستوى ٢٥٦ بت' : '256-Bit Hardware Encrypted'}
          </span>
        </div>
      </div>
    </div>
  );
};
