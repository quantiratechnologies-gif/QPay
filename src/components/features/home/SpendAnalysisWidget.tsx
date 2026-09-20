import React from 'react';
import { PieChart, TrendingDown, ChevronRight } from 'lucide-react';
import { useApp } from '../../../state/AppContext';

export const SpendAnalysisWidget: React.FC = () => {
  const { navigateTo, language, isRtl } = useApp();
  const isAr = language === 'العربية';

  return (
    <div style={{ padding: '0 20px', marginTop: '16px' }}>
      <div
        onClick={() => navigateTo('SPEND_ANALYSIS')}
        className="interactive-tap"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--brand-green-tint)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PieChart size={20} color="var(--brand-green)" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                {isAr ? 'مصاريف الشهر' : 'Monthly Spend'}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: 'var(--brand-green)',
                  backgroundColor: 'var(--brand-green-tint)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                <TrendingDown size={11} />
                12.4%
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px' }}>
              {isAr ? '١٤٬٨٥٠ ر.س في سبتمبر • عرض التحليل' : 'SAR 14,850.00 in September • View breakdown'}
            </div>
          </div>
        </div>

        <ChevronRight
          size={18}
          color="#A2A2BA"
          style={{ transform: isRtl ? 'scaleX(-1)' : 'none', marginInlineStart: '8px', flexShrink: 0 }}
        />
      </div>
    </div>
  );
};
