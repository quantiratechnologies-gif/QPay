import React from 'react';
import { Users, Check } from 'lucide-react';
import { PrimaryButton } from '../../PrimaryButton';
import { formatSaudiCurrency } from '../../../utils/i18n';
import type { Contact } from '../../../types';

interface CreateSplitFormProps {
  title: string;
  onTitleChange: (val: string) => void;
  totalAmountStr: string;
  onTotalAmountChange: (val: string) => void;
  contacts: Contact[];
  selectedContactIds: string[];
  onToggleContact: (id: string) => void;
  splitPerPerson: number;
  isCreatedSuccess: boolean;
  onSubmit: () => void;
  language: string;
  isAr: boolean;
  isRtl: boolean;
}

export const CreateSplitForm: React.FC<CreateSplitFormProps> = ({
  title,
  onTitleChange,
  totalAmountStr,
  onTotalAmountChange,
  contacts,
  selectedContactIds,
  onToggleContact,
  splitPerPerson,
  isCreatedSuccess,
  onSubmit,
  language,
  isAr,
  isRtl,
}) => {
  const numTotal = parseFloat(totalAmountStr) || 0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Expense Title & Total Amount */}
      <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))', borderRadius: '16px', padding: '20px' }}>
        <label style={{ fontSize: '11px', color: '#A2A2BA', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
          {isAr ? '????? ???????' : 'Expense Title'} <span style={{ color: '#FF4757' }}>*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={isAr ? '????: ???? ?? ????? ????? ???????? ????...' : 'e.g. Dinner, Chalet Rent, Groceries'}
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
            marginBottom: '16px',
          }}
        />

        <label style={{ fontSize: '11px', color: '#A2A2BA', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
          {isAr ? '?????? ??????' : 'Total Amount (SAR)'}
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
            borderRadius: '14px',
            padding: '12px 16px',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', marginInlineEnd: '8px' }}>
            {isAr ? '?.?' : 'SAR'}
          </span>
          <input
            type="number"
            value={totalAmountStr}
            onChange={(e) => onTotalAmountChange(e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '26px',
              fontWeight: 900,
              outline: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        </div>
      </div>

      {/* Select Participants */}
      <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              {isAr ? '????? ???????? ???????' : 'Select Friends to Split With'}
            </div>
            <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px' }}>
              {isAr ? `??????: ${selectedContactIds.length} ?????? + ???` : `Selected: ${selectedContactIds.length} friends + You`}
            </div>
          </div>
          {numTotal > 0 && selectedContactIds.length > 0 && (
            <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
              <div style={{ fontSize: '11px', color: '#A2A2BA', fontWeight: 700 }}>{isAr ? '???? ?????' : 'Per Person'}</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                {formatSaudiCurrency(splitPerPerson, language)}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {contacts.map((c) => {
            const isSelected = selectedContactIds.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => onToggleContact(c.id)}
                className="interactive-tap"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))' : 'var(--color-surface-elevated, #182236)',
                  border: isSelected ? '1px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'var(--brand-green, #7FE87F)' : '#2A2F45',
                      color: isSelected ? '#080C14' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '14px',
                    }}
                  >
                    {c.avatarInitials}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{c.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#A2A2BA' }}>{c.upiId}</div>
                  </div>
                </div>

                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'var(--brand-green, #7FE87F)' : 'transparent',
                    border: isSelected ? 'none' : '2px solid #5A6075',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#080C14',
                  }}
                >
                  {isSelected && <Check size={16} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Action */}
      <PrimaryButton
        onClick={onSubmit}
        disabled={!title.trim() || numTotal <= 0 || selectedContactIds.length === 0}
      >
        <Users size={18} />{' '}
        {isCreatedSuccess
          ? (isAr ? '? ?? ????? ??????? ?????' : '? Split Created Successfully')
          : (isAr
              ? `????? ????? ??????? (${formatSaudiCurrency(splitPerPerson, language)} ??? ???)`
              : `Send Split Requests (${formatSaudiCurrency(splitPerPerson, language)} / each)`)}
      </PrimaryButton>
    </div>
  );
};
