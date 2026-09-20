import React, { useState } from 'react';
import { Copy, Check, Landmark, RefreshCw } from 'lucide-react';
import { translateText } from '../../../utils/i18n';
import type { BankAccount } from '../../../types';

interface SarieAliasCardProps {
  upiId: string;
  primaryBank?: BankAccount;
  language: string;
  t: (key: string, fallback?: string) => string;
  onOpenBankSwitch: () => void;
}

export const SarieAliasCard: React.FC<SarieAliasCardProps> = ({
  upiId,
  primaryBank,
  language,
  t,
  onOpenBankSwitch,
}) => {
  const isAr = language === 'العربية' || language === 'ar';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: '#111726',
        border: '1px solid rgba(127, 232, 127, 0.35)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        color: '#FFFFFF',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            fontSize: '11.5px',
            color: '#7FE87F',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 800,
          }}
        >
          {isAr ? 'معرّف الدفع (Alias)' : 'Payment Alias'}
        </div>
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#7FE87F',
            backgroundColor: 'rgba(127, 232, 127, 0.14)',
            padding: '3px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(127, 232, 127, 0.22)',
          }}
        >
          {isAr ? 'موثق عبر سريع' : 'Sarie Verified'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <span
          style={{
            fontSize: '17px',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '0.01em',
            direction: 'ltr',
          }}
        >
          {upiId}
        </span>
        <button
          onClick={handleCopy}
          className="interactive-tap"
          style={{
            backgroundColor: '#7FE87F',
            border: 'none',
            color: '#080c14',
            padding: '7px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 12px rgba(127, 232, 127, 0.22)',
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}{' '}
          {copied ? translateText('Copied', language) : t('copy')}
        </button>
      </div>

      {/* Mapped Bank Portability Sub-bar */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Landmark size={15} color="#7FE87F" />
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {isAr ? 'مرتبط حالياً بـ:' : 'Mapped to:'}{' '}
            <strong style={{ color: '#FFFFFF' }}>{primaryBank?.bankName || 'Al Rajhi Bank'}</strong>
          </div>
        </div>
        <button
          onClick={onOpenBankSwitch}
          className="interactive-tap"
          style={{
            background: 'none',
            border: 'none',
            color: '#7FE87F',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <RefreshCw size={12} /> {isAr ? 'تبديل الحساب' : 'Switch Bank'}
        </button>
      </div>
    </div>
  );
};
