import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { formatSaudiCurrency, translateText } from '../utils/i18n';
import type { Contact } from '../types';

export interface RequestMoneyScreenProps {
  initialContacts?: Contact[];
}

export const RequestMoneyScreen: React.FC<RequestMoneyScreenProps> = ({ initialContacts }) => {
  const { contacts: appContextContacts, addMoneyRequest, language, t } = useApp();
  const contacts = initialContacts && initialContacts.length > 0 ? initialContacts : appContextContacts;
  const isAr = language === 'العربية' || language === 'ar';
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0] || {
    id: 'c1',
    name: 'Sara Al-Mansoor',
    upiId: 'sara@sarie',
    avatarInitials: 'SM',
    mobile: '+966 55 876 5432',
  });
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSendRequest = () => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    addMoneyRequest({
      name: selectedContact.name,
      upiId: selectedContact.upiId,
      amount,
      note: note || undefined,
    });

    setIsSuccess(true);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader title={t('home.request_money', 'Request Money')} showBack />

      <div style={{ padding: '20px' }}>
        {isSuccess ? (
          <div className="fade-in" style={{ textAlign: 'center', backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))', borderRadius: '20px', padding: '40px 20px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Check size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px', color: '#FFFFFF' }}>
              {translateText('Request Sent Successfully!', language)}
            </h3>
            <p style={{ color: '#A2A2BA', fontSize: '13px', margin: 0 }}>
              {isAr ? (
                <>تم إرسال طلب بمبلغ {formatSaudiCurrency(parseFloat(amountStr) || 0, language)} إلى <strong style={{ color: '#FFFFFF' }}>{selectedContact.name}</strong></>
              ) : (
                <>Requested SAR {amountStr} from <strong style={{ color: '#FFFFFF' }}>{selectedContact.name}</strong></>
              )}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Selected Contact Card */}
            <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))', borderRadius: '16px', padding: '16px' }}>
              <label
                style={{
                  fontSize: '11px',
                  color: '#A2A2BA',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'block',
                }}
              >
                {translateText('Request From', language)}
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-surface-elevated, #182236)',
                    color: 'var(--brand-green, #7FE87F)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '16px',
                  }}
                >
                  {selectedContact.avatarInitials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>{selectedContact.name}</div>
                  <div style={{ fontSize: '12px', color: '#A2A2BA' }}>{selectedContact.upiId}</div>
                </div>
              </div>

              <select
                value={selectedContact.id}
                onChange={(e) => {
                  const c = contacts.find((item) => item.id === e.target.value);
                  if (c) setSelectedContact(c);
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id} style={{ backgroundColor: '#182236', color: '#FFFFFF' }}>
                    {c.name} ({c.upiId})
                  </option>
                ))}
              </select>
            </div>

            {/* Enter Amount Card */}
            <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))', borderRadius: '16px', padding: '20px' }}>
              <label
                style={{
                  fontSize: '11px',
                  color: '#A2A2BA',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  display: 'block',
                }}
              >
                {translateText('Enter Request Amount', language)}
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  marginBottom: '14px',
                }}
              >
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', marginInlineEnd: '8px' }}>
                  {isAr ? 'ر.س' : 'SAR'}
                </span>
                <input
                  type="number"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '28px',
                    fontWeight: 900,
                    outline: 'none',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>

              {/* Quick Amount Chips with Toggle Select & Deselect */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {[50, 100, 500, 1000].map((quickAmt) => {
                  const valStr = quickAmt.toString();
                  const isSelected = amountStr === valStr;
                  return (
                    <button
                      key={quickAmt}
                      type="button"
                      className="interactive-tap"
                      onClick={() => {
                        if (amountStr === valStr) {
                          setAmountStr('');
                        } else {
                          setAmountStr(valStr);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.2))' : 'var(--color-surface-elevated, #182236)',
                        border: isSelected ? '2px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                        color: isSelected ? 'var(--brand-green, #7FE87F)' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {formatSaudiCurrency(quickAmt, language)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Card */}
            <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))', borderRadius: '16px', padding: '16px' }}>
              <label
                style={{
                  fontSize: '11px',
                  color: '#A2A2BA',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                {translateText('Payment Note (Optional)', language)}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={translateText('What is this request for? (e.g. Dinner, Rent)', language)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <PrimaryButton onClick={handleSendRequest} disabled={!amountStr || parseFloat(amountStr) <= 0}>
              {translateText('Send Payment Request', language)}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

