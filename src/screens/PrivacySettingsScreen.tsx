import React, { useState } from 'react';
import { Lock, Eye, ShieldCheck, Database, Check } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { ListRow } from '../components/ListRow';
import { Modal } from '../components/Modal';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { translateText } from '../utils/i18n';
import { getSupabase } from '../services/supabaseClient';

export const PrivacySettingsScreen: React.FC = () => {
  const { language, navigateTo, user } = useApp();
  const [activeModal, setActiveModal] = useState<'preferences' | 'export' | null>(null);
  const [shareData, setShareData] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [exportSubmitted, setExportSubmitted] = useState(false);
  const [isSubmittingExport, setIsSubmittingExport] = useState(false);

  const handleExportData = async () => {
    setIsSubmittingExport(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('qpay_auth_token') : null;
      // 1. Attempt server-backed endpoint
      await fetch('/api/user/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mobile: user?.mobile,
          email: user?.email,
        }),
      }).catch(() => null);

      // 2. Attempt client-side Supabase insert if initialized
      const supabase = getSupabase();
      if (supabase && (user as any)?.id) {
        try {
          await supabase.from('data_export_requests').insert({
            profile_id: (user as any).id,
            status: 'pending',
          });
        } catch {
          // Non-blocking
        }
      }
    } finally {
      setIsSubmittingExport(false);
      setExportSubmitted(true);
      setTimeout(() => {
        setExportSubmitted(false);
        setActiveModal(null);
      }, 2500);
    }
  };

  const headerTitle = language === 'العربية' ? 'الخصوصية والتحكم في البيانات' : 'Privacy & Data Controls';

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0F19', minHeight: '100vh', paddingBottom: '36px', color: '#FFFFFF' }}>
      <AppHeader title={headerTitle} showBack showSettings={false} />

      <div style={{ padding: '20px' }}>
        {/* Encryption Hero Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '20px',
            padding: '22px 20px',
            marginBottom: '24px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-green, #7FE87F)',
                flexShrink: 0,
              }}
            >
              <Lock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {translateText('Banking-Grade Encryption', language)}
              </h3>
              <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '3px 0 0 0' }}>
                {translateText('TLS 1.3 & 256-Bit AES multi-layer privacy protections', language)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 800, color: '#8E9BAE', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', paddingInlineStart: '4px' }}>
          {translateText('Data Controls & Rights', language)}
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            borderRadius: '18px',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            overflow: 'hidden',
          }}
        >
          <ListRow
            icon={<Eye size={20} color="var(--brand-green, #7FE87F)" />}
            label={translateText('Data Sharing Preferences', language)}
            onClick={() => setActiveModal('preferences')}
          />
          <ListRow
            icon={<Database size={20} color="var(--brand-green, #7FE87F)" />}
            label={translateText('Download Account Data', language)}
            onClick={() => setActiveModal('export')}
          />
          <ListRow
            icon={<ShieldCheck size={20} color="var(--brand-green, #7FE87F)" />}
            label={language === 'العربية' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            isLast={true}
            onClick={() => navigateTo('PRIVACY_POLICY')}
          />
        </div>
      </div>

      {/* Preferences Modal */}
      <Modal isOpen={activeModal === 'preferences'} onClose={() => setActiveModal(null)} title={translateText('Data Sharing Preferences', language)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '14px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{translateText('Personalized Offers', language)}</div>
              <div style={{ fontSize: '11px', color: '#8E9BAE', marginTop: '2px' }}>{translateText('Allow curated cashback & reward recommendations', language)}</div>
            </div>
            <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--brand-green, #7FE87F)', cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '14px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{translateText('Spending Analytics', language)}</div>
              <div style={{ fontSize: '11px', color: '#8E9BAE', marginTop: '2px' }}>{translateText('Share anonymized spending statistics', language)}</div>
            </div>
            <input type="checkbox" checked={shareData} onChange={(e) => setShareData(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--brand-green, #7FE87F)', cursor: 'pointer' }} />
          </div>

          <PrimaryButton onClick={() => setActiveModal(null)}>
            {translateText('Save Preferences', language)}
          </PrimaryButton>
        </div>
      </Modal>

      {/* Export Data Modal */}
      <Modal isOpen={activeModal === 'export'} onClose={() => setActiveModal(null)} title={translateText('Export Account Data', language)}>
        {exportSubmitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <Check size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
              {language === 'العربية' ? 'تم تقديم الطلب' : 'Request submitted'}
            </h4>
            <p style={{ fontSize: '12.5px', color: '#8E9BAE', marginTop: '6px', lineHeight: '1.5' }}>
              {language === 'العربية'
                ? 'تم تقديم الطلب - سنرسل بياناتك إلى بريدك الإلكتروني خلال ٣٠ يوماً.'
                : 'Request submitted - we will email you within 30 days.'}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ fontSize: '13.5px', color: '#8E9BAE', marginBottom: '20px', lineHeight: '1.5' }}>
              {language === 'العربية'
                ? 'طلب نسخة كاملة من سجل معاملاتك المصرفية وإيصالات الدفع ومعلومات الحساب المسجلة.'
                : 'Request an archive of your linked bank transactions, payment receipts, and profile history.'}
            </p>
            <PrimaryButton onClick={handleExportData} disabled={isSubmittingExport}>
              {isSubmittingExport
                ? (language === 'العربية' ? 'جاري تقديم الطلب...' : 'Submitting Request...')
                : (language === 'العربية' ? 'طلب تصدير البيانات' : 'Request Data Export')}
            </PrimaryButton>
          </div>
        )}
      </Modal>
    </div>
  );
};
