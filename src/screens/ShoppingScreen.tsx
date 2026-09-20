import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { formatSaudiCurrency, translateText } from '../utils/i18n';
import {
  ShoppingHeroBanner,
  DealCard,
  DealCheckoutModal,
  DealPurchasedModal,
  getDefaultDeals,
} from '../components/features/shopping';
import type { DealItem } from '../components/features/shopping';

export type { DealItem };

export interface ShoppingScreenProps {
  initialDeals?: DealItem[];
}

export const ShoppingScreen: React.FC<ShoppingScreenProps> = ({ initialDeals }) => {
  const { openPinModal, completePayment, language, t, isRtl } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(null);
  const [purchasedDeal, setPurchasedDeal] = useState<{
    title: string;
    store: string;
    paidAmount: number;
  } | null>(null);

  const deals =
    initialDeals && initialDeals.length > 0 ? initialDeals : getDefaultDeals(isAr);

  const handleBuyNow = () => {
    if (!selectedDeal) return;

    openPinModal({
      title: `${translateText('Buy', language)} ${selectedDeal.title}`,
      subTitle: `${selectedDeal.store} • ${formatSaudiCurrency(selectedDeal.discountedPrice, language)}`,
      amount: selectedDeal.discountedPrice,
      onSuccess: async () => {
        await completePayment({
          title: selectedDeal.store,
          subTitle: selectedDeal.title,
          amount: selectedDeal.discountedPrice,
          category: 'Shopping Purchase',
        });

        setPurchasedDeal({
          title: selectedDeal.title,
          store: selectedDeal.store,
          paidAmount: selectedDeal.discountedPrice,
        });
        setSelectedDeal(null);
      },
    });
  };

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#0B0F19',
        minHeight: '100vh',
        paddingBottom: '96px',
        color: '#FFFFFF',
      }}
    >
      <AppHeader
        title={translateText('Shopping & Deals', language)}
        showBack
        showSettings={false}
      />

      <div style={{ padding: '20px' }}>
        <ShoppingHeroBanner language={language} />

        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#8E9BAE',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
            marginInlineStart: '4px',
          }}
        >
          {translateText('Featured Partner Offers', language)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isRtl={isRtl}
              onSelect={(d) => setSelectedDeal(d)}
            />
          ))}
        </div>
      </div>

      {/* Deal Checkout Modal */}
      {selectedDeal && (
        <DealCheckoutModal
          deal={selectedDeal}
          language={language}
          t={t}
          onClose={() => setSelectedDeal(null)}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Confirmed Purchase Modal */}
      {purchasedDeal && (
        <DealPurchasedModal
          purchasedDeal={purchasedDeal}
          language={language}
          isRtl={isRtl}
          onClose={() => setPurchasedDeal(null)}
        />
      )}
    </div>
  );
};
