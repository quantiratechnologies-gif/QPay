import React from 'react';
import type { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../state/AppContext';

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
  hideSubtitle?: boolean;
  isLast?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onClick,
  hideSubtitle = false,
  isLast = false,
}) => {
  const { language, t } = useApp();
  const isReceived = transaction.type === 'received';

  const defaultSub = isReceived ? 'Received via Sarie' : 'Paid via Sarie';
  const displayTitle = t(transaction.title, transaction.title);
  const displaySub = t(transaction.subTitle || defaultSub, transaction.subTitle || defaultSub);
  const displayDate = t(transaction.date, transaction.date);

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
      className={onClick ? 'interactive-tap' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 18px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: 'none',
        transition: 'background-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: isReceived ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))' : 'var(--color-surface-elevated, #182236)',
            border: 'none',
            color: isReceived ? 'var(--brand-green, #7FE87F)' : '#A2A2BA',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {transaction.avatarInitials || transaction.title.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFFFFF', lineHeight: '18px' }}>
            {displayTitle}
          </div>
          {!hideSubtitle && (
            <div style={{ fontSize: '11.5px', color: '#8E9BAE', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{displaySub} &bull; {transaction.utr.substring(0, 10)}</span>
              {transaction.isReported && (
                <span style={{ backgroundColor: 'rgba(255, 179, 0, 0.15)', color: '#FFB300', padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.04em' }}>
                  {language === 'العربية' ? 'معترض عليه' : 'REPORTED'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: language === 'العربية' ? 'left' : 'right' }}>
        <div
          className="tabular-nums"
          style={{
            fontWeight: 900,
            fontSize: '15px',
            color: isReceived ? 'var(--brand-green, #7FE87F)' : '#FFFFFF',
          }}
        >
          {isReceived ? '+' : '-'}{formatCurrency(transaction.amount, language)}
        </div>
        <div style={{ fontSize: '11px', color: '#8E9BAE', marginTop: '2px', fontWeight: 600 }}>
          {displayDate}
        </div>
      </div>
    </div>
  );
};
