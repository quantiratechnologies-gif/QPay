import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../../Modal';

interface DisputeModalProps {
  isOpen: boolean;
  isAr: boolean;
  onClose: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, isAr, onClose }) => {
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [disputeTxnId, setDisputeTxnId] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeSuccess(true);
    setTimeout(() => {
      setDisputeSuccess(false);
      onClose();
      setDisputeTxnId('');
      setDisputeReason('');
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isAr ? 'تقديم اعتراض' : 'Report Dispute'}>
      {disputeSuccess ? (
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
            {isAr ? 'تم تسجيل الاعتراض بنجاح' : 'Dispute Filed Successfully'}
          </h4>
          <p style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '4px' }}>
            Ticket #QT-DISP-{Math.floor(100000 + Math.random() * 900000)}
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleDisputeSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#8E9BAE',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              {isAr ? 'الرقم المرجعي للمعاملة' : 'Transaction Reference'}
            </label>
            <input
              type="text"
              value={disputeTxnId}
              onChange={(e) => setDisputeTxnId(e.target.value)}
              placeholder={isAr ? 'مثال: SAR-984729104821' : 'e.g. SAR-984729104821'}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #2C2C44',
                backgroundColor: '#1E1E32',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#A2A2BA',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              {isAr ? 'سبب الاعتراض' : 'Dispute Reason'}
            </label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder={isAr ? 'يرجى توضيح تفاصيل المشكلة...' : 'Describe what went wrong...'}
              rows={3}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #2C2C44',
                backgroundColor: '#1E1E32',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="submit"
            className="interactive-tap"
            style={{
              marginTop: '8px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: '#7FE87F',
              color: '#0B0B14',
              border: 'none',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: 'none',
            }}
          >
            {isAr ? 'إرسال الاعتراض' : 'Submit Dispute'}
          </button>
        </form>
      )}
    </Modal>
  );
};
