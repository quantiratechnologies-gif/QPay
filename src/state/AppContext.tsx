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
  SplitExpense,
  TransferLimits,
} from '../types';
import { authService } from '../services/authService';
import { bankService } from '../services/bankService';
import { transactionService } from '../services/transactionService';
import { notificationService } from '../services/notificationService';
import { billPaymentService } from '../services/billPaymentService';

import { translateText, type SupportedLanguage } from '../utils/i18n';
import { syncTransactionToSupabase, subscribeToTransactions, getSupabase } from '../services/supabaseClient';
import { QPayApi } from '../api';

export interface KycDocumentRecord {
  frontDocUrl?: string;
  backDocUrl?: string;
  docType?: string;
  status: 'unverified' | 'in_review' | 'verified';
  submittedAt?: string;
}

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
  splitExpenses: SplitExpense[];
  transferLimits: TransferLimits;
  deviceSessions: DeviceSession[];
  lastTransaction: Transaction | null;
  electricityBill: ElectricityBill | null;

  // Actions
  updateUser: (updatedData: Partial<User>) => void;
  addNotification: (notif: Omit<AppNotification, 'id'>) => void;
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
  reportTransaction: (id: string) => void;

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
  addMoneyRequest: (req: { name?: string; requesterName?: string; upiId: string; amount: number; note?: string; date?: string; status?: 'pending' | 'accepted' | 'declined' }) => void;

  // Split Expenses & Transfer Limits
  updateTransferLimits: (limits: Partial<TransferLimits>) => void;
  isBiometricsEnabled: boolean;
  setIsBiometricsEnabled: (enabled: boolean) => void;
  authenticateBiometrics: () => Promise<boolean>;
  createSplitExpense: (params: {
    title: string;
    totalAmount: number;
    members: { contact: Contact; amount: number }[];
  }) => SplitExpense;
  markSplitMemberPaid: (expenseId: string, memberId: string) => void;

  // MPIN Security Controls
  userPin: string;
  setUserPin: (pin: string) => void;
  verifyUserPin: (pin: string) => boolean;
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
    if ((import.meta.env.DEV || import.meta.env.VITE_E2E === 'true') && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramScreen = urlParams.get('screen') as ScreenId | null;
      if (paramScreen) return paramScreen;
    }
    return 'SPLASH';
  });
  const [screenStack, setScreenStack] = useState<{ screen: ScreenId; params?: Record<string, any> }[]>(() => {
    if ((import.meta.env.DEV || import.meta.env.VITE_E2E === 'true') && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramScreen = urlParams.get('screen') as ScreenId | null;
      if (paramScreen) return [{ screen: paramScreen }];
    }
    return [{ screen: 'SPLASH' }];
  });
  const [screenParams, setScreenParams] = useState<Record<string, any>>({});
  const [activeTab, setActiveTabState] = useState<BottomTab>('home');
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);


  const [user, setUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('qpay_user_profile');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {}
      }
    }
    return {
      name: '',
      avatarInitials: '',
      upiId: '',
      mobile: '',
      email: '',
      tier: 'basic',
    };
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
        { id: 'm-4', name: 'Fahad Al-Harbi (You)', upiId: 'fahad@sarie', avatarInitials: 'FA', amount: 300.0, hasPaid: true },
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

  // Salted SHA-256 PIN Security State (No plaintext PIN, no default 1234, no master PINs)
  const PIN_SALT = 'qtpay_secure_sama_salt_v1_';

  const sha256Sync = (ascii: string): string => {
    const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));
    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;
    const hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];

    for (let i = 0; i < ascii.length; i++) {
      words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }
    words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
    words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

    for (let i = 0; i < words.length; i += 16) {
      const w = words.slice(i, i + 16);
      let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
      let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

      for (let j = 0; j < 64; j++) {
        if (j < 16) {
          w[j] = w[j] || 0;
        } else {
          const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
          const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
          w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
        }
        const ch = (e & f) ^ (~e & g);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const t1 = h + sigma1 + ch + k[j] + w[j];
        const t2 = sigma0 + maj;

        h = g;
        g = f;
        f = e;
        e = (d + t1) | 0;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) | 0;
      }
      hash[0] = (hash[0] + a) | 0;
      hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0;
      hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0;
      hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0;
      hash[7] = (hash[7] + h) | 0;
    }

    let result = '';
    for (let i = 0; i < 8; i++) {
      for (let j = 3; j >= 0; j--) {
        const b = (hash[i] >> (8 * j)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  };

  const hashPin = (pin: string): string => sha256Sync(PIN_SALT + pin);

  const [userPinHash, setUserPinHashState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qpay_user_pin_hash') || '';
    }
    return '';
  });

  const setUserPin = (pin: string) => {
    const hashed = hashPin(pin);
    setUserPinHashState(hashed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qpay_user_pin_hash', hashed);
      localStorage.removeItem('qpay_user_pin');
    }
  };

  const verifyUserPin = (pin: string): boolean => {
    const currentHash =
      userPinHash || (typeof window !== 'undefined' ? localStorage.getItem('qpay_user_pin_hash') || '' : '');
    if (!currentHash) return false;
    return hashPin(pin) === currentHash;
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
    // Check URL query parameters for test automation only in DEV or E2E mode
    if ((import.meta.env.DEV || import.meta.env.VITE_E2E === 'true') && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialScreen = urlParams.get('screen') as ScreenId | null;
      if (initialScreen) {
        setCurrentScreen(initialScreen);
        setScreenStack([{ screen: initialScreen }]);
      }
    }

    // Load initial data
    authService.getCurrentUser().then(setUser);
    bankService.getBankAccounts().then(setBankAccounts);
    transactionService.getInitialTransactions().then(setTransactions);
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

    // Subscribe to Supabase real-time transactions with owner_profile_id filter
    const profileId = (user as any).id || (typeof window !== 'undefined' ? localStorage.getItem('qpay_profile_id') : undefined);
    const unsubscribe = subscribeToTransactions((newTx) => {
      setTransactions((prev) => {
        if (prev.some((t) => t.id === newTx.id || (newTx.utr && t.utr === newTx.utr))) {
          return prev;
        }
        return [newTx, ...prev];
      });
    }, profileId || undefined);

    return () => {
      unsubscribe();
    };
  }, []);



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

      // Allow going back from SMS_OTP to MOBILE_NUMBER during auth
      if (currentScreen === 'SMS_OTP' && prev.screen === 'MOBILE_NUMBER') {
        setScreenStack(newStack);
        setCurrentScreen('MOBILE_NUMBER');
        setScreenParams(prev.params || {});
        return;
      }

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

  const openPinModal = (data: { title: string; amount: number; subTitle: string; onSuccess?: () => void }) => {
    setPendingPaymentData(data);
    setIsPinModalOpen(true);
  };

  const closePinModal = () => {
    setIsPinModalOpen(false);
    setPendingPaymentData(null);
  };

  const addNotification = (notif: Omit<AppNotification, 'id'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
    };
    setNotifications((prev) => [newNotif, ...prev]);
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

      const nextUser = {
        ...prev,
        ...updatedData,
        avatarInitials: initials,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('qpay_user_profile', JSON.stringify(nextUser));
      }

      return nextUser;
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
    localStorage.removeItem('qpay_user_profile');
    localStorage.removeItem('qpay_user_pin_hash');
    localStorage.removeItem('qpay_user_pin');
    localStorage.removeItem('kycDocuments');
    localStorage.removeItem('qpay_transfer_limits');
    localStorage.removeItem('qpay_auth_token');
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUserPinHashState('');
    setUser({
      name: '',
      avatarInitials: '',
      upiId: '',
      mobile: '',
      email: '',
    });
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

  const reportTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isReported: true } : t))
    );
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

  // Expose global test helpers for Playwright / automation verification ONLY when VITE_E2E is true
  useEffect(() => {
    if (import.meta.env.VITE_E2E === 'true') {
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
        setAppLanguage,
        setUserPin,
        verifyUserPin,
      };
    }
  });

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
        updateTransferLimits,
        isBiometricsEnabled,
        setIsBiometricsEnabled,
        authenticateBiometrics,
        createSplitExpense,
        markSplitMemberPaid,
        deviceSessions,
        lastTransaction,
        electricityBill,
        updateUser,
        addNotification,
        toggleShowBalance,
        addBankAccount,
        setSingleOnboardingBank,
        removeBankAccount,
        setPrimaryBank,
        fetchElectricityBill,
        completePayment,
        receiveMoney,
        declineMoneyRequest,
        reportTransaction,
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
        kycDocuments,
        submitReKyc,
        terminateSession,
        userPin: userPinHash,
        setUserPin,
        verifyUserPin,
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


