import React from 'react';

interface ScanManualInputDrawerProps {
  show: boolean;
  value: string;
  onChange: (val: string) => void;
  onSubmit: (val: string) => void;
  isAr: boolean;
}

export const ScanManualInputDrawer: React.FC<ScanManualInputDrawerProps> = ({
  show,
  value,
  onChange,
  onSubmit,
  isAr,
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        margin: '0 20px 10px 20px',
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid rgba(127, 232, 127, 0.3)',
        borderRadius: '14px',
        padding: '14px',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <label style={{ fontSize: '11.5px', color: '#8E9BAE', fontWeight: 700 }}>
        {isAr ? 'أدخل أو قم بلصق نص الـ QR / معرف سريع للتحقق:' : 'Enter or paste QR payload / Sarie URI to validate:'}
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. sarie://pay?pa=star@sarie&pn=Star&am=50"
          style={{
            flex: 1,
            padding: '10px 12px',
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '12px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => onSubmit(value)}
          style={{
            backgroundColor: 'var(--brand-green, #7FE87F)',
            color: '#080C14',
            border: 'none',
            borderRadius: '8px',
            padding: '0 14px',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {isAr ? 'تحقق' : 'Validate'}
        </button>
      </div>
    </div>
  );
};
