import React, { useState } from 'react';
import { Check, X, ArrowDownLeft, Users, Plus, Receipt, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { formatSaudiCurrency, translateText } from '../utils/i18n';

export const MoneyRequestsScreen: React.FC = () => {
  const { moneyRequests, openPinModal, completePayment, declineMoneyRequest, addMoneyRequest, contacts, navigateTo, language, t } = useApp();
  const isAr = language === 'العربية' || language === 'ar';

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [totalBill, setTotalBill] = useState('300');
  const [billDescription, setBillDescription] = useState('Dinner split');
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['c1', 'c2']);
  const [customParticipant, setCustomParticipant] = useState('');
  const [splitSuccess, setSplitSuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePayRequest = (req: typeof moneyRequests[0]) => {
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
    showToast(isAr ? `تم رفض طلب ${name}` : `Declined request from ${name}`);
  };

  const parsedBill = parseFloat(totalBill) || 0;
  const participantCount = selectedContacts.length + 1; // including self
  const perPersonAmount = participantCount > 0 ? (parsedBill / participantCount).toFixed(2) : '0.00';

  const handleToggleContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      if (selectedContacts.length > 1) {
        setSelectedContacts(selectedContacts.filter((c) => c !== id));
      }
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleDispatchSplit = () => {
    if (parsedBill <= 0) return;

    selectedContacts.forEach((contactId) => {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        addMoneyRequest({
          requesterName: contact.name,
          upiId: contact.upiId,
          amount: parseFloat(perPersonAmount),
          note: `${billDescription} (Split)`,
          date: 'Just now',
          status: 'pending',
        });
      }
    });

    setSplitSuccess(true);
    setTimeout(() => {
      setSplitSuccess(false);
      setIsSplitModalOpen(false);
      showToast(isAr ? 'تم إرسال طلبات السريع بنجاح' : 'Sarie Split RTP requests sent successfully');
    }, 1500);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100vh', paddingBottom: '32px', color: '#FFFFFF' }}>
      <AppHeader title={translateText('Money Requests', language)} showBack showSettings={false} />

      <div style={{ padding: '20px' }}>
        {/* Toast Alert Notification */}
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

        {/* Split an Expense PhonePe Feature Banner */}
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
                {isAr ? 'تقسيم الفاتورة مع الأصدقاء' : 'Split Bill with Friends'}
              </div>
              <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '2px' }}>
                {isAr ? 'قسّم الفاتورة بالتساوي واطلب عبر سريع' : 'Divide expenses equally & request via Sarie'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsSplitModalOpen(true)}
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
            {isAr ? 'تقسيم فاتورة' : 'Split Bill'}
          </button>
        </div>

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
              {language === 'العربية'
                ? 'عندما يطلب منك شخص ما أموالاً عبر نظام سريع، ستظهر هنا.'
                : 'When someone requests money from you via Sarie, it will appear here.'}
            </p>
          </div>
        ) : (
          moneyRequests.map((req) => (
            <div
              key={req.id}
              style={{
                backgroundColor: 'var(--color-surface, #111726)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                      color: 'var(--brand-green, #7FE87F)',
                      fontWeight: 800,
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {req.requesterName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>
                        {req.requesterName}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          backgroundColor: 'rgba(127, 232, 127, 0.12)',
                          color: '#7FE87F',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {req.upiId.includes('merchant') || req.upiId.includes('store')
                          ? (language === 'العربية' ? 'طلب متجر' : 'Merchant RTP')
                          : (language === 'العربية' ? 'طلب فوري' : 'Direct RTP')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{req.upiId}</span>
                      <span>•</span>
                      <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                        {language === 'العربية' ? 'ينتهي خلال ١٥ د' : 'Expires in 15m'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                  {formatSaudiCurrency(req.amount, language)}
                </div>
              </div>

              {req.note && (
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-elevated, #182236)',
                    border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    color: '#A2A2BA',
                    marginBottom: '16px',
                    fontStyle: 'italic',
                  }}
                >
                  "{req.note}"
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="interactive-tap"
                  onClick={() => handleDecline(req.id, req.requesterName)}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-surface-elevated, #182236)',
                    border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                    color: '#EF4444',
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <X size={16} /> {translateText('Decline', language)}
                </button>
                <div style={{ flex: 1.4 }}>
                  <PrimaryButton onClick={() => handlePayRequest(req)}>
                    <Check size={16} /> {t('nav.pay', 'Pay')} {formatSaudiCurrency(req.amount, language)}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Split Expenses Modal */}
      {isSplitModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2600,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setIsSplitModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface, #111726)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px 20px',
              animation: 'slideUp 0.25s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Receipt size={22} color="var(--brand-green, #7FE87F)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {isAr ? 'تقسيم الفاتورة (سريع RTP)' : 'Split Expense (Sarie RTP)'}
                </h3>
              </div>
              <button
                onClick={() => setIsSplitModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8E9BAE',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Total Bill Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8E9BAE', marginBottom: '6px' }}>
                {isAr ? 'إجمالي مبلغ الفاتورة (ر.س)' : 'Total Bill Amount (SAR)'}
              </label>
              <input
                type="number"
                value={totalBill}
                onChange={(e) => setTotalBill(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
                  borderRadius: '12px',
                  color: 'var(--brand-green, #7FE87F)',
                  fontSize: '20px',
                  fontWeight: 900,
                  outline: 'none',
                }}
              />
            </div>

            {/* Note / Description */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8E9BAE', marginBottom: '6px' }}>
                {isAr ? 'الوصف أو المناسبة' : 'Note / For What?'}
              </label>
              <input
                type="text"
                value={billDescription}
                onChange={(e) => setBillDescription(e.target.value)}
                placeholder={isAr ? 'عشاء، قهوة، إيجار شاليه...' : 'Dinner, coffee, groceries...'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* Participants Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8E9BAE', marginBottom: '8px' }}>
                {isAr ? 'الأصدقاء المشاركون (يشملك أنت)' : 'Participants (including you)'}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(127, 232, 127, 0.08)',
                    border: '1px solid rgba(127, 232, 127, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                    {isAr ? 'أنت (الدافع)' : 'You (Organizer)'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)' }}>
                    SAR {perPersonAmount}
                  </span>
                </div>

                {contacts.slice(0, 4).map((c) => {
                  const isChecked = selectedContacts.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleToggleContact(c.id)}
                      className="interactive-tap"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: isChecked ? 'rgba(127, 232, 127, 0.12)' : 'var(--color-surface-elevated, #182236)',
                        border: isChecked ? '1px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: isChecked ? 'var(--brand-green, #7FE87F)' : '#232D42',
                            color: isChecked ? '#080C14' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '12px',
                          }}
                        >
                          {c.avatarInitials}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: '#8E9BAE' }}>{c.upiId}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                        {isChecked ? (
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)' }}>
                            SAR {perPersonAmount}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#8E9BAE' }}>{isAr ? 'غير مشمول' : 'Excluded'}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Split Summary Box */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: '#8E9BAE', display: 'block' }}>
                  {isAr ? `نصيب كل شخص (${participantCount} أشخاص)` : `Each person pays (${participantCount} people)`}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                  SAR {perPersonAmount}
                </span>
              </div>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <span style={{ fontSize: '11px', color: '#8E9BAE', display: 'block' }}>
                  {isAr ? 'المطلوب تحصيله' : 'Total to collect'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  SAR {(parseFloat(perPersonAmount) * selectedContacts.length).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleDispatchSplit}
              disabled={splitSuccess || parsedBill <= 0}
              className="interactive-tap"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-green, #7FE87F)',
                color: 'var(--brand-green-ink, #080C14)',
                fontWeight: 800,
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {splitSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>{isAr ? 'تم إرسال الطلبات!' : 'Requests Dispatched!'}</span>
                </>
              ) : (
                <span>
                  {isAr
                    ? `إرسال طلبات ساريع (${selectedContacts.length} أصدقاء)`
                    : `Send Sarie RTP (${selectedContacts.length} friends)`}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

