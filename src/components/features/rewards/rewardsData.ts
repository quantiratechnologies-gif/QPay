export interface ScratchCardItem {
  id: string;
  title: string;
  subtitle: string;
  rewardText: string;
  rewardType: 'cashback' | 'voucher' | 'points';
  amount?: number;
  isScratched: boolean;
  code?: string;
}

export const getDefaultScratchCards = (isAr: boolean): ScratchCardItem[] => [
  {
    id: 'sc-1',
    title: isAr ? 'مكافأة تحويل سريع' : 'Sarie Transfer Reward',
    subtitle: isAr
      ? 'مكتسبة عند سداد فاتورة كهرباء بمبلغ ٢,٦٢٠ ر.س'
      : 'Earned on SAR 2,620 SEC Bill Payment',
    rewardText: isAr ? 'كاش باك فوري ١٥ ر.س' : 'SAR 15 Instant Cashback',
    rewardType: 'cashback',
    amount: 15,
    isScratched: false,
  },
  {
    id: 'sc-2',
    title: isAr ? 'توفير المتاجر الكبرى' : 'Supermarket Saver',
    subtitle: isAr ? 'مكتسبة لدى أسواق بنده' : 'Earned at Panda Supermarket',
    rewardText: isAr ? 'خصم ٢٥٪ على الأغذية والمقاضي' : 'Flat 25% Off Food & Groceries',
    rewardType: 'voucher',
    code: 'PANDAFOOD25',
    isScratched: false,
  },
  {
    id: 'sc-3',
    title: isAr ? 'مكافأة عطلة نهاية الأسبوع' : 'Weekend Bonus Scratch',
    subtitle: isAr
      ? 'مكافأة خاصة لإجراء أكثر من ٥ عمليات سريع'
      : 'Special reward for 5+ Sarie transactions',
    rewardText: isAr ? '+٥٠٠ نقطة كيو تي إضافية' : '+500 Extra QTPoints',
    rewardType: 'points',
    amount: 500,
    isScratched: false,
  },
  {
    id: 'sc-4',
    title: isAr ? 'قسيمة سفر خاصة' : 'Travel Special Voucher',
    subtitle: isAr ? 'بطاقة خصم رحلات الخطوط السعودية' : 'Saudia flight discount card',
    rewardText: isAr ? 'خصم فوري ١٥٠ ر.س على الطيران' : 'Flat SAR 150 Flight Discount',
    rewardType: 'voucher',
    code: 'FLYSAR150',
    isScratched: true,
  },
];
