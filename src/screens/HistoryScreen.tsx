import React, { useState } from 'react';
import { Receipt, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { TransactionRow } from '../components/TransactionRow';
import { useApp } from '../state/AppContext';
import type { Transaction } from '../types';
import {
  HistoryFilterBar,
  TransactionDetailSheet,
  generateStatementHtml,
} from '../components/features/history';
import type { FilterType } from '../components/features/history';

export const HistoryScreen: React.FC = () => {
  const { transactions, t, isRtl, language, bankAccounts, reportTransaction, user } = useApp();
  const isAr = language === 'العربية' || language === 'ar';

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [statementSuccess, setStatementSuccess] = useState(false);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'sent'
        ? txn.type === 'sent'
        : filter === 'received'
        ? txn.type === 'received'
        : txn.type === 'pending';

    const matchesSearch =
      txn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.subTitle && txn.subTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      txn.utr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const groupedByDate: Record<string, typeof transactions> = {};
  filteredTransactions.forEach((txn) => {
    const key = txn.date || 'TODAY';
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(txn);
  });

  const handleDownloadStatement = () => {
    const primaryAccount = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];

    const htmlContent = generateStatementHtml({
      transactions: filteredTransactions,
      user,
      primaryAccount,
      dateStr: new Date().toLocaleDateString('en-GB'),
    });

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QTPay_Statement_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatementSuccess(true);
    setTimeout(() => setStatementSuccess(false), 3000);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader
        title={t('history.title', 'Transactions')}
        showSearch
        onSearchClick={() => setShowSearchInput((prev) => !prev)}
        showSettings
      />

      {statementSuccess && (
        <div
          className="fade-in"
          style={{
            margin: '0 20px 14px 20px',
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.16))',
            border: '1px solid var(--brand-green, #7FE87F)',
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--brand-green, #7FE87F)',
            fontSize: '12.5px',
            fontWeight: 800,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{isAr ? '?? ????? ?????? ??? ?????? ????? (PDF)' : 'Statement generated & downloaded successfully (PDF)'}</span>
        </div>
      )}

      <HistoryFilterBar
        filter={filter}
        onSelectFilter={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={showSearchInput}
        onDownloadStatement={handleDownloadStatement}
        isAr={isAr}
        isRtl={isRtl}
      />

      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        {Object.keys(groupedByDate).length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              backgroundColor: 'var(--color-surface, #111726)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '20px',
              padding: '40px 20px',
              color: '#9ca3af',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <Receipt size={24} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              {isAr ? '?? ???? ??????' : 'No transactions'}
            </div>
            <div style={{ fontSize: '13px', marginTop: '4px', color: '#9ca3af' }}>
              {isAr ? '???? ????? ????? ?? ???????' : 'Try adjusting your search or filters'}
            </div>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateLabel, items]) => (
            <div key={dateLabel} style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#9ca3af',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  marginInlineStart: '4px',
                }}
              >
                {t(dateLabel, dateLabel)}
              </div>
              <div
                style={{
                  backgroundColor: 'var(--color-surface, #111726)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                {items.map((txn, idx) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={txn}
                    isLast={idx === items.length - 1}
                    onClick={() => setSelectedTxn(txn)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <TransactionDetailSheet
        transaction={selectedTxn}
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        onReportDispute={(id) => reportTransaction(id)}
        language={language}
        isRtl={isRtl}
      />
    </div>
  );
};
export default HistoryScreen;
