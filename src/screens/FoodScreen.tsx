import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { translateText } from '../utils/i18n';
import {
  RestaurantCard,
  RestaurantMenuModal,
  OrderTrackingModal,
  getDefaultRestaurants,
} from '../components/features/food';
import type { Restaurant, MenuItem, ConfirmedOrder } from '../components/features/food';

export interface FoodScreenProps {
  initialRestaurants?: Restaurant[];
}

export const FoodScreen: React.FC<FoodScreenProps> = ({ initialRestaurants }) => {
  const { openPinModal, completePayment, language, t, isRtl } = useApp();
  const isAr = language === '???????' || language === 'ar';

  const [selectedRes, setSelectedRes] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderConfirmed, setOrderConfirmed] = useState<ConfirmedOrder | null>(null);

  const restaurants =
    initialRestaurants && initialRestaurants.length > 0
      ? initialRestaurants
      : getDefaultRestaurants(language, isAr);

  const handleOpenRes = (res: Restaurant) => {
    setSelectedRes(res);
    setMenuItems(res.items.map((it) => ({ ...it })));
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(0, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const calculateSubtotal = () => {
    return menuItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const handlePlaceOrder = () => {
    if (!selectedRes) return;
    const total = calculateSubtotal();
    if (total <= 0) return;

    openPinModal({
      title: `${t('order_from')} ${selectedRes.name}`,
      subTitle: `${translateText('Food Delivery', language)} • ${selectedRes.deliveryTime}`,
      amount: total,
      onSuccess: async () => {
        await completePayment({
          title: selectedRes.name,
          subTitle: `${translateText('Food Order', language)} (${menuItems.filter((i) => i.qty > 0).length} ${translateText('items', language)})`,
          amount: total,
          category: 'Food & Dining',
        });

        setOrderConfirmed({
          restaurantName: selectedRes.name,
          totalAmount: total,
          estimatedTime: selectedRes.deliveryTime,
        });
        setSelectedRes(null);
      },
    });
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#0B0F19', minHeight: '100vh', paddingBottom: '30px', color: '#FFFFFF' }}>
      <AppHeader title={translateText('Food & Dining', language)} showBack showSettings={false} />

      <div style={{ padding: '20px' }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#FFFFFF',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
              color: 'var(--brand-green, #7FE87F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Utensils size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>{translateText('QTPay Food & Dining', language)}</h3>
            <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '3px 0 0 0' }}>
              {translateText('Order food online with instant discounts & 0 delivery fee', language)}
            </p>
          </div>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 800, color: '#8E9BAE', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', marginInlineStart: '4px' }}>
          {translateText('Nearby Partner Restaurants', language)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {restaurants.map((res) => (
            <RestaurantCard
              key={res.id}
              restaurant={res}
              onClick={() => handleOpenRes(res)}
            />
          ))}
        </div>
      </div>

      {selectedRes && (
        <RestaurantMenuModal
          restaurant={selectedRes}
          menuItems={menuItems}
          onClose={() => setSelectedRes(null)}
          onUpdateQty={handleUpdateQty}
          onPlaceOrder={handlePlaceOrder}
          subtotal={calculateSubtotal()}
          language={language}
          isAr={isAr}
        />
      )}

      {orderConfirmed && (
        <OrderTrackingModal
          order={orderConfirmed}
          onClose={() => setOrderConfirmed(null)}
          language={language}
          isAr={isAr}
          isRtl={isRtl}
        />
      )}
    </div>
  );
};
export default FoodScreen;
