import React from 'react';
import { Modal } from '../../Modal';

interface RemoveBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isAr: boolean;
  cancelLabel: string;
}

export const RemoveBankModal: React.FC<RemoveBankModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isAr,
  cancelLabel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? '????? ??? ?????? ??????' : 'Remove Bank Account'}
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <p style={{ color: '#8A9BB0', fontSize: '13.5px', marginBottom: '20px', lineHeight: '20px' }}>
          {isAr
            ? '?? ??? ????? ?? ????? ?? ????? ??? ??? ?????? ?????? ?? ??? ?? ????'
            : 'Are you sure you want to unlink this bank account from QTPay?'}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            className="interactive-tap"
            style={{
              flex: 1,
              backgroundColor: '#182236',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="interactive-tap"
            style={{
              flex: 1,
              backgroundColor: '#FF4757',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {isAr ? '????? ?????' : 'Unlink Account'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
