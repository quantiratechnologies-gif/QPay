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

export interface ConfirmedOrder {
  restaurantName: string;
  totalAmount: number;
  estimatedTime: string;
}
