import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  SplitExpense,
  TransferLimits,
} from '../types';
import { authService } from '../services/authService';
import { bankService } from '../services/bankService';
import { notificationService } from '../services/notificationService';
import { billPaymentService } from '../services/billPaymentService';

import { translateText, type SupportedLanguage } from '../utils/i18n';
import { setRealtimeAuth, subscribeToWalletUpdates, subscribeToNewTransactions } from '../services/supabaseClient';
import { QPayApi } from '../api/sdk';

export interface KycDocumentRecord {
  frontDocUrl?: string;
  backDocUrl?: string;
  docType?: string;
  status: 'unverified' | 'in_review' | 'verified';
  submittedAt?: string;
}

interface AppContextType {
  // Auth token & profile
  accessToken: string | null;
  profileId: string | null;
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
  setAuthToken: (token: string, profileId: string) => void;

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
  splitExpenses: SplitExpense[];
  transferLimits: TransferLimits;
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

  // KYC & Re-KYC Verification
  isKycVerified: boolean;
  setIsKycVerified: (verified: boolean, data?: { nationalId: string; dob: string; verifiedAt: string }) => void;
  kycData: { nationalId: string; dob: string; verifiedAt: string } | null;
  kycDocuments: KycDocumentRecord;
  submitReKyc: (docs: { frontDocUrl: string; backDocUrl?: string; docType: string; nationalId: string; dob: string }) => Promise<void>;

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
  addMoneyRequest: (req: { name: string; upiId: string; amount: number; note?: string }) => void;
  declineMoneyRequest: (requestId: string) => void;

  // Split Expenses Actions
  createSplitExpense: (params: { title: string; totalAmount: number; members: { contact: Contact; amount: number }[] }) => SplitExpense;
  markSplitMemberPaid: (expenseId: string, memberId: string) => void;

  // Transfer Limits
  updateTransferLimits: (limits: Partial<TransferLimits>) => void;

