import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import type { CategoryData } from './types';

interface CategoryBreakdownListProps {
  categories: CategoryData[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  language: string;
  isRtl: boolean;
}

export const CategoryBreakdownList: React.FC<CategoryBreakdownListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  language,
  isRtl,
}) => {
  const isAr = language === 'العربية';
  const displayList = selectedCategory
    ? categories.filter((c) => c.id === selectedCategory)
    : categories;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          {isAr ? 'تفاصيل الفئات' : 'Category Details'}
        </span>

        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isAr ? 'عرض الكل' : 'Show All'}
          </button>
        )}
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
        {displayList.map((cat, index) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className="interactive-tap"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                border: isSelected ? `1px solid ${cat.color}` : '1px solid transparent',
                borderBottom: !isSelected && index < displayList.length - 1 ? '1px solid #1e293b' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '11px',
                    backgroundColor: cat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {cat.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                      {isAr ? cat.nameAr : cat.nameEn}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '5px',
                        backgroundColor: cat.bgColor,
                        color: cat.color,
                      }}
                    >
                      {cat.percentage}%
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {cat.txnCount} {isAr ? 'عمليات' : 'txns'} • {cat.merchants.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: isRtl ? 'left' : 'right', marginInlineStart: '12px' }}>
                <div className="tabular-nums" style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc' }}>
                  {formatCurrency(cat.amount, language)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
