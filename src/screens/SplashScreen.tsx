import React, { useEffect } from 'react';
import { AlphPayLogo } from '../components/AlphPayLogo';
import { QuantiraLogo } from '../components/QuantiraLogo';
import { useApp } from '../state/AppContext';

export const SplashScreen: React.FC = () => {
  const { navigateTo, language } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      const isCompleted = typeof window !== 'undefined' && localStorage.getItem('hasCompletedOnboarding') === 'true';
      if (isCompleted) {
        navigateTo('HOME');
      } else {
        navigateTo('ONBOARDING');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigateTo]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070D0A',
        backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(127, 232, 127, 0.16) 0%, rgba(7, 13, 10, 0.95) 70%)',
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

      {/* Central App Brand Logo with Ambient Aura */}
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
        <div
          style={{
            position: 'absolute',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            backgroundColor: 'rgba(127, 232, 127, 0.22)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
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
