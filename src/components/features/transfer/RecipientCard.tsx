import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Contact } from '../../../types';

interface RecipientCardProps {
  contact: Contact;
  displayName: string;
  language: string;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({
  contact,
  displayName,
  language,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '24px 20px',
        marginBottom: '20px',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--brand-green-tint)',
          color: 'var(--brand-green)',
          fontWeight: 800,
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          border: 'none',
        }}
      >
        {contact.avatarInitials}
      </div>
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 800,
          marginBottom: '4px',
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
        }}
      >
        {displayName}
      </h2>
      <div
        style={{
          fontSize: '12.5px',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <span>{contact.upiId}</span>
        <span style={{ color: '#4b5563' }}>•</span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            color: 'var(--brand-green)',
            fontWeight: 700,
          }}
        >
          <ShieldCheck size={14} /> {language === 'العربية' ? 'موثوق' : 'Verified'}
        </span>
      </div>
    </div>
  );
};
