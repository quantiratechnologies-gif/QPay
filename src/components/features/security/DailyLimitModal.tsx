import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DailyLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimit: number;
  onSaveLimit: (limit: number) => void;
  isAr: boolean;
}

export const DailyLimitModal: React.FC<DailyLimitModalProps> = ({
  isOpen,
  onClose,
  currentLimit,
  onSaveLimit,
  isAr,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(currentLimit);
  const [customAmount, setCustomAmount] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    let finalLimit = selectedPreset;
    if (selectedPreset === -1) {
      const parsed = parseInt(customAmount, 10);
      if (isNaN(parsed) || parsed < 1000 || parsed > 100000) {
        return;
      }
      finalLimit = parsed;
    }
    onSaveLimit(finalLimit);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2600,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface, #111726)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
          width: '100%',
          maxWidth: '500px',
          padding: '24px 20px',
          animation: 'slideUp 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {isAr ? '????? ???? ?????? ???????' : 'Set Daily Sarie Limit'}
            </h3>
            <span style={{ fontSize: '11.5px', color: '#8E9BAE', marginTop: '2px', display: 'block' }}>
              {isAr ? '????? ?????? ????? ??????? ??????? (????)' : 'Compliant with Saudi Central Bank (SAMA) standards'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8E9BAE', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {[10000, 20000, 50000].map((preset) => {
            const isSelected = selectedPreset === preset;
            return (
              <div
                key={preset}
                onClick={() => setSelectedPreset(preset)}
                className="interactive-tap"
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'rgba(127, 232, 127, 0.12)' : 'var(--color-surface-elevated, #182236)',
                  border: isSelected ? '1.5px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                    SAR {preset.toLocaleString()} / {isAr ? '???' : 'Day'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8E9BAE', marginTop: '2px' }}>
                    {preset === 50000
                      ? (isAr ? '???? ????????? ?????? ?? ?? ????? ???????' : 'SAMA Standard Recommended Limit')
                      : (isAr ? '????? ?????? ???? ??????' : 'Lower transfer cap for enhanced safety')}
                  </div>
                </div>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid var(--brand-green, #7FE87F)' : '2px solid #8E9BAE',
                    backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  }}
                />
              </div>
            );
          })}

          {/* Custom Limit Option */}
          <div
            onClick={() => setSelectedPreset(-1)}
            className="interactive-tap"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: selectedPreset === -1 ? 'rgba(127, 232, 127, 0.12)' : 'var(--color-surface-elevated, #182236)',
              border: selectedPreset === -1 ? '1.5px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                {isAr ? '?? ????' : 'Custom Limit'}
              </span>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: selectedPreset === -1 ? '5px solid var(--brand-green, #7FE87F)' : '2px solid #8E9BAE',
                  backgroundColor: selectedPreset === -1 ? '#FFFFFF' : 'transparent',
                }}
              />
            </div>
            {selectedPreset === -1 && (
              <div style={{ marginTop: '12px' }}>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="e.g. 75000 (Max 100,000)"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--brand-green, #7FE87F)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="interactive-tap"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: 'var(--brand-green, #7FE87F)',
            color: 'var(--brand-green-ink, #080C14)',
            fontWeight: 800,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isAr ? '??? ???? ??????' : 'Save Daily Limit'}
        </button>
      </div>
    </div>
  );
};
