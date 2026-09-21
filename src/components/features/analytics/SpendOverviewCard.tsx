import React from 'react';
import { Download, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { PeriodSummary } from './types';

interface SpendOverviewCardProps {
  data: PeriodSummary;
  isExporting: boolean;
  onExport: () => void;
  language: string;
}

export const SpendOverviewCard: React.FC<SpendOverviewCardProps> = ({
  data,
  isExporting,
  onExport,
  language,
}) => {
  const isAr = language === 'العربية';
  const remainingBudget = Math.max(0, data.budgetLimit - data.totalSpent);
  const budgetProgress = Math.min(100, Math.round((data.totalSpent / data.budgetLimit) * 100));

  return (
    <div
      className="card"
      style={{
        backgroundColor: '#0f1623',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>
            {isAr ? 'إجمالي المصروفات' : 'Total Spending'}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {isAr ? data.periodNameAr : data.periodNameEn}
          </div>
        </div>
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="btn-action interactive-tap"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid #1e293b',
            color: '#f8fafc',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <Download size={14} />
          <span>{isExporting ? (isAr ? 'جاري...' : 'Exporting...') : (isAr ? 'تصدير' : 'Export')}</span>
        </button>
      </div>

      <div className="amount-main tabular-nums" style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px', color: '#f8fafc' }}>
        {formatCurrency(data.totalSpent, language)}
      </div>

      <div className="badge-row" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div
          className="tag tag-green"
          style={{
            fontSize: '12px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
          }}
        >
          <TrendingDown size={12} strokeWidth={2.5} />
          <span>{Math.abs(data.deltaPercent)}% {isAr ? 'أقل من السابق' : 'vs last period'}</span>
        </div>
        <div
          className="tag tag-dark"
          style={{
            fontSize: '12px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#64748b',
          }}
        >
          <span>{isAr ? 'المعدل اليومي:' : 'Daily Avg:'}</span>
          <strong style={{ color: '#f8fafc', marginInlineStart: '3px' }}>
            {formatCurrency(data.dailyAverage, language)}
          </strong>
        </div>
      </div>

      <div className="progress-details" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
        <span>
          {isAr
            ? `${formatCurrency(remainingBudget, language)} متبقي من الميزانية`
            : `${formatCurrency(remainingBudget, language)} remaining`}
        </span>
        <strong style={{ color: '#f8fafc' }}>{budgetProgress}%</strong>
      </div>
      <div className="progress-bar-bg" style={{ background: 'rgba(255, 255, 255, 0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          className="progress-bar-fill"
          style={{
            background: 'linear-gradient(90deg, #10b981, #7FE87F)',
            height: '100%',
            width: `${budgetProgress}%`,
            borderRadius: '3px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};
