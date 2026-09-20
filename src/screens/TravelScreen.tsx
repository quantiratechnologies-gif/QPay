import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { formatSaudiCurrency, translateText } from '../utils/i18n';
import { QPayApi } from '../api';
import {
  TravelCategoryTabs,
  TravelCard,
  TravelBookingModal,
  TravelConfirmationModal,
  getTravelItems,
} from '../components/features/travel';
import type { TravelCategory, TravelItem, ConfirmedBooking } from '../components/features/travel';

export const TravelScreen: React.FC = () => {
  const { openPinModal, completePayment, language, isRtl } = useApp();
  const isAr = language === '???????' || language === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<TravelCategory>('flights');
  const [activeItem, setActiveItem] = useState<TravelItem | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  const travelItems = getTravelItems(isAr);
  const filteredItems = travelItems.filter((item) => item.category === selectedCategory);

  const handleConfirmBookingPayment = (details: { travelDate: string; guestCount: number }) => {
    if (!activeItem) return;

    const { travelDate, guestCount } = details;
    const totalToPay = activeItem.price * guestCount;

    openPinModal({
      title: `${isAr ? '????? ???' : 'Confirm'} ${activeItem.title}`,
      subTitle: `${activeItem.provider} • ${formatSaudiCurrency(totalToPay, language)}`,
      amount: totalToPay,
      onSuccess: async () => {
        const txn = await completePayment({
          title: activeItem.title,
          subTitle: `${activeItem.provider} • ${isAr ? `????? ?????: ${travelDate}` : `Travel Date: ${travelDate}`}`,
          amount: totalToPay,
          category: 'Travel Booking',
        });

        const idempotencyKey = `idemp-travel-${txn.id}`;
        let pnrCode = 'SARIE-' + Math.floor(100000 + Math.random() * 900000).toString();

        try {
          if (activeItem.category === 'flights') {
            const flightRes = await QPayApi.travel.bookFlight(
              {
                flightNumber: 'SV1024',
                airlineCode: 'SV',
                originCode: 'RUH',
                destinationCode: 'JED',
                departureTime: travelDate,
                arrivalTime: travelDate,
                cabinClass: 'ECONOMY',
                passengers: [{ firstName: 'Fahad', lastName: 'Al-Harbi', nationalId: '1098472910' }],
                totalAmount: totalToPay,
              },
              { idempotencyKey }
            );
            if (flightRes.success) {
              pnrCode = flightRes.data.pnr;
            }
          } else if (activeItem.category === 'hotels' || activeItem.category === 'holidays') {
            const hotelRes = await QPayApi.travel.reserveHotel(
              {
                hotelName: activeItem.title,
                city: activeItem.location,
                roomType: 'Deluxe Suite',
                checkInDate: travelDate,
                checkOutDate: travelDate,
                guestCount,
                totalAmount: totalToPay,
              },
              { idempotencyKey }
            );
            if (hotelRes.success) {
              pnrCode = hotelRes.data.confirmationCode;
            }
          } else if (activeItem.category === 'airport') {
            const airportRes = await QPayApi.travel.bookAirportService(
              {
                serviceType: 'chauffeur',
                airportCode: 'RUH',
                serviceDate: travelDate,
                passengerCount: guestCount,
                totalAmount: totalToPay,
              },
              { idempotencyKey }
            );
            if (airportRes.success) {
              pnrCode = airportRes.data.bookingRef;
            }
          }
        } catch (err) {
          console.warn('[TravelScreen] Backend travel booking notice:', err);
        }

        setConfirmedBooking({
          item: activeItem,
          pnr: pnrCode,
          totalPaid: totalToPay,
          utr: txn.utr,
          guestCount,
          travelDate,
        });
        setActiveItem(null);
      },
    });
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader title={translateText('Travel & Bookings', language)} showBack />

      <div style={{ padding: '20px' }}>
        <TravelCategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isAr={isAr}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredItems.map((item) => (
            <TravelCard
              key={item.id}
              item={item}
              language={language}
              isAr={isAr}
              isRtl={isRtl}
              onClick={() => setActiveItem(item)}
            />
          ))}
        </div>
      </div>

      {activeItem && (
        <TravelBookingModal
          item={activeItem}
          isOpen={Boolean(activeItem)}
          onClose={() => setActiveItem(null)}
          onConfirm={handleConfirmBookingPayment}
          language={language}
          isAr={isAr}
          isRtl={isRtl}
        />
      )}

      {confirmedBooking && (
        <TravelConfirmationModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          language={language}
          isAr={isAr}
          isRtl={isRtl}
        />
      )}
    </div>
  );
};
export default TravelScreen;
