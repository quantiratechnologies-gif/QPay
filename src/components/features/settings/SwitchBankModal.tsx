import React from 'react';
import { Landmark, Check } from 'lucide-react';
import { Modal } from '../../Modal';
import type { BankAccount } from '../../../types';

interface SwitchBankModalProps {
  isOpen: boolean;
  bankAccounts: BankAccount[];
  language: string;
  onClose: () => void;
  onSelectBank: (bankId: string) => void;
}

export const SwitchBankModal: React.FC<SwitchBankModalProps> = ({
  isOpen,
  bankAccounts,
  language,
  onClose,
  onSelectBank,
}) => {
  const isAr = language === 'العربية' || language === 'ar';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? 'تبديل الحساب المرتبط بالمعرّف' : 'Switch Alias Receiving Bank'}
    >
      <div style={{ padding: '8px 0' }}>
        <p
          style={{
            fontSize: '13px',
            color: '#9ca3af',
            marginBottom: '16px',
            lineHeight: '1.4',
          }}
        >
          {isAr
            ? 'اختر الحساب البنكي الذي ترغب في استقبال الحوالات عليه مباشرة عبر معرّفك.'
            : 'Choose which bank account receives transfers sent to your @qtpay alias.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {bankAccounts.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                onSelectBank(b.id);
                onClose();
              }}
              className="interactive-tap"
              style={{
                backgroundColor: b.isPrimary ? 'rgba(127, 232, 127, 0.14)' : '#182236',
                border: b.isPrimary ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Landmark size={18} color="#7FE87F" />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                    {b.bankName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{b.accountNumberMasked}</div>
                </div>
              </div>
              {b.isPrimary && <Check size={18} color="#7FE87F" />}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
