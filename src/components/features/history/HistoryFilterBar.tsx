import React from 'react';
import { Search, X, Download } from 'lucide-react';

export type FilterType = 'all' | 'sent' | 'received' | 'pending';

interface HistoryFilterBarProps {
  filter: FilterType;
  onSelectFilter: (f: FilterType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showSearch: boolean;
  onDownloadStatement: () => void;
  isAr: boolean;
  isRtl: boolean;
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  filter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  showSearch,
  onDownloadStatement,
  isAr,
  isRtl,
}) => {
  const filterLabels: Record<FilterType, { ar: string; en: string }> = {
    all: { ar: 'الكل', en: 'All' },
    sent: { ar: 'المدفوعات', en: 'Sent' },
    received: { ar: 'المستلمة', en: 'Received' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
  };

  return (
    <>
      {showSearch && (
        <div style={{ padding: '0 20px', marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-surface, #111726)',
              border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
              borderRadius: '14px',
              padding: '11px 14px',
            }}
          >
            <Search size={16} color="var(--brand-green, #7FE87F)" />
            <input
              type="text"
              placeholder={isAr ? 'البحث بالاسم أو المرجع البنكي (SARIE UTR)...' : 'Search by name or SARIE UTR...'}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                width: '100%',
                textAlign: isRtl ? 'right' : 'left',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs & Statement Download Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '0 20px',
          marginBottom: '14px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            flex: 1,
            minWidth: 0,
          }}
        >
          {(['all', 'sent', 'received', 'pending'] as FilterType[]).map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => onSelectFilter(f)}
                className="interactive-tap"
                style={{
                  backgroundColor: isActive ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface, #111726)',
                  border: isActive ? '1px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  color: isActive ? 'var(--brand-green-ink, #080C14)' : '#9ca3af',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {isAr ? filterLabels[f].ar : filterLabels[f].en}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onDownloadStatement}
          className="interactive-tap"
          title={isAr ? 'كشف الحساب (PDF)' : 'Statement (PDF)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid rgba(127, 232, 127, 0.35)',
            color: 'var(--brand-green, #7FE87F)',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Download size={13} />
          <span>{isAr ? 'كشف الحساب' : 'Statement'}</span>
        </button>
      </div>
    </>
  );
};
