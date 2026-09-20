import React from 'react';
import { formatSaudiCurrency } from '../../../utils/i18n';
import type { SplitExpense } from '../../../types';

interface ActiveSplitCardProps {
  expense: SplitExpense;
  onMarkPaid: (expenseId: string, memberId: string) => void;
  language: string;
  isAr: boolean;
}

export const ActiveSplitCard: React.FC<ActiveSplitCardProps> = ({
  expense,
  onMarkPaid,
  language,
  isAr,
}) => {
  const paidCount = expense.members.filter((m) => m.hasPaid).length;
  const totalMembers = expense.members.length;
  const progressPct = totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
        borderRadius: '18px',
        padding: '20px',
      }}
    >
      {/* Header: Title, Status and Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{expense.title}</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: expense.status === 'settled' ? 'rgba(127, 232, 127, 0.16)' : 'rgba(245, 158, 11, 0.16)',
                color: expense.status === 'settled' ? '#7FE87F' : '#F59E0B',
                textTransform: 'uppercase',
              }}
            >
              {expense.status === 'settled' ? (isAr ? '????? ?????' : 'Settled') : (isAr ? '??? ??????' : 'In Progress')}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px' }}>
            {expense.date} • {isAr ? `${paidCount} ?? ${totalMembers} ?? ?????` : `${paidCount} of ${totalMembers} Paid`}
          </div>
        </div>

        <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
          {formatSaudiCurrency(expense.totalAmount, language)}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: 'var(--brand-green, #7FE87F)', borderRadius: '999px', transition: 'width 0.3s ease' }} />
      </div>

      {/* Members List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {expense.members.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: m.hasPaid ? 'rgba(127, 232, 127, 0.18)' : '#2C2C44',
                  color: m.hasPaid ? '#7FE87F' : '#A2A2BA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '12px',
                }}
              >
                {m.avatarInitials}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: '#8E9BAE' }}>{m.upiId}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                {formatSaudiCurrency(m.amount, language)}
              </span>
              {m.hasPaid ? (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--brand-green, #7FE87F)',
                    backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  ? {isAr ? '????' : 'Paid'}
                </span>
              ) : (
                <button
                  onClick={() => onMarkPaid(expense.id, m.id)}
                  className="interactive-tap"
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#080C14',
                    backgroundColor: 'var(--brand-green, #7FE87F)',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? '????? ??????' : 'Mark Paid'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
