import React from 'react';
import { MessageSquare } from 'lucide-react';
import { toArabicNumerals } from '../../../utils/i18n';
import { formatCurrency } from '../../../utils/formatters';

interface AmountInputCardProps {
  amountStr: string;
  activeChips: number[];
  note: string;
  totalBalance: number;
  perTransactionLimit: number;
  isExceedingBalance: boolean;
  isExceedingLimit: boolean;
  language: string;
  t: (key: string, fallback?: string) => string;
  onAmountChange: (val: string) => void;
  onChipClick: (val: number) => void;
  onNoteChange: (val: string) => void;
}

export const AmountInputCard: React.FC<AmountInputCardProps> = ({
  amountStr,
  activeChips,
  note,
  totalBalance,
  perTransactionLimit,
  isExceedingBalance,
  isExceedingLimit,
  language,
  t,
  onAmountChange,
  onChipClick,
  onNoteChange,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '24px 20px',
        marginBottom: '20px',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: '#9ca3af',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        {t('pay.enter_amount', 'Enter Amount')}
      </div>

      <label
        htmlFor="amount-input"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px',
          cursor: 'text',
        }}
      >
        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-green)' }}>
          {language === 'العربية' ? 'ر.س' : 'SAR'}
        </span>
        <input
          id="amount-input"
          type="text"
          inputMode="decimal"
          value={amountStr}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
              onAmountChange(val);
            }
          }}
          placeholder="0"
          autoFocus
          className="tabular-nums"
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#FFFFFF',
            background: 'none',
            border: 'none',
            outline: 'none',
            width: '100%',
            maxWidth: '240px',
            textAlign: 'left',
            padding: 0,
          }}
        />
      </label>

      {/* Quick Amount Chips with Toggle Select & Deselect */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '18px',
        }}
      >
        {['50', '100', '500', '1000', '2000'].map((val) => {
          const valNum = Number(val);
          const isSelected = activeChips.includes(valNum);
          const formattedVal =
            language === 'العربية' ? `+${toArabicNumerals(val)} ر.س` : `+SAR ${val}`;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChipClick(valNum)}
              className="interactive-tap"
              style={{
                backgroundColor: isSelected
                  ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.2))'
                  : 'var(--color-surface-elevated, #182236)',
                border: isSelected
                  ? '2px solid var(--brand-green, #7FE87F)'
                  : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                color: isSelected ? 'var(--brand-green, #7FE87F)' : '#FFFFFF',
                boxShadow: isSelected ? '0 0 12px rgba(127, 232, 127, 0.25)' : 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {formattedVal}
            </button>
          );
        })}
      </div>

      {/* Note Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--color-surface-elevated)',
          borderRadius: '12px',
          padding: '10px 14px',
          border: '1px solid var(--color-border)',
        }}
      >
        <MessageSquare size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          maxLength={80}
          placeholder={
            language === 'العربية' ? 'إضافة ملاحظة (اختياري)...' : 'Add a note (optional)...'
          }
          value={note}
          onChange={(e) => onNoteChange(e.target.value.slice(0, 80))}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '13px',
            width: '100%',
            padding: 0,
          }}
        />
      </div>

      {/* Insufficient Balance or Limit Exceeded Error Banner */}
      {(isExceedingBalance || isExceedingLimit) && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '8px 12px',
            marginTop: '12px',
            fontSize: '12px',
            color: '#EF4444',
            fontWeight: 700,
          }}
        >
          {isExceedingBalance
            ? language === 'العربية'
              ? `الرصيد غير كافٍ (المتاح: ${formatCurrency(totalBalance, language)})`
              : `Insufficient Balance (Available: ${formatCurrency(totalBalance, language)})`
            : language === 'العربية'
            ? `تجاوز الحد المسموح (الحد: ${formatCurrency(perTransactionLimit, language)})`
            : `Transfer Limit Exceeded (Limit: ${formatCurrency(perTransactionLimit, language)})`}
        </div>
      )}
    </div>
  );
};
