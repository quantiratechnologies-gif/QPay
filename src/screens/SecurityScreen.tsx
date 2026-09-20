import React, { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import {
  BiometricsCard,
  DailyLimitCard,
  MpinCard,
  ActiveDevicesCard,
  DailyLimitModal,
} from '../components/features/security';

export const SecurityScreen: React.FC = () => {
  const { deviceSessions, terminateSession, language, navigateTo, isRtl } = useApp();
  const isAr = language === '???????' || language === 'ar';

  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('qpay_biometrics_enabled') !== 'false';
  });
  const [dailyLimit, setDailyLimit] = useState<number>(() => {
    const saved = localStorage.getItem('qpay_daily_limit');
    return saved ? parseInt(saved, 10) : 50000;
  });
  const [isLimitModalOpen, setIsLimitModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleBiometrics = () => {
    const next = !biometricsEnabled;
    setBiometricsEnabled(next);
    localStorage.setItem('qpay_biometrics_enabled', String(next));
    showToast(
      next
        ? isAr ? '?? ????? ?????? ??????? / Face ID' : 'Biometrics (Face ID / Fingerprint) enabled'
        : isAr ? '?? ????? ?????? ???????' : 'Biometrics disabled'
    );
  };

  const handleSaveLimit = (limit: number) => {
    setDailyLimit(limit);
    localStorage.setItem('qpay_daily_limit', String(limit));
    setIsLimitModalOpen(false);
    showToast(
      isAr
        ? `?? ????? ???? ?????? ??? ${limit.toLocaleString()} ?.?`
        : `Daily Sarie limit updated to SAR ${limit.toLocaleString()}`
    );
  };

  const usedToday = 4800;

  return (
    <div className="fade-in" style={{ backgroundColor: '#080C14', minHeight: '100vh', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader
        title={isAr ? '?????? ????????' : 'Security & Devices'}
        showBack={true}
        showSettings={false}
        onBack={() => navigateTo('PROFILE')}
      />

      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#182236',
            border: '1px solid #7FE87F',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '24px',
            fontSize: '12.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          <CheckCircle2 size={16} color="#7FE87F" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <BiometricsCard
          biometricsEnabled={biometricsEnabled}
          onToggle={handleToggleBiometrics}
          isAr={isAr}
          isRtl={isRtl}
        />

        <DailyLimitCard
          dailyLimit={dailyLimit}
          usedToday={usedToday}
          onOpenLimitModal={() => setIsLimitModalOpen(true)}
          onNavigateLimits={() => navigateTo('TRANSFER_LIMITS')}
          language={language}
          isAr={isAr}
          isRtl={isRtl}
        />

        <MpinCard
          onNavigateSetPin={() => navigateTo('SET_PIN', { fromSettings: true })}
          isAr={isAr}
        />

        <ActiveDevicesCard
          deviceSessions={deviceSessions}
          onTerminateSession={terminateSession}
          language={language}
          isAr={isAr}
        />

        <div style={{ marginTop: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Lock size={13} color="#6B7A90" />
          <span style={{ fontSize: '11.5px', color: '#6B7A90', fontWeight: 600 }}>
            {isAr ? '?? ????? ??????? ??????? ??????? ??????' : 'Automated session security enabled'}
          </span>
        </div>
      </div>

      <DailyLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        currentLimit={dailyLimit}
        onSaveLimit={handleSaveLimit}
        isAr={isAr}
      />
    </div>
  );
};
export default SecurityScreen;
