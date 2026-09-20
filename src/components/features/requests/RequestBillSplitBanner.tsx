import React from 'react';
import { Users } from 'lucide-react';

interface RequestBillSplitBannerProps {
  onOpenSplitModal: () => void;
  isAr: boolean;
}

export const RequestBillSplitBanner: React.FC<RequestBillSplitBannerProps> = ({
  onOpenSplitModal,
  isAr,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid rgba(127, 232, 127, 0.25)',
        borderRadius: '16px',
        padding: '18px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(127, 232, 127, 0.08) 0%, rgba(17, 23, 38, 0.95) 100%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
            color: 'var(--brand-green, #7FE87F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Users size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>
            {isAr ? '????? ???????? ?? ????????' : 'Split Bill with Friends'}
          </div>
          <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '2px' }}>
            {isAr ? '???? ???????? ???????? ????? ??? ????' : 'Divide expenses equally & request via Sarie'}
          </div>
        </div>
      </div>
      <button
        onClick={onOpenSplitModal}
        className="interactive-tap"
        style={{
          backgroundColor: 'var(--brand-green, #7FE87F)',
          color: 'var(--brand-green-ink, #080C14)',
          border: 'none',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {isAr ? '????? ??????' : 'Split Bill'}
      </button>
    </div>
  );
};
