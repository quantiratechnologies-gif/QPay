import React from 'react';
import { Store, Coffee, X } from 'lucide-react';
import { designSystem } from '../../../design-system';

interface ScanPresetsBarProps {
  onSelectPreset: (payload: string, contact: any, amount?: number) => void;
  onSelectInvalid: (payload: string) => void;
  isAr: boolean;
}

export const ScanPresetsBar: React.FC<ScanPresetsBarProps> = ({
  onSelectPreset,
  onSelectInvalid,
  isAr,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        zIndex: 10,
        overflowX: 'auto',
        maxWidth: '100%',
        padding: '4px',
      }}
    >
      <button
        onClick={() =>
          onSelectPreset(
            'sarie://pay?pa=star@sarie&pn=Star%20Supermarket&am=280',
            { id: 'm-1', name: 'Star Supermarket', upiId: 'star@sarie', avatarInitials: 'SS' },
            280
          )
        }
        style={{
          backgroundColor: 'var(--color-surface-elevated, #182236)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
          borderRadius: designSystem.radii.sm,
          padding: '6px 12px',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <Store size={13} color="var(--brand-green, #7FE87F)" /> {isAr ? '????? ????' : 'Star Supermarket'}
      </button>

      <button
        onClick={() =>
          onSelectPreset(
            'sarie://pay?pa=halfmillion@sarie&pn=Half%20Million&am=180',
            { id: 'm-2', name: 'Half Million Coffee', upiId: 'halfmillion@sarie', avatarInitials: 'HM' },
            180
          )
        }
        style={{
          backgroundColor: 'var(--color-surface-elevated, #182236)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
          borderRadius: designSystem.radii.sm,
          padding: '6px 12px',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <Coffee size={13} color="var(--brand-green, #7FE87F)" /> {isAr ? '??? ????? ?????' : 'Half Million Coffee'}
      </button>

      <button
        onClick={() => onSelectInvalid('https://random-unsupported-website.com/not-a-payment-qr')}
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: designSystem.radii.sm,
          padding: '6px 12px',
          color: '#EF4444',
          fontSize: '11px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <X size={13} color="#EF4444" /> {isAr ? '?????? ??? ??? ?????' : 'Test Invalid QR'}
      </button>
    </div>
  );
};
