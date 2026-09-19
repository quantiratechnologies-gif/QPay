import React, { useState } from 'react';
import { Utensils, Star, X, Check, Clock, Plus, Minus } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { formatSaudiCurrency, formatLocalizedNumber, translateText } from '../utils/i18n';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: string;
  cuisine: string;
  offer: string;
  deliveryTime: string;
  items: MenuItem[];
}

export interface FoodScreenProps {
  initialRestaurants?: Restaurant[];
}

export const FoodScreen: React.FC<FoodScreenProps> = ({ initialRestaurants }) => {
  const { openPinModal, completePayment, language, t, isRtl } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [selectedRes, setSelectedRes] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderConfirmed, setOrderConfirmed] = useState<{
    restaurantName: string;
    totalAmount: number;
    estimatedTime: string;
  } | null>(null);

  const defaultRestaurants: Restaurant[] = [
    {
      id: 'res-1',
      name: isAr ? 'كافيه هاف مليون' : 'Half Million Coffee',
      rating: formatLocalizedNumber('4.9', language),
      cuisine: isAr ? 'قهوة مختصة، سبانش لاتيه ومخبوزات طازجة' : 'Specialty Coffee, Spanish Latte & Pastries',
      offer: isAr ? 'خصم ٢٠٪ مع كود QTPAY20' : 'Flat 20% OFF with QTPAY20',
      deliveryTime: isAr ? '١٥-٢٠ دقيقة' : '15-20 mins',
      items: [
        { id: 'i-1', name: isAr ? 'سبانش لاتيه مميز' : 'Signature Spanish Latte', price: 24, qty: 1 },
        { id: 'i-2', name: isAr ? 'كروفين فستق' : 'Pistachio Cruffin', price: 18, qty: 1 },
        { id: 'i-3', name: isAr ? 'كولد برو بالهيل' : 'Cardamom Iced Cold Brew', price: 22, qty: 0 },
      ],
    },
    {
      id: 'res-2',
      name: isAr ? 'مطاعم الرومانسية للمندي' : 'Al Romansiah Mandi',
      rating: formatLocalizedNumber('4.9', language),
      cuisine: isAr ? 'كبسة ومندي سعودي أصيل ومشويات' : 'Authentic Saudi Kabsa, Mandi & Grills',
      offer: isAr ? 'حلى مجاني للطلبات فوق ١٠٠ ر.س' : 'Free Dessert on orders > SAR 100',
      deliveryTime: isAr ? '٢٥-٣٠ دقيقة' : '25-30 mins',
      items: [
        { id: 'i-4', name: isAr ? 'مندي لحم حاشي خاص' : 'Special Hashi Meat Mandi', price: 78, qty: 1 },
        { id: 'i-5', name: isAr ? 'مضبي دجاج على الفحم' : 'Charcoal Madhbi Chicken', price: 36, qty: 1 },
        { id: 'i-6', name: isAr ? 'كنافة بالقشطة الطازجة' : 'Fresh Cream Kunafa', price: 20, qty: 0 },
      ],
    },
    {
      id: 'res-3',
      name: isAr ? 'بوقا سوبر فودز' : 'Boga Super Foods',
      rating: formatLocalizedNumber('4.8', language),
      cuisine: isAr ? 'أطباق صحية، ساندويتشات وعصائر طازجة' : 'Healthy Bowls, Sandwiches & Fresh Juices',
      offer: isAr ? '١٥٪ كاش باك عبر كيو تي باي' : '15% Cashback on QTPay',
      deliveryTime: isAr ? '٢٠-٢٥ دقيقة' : '20-25 mins',
      items: [
        { id: 'i-7', name: isAr ? 'وعاء كينوا مع سلمون مدخن' : 'Smoked Salmon Quinoa Bowl', price: 48, qty: 1 },
        { id: 'i-8', name: isAr ? 'عصير رمان طائفي طازج' : 'Fresh Taif Pomegranate Juice', price: 22, qty: 1 },
      ],
    },
  ];

  const restaurants = initialRestaurants && initialRestaurants.length > 0 ? initialRestaurants : defaultRestaurants;

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
        {/* Dining Offer Banner */}
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
            <div
              key={res.id}
              onClick={() => handleOpenRes(res)}
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
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{res.name}</h4>
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
                  <Star size={12} fill="var(--brand-green, #7FE87F)" /> {res.rating}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '4px' }}>{res.cuisine}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-green-ink, #080C14)', backgroundColor: 'var(--brand-green, #7FE87F)', padding: '3px 8px', borderRadius: '6px' }}>
                  {res.offer}
                </span>
                <span style={{ fontSize: '11px', color: '#8E9BAE', display: 'flex', alignItems: 'center', gap: '4px', marginInlineStart: 'auto' }}>
                  <Clock size={12} /> {res.deliveryTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Restaurant Menu & Checkout Modal */}
      {selectedRes && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedRes(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--color-surface, #111726)',
              borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '24px 20px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{selectedRes.name}</h3>
                <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '2px 0 0 0' }}>{translateText('Select items to order', language)}</p>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                aria-label="Close"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#8E9BAE',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    backgroundColor: 'var(--color-surface-elevated, #182236)',
                    borderRadius: '14px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{item.name}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-green, #7FE87F)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                      {formatSaudiCurrency(item.price, language)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="interactive-tap"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-surface, #111726)',
                        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#FFFFFF',
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '16px', textAlign: 'center', color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
                      {formatLocalizedNumber(item.qty, language)}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="interactive-tap"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--brand-green, #7FE87F)',
                        border: 'none',
                        color: 'var(--brand-green-ink, #080C14)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingTop: '12px', borderTop: '1px dashed var(--color-border, rgba(255, 255, 255, 0.12))' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#8E9BAE' }}>{translateText('Total Bill Amount', language)}</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)', fontVariantNumeric: 'tabular-nums' }}>
                {formatSaudiCurrency(calculateSubtotal(), language)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={calculateSubtotal() <= 0}
              className="interactive-tap"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: calculateSubtotal() > 0 ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface-elevated, #182236)',
                border: 'none',
                color: calculateSubtotal() > 0 ? 'var(--brand-green-ink, #080C14)' : '#6B7A90',
                fontSize: '14px',
                fontWeight: 800,
                cursor: calculateSubtotal() > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              {isAr
                ? `طلب ودفع ${formatSaudiCurrency(calculateSubtotal(), language)} عبر رمز ساريع`
                : `Order & Pay SAR ${calculateSubtotal().toLocaleString()} via Sarie PIN`}
            </button>
          </div>
        </div>
      )}

      {/* Confirmed Order Delivery Tracking Modal */}
      {orderConfirmed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setOrderConfirmed(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: 'var(--color-surface, #111726)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
              borderRadius: '20px',
              padding: '24px',
              textAlign: 'center',
              position: 'relative',
              animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <Check size={32} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
              {translateText('Order Confirmed!', language)}
            </h3>
            <p style={{ fontSize: '12px', color: '#8E9BAE', margin: '0 0 20px 0' }}>
              {isAr ? `${orderConfirmed.restaurantName} يجهز وجبتك الآن` : `${orderConfirmed.restaurantName} is preparing your meal`}
            </p>

            <div style={{ backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '16px', padding: '16px', textAlign: isRtl ? 'right' : 'left', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} color="var(--brand-green, #7FE87F)" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)' }}>
                  {isAr ? `التوصيل خلال ${orderConfirmed.estimatedTime}` : `Delivering in ${orderConfirmed.estimatedTime}`}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                {isAr ? `تم دفع ${formatSaudiCurrency(orderConfirmed.totalAmount, language)} عبر كيو تي باي` : `Paid SAR ${orderConfirmed.totalAmount} via QTPay`}
              </div>
            </div>

            <button
              onClick={() => setOrderConfirmed(null)}
              className="interactive-tap"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-green, #7FE87F)',
                border: 'none',
                color: 'var(--brand-green-ink, #080C14)',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {translateText('Track Order Status', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

