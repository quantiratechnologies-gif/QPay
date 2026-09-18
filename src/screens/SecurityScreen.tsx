import React, { useState } from 'react';
import { Smartphone, Monitor, ShieldCheck, LogOut, Lock, Sliders, CheckCircle2, X, Fingerprint, ChevronRight } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { formatLocalizedNumber, translateText, formatSaudiCurrency } from '../utils/i18n';

export const SecurityScreen: React.FC = () => {
  const { deviceSessions, terminateSession, language, navigateTo, isRtl } = useApp();
  const isAr = language === 'العربية' || language === 'ar';

  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('qpay_biometrics_enabled') !== 'false';
  });
  const [dailyLimit, setDailyLimit] = useState<number>(() => {
    const saved = localStorage.getItem('qpay_daily_limit');
    return saved ? parseInt(saved, 10) : 50000;
  });
  const [isLimitModalOpen, setIsLimitModalOpen] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(dailyLimit);
  const [customAmount, setCustomAmount] = useState<string>('');
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
        ? isAr ? 'تم تفعيل الدخول بالبصمة / Face ID' : 'Biometrics (Face ID / Fingerprint) enabled'
        : isAr ? 'تم إيقاف الدخول بالبصمة' : 'Biometrics disabled'
    );
  };

  const handleSaveLimit = () => {
    let finalLimit = selectedPreset;
    if (selectedPreset === -1) {
      const parsed = parseInt(customAmount, 10);
      if (isNaN(parsed) || parsed < 1000 || parsed > 100000) {
        showToast(isAr ? 'الحد المسموح بين ١,٠٠٠ و ١٠٠,٠٠٠ ر.س' : 'Allowed limit between SAR 1,000 and 100,000');
        return;
      }
      finalLimit = parsed;
    }
    setDailyLimit(finalLimit);
    localStorage.setItem('qpay_daily_limit', String(finalLimit));
    setIsLimitModalOpen(false);
    showToast(isAr ? `تم تحديث الحد اليومي إلى ${finalLimit.toLocaleString()} ر.س` : `Daily Sarie limit updated to SAR ${finalLimit.toLocaleString()}`);
  };

  const usedToday = 4800;
  const remainingLimit = Math.max(0, dailyLimit - usedToday);
  const usedPercentage = Math.min(100, Math.round((usedToday / dailyLimit) * 100));

  return (
    <div className="fade-in" style={{ backgroundColor: '#080C14', minHeight: '100vh', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader
        title={isAr ? 'الأمان والأجهزة' : 'Security & Devices'}
        showBack={true}
        showSettings={false}
        onBack={() => navigateTo('PROFILE')}
      />

      {/* Toast Notification */}
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
        {/* Biometrics Toggle Card (USER-19) */}
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, paddingInlineEnd: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: biometricsEnabled ? 'rgba(127, 232, 127, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                color: biometricsEnabled ? '#7FE87F' : '#8E9BAE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.3s ease',
              }}
            >
              <Fingerprint size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>
                {isAr ? 'بصمة الوجه / الإصبع (Biometrics)' : 'Face ID / Fingerprint'}
              </div>
              <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '3px', lineHeight: 1.4 }}>
                {isAr
                  ? 'تسجيل الدخول وتأكيد الحوالات فورياً عبر المستشعر الحيوي'
                  : 'Fast authentication for app login and Sarie instant transfers'}
              </div>
            </div>
          </div>

          {/* Interactive Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={biometricsEnabled}
            aria-label={isAr ? 'تفعيل البصمة' : 'Toggle Biometrics'}
            onClick={handleToggleBiometrics}
            className="interactive-tap"
            style={{
              width: '54px',
              height: '30px',
              borderRadius: '15px',
              backgroundColor: biometricsEnabled ? '#7FE87F' : '#2A344A',
              border: 'none',
              padding: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: biometricsEnabled ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start'),
              transition: 'background-color 0.25s ease',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: biometricsEnabled ? '#080C14' : '#8E9BAE',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                transition: 'all 0.25s ease',
              }}
            />
          </button>
        </div>

        {/* 256-Bit Security Status HUD Card */}
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: biometricsEnabled ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))' : 'rgba(255, 255, 255, 0.05)',
                color: biometricsEnabled ? 'var(--brand-green, #7FE87F)' : '#8E9BAE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>
                {isAr ? 'التحقق الحيوي (Face ID / البصمة)' : 'Hardware Biometrics'}
              </div>
              <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '2px' }}>
                {biometricsEnabled
                  ? (isAr ? 'مفعل لمصادقة التحويلات وتأكيد الدخول' : 'Enabled for fast MPIN authentication')
                  : (isAr ? 'معطل (يلزم إدخال الرمز السري دائماً)' : 'Disabled (PIN required for every action)')}
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleBiometrics}
            aria-label="Toggle Biometrics"
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '999px',
              backgroundColor: biometricsEnabled ? 'var(--brand-green, #7FE87F)' : '#232D42',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
              flexShrink: 0,
              padding: '2px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                top: '2px',
                left: biometricsEnabled ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

        {/* SAMA Transfer Limits Card (USER-18 Link) */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '18px 20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {language === 'العربية' ? 'الحد اليومي للتحويل (سريع)' : 'Daily Sarie Limit'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#7FE87F', fontVariantNumeric: 'tabular-nums' }}>
                {formatSaudiCurrency(dailyLimit, language)}
              </span>
              <button
                onClick={() => {
                  setSelectedPreset(dailyLimit);
                  setIsLimitModalOpen(true);
                }}
                className="interactive-tap"
                style={{
                  backgroundColor: 'rgba(127, 232, 127, 0.12)',
                  border: '1px solid rgba(127, 232, 127, 0.3)',
                  color: 'var(--brand-green, #7FE87F)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sliders size={12} />
                <span>{isAr ? 'تعديل' : 'Modify'}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: `${usedPercentage}%`, height: '100%', backgroundColor: '#7FE87F', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#9ca3af' }}>
            <span>{language === 'العربية' ? `المستخدم اليوم: ${usedToday.toLocaleString()} ر.س` : `Used Today: SAR ${usedToday.toLocaleString()}`}</span>
            <span>{language === 'العربية' ? `المتبقي: ${remainingLimit.toLocaleString()} ر.س` : `Remaining: SAR ${remainingLimit.toLocaleString()}`}</span>
          </div>

          <button
            onClick={() => navigateTo('TRANSFER_LIMITS')}
            className="interactive-tap"
            style={{
              width: '100%',
              backgroundColor: '#182236',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>{isAr ? 'تعديل حدود التحويل' : 'Adjust Transfer Limits'}</span>
            <ChevronRight size={14} color="#7FE87F" style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        {/* Security MPIN Management Card */}
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(127, 232, 127, 0.12)',
                color: '#7FE87F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Lock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>
                {isAr ? 'رمز الأمان السري (MPIN)' : 'Security PIN (MPIN)'}
              </div>
              <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '2px' }}>
                {isAr ? 'تعديل الرمز السري المكون من ٤ أرقام' : 'Change your 4-digit transaction PIN'}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigateTo('SET_PIN', { fromSettings: true })}
            className="interactive-tap"
            style={{
              backgroundColor: 'rgba(127, 232, 127, 0.12)',
              border: '1px solid rgba(127, 232, 127, 0.3)',
              color: '#7FE87F',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isAr ? 'تعديل' : 'Change'}
          </button>
        </div>

        {/* Active Devices Header */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#8E9BAE',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
              paddingInlineStart: '4px',
            }}
          >
            {translateText('Active Devices', language)} ({formatLocalizedNumber(deviceSessions.length, language)})
          </div>

          <div
            style={{
              backgroundColor: '#111726',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            {deviceSessions.map((session, index) => (
              <React.Fragment key={session.id}>
                {index > 0 && <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '0 16px' }} />}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    backgroundColor: session.isCurrent ? 'rgba(127, 232, 127, 0.08)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: '#182236',
                        color: session.isCurrent ? '#7FE87F' : '#8E9BAE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {session.deviceType === 'mobile' ? <Smartphone size={20} /> : <Monitor size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>
                        {session.deviceName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#8E9BAE', marginTop: '2px' }}>
                        {session.location} • {translateText(session.lastActive, language)}
                      </div>
                    </div>
                  </div>

                  {session.isCurrent ? (
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: '#080C14',
                        backgroundColor: '#7FE87F',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {translateText('Current', language)}
                    </span>
                  ) : (
                    <button
                      onClick={() => terminateSession(session.id)}
                      className="interactive-tap"
                      style={{
                        backgroundColor: '#182236',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#8E9BAE',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <LogOut size={12} /> {translateText('End', language)}
                    </button>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Security Footnote */}
        <div style={{ marginTop: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Lock size={13} color="#6B7A90" />
          <span style={{ fontSize: '11.5px', color: '#6B7A90', fontWeight: 600 }}>
            {isAr ? 'تم تفعيل الحماية المشفرة للجلسات النشطة' : 'Automated session security enabled'}
          </span>
        </div>
      </div>

      {/* SAMA Daily Limit Configuration Modal */}
      {isLimitModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2600,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setIsLimitModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface, #111726)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
              width: '100%',
              maxWidth: '500px',
              padding: '24px 20px',
              animation: 'slideUp 0.25s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {isAr ? 'تعديل الحد اليومي للتحويل' : 'Set Daily Sarie Limit'}
                </h3>
                <span style={{ fontSize: '11.5px', color: '#8E9BAE', marginTop: '2px', display: 'block' }}>
                  {isAr ? 'وفقاً لضوابط البنك المركزي السعودي (ساما)' : 'Compliant with Saudi Central Bank (SAMA) standards'}
                </span>
              </div>
              <button
                onClick={() => setIsLimitModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#8E9BAE', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[10000, 20000, 50000].map((preset) => {
                const isSelected = selectedPreset === preset;
                return (
                  <div
                    key={preset}
                    onClick={() => setSelectedPreset(preset)}
                    className="interactive-tap"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(127, 232, 127, 0.12)' : 'var(--color-surface-elevated, #182236)',
                      border: isSelected ? '1.5px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                        SAR {preset.toLocaleString()} / {isAr ? 'يوم' : 'Day'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8E9BAE', marginTop: '2px' }}>
                        {preset === 50000
                          ? (isAr ? 'الحد الافتراضي الموصى به من البنك المركزي' : 'SAMA Standard Recommended Limit')
                          : (isAr ? 'حماية إضافية للحد اليومي' : 'Lower transfer cap for enhanced safety')}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '5px solid var(--brand-green, #7FE87F)' : '2px solid #8E9BAE',
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      }}
                    />
                  </div>
                );
              })}

              {/* Custom Limit Option */}
              <div
                onClick={() => setSelectedPreset(-1)}
                className="interactive-tap"
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: selectedPreset === -1 ? 'rgba(127, 232, 127, 0.12)' : 'var(--color-surface-elevated, #182236)',
                  border: selectedPreset === -1 ? '1.5px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                    {isAr ? 'حد مخصص' : 'Custom Limit'}
                  </span>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: selectedPreset === -1 ? '5px solid var(--brand-green, #7FE87F)' : '2px solid #8E9BAE',
                      backgroundColor: selectedPreset === -1 ? '#FFFFFF' : 'transparent',
                    }}
                  />
                </div>
                {selectedPreset === -1 && (
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 75000 (Max 100,000)"
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--brand-green, #7FE87F)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveLimit}
              className="interactive-tap"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-green, #7FE87F)',
                color: 'var(--brand-green-ink, #080C14)',
                fontWeight: 800,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isAr ? 'حفظ الحد اليومي' : 'Save Daily Limit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


