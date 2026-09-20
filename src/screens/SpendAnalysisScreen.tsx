import React, { useState } from 'react';
import {
  Utensils,
  ShoppingBag,
  Zap,
  Car,
  HeartPulse,
  Send,
  CheckCircle2,
  BookOpen,
  Store,
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import type {
  PeriodType,
  CategoryData,
  MerchantData,
} from '../components/features/analytics';
import {
  PeriodSelector,
  SpendOverviewCard,
  SpendDonutCard,
  SpendBarChart,
  CategoryBreakdownList,
  TopMerchantsList,
  SmartInsightsCard,
} from '../components/features/analytics';

export const SpendAnalysisScreen: React.FC = () => {
  const { language, isRtl } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('DAY');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const isAr = language === 'العربية';

  // Period datasets
  const periodData = {
    DAY: {
      totalSpent: 420,
      previousPeriodSpent: 380,
      deltaPercent: 10.5,
      dailyAverage: 420,
      budgetLimit: 600,
      periodNameEn: 'Today',
      periodNameAr: 'اليوم',
      chartData: [
        { label: isAr ? 'الصباح' : 'Morning', amount: 120 },
        { label: isAr ? 'الظهر' : 'Noon', amount: 80 },
        { label: isAr ? 'المساء' : 'Evening', amount: 220 },
      ],
    },
    WEEK: {
      totalSpent: 3420,
      previousPeriodSpent: 3950,
      deltaPercent: -13.4,
      dailyAverage: 488.5,
      budgetLimit: 4500,
      periodNameEn: 'This Week',
      periodNameAr: 'هذا الأسبوع',
      chartData: [
        { label: isAr ? 'الأحد' : 'Sun', amount: 420 },
        { label: isAr ? 'الإثنين' : 'Mon', amount: 380 },
        { label: isAr ? 'الثلاثاء' : 'Tue', amount: 650 },
        { label: isAr ? 'الأربعاء' : 'Wed', amount: 290 },
        { label: isAr ? 'الخميس' : 'Thu', amount: 840 },
        { label: isAr ? 'الجمعة' : 'Fri', amount: 510 },
        { label: isAr ? 'السبت' : 'Sat', amount: 330 },
      ],
    },
    MONTH: {
      totalSpent: 14850,
      previousPeriodSpent: 16950,
      deltaPercent: -12.4,
      dailyAverage: 495,
      budgetLimit: 18000,
      periodNameEn: 'September 2026',
      periodNameAr: 'سبتمبر ٢٠٢٦',
      chartData: [
        { label: isAr ? 'أسبوع ١' : 'W1', amount: 3650 },
        { label: isAr ? 'أسبوع ٢' : 'W2', amount: 4820 },
        { label: isAr ? 'أسبوع ٣' : 'W3', amount: 3280 },
        { label: isAr ? 'أسبوع ٤' : 'W4', amount: 3100 },
      ],
    },
    YEAR: {
      totalSpent: 162400,
      previousPeriodSpent: 178000,
      deltaPercent: -8.7,
      dailyAverage: 445,
      budgetLimit: 200000,
      periodNameEn: 'Year 2026',
      periodNameAr: 'عام ٢٠٢٦',
      chartData: [
        { label: isAr ? 'يناير' : 'Jan', amount: 12400 },
        { label: isAr ? 'فبراير' : 'Feb', amount: 13100 },
        { label: isAr ? 'مارس' : 'Mar', amount: 16500 },
        { label: isAr ? 'أبريل' : 'Apr', amount: 14200 },
        { label: isAr ? 'مايو' : 'May', amount: 13900 },
        { label: isAr ? 'يونيو' : 'Jun', amount: 15400 },
        { label: isAr ? 'يوليو' : 'Jul', amount: 14800 },
        { label: isAr ? 'أغسطس' : 'Aug', amount: 13800 },
        { label: isAr ? 'سبتمبر' : 'Sep', amount: 14850 },
      ],
    },
  };

  const currentData = periodData[selectedPeriod];

  // Dynamic Category breakdown datasets per period to reflect true data changes
  const periodCategories: Record<PeriodType, CategoryData[]> = {
    DAY: [
      {
        id: 'food',
        nameEn: 'Food & Dining',
        nameAr: 'المطاعم والمقاهي',
        amount: 210,
        percentage: 50,
        txnCount: 3,
        color: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.1)',
        icon: <Utensils size={18} color="#f97316" />,
        merchants: ['Barns Coffee', 'Half Million', 'Al Baik'],
      },
      {
        id: 'transport',
        nameEn: 'Transport & Fuel',
        nameAr: 'المواصلات والوقود',
        amount: 105,
        percentage: 25,
        txnCount: 2,
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: <Car size={18} color="#10b981" />,
        merchants: ['Uber KSA', 'Aldrees Petroleum'],
      },
      {
        id: 'shopping',
        nameEn: 'Shopping & Retail',
        nameAr: 'التسوق والتجزئة',
        amount: 63,
        percentage: 15,
        txnCount: 1,
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.1)',
        icon: <ShoppingBag size={18} color="#a855f7" />,
        merchants: ['Panda Hypermarket'],
      },
      {
        id: 'health',
        nameEn: 'Health & Wellness',
        nameAr: 'الصحة والعافية',
        amount: 42,
        percentage: 10,
        txnCount: 1,
        color: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.1)',
        icon: <HeartPulse size={18} color="#ec4899" />,
        merchants: ['Nahdi Pharmacy'],
      },
    ],
    WEEK: [
      {
        id: 'food',
        nameEn: 'Food & Dining',
        nameAr: 'المطاعم والمقاهي',
        amount: 1368,
        percentage: 40,
        txnCount: 12,
        color: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.1)',
        icon: <Utensils size={18} color="#f97316" />,
        merchants: ['Al Baik', 'Barns Coffee', 'McDonalds'],
      },
      {
        id: 'shopping',
        nameEn: 'Shopping & Retail',
        nameAr: 'التسوق والتجزئة',
        amount: 1026,
        percentage: 30,
        txnCount: 5,
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.1)',
        icon: <ShoppingBag size={18} color="#a855f7" />,
        merchants: ['Jarir Bookstore', 'Amazon.sa', 'Panda'],
      },
      {
        id: 'transport',
        nameEn: 'Transport & Fuel',
        nameAr: 'المواصلات والوقود',
        amount: 513,
        percentage: 15,
        txnCount: 6,
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: <Car size={18} color="#10b981" />,
        merchants: ['Aldrees Petroleum', 'Careem'],
      },
      {
        id: 'health',
        nameEn: 'Health & Wellness',
        nameAr: 'الصحة والعافية',
        amount: 342,
        percentage: 10,
        txnCount: 2,
        color: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.1)',
        icon: <HeartPulse size={18} color="#ec4899" />,
        merchants: ['Nahdi Pharmacy'],
      },
      {
        id: 'transfers',
        nameEn: 'P2P & Sarie Transfers',
        nameAr: 'تحويلات سريع والأفراد',
        amount: 171,
        percentage: 5,
        txnCount: 2,
        color: '#14b8a6',
        bgColor: 'rgba(20, 184, 166, 0.1)',
        icon: <Send size={18} color="#14b8a6" />,
        merchants: ['Sarie Instant Transfers'],
      },
    ],
    MONTH: [
      {
        id: 'bills',
        nameEn: 'Bills & Utilities',
        nameAr: 'الفواتير والخدمات',
        amount: 5198,
        percentage: 35,
        txnCount: 4,
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        icon: <Zap size={18} color="#3b82f6" />,
        merchants: ['Saudi Electricity Co.', 'STC Pay', 'National Water Co.'],
      },
      {
        id: 'food',
        nameEn: 'Food & Dining',
        nameAr: 'المطاعم والمقاهي',
        amount: 3712,
        percentage: 25,
        txnCount: 24,
        color: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.1)',
        icon: <Utensils size={18} color="#f97316" />,
        merchants: ['Al Baik', 'Barns Coffee', 'Half Million', 'McDonalds'],
      },
      {
        id: 'shopping',
        nameEn: 'Shopping & Retail',
        nameAr: 'التسوق والتجزئة',
        amount: 2970,
        percentage: 20,
        txnCount: 12,
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.1)',
        icon: <ShoppingBag size={18} color="#a855f7" />,
        merchants: ['Panda Hypermarket', 'Jarir Bookstore', 'Noon KSA', 'Amazon.sa'],
      },
      {
        id: 'transport',
        nameEn: 'Transport & Fuel',
        nameAr: 'المواصلات والوقود',
        amount: 1485,
        percentage: 10,
        txnCount: 15,
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: <Car size={18} color="#10b981" />,
        merchants: ['Aldrees Petroleum', 'Uber KSA', 'Careem'],
      },
      {
        id: 'health',
        nameEn: 'Health & Wellness',
        nameAr: 'الصحة والعافية',
        amount: 891,
        percentage: 6,
        txnCount: 3,
        color: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.1)',
        icon: <HeartPulse size={18} color="#ec4899" />,
        merchants: ['Nahdi Pharmacy', 'Al Habib Hospital'],
      },
      {
        id: 'transfers',
        nameEn: 'P2P & Sarie Transfers',
        nameAr: 'تحويلات سريع والأفراد',
        amount: 594,
        percentage: 4,
        txnCount: 6,
        color: '#14b8a6',
        bgColor: 'rgba(20, 184, 166, 0.1)',
        icon: <Send size={18} color="#14b8a6" />,
        merchants: ['Sarie Instant Transfers'],
      },
    ],
    YEAR: [
      {
        id: 'shopping',
        nameEn: 'Shopping & Retail',
        nameAr: 'التسوق والتجزئة',
        amount: 48720,
        percentage: 30,
        txnCount: 78,
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.1)',
        icon: <ShoppingBag size={18} color="#a855f7" />,
        merchants: ['Jarir Bookstore', 'Amazon.sa', 'Noon KSA', 'Panda'],
      },
      {
        id: 'bills',
        nameEn: 'Bills & Utilities',
        nameAr: 'الفواتير والخدمات',
        amount: 40600,
        percentage: 25,
        txnCount: 48,
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        icon: <Zap size={18} color="#3b82f6" />,
        merchants: ['Saudi Electricity Co.', 'STC Pay', 'National Water Co.'],
      },
      {
        id: 'food',
        nameEn: 'Food & Dining',
        nameAr: 'المطاعم والمقاهي',
        amount: 32480,
        percentage: 20,
        txnCount: 140,
        color: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.1)',
        icon: <Utensils size={18} color="#f97316" />,
        merchants: ['Al Baik', 'Barns Coffee', 'Half Million', 'McDonalds'],
      },
      {
        id: 'transport',
        nameEn: 'Transport & Fuel',
        nameAr: 'المواصلات والوقود',
        amount: 24360,
        percentage: 15,
        txnCount: 95,
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: <Car size={18} color="#10b981" />,
        merchants: ['Aldrees Petroleum', 'Uber KSA', 'Careem'],
      },
      {
        id: 'health',
        nameEn: 'Health & Wellness',
        nameAr: 'الصحة والعافية',
        amount: 9744,
        percentage: 6,
        txnCount: 22,
        color: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.1)',
        icon: <HeartPulse size={18} color="#ec4899" />,
        merchants: ['Nahdi Pharmacy', 'Al Habib Hospital'],
      },
      {
        id: 'transfers',
        nameEn: 'P2P & Sarie Transfers',
        nameAr: 'تحويلات سريع والأفراد',
        amount: 6496,
        percentage: 4,
        txnCount: 30,
        color: '#14b8a6',
        bgColor: 'rgba(20, 184, 166, 0.1)',
        icon: <Send size={18} color="#14b8a6" />,
        merchants: ['Sarie Instant Transfers'],
      },
    ],
  };

  const categories = periodCategories[selectedPeriod];

  // Top Merchants list
  const topMerchants: MerchantData[] = [
    {
      name: 'Al Baik Restaurant',
      category: 'Food & Dining',
      categoryAr: 'مطاعم',
      amount: 480,
      txnCount: 6,
      icon: <Utensils size={17} />,
      iconBg: 'rgba(249, 115, 22, 0.12)',
      iconColor: '#f97316',
    },
    {
      name: 'Panda Hypermarket',
      category: 'Groceries & Retail',
      categoryAr: 'بقالة وتسوق',
      amount: 1450,
      txnCount: 4,
      icon: <Store size={17} />,
      iconBg: 'rgba(168, 85, 247, 0.12)',
      iconColor: '#a855f7',
    },
    {
      name: 'Saudi Electricity Company (SEC)',
      category: 'Utilities',
      categoryAr: 'فواتير',
      amount: 850,
      txnCount: 1,
      icon: <Zap size={17} />,
      iconBg: 'rgba(59, 130, 246, 0.12)',
      iconColor: '#3b82f6',
    },
    {
      name: 'Jarir Bookstore',
      category: 'Electronics & Books',
      categoryAr: 'إلكترونيات وكتب',
      amount: 1890,
      txnCount: 2,
      icon: <BookOpen size={17} />,
      iconBg: 'rgba(234, 179, 8, 0.12)',
      iconColor: '#eab308',
    },
    {
      name: 'Aldrees Gas Station',
      category: 'Fuel',
      categoryAr: 'وقود ومحطات',
      amount: 340,
      txnCount: 5,
      icon: <Car size={17} />,
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: '#10b981',
    },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const msg = isAr ? 'تم تصدير كشف الحساب والتحليل المالي بنجاح' : 'Statement & Financial Analysis exported successfully';
      setExportToast(msg);
      setTimeout(() => setExportToast(null), 3500);
    }, 1200);
  };

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#07090e',
        minHeight: '100vh',
        paddingBottom: '100px',
        color: '#f8fafc',
      }}
    >
      {/* 1. App Header */}
      <AppHeader
        title={isAr ? 'تحليل المصاريف' : 'Spend Analysis'}
        showBack={true}
        showSettings={true}
      />

      {/* Export Toast Notification */}
      {exportToast && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            top: '72px',
            left: '20px',
            right: '20px',
            maxWidth: '520px',
            margin: '0 auto',
            zIndex: 100,
            backgroundColor: '#0f1623',
            border: '1px solid #10b981',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{exportToast}</span>
        </div>
      )}

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 2. Period Selector (Day / Week / Month / Year) */}
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onSelectPeriod={(p) => {
            setSelectedPeriod(p);
            setSelectedCategory(null);
          }}
          isAr={isAr}
        />

        {/* 3. Spend Overview Card with Budget Progress Bar */}
        <SpendOverviewCard
          data={currentData}
          isExporting={isExporting}
          onExport={handleExport}
          language={language}
        />

        {/* 4. Donut Chart with Category Breakdown */}
        <SpendDonutCard
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalSpent={currentData.totalSpent}
          language={language}
        />

        {/* 5. Timeline Bar Graph */}
        <SpendBarChart
          chartData={currentData.chartData}
          hoveredIndex={hoveredBarIndex}
          onHoverIndex={setHoveredBarIndex}
          language={language}
        />

        {/* 6. Itemized Category Details List */}
        <CategoryBreakdownList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          language={language}
          isRtl={isRtl}
        />

        {/* 7. Top Merchants List */}
        <TopMerchantsList
          merchants={topMerchants}
          language={language}
          isRtl={isRtl}
        />

        {/* 8. Smart Financial Insights & Shortcuts */}
        <SmartInsightsCard deltaPercent={currentData.deltaPercent} />
      </div>
    </div>
  );
};
