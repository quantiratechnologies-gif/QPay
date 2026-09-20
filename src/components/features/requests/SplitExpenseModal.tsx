import React, { useState } from 'react';
import { X, Receipt, CheckCircle2 } from 'lucide-react';
import type { Contact } from '../../../types';

interface SplitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onDispatchSplit: (billData: {
    totalBill: number;
    description: string;
    selectedContactIds: string[];
    perPersonAmount: number;
  }) => void;
  isAr: boolean;
}

export const SplitExpenseModal: React.FC<SplitExpenseModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onDispatchSplit,
  isAr,
}) => {
  const [totalBill, setTotalBill] = useState('300');
  const [billDescription, setBillDescription] = useState('Dinner split');
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['c1', 'c2']);
  const [splitSuccess, setSplitSuccess] = useState(false);

  if (!isOpen) return null;

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

  const handleDispatch = () => {
    if (parsedBill <= 0) return;
    onDispatchSplit({
      totalBill: parsedBill,
      description: billDescription,
      selectedContactIds: selectedContacts,
      perPersonAmount: parseFloat(perPersonAmount),
    });
    setSplitSuccess(true);
    setTimeout(() => {
      setSplitSuccess(false);
      onClose();
    }, 1200);
  };

  return (
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
      onClick={onClose}
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
              {isAr ? '????? ???????? (???? RTP)' : 'Split Expense (Sarie RTP)'}
            </h3>
          </div>
          <button
            onClick={onClose}
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
            {isAr ? '?????? ???? ???????? (?.?)' : 'Total Bill Amount (SAR)'}
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
            {isAr ? '????? ?? ????????' : 'Note / For What?'}
          </label>
          <input
            type="text"
            value={billDescription}
            onChange={(e) => setBillDescription(e.target.value)}
            placeholder={isAr ? '????? ????? ????? ?????...' : 'Dinner, coffee, groceries...'}
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
            {isAr ? '???????? ????????? (????? ???)' : 'Participants (including you)'}
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
                {isAr ? '??? (??????)' : 'You (Organizer)'}
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
                      <span style={{ fontSize: '12px', color: '#8E9BAE' }}>{isAr ? '??? ?????' : 'Excluded'}</span>
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
              {isAr ? `???? ?? ??? (${participantCount} ?????)` : `Each person pays (${participantCount} people)`}
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
              SAR {perPersonAmount}
            </span>
          </div>
          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <span style={{ fontSize: '11px', color: '#8E9BAE', display: 'block' }}>
              {isAr ? '??????? ??????' : 'Total to collect'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              SAR {(parseFloat(perPersonAmount) * selectedContacts.length).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleDispatch}
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
              <span>{isAr ? '?? ????? ???????!' : 'Requests Dispatched!'}</span>
            </>
          ) : (
            <span>
              {isAr
                ? `????? ????? ????? (${selectedContacts.length} ??????)`
                : `Send Sarie RTP (${selectedContacts.length} friends)`}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
