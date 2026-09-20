import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { ProfileHeroCard, ProfileMenuSections } from '../components/features/profile';

export const ProfileScreen: React.FC = () => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleProfileUpdate = () => setShowToast(true);
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const {
    user,
    language,
    navigateTo,
    setIsLanguageModalOpen,
    setIsLogoutModalOpen,
    setIsEditProfileModalOpen,
    setIsKycModalOpen,
    isKycVerified,
    isBiometricsEnabled,
    t,
    isRtl,
  } = useApp();

  const displayName = t(user.name, user.name);

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#080c14',
        minHeight: '100%',
        paddingBottom: '96px',
      }}
    >
      {showToast && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: 'rgba(127, 232, 127, 0.16)',
            border: '1px solid #7FE87F',
            color: '#7FE87F',
            padding: '10px 18px',
            borderRadius: '30px',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <CheckCircle2 size={16} />
          {language === 'العربية'
            ? 'تم تحديث الملف الشخصي بنجاح'
            : 'Profile Updated Successfully'}
        </div>
      )}

      <AppHeader
        title={t('profile.title', 'Profile')}
        showSettings={false}
        showBack={true}
        onBack={() => navigateTo('HOME')}
      />

      <ProfileHeroCard
        user={user}
        displayName={displayName}
        isKycVerified={isKycVerified}
        isRtl={isRtl}
        language={language}
        t={t}
        onGoHome={() => navigateTo('HOME')}
        onOpenKyc={() => setIsKycModalOpen(true)}
        onEditProfile={() => setIsEditProfileModalOpen(true)}
        onOpenQr={() => navigateTo('RECEIVE')}
      />

      <ProfileMenuSections
        language={language}
        isKycVerified={isKycVerified}
        isBiometricsEnabled={isBiometricsEnabled}
        onNavigate={navigateTo}
        onOpenKycModal={() => setIsKycModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />
    </div>
  );
};
