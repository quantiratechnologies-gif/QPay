import React from 'react';

interface SplitTabsProps {
  activeTab: 'active' | 'create';
  onSelectTab: (tab: 'active' | 'create') => void;
  splitsCount: number;
  isAr: boolean;
}

export const SplitTabs: React.FC<SplitTabsProps> = ({
  activeTab,
  onSelectTab,
  splitsCount,
  isAr,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
        borderRadius: '14px',
        padding: '4px',
        marginBottom: '20px',
      }}
    >
      <button
        onClick={() => onSelectTab('active')}
        className="interactive-tap"
        style={{
          flex: 1,
          padding: '10px 0',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: activeTab === 'active' ? 'var(--brand-green, #7FE87F)' : 'transparent',
          color: activeTab === 'active' ? 'var(--brand-green-ink, #080C14)' : '#A2A2BA',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {isAr ? '????????? ????????' : 'Active Splits'} ({splitsCount})
      </button>
      <button
        onClick={() => onSelectTab('create')}
        className="interactive-tap"
        style={{
          flex: 1,
          padding: '10px 0',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: activeTab === 'create' ? 'var(--brand-green, #7FE87F)' : 'transparent',
          color: activeTab === 'create' ? 'var(--brand-green-ink, #080C14)' : '#A2A2BA',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        + {isAr ? '????? ?????? ?????' : 'New Split Bill'}
      </button>
    </div>
  );
};
