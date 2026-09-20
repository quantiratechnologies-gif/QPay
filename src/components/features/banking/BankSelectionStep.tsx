import React from 'react';
import { Landmark, Smartphone, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { SAUDI_BANKS } from './saudiBanksData';
import { cleanSaudiIban, formatSaudiIban, formatSaudiMobile } from '../../../utils/formatters';
import type { MatchMethod } from './types';

interface BankSelectionStepProps {
  selectedBank: string;
  onSelectBank: (bank: string) => void;
  matchMethod: MatchMethod;
  onSelectMatchMethod: (method: MatchMethod) => void;
  userMobile: string;
  cardNumber: string;
  onCardNumberChange: (val: string) => void;
  cardExpiry: string;
  onCardExpiryChange: (val: string) => void;
  cardCvv: string;
  onCardCvvChange: (val: string) => void;
  customIban: string;
  onCustomIbanChange: (val: string) => void;
  errorMessage: string;
  isLoading: boolean;
  onRequestOtp: () => void;
  isAr: boolean;
  isRtl: boolean;
  t: (key: string, fallback: string) => string;
}

export const BankSelectionStep: React.FC<BankSelectionStepProps> = ({
  selectedBank,
  onSelectBank,
  matchMethod,
  onSelectMatchMethod,
  userMobile,
  cardNumber,
  onCardNumberChange,
  cardExpiry,
  onCardExpiryChange,
  cardCvv,
  onCardCvvChange,
  customIban,
  onCustomIbanChange,
  errorMessage,
  isLoading,
  onRequestOtp,
  isAr,
  isRtl,
  t,
}) => {
  return (
    <div id="selectionView" className="fade-in">
      <div
        style={{
          fontSize: '11.5px',
          fontWeight: 700,
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '10px',
          display: 'block',
        }}
      >
        {isAr ? '?????? ???????' : 'Available Banks'}
      </div>

      <div
        className="bank-list"
        role="radiogroup"
        aria-label="Available Banks"
        style={{
          maxHeight: '240px',
          overflowY: 'auto',
          paddingInlineEnd: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '18px',
        }}
      >
        {SAUDI_BANKS.map((bank) => {
          const isSelected = selectedBank === bank.name;
          const displayBankName = t(bank.name, bank.name);
          return (
            <div
              key={bank.name}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectBank(bank.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectBank(bank.name);
              }}
              className={`bank-item interactive-tap ${isSelected ? 'selected' : ''}`}
              style={{
                backgroundColor: isSelected ? 'var(--brand-green-tint)' : 'var(--color-surface-elevated)',
                border: isSelected ? '1.5px solid var(--brand-green)' : '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div className="bank-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  className="bank-icon"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--brand-green-tint)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Landmark size={20} color="var(--brand-green)" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{displayBankName}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginTop: '2px' }}>
                    {isAr ? '??? ????? ?????' : 'Online Banking • Fast Connect'}
                  </div>
                </div>
              </div>
              <div className="radio-dot" />
            </div>
          );
        })}
      </div>

      {/* Account Match Method */}
      <div className="match-section" style={{ marginBottom: '18px' }}>
        <div
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '10px',
          }}
        >
          {isAr ? '????? ?????' : 'Link With'}
        </div>
        <div className="match-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div
            className={`match-tab interactive-tap ${matchMethod === 'mobile' ? 'active' : ''}`}
            onClick={() => onSelectMatchMethod('mobile')}
            style={{
              backgroundColor: matchMethod === 'mobile' ? 'var(--brand-green-tint)' : 'var(--color-surface-elevated)',
              border: matchMethod === 'mobile' ? '1px solid var(--brand-green)' : '1px solid var(--color-border)',
              color: matchMethod === 'mobile' ? 'var(--brand-green)' : '#9ca3af',
              borderRadius: '14px',
              padding: '10px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Smartphone size={14} color={matchMethod === 'mobile' ? 'var(--brand-green)' : '#9ca3af'} />
            <span>{isAr ? '??????' : 'Mobile'}</span>
          </div>
          <div
            className={`match-tab interactive-tap ${matchMethod === 'iban' ? 'active' : ''}`}
            onClick={() => onSelectMatchMethod('iban')}
            style={{
              backgroundColor: matchMethod === 'iban' ? 'var(--brand-green-tint)' : 'var(--color-surface-elevated)',
              border: matchMethod === 'iban' ? '1px solid var(--brand-green)' : '1px solid var(--color-border)',
              color: matchMethod === 'iban' ? 'var(--brand-green)' : '#9ca3af',
              borderRadius: '14px',
              padding: '10px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <CreditCard size={14} color={matchMethod === 'iban' ? 'var(--brand-green)' : '#9ca3af'} />
            <span>{isAr ? '???????' : 'IBAN'}</span>
          </div>
          <div
            className={`match-tab interactive-tap ${matchMethod === 'card' ? 'active' : ''}`}
            onClick={() => onSelectMatchMethod('card')}
            style={{
              backgroundColor: matchMethod === 'card' ? 'var(--brand-green-tint)' : 'var(--color-surface-elevated)',
              border: matchMethod === 'card' ? '1px solid var(--brand-green)' : '1px solid var(--color-border)',
              color: matchMethod === 'card' ? 'var(--brand-green)' : '#9ca3af',
              borderRadius: '14px',
              padding: '10px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <CreditCard size={14} color={matchMethod === 'card' ? 'var(--brand-green)' : '#9ca3af'} />
            <span>{isAr ? '????? ???' : 'mada Card'}</span>
          </div>
        </div>

        {matchMethod === 'card' && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }} className="fade-in">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                onCardNumberChange(v.replace(/(\d{4})(?=\d)/g, '$1 '));
              }}
              placeholder={isAr ? '??? ????? ??? (?? ?????)' : 'mada Card Number (16 digits)'}
              maxLength={19}
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              dir="ltr"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                value={cardExpiry}
                onChange={(e) => onCardExpiryChange(e.target.value.slice(0, 5))}
                placeholder="MM/YY"
                maxLength={5}
                style={{
                  padding: '13px 16px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                  outline: 'none',
                  textAlign: 'center',
                }}
                dir="ltr"
              />
              <input
                type="password"
                value={cardCvv}
                onChange={(e) => onCardCvvChange(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="CVV"
                maxLength={3}
                style={{
                  padding: '13px 16px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                  outline: 'none',
                  textAlign: 'center',
                }}
                dir="ltr"
              />
            </div>
          </div>
        )}

        {matchMethod === 'iban' && (
          <div style={{ marginTop: '12px' }} className="fade-in">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={customIban}
                onChange={(e) => onCustomIbanChange(formatSaudiIban(e.target.value))}
                placeholder="SA03 8000 0000 6080 1012 3456"
                maxLength={29}
                style={{
                  width: '100%',
                  padding: '13px 60px 13px 16px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: cleanSaudiIban(customIban).length === 24 ? '1.5px solid #7FE87F' : '1px solid var(--color-border)',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                  outline: 'none',
                  letterSpacing: '0.04em',
                }}
                dir="ltr"
              />
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: cleanSaudiIban(customIban).length === 24 ? '#7FE87F' : '#6B7280',
                  fontFamily: 'monospace',
                }}
              >
                {cleanSaudiIban(customIban).length}/24
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', marginInlineStart: '4px' }}>
              {isAr ? '???? ?? SA ??????? ?? 22 ????' : 'Starts with SA followed by 22 digits/letters'}
            </div>
          </div>
        )}

        {matchMethod === 'mobile' && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px 14px',
              backgroundColor: 'rgba(127, 232, 127, 0.08)',
              border: '1px solid rgba(127, 232, 127, 0.25)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            className="fade-in"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={18} color="#7FE87F" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em' }} dir="ltr">
                  {formatSaudiMobile(userMobile) || '+966 50 123 4567'}
                </div>
                <div style={{ fontSize: '10.5px', color: '#7FE87F', fontWeight: 600 }}>
                  {isAr ? '??? ?????? ?????? ????????' : 'Registered & Verified Mobile'}
                </div>
              </div>
            </div>
            <CheckCircle2 size={18} color="#7FE87F" />
          </div>
        )}
      </div>

      {errorMessage && (
        <div style={{ fontSize: '12px', color: '#FF4757', fontWeight: 700, marginBottom: '14px' }}>
          {errorMessage}
        </div>
      )}

      <button
        className="action-btn interactive-tap"
        onClick={onRequestOtp}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: '#7FE87F',
          color: '#0b0f19',
          border: 'none',
          borderRadius: '16px',
          fontSize: '14.5px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 10px 25px -5px rgba(127, 232, 127, 0.3)',
        }}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <span>{isAr ? '??? ?????? ??????' : 'Link Bank Account'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
};
