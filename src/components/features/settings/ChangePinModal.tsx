import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../../Modal';
import { translateText } from '../../../utils/i18n';

interface ChangePinModalProps {
  isOpen: boolean;
  language: string;
  onClose: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  language,
  onClose,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (oldPin.length !== 4) {
      setPinError(translateText('Old PIN must be 4 digits', language));
      return;
    }
    if (newPin.length !== 4) {
      setPinError(translateText('New PIN must be 4 digits', language));
      return;
    }
    if (newPin === oldPin) {
      setPinError(translateText('New PIN cannot be the same as current PIN', language));
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(translateText('New PIN and Confirm PIN do not match', language));
      return;
    }

    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      onClose();
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translateText('Change Payment PIN', language)}
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
            <Check size={28} />
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
            {translateText('Payment PIN Updated', language)}
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
              {translateText('Current 4-Digit PIN', language)}
            </label>
            <input
              type="password"
              maxLength={4}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
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
              {translateText('New 4-Digit PIN', language)}
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
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
              {translateText('Confirm New PIN', language)}
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
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
            className="action-btn interactive-tap"
            style={{
              marginTop: '10px',
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: '#7FE87F',
              color: '#080c14',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(127, 232, 127, 0.22)',
            }}
          >
            {translateText('Update PIN', language)}
          </button>
        </form>
      )}
    </Modal>
  );
};
