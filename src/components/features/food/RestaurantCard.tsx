import React from 'react';
import { Star, Clock } from 'lucide-react';
import type { Restaurant } from './types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="interactive-tap"
      style={{
        padding: '16px',
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '16px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{restaurant.name}</h4>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
            color: 'var(--brand-green, #7FE87F)',
            padding: '3px 8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Star size={12} fill="var(--brand-green, #7FE87F)" /> {restaurant.rating}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '4px' }}>{restaurant.cuisine}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-green-ink, #080C14)', backgroundColor: 'var(--brand-green, #7FE87F)', padding: '3px 8px', borderRadius: '6px' }}>
          {restaurant.offer}
        </span>
        <span style={{ fontSize: '11px', color: '#8E9BAE', display: 'flex', alignItems: 'center', gap: '4px', marginInlineStart: 'auto' }}>
          <Clock size={12} /> {restaurant.deliveryTime}
        </span>
      </div>
    </div>
  );
};
