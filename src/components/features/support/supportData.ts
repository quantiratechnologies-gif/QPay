export interface FaqItem {
  q: string;
  a: string;
}

export const getDefaultFaqs = (isAr: boolean): FaqItem[] => [
  {
    q: isAr
      ? 'كم يستغرق استرداد الأموال عبر سريع؟'
      : 'How long does a Sarie refund take?',
    a: isAr
      ? 'تتم عمليات الاسترداد الفورية خلال ثوانٍ إلى ساعتين كحد أقصى وفق معايير البنك المركزي السعودي.'
      : 'Instant Sarie refunds are credited within seconds to 1-2 hours under standard banking protocols.',
  },
  {
    q: isAr
      ? 'ما هو الحد اليومي للتحويل عبر سريع؟'
      : 'What is the daily Sarie transfer limit?',
    a: isAr
      ? 'الحد اليومي القياسي للتحويل الفوري عبر سريع هو ٥٠,٠٠٠ ر.س عبر التطبيقات المصرفية المعتمدة.'
      : 'As per SAMA guidelines, the standard daily Sarie instant transaction limit is SAR 50,000.',
  },
  {
    q: isAr
      ? 'كيف أقوم بربط حساب بنكي سعودي جديد؟'
      : 'How do I add a new Saudi bank account?',
    a: isAr
      ? 'توجه إلى الحسابات البنكية > إضافة حساب، ثم اختر بنكك السعودي ووثق عبر الرسائل النصية.'
      : 'Go to Bank Accounts > Add Bank, select your Saudi bank, and verify via SMS OTP.',
  },
];
