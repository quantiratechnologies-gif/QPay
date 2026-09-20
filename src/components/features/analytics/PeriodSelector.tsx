import React from 'react';
import type { PeriodType } from './types';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onSelectPeriod: (period: PeriodType) => void;
  isAr: boolean;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onSelectPeriod,
  isAr,
}) => {
  const periods: { id: PeriodType; labelEn: string; labelAr: string }[] = [
    { id: 'DAY', labelEn: 'Day', labelAr: 'يوم' },
    { id: 'WEEK', labelEn: 'Week', labelAr: 'أسبوع' },
    { id: 'MONTH', labelEn: 'Month', labelAr: 'شهر' },
    { id: 'YEAR', labelEn: 'Year', labelAr: 'سنة' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: '#0f1623',
        border: '1px solid #1e293b',
        borderRadius: '14px',
        padding: '3px',
        gap: '3px',
      }}
    >
      {periods.map((item) => {
        const isActive = selectedPeriod === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectPeriod(item.id)}
            className="interactive-tap"
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '11px',
              border: 'none',
              backgroundColor: isActive ? '#10b981' : 'transparent',
              color: isActive ? '#080C14' : '#64748b',
              fontSize: '12px',
              fontWeight: isActive ? 800 : 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            {isAr ? item.labelAr : item.labelEn}
          </button>
        );
      })}
    </div>
  );
};
