import React from 'react';
import { Landmark, Zap, Plus } from 'lucide-react';

interface BankOverviewHeroProps {
  accountsCount: number;
  onAddBank: () => void;
  isAr: boolean;
  t: (key: string, fallback: string) => string;
}

export const BankOverviewHero: React.FC<BankOverviewHeroProps> = ({
  accountsCount,
  onAddBank,
  isAr,
  t,
}) => {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, rgba(20, 64, 42, 0.45) 0%, rgba(10, 15, 24, 0.95) 100%)',
        border: '1px solid rgba(127, 232, 127, 0.22)',
        borderRadius: '24px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div
            style={{
              background: 'rgba(127, 232, 127, 0.12)',
              border: '1px solid rgba(127, 232, 127, 0.25)',
              color: '#7FE87F',
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Landmark size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#F3F6F9', marginBottom: '2px' }}>
              {t('banks.linked', 'Linked Saudi Accounts')}
            </h2>
            <div style={{ fontSize: '10px', color: '#8A9BB0', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {isAr ? '???? ????? ?????' : 'SECURE FINANCIAL NETWORK'}
            </div>
          </div>
        </div>

        <span
          style={{
            background: 'rgba(127, 232, 127, 0.12)',
            color: '#7FE87F',
            fontSize: '10.5px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '20px',
            letterSpacing: '0.04em',
            border: '1px solid rgba(127, 232, 127, 0.25)',
          }}
        >
          {isAr ? `${accountsCount} ????` : `${accountsCount} ACTIVE`}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8A9BB0', fontWeight: 500 }}>
        <Zap size={14} color="#7FE87F" />
        <span>{isAr ? '???? ??? ?????? ??????? ?????' : 'Sarie Instant Rails Secured'}</span>
      </div>

      <button
        onClick={onAddBank}
        className="interactive-tap"
        style={{
          background: '#7FE87F',
          color: '#04120A',
          border: 'none',
          fontWeight: 800,
          padding: '13px',
          borderRadius: '14px',
          cursor: 'pointer',
          width: '100%',
          fontSize: '13px',
          letterSpacing: '-0.1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(127, 232, 127, 0.25)',
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>{t('banks.add_bank', 'Add Bank Account')}</span>
      </button>
    </section>
  );
};
