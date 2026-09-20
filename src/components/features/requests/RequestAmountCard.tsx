import React from 'react';
import { formatSaudiCurrency, translateText } from '../../../utils/i18n';

interface RequestAmountCardProps {
  amountStr: string;
  note: string;
  isAr: boolean;
  language: string;
  onAmountChange: (amt: string) => void;
  onNoteChange: (note: string) => void;
}

export const RequestAmountCard: React.FC<RequestAmountCardProps> = ({
  amountStr,
  note,
  isAr,
  language,
  onAmountChange,
  onNoteChange,
}) => {
  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--color-surface, #111726)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <label
          style={{
            fontSize: '11px',
            color: '#A2A2BA',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            display: 'block',
          }}
        >
          {translateText('Enter Request Amount', language)}
        </label>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
            borderRadius: '14px',
            padding: '12px 18px',
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--brand-green, #7FE87F)',
              marginInlineEnd: '8px',
            }}
          >
            {isAr ? 'ر.س' : 'SAR'}
          </span>
          <input
            type="number"
            value={amountStr}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0"
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: 900,
              outline: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        </div>

        {/* Quick Amount Chips with Toggle Select & Deselect */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[50, 100, 500, 1000].map((quickAmt) => {
            const valStr = quickAmt.toString();
            const isSelected = amountStr === valStr;
            return (
              <button
                key={quickAmt}
                type="button"
                className="interactive-tap"
                onClick={() => {
                  if (amountStr === valStr) {
                    onAmountChange('');
                  } else {
                    onAmountChange(valStr);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '10px',
                  backgroundColor: isSelected
                    ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.2))'
                    : 'var(--color-surface-elevated, #182236)',
                  border: isSelected
                    ? '2px solid var(--brand-green, #7FE87F)'
                    : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  color: isSelected ? 'var(--brand-green, #7FE87F)' : '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {formatSaudiCurrency(quickAmt, language)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note Card */}
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
            marginBottom: '8px',
            display: 'block',
          }}
        >
          {translateText('Payment Note (Optional)', language)}
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={translateText(
            'What is this request for? (e.g. Dinner, Rent)',
            language
          )}
          style={{
            width: '100%',
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            outline: 'none',
          }}
        />
      </div>
    </>
  );
};
