import React from 'react';
import { Landmark, Copy, CheckCircle2 } from 'lucide-react';

interface ReceiveIbanCardProps {
  formattedIban: string;
  copiedIban: boolean;
  isAr: boolean;
  onCopyIban: () => void;
}

export const ReceiveIbanCard: React.FC<ReceiveIbanCardProps> = ({
  formattedIban,
  copiedIban,
  isAr,
  onCopyIban,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '16px',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
            color: 'var(--brand-green, #7FE87F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Landmark size={20} />
        </div>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: '#8E9BAE',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {isAr ? 'رقم الآيبان (IBAN)' : 'IBAN Number'}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#FFFFFF',
              marginTop: '2px',
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
            }}
            dir="ltr"
          >
            {formattedIban}
          </div>
        </div>
      </div>

      <button
        onClick={onCopyIban}
        className="interactive-tap"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: copiedIban
            ? 'var(--brand-green, #7FE87F)'
            : 'var(--color-surface-elevated, #182236)',
          color: copiedIban ? '#080C14' : 'var(--brand-green, #7FE87F)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: '12.5px',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {copiedIban ? <CheckCircle2 size={14} /> : <Copy size={14} />}
        <span>{copiedIban ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الآيبان' : 'Copy IBAN'}</span>
      </button>
    </div>
  );
};
