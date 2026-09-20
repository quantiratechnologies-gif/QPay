import React from 'react';
import { CreditCard, Wifi } from 'lucide-react';

interface SavedCardsListProps {
  language: string;
  t: (key: string, fallback?: string) => string;
}

export const SavedCardsList: React.FC<SavedCardsListProps> = ({ language, t }) => {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#A2A2BA',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '10px',
          marginInlineStart: '4px',
        }}
      >
        {t('cards.saved_cards', 'Saved mada & Credit Cards')}
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface, #111726)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-green, #7FE87F)',
            }}
          >
            <CreditCard size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              {language === 'العربية'
                ? 'بطاقة مدى الرقمية (بنك الرياض)'
                : 'mada Debit Card (Riyad Bank)'}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#A2A2BA',
                marginTop: '2px',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              •••• 9901 &bull; {language === 'العربية' ? 'مدى باي وسريع' : 'Sarie & mada Pay'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wifi size={16} color="#6E6E85" />
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 800,
              color: 'var(--brand-green, #7FE87F)',
              backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
              padding: '3px 8px',
              borderRadius: '10px',
            }}
          >
            {language === 'العربية' ? 'مرتبطة' : 'LINKED'}
          </span>
        </div>
      </div>
    </div>
  );
};
