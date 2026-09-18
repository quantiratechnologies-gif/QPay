import React from 'react';
import {
  Edit3,
  QrCode,
  Landmark,
  Zap,
  CreditCard,
  Download,
  History,
  Gift,
  ShoppingBag,
  ShieldCheck,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  Lock,
  Plane,
  Utensils,
  Sliders,
  Fingerprint,
  Users,
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { ListRow } from '../components/ListRow';
import { useApp } from '../state/AppContext';

export const ProfileScreen: React.FC = () => {
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
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '96px' }}>
      <AppHeader title={t('profile.title', 'Profile')} showSettings={false} showBack={true} onBack={() => navigateTo('HOME')} />

      {/* User Header Profile Hero Card */}
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
        {/* Top Verified / Action Pill */}
        {isKycVerified ? (
          <div
            onClick={() => setIsKycModalOpen(true)}
            role="button"
            tabIndex={0}
            className="interactive-tap"
            style={{
              position: 'absolute',
              top: '16px',
              [isRtl ? 'left' : 'right']: '16px',
              backgroundColor: 'rgba(127, 232, 127, 0.16)',
              border: '1px solid #7FE87F',
              borderRadius: '20px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: '#7FE87F',
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={12} color="#7FE87F" />
            <span>{language === 'العربية' ? 'هوية موثقة' : 'ID VERIFIED'}</span>
          </div>
        ) : (
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="interactive-tap"
            style={{
              position: 'absolute',
              top: '16px',
              [isRtl ? 'left' : 'right']: '16px',
              backgroundColor: 'rgba(255, 179, 0, 0.15)',
              border: '1px solid #FFB300',
              borderRadius: '20px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: '#FFB300',
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={12} color="#FFB300" />
            <span>{language === 'العربية' ? 'توثيق الهوية' : 'VERIFY ID'}</span>
          </button>
        )}

        {/* Avatar with Edit Badge */}
        <div style={{ position: 'relative', marginBottom: '14px', marginTop: '6px' }}>
          <div
            onClick={() => navigateTo('HOME')}
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
              <img src={user.avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.avatarInitials
            )}
          </div>
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
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

        {/* User Details */}
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
          {displayName}
        </h2>
        <div style={{ fontSize: '12px', color: '#7FE87F', fontWeight: '700', marginTop: '4px', letterSpacing: '0.01em' }} dir="ltr">
          {user.upiId} • {user.mobile}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginTop: '3px' }}>
          {user.email}
        </div>

        {/* Action Buttons: Edit Profile & My QR Code */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '18px', width: '100%', justifyContent: 'center' }}>
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
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
            onClick={() => navigateTo('RECEIVE')}
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

      {/* Menu Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px' }}>
        {/* Payment & Banking */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', marginInlineStart: '4px' }}>
            {language === 'العربية' ? 'المدفوعات والحسابات' : 'Payment & Accounts'}
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', overflow: 'hidden', padding: 0, boxShadow: 'none' }}>
            <ListRow icon={<Landmark size={18} color="#7FE87F" />} label={language === 'العربية' ? 'الحسابات البنكية' : 'Bank Accounts'} onClick={() => navigateTo('BANK_ACCOUNTS')} />
            <ListRow icon={<Sliders size={18} color="#7FE87F" />} label={language === 'العربية' ? 'حدود التحويل المالي (ساما)' : 'Transfer Limits (SAMA)'} onClick={() => navigateTo('TRANSFER_LIMITS')} />
            <ListRow icon={<Zap size={18} color="#7FE87F" />} label={language === 'العربية' ? 'إعدادات سريع والرمز السري' : 'Sarie Settings & PIN'} onClick={() => navigateTo('UPI_SETTINGS')} />
            <ListRow icon={<CreditCard size={18} color="#7FE87F" />} label={language === 'العربية' ? 'البطاقات وطرق الدفع' : 'Saved Cards & Methods'} isLast={true} onClick={() => navigateTo('PAYMENT_METHODS')} />
          </div>
        </div>

        {/* Transactions & Money */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', marginInlineStart: '4px' }}>
            {language === 'العربية' ? 'التحويلات والطلبات' : 'Transfers & Requests'}
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', overflow: 'hidden', padding: 0, boxShadow: 'none' }}>
            <ListRow icon={<Users size={18} color="#7FE87F" />} label={language === 'العربية' ? 'تقسيم المصروفات والفواتير' : 'Split Expenses'} onClick={() => navigateTo('SPLIT_EXPENSES')} />
            <ListRow icon={<Download size={18} color="#7FE87F" />} label={language === 'العربية' ? 'طلبات الأموال' : 'Money Requests'} onClick={() => navigateTo('MONEY_REQUESTS')} />
            <ListRow icon={<History size={18} color="#7FE87F" />} label={language === 'العربية' ? 'سجل العمليات وكشف الحساب' : 'Transaction History & Statement'} onClick={() => navigateTo('HISTORY')} />
            <ListRow icon={<QrCode size={18} color="#7FE87F" />} label={language === 'العربية' ? 'الرمز الخاص بي والآيبان' : 'My QR Code & IBAN'} isLast={true} onClick={() => navigateTo('RECEIVE')} />
          </div>
        </div>

        {/* Lifestyle & Offers */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', marginInlineStart: '4px' }}>
            {language === 'العربية' ? 'المكافآت والخدمات' : 'Lifestyle & Rewards'}
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', overflow: 'hidden', padding: 0, boxShadow: 'none' }}>
            <ListRow icon={<Gift size={18} color="#7FE87F" />} label={language === 'العربية' ? 'المكافآت والاسترداد' : 'Rewards & Cashback'} onClick={() => navigateTo('REWARDS')} />
            <ListRow icon={<ShoppingBag size={18} color="#7FE87F" />} label={language === 'العربية' ? 'عروض التسوق' : 'Shopping Deals'} onClick={() => navigateTo('SHOPPING')} />
            <ListRow icon={<Plane size={18} color="#7FE87F" />} label={language === 'العربية' ? 'حجوزات السفر والطيران' : 'Travel & Flight Bookings'} onClick={() => navigateTo('TRAVEL')} />
            <ListRow icon={<Utensils size={18} color="#7FE87F" />} label={language === 'العربية' ? 'المطاعم والمقاهي' : 'Dining & Food'} isLast={true} onClick={() => navigateTo('FOOD')} />
          </div>
        </div>

        {/* Security & System Settings */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', marginInlineStart: '4px' }}>
            {language === 'العربية' ? 'الإعدادات والأمان' : 'Settings & Security'}
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', overflow: 'hidden', padding: 0, boxShadow: 'none' }}>
            <ListRow
              icon={<ShieldCheck size={18} color="#7FE87F" />}
              label={language === 'العربية' ? 'الهوية الوطنية / إعادة التوثيق (Re-KYC)' : 'National ID & Re-KYC'}
              rightElement={
                <span style={{ fontSize: '11px', fontWeight: 800, color: isKycVerified ? '#7FE87F' : '#FFB300' }}>
                  {isKycVerified
                    ? (language === 'العربية' ? 'موثق • إعادة التوثيق' : 'Verified • Re-KYC')
                    : (language === 'العربية' ? 'غير موثق • توثيق' : 'Unverified • Verify')}
                </span>
              }
              onClick={() => setIsKycModalOpen(true)}
            />
            <ListRow
              icon={<Fingerprint size={18} color="#7FE87F" />}
              label={language === 'العربية' ? 'البصمة الحيوية (Biometrics)' : 'Biometric Security'}
              rightElement={
                <span style={{ fontSize: '11px', fontWeight: 800, color: isBiometricsEnabled ? '#7FE87F' : '#9CA3AF' }}>
                  {isBiometricsEnabled ? (language === 'العربية' ? 'مفعل' : 'Active') : (language === 'العربية' ? 'معطل' : 'Off')}
                </span>
              }
              onClick={() => navigateTo('SECURITY')}
            />
            <ListRow icon={<ShieldCheck size={18} color="#7FE87F" />} label={language === 'العربية' ? 'الأمان والأجهزة' : 'Security & Devices'} onClick={() => navigateTo('SECURITY')} />
            <ListRow icon={<Bell size={18} color="#7FE87F" />} label={language === 'العربية' ? 'الإشعارات' : 'Notifications'} onClick={() => navigateTo('NOTIFICATIONS')} />
            <ListRow
              icon={<Globe size={18} color="#7FE87F" />}
              label={language === 'العربية' ? 'لغة التطبيق' : 'App Language'}
              rightElement={<span style={{ fontSize: '12px', fontWeight: 800, color: '#7FE87F' }}>{language}</span>}
              onClick={() => setIsLanguageModalOpen(true)}
            />
            <ListRow icon={<HelpCircle size={18} color="#7FE87F" />} label={language === 'العربية' ? 'المساعدة والدعم' : 'Help & Support'} onClick={() => navigateTo('HELP_SUPPORT')} />
            <ListRow icon={<Lock size={18} color="#7FE87F" />} label={language === 'العربية' ? 'الخصوصية والشروط' : 'Privacy & Terms'} isLast={true} onClick={() => navigateTo('PRIVACY')} />
          </div>
        </div>

        {/* Log Out */}
        <div>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', overflow: 'hidden', padding: 0, boxShadow: 'none' }}>
            <ListRow
              icon={<LogOut size={18} color="#FF4757" />}
              label={language === 'العربية' ? 'تسجيل الخروج' : 'Log Out'}
              danger={true}
              isLast={true}
              onClick={() => setIsLogoutModalOpen(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
