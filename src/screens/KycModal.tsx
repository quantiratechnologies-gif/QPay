import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { SamaLogo } from '../components/SamaLogo';
import { useApp } from '../state/AppContext';
import {
  KycFormStep,
  KycVerifyingStep,
  KycCertifiedStep,
} from '../components/features/kyc';

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

  const isAr = language === '???????';

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

  const validateDob = (dobStr: string): string | null => {
    if (!dobStr || dobStr.trim() === '') {
      return isAr ? 'يرجى إدخال تاريخ الميلاد.' : 'Please enter your date of birth.';
    }
    const birthDate = new Date(dobStr);
    if (isNaN(birthDate.getTime())) {
      return isAr ? 'يرجى إدخال تاريخ ميلاد صحيح.' : 'Please enter a valid date of birth.';
    }
    const today = new Date();
    if (birthDate > today) {
      return isAr
        ? 'لا يمكن أن يكون تاريخ الميلاد في المستقبل.'
        : 'Date of birth cannot be in the future.';
    }
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return isAr
        ? 'يجب أن يكون عمرك ١٨ عاماً أو أكثر لإتمام توثيق الهوية (متطلبات البنك المركزي).'
        : 'You must be at least 18 years old to complete verification (SAMA regulation).';
    }
    if (age > 120) {
      return isAr ? 'يرجى إدخال تاريخ ميلاد صحيح.' : 'Please enter a valid date of birth.';
    }
    return null;
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanId = nationalId.replace(/\D/g, '');
    if (!/^[12]\d{9}$/.test(cleanId)) {
      setErrorMsg(
        isAr
          ? 'يرجى إدخال رقم هوية وطنية صحيح يبدأ بـ ١ أو ٢ ومكون من ١٠ أرقام.'
          : 'Please enter a valid 10-digit National ID starting with 1 or 2.'
      );
      return;
    }

    const dobError = validateDob(dob);
    if (dobError) {
      setErrorMsg(dobError);
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
      title={isAr ? '????? ?????? ??????? (KYC)' : 'Identity Verification (KYC)'}
    >
      <div style={{ paddingBottom: '8px' }}>
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
              {isAr ? '????? ????? ?????? (KYC)' : 'Digital Identity & KYC'}
            </h3>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, marginTop: '2px', display: 'block' }}>
              {isAr ? '??? ????? ?? ?????? ?????? ?????? ??????' : 'Direct verification with Nafath & SAMA'}
            </span>
          </div>
        </div>

        {step === 'FORM' && (
          <KycFormStep
            docType={docType}
            onDocTypeChange={setDocType}
            nationalId={nationalId}
            onNationalIdChange={setNationalId}
            dob={dob}
            onDobChange={setDob}
            attachedDocName={attachedDocName}
            onAttachedDocChange={setAttachedDocName}
            errorMsg={errorMsg}
            onSubmit={handleVerify}
            isAr={isAr}
            isRtl={isRtl}
          />
        )}

        {step === 'VERIFYING' && <KycVerifyingStep isAr={isAr} />}

        {step === 'CERTIFIED' && (
          <KycCertifiedStep
            nationalId={kycData?.nationalId || nationalId}
            verifiedAt={kycData?.verifiedAt || new Date().toLocaleDateString('en-GB')}
            onUpdate={() => setStep('FORM')}
            onClose={handleClose}
            isAr={isAr}
            isRtl={isRtl}
          />
        )}

        <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <SamaLogo height={12} themeMode="green" />
          <span style={{ fontSize: '10.5px', color: '#9ca3af', fontWeight: 600 }}>
            {isAr
              ? '????? ???? ?????? • ????? ??????? ??????? ??????? ??????'
              : 'Official Identity Verification • SAMA & Nafath Regulated'}
          </span>
        </div>
      </div>
    </BottomSheet>
  );
};
export default KycModal;
