import React from 'react';
import { X, Edit3, Flashlight } from 'lucide-react';
import { designSystem } from '../../../design-system';

interface ScanHeaderProps {
  onClose: () => void;
  showManualInput: boolean;
  onToggleManualInput: () => void;
  isFlashOn: boolean;
  onToggleFlash: () => void;
  isAr: boolean;
  t: (key: string, fallback: string) => string;
}

export const ScanHeader: React.FC<ScanHeaderProps> = ({
  onClose,
  showManualInput,
  onToggleManualInput,
  isFlashOn,
  onToggleFlash,
  isAr,
  t,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        zIndex: 20,
        background: 'linear-gradient(to bottom, rgba(11, 15, 25, 0.95), transparent)',
      }}
    >
      <button
        onClick={onClose}
        aria-label={t('btn.close', 'Close Scanner')}
        style={{
          backgroundColor: 'var(--color-surface-elevated, #182236)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
          color: '#FFFFFF',
          width: '40px',
          height: '40px',
          borderRadius: designSystem.radii.full,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={20} />
      </button>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '800', margin: 0 }}>
          {t('scan.title', 'Scan QR Code')}
        </h2>
        <span style={{ fontSize: '11px', color: '#8E9BAE', fontWeight: '600' }}>
          {isAr ? '??? QR • ???? • ??? ???? ???????' : 'mada QR • Sarie • In-store & Online Checkout'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onToggleManualInput}
          aria-label="Manual Code Entry"
          style={{
            backgroundColor: showManualInput ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface-elevated, #182236)',
            border: showManualInput ? 'none' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            color: showManualInput ? 'var(--brand-green-ink, #080C14)' : '#FFFFFF',
            width: '40px',
            height: '40px',
            borderRadius: designSystem.radii.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <Edit3 size={18} />
        </button>
        <button
          onClick={onToggleFlash}
          aria-label="Toggle Flashlight"
          style={{
            backgroundColor: isFlashOn ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface-elevated, #182236)',
            border: isFlashOn ? 'none' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            color: isFlashOn ? 'var(--brand-green-ink, #080C14)' : '#FFFFFF',
            width: '40px',
            height: '40px',
            borderRadius: designSystem.radii.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <Flashlight size={18} />
        </button>
      </div>
    </div>
  );
};
