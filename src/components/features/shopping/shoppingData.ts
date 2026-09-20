export interface DealItem {
  id: string;
  store: string;
  title: string;
  offer: string;
  category: string;
  couponCode: string;
  originalPrice: number;
  discountedPrice: number;
}

export const getDefaultDeals = (isAr: boolean): DealItem[] => [
  {
    id: 'deal-1',
    store: isAr ? 'أسواق بنده' : 'Panda Supermarket',
    title: isAr ? 'توفير البقالة والمقاضي الأسبوعية' : 'Weekly Grocery Smart Saver',
    offer: isAr ? 'كاش باك ٥٠ ر.س عبر سريع' : 'Flat SAR 50 Cashback on Sarie',
    category: isAr ? 'بقالة ومواد غذائية طازجة' : 'Groceries & Fresh Food',
    couponCode: 'PANDASAVER50',
    originalPrice: 350,
    discountedPrice: 300,
  },
  {
    id: 'deal-2',
    store: isAr ? 'مكتبة جرير' : 'Jarir Bookstore',
    title: isAr ? 'أفضل الكتب والأدوات الرقمية' : 'Trending Books & Digital Stationery',
    offer: isAr ? 'خصم فوري ٧٥ ر.س' : 'Flat SAR 75 Instant OFF',
    category: isAr ? 'كتب وإلكترونيات' : 'Books & Electronics',
    couponCode: 'JARIR75',
    originalPrice: 450,
    discountedPrice: 375,
  },
  {
    id: 'deal-3',
    store: isAr ? 'معارض إكسترا' : 'eXtra Stores',
    title: isAr ? 'سماعات لاسلكية عازلة للضوضاء' : 'Wireless Active Noise Cancelling Earbuds',
    offer: isAr ? 'خصم فوري يصل إلى ٢٠٠ ر.س' : 'Up to SAR 200 Instant Discount',
    category: isAr ? 'صوتيات وتقنية' : 'Audio & Tech Gadgets',
    couponCode: 'EXTRA200',
    originalPrice: 799,
    discountedPrice: 599,
  },
];
