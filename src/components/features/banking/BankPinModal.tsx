import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '../../Modal';

interface BankPinModalProps {
  bankId: string | null;
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
}

export const BankPinModal: React.FC<BankPinModalProps> = ({
  isOpen,
  onClose,
  isAr,
}) => {
  const [newBankPin, setNewBankPin] = useState('');
  const [confirmBankPin, setConfirmBankPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const handleClose = () => {
    setNewBankPin('');
    setConfirmBankPin('');
    setPinError('');
    setPinSuccess(false);
    onClose();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (newBankPin.length !== 4) {
      setPinError(isAr ? '??? ?? ????? ????? ?? ? ?????' : 'PIN must be 4 digits');
      return;
    }
    if (newBankPin !== confirmBankPin) {
      setPinError(isAr ? '????? ?????? ?????? ????? ??? ????????' : 'PINs do not match');
      return;
    }

    setPinSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isAr ? '????? ????? ????? ?????' : 'Set Bank PIN'}
    >
      {pinSuccess ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(127, 232, 127, 0.16)',
              color: '#7FE87F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
            {isAr ? '?? ????? ????? ?????' : 'PIN Set Successfully'}
          </h4>
        </div>
      ) : (
        <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {pinError && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: '#182236',
                border: '1px solid #FF4757',
                color: '#FF4757',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {pinError}
            </div>
          )}

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              {isAr ? '????? ?????? (? ?????)' : 'New 4-Digit PIN'}
            </label>
            <input
              type="password"
              maxLength={4}
              value={newBankPin}
              onChange={(e) => setNewBankPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#182236',
                color: '#FFFFFF',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '8px',
                outline: 'none',
                direction: 'ltr',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              {isAr ? '????? ?????' : 'Confirm PIN'}
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmBankPin}
              onChange={(e) => setConfirmBankPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#182236',
                color: '#FFFFFF',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '8px',
                outline: 'none',
                direction: 'ltr',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            className="interactive-tap"
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              backgroundColor: '#7FE87F',
              color: '#080C14',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isAr ? '??? ????? ?????' : 'Save PIN'}
          </button>
        </form>
      )}
    </Modal>
  );
};
