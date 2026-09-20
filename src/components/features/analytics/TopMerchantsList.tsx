import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import type { MerchantData } from './types';

interface TopMerchantsListProps {
  merchants: MerchantData[];
  language: string;
  isRtl: boolean;
}

export const TopMerchantsList: React.FC<TopMerchantsListProps> = ({
  merchants,
  language,
  isRtl,
}) => {
  const isAr = language === 'العربية';

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          {isAr ? 'أعلى المتاجر إنفاقاً' : 'Top Merchants'}
        </span>
      </div>

      <div
        className="card"
        style={{
          backgroundColor: '#0f1623',
          borderRadius: '20px',
          border: '1px solid #1e293b',
          overflow: 'hidden',
          padding: '6px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        }}
      >
        {merchants.map((m, idx) => (
          <div
            key={m.name}
            className="interactive-tap"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '14px',
              borderBottom: idx < merchants.length - 1 ? '1px solid #1e293b' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '11px',
                  backgroundColor: m.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.iconColor,
                  flexShrink: 0,
                }}
              >
                {m.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {isAr ? m.categoryAr : m.category} • {m.txnCount} {isAr ? 'عمليات' : 'txns'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: isRtl ? 'left' : 'right', marginInlineStart: '12px' }}>
              <div className="tabular-nums" style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc' }}>
                {formatCurrency(m.amount, language)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
