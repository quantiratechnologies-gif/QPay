import React, { useState } from 'react';
import {
  TrendingDown,
  Download,
  Utensils,
  ShoppingBag,
  Zap,
  Car,
  HeartPulse,
  Send,
  PieChart as PieChartIcon,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Building2,
  BookOpen,
  Store,
  Lightbulb,
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { formatCurrency } from '../utils/formatters';

type PeriodType = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

interface CategoryData {
  id: string;
  nameEn: string;
  nameAr: string;
  amount: number;
  percentage: number;
  txnCount: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  merchants: string[];
}

interface MerchantData {
  name: string;
  category: string;
  categoryAr: string;
  amount: number;
  txnCount: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export const SpendAnalysisScreen: React.FC = () => {
  const { navigateTo, language, isRtl } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('MONTH');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Period-specific dynamic data
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
        { label: language === 'العربية' ? 'الصباح' : 'Morning', amount: 120 },
        { label: language === 'العربية' ? 'الظهر' : 'Noon', amount: 80 },
        { label: language === 'العربية' ? 'المساء' : 'Evening', amount: 220 },
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
        { label: language === 'العربية' ? 'الأحد' : 'Sun', amount: 420 },
        { label: language === 'العربية' ? 'الإثنين' : 'Mon', amount: 380 },
        { label: language === 'العربية' ? 'الثلاثاء' : 'Tue', amount: 650 },
        { label: language === 'العربية' ? 'الأربعاء' : 'Wed', amount: 290 },
        { label: language === 'العربية' ? 'الخميس' : 'Thu', amount: 840 },
        { label: language === 'العربية' ? 'الجمعة' : 'Fri', amount: 510 },
        { label: language === 'العربية' ? 'السبت' : 'Sat', amount: 330 },
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
        { label: language === 'العربية' ? 'أسبوع ١' : 'W1', amount: 3450 },
        { label: language === 'العربية' ? 'أسبوع ٢' : 'W2', amount: 4820 },
        { label: language === 'العربية' ? 'أسبوع ٣' : 'W3', amount: 2980 },
        { label: language === 'العربية' ? 'أسبوع ٤' : 'W4', amount: 3600 },
      ],
    },
    LAST_MONTH: {
      totalSpent: 16950,
      previousPeriodSpent: 18200,
      deltaPercent: -6.8,
      dailyAverage: 546.7,
      budgetLimit: 18000,
      periodNameEn: 'August 2026',
      periodNameAr: 'أغسطس ٢٠٢٦',
      chartData: [
        { label: language === 'العربية' ? 'أسبوع ١' : 'W1', amount: 4100 },
        { label: language === 'العربية' ? 'أسبوع ٢' : 'W2', amount: 4650 },
        { label: language === 'العربية' ? 'أسبوع ٣' : 'W3', amount: 3900 },
        { label: language === 'العربية' ? 'أسبوع ٤' : 'W4', amount: 4300 },
      ],
    },
    YEAR: {
      totalSpent: 138400,
      previousPeriodSpent: 152000,
      deltaPercent: -8.9,
      dailyAverage: 532,
      budgetLimit: 180000,
      periodNameEn: 'Year 2026',
      periodNameAr: 'عام ٢٠٢٦',
      chartData: [
        { label: language === 'العربية' ? 'يناير' : 'Jan', amount: 14500 },
        { label: language === 'العربية' ? 'فبراير' : 'Feb', amount: 15200 },
        { label: language === 'العربية' ? 'مارس' : 'Mar', amount: 16800 },
        { label: language === 'العربية' ? 'أبريل' : 'Apr', amount: 17400 },
        { label: language === 'العربية' ? 'مايو' : 'May', amount: 14200 },
        { label: language === 'العربية' ? 'يونيو' : 'Jun', amount: 15100 },
        { label: language === 'العربية' ? 'يوليو' : 'Jul', amount: 14800 },
        { label: language === 'العربية' ? 'أغسطس' : 'Aug', amount: 16950 },
        { label: language === 'العربية' ? 'سبتمبر' : 'Sep', amount: 14850 },
      ],
    },
  };

  const currentData = periodData[selectedPeriod];
  const budgetProgress = Math.min(100, Math.round((currentData.totalSpent / currentData.budgetLimit) * 100));
  const remainingBudget = Math.max(0, currentData.budgetLimit - currentData.totalSpent);

  // Distinct Color Wheel Palette for Segments
  // --c1: #3b82f6 (Blue - Shopping)
  // --c2: #10b981 (Emerald - Food)
  // --c3: #f59e0b (Amber - Bills)
  // --c4: #ec4899 (Pink - Travel)
  // --c5: #8b5cf6 (Purple - Transfers)
  // --c6: #06b6d4 (Cyan - Health)
  const categories: CategoryData[] = [
    {
      id: 'shopping',
      nameEn: 'Shopping',
      nameAr: 'التسوق',
      amount: selectedPeriod === 'DAY' ? Math.round(950 / 7) : selectedPeriod === 'WEEK' ? 950 : selectedPeriod === 'YEAR' ? 38600 : 4200,
      percentage: 28,
      txnCount: selectedPeriod === 'DAY' ? 1 : selectedPeriod === 'WEEK' ? 3 : 14,
      color: '#3b82f6', // Blue - Shopping
      bgColor: 'rgba(59, 130, 246, 0.16)',
      icon: <ShoppingBag size={14} color="#3b82f6" />,
      merchants: ['Jarir Bookstore', 'Amazon SA', 'Noon'],
    },
    {
      id: 'food',
      nameEn: 'Food',
      nameAr: 'المطاعم',
      amount: selectedPeriod === 'DAY' ? Math.round(880 / 7) : selectedPeriod === 'WEEK' ? 880 : selectedPeriod === 'YEAR' ? 35200 : 3850,
      percentage: 26,
      txnCount: selectedPeriod === 'DAY' ? 1 : selectedPeriod === 'WEEK' ? 6 : 28,
      color: '#10b981', // Emerald - Food
      bgColor: 'rgba(16, 185, 129, 0.16)',
      icon: <Utensils size={14} color="#10b981" />,
      merchants: ['HungerStation', 'Jahez', 'Al Baik'],
    },
    {
      id: 'bills',
      nameEn: 'Bills',
      nameAr: 'الفواتير',
      amount: selectedPeriod === 'DAY' ? Math.round(520 / 7) : selectedPeriod === 'WEEK' ? 520 : selectedPeriod === 'YEAR' ? 24500 : 2450,
      percentage: 16,
      txnCount: selectedPeriod === 'DAY' ? 1 : selectedPeriod === 'WEEK' ? 1 : 5,
      color: '#f59e0b', // Amber - Bills
      bgColor: 'rgba(245, 158, 11, 0.16)',
      icon: <Zap size={14} color="#f59e0b" />,
      merchants: ['Saudi Electricity Co.', 'STC Pay'],
    },
    {
      id: 'travel',
      nameEn: 'Travel',
      nameAr: 'السفر',
      amount: selectedPeriod === 'DAY' ? Math.round(440 / 7) : selectedPeriod === 'WEEK' ? 440 : selectedPeriod === 'YEAR' ? 18400 : 1920,
      percentage: 13,
      txnCount: selectedPeriod === 'DAY' ? 1 : selectedPeriod === 'WEEK' ? 4 : 12,
      color: '#ec4899', // Pink - Travel
      bgColor: 'rgba(236, 72, 153, 0.16)',
      icon: <Car size={14} color="#ec4899" />,
      merchants: ['Uber Riyadh', 'Aramco Fuel'],
    },
    {
      id: 'transfers',
      nameEn: 'Transfers',
      nameAr: 'التحويلات',
      amount: selectedPeriod === 'DAY' ? Math.round(380 / 7) : selectedPeriod === 'WEEK' ? 380 : selectedPeriod === 'YEAR' ? 11700 : 1250,
      percentage: 9,
      txnCount: selectedPeriod === 'DAY' ? 1 : selectedPeriod === 'WEEK' ? 2 : 8,
      color: '#8b5cf6', // Purple - Transfers
      bgColor: 'rgba(139, 92, 246, 0.16)',
      icon: <Send size={14} color="#8b5cf6" />,
      merchants: ['Sarie Transfer', 'Apple Services'],
    },
    {
      id: 'health',
      nameEn: 'Health',
      nameAr: 'الصحة',
      amount: selectedPeriod === 'DAY' ? Math.round(250 / 7) : selectedPeriod === 'WEEK' ? 250 : selectedPeriod === 'YEAR' ? 10000 : 1180,
      percentage: 8,
      txnCount: selectedPeriod === 'DAY' ? 1 : selectedPeriod === 'WEEK' ? 1 : 4,
      color: '#06b6d4', // Cyan - Health
      bgColor: 'rgba(6, 182, 212, 0.16)',
      icon: <HeartPulse size={14} color="#06b6d4" />,
      merchants: ['Nahdi Pharmacy', 'Dr. Sulaiman Al-Habib'],
    },
  ];

  const topMerchants: MerchantData[] = [
    {
      name: language === 'العربية' ? 'الشركة السعودية للكهرباء (SEC)' : 'Saudi Electricity Co.',
      category: 'Bills & Utilities',
      categoryAr: 'الفواتير والخدمات',
      amount: 1450,
      txnCount: 2,
      icon: <Zap size={18} color="#f59e0b" />,
      iconBg: 'rgba(245, 158, 11, 0.16)',
      iconColor: '#f59e0b',
    },
    {
      name: language === 'العربية' ? 'مكتبة جرير' : 'Jarir Bookstore',
      category: 'Shopping & Electronics',
      categoryAr: 'التسوق والإلكترونيات',
      amount: 1280,
      txnCount: 3,
      icon: <BookOpen size={18} color="#3b82f6" />,
      iconBg: 'rgba(59, 130, 246, 0.16)',
      iconColor: '#3b82f6',
    },
    {
      name: language === 'العربية' ? 'لولو هايبرماركت' : 'Lulu Hypermarket',
      category: 'Groceries & Retail',
      categoryAr: 'التموينات والتجزئة',
      amount: 980,
      txnCount: 4,
      icon: <Store size={18} color="#10b981" />,
      iconBg: 'rgba(16, 185, 129, 0.16)',
      iconColor: '#10b981',
    },
    {
      name: language === 'العربية' ? 'هنقرستيشن' : 'HungerStation',
      category: 'Food Delivery',
      categoryAr: 'توصيل الطعام',
      amount: 740,
      txnCount: 8,
      icon: <Utensils size={18} color="#10b981" />,
      iconBg: 'rgba(16, 185, 129, 0.16)',
      iconColor: '#10b981',
    },
    {
      name: language === 'العربية' ? 'صيدليات النهدي' : 'Nahdi Pharmacy',
      category: 'Health & Wellness',
      categoryAr: 'الصحة والعناية',
      amount: 620,
      txnCount: 3,
      icon: <HeartPulse size={18} color="#06b6d4" />,
      iconBg: 'rgba(6, 182, 212, 0.16)',
      iconColor: '#06b6d4',
    },
  ];

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);
  const filteredCategories = selectedCategory
    ? categories.filter((c) => c.id === selectedCategory)
    : categories;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportToast(
        language === 'العربية'
          ? 'تم تصدير تقرير المصروفات (PDF/CSV) بنجاح'
          : 'Spend statement exported successfully (PDF/CSV)'
      );
      setTimeout(() => setExportToast(null), 3500);
    }, 900);
  };

  // Bar scale calculation
  const maxChartAmount = Math.max(...currentData.chartData.map((d) => d.amount));

  // Compute conic gradient segments for Donut chart
  let currentPercent = 0;
  const conicGradientSegments = categories.map((cat) => {
    const start = currentPercent;
    const end = currentPercent + cat.percentage;
    currentPercent = end;
    return `${cat.color} ${start}% ${end}%`;
  }).join(', ');
  const conicGradientStyle = `conic-gradient(${conicGradientSegments})`;

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
      {/* App Header */}
      <AppHeader
        title={language === 'العربية' ? 'تحليل المصاريف' : 'Spend Analysis'}
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
        {/* Period Selector Pills */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#0f1623',
            border: '1px solid #1e293b',
            borderRadius: '14px',
            padding: '3px',
            gap: '3px',
          }}
        >
          {(
            [
              { id: 'DAY', labelEn: 'Day', labelAr: 'يوم' },
              { id: 'WEEK', labelEn: 'Week', labelAr: 'أسبوع' },
              { id: 'MONTH', labelEn: 'Month', labelAr: 'شهر' },
              { id: 'YEAR', labelEn: 'Year', labelAr: 'سنة' },
            ] as const
          ).map((item) => {
            const isActive = selectedPeriod === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedPeriod(item.id);
                  setSelectedCategory(null);
                }}
                className="interactive-tap"
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '11px',
                  border: 'none',
                  backgroundColor: isActive ? '#10b981' : 'transparent',
                  color: isActive ? '#080C14' : '#64748b',
                  fontSize: '12px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}
              >
                {language === 'العربية' ? item.labelAr : item.labelEn}
              </button>
            );
          })}
        </div>

        {/* Card 1: Total Spending (Inspiration UI) */}
        <div
          className="card"
          style={{
            backgroundColor: '#0f1623',
            border: '1px solid #1e293b',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11'", fontWeight: 700, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>
                {language === 'العربية' ? 'إجمالي المصروفات' : 'Total Spending'}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {language === 'العربية' ? currentData.periodNameAr : currentData.periodNameEn}
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-action interactive-tap"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid #1e293b',
                color: '#f8fafc',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <Download size={14} />
              <span>{isExporting ? (language === 'العربية' ? 'جاري...' : 'Exporting...') : (language === 'العربية' ? 'تصدير' : 'Export')}</span>
            </button>
          </div>

          <div className="amount-main tabular-nums" style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px', color: '#f8fafc' }}>
            {formatCurrency(currentData.totalSpent, language)}
          </div>

          <div className="badge-row" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div
              className="tag tag-green"
              style={{
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
              }}
            >
              <TrendingDown size={12} strokeWidth={2.5} />
              <span>{Math.abs(currentData.deltaPercent)}% {language === 'العربية' ? 'أقل من السابق' : 'vs last period'}</span>
            </div>
            <div
              className="tag tag-dark"
              style={{
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#64748b',
              }}
            >
              <span>{language === 'العربية' ? 'المعدل اليومي:' : 'Daily Avg:'}</span>
              <strong style={{ color: '#f8fafc', marginInlineStart: '3px' }}>
                {formatCurrency(currentData.dailyAverage, language)}
              </strong>
            </div>
          </div>

          <div className="progress-details" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
            <span>
              {language === 'العربية'
                ? `${formatCurrency(remainingBudget, language)} متبقي من الميزانية`
                : `${formatCurrency(remainingBudget, language)} remaining`}
            </span>
            <strong style={{ color: '#f8fafc' }}>{budgetProgress}%</strong>
          </div>
          <div className="progress-bar-bg" style={{ background: 'rgba(255, 255, 255, 0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              className="progress-bar-fill"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                height: '100%',
                width: `${budgetProgress}%`,
                borderRadius: '3px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Card 2: Category Distribution (Inspiration UI) */}
        <div
          className="card"
          style={{
            backgroundColor: '#0f1623',
            border: '1px solid #1e293b',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
              <PieChartIcon size={16} color="#10b981" />
              <span>{language === 'العربية' ? 'التوزيع الدائري للمصروفات' : 'Category Spend Distribution'}</span>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="interactive-tap"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {language === 'العربية' ? 'إعادة ضبط' : 'Reset'}
              </button>
            )}
          </div>

          <div
            className="donut-container"
            style={{
              position: 'relative',
              width: '160px',
              height: '160px',
              margin: '0 auto 20px auto',
              borderRadius: '50%',
              background: conicGradientStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}
          >
            <div
              className="donut-hole"
              style={{
                width: '116px',
                height: '116px',
                backgroundColor: '#0f1623',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '6px',
              }}
            >
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {selectedCategoryObj
                  ? (language === 'العربية' ? selectedCategoryObj.nameAr : selectedCategoryObj.nameEn)
                  : (language === 'العربية' ? 'المصروفات' : 'SPENT')}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 800, margin: '2px 0', color: '#f8fafc' }}>
                {selectedCategoryObj
                  ? formatCurrency(selectedCategoryObj.amount, language)
                  : (language === 'العربية' ? formatCurrency(currentData.totalSpent, language) : `SAR ${(currentData.totalSpent / 1000).toFixed(1)}K`)}
              </span>
              {selectedCategoryObj && (
                <span style={{ fontSize: '10px', fontWeight: 800, color: selectedCategoryObj.color }}>
                  {selectedCategoryObj.percentage}%
                </span>
              )}
            </div>
          </div>

          <div
            className="category-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px 16px',
              borderTop: '1px solid #1e293b',
              paddingTop: '16px',
            }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className="category-item interactive-tap"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div className="category-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', minWidth: 0 }}>
                    <span
                      className="dot"
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', color: cat.color, flexShrink: 0 }}>
                      {cat.icon}
                    </span>
                    <span style={{ color: isSelected ? '#f8fafc' : '#94a3b8', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {language === 'العربية' ? cat.nameAr : cat.nameEn}
                    </span>
                  </div>
                  <span className="category-val" style={{ fontWeight: 700, color: cat.color, marginInlineStart: '6px', flexShrink: 0 }}>
                    {cat.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. TIMELINE BAR GRAPH */}
        <div
          className="card"
          style={{
            backgroundColor: '#0f1623',
            borderRadius: '20px',
            border: '1px solid #1e293b',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={16} color="#10b981" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                {language === 'العربية' ? 'المخطط الزمني للإنفاق' : 'Timeline Spending Trend'}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {language === 'العربية' ? 'المبالغ بالريال' : 'SAR amounts'}
            </span>
          </div>

          {/* Tooltip */}
          {hoveredBarIndex !== null && (
            <div
              className="fade-in"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '6px 12px',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {currentData.chartData[hoveredBarIndex]?.label}
              </span>
              <span className="tabular-nums" style={{ fontSize: '12.5px', fontWeight: 800, color: '#10b981' }}>
                {formatCurrency(currentData.chartData[hoveredBarIndex]?.amount, language)}
              </span>
            </div>
          )}

          {/* Bars Graphic */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '130px',
              gap: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid #1e293b',
            }}
          >
            {currentData.chartData.map((bar, i) => {
              const heightPercent = Math.max(16, Math.round((bar.amount / maxChartAmount) * 100));
              const isMax = bar.amount === maxChartAmount;
              const isHovered = hoveredBarIndex === i;

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredBarIndex(i)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  onClick={() => setHoveredBarIndex(hoveredBarIndex === i ? null : i)}
                  className="interactive-tap"
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: isHovered || isMax ? '#10b981' : '#64748b',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Math.round(bar.amount)}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPercent}%`,
                      background: isHovered || isMax ? 'linear-gradient(180deg, #3b82f6 0%, #10b981 100%)' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px 6px 3px 3px',
                      transition: 'all 0.25s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: isHovered || isMax ? 800 : 500,
                      color: isHovered || isMax ? '#f8fafc' : '#64748b',
                    }}
                  >
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ITEMIZED CATEGORY BREAKDOWN */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
              {language === 'العربية' ? 'تفاصيل الفئات' : 'Category Details'}
            </span>

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {language === 'العربية' ? 'عرض الكل' : 'Show All'}
              </button>
            )}
          </div>

          <div
            className="card"
            style={{
              backgroundColor: '#0f1623',
              borderRadius: '20px',
              border: '1px solid #1e293b',
              overflow: 'hidden',
              padding: '6px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
            }}
          >
            {filteredCategories.map((cat, index) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className="interactive-tap"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    border: isSelected ? `1px solid ${cat.color}` : '1px solid transparent',
                    borderBottom: !isSelected && index < filteredCategories.length - 1 ? '1px solid #1e293b' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '11px',
                        backgroundColor: cat.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {cat.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                          {language === 'العربية' ? cat.nameAr : cat.nameEn}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '5px',
                            backgroundColor: cat.bgColor,
                            color: cat.color,
                          }}
                        >
                          {cat.percentage}%
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {cat.txnCount} {language === 'العربية' ? 'عمليات' : 'txns'} • {cat.merchants.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: isRtl ? 'left' : 'right', marginInlineStart: '12px' }}>
                    <div className="tabular-nums" style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc' }}>
                      {formatCurrency(cat.amount, language)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. TOP MERCHANTS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Building2 size={15} color="#10b981" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
              {language === 'العربية' ? 'أعلى المتاجر إنفاقاً' : 'Top Merchants'}
            </span>
          </div>

          <div
            className="card"
            style={{
              backgroundColor: '#0f1623',
              borderRadius: '20px',
              border: '1px solid #1e293b',
              overflow: 'hidden',
              padding: '6px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
            }}
          >
            {topMerchants.map((merchant, index) => (
              <div
                key={merchant.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderBottom: index < topMerchants.length - 1 ? '1px solid #1e293b' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '11px',
                      backgroundColor: merchant.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {merchant.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {merchant.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '1px' }}>
                      {language === 'العربية' ? merchant.categoryAr : merchant.category} • {merchant.txnCount} {language === 'العربية' ? 'مدفوعات' : 'txns'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: isRtl ? 'left' : 'right', marginInlineStart: '10px' }}>
                  <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                    {formatCurrency(merchant.amount, language)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. SMART INSIGHT */}
        <div
          style={{
            backgroundColor: '#0f1623',
            borderRadius: '18px',
            border: '1px solid #1e293b',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lightbulb size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.45' }}>
            {language === 'العربية'
              ? 'وفرت ١٢.٤٪ في مصاريف هذا الشهر مقارنة بالشهر السابق. استمر في هذا الأداء الرائع!'
              : 'You spent 12.4% less this month compared to last month. Keep up the great pace!'}
          </div>
        </div>

        {/* 6. MANAGE BANK ACCOUNTS LINK */}
        <div
          onClick={() => navigateTo('BANK_ACCOUNTS')}
          className="interactive-tap"
          style={{
            backgroundColor: '#0f1623',
            borderRadius: '18px',
            border: '1px solid #1e293b',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={18} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {language === 'العربية' ? 'الحسابات البنكية المرتبطة' : 'Linked Bank Accounts'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {language === 'العربية' ? 'عرض أرصدة وبطاقات البنوك السعودية' : 'View Saudi bank cards & balances'}
              </div>
            </div>
          </div>

          <ChevronRight size={18} color="#64748b" style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
        </div>
      </div>
    </div>
  );
};
