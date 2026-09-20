import React from 'react';
import { Edit3, QrCode, ShieldCheck } from 'lucide-react';

interface ProfileHeroCardProps {
  user: {
    name: string;
    mobile: string;
    upiId: string;
    email: string;
    avatarUrl?: string;
    avatarInitials?: string;
  };
  displayName: string;
  isKycVerified: boolean;
  isRtl: boolean;
  language: string;
  t: (key: string, fallback?: string) => string;
  onGoHome: () => void;
  onOpenKyc: () => void;
  onEditProfile: () => void;
  onOpenQr: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  user,
  displayName,
  isKycVerified,
  isRtl,
  language,
  t,
  onGoHome,
  onOpenKyc,
  onEditProfile,
  onOpenQr,
}) => {
  return (
    <div
      style={{
        margin: '16px 20px 24px 20px',
        backgroundColor: '#111726',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '24px 20px',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Avatar with Edit Badge */}
      <div style={{ position: 'relative', marginBottom: '14px', marginTop: '6px' }}>
        <div
          onClick={onGoHome}
          role="button"
          tabIndex={0}
          aria-label={language === 'العربية' ? 'الذهاب للرئيسية' : 'Go to Home'}
          className="interactive-tap"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#182236',
            color: '#7FE87F',
            fontWeight: '800',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '2px solid #7FE87F',
            cursor: 'pointer',
          }}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            user.avatarInitials
          )}
        </div>
        <button
          onClick={onEditProfile}
          aria-label={t('btn.edit_profile', 'Edit profile picture')}
          className="interactive-tap"
          style={{
            position: 'absolute',
            bottom: '0',
            [isRtl ? 'left' : 'right']: '-2px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#182236',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7FE87F',
            cursor: 'pointer',
            boxShadow: 'none',
          }}
          title={t('btn.edit_profile', 'Edit Profile')}
        >
          <Edit3 size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* User Details with Integrated Verified Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {displayName}
        </h2>

        {isKycVerified ? (
          <div
            onClick={onOpenKyc}
            role="button"
            tabIndex={0}
            className="interactive-tap"
            title={language === 'العربية' ? 'هوية موثقة' : 'ID Verified'}
            style={{
              backgroundColor: 'rgba(127, 232, 127, 0.16)',
              border: '1px solid #7FE87F',
              borderRadius: '20px',
              padding: '3px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#7FE87F',
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={12} color="#7FE87F" />
            <span>{language === 'العربية' ? 'هوية موثقة' : 'ID VERIFIED'}</span>
          </div>
        ) : (
          <button
            onClick={onOpenKyc}
            className="interactive-tap"
            style={{
              backgroundColor: 'rgba(255, 179, 0, 0.15)',
              border: '1px solid #FFB300',
              borderRadius: '20px',
              padding: '3px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#FFB300',
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={12} color="#FFB300" />
            <span>{language === 'العربية' ? 'توثيق الهوية' : 'VERIFY ID'}</span>
          </button>
        )}
      </div>
      <div
        style={{
          fontSize: '12px',
          color: '#7FE87F',
          fontWeight: '700',
          marginTop: '4px',
          letterSpacing: '0.01em',
        }}
        dir="ltr"
      >
        {user.upiId} • {user.mobile}
      </div>
      <div
        style={{
          fontSize: '11px',
          color: '#9ca3af',
          fontWeight: '600',
          marginTop: '3px',
        }}
      >
        {user.email}
      </div>

      {/* Action Buttons: Edit Profile & My QR Code */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '18px',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={onEditProfile}
          className="interactive-tap"
          style={{
            flex: 1,
            maxWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: '#7FE87F',
            border: 'none',
            color: '#080c14',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(127, 232, 127, 0.22)',
          }}
        >
          <Edit3 size={14} color="#080c14" />
          {t('btn.edit_profile', 'Edit Profile')}
        </button>
        <button
          onClick={onOpenQr}
          className="interactive-tap"
          style={{
            flex: 1,
            maxWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: '#182236',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: 'none',
          }}
        >
          <QrCode size={14} color="#7FE87F" />
          {language === 'العربية' ? 'الرمز الخاص بي' : 'My QR'}
        </button>
      </div>
    </div>
  );
};
