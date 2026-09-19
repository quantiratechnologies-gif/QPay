import React, { useState } from 'react';
import {
  Bell,
  Camera,
  Send,
  QrCode,
  Zap,
  Smartphone,
  Droplets,
  Car,
  ChevronRight,
  Landmark,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  PieChart,
  TrendingDown,
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { BankCardCarousel } from '../components/BankCardCarousel';
import { BalanceSummaryModal } from '../components/BalanceSummaryModal';
import { TransactionRow } from '../components/TransactionRow';
import { useApp } from '../state/AppContext';
import { formatCurrency } from '../utils/formatters';

export const HomeScreen: React.FC = () => {
  const { user, bankAccounts, transactions, navigateTo, setIsScanModalOpen, openPinModal, isKycVerified, t, language, isRtl } = useApp();
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [showTotalBalance, setShowTotalBalance] = useState(false);

  const totalBalance = bankAccounts.find(b => b.isPrimary)?.balance || (bankAccounts[0]?.balance || 0);
  const recentTransactions = transactions.slice(0, 3);

  const handleToggleBalance = () => {
    if (showTotalBalance) {
      setShowTotalBalance(false);
    } else {
      openPinModal({
        title: t('sec.enter_pin', 'Enter PIN to View Balance'),
        subTitle: t('sec.enter_pin_sub', 'Enter 4-digit security PIN to view your total balance'),
        amount: totalBalance,
        onSuccess: () => setShowTotalBalance(true),
      });
    }
  };

  const handleCheckBalanceClick = () => {
    setIsBalanceModalOpen(true);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0B14', minHeight: '100%', paddingBottom: '96px' }}>
      {/* 1. Header with exact center brand logo and icon-only profile avatar */}
      <AppHeader
        showSettings={false}
        rightAction={
          <button
            onClick={() => navigateTo('NOTIFICATIONS')}
            aria-label={t('notif.title', 'Notifications')}
            className="interactive-tap"
            style={{
              backgroundColor: '#151524',
              border: '1px solid #2C2C44',
              color: '#FFFFFF',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: 'none',
            }}
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '9px',
                right: '9px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#7FE87F',
              }}
            />
          </button>
        }
      />

      {/* e-KYC Verification Action Card (when unverified) */}
      {!isKycVerified && (
        <div style={{ padding: '14px 20px 0 20px' }}>
          <div
            className="interactive-tap"
            onClick={() => navigateTo('ONBOARDING_KYC')}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--brand-green-border)',
              borderRadius: '20px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={22} color="var(--brand-green)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  {language === 'العربية' ? 'توثيق الهوية' : 'Verify Identity'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                  {language === 'العربية' ? 'وثّق هويتك لتفعيل كافة الخدمات والمزايا' : 'Verify your identity to activate all features'}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('ONBOARDING_KYC');
              }}
              className="interactive-tap"
              style={{
                width: 'auto',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
                backgroundColor: 'var(--brand-green)',
                color: 'var(--brand-green-ink)',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {language === 'العربية' ? 'توثيق' : 'Verify'}
            </button>
          </div>
        </div>
      )}

      {/* 2. Total Balance & Instant Sarie Overview Hero */}
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

            {/* Badges Container: Clean, Minimal Icon Buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleToggleBalance}
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
            onClick={handleToggleBalance}
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
                  {language === 'العربية' ? 'ر.س' : 'SAR'}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '4px' }}>
                  {[...Array(8)].map((_, idx) => (
                    <div
                      key={idx}
                      className="masked-dot"
                      style={{ animationDelay: `${idx * 0.18}s` }}
                    />
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
              onClick={handleToggleBalance}
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
                  ? (language === 'العربية' ? 'رصيد سريع المباشر' : 'Live Sarie Balance')
                  : (language === 'العربية' ? 'إدخال الرمز السري' : 'Enter PIN')}
              </span>
            </div>

            <button
              onClick={handleCheckBalanceClick}
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

      {/* 3. Primary Quick Actions: Transfer & Pay */}
      <div style={{ padding: '14px 20px 0 20px' }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '18px',
            padding: '18px 16px',
            boxShadow: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
              {t('home.quick_actions', 'Quick Actions')}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {/* Scan QR */}
            <div
              onClick={() => setIsScanModalOpen(true)}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <Camera size={22} color="var(--brand-green)" />
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {t('home.scan_qr', 'Scan QR')}
              </span>
            </div>

            {/* Send Money */}
            <div
              onClick={() => navigateTo('PAY_ANYONE')}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <Send size={22} color="var(--brand-green)" style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {t('home.send_money', 'Send Money')}
              </span>
            </div>

            {/* Receive */}
            <div
              onClick={() => navigateTo('RECEIVE')}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <QrCode size={22} color="var(--brand-green)" />
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {t('home.receive', 'Receive')}
              </span>
            </div>

            {/* Bank Accounts */}
            <div
              onClick={() => navigateTo('BANK_ACCOUNTS')}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <Landmark size={22} color="var(--brand-green)" />
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {t('home.accounts', 'Accounts')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. My Linked Saudi Bank Accounts Carousel */}
      {bankAccounts.length > 0 && (
        <div style={{ marginTop: '18px' }}>
          <BankCardCarousel banks={bankAccounts} />
        </div>
      )}

      {/* 5. Bills & Public Utilities */}
      <div style={{ padding: '14px 20px 0 20px' }}>
        <div
          style={{
            backgroundColor: '#151524',
            border: '1px solid #2C2C44',
            borderRadius: '18px',
            padding: '18px 16px',
            boxShadow: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
              {t('home.utilities_services', 'Bills & Utilities')}
            </h3>

            <button
              onClick={() => navigateTo('ALL_SERVICES')}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {/* Electricity (SEC) */}
            <div
              onClick={() => navigateTo('ELECTRICITY')}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <Zap size={22} color="var(--brand-green)" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {t('home.electricity', 'Electricity')}
              </span>
            </div>

            {/* Telecom (STC/Mobily/Zain) */}
            <div
              onClick={() => navigateTo('ALL_SERVICES')}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <Smartphone size={22} color="var(--brand-green)" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {t('home.telecom', 'Telecom')}
              </span>
            </div>

            {/* Water (NWC) */}
            <div
              onClick={() => navigateTo('ALL_SERVICES')}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <Droplets size={22} color="var(--brand-green)" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {t('home.water', 'Water')}
              </span>
            </div>

            {/* Traffic Fines (Absher) */}
            <div
              onClick={() => navigateTo('ALL_SERVICES')}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <Car size={22} color="var(--brand-green)" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {t('home.traffic_fines', 'Traffic Fines')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spend Analytics Widget Card */}
      <div style={{ padding: '0 20px', marginTop: '16px' }}>
        <div
          onClick={() => navigateTo('SPEND_ANALYSIS')}
          className="interactive-tap"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-green-tint)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PieChart size={20} color="var(--brand-green)" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  {language === 'العربية' ? 'مصاريف الشهر' : 'Monthly Spend'}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: 'var(--brand-green)',
                    backgroundColor: 'var(--brand-green-tint)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}
                >
                  <TrendingDown size={11} />
                  12.4%
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px' }}>
                {language === 'العربية'
                  ? '١٤٬٨٥٠ ر.س في سبتمبر • عرض التحليل'
                  : 'SAR 14,850.00 in September • View breakdown'}
              </div>
            </div>
          </div>

          <ChevronRight size={18} color="#A2A2BA" style={{ transform: isRtl ? 'scaleX(-1)' : 'none', marginInlineStart: '8px', flexShrink: 0 }} />
        </div>
      </div>

      {/* 7. Recent Activity Section */}
      <div style={{ padding: '20px 20px 0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            {t('home.recent_txns', 'Recent Activity')}
          </h3>
          <button
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

      {/* 8. Verified Sarie Balance Modal Sheet */}
      <BalanceSummaryModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        bankAccounts={bankAccounts}
        totalBalance={totalBalance}
        onManageAccounts={() => navigateTo('BANK_ACCOUNTS')}
      />
    </div>
  );
};
