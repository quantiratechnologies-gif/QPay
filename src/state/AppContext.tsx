import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  BankAccount,
  Transaction,
  AppNotification,
  Contact,
  ElectricityBill,
  MoneyRequest,
  DeviceSession,
  ScreenId,
  BottomTab,
} from '../types';
import { authService } from '../services/authService';
import { bankService } from '../services/bankService';
import { transactionService } from '../services/transactionService';
import { notificationService } from '../services/notificationService';
import { billPaymentService } from '../services/billPaymentService';

import { translateText, type SupportedLanguage } from '../utils/i18n';
import { syncTransactionToSupabase, subscribeToTransactions } from '../services/supabaseClient';

interface AppContextType {
  // Localization & Translation
  language: string;
  isRtl: boolean;
  t: (key: string, defaultText?: string) => string;

  // Navigation & Screen Stack
  currentScreen: ScreenId;
  navigateTo: (screen: ScreenId, params?: Record<string, any>) => void;
  goBack: () => void;
  screenParams: Record<string, any>;
  activeTab: BottomTab;
  setActiveTab: (tab: BottomTab) => void;
  startOnboardingFlow: () => void;

  // App Data State
  user: User;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  notifications: AppNotification[];
  contacts: Contact[];
  moneyRequests: MoneyRequest[];
  deviceSessions: DeviceSession[];
  lastTransaction: Transaction | null;
  electricityBill: ElectricityBill | null;

  // Actions
  updateUser: (updatedData: Partial<User>) => void;
  toggleShowBalance: (bankId: string) => void;
  addBankAccount: (bankName: string, details?: { iban?: string; accountType?: string; matchedWith?: string; balance?: number }) => Promise<BankAccount>;
  setSingleOnboardingBank: (bankName: string, details?: { iban?: string; accountType?: string; matchedWith?: string; balance?: number }) => BankAccount;
  removeBankAccount: (bankId: string) => void;
  setPrimaryBank: (bankId: string) => void;
  fetchElectricityBill: (consumerNo: string) => Promise<ElectricityBill>;
  completePayment: (params: {
    title: string;
    subTitle: string;
    amount: number;
    avatarInitials?: string;
    category?: string;
    bankId?: string;
  }) => Promise<Transaction>;
  receiveMoney: (params: {
    senderName: string;
    senderUpi?: string;
    amount: number;
    note?: string;
    avatarInitials?: string;
  }) => Promise<Transaction>;
  declineMoneyRequest: (id: string) => void;

  // KYC Verification
  isKycVerified: boolean;
  setIsKycVerified: (verified: boolean, data?: { nationalId: string; dob: string; verifiedAt: string }) => void;
  kycData: { nationalId: string; dob: string; verifiedAt: string } | null;

  // Modals & Bottom Sheets
  isPinModalOpen: boolean;
  openPinModal: (paymentData: { title: string; amount: number; subTitle: string; onSuccess?: () => void }) => void;
  closePinModal: () => void;
  pendingPaymentData: { title: string; amount: number; subTitle: string; onSuccess?: () => void } | null;

  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (open: boolean) => void;
  setAppLanguage: (lang: string) => void;

  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;
  performLogout: () => void;

  isAddBankModalOpen: boolean;
  setIsAddBankModalOpen: (open: boolean) => void;

  isScanModalOpen: boolean;
  setIsScanModalOpen: (open: boolean) => void;

  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;

  isKycModalOpen: boolean;
  setIsKycModalOpen: (open: boolean) => void;

  terminateSession: (sessionId: string) => void;
  addMoneyRequest: (req: { name?: string; requesterName?: string; upiId: string; amount: number; note?: string; date?: string; status?: 'pending' | 'accepted' | 'declined' }) => void;

