import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { CategoryData } from './types';

interface SpendDonutCardProps {
  categories: CategoryData[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  totalSpent: number;
  language: string;
}

export const SpendDonutCard: React.FC<SpendDonutCardProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalSpent,
  language,
}) => {
  const isAr = language === 'العربية';
  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Compute conic gradient dynamically with active category highlighting
  let currentPercent = 0;
  const activeCategories = categories.filter((cat) => cat.percentage > 0);
  const conicSegments = activeCategories
    .map((cat) => {
      const start = currentPercent;
      const end = currentPercent + cat.percentage;
      currentPercent = end;
      const isDimmed = selectedCategory && selectedCategory !== cat.id;
      const color = isDimmed ? 'rgba(255, 255, 255, 0.08)' : cat.color;
      return `${color} ${start}% ${end}%`;
    })
    .join(', ');
  const conicGradientStyle = `conic-gradient(${conicSegments})`;

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
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          <PieChartIcon size={16} color="#10b981" />
          <span>{isAr ? 'التوزيع الدائري للمصروفات' : 'Category Spend Distribution'}</span>
        </div>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="interactive-tap"
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isAr ? 'إعادة ضبط' : 'Reset'}
          </button>
        )}
      </div>

      <div
        className="donut-container"
        style={{
          position: 'relative',
          width: '160px',
          height: '160px',
          margin: '0 auto 20px auto',
          borderRadius: '50%',
          background: conicGradientStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        <div
          className="donut-hole"
          style={{
            width: '116px',
            height: '116px',
            backgroundColor: '#0f1623',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '6px',
          }}
        >
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {selectedCategoryObj
              ? (isAr ? selectedCategoryObj.nameAr : selectedCategoryObj.nameEn)
              : (isAr ? 'المصروفات' : 'SPENT')}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, margin: '2px 0', color: '#f8fafc' }}>
            {selectedCategoryObj
              ? formatCurrency(selectedCategoryObj.amount, language)
              : formatCurrency(totalSpent, language)}
          </span>
          {selectedCategoryObj && (
            <span style={{ fontSize: '10px', fontWeight: 800, color: selectedCategoryObj.color }}>
              {selectedCategoryObj.percentage}%
            </span>
          )}
        </div>
      </div>

      <div
        className="category-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px 16px',
          borderTop: '1px solid #1e293b',
          paddingTop: '16px',
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className="category-item interactive-tap"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <div className="category-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', minWidth: 0 }}>
                <span
                  className="dot"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: cat.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ display: 'flex', alignItems: 'center', color: cat.color, flexShrink: 0 }}>
                  {cat.icon}
                </span>
                <span style={{ color: isSelected ? '#f8fafc' : '#94a3b8', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isAr ? cat.nameAr : cat.nameEn}
                </span>
              </div>
              <span className="category-val" style={{ fontWeight: 700, color: cat.color, marginInlineStart: '6px', flexShrink: 0 }}>
                {cat.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
