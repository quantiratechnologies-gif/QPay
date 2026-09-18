import React, { useState, useEffect } from 'react';
import { Home, PieChart, QrCode, Clock, User } from 'lucide-react';
import { useApp } from '../state/AppContext';
import type { BottomTab } from '../types';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, t, language } = useApp();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // Detect when input fields are focused (keyboard open on mobile)
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('contenteditable') === 'true')) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    // Also listen to visualViewport height shrinkage for mobile browsers
    const handleViewportResize = () => {
      if (window.visualViewport) {
        const heightRatio = window.visualViewport.height / window.innerHeight;
        setIsKeyboardOpen(heightRatio < 0.78);
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportResize);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, []);

  const tabs: { id: BottomTab; label: string; verified?: boolean; icon: (active: boolean) => React.ReactNode }[] = [
    { id: 'home', label: t('nav.home', 'Home'), icon: (a) => <Home size={20} strokeWidth={a ? 2.5 : 1.8} /> },
    { id: 'spend', label: language === 'العربية' ? 'التحليلات' : 'Analytics', icon: (a) => <PieChart size={20} strokeWidth={a ? 2.5 : 1.8} /> },
    { id: 'scan', label: t('nav.scan', 'Scan'), icon: () => <QrCode size={24} strokeWidth={2.2} /> },
    { id: 'history', label: t('nav.history', 'History'), icon: (a) => <Clock size={20} strokeWidth={a ? 2.5 : 1.8} /> },
    { id: 'profile', label: t('nav.profile', 'Profile'), verified: true, icon: (a) => <User size={20} strokeWidth={a ? 2.5 : 1.8} /> },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        height: 'calc(68px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'rgba(11, 11, 20, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #2C2C44',
        display: isKeyboardOpen ? 'none' : 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingLeft: '8px',
        paddingRight: '8px',
        zIndex: 999,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
        transform: isKeyboardOpen ? 'translateY(100%)' : 'translateY(0)',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        opacity: isKeyboardOpen ? 0 : 1,
        pointerEvents: isKeyboardOpen ? 'none' : 'auto',
        boxSizing: 'border-box',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isScan = tab.id === 'scan';

        if (isScan) {
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveTab(tab.id);
                }
              }}
              style={{
                position: 'relative',
                top: '-18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 45,
                transition: 'transform 0.12s ease',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#7FE87F',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3.5px solid #0B0B14',
                  outline: '1.5px solid #7FE87F',
                  boxShadow: 'none',
                  transition: 'transform 0.15s ease',
                }}
              >
                {tab.icon(isActive)}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#7FE87F',
                  marginTop: '2px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {tab.label}
              </span>
            </div>
          );
        }

        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveTab(tab.id);
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              cursor: 'pointer',
              color: isActive ? '#7FE87F' : '#808099',
              transition: 'color 0.15s ease',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', transform: isActive ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.15s ease' }}>
              {tab.icon(isActive)}
              {tab.verified && (
                <span
                  title={t('profile.verified_kyc', 'Verified')}
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-4px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#7FE87F',
                    border: '1.5px solid #0B0B14',
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#FFFFFF' : '#808099',
                marginTop: '3px',
                letterSpacing: '-0.01em',
              }}
            >
              {tab.label}
            </span>

            {/* Active Subtle Bottom Indicator Pill */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  width: '14px',
                  height: '2.5px',
                  borderRadius: '2px',
                  backgroundColor: '#7FE87F',
                }}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
};