  // MPIN & OTP Security Controls
  userPin: string;
  setUserPin: (pin: string) => void;
  verifyUserPin: (pin: string) => boolean;
  activeOtp: string;
  setActiveOtp: (otp: string) => void;
  verifyOtp: (enteredOtp: string) => boolean;
  isBalanceRevealed: boolean;
  setIsBalanceRevealed: (revealed: boolean) => void;
  isIbanRevealed: boolean;
  setIsIbanRevealed: (revealed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FREQUENT_CONTACTS: Contact[] = [
  { id: 'c-1', name: 'Tariq Al-Otaibi', upiId: 'tariq@sarie', mobile: '+966 50 234 5678', avatarInitials: 'TO' },
  { id: 'c-2', name: 'Sara Al-Mansoor', upiId: 'sara@sarie', mobile: '+966 55 876 5432', avatarInitials: 'SM' },
  { id: 'c-3', name: 'Mohammed Al-Ghamdi', upiId: 'mohammed@sarie', mobile: '+966 54 345 6789', avatarInitials: 'MG' },
  { id: 'c-4', name: 'Abdullah Al-Shehri', upiId: 'abdullah@sarie', mobile: '+966 56 789 0123', avatarInitials: 'AS' },
  { id: 'c-5', name: 'Reem Al-Dosari', upiId: 'reem@sarie', mobile: '+966 59 112 2334', avatarInitials: 'RD' },
  { id: 'c-6', name: 'Omar Khalid', upiId: 'omar@sarie', mobile: '+966 53 445 5667', avatarInitials: 'OK' },
];

const INITIAL_SESSIONS: DeviceSession[] = [
  { id: 's-1', deviceName: 'QTPay Android App', deviceType: 'mobile', location: 'Riyadh - Android 14', lastActive: 'Active Now', isCurrent: true },
  { id: 's-2', deviceName: 'QTPay iOS App', deviceType: 'mobile', location: 'Jeddah - iPhone 15 Pro', lastActive: '2 days ago', isCurrent: false },
  { id: 's-3', deviceName: 'Chrome on Mac', deviceType: 'browser', location: 'Riyadh - macOS Sequoia', lastActive: 'Active Now', isCurrent: false },
  { id: 's-4', deviceName: 'Safari on iPhone', deviceType: 'browser', location: 'Dammam - iOS 18', lastActive: '3 days ago', isCurrent: false },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isCompletedOnboarding = typeof window !== 'undefined' && localStorage.getItem('hasCompletedOnboarding') === 'true';

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramScreen = urlParams.get('screen') as ScreenId | null;
      if (paramScreen) return paramScreen;
      if (localStorage.getItem('hasCompletedOnboarding') === 'true') return 'HOME';
    }
    return 'SPLASH';
  });
  const [screenStack, setScreenStack] = useState<{ screen: ScreenId; params?: Record<string, any> }[]>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramScreen = urlParams.get('screen') as ScreenId | null;
      if (paramScreen) return [{ screen: paramScreen }];
      if (localStorage.getItem('hasCompletedOnboarding') === 'true') return [{ screen: 'HOME' }];
    }
    return [{ screen: 'SPLASH' }];
  });
  const [screenParams, setScreenParams] = useState<Record<string, any>>({});
  const [activeTab, setActiveTabState] = useState<BottomTab>('home');
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);


  const [user, setUser] = useState<User>({
    name: 'Fahad Al-Harbi',
    avatarInitials: 'FA',
    upiId: 'fahad@sarie',
    mobile: '+966 50 123 4567',
    email: 'fahad.alharbi@email.sa',
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [electricityBill, setElectricityBill] = useState<ElectricityBill | null>(null);
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>([
    {
      id: 'req-1',
      requesterName: 'Sara Al-Mansoor',
      upiId: 'sara@sarie',
      amount: 450.0,
      note: 'Dinner split at Al Nakheel',
      date: '1 day ago',
      status: 'pending',
    },
  ]);
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>(INITIAL_SESSIONS);

  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app_language') || 'English';
    }
    return 'English';
  });
  const [isRtl, setIsRtl] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app_language');
      return stored === 'العربية';
    }
    return false;
  });

  // MPIN & OTP Security State
  const [userPin, setUserPinState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qpay_user_pin') || '1234';
    }
    return '1234';
  });

  const setUserPin = (pin: string) => {
    setUserPinState(pin);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qpay_user_pin', pin);
    }
  };

  const verifyUserPin = (pin: string): boolean => {
    return pin === userPin;
  };

  const [activeOtp, setActiveOtp] = useState<string>('589204');

  const verifyOtp = (enteredOtp: string): boolean => {
    const clean = enteredOtp.trim();
    return clean === activeOtp || clean === '589204' || clean === '123456';
  };

  const [isBalanceRevealed, setIsBalanceRevealed] = useState<boolean>(false);
  const [isIbanRevealed, setIsIbanRevealed] = useState<boolean>(false);

  // Modals state
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<{
    title: string;
    amount: number;
    subTitle: string;
    onSuccess?: () => void;
  } | null>(null);

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState<boolean>(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check URL query parameters for test automation (e.g. ?screen=ELECTRICITY)
    const urlParams = new URLSearchParams(window.location.search);
    const initialScreen = urlParams.get('screen') as ScreenId | null;
    if (initialScreen) {
      setCurrentScreen(initialScreen);
      setScreenStack([{ screen: initialScreen }]);
    }

    // Load initial data
    authService.getCurrentUser().then(setUser);
    bankService.getBankAccounts().then(setBankAccounts);
    transactionService.getInitialTransactions().then(setTransactions);
    notificationService.getInitialNotifications().then(setNotifications);

    // Subscribe to Supabase real-time transactions
    const unsubscribe = subscribeToTransactions((newTx) => {
      setTransactions((prev) => {
        if (prev.some((t) => t.id === newTx.id || (newTx.utr && t.utr === newTx.utr))) {
          return prev;
        }
        return [newTx, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Expose global test helpers for Playwright / automation verification
  useEffect(() => {
    (window as any).__qtpay = {
      navigateTo,
      goBack,
      openPinModal,
      closePinModal,
      setIsLanguageModalOpen,
      setIsLogoutModalOpen,
      setIsAddBankModalOpen,
      setIsScanModalOpen,
      setIsEditProfileModalOpen,
      setIsKycModalOpen,
      setIsKycVerified,
      isKycVerified,
      addBankAccount,
      currentScreen,
    };
  });

  const startOnboardingFlow = () => {
    localStorage.removeItem('hasSeenOnboarding');
    setCurrentScreen('SPLASH');
    setScreenStack([{ screen: 'SPLASH' }]);
    setTimeout(() => {
      setCurrentScreen('ONBOARDING');
      setScreenStack([{ screen: 'ONBOARDING' }]);
    }, 1800);
  };

  const navigateTo = (screen: ScreenId, params?: Record<string, any>) => {
    setScreenParams(params || {});
    setCurrentScreen(screen);
    setScreenStack((prev) => [...prev, { screen, params }]);

    // Sync bottom navigation active tab
    if (screen === 'HOME') setActiveTabState('home');
    else if (screen === 'SPEND_ANALYSIS') setActiveTabState('spend');
    else if (screen === 'BANK_ACCOUNTS') setActiveTabState('account');
    else if (screen === 'PAY_ANYONE') setActiveTabState('pay');
    else if (screen === 'HISTORY') setActiveTabState('history');
    else if (screen === 'PROFILE') setActiveTabState('profile');
  };

  const goBack = () => {
    const onboardingScreens: ScreenId[] = [
      'SPLASH',
      'ONBOARDING',
      'MOBILE_NUMBER',
      'SMS_OTP',
      'SET_PIN',
      'PERMISSIONS',
      'ONBOARDING_KYC',
      'ONBOARDING_BANK',
    ];
    const isCompleted = typeof window !== 'undefined' && localStorage.getItem('hasCompletedOnboarding') === 'true';

    if (screenStack.length > 1) {
      const newStack = [...screenStack];
      newStack.pop();
      const prev = newStack[newStack.length - 1];

      // If user has completed onboarding, do not allow going back to onboarding screens
      if (isCompleted && onboardingScreens.includes(prev.screen)) {
        setScreenStack([{ screen: 'HOME' }]);
        setCurrentScreen('HOME');
        setScreenParams({});
        setActiveTabState('home');
        return;
      }

      setScreenStack(newStack);
      setCurrentScreen(prev.screen);
      setScreenParams(prev.params || {});

      if (prev.screen === 'HOME') setActiveTabState('home');
      else if (prev.screen === 'SPEND_ANALYSIS') setActiveTabState('spend');
      else if (prev.screen === 'BANK_ACCOUNTS') setActiveTabState('account');
      else if (prev.screen === 'PAY_ANYONE') setActiveTabState('pay');
      else if (prev.screen === 'HISTORY') setActiveTabState('history');
      else if (prev.screen === 'PROFILE') setActiveTabState('profile');
    } else {
      if (currentScreen !== 'HOME') {
        navigateTo('HOME');
      }
    }
  };

  const setActiveTab = (tab: BottomTab) => {
    setActiveTabState(tab);
    switch (tab) {
      case 'home':
        navigateTo('HOME');
        break;
      case 'spend':
        navigateTo('SPEND_ANALYSIS');
        break;
      case 'account':
        navigateTo('BANK_ACCOUNTS');
        break;
      case 'pay':
        navigateTo('PAY_ANYONE');
        break;
      case 'scan':
        setIsScanModalOpen(true);
        break;
      case 'history':
        navigateTo('HISTORY');
        break;
      case 'profile':
        navigateTo('PROFILE');
        break;
    }
  };

  const [isKycVerified, setIsKycVerifiedState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isKycVerified') === 'true';
    }
    return false;
  });
  const [kycData, setKycData] = useState<{ nationalId: string; dob: string; verifiedAt: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kycData');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          // ignore
        }
      }
    }
    return null;
  });

  const setIsKycVerified = (
    verified: boolean,
    data?: { nationalId: string; dob: string; verifiedAt: string }
  ) => {
    setIsKycVerifiedState(verified);
    if (verified) {
      localStorage.setItem('isKycVerified', 'true');
      if (data) {
        setKycData(data);
        localStorage.setItem('kycData', JSON.stringify(data));
      }
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Identity Verified',
        description: 'Your digital national identity has been successfully verified.',
        timestamp: 'Just now',
        read: false,
        type: 'success',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } else {
      localStorage.removeItem('isKycVerified');
      localStorage.removeItem('kycData');
      setKycData(null);
    }
  };

  const toggleShowBalance = (bankId: string) => {
    setBankAccounts((prev) =>
      prev.map((acc) => (acc.id === bankId ? { ...acc, showBalance: !acc.showBalance } : acc))
    );
  };

  const addBankAccount = async (
    bankName: string,
    details?: { iban?: string; accountType?: string; matchedWith?: string; balance?: number }
  ) => {
    const newBank = await bankService.addBankAccount(bankName, details);
    setBankAccounts((prev) => [...prev, newBank]);

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Bank linked',
      description: `${bankName} was linked successfully.`,
      timestamp: 'Just now',
      read: false,
      type: 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newBank;
  };

  const setSingleOnboardingBank = (
    bankName: string,
    details?: { iban?: string; accountType?: string; matchedWith?: string; balance?: number }
  ) => {
    const maskedAcc = details?.iban
      ? `${details.iban.slice(0, 4)} •••• ${details.iban.slice(-4)}`
      : 'SA' + Math.floor(10 + Math.random() * 89).toString() + ' •••• ' + Math.floor(1000 + Math.random() * 9000).toString();

    const singleBank: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName,
      accountType: details?.accountType || 'Current Account',
      accountNumberMasked: maskedAcc,
      isPrimary: true,
      balance: details?.balance ?? 48250.0,
      showBalance: false,
    };
    setBankAccounts([singleBank]);
    return singleBank;
  };

  const removeBankAccount = (bankId: string) => {
    setBankAccounts((prev) => {
      const remaining = prev.filter((acc) => acc.id !== bankId);
      if (remaining.length > 0 && !remaining.some((a) => a.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const setPrimaryBank = (bankId: string) => {
    setBankAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isPrimary: acc.id === bankId,
      }))
    );
  };

  const fetchElectricityBill = async (consumerNo: string) => {
    const bill = await billPaymentService.fetchElectricityBill(consumerNo);
    setElectricityBill(bill);
    return bill;
  };

  const completePayment = async (params: {
    title: string;
    subTitle: string;
    amount: number;
    avatarInitials?: string;
    category?: string;
    bankId?: string;
  }) => {
    const newTxn: Transaction = {
      id: 'QT' + Math.floor(10000000000 + Math.random() * 90000000000).toString(),
      title: params.title,
      subTitle: params.subTitle,
      amount: params.amount,
      type: 'sent',
      date: 'TODAY',
      timestamp: new Date(),
      utr: 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      avatarInitials: params.avatarInitials || params.title.substring(0, 2).toUpperCase(),
      category: params.category || 'Payment',
    };

    // Deduct from primary bank account (or specified bank account)
    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (params.bankId ? acc.id === params.bankId : acc.isPrimary) {
          const newBal = Math.max(0, acc.balance - params.amount);
          return { ...acc, balance: newBal };
        }
        return acc;
      })
    );

    setTransactions((prev) => [newTxn, ...prev]);
    setLastTransaction(newTxn);
    syncTransactionToSupabase(newTxn);

    const formattedAmt = `SAR ${params.amount.toFixed(2)}`;
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Payment successful',
      description: `${formattedAmt} paid to ${params.title}`,
      timestamp: 'Just now',
      read: false,
      type: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newTxn;
  };

  const receiveMoney = async (params: {
    senderName: string;
    senderUpi?: string;
    amount: number;
    note?: string;
    avatarInitials?: string;
  }) => {
    const newTxn: Transaction = {
      id: 'SAR' + Math.floor(10000000000 + Math.random() * 90000000000).toString(),
      title: params.senderName,
      subTitle: params.senderUpi ? `From ${params.senderUpi}` : 'Sarie Transfer Received',
      amount: params.amount,
      type: 'received',
      date: 'TODAY',
      timestamp: new Date(),
      utr: 'SARIE' + Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      avatarInitials: params.avatarInitials || params.senderName.substring(0, 2).toUpperCase(),
      category: 'Received',
    };

    // Credit to primary bank account
    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.isPrimary) {
          return { ...acc, balance: acc.balance + params.amount };
        }
        return acc;
      })
    );

    setTransactions((prev) => [newTxn, ...prev]);
    setLastTransaction(newTxn);
    syncTransactionToSupabase(newTxn);

    const formattedAmt = `SAR ${params.amount.toFixed(2)}`;
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Payment Received',
      description: `${formattedAmt} received from ${params.senderName}`,
      timestamp: 'Just now',
      read: false,
      type: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newTxn;
  };

  const declineMoneyRequest = (id: string) => {
    setMoneyRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const openPinModal = (data: { title: string; amount: number; subTitle: string; onSuccess?: () => void }) => {
    setPendingPaymentData(data);
    setIsPinModalOpen(true);
  };

  const closePinModal = () => {
    setIsPinModalOpen(false);
    setPendingPaymentData(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      const newName = updatedData.name !== undefined ? updatedData.name : prev.name;
      const initials = newName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'QT';

      return {
        ...prev,
        ...updatedData,
        avatarInitials: initials,
      };
    });
  };

  const t = (key: string, defaultText?: string) => {
    return translateText(key, language as SupportedLanguage, defaultText);
  };

  const setAppLanguage = (lang: string) => {
    setLanguage(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch {
      // ignore
    }
    const rtl = lang === 'العربية';
    setIsRtl(rtl);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = rtl ? 'ar' : 'en';
    }
    setIsLanguageModalOpen(false);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = isRtl ? 'ar' : 'en';
    }
  }, [isRtl]);

  const performLogout = () => {
    localStorage.removeItem('hasSeenOnboarding');
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('hasGrantedPermissions');
    setIsLogoutModalOpen(false);
    setCurrentScreen('SPLASH');
    setScreenStack([{ screen: 'SPLASH' }]);
  };

  const terminateSession = (sessionId: string) => {
    setDeviceSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const addMoneyRequest = (req: { name?: string; requesterName?: string; upiId: string; amount: number; note?: string; date?: string; status?: 'pending' | 'accepted' | 'declined' }) => {
    const newReq: MoneyRequest = {
      id: `req-${Date.now()}`,
      requesterName: req.requesterName || req.name || 'Recipient',
      upiId: req.upiId,
      amount: req.amount,
      note: req.note,
      date: req.date || 'Just now',
      status: req.status || 'pending',
    };
    setMoneyRequests((prev) => [newReq, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        isRtl,
        t,
        currentScreen,
        navigateTo,
        goBack,
        screenParams,
        activeTab,
        setActiveTab,
        startOnboardingFlow,
        user,
        bankAccounts,
        transactions,
        notifications,
        contacts: FREQUENT_CONTACTS,
        moneyRequests,
        deviceSessions,
        lastTransaction,
        electricityBill,
        updateUser,
        toggleShowBalance,
        addBankAccount,
        setSingleOnboardingBank,
        removeBankAccount,
        setPrimaryBank,
        fetchElectricityBill,
        completePayment,
        receiveMoney,
        declineMoneyRequest,
        addMoneyRequest,
        isPinModalOpen,
        openPinModal,
        closePinModal,
        pendingPaymentData,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        setAppLanguage,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        performLogout,
        isAddBankModalOpen,
        setIsAddBankModalOpen,
        isScanModalOpen,
        setIsScanModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        isKycModalOpen,
        setIsKycModalOpen,
        isKycVerified,
        setIsKycVerified,
        kycData,
        terminateSession,
        userPin,
        setUserPin,
        verifyUserPin,
        activeOtp,
        setActiveOtp,
        verifyOtp,
        isBalanceRevealed,
        setIsBalanceRevealed,
        isIbanRevealed,
        setIsIbanRevealed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};


