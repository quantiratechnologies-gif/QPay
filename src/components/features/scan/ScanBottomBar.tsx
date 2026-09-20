import React from 'react';
import { Image as ImageIcon, Zap } from 'lucide-react';
import { designSystem } from '../../../design-system';

interface ScanBottomBarProps {
  onUploadClick: () => void;
  onDemoPayClick: () => void;
  isAr: boolean;
  uploadLabel: string;
}

export const ScanBottomBar: React.FC<ScanBottomBarProps> = ({
  onUploadClick,
  onDemoPayClick,
  isAr,
  uploadLabel,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '20px',
        background: 'linear-gradient(to top, rgba(11, 15, 25, 0.95), transparent)',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={onUploadClick}
          style={{
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            borderRadius: designSystem.radii.md,
            padding: '12px',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <ImageIcon size={16} color="var(--brand-green, #7FE87F)" /> {uploadLabel}
        </button>

        <button
          onClick={onDemoPayClick}
          style={{
            backgroundColor: 'var(--brand-green, #7FE87F)',
            border: 'none',
            borderRadius: designSystem.radii.md,
            padding: '12px',
            color: 'var(--brand-green-ink, #080C14)',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <Zap size={16} color="var(--brand-green-ink, #080C14)" /> {isAr ? '??? ??????' : 'Demo Pay'}
        </button>
      </div>
    </div>
  );
};
