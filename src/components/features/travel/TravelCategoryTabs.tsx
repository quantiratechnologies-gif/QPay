import React from 'react';
import { Plane, Car, Hotel, Compass } from 'lucide-react';
import type { TravelCategory } from './types';

interface TravelCategoryTabsProps {
  selectedCategory: TravelCategory;
  onSelectCategory: (c: TravelCategory) => void;
  isAr: boolean;
}

export const TravelCategoryTabs: React.FC<TravelCategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  isAr,
}) => {
  const tabs = [
    { id: 'flights' as TravelCategory, label: isAr ? '???????' : 'Flights', icon: <Plane size={15} /> },
    { id: 'airport' as TravelCategory, label: isAr ? '?????? ????????' : 'Airport & Chauffeur', icon: <Car size={15} /> },
    { id: 'hotels' as TravelCategory, label: isAr ? '???????' : 'Hotels', icon: <Hotel size={15} /> },
    { id: 'holidays' as TravelCategory, label: isAr ? '????? ???????' : 'Holiday Packages', icon: <Compass size={15} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '14px',
        marginBottom: '10px',
        scrollbarWidth: 'none',
      }}
    >
      {tabs.map((tab) => {
        const isSelected = selectedCategory === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectCategory(tab.id)}
            className="interactive-tap"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '20px',
              backgroundColor: isSelected ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface, #111726)',
              color: isSelected ? 'var(--brand-green-ink, #080C14)' : '#FFFFFF',
              border: isSelected ? 'none' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
