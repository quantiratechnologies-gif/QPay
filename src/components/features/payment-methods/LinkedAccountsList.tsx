import React from 'react';
import { Landmark, Star } from 'lucide-react';

interface LinkedAccountsListProps {
  t: (key: string, fallback?: string) => string;
  onNavigateBankAccounts: () => void;
}

export const LinkedAccountsList: React.FC<LinkedAccountsListProps> = ({
  t,
  onNavigateBankAccounts,
}) => {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#A2A2BA',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '10px',
          marginInlineStart: '4px',
        }}
      >
        {t('banks.linked', 'Linked Saudi Accounts')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Primary Al Rajhi Bank Card */}
        <div
          onClick={onNavigateBankAccounts}
          className="interactive-tap"
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            borderRadius: '16px',
            padding: '16px 18px',
            color: '#FFFFFF',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            boxShadow: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-green, #7FE87F)',
              }}
            >
              <Landmark size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                {t('bank.alrajhi', 'Al Rajhi Bank')}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#A2A2BA',
                  marginTop: '2px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
                dir="ltr"
              >
                SA03 •••• 4821
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--brand-green, #7FE87F)',
              color: 'var(--brand-green-ink, #080C14)',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.05em',
              padding: '4px 9px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Star size={10} fill="currentColor" color="currentColor" />{' '}
            {t('banks.primary', 'PRIMARY')}
          </div>
        </div>

        {/* SNB Card */}
        <div
          onClick={onNavigateBankAccounts}
          className="interactive-tap"
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            borderRadius: '16px',
            padding: '16px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-green, #7FE87F)',
              }}
            >
              <Landmark size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                {t('bank.snb', 'Saudi National Bank (SNB)')}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#A2A2BA',
                  marginTop: '2px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
                dir="ltr"
              >
                SA58 •••• 1092
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
              color: 'var(--brand-green, #7FE87F)',
              fontSize: '10.5px',
              fontWeight: 800,
              padding: '4px 9px',
              borderRadius: '12px',
            }}
          >
            {t('banks.active', 'ACTIVE')}
          </div>
        </div>
      </div>
    </div>
  );
};