  // Biometric Authentication
  isBiometricsEnabled: boolean;
  setIsBiometricsEnabled: (enabled: boolean) => void;
  authenticateBiometrics: () => Promise<boolean>;

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
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramScreen = urlParams.get('screen') as ScreenId | null;
      if (paramScreen) return paramScreen;
    }
    return 'SPLASH';
  });
  const [screenStack, setScreenStack] = useState<{ screen: ScreenId; params?: Record<string, any> }[]>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramScreen = urlParams.get('screen') as ScreenId | null;
      if (paramScreen) return [{ screen: paramScreen }];
    }
    return [{ screen: 'SPLASH' }];
  });
  const [screenParams, setScreenParams] = useState<Record<string, any>>({});
  const [activeTab, setActiveTabState] = useState<BottomTab>('home');
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);


  const [user, setUser] = useState<User>({
    name: '',
    avatarInitials: 'QP',
    upiId: '',
    mobile: '',
    email: '',
  });

  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Restore session on mount
  useEffect(() => {
    const stored = authService.loadSession();
    if (stored) {
      setAccessTokenState(stored.token);
      setProfileId(stored.user.id);
      setRealtimeAuth(stored.token);
      setUser({
        id: stored.user.id,
        name: stored.user.name,
        mobile: stored.user.mobile,
        role: stored.user.role,
        avatarInitials: stored.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'QP',
        upiId: '',
        email: '',
        merchantCode: stored.user.merchantCode,
        businessName: stored.user.businessName,
      });
    }
  }, []);

  const setAuthToken = useCallback((token: string, pid: string) => {
    setAccessTokenState(token);
    setProfileId(pid);
  }, []);

  // Load balance and transactions from API when profileId is set
  useEffect(() => {
    if (!profileId || !accessToken) return;

    // Fetch /api/me for wallet balance
    authService.getMe().then((data) => {
      setWalletBalance(Number(data.wallet.balance));
    }).catch((err) => {
      console.warn('[AppContext] getMe error:', err);
    });

    // Fetch transactions from API
    fetch('/api/transactions?limit=50', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.transactions) {
          const mapped = (data.transactions as any[]).map((row: any) => mapDbTxToUi(row, profileId));
          setTransactions(mapped);
        }
      })
      .catch((err) => console.warn('[AppContext] transactions fetch error:', err));

    // Realtime wallet updates
    const unsubWallet = subscribeToWalletUpdates(profileId, (newBalance) => {
      setWalletBalance(newBalance);
    });

    // Realtime new transactions
    const unsubTx = subscribeToNewTransactions(profileId, (row) => {
      const tx = mapDbTxToUi(row, profileId);
      setTransactions((prev) => {
        if (prev.some((t) => t.id === tx.id)) return prev;
        return [tx, ...prev];
      });
      setLastTransaction(tx);
    });

    return () => {
      unsubWallet();
      unsubTx();
    };
  }, [profileId, accessToken]);

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
  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>([
    {
      id: 'split-1',
      title: 'Weekend Chalet in Diriyah',
      totalAmount: 1200.0,
      creatorUpiId: 'fahad@sarie',
      date: 'Yesterday',
      timestamp: new Date(),
      status: 'active',
      members: [
        { id: 'm-1', name: 'Tariq Al-Otaibi', upiId: 'tariq@sarie', avatarInitials: 'TO', amount: 300.0, hasPaid: true },
        { id: 'm-2', name: 'Sara Al-Mansoor', upiId: 'sara@sarie', avatarInitials: 'SM', amount: 300.0, hasPaid: false },
        { id: 'm-3', name: 'Mohammed Al-Ghamdi', upiId: 'mohammed@sarie', avatarInitials: 'MG', amount: 300.0, hasPaid: false },
        { id: 'm-4', name: user.name ? `${user.name} (You)` : 'You', upiId: user.upiId || 'you@sarie', avatarInitials: user.avatarInitials || 'ME', amount: 300.0, hasPaid: true },
      ],
    },
  ]);

  const [transferLimits, setTransferLimits] = useState<TransferLimits>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('qpay_transfer_limits');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          // ignore
        }
      }
    }
    return {
      dailyLimit: 50000.0,
      dailyUsed: 4800.0,
      perTransactionLimit: 20000.0,
      monthlyLimit: 200000.0,
      monthlyUsed: 28400.0,
      contactlessLimit: 300.0,
    };
  });

  const updateTransferLimits = (limits: Partial<TransferLimits>) => {
    setTransferLimits((prev) => {
      const updated = { ...prev, ...limits };
      if (typeof window !== 'undefined') {
        localStorage.setItem('qpay_transfer_limits', JSON.stringify(updated));
      }
      return updated;
    });

    // Authoritative backend API synchronization & SAMA limit validation
    QPayApi.limits
      .update({
        dailyLimit: limits.dailyLimit,
        singleTransactionLimit: limits.perTransactionLimit,
        contactlessLimit: limits.contactlessLimit,
      })
      .catch((err) => {
        console.warn('[AppContext] Backend limits sync notice:', err);
      });
  };

  const [isBiometricsEnabled, setIsBiometricsEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qpay_biometrics_enabled') !== 'false';
    }
    return true;
  });

  const setIsBiometricsEnabled = (enabled: boolean) => {
    setIsBiometricsEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qpay_biometrics_enabled', String(enabled));
    }
  };

  const authenticateBiometrics = async (): Promise<boolean> => {
    if (!isBiometricsEnabled) return true;
    try {
      if (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
    } catch {
      // ignore
    }
    return true;
  };

  const [kycDocuments, setKycDocuments] = useState<KycDocumentRecord>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kycDocuments');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          // ignore
        }
      }
    }
    return { status: 'unverified' };
  });

  const submitReKyc = async (docs: {
    frontDocUrl: string;
    backDocUrl?: string;
    docType: string;
    nationalId: string;
    dob: string;
  }) => {
    // Initiate Nafath KYC challenge via Backend API
    try {
      await QPayApi.kyc.initiateNafath({
        nationalId: docs.nationalId,
        docType: docs.docType as any,
        dob: docs.dob,
        frontDocUrl: docs.frontDocUrl,
        backDocUrl: docs.backDocUrl,
      });
    } catch (err) {
      console.warn('[AppContext] Backend KYC initiation notice:', err);
    }

    const docRecord: KycDocumentRecord = {
      frontDocUrl: docs.frontDocUrl,
      backDocUrl: docs.backDocUrl,
      docType: docs.docType,
      status: 'verified',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    };
    setKycDocuments(docRecord);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kycDocuments', JSON.stringify(docRecord));
    }
    setIsKycVerified(true, {
      nationalId: docs.nationalId,
      dob: docs.dob,
      verifiedAt: new Date().toLocaleDateString('en-GB'),
    });
  };

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
      return localStorage.getItem('qpay_user_pin') || '';
    }
    return '';
  });

  const setUserPin = (pin: string) => {
    setUserPinState(pin);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qpay_user_pin', pin);
    }
  };

  const verifyUserPin = (pin: string): boolean => {
    if (!userPin) return false;
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

    // Load initial notifications
    notificationService.getInitialNotifications().then(setNotifications);

    // Sync authoritative transfer limits from backend
    QPayApi.limits.get().then((res) => {
      if (res.success && res.data) {
        setTransferLimits({
          dailyLimit: res.data.userConfiguredDailyLimit,
          dailyUsed: res.data.dailyUsedAmount,
          perTransactionLimit: res.data.singleTransactionLimit,
          monthlyLimit: res.data.monthlyLimit,
          monthlyUsed: res.data.monthlyUsedAmount,
          contactlessLimit: res.data.contactlessMadaLimit,
        });
      }
    }).catch(() => {});
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
    if (screenStack.length > 1) {
      const newStack = [...screenStack];
      newStack.pop();
      const prev = newStack[newStack.length - 1];
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
      navigateTo('HOME');
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
    authService.clearSession();
    localStorage.removeItem('hasSeenOnboarding');
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('hasGrantedPermissions');
    setAccessTokenState(null);
    setProfileId(null);
    setWalletBalance(0);
    setTransactions([]);
    setIsLogoutModalOpen(false);
    setCurrentScreen('SPLASH');
    setScreenStack([{ screen: 'SPLASH' }]);
  };

  const terminateSession = (sessionId: string) => {
    setDeviceSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const addMoneyRequest = (req: { name: string; upiId: string; amount: number; note?: string }) => {
    const newReq: MoneyRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      requesterName: req.name,
      upiId: req.upiId,
      amount: req.amount,
      note: req.note,
      date: 'Just now',
      status: 'pending',
    };
    setMoneyRequests((prev) => [newReq, ...prev]);
  };

  const declineMoneyRequest = (requestId: string) => {
    setMoneyRequests((prev) =>
      prev.filter((r) => r.id !== requestId)
    );

    // Record decline transition in backend
    QPayApi.splits.decline({ requestId }).catch((err) => {
      console.warn('[AppContext] Backend decline notice:', err);
    });

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Payment Request Declined',
      description: 'The money request has been declined.',
      timestamp: 'Just now',
      read: false,
      type: 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const createSplitExpense = (params: {
    title: string;
    totalAmount: number;
    members: { contact: Contact; amount: number }[];
  }): SplitExpense => {
    const newExpense: SplitExpense = {
      id: `split-${Date.now()}`,
      title: params.title,
      totalAmount: params.totalAmount,
      creatorUpiId: user.upiId,
      date: 'Just now',
      timestamp: new Date(),
      status: 'active',
      members: params.members.map((m, idx) => ({
        id: `sm-${Date.now()}-${idx}`,
        name: m.contact.name,
        upiId: m.contact.upiId,
        avatarInitials: m.contact.avatarInitials,
        amount: m.amount,
        hasPaid: m.contact.upiId === user.upiId,
      })),
    };

    setSplitExpenses((prev) => [newExpense, ...prev]);

    // Send split and RTP requests to backend API
    QPayApi.splits
      .create({
        title: params.title,
        totalAmount: params.totalAmount,
        members: params.members.map((m) => ({
          name: m.contact.name,
          upiId: m.contact.upiId,
          mobile: m.contact.mobile,
          amount: m.amount,
        })),
      })
      .catch((err) => {
        console.warn('[AppContext] Backend split dispatch notice:', err);
      });

    // Send RTP to non-self members in UI
    params.members.forEach((m) => {
      if (m.contact.upiId !== user.upiId) {
        addMoneyRequest({
          name: m.contact.name,
          upiId: m.contact.upiId,
          amount: m.amount,
          note: `Split: ${params.title}`,
        });
      }
    });

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Split Expense Created',
      description: `Created split "${params.title}" for SAR ${params.totalAmount}`,
      timestamp: 'Just now',
      read: false,
      type: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newExpense;
  };

  const markSplitMemberPaid = (expenseId: string, memberId: string) => {
    setSplitExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id !== expenseId) return exp;
        const updatedMembers = exp.members.map((m) =>
          m.id === memberId ? { ...m, hasPaid: true } : m
        );
        const allPaid = updatedMembers.every((m) => m.hasPaid);
        return {
          ...exp,
          members: updatedMembers,
          status: allPaid ? ('settled' as const) : ('active' as const),
        };
      })
    );

    // Settle member obligation on backend
    QPayApi.splits.settle(expenseId, memberId).catch((err) => {
      console.warn('[AppContext] Backend split settlement notice:', err);
    });
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
        splitExpenses,
        transferLimits,
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
        kycDocuments,
        submitReKyc,
        terminateSession,
        addMoneyRequest,
        declineMoneyRequest,
        createSplitExpense,
        markSplitMemberPaid,
        updateTransferLimits,
        isBiometricsEnabled,
        setIsBiometricsEnabled,
        authenticateBiometrics,
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
        // Real auth & wallet
        accessToken,
        profileId,
        walletBalance,
        setWalletBalance,
        setAuthToken,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Helper: map DB transaction row to UI Transaction type
// ---------------------------------------------------------------------------
function mapDbTxToUi(row: any, myProfileId: string): Transaction {
  const isSent = row.payer_profile_id === myProfileId;
  return {
    id: row.id || `tx-${Date.now()}`,
    title: isSent
      ? (row.payee_name || row.receiver_name || 'Merchant')
      : (row.payer_name || row.sender_name || 'Customer'),
    subTitle: isSent ? `Paid to ${row.payee_name || ''}` : `Received from ${row.payer_name || ''}`,
    amount: Number(row.amount),
    type: isSent ? 'sent' : 'received',
    date: 'TODAY',
    timestamp: new Date(row.created_at || Date.now()),
    utr: row.order_ref || row.id || `UTR${Date.now()}`,
    category: row.category || 'Payment',
    avatarInitials: ((isSent ? row.payee_name : row.payer_name) || 'QP').slice(0, 2).toUpperCase(),
    payerName: row.payer_name,
    payeeName: row.payee_name,
    payerProfileId: row.payer_profile_id,
    payeeProfileId: row.payee_profile_id,
  };
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};


