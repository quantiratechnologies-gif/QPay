import React, { useState } from 'react';
import { ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { translateText } from '../utils/i18n';
import type { MoneyRequest } from '../types';
import {
  RequestBillSplitBanner,
  MoneyRequestCard,
  SplitExpenseModal,
} from '../components/features/requests';

export const MoneyRequestsScreen: React.FC = () => {
  const { moneyRequests, openPinModal, completePayment, declineMoneyRequest, addMoneyRequest, contacts, navigateTo, language, t } = useApp();
  const isAr = language === '???????' || language === 'ar';

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePayRequest = (req: MoneyRequest) => {
    openPinModal({
      title: req.requesterName,
      amount: req.amount,
      subTitle: req.note || translateText('Requested Payment', language),
      onSuccess: async () => {
        const txn = await completePayment({
          title: req.requesterName,
          subTitle: translateText('Request Approved Payment', language),
          amount: req.amount,
          avatarInitials: req.requesterName.substring(0, 2).toUpperCase(),
        });
        declineMoneyRequest(req.id);
        navigateTo('PAYMENT_SUCCESS', { transaction: txn });
      },
    });
  };

  const handleDecline = (id: string, name: string) => {
    declineMoneyRequest(id);
    showToast(isAr ? `?? ??? ??? ${name}` : `Declined request from ${name}`);
  };

  const handleDispatchSplit = (billData: {
    totalBill: number;
    description: string;
    selectedContactIds: string[];
    perPersonAmount: number;
  }) => {
    billData.selectedContactIds.forEach((contactId) => {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        addMoneyRequest({
          requesterName: contact.name,
          upiId: contact.upiId,
          amount: billData.perPersonAmount,
          note: `${billData.description} (Split)`,
          date: 'Just now',
          status: 'pending',
        });
      }
    });

    showToast(isAr ? '?? ????? ????? ?????? ?????' : 'Sarie Split RTP requests sent successfully');
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100vh', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader title={translateText('Money Requests', language)} showBack showSettings={false} />

      <div style={{ padding: '20px' }}>
        {toastMsg && (
          <div
            style={{
              backgroundColor: 'var(--brand-green, #7FE87F)',
              color: 'var(--brand-green-ink, #080C14)',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{toastMsg}</span>
          </div>
        )}

        <RequestBillSplitBanner
          onOpenSplitModal={() => setIsSplitModalOpen(true)}
          isAr={isAr}
        />

        {moneyRequests.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              backgroundColor: 'var(--color-surface, #111726)',
              borderRadius: '16px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              padding: '48px 24px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <ArrowDownLeft size={28} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{translateText('No Pending Requests', language)}</div>
            <p style={{ fontSize: '13px', color: '#A2A2BA', marginTop: '6px', margin: '6px 0 0 0' }}>
              {isAr
                ? '????? ???? ??? ??? ?? ??????? ??? ???? ????? ????? ???.'
                : 'When someone requests money from you via Sarie, it will appear here.'}
            </p>
          </div>
        ) : (
          moneyRequests.map((req) => (
            <MoneyRequestCard
              key={req.id}
              request={req}
              onPay={handlePayRequest}
              onDecline={handleDecline}
              language={language}
              isAr={isAr}
              t={t}
            />
          ))
        )}
      </div>

      <SplitExpenseModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        contacts={contacts}
        onDispatchSplit={handleDispatchSplit}
        isAr={isAr}
      />
    </div>
  );
};
export default MoneyRequestsScreen;
