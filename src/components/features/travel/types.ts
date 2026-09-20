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

export interface ConfirmedBooking {
  item: TravelItem;
  pnr: string;
  totalPaid: number;
  utr: string;
  guestCount: number;
  travelDate: string;
}
