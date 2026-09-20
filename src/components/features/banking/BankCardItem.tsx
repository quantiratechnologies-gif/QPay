import React from 'react';
import { Landmark, Eye, EyeOff, CheckCircle2, Star, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { BankAccount } from '../../../types';

interface BankCardItemProps {
  bank: BankAccount;
  onBalanceCheck: (bank: BankAccount) => void;
  onSetPrimary: (id: string) => void;
  onSetPin: (id: string) => void;
  onRemove: (id: string) => void;
  isAr: boolean;
  language: string;
  t: (key: string, fallback: string) => string;
}

export const BankCardItem: React.FC<BankCardItemProps> = ({
  bank,
  onBalanceCheck,
  onSetPrimary,
  onSetPin,
  onRemove,
  isAr,
  language,
  t,
}) => {
  const rawNumbers = bank.accountNumberMasked.replace(/[^0-9]/g, '') || '034821';
  const lastDigits = rawNumbers.slice(-6);
  const displayBankName = t(bank.bankName, bank.bankName);
  const displayAccType = t(bank.accountType, bank.accountType);

  return (
    <article
      style={{
        background: bank.isPrimary
          ? 'linear-gradient(135deg, rgba(20, 64, 42, 0.75) 0%, rgba(11, 20, 32, 0.96) 100%)'
          : 'linear-gradient(135deg, rgba(14, 38, 26, 0.5) 0%, rgba(10, 15, 24, 0.92) 100%)',
        border: bank.isPrimary
          ? '1px solid rgba(127, 232, 127, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '22px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.35)',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              background: 'rgba(127, 232, 127, 0.12)',
              border: '1px solid rgba(127, 232, 127, 0.25)',
              color: '#7FE87F',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Landmark size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#F3F6F9', letterSpacing: '-0.1px', margin: 0 }}>
              {displayBankName}
            </h3>
            <div style={{ fontSize: '10px', color: '#8A9BB0', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1px' }}>
              {displayAccType}
            </div>
          </div>
        </div>

        {bank.isPrimary && (
          <span
            style={{
              background: 'rgba(127, 232, 127, 0.12)',
              color: '#7FE87F',
              fontSize: '9.5px',
              fontWeight: 800,
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(127, 232, 127, 0.25)',
              letterSpacing: '0.5px',
            }}
          >
            {t('banks.primary', 'PRIMARY')}
          </span>
        )}
      </div>

      {/* Account Digits */}
      <div style={{ fontSize: '13px', letterSpacing: '2px', color: '#8A9BB0', fontWeight: 500, direction: 'ltr' }}>
        <span>•••• &nbsp; •••• &nbsp; •••• &nbsp; </span>
        <strong style={{ color: '#F3F6F9', fontWeight: 700 }}>{lastDigits}</strong>
      </div>

      {/* Balance Section */}
      <div
        style={{
          background: 'rgba(4, 8, 14, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '9px',
              color: '#52637A',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '3px',
              display: 'block',
            }}
          >
            {t('home.total_balance', 'TOTAL AVAILABLE BALANCE')}
          </span>
          <div
            className="tabular-nums"
            style={{
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#7FE87F',
              letterSpacing: '0.3px',
            }}
          >
            {bank.showBalance ? formatCurrency(bank.balance, language) : (isAr ? '•••••••• ?.?' : 'SAR ••••••••')}
          </div>
        </div>

        <button
          onClick={() => onBalanceCheck(bank)}
          className="interactive-tap"
          style={{
            background: 'rgba(127, 232, 127, 0.08)',
            border: '1px solid rgba(127, 232, 127, 0.2)',
            color: '#7FE87F',
            fontSize: '11px',
            fontWeight: 700,
            padding: '7px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'background 0.2s',
          }}
        >
          {bank.showBalance ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{bank.showBalance ? t('home.hide', 'Hide') : t('banks.check_balance', 'Check')}</span>
        </button>
      </div>

      {/* Card Footer Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
        {bank.isPrimary ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#7FE87F', fontWeight: 600 }}>
              <CheckCircle2 size={14} color="#7FE87F" />
              <span>{isAr ? '?????? ????????? ????????' : 'Default for receiving money'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onSetPin(bank.id)}
                className="interactive-tap"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#F3F6F9',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span>{isAr ? '????? ?????' : 'Set PIN'}</span>
              </button>
              <button
                onClick={() => onRemove(bank.id)}
                className="interactive-tap"
                style={{
                  background: 'rgba(255, 75, 75, 0.06)',
                  border: '1px solid rgba(255, 75, 75, 0.18)',
                  color: '#FF5C5C',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={12} />
                <span>{isAr ? '???' : 'Remove'}</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              onClick={() => onSetPrimary(bank.id)}
              className="interactive-tap"
              style={{
                background: 'rgba(127, 232, 127, 0.12)',
                border: '1px solid rgba(127, 232, 127, 0.25)',
                color: '#7FE87F',
                flex: 1.5,
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
              }}
            >
              <Star size={13} color="#7FE87F" />
              <span>{isAr ? '????? ??????' : 'Set Primary'}</span>
            </button>
            <button
              onClick={() => onSetPin(bank.id)}
              className="interactive-tap"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#F3F6F9',
                flex: 1,
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span>{isAr ? '????? ?????' : 'Set PIN'}</span>
            </button>
            <button
              onClick={() => onRemove(bank.id)}
              className="interactive-tap"
              style={{
                background: 'rgba(255, 75, 75, 0.06)',
                border: '1px solid rgba(255, 75, 75, 0.18)',
                color: '#FF5C5C',
                flex: 1,
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Trash2 size={12} />
              <span>{isAr ? '???' : 'Remove'}</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
