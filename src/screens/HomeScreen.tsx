import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { BankCardCarousel } from '../components/BankCardCarousel';
import { BalanceSummaryModal } from '../components/BalanceSummaryModal';
import { useApp } from '../state/AppContext';
import {
  KycBanner,
  TotalBalanceCard,
  QuickActionsGrid,
  ServicesGrid,
  SpendAnalysisWidget,
  RecentActivityWidget,
} from '../components/features/home';

export const HomeScreen: React.FC = () => {
  const { bankAccounts, navigateTo, openPinModal, t } = useApp();
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [showTotalBalance, setShowTotalBalance] = useState(false);

  const totalBalance = bankAccounts.find((b) => b.isPrimary)?.balance || (bankAccounts[0]?.balance || 0);

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

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0B14', minHeight: '100%', paddingBottom: '96px' }}>
      {/* 1. Header with brand logo and notification trigger */}
      <AppHeader
        showSettings={false}
        rightAction={
          <button
            type="button"
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

      {/* 2. e-KYC Verification Action Card */}
      <KycBanner />

      {/* 3. Total Balance & Instant Sarie Overview Hero */}
      <TotalBalanceCard
        showTotalBalance={showTotalBalance}
        onToggleBalance={handleToggleBalance}
        onOpenAccounts={() => setIsBalanceModalOpen(true)}
      />

      {/* 4. Primary Quick Actions: Scan, Send, Receive, Accounts */}
      <QuickActionsGrid />

      {/* 5. Linked Saudi Bank Accounts Carousel */}
      {bankAccounts.length > 0 && (
        <div style={{ marginTop: '18px' }}>
          <BankCardCarousel banks={bankAccounts} />
        </div>
      )}

      {/* 6. Bills & Public Utilities Grid */}
      <ServicesGrid />

      {/* 7. Spend Analytics Breakdown Widget */}
      <SpendAnalysisWidget />

      {/* 8. Recent Activity List */}
      <RecentActivityWidget />

      {/* 9. Verified Sarie Balance Modal Sheet */}
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
