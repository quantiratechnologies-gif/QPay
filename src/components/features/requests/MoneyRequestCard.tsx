import React from 'react';
import { Check, X } from 'lucide-react';
import { PrimaryButton } from '../../PrimaryButton';
import { formatSaudiCurrency, translateText } from '../../../utils/i18n';
import type { MoneyRequest } from '../../../types';

interface MoneyRequestCardProps {
  request: MoneyRequest;
  onPay: (req: MoneyRequest) => void;
  onDecline: (id: string, name: string) => void;
  language: string;
  isAr: boolean;
  t: (key: string, fallback: string) => string;
}

export const MoneyRequestCard: React.FC<MoneyRequestCardProps> = ({
  request,
  onPay,
  onDecline,
  language,
  isAr,
  t,
}) => {
  return (
    <div
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
            {request.requesterName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>
                {request.requesterName}
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
                {request.upiId.includes('merchant') || request.upiId.includes('store')
                  ? (isAr ? '??? ????' : 'Merchant RTP')
                  : (isAr ? '??? ????' : 'Direct RTP')}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{request.upiId}</span>
              <span>•</span>
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                {isAr ? '????? ???? ?? ?' : 'Expires in 15m'}
              </span>
            </div>
          </div>
        </div>

        <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
          {formatSaudiCurrency(request.amount, language)}
        </div>
      </div>

      {request.note && (
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
          "{request.note}"
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          onClick={() => onDecline(request.id, request.requesterName)}
          className="interactive-tap"
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
            transition: 'all 0.15s ease',
          }}
        >
          <X size={16} /> {translateText('Decline', language)}
        </button>
        <div style={{ flex: 1.4 }}>
          <PrimaryButton onClick={() => onPay(request)}>
            <Check size={16} /> {t('nav.pay', 'Pay')} {formatSaudiCurrency(request.amount, language)}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
