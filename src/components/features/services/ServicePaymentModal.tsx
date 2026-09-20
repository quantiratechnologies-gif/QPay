import React from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../../Modal';
import { PrimaryButton } from '../../PrimaryButton';
import { translateText } from '../../../utils/i18n';
import type { ServiceOpenParam } from './UtilitiesGrid';

interface ServicePaymentModalProps {
  selectedService: ServiceOpenParam | null;
  accountNumber: string;
  amount: string;
  language: string;
  t: (key: string, fallback?: string) => string;
  onClose: () => void;
  onAccountNumberChange: (val: string) => void;
  onAmountChange: (val: string) => void;
  onProceedPayment: () => void;
}

export const ServicePaymentModal: React.FC<ServicePaymentModalProps> = ({
  selectedService,
  accountNumber,
  amount,
  language,
  t,
  onClose,
  onAccountNumberChange,
  onAmountChange,
  onProceedPayment,
}) => {
  if (!selectedService) return null;

  return (
    <Modal isOpen={Boolean(selectedService)} onClose={onClose} title={selectedService.title}>
      <div style={{ padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
              color: 'var(--brand-green, #7FE87F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedService.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {selectedService.title}
            </h3>
            <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '2px 0 0 0' }}>
              {selectedService.subTitle}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="modal-acc-input"
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#8E9BAE',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
              display: 'block',
            }}
          >
            {translateText('Account / Consumer Number', language)}
          </label>
          <input
            id="modal-acc-input"
            type="text"
            value={accountNumber}
            onChange={(e) => onAccountNumberChange(e.target.value)}
            placeholder={selectedService.placeholder}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="modal-amt-input"
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#8E9BAE',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
              display: 'block',
            }}
          >
            {t('amount')} ({t('sar')})
          </label>
          <input
            id="modal-amt-input"
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={t('enter_amount')}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: '1.5px solid var(--brand-green, #7FE87F)',
              fontSize: '20px',
              fontWeight: 900,
              color: 'var(--brand-green, #7FE87F)',
              outline: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        </div>

        <PrimaryButton onClick={onProceedPayment}>
          {t('pay_now')} <Check size={18} />
        </PrimaryButton>
      </div>
    </Modal>
  );
};
