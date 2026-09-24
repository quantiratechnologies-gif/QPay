import React from 'react';
import {
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
  FileText,
  Info,
} from 'lucide-react';
import { ListRow } from '../../ListRow';

interface ProfileMenuSectionsProps {
  language: string;
  isKycVerified: boolean;
  isBiometricsEnabled: boolean;
  onNavigate: (screen: any) => void;
  onOpenKycModal: () => void;
  onOpenLanguageModal: () => void;
  onOpenLogoutModal: () => void;
}

export const ProfileMenuSections: React.FC<ProfileMenuSectionsProps> = ({
  language,
  isKycVerified,
  isBiometricsEnabled,
  onNavigate,
  onOpenKycModal,
  onOpenLanguageModal,
  onOpenLogoutModal,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px' }}>
      {/* Payment & Banking */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
            marginInlineStart: '4px',
          }}
        >
          {language === 'العربية' ? 'المدفوعات والحسابات' : 'Payment & Accounts'}
        </div>
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            padding: 0,
            boxShadow: 'none',
          }}
        >
          <ListRow
            icon={<Landmark size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'الحسابات البنكية' : 'Bank Accounts'}
            onClick={() => onNavigate('BANK_ACCOUNTS')}
          />
          <ListRow
            icon={<Sliders size={18} color="#7FE87F" />}
            label={
              language === 'العربية' ? 'حدود التحويل المالي (ساما)' : 'Transfer Limits (SAMA)'
            }
            onClick={() => onNavigate('TRANSFER_LIMITS')}
          />
          <ListRow
            icon={<Zap size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'إعدادات سريع والرمز السري' : 'Sarie Settings & PIN'}
            onClick={() => onNavigate('UPI_SETTINGS')}
          />
          <ListRow
            icon={<CreditCard size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'البطاقات وطرق الدفع' : 'Saved Cards & Methods'}
            isLast={true}
            onClick={() => onNavigate('PAYMENT_METHODS')}
          />
        </div>
      </div>

      {/* Transactions & Money */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
            marginInlineStart: '4px',
          }}
        >
          {language === 'العربية' ? 'التحويلات والطلبات' : 'Transfers & Requests'}
        </div>
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            padding: 0,
            boxShadow: 'none',
          }}
        >
          <ListRow
            icon={<Users size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'تقسيم المصروفات والفواتير' : 'Split Expenses'}
            onClick={() => onNavigate('SPLIT_EXPENSES')}
          />
          <ListRow
            icon={<Download size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'طلبات الأموال' : 'Money Requests'}
            onClick={() => onNavigate('MONEY_REQUESTS')}
          />
          <ListRow
            icon={<History size={18} color="#7FE87F" />}
            label={
              language === 'العربية'
                ? 'سجل العمليات وكشف الحساب'
                : 'Transaction History & Statement'
            }
            onClick={() => onNavigate('HISTORY')}
          />
          <ListRow
            icon={<QrCode size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'الرمز الخاص بي والآيبان' : 'My QR Code & IBAN'}
            isLast={true}
            onClick={() => onNavigate('RECEIVE')}
          />
        </div>
      </div>

      {/* Lifestyle & Offers */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
            marginInlineStart: '4px',
          }}
        >
          {language === 'العربية' ? 'المكافآت والخدمات' : 'Lifestyle & Rewards'}
        </div>
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            padding: 0,
            boxShadow: 'none',
          }}
        >
          <ListRow
            icon={<Gift size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'المكافآت والاسترداد' : 'Rewards & Cashback'}
            onClick={() => onNavigate('REWARDS')}
          />
          <ListRow
            icon={<ShoppingBag size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'عروض التسوق' : 'Shopping Deals'}
            onClick={() => onNavigate('SHOPPING')}
          />
          <ListRow
            icon={<Plane size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'حجوزات السفر والطيران' : 'Travel & Flight Bookings'}
            onClick={() => onNavigate('TRAVEL')}
          />
          <ListRow
            icon={<Utensils size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'المطاعم والمقاهي' : 'Dining & Food'}
            isLast={true}
            onClick={() => onNavigate('FOOD')}
          />
        </div>
      </div>

      {/* Security & System Settings */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
            marginInlineStart: '4px',
          }}
        >
          {language === 'العربية' ? 'الإعدادات والأمان' : 'Settings & Security'}
        </div>
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            padding: 0,
            boxShadow: 'none',
          }}
        >
          <ListRow
            icon={<ShieldCheck size={18} color="#7FE87F" />}
            label={
              language === 'العربية'
                ? 'الهوية الوطنية / إعادة التوثيق (KYC)'
                : 'National ID & KYC'
            }
            rightElement={
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isKycVerified ? '#7FE87F' : '#FFB300',
                }}
              >
                {isKycVerified
                  ? language === 'العربية'
                    ? 'موثق • إعادة التوثيق'
                    : 'Verified • KYC'
                  : language === 'العربية'
                  ? 'غير موثق • توثيق'
                  : 'Unverified • Verify'}
              </span>
            }
            onClick={onOpenKycModal}
          />
          <ListRow
            icon={<Fingerprint size={18} color="#7FE87F" />}
            label={
              language === 'العربية'
                ? 'البصمة الحيوية (Biometrics)'
                : 'Biometric Security'
            }
            rightElement={
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isBiometricsEnabled ? '#7FE87F' : '#9CA3AF',
                }}
              >
                {isBiometricsEnabled
                  ? language === 'العربية'
                    ? 'مفعل'
                    : 'Active'
                  : language === 'العربية'
                  ? 'معطل'
                  : 'Off'}
              </span>
            }
            onClick={() => onNavigate('SECURITY')}
          />
          <ListRow
            icon={<ShieldCheck size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'الأمان والأجهزة' : 'Security & Devices'}
            onClick={() => onNavigate('SECURITY')}
          />
          <ListRow
            icon={<Bell size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'الإشعارات' : 'Notifications'}
            onClick={() => onNavigate('NOTIFICATIONS')}
          />
          <ListRow
            icon={<Globe size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'لغة التطبيق' : 'App Language'}
            rightElement={
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#7FE87F' }}>
                {language}
              </span>
            }
            isLast={true}
            onClick={onOpenLanguageModal}
          />
        </div>
      </div>

      {/* Legal & Support Section */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
            marginInlineStart: '4px',
          }}
        >
          {language === 'العربية' ? 'الوثائق القانونية والدعم' : 'Legal & Support'}
        </div>
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            padding: 0,
            boxShadow: 'none',
          }}
        >
          <ListRow
            icon={<FileText size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'الشروط والأحكام' : 'Terms and Conditions'}
            onClick={() => onNavigate('TERMS')}
          />
          <ListRow
            icon={<ShieldCheck size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            onClick={() => onNavigate('PRIVACY_POLICY')}
          />
          <ListRow
            icon={<Lock size={18} color="#7FE87F" />}
            label={
              language === 'العربية'
                ? 'الخصوصية والتحكم في البيانات'
                : 'Privacy & Data Controls'
            }
            onClick={() => onNavigate('PRIVACY_SETTINGS')}
          />
          <ListRow
            icon={<HelpCircle size={18} color="#7FE87F" />}
            label={language === 'العربية' ? 'المساعدة والدعم' : 'Help & Support'}
            onClick={() => onNavigate('HELP_SUPPORT')}
          />
          <ListRow
            icon={<Info size={18} color="#9CA3AF" />}
            label={language === 'العربية' ? 'إصدار التطبيق' : 'App Version'}
            rightElement={
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF' }}>
                v1.0.0
              </span>
            }
            isLast={true}
          />
        </div>
      </div>

      {/* Log Out */}
      <div>
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            padding: 0,
            boxShadow: 'none',
          }}
        >
          <ListRow
            icon={<LogOut size={18} color="#FF4757" />}
            label={language === 'العربية' ? 'تسجيل الخروج' : 'Log Out'}
            danger={true}
            isLast={true}
            onClick={onOpenLogoutModal}
          />
        </div>
      </div>
    </div>
  );
};
