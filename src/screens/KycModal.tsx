import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, UserCheck, ArrowRight, Loader2, Calendar, Upload, RefreshCw, Building2 } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { SamaLogo } from '../components/SamaLogo';
import { useApp } from '../state/AppContext';

type KycStep = 'FORM' | 'VERIFYING' | 'CERTIFIED';

export const KycModal: React.FC = () => {
  const {
    isKycModalOpen,
    setIsKycModalOpen,
    isKycVerified,
    kycData,
    submitReKyc,
    isRtl,
    language,
  } = useApp();

  const isAr = language === 'العربية';

  const [step, setStep] = useState<KycStep>('FORM');
  const [docType, setDocType] = useState<string>('national_id');
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

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanId = nationalId.replace(/\D/g, '');
    if (cleanId.length < 10) {
      setErrorMsg(
        isAr
          ? 'يرجى إدخال رقم هوية وطنية أو إقامة صحيح من ١٠ أرقام.'
          : 'Please enter a valid 10-digit National ID or Iqama Number.'
      );
      return;
    }

    setErrorMsg('');
    setStep('VERIFYING');

    setTimeout(async () => {
      await submitReKyc({
        frontDocUrl: attachedDocName || 'National_ID_Scan.pdf',
        docType,
        nationalId: cleanId,
        dob,
      });
      setStep('CERTIFIED');
    }, 1200);
  };

  return (
    <BottomSheet
      isOpen={isKycModalOpen}
      onClose={handleClose}
      title={isAr ? 'توثيق الهوية الوطنية (Re-KYC)' : 'Identity Verification (Re-KYC)'}
    >
      <div style={{ paddingBottom: '8px' }}>
        {/* Header Identity Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              backgroundColor: 'rgba(127, 232, 127, 0.15)',
              border: '1px solid rgba(127, 232, 127, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} color="#7FE87F" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              {isAr ? 'إعادة توثيق الهوية (Re-KYC)' : 'Digital Identity & Re-KYC'}
            </h3>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, marginTop: '2px', display: 'block' }}>
              {isAr ? 'ربط مباشر مع النفاذ الوطني الموحد وسامـا' : 'Direct verification with Nafath & SAMA'}
            </span>
          </div>
        </div>

        {/* STEP 1: FORM */}
        {step === 'FORM' && (
          <form onSubmit={handleVerify} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Document Type Selector */}
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
                {isAr ? 'نوع الوثيقة الرسمية' : 'Document Type'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDocType('national_id')}
                  className="interactive-tap"
                  style={{
                    padding: '12px 10px',
                    borderRadius: '14px',
                    backgroundColor: docType === 'national_id' ? 'rgba(127, 232, 127, 0.15)' : '#182236',
                    border: docType === 'national_id' ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: docType === 'national_id' ? '#7FE87F' : '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Building2 size={14} />
                  <span>{isAr ? 'الهوية الوطنية' : 'Saudi National ID'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('iqama')}
                  className="interactive-tap"
                  style={{
                    padding: '12px 10px',
                    borderRadius: '14px',
                    backgroundColor: docType === 'iqama' ? 'rgba(127, 232, 127, 0.15)' : '#182236',
                    border: docType === 'iqama' ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: docType === 'iqama' ? '#7FE87F' : '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <UserCheck size={14} />
                  <span>{isAr ? 'هوية مقيم (إقامة)' : 'Iqama Residence'}</span>
                </button>
              </div>
            </div>

            {/* National ID / Iqama Input */}
            <div>
              <label
                htmlFor="modal-national-id"
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
                {docType === 'iqama' ? (isAr ? 'رقم الإقامة (١٠ أرقام تبدأ بـ ٢)' : 'Iqama Number (10 digits starting with 2)') : (isAr ? 'رقم الهوية الوطنية (١٠ أرقام تبدأ بـ ١)' : 'National ID Number (10 digits starting with 1)')}
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#182236',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '13px 16px',
                  gap: '12px',
                }}
              >
                <UserCheck size={18} color="#7FE87F" style={{ flexShrink: 0 }} />
                <input
                  id="modal-national-id"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder={docType === 'iqama' ? '2489102941' : '1098472910'}
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
                {isAr ? 'تاريخ الميلاد' : 'Date of Birth'}
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#182236',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '13px 16px',
                  gap: '12px',
                }}
              >
                <Calendar size={18} color="#7FE87F" style={{ flexShrink: 0 }} />
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
              <div style={{ fontSize: '12px', color: '#FF4757', fontWeight: 700, backgroundColor: 'rgba(255, 71, 87, 0.1)', padding: '10px 14px', borderRadius: '12px' }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="action-btn interactive-tap"
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '15px',
                backgroundColor: '#7FE87F',
                color: '#080C14',
                border: 'none',
                borderRadius: '16px',
                fontSize: '14.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(127, 232, 127, 0.3)',
              }}
            >
              <span>{isAr ? 'توثيق الهوية عبر النفاذ الوطني' : 'Verify via Nafath & SAMA'}</span>
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
                backgroundColor: 'rgba(127, 232, 127, 0.15)',
                border: '1.5px solid #7FE87F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Loader2 size={32} color="#7FE87F" className="animate-spin" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
              {isAr ? 'جاري التحقق والمطابقة مع النفاذ الوطني...' : 'Verifying with Nafath Registry...'}
            </h4>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              {isAr ? 'مطابقة الوثائق المرفقة وسجل البنك المركزي السعودي' : 'Matching attached documents with SAMA & Absher records'}
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
                backgroundColor: 'rgba(127, 232, 127, 0.15)',
                border: '1.5px solid #7FE87F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 size={36} color="#7FE87F" />
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
              {isAr ? 'تم توثيق الهوية الوطنية بنجاح' : 'National ID Verified'}
            </h4>
            <div style={{ fontSize: '12px', color: '#7FE87F', fontWeight: 700, marginBottom: '18px' }}>
              {isAr ? 'حسابك معتمد وموثق بالكامل لدى سامـا' : 'Fully certified & compliant with SAMA regulations'}
            </div>

            <div
              style={{
                backgroundColor: '#182236',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px',
                marginBottom: '20px',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'رقم الهوية' : 'National ID'}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {kycData?.nationalId || nationalId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'حالة التوثيق' : 'Status'}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#7FE87F' }}>
                  {isAr ? 'معتمد وموثق (Nafath)' : 'Certified (Nafath)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'الحد اليومي المتاح' : 'Daily Sarie Limit'}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#7FE87F' }}>SAR 50,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'تاريخ التوثيق' : 'Verified At'}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#8E9BAE' }}>
                  {kycData?.verifiedAt || new Date().toLocaleDateString('en-GB')}
                </span>
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
            {isAr
              ? 'توثيق رسمي ومعتمد • البنك المركزي السعودي والنفاذ الوطني'
              : 'Official Identity Verification • SAMA & Nafath Regulated'}
          </span>
        </div>
      </div>
    </BottomSheet>
  );
};
