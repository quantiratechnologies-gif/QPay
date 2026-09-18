import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-surface, #111726)',
          color: '#FFFFFF',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
          borderLeft: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
          borderRight: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
          padding: '24px 20px',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: 'none',
          maxWidth: '600px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '2px',
            margin: '0 auto 16px auto',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {title ? (
            <h3 id="bottom-sheet-title" style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            aria-label="Close sheet"
            className="interactive-tap"
            style={{
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              color: '#9ca3af',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'none',
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
