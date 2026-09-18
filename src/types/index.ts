export interface User {
  name: string;
  avatarInitials: string;
  avatarUrl?: string;
  avatarBgColor?: string;
  upiId: string;
  mobile: string;
  email: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumberMasked: string;
  isPrimary: boolean;
  balance: number;
  showBalance?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  upiId: string;
  mobile: string;
  avatarInitials: string;
}

export interface Transaction {
  id: string;
  title: string;
  subTitle?: string;
  amount: number;
  type: 'sent' | 'received' | 'pending';
  date: string;
  timestamp: Date;
  utr: string;
  accountUsed?: string;
  category?: string;
  avatarInitials?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'success' | 'info' | 'alert';
}

export interface ElectricityBill {
  consumerNumber: string;
  providerName: string;
  amount: number;
  dueDate: string;
  billDate: string;
  isPaid: boolean;
}

export interface MoneyRequest {
  id: string;
  requesterName: string;
  upiId: string;
  amount: number;
  note?: string;
  date: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'browser';
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SplitMember {
  id: string;
  name: string;
  upiId: string;
  avatarInitials: string;
  amount: number;
  hasPaid: boolean;
}

export interface SplitExpense {
  id: string;
  title: string;
  totalAmount: number;
  creatorUpiId: string;
  date: string;
  timestamp: Date;
  status: 'active' | 'settled';
  members: SplitMember[];
}

export interface TransferLimits {
  dailyLimit: number;
  dailyUsed: number;
  perTransactionLimit: number;
  monthlyLimit: number;
  monthlyUsed: number;
  contactlessLimit: number;
}

export type ScreenId =
  | 'SPLASH'
  | 'ONBOARDING'
  | 'MOBILE_NUMBER'
  | 'SMS_OTP'
  | 'SET_PIN'
  | 'PERMISSIONS'
  | 'ONBOARDING_KYC'
  | 'ONBOARDING_BANK'
  | 'HOME'
  | 'SPEND_ANALYSIS'
  | 'PAY_ANYONE'
  | 'SEND_AMOUNT'
  | 'ELECTRICITY'
  | 'PAYMENT_SUCCESS'
  | 'HISTORY'
  | 'RECEIVE'
  | 'SCAN'
  | 'REQUEST_MONEY'
  | 'SPLIT_EXPENSES'
  | 'PROFILE'
  | 'BANK_ACCOUNTS'
  | 'TRANSFER_LIMITS'
  | 'UPI_SETTINGS'
  | 'PAYMENT_METHODS'
  | 'SECURITY'
  | 'NOTIFICATIONS'
  | 'ALL_SERVICES'
  | 'MONEY_REQUESTS'
  | 'HELP_SUPPORT'
  | 'PRIVACY'
  | 'SHOPPING'
  | 'TRAVEL'
  | 'REWARDS'
  | 'FOOD';

export type BottomTab = 'home' | 'spend' | 'account' | 'pay' | 'scan' | 'history' | 'profile';



