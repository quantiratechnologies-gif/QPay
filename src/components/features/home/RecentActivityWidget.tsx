import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../../../state/AppContext';
import { TransactionRow } from '../../TransactionRow';

export const RecentActivityWidget: React.FC = () => {
  const { transactions, navigateTo, t, isRtl } = useApp();
  const recentTransactions = transactions.slice(0, 3);

  if (recentTransactions.length === 0) return null;

  return (
    <div style={{ padding: '20px 20px 0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          {t('home.recent_txns', 'Recent Activity')}
        </h3>
        <button
          type="button"
          onClick={() => navigateTo('HISTORY')}
          className="interactive-tap"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--brand-green)',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            boxShadow: 'none',
            padding: 0,
          }}
        >
          <span>{t('home.view_all', 'View All')}</span>
          <ChevronRight size={15} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface, #111726)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        {recentTransactions.map((txn, idx) => (
          <TransactionRow
            key={txn.id}
            transaction={txn}
            hideSubtitle={true}
            isLast={idx === recentTransactions.length - 1}
            onClick={() => navigateTo('HISTORY')}
          />
        ))}
      </div>
    </div>
  );
};
