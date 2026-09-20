import React from 'react';
import { Check } from 'lucide-react';
import { formatSaudiCurrency, translateText } from '../../../utils/i18n';
import type { Contact } from '../../../types';

interface RequestSuccessViewProps {
  amountStr: string;
  selectedContact: Contact;
  isAr: boolean;
  language: string;
}

export const RequestSuccessView: React.FC<RequestSuccessViewProps> = ({
  amountStr,
  selectedContact,
  isAr,
  language,
}) => {
  return (
    <div
      className="fade-in"
      style={{
        textAlign: 'center',
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
        borderRadius: '20px',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
          color: 'var(--brand-green, #7FE87F)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        <Check size={32} />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px', color: '#FFFFFF' }}>
        {translateText('Request Sent Successfully!', language)}
      </h3>
      <p style={{ color: '#A2A2BA', fontSize: '13px', margin: 0 }}>
        {isAr ? (
          <>
            تم إرسال طلب بمبلغ {formatSaudiCurrency(parseFloat(amountStr) || 0, language)} إلى{' '}
            <strong style={{ color: '#FFFFFF' }}>{selectedContact.name}</strong>
          </>
        ) : (
          <>
            Requested SAR {amountStr} from{' '}
            <strong style={{ color: '#FFFFFF' }}>{selectedContact.name}</strong>
          </>
        )}
      </p>
    </div>
  );
};
