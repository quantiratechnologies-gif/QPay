import React from 'react';

export type PeriodType = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface CategoryData {
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

export interface MerchantData {
  name: string;
  category: string;
  categoryAr: string;
  amount: number;
  txnCount: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export interface ChartDataPoint {
  label: string;
  amount: number;
}

export interface PeriodSummary {
  totalSpent: number;
  previousPeriodSpent: number;
  deltaPercent: number;
  dailyAverage: number;
  budgetLimit: number;
  periodNameEn: string;
  periodNameAr: string;
  chartData: ChartDataPoint[];
}
