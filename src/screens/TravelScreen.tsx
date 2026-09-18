import React, { useState } from 'react';
import { Plane, Car, Hotel, Compass, X, Check, Copy, CheckCheck } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { useApp } from '../state/AppContext';
import { formatSaudiCurrency, translateText } from '../utils/i18n';
import { QPayApi } from '../api';

export type TravelCategory = 'flights' | 'airport' | 'hotels' | 'holidays';

export interface TravelItem {
  id: string;
  category: TravelCategory;
  title: string;
  subtitle: string;
  location: string;
  provider: string;
  price: number;
  rating: number;
  badge?: string;
  highlights: string[];
}

export const TravelScreen: React.FC = () => {
  const { openPinModal, completePayment, language, isRtl } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [selectedBooking, setSelectedBooking] = useState<TravelBooking | null>(null);
  const [copiedPnr, setCopiedPnr] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<{
    title: string;
    pnr: string;
    totalPaid: number;
    utr: string;
    guestCount: number;
    travelDate: string;
  } | null>(null);

  const travelItems: TravelItem[] = [
    // Flights (USER-14)
    {
      id: 'fl-1',
      category: 'flights',
      title: isAr ? 'الرياض (RUH) ➔ جدة (JED)' : 'Riyadh (RUH) ➔ Jeddah (JED)',
      subtitle: isAr ? 'رحلة الخطوط السعودية SV1024 • مباشر • ساعة و٣٥ دقيقة' : 'Saudia Flight SV1024 • Direct • 1h 35m',
      location: isAr ? 'مطار الملك خالد الدولي (T5)' : 'King Khalid Int Airport (T5)',
      provider: isAr ? 'الخطوط السعودية' : 'Saudia Airlines',
      price: 650,
      rating: 4.8,
      badge: isAr ? 'الأكثر طلباً' : 'Best Seller',
      highlights: [
        isAr ? 'وزن الأمتعة: ٢٣ كجم + ٧ كجم كابينة' : 'Baggage: 23kg Check-in + 7kg Cabin',
        isAr ? 'وجبة ساخنة ومشروبات مجانية' : 'Complimentary Hot Meal & Drinks',
        isAr ? 'تغيير الموعد مرن بدون غرامة' : 'Flexible Date Changes Included',
      ],
    },
    {
      id: 'fl-2',
      category: 'flights',
      title: isAr ? 'الدمام (DMM) ➔ العلا (ULH)' : 'Dammam (DMM) ➔ AlUla (ULH)',
      subtitle: isAr ? 'طيران أديل F3 408 • مباشر • ساعتان و١٠ دقائق' : 'flyadeal F3 408 • Direct • 2h 10m',
      location: isAr ? 'مطار الملك فهد الدولي' : 'King Fahd Int Airport',
      provider: isAr ? 'طيران أديل' : 'flyadeal',
      price: 490,
      rating: 4.6,
      badge: isAr ? 'عرض خاص' : 'Special Fare',
      highlights: [
        isAr ? 'أسرع رحلة مباشرة إلى واحة العلا' : 'Direct express flight to AlUla Oasis',
        isAr ? 'مقاعد مريحة مع شاحن USB' : 'Comfortable seating with USB power',
      ],
    },

    // Airport Flow (USER-15)
    {
      id: 'ap-1',
      category: 'airport',
      title: isAr ? 'توصيل مطار الملك خالد الخاص' : 'King Khalid Airport Private Chauffeur',
      subtitle: isAr ? 'سيدان فاخرة مرسيدس E-Class • استلام من باب المنزل' : 'Executive Mercedes E-Class • Doorstep Pickup & Terminal Delivery',
      location: isAr ? 'الرياض • جميع الأحياء' : 'Riyadh • All Districts',
      provider: isAr ? 'كيو تي باي شوفيير' : 'QTPay Chauffeur VIP',
      price: 180,
      rating: 4.9,
      badge: isAr ? 'خدمة VIP' : 'VIP Chauffeur',
      highlights: [
        isAr ? 'سائق خاص محترف مع تتبع موعد الرحلة' : 'Professional chauffeur with flight tracking',
        isAr ? 'شامل رسوم المطار والمواقف والانتظار ٤٥ دقيقة' : 'Includes all toll, airport & 45m waiting fees',
        isAr ? 'مياه باردة وواي فاي فائق السرعة' : 'Complimentary chilled water & high-speed WiFi',
      ],
    },
    {
      id: 'ap-2',
      category: 'airport',
      title: isAr ? 'دخول صالة الفرسان VIP' : 'AlFursan Executive Lounge Access',
      subtitle: isAr ? 'استرخاء في الصالة الفاخرة • بوفيه مفتوح + مساج' : 'Terminal Lounge Pass • Premium Buffet & Showers',
      location: isAr ? 'مطار الملك خالد / مطار الملك عبدالعزيز' : 'RUH / JED International Terminals',
      provider: isAr ? 'صالة الفرسان' : 'AlFursan Lounge',
      price: 210,
      rating: 4.7,
      badge: isAr ? 'دخول فوري' : 'Instant Pass',
      highlights: [
        isAr ? 'بوفيه طعام ساخن وبار ومشروبات ممتازة' : 'Unlimited hot gourmet buffet & refreshments',
        isAr ? 'أجنحة استرخاء وشاشات تتبع رحلات خاصة' : 'Private quiet pods & luxury shower suites',
      ],
    },

    // Hotel Reservation (USER-13)
    {
      id: 'ht-1',
      category: 'hotels',
      title: isAr ? 'فندق ريتز كارلتون الرياض' : 'The Ritz-Carlton Riyadh',
      subtitle: isAr ? 'جناح ديلوكس ملكي • إطلالة على الحديقة • شامل الإفطار' : 'Royal Deluxe Suite • Garden View • Gourmet Breakfast Included',
      location: isAr ? 'طريق مكة، الهدا، الرياض' : 'Makkah Road, Al Hada, Riyadh',
      provider: 'Marriott Bonvoy',
      price: 1450,
      rating: 4.9,
      badge: isAr ? '٥ نجوم فاخر' : '5-Star Luxury',
      highlights: [
        isAr ? 'إفطار بوفيه مفتوح لشخصين' : 'Daily international buffet breakfast for 2',
        isAr ? 'تسجيل وصول مبكر وتسجيل مغادرة متأخر' : 'Complimentary early check-in & late check-out',
        isAr ? 'دخول مجاني للنادي الصحي والمسبح الداخلي' : 'Access to luxury spa & Olympic indoor pool',
      ],
    },
    {
      id: 'ht-2',
      category: 'hotels',
      title: isAr ? 'منتجع بانيان تري العلا' : 'Banyan Tree AlUla Desert Resort',
      subtitle: isAr ? 'فيلا خيمة بحوض سباحة خاص • وادي عشار' : 'Luxury Tented Villa with Private Pool • Ashar Valley',
      location: isAr ? 'وادي عشار، العلا' : 'Ashar Valley, AlUla',
      provider: 'Banyan Tree Resorts',
      price: 3200,
      rating: 5.0,
      badge: isAr ? 'إقامة استثنائية' : 'Ultra Luxury',
      highlights: [
        isAr ? 'حمام سباحة خاص وإطلالة على الجبال الصخرية' : 'Private rock-view heated infinity pool',
        isAr ? 'جلسات تأمل ويوغا في قلب الصحراء' : 'Desert stargazing & guided sanctuary yoga',
      ],
    },

    // Holiday Package Booking (USER-12)
    {
      id: 'hl-1',
      category: 'holidays',
      title: isAr ? 'باقة عطلة واحة العلا الساحرة' : 'AlUla Magical Oasis Holiday Package',
      subtitle: isAr ? '٣ أيام / ليلتان • منتجع بيئي + جولة الحِجر ومسرح مرايا' : '3 Days / 2 Nights • Eco-Resort + Hegra UNESCO Tour & Maraya',
      location: isAr ? 'العلا، المملكة العربية السعودية' : 'AlUla, Saudi Arabia',
      provider: isAr ? 'استكشف العلا' : 'Experience AlUla',
      price: 2800,
      rating: 4.95,
      badge: isAr ? 'باقة متكاملة' : 'All-Inclusive',
      highlights: [
        isAr ? 'شامل تذاكر الطيران ذهاب وعودة من الرياض' : 'Includes round-trip flights from Riyadh',
        isAr ? 'إقامة ليلتين في منتجع بيئي فاخر مع الوجبات' : '2 nights luxury resort stay with all meals',
        isAr ? 'جولة مرشد سياحي في مدائن صالح والحِجر وجبل الفيل' : 'VIP guided UNESCO Hegra & Elephant Rock tour',
      ],
    },
    {
      id: 'hl-2',
      category: 'holidays',
      title: isAr ? 'باقة مغامرة جزر البحر الأحمر' : 'Red Sea Destination Island Escape',
      subtitle: isAr ? '٤ أيام / ٣ ليالٍ • منتجع سانت ريجيس + غوص وشواطئ بكر' : '4 Days / 3 Nights • The St. Regis Red Sea + Diving Expeditions',
      location: isAr ? 'مشروع البحر الأحمر، أملج' : 'Red Sea Project, Umluj',
      provider: isAr ? 'وجهة البحر الأحمر' : 'Visit Red Sea',
      price: 4500,
      rating: 4.9,
      badge: isAr ? 'الوجهة الأحدث' : 'Featured Resort',
      highlights: [
        isAr ? 'فيلا عائمة فوق الماء مع رحلات بحرية يومية' : 'Overwater private villa with daily yacht excursions',
        isAr ? 'تجربة غوص فريدة للشعب المرجانية المحمية' : 'Exclusive marine biologist reef diving experience',
      ],
    },
  ];

  const filteredItems = travelItems.filter((item) => item.category === selectedCategory);

  const handleOpenItem = (item: TravelItem) => {
    setActiveItem(item);
    setBookingStep('details');
  };

  const handleProceedToReview = () => {
    setBookingStep('review');
  };

  const handleConfirmBookingPayment = () => {
    if (!activeItem) return;

    const totalToPay = activeItem.price * guestCount;

    openPinModal({
      title: `${isAr ? 'تأكيد حجز' : 'Confirm'} ${activeItem.title}`,
      subTitle: `${activeItem.provider} • ${formatSaudiCurrency(totalToPay, language)}`,
      amount: totalToPay,
      onSuccess: async () => {
        const txn = await completePayment({
          title: activeItem.title,
          subTitle: `${activeItem.provider} • ${isAr ? `تاريخ السفر: ${travelDate}` : `Travel Date: ${travelDate}`}`,
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
        {/* Category Navigation Pills */}
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
          {[
            { id: 'flights' as TravelCategory, label: isAr ? 'الطيران' : 'Flights', icon: <Plane size={15} /> },
            { id: 'airport' as TravelCategory, label: isAr ? 'المطار والصالات' : 'Airport & Chauffeur', icon: <Car size={15} /> },
            { id: 'hotels' as TravelCategory, label: isAr ? 'الفنادق' : 'Hotels', icon: <Hotel size={15} /> },
            { id: 'holidays' as TravelCategory, label: isAr ? 'باقات العطلات' : 'Holiday Packages', icon: <Compass size={15} /> },
          ].map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
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

        {/* Travel Items Listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenItem(item)}
              className="interactive-tap"
              style={{
                backgroundColor: 'var(--color-surface, #111726)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                borderRadius: '20px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginInlineEnd: '12px' }}>
                  {item.badge && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                        color: 'var(--brand-green, #7FE87F)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        marginBottom: '8px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{item.title}</h3>
                  <div style={{ fontSize: '12px', color: '#8E9BAE', marginTop: '4px' }}>{item.subtitle}</div>
                </div>

                <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', color: '#8E9BAE', fontWeight: 700 }}>{isAr ? 'ابتداءً من' : 'From'}</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                    {formatSaudiCurrency(item.price, language)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))' }}>
                <span style={{ fontSize: '12px', color: '#8E9BAE', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="var(--brand-green, #7FE87F)" /> {item.location}
                </span>

                <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.category === 'holidays' ? (isAr ? 'استكشاف وحجز' : 'Explore') : (isAr ? 'حجز فوري' : 'Book')} <ChevronRight size={15} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Step Booking Modal (Details -> Review -> Confirm) */}
      {activeItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 2600,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setActiveItem(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--color-surface, #111726)',
              borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px 20px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {bookingStep === 'details' ? (isAr ? 'تفاصيل الحجز والخيارات' : 'Step 1: Select Details') : (isAr ? 'مراجعة وتأكيد الدفع' : 'Step 2: Review & Confirm')}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 0 0' }}>{activeItem.title}</h3>
                <div style={{ fontSize: '12px', color: '#8E9BAE' }}>{activeItem.provider}</div>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: 'none',
                  color: '#8E9BAE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {bookingStep === 'details' ? (
              /* STEP 1: DETAILS & SELECTION */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Highlights */}
                <div style={{ backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                    {isAr ? 'المزايا المشمولة في الحجز' : 'Package Inclusions & Benefits'}
                  </div>
                  {activeItem.highlights.map((h, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#C8E6C9', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Check size={14} color="var(--brand-green, #7FE87F)" /> <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Date Selection */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#8E9BAE', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    {isAr ? 'تاريخ السفر / الحجز' : 'Travel / Check-in Date'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--color-surface-elevated, #182236)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '12px 14px' }}>
                    <Calendar size={18} color="var(--brand-green, #7FE87F)" />
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, outline: 'none', width: '100%', colorScheme: 'dark' }}
                    />
                  </div>
                </div>

                {/* Guest / Quantity Selector */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#8E9BAE', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    {isAr ? 'عدد المسافرين / الضيوف' : 'Number of Guests / Passengers'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-surface-elevated, #182236)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '8px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} color="var(--brand-green, #7FE87F)" />
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{guestCount} {isAr ? 'شخص' : 'Person(s)'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#2C2C44', color: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <button
                        onClick={() => setGuestCount(guestCount + 1)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--brand-green, #7FE87F)', color: '#080C14', fontWeight: 900, cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total Price Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(127, 232, 127, 0.08)', border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))', borderRadius: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{isAr ? 'إجمالي المبلغ المستحق' : 'Total Amount'}</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>{formatSaudiCurrency(activeItem.price * guestCount, language)}</span>
                </div>

                <PrimaryButton onClick={handleProceedToReview}>
                  {isAr ? 'مراجعة وتأكيد الحجز' : 'Review Booking'} →
                </PrimaryButton>
              </div>
            ) : (
              /* STEP 2: REVIEW & CONFIRM */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '16px', padding: '18px', textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: '#8E9BAE' }}>{isAr ? 'الخدمة' : 'Service'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{activeItem.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: '#8E9BAE' }}>{isAr ? 'مزود الخدمة' : 'Provider'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{activeItem.provider}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: '#8E9BAE' }}>{isAr ? 'تاريخ الحجز' : 'Date'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{travelDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: '#8E9BAE' }}>{isAr ? 'العدد' : 'Guests'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{guestCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed var(--color-border, rgba(255, 255, 255, 0.12))' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{isAr ? 'المبلغ الإجمالي' : 'Total to Pay'}</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                      {formatSaudiCurrency(activeItem.price * guestCount, language)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <SecondaryButton onClick={() => setBookingStep('details')}>
                    {isAr ? 'تعديل' : 'Back'}
                  </SecondaryButton>
                  <div style={{ flex: 2 }}>
                    <PrimaryButton onClick={handleConfirmBookingPayment}>
                      <ShieldCheck size={18} /> {isAr ? 'تأكيد الحجز والدفع الفوري' : 'Confirm & Pay Now'}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmed Ticket / Booking Confirmation Voucher Modal */}
      {confirmedBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 2600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setConfirmedBooking(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'var(--color-surface, #111726)',
              border: '1.5px solid var(--brand-green, #7FE87F)',
              borderRadius: '24px',
              padding: '28px 22px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Check size={36} strokeWidth={3} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {isAr ? 'تم تأكيد الحجز بنجاح!' : 'Booking Confirmed!'}
            </h3>
            <div style={{ fontSize: '13px', color: '#8E9BAE', marginTop: '4px', marginBottom: '20px' }}>
              {confirmedBooking.item.title}
            </div>

            <div style={{ backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '16px', padding: '16px', textAlign: isRtl ? 'right' : 'left', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#8E9BAE' }}>{translateText('Booking Reference (PNR)', language)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', fontFamily: 'monospace' }}>{confirmedTicket.pnr}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(confirmedTicket.pnr);
                      setCopiedPnr(true);
                      setTimeout(() => setCopiedPnr(false), 2000);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedPnr ? 'var(--brand-green, #7FE87F)' : '#8E9BAE',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                    }}
                    title="Copy PNR"
                  >
                    {copiedPnr ? <CheckCheck size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#8E9BAE' }}>{isAr ? 'المرجع المالي' : 'UTR Ref'}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {confirmedBooking.utr}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#8E9BAE' }}>{isAr ? 'تاريخ السفر' : 'Travel Date'}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                  {confirmedBooking.travelDate}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--color-border, rgba(255, 255, 255, 0.12))' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{isAr ? 'المبلغ المدفوع' : 'Total Paid'}</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                  {formatSaudiCurrency(confirmedBooking.totalPaid, language)}
                </span>
              </div>
            </div>

            <PrimaryButton onClick={() => setConfirmedBooking(null)}>
              {isAr ? 'إغلاق وعرض التذكرة' : 'Done & View E-Ticket'}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
};
