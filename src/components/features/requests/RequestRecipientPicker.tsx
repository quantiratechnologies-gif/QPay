import React from 'react';
import type { Contact } from '../../../types';
import { translateText } from '../../../utils/i18n';

interface RequestRecipientPickerProps {
  contacts: Contact[];
  selectedContact: Contact;
  language: string;
  onSelectContact: (contact: Contact) => void;
}

export const RequestRecipientPicker: React.FC<RequestRecipientPickerProps> = ({
  contacts,
  selectedContact,
  language,
  onSelectContact,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
        borderRadius: '16px',
        padding: '16px',
      }}
    >
      <label
        style={{
          fontSize: '11px',
          color: '#A2A2BA',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '10px',
          display: 'block',
        }}
      >
        {translateText('Request From', language)}
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            color: 'var(--brand-green, #7FE87F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '16px',
          }}
        >
          {selectedContact.avatarInitials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
            {selectedContact.name}
          </div>
          <div style={{ fontSize: '12px', color: '#A2A2BA' }}>{selectedContact.upiId}</div>
        </div>
      </div>

      <select
        value={selectedContact.id}
        onChange={(e) => {
          const c = contacts.find((item) => item.id === e.target.value);
          if (c) onSelectContact(c);
        }}
        style={{
          width: '100%',
          backgroundColor: 'var(--color-surface-elevated, #182236)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
          borderRadius: '10px',
          padding: '10px 12px',
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 600,
          outline: 'none',
        }}
      >
        {contacts.map((c) => (
          <option
            key={c.id}
            value={c.id}
            style={{ backgroundColor: '#182236', color: '#FFFFFF' }}
          >
            {c.name} ({c.upiId})
          </option>
        ))}
      </select>
    </div>
  );
};
