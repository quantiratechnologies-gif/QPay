import React from 'react';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { ChartDataPoint } from './types';

interface SpendBarChartProps {
  chartData: ChartDataPoint[];
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
  language: string;
}

export const SpendBarChart: React.FC<SpendBarChartProps> = ({
  chartData,
  hoveredIndex,
  onHoverIndex,
  language,
}) => {
  const isAr = language === 'العربية';
  const maxChartAmount = Math.max(...chartData.map((d) => d.amount), 1);

  return (
    <div
      className="card"
      style={{
        backgroundColor: '#0f1623',
        borderRadius: '20px',
        border: '1px solid #1e293b',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={16} color="#10b981" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
            {isAr ? 'المخطط الزمني للإنفاق' : 'Timeline Spending Trend'}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
          {isAr ? 'المبالغ بالريال' : 'SAR amounts'}
        </span>
      </div>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="fade-in"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '6px 12px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
            {chartData[hoveredIndex]?.label}
          </span>
          <span className="tabular-nums" style={{ fontSize: '12.5px', fontWeight: 800, color: '#10b981' }}>
            {formatCurrency(chartData[hoveredIndex]?.amount || 0, language)}
          </span>
        </div>
      )}

      {/* Bars Graphic */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: '130px',
          gap: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid #1e293b',
        }}
      >
        {chartData.map((bar, i) => {
          const heightPercent = Math.max(16, Math.round((bar.amount / maxChartAmount) * 100));
          const isMax = bar.amount === maxChartAmount;
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              onMouseEnter={() => onHoverIndex(i)}
              onMouseLeave={() => onHoverIndex(null)}
              onClick={() => onHoverIndex(hoveredIndex === i ? null : i)}
              className="interactive-tap"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <span
                className="tabular-nums"
                style={{
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: isHovered || isMax ? '#10b981' : '#64748b',
                  whiteSpace: 'nowrap',
                }}
              >
                {Math.round(bar.amount)}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${heightPercent}%`,
                  background: isHovered || isMax ? 'linear-gradient(180deg, #3b82f6 0%, #10b981 100%)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px 6px 3px 3px',
                  transition: 'all 0.25s ease',
                }}
              />
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: isHovered || isMax ? 800 : 500,
                  color: isHovered || isMax ? '#f8fafc' : '#64748b',
                }}
              >
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
