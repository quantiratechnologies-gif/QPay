import React, { useEffect } from 'react';
import { AlphPayLogo } from '../components/AlphPayLogo';
import { QuantiraLogo } from '../components/QuantiraLogo';
import { useApp } from '../state/AppContext';

export const SplashScreen: React.FC = () => {
  const { navigateTo, language } = useApp();

  const handleProceed = () => {
    const hasSeenOnboarding = typeof window !== 'undefined' && localStorage.getItem('hasSeenOnboarding') === 'true';
    if (hasSeenOnboarding) {
      navigateTo('MOBILE_NUMBER');
    } else {
      navigateTo('ONBOARDING');
    }
  };

  useEffect(() => {
    const timer = setTimeout(handleProceed, 1800);
    return () => clearTimeout(timer);
  }, [navigateTo]);

  return (
    <div
      onClick={handleProceed}
      style={{
        cursor: 'pointer',
        minHeight: '100vh',
        backgroundColor: '#070D0A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 24px 44px 24px',
        boxSizing: 'border-box',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Spacer */}
      <div style={{ height: '30px' }} />

      {/* Central App Brand Logo */}
      <div
        className="fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <AlphPayLogo variant="horizontal" size={48} themeMode="dark" />
        <div
          style={{
            marginTop: '12px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: '#86efac',
            textTransform: 'uppercase',
          }}
        >
          {language === 'العربية' ? 'مدفوعات سريعة • موثوقة • فورية' : 'Quick • Trusted • Payments'}
        </div>
      </div>

      {/* Bottom Center: Powered by Quantira Technologies */}
      <div
        className="fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#6E6E85',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {language === 'العربية' ? 'مشغل بواسطة' : 'powered by'}
        </span>
        <QuantiraLogo size={22} color="#7FE87F" textColor="#E2E2F0" />
      </div>
    </div>
  );
};
