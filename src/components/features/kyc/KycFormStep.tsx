import React from 'react';
import { Building2, UserCheck, Calendar, Upload, ArrowRight } from 'lucide-react';

interface KycFormStepProps {
  docType: string;
  onDocTypeChange: (type: string) => void;
  nationalId: string;
  onNationalIdChange: (val: string) => void;
  dob: string;
  onDobChange: (val: string) => void;
  attachedDocName: string | null;
  onAttachedDocChange: (name: string) => void;
  errorMsg: string;
  onSubmit: (e?: React.FormEvent) => void;
  isAr: boolean;
  isRtl: boolean;
}

export const KycFormStep: React.FC<KycFormStepProps> = ({
  docType,
  onDocTypeChange,
  nationalId,
  onNationalIdChange,
  dob,
  onDobChange,
  attachedDocName,
  onAttachedDocChange,
  errorMsg,
  onSubmit,
  isAr,
  isRtl,
}) => {
  return (
    <form onSubmit={onSubmit} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          {isAr ? '??? ??????? ???????' : 'Document Type'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={() => onDocTypeChange('national_id')}
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
            <span>{isAr ? '?????? ???????' : 'Saudi National ID'}</span>
          </button>
          <button
            type="button"
            onClick={() => onDocTypeChange('iqama')}
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
            <span>{isAr ? '???? ???? (?????)' : 'Iqama Residence'}</span>
          </button>
        </div>
      </div>

      {/* National ID / Iqama Input */}
      <div>
        <label
          htmlFor="kyc-national-id"
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
          {docType === 'iqama'
            ? isAr
              ? '??? ??????? (?? ????? ???? ?? ?)'
              : 'Iqama Number (10 digits starting with 2)'
            : isAr
            ? '??? ?????? ??????? (?? ????? ???? ?? ?)'
            : 'National ID Number (10 digits starting with 1)'}
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
            id="kyc-national-id"
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={nationalId}
            onChange={(e) => onNationalIdChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
          htmlFor="kyc-dob"
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
          {isAr ? '????? ???????' : 'Date of Birth'}
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
            id="kyc-dob"
            type="date"
            value={dob}
            onChange={(e) => onDobChange(e.target.value)}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            min="1900-01-01"
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
          {isAr ? '????? ????? ?????? (??????? / ????? ???????)' : 'Attach ID Document (Optional / KYC)'}
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#182236',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
            padding: '12px 16px',
            cursor: 'pointer',
          }}
        >
          <Upload size={18} color="#7FE87F" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {attachedDocName || (isAr ? '???? ???? ?????? ?? ??? PDF' : 'Select ID photo or PDF')}
            </div>
            <div style={{ fontSize: '11px', color: '#8E9BAE' }}>
              {isAr ? 'JPG? PNG ?? PDF (??? ???? ? ????????)' : 'JPG, PNG or PDF (Max 5MB)'}
            </div>
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAttachedDocChange(f.name);
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
        <span>{isAr ? '????? ?????? ??? ?????? ??????' : 'Verify via Nafath & SAMA'}</span>
        <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
      </button>
    </form>
  );
};
