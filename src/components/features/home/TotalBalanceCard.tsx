import React from 'react';
import { Eye, EyeOff, ShieldCheck, Lock, Landmark } from 'lucide-react';
import { useApp } from '../../../state/AppContext';
import { formatCurrency } from '../../../utils/formatters';

interface TotalBalanceCardProps {
  showTotalBalance: boolean;
  onToggleBalance: () => void;
  onOpenAccounts: () => void;
}

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  showTotalBalance,
  onToggleBalance,
  onOpenAccounts,
}) => {
  const { user, bankAccounts, t, language } = useApp();
  const totalBalance = bankAccounts.find((b) => b.isPrimary)?.balance || (bankAccounts[0]?.balance || 0);
  const isAr = language === 'العربية';

  return (
    <div style={{ padding: '14px 20px 0 20px', position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(145deg, #0d3829 0%, #061e16 100%)',
          border: '1px solid var(--brand-green-border)',
          borderRadius: '24px',
          padding: '24px 22px',
          color: '#FFFFFF',
          boxShadow: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Subtle Inner Glass Sheen Layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '24px',
            background: 'linear-gradient(125deg, rgba(255, 255, 255, 0.08) 0%, transparent 45%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#86efac',
                textTransform: 'uppercase',
                lineHeight: 1.35,
              }}
            >
              {t('home.total_balance', 'Total Balance')}
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#7FE87F',
                backgroundColor: 'rgba(127, 232, 127, 0.14)',
                padding: '2px 8px',
                borderRadius: '6px',
                marginTop: '4px',
                width: 'fit-content',
                fontFamily: 'monospace',
              }}
            >
              <span>{user.upiId || 'fahad@sarie'}</span>
            </div>
          </div>

          {/* Badges Container */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onToggleBalance}
              aria-label={showTotalBalance ? t('home.hide', 'Hide') : t('home.pin_required', 'PIN Required')}
              title={showTotalBalance ? t('home.hide', 'Hide') : t('home.pin_required', 'PIN Required')}
              className="interactive-tap"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'rgba(6, 78, 59, 0.6)',
                border: '1px solid rgba(127, 232, 127, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'none',
              }}
            >
              {showTotalBalance ? <EyeOff size={16} color="#7FE87F" /> : <Eye size={16} color="#7FE87F" />}
            </button>

            <div
              title={t('home.sarie_rail', 'Sarie 24/7 Rail')}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'rgba(6, 78, 59, 0.6)',
                border: '1px solid rgba(127, 232, 127, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={16} color="#7FE87F" />
            </div>
          </div>
        </div>

        {/* Middle Balance Value Section */}
        <div
          onClick={onToggleBalance}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '22px',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {showTotalBalance ? (
            <div
              className="tabular-nums"
              style={{
                fontSize: '30px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {formatCurrency(totalBalance, language)}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  color: '#FFFFFF',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
              >
                {isAr ? 'ر.س' : 'SAR'}
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '4px' }}>
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="masked-dot" style={{ animationDelay: `${idx * 0.18}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            onClick={onToggleBalance}
            className="interactive-tap"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#86efac',
              backgroundColor: 'rgba(4, 47, 46, 0.45)',
              padding: '7px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(127, 232, 127, 0.22)',
              cursor: 'pointer',
            }}
          >
            <Lock size={13} color="#fbbf24" />
            <span style={{ whiteSpace: 'nowrap' }}>
              {showTotalBalance
                ? (isAr ? 'رصيد سريع المباشر' : 'Live Sarie Balance')
                : (isAr ? 'إدخال الرمز السري' : 'Enter PIN')}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAccounts}
            className="interactive-tap"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.48))',
              border: '1px solid rgba(110, 231, 183, 0.35)',
              borderRadius: '12px',
              padding: '8px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: 'none',
            }}
          >
            <Landmark size={15} color="var(--brand-green)" />
            <span>{t('home.accounts', 'Accounts')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
