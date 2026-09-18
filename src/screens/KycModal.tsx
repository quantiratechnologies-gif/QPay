import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, UserCheck, ArrowRight, Loader2, Calendar, Upload, FileText, RefreshCw } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { SamaLogo } from '../components/SamaLogo';
import { useApp } from '../state/AppContext';

type KycStep = 'FORM' | 'VERIFYING' | 'CERTIFIED';

export const KycModal: React.FC = () => {
  const { isKycModalOpen, setIsKycModalOpen, setIsKycVerified, isKycVerified, kycData, isRtl, language } = useApp();

  const [step, setStep] = useState<KycStep>('FORM');
  const [nationalId, setNationalId] = useState(kycData?.nationalId || '1098472910');
  const [dob, setDob] = useState(kycData?.dob || '1992-05-14');
  const [attachedDocName, setAttachedDocName] = useState<string | null>('National_ID_Scan.pdf');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isKycModalOpen) {
      if (isKycVerified) {
        setStep('CERTIFIED');
      } else {
        setStep('FORM');
        setErrorMsg('');
      }
    }
  }, [isKycModalOpen, isKycVerified]);

  const handleClose = () => {
    if (step === 'VERIFYING') return;
    setIsKycModalOpen(false);
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nationalId.replace(/\D/g, '').length < 10) {
      setErrorMsg(
        language === 'العربية'
          ? 'يرجى إدخال رقم هوية وطنية أو إقامة صحيح من ١٠ أرقام.'
          : 'Please enter a valid 10-digit National ID or Iqama Number.'
      );
      return;
    }

    setErrorMsg('');
    setStep('VERIFYING');
    setTimeout(() => {
      setIsKycVerified(true, {
        nationalId,
        dob,
        verifiedAt: new Date().toLocaleDateString('en-GB'),
      });
      setStep('CERTIFIED');
    }, 750);
  };

  return (
    <BottomSheet
      isOpen={isKycModalOpen}
      onClose={handleClose}
      title={language === 'العربية' ? 'توثيق الهوية الوطنية' : 'National ID Verification'}
    >
      <div style={{ paddingBottom: '8px' }}>
        {/* Header Identity Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--brand-green-tint)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} color="var(--brand-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              {language === 'العربية' ? 'توثيق الهوية' : 'Verify Identity'}
            </h3>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, marginTop: '2px', display: 'block' }}>
              {language === 'العربية' ? 'توثيق سريع عبر منصة أبشر' : 'Quick verification with Absher'}
            </span>
          </div>
        </div>

        {/* STEP 1: FORM */}
        {step === 'FORM' && (
          <form onSubmit={handleVerify} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* National ID Input */}
            <div>
              <label
                htmlFor="modal-national-id"
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                {language === 'العربية' ? 'رقم الهوية الوطنية / الإقامة' : 'National ID / Iqama'}
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                  padding: '13px 16px',
                  gap: '12px',
                }}
              >
                <UserCheck size={18} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                <input
                  id="modal-national-id"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="1098472910"
                  required
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    flex: 1,
                    minWidth: 0,
                    fontVariantNumeric: 'tabular-nums',
                    direction: 'ltr',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="modal-dob"
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                {language === 'العربية' ? 'تاريخ الميلاد' : 'Date of Birth'}
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                  padding: '13px 16px',
                  gap: '12px',
                }}
              >
                <Calendar size={18} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                <input
                  id="modal-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    flex: 1,
                    minWidth: 0,
                    colorScheme: 'dark',
                  }}
                />
              </div>
            </div>

            {/* Document Attachment Field */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                {language === 'العربية' ? 'إرفاق وثيقة الهوية (اختياري / إعادة التوثيق)' : 'Attach ID Document (Optional / Re-KYC)'}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                }}
              >
                <Upload size={18} color="var(--brand-green)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachedDocName || (language === 'العربية' ? 'اختر صورة الهوية أو ملف PDF' : 'Select ID photo or PDF')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8E9BAE' }}>
                    {language === 'العربية' ? 'JPG، PNG أو PDF (بحد أقصى ٥ ميغابايت)' : 'JPG, PNG or PDF (Max 5MB)'}
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAttachedDocName(f.name);
                  }}
                />
              </label>
            </div>

            {errorMsg && (
              <div style={{ fontSize: '12px', color: '#FF4757', fontWeight: 700 }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={nationalId.length < 10}
              className="action-btn interactive-tap"
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '15px',
                backgroundColor: nationalId.length >= 10 ? 'var(--brand-green)' : '#182236',
                color: nationalId.length >= 10 ? 'var(--brand-green-ink)' : '#6b7280',
                border: nationalId.length >= 10 ? 'none' : '1px solid var(--color-border)',
                borderRadius: '16px',
                fontSize: '14.5px',
                fontWeight: 800,
                cursor: nationalId.length >= 10 ? 'pointer' : 'not-allowed',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{language === 'العربية' ? 'توثيق الهوية ومتابعة' : 'Verify & Continue'}</span>
              <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
            </button>
          </form>
        )}

        {/* STEP 2: VERIFYING */}
        {step === 'VERIFYING' && (
          <div style={{ textAlign: 'center', padding: '36px 10px' }} className="fade-in">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-green-tint)',
                border: '1.5px solid var(--brand-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Loader2 size={32} color="var(--brand-green)" className="animate-spin" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
              {language === 'العربية' ? 'جاري التحقق من الهوية الرقمية...' : 'Verifying Digital Identity...'}
            </h4>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              {language === 'العربية' ? 'المطابقة المباشرة مع السجل الوطني الموحد' : 'Matching records with national registry'}
            </p>
          </div>
        )}

        {/* STEP 3: CERTIFIED CONFIRMATION */}
        {step === 'CERTIFIED' && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '10px 4px 4px 4px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-green-tint)',
                border: '1.5px solid var(--brand-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 size={36} color="var(--brand-green)" />
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
              {language === 'العربية' ? 'تم توثيق الهوية بنجاح' : 'Identity Verified'}
            </h4>

            <div
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                padding: '16px',
                marginBottom: '20px',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'رقم الهوية' : 'National ID'}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {nationalId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'حالة التوثيق' : 'Status'}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--brand-green)' }}>
                  {language === 'العربية' ? 'موثق' : 'Verified'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{language === 'العربية' ? 'الحد اليومي' : 'Daily Limit'}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--brand-green)' }}>SAR 50,000</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="action-btn interactive-tap"
                style={{
                  width: '100%',
                  padding: '13px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  color: 'var(--brand-green)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <RefreshCw size={16} />
                <span>{language === 'العربية' ? 'تحديث الوثائق / إعادة التوثيق' : 'Update Documents / Re-KYC'}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="action-btn interactive-tap"
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: 'var(--brand-green)',
                  color: 'var(--brand-green-ink)',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'none',
                }}
              >
                <span>{language === 'العربية' ? 'إغلاق ومتابعة' : 'Done & Return'}</span>
              </button>
            </div>
          </div>
        )}

        {/* SAMA Verification Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <SamaLogo height={12} themeMode="green" />
          <span style={{ fontSize: '10.5px', color: '#9ca3af', fontWeight: 600 }}>
            {language === 'العربية'
              ? 'توثيق رسمي ومعتمد • البنك المركزي السعودي'
              : 'Official Identity Verification • SAMA Regulated'}
          </span>
        </div>
      </div>
    </BottomSheet>
  );
};
