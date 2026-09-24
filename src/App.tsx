import React from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { BottomNavigation } from './components/BottomNavigation';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { MobileNumberScreen } from './screens/MobileNumberScreen';
import { SmsOtpScreen } from './screens/SmsOtpScreen';
import { SetPinScreen } from './screens/SetPinScreen';
import { PermissionsScreen } from './screens/PermissionsScreen';
import { OnboardingKycScreen } from './screens/OnboardingKycScreen';
import { OnboardingBankScreen } from './screens/OnboardingBankScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SpendAnalysisScreen } from './screens/SpendAnalysisScreen';
import { PayAnyoneScreen } from './screens/PayAnyoneScreen';
import { SendAmountScreen } from './screens/SendAmountScreen';
import { ElectricityScreen } from './screens/ElectricityScreen';
import { PaymentSuccessScreen } from './screens/PaymentSuccessScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ReceiveScreen } from './screens/ReceiveScreen';
import { ScanScreen } from './screens/ScanScreen';
import { RequestMoneyScreen } from './screens/RequestMoneyScreen';
import { SplitExpensesScreen } from './screens/SplitExpensesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BankAccountsScreen } from './screens/BankAccountsScreen';
import { TransferLimitsScreen } from './screens/TransferLimitsScreen';
import { UPISettingsScreen } from './screens/UPISettingsScreen';
import { PaymentMethodsScreen } from './screens/PaymentMethodsScreen';
import { SecurityScreen } from './screens/SecurityScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { AllServicesScreen } from './screens/AllServicesScreen';
import { MoneyRequestsScreen } from './screens/MoneyRequestsScreen';
import { HelpSupportScreen } from './screens/HelpSupportScreen';
import { PrivacySettingsScreen } from './screens/PrivacySettingsScreen';
import { TermsScreen } from './screens/TermsScreen';
import { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
import { ReconsentModal } from './components/features/legal/ReconsentModal';

// Lifestyle Screens
import { ShoppingScreen } from './screens/ShoppingScreen';
import { TravelScreen } from './screens/TravelScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { FoodScreen } from './screens/FoodScreen';

// Modals
import { PayBillPinModal } from './screens/PayBillPinModal';
import { LanguageModal } from './screens/LanguageModal';
import { LogoutModal } from './screens/LogoutModal';
import { AddBankModal } from './screens/AddBankModal';
import { EditProfileModal } from './screens/EditProfileModal';
import { KycModal } from './screens/KycModal';

const AppContent: React.FC = () => {
  const { currentScreen, isRtl } = useApp();
  const screenContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (screenContentRef.current) {
      screenContentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentScreen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SPLASH':
        return <SplashScreen />;
      case 'ONBOARDING':
        return <OnboardingScreen />;
      case 'MOBILE_NUMBER':
        return <MobileNumberScreen />;
      case 'SMS_OTP':
        return <SmsOtpScreen />;
      case 'SET_PIN':
        return <SetPinScreen />;
      case 'PERMISSIONS':
        return <PermissionsScreen />;
      case 'ONBOARDING_KYC':
        return <OnboardingKycScreen />;
      case 'ONBOARDING_BANK':
        return <OnboardingBankScreen />;
      case 'HOME':
        return <HomeScreen />;
      case 'SPEND_ANALYSIS':
        return <SpendAnalysisScreen />;
      case 'PAY_ANYONE':
        return <PayAnyoneScreen />;
      case 'SEND_AMOUNT':
        return <SendAmountScreen />;
      case 'ELECTRICITY':
        return <ElectricityScreen />;
      case 'PAYMENT_SUCCESS':
        return <PaymentSuccessScreen />;
      case 'HISTORY':
        return <HistoryScreen />;
      case 'RECEIVE':
        return <ReceiveScreen />;
      case 'REQUEST_MONEY':
        return <RequestMoneyScreen />;
      case 'SPLIT_EXPENSES':
        return <SplitExpensesScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      case 'BANK_ACCOUNTS':
        return <BankAccountsScreen />;
      case 'TRANSFER_LIMITS':
        return <TransferLimitsScreen />;
      case 'UPI_SETTINGS':
        return <UPISettingsScreen />;
      case 'PAYMENT_METHODS':
        return <PaymentMethodsScreen />;
      case 'SECURITY':
        return <SecurityScreen />;
      case 'NOTIFICATIONS':
        return <NotificationsScreen />;
      case 'ALL_SERVICES':
        return <AllServicesScreen />;
      case 'MONEY_REQUESTS':
        return <MoneyRequestsScreen />;
      case 'HELP_SUPPORT':
        return <HelpSupportScreen />;
      case 'PRIVACY':
      case 'PRIVACY_SETTINGS':
        return <PrivacySettingsScreen />;
      case 'TERMS':
        return <TermsScreen />;
      case 'PRIVACY_POLICY':
        return <PrivacyPolicyScreen />;
      case 'SHOPPING':
        return <ShoppingScreen />;
      case 'TRAVEL':
        return <TravelScreen />;
      case 'REWARDS':
        return <RewardsScreen />;
      case 'FOOD':
        return <FoodScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const showBottomNav =
    currentScreen !== 'SPLASH' &&
    currentScreen !== 'ONBOARDING' &&
    currentScreen !== 'MOBILE_NUMBER' &&
    currentScreen !== 'SMS_OTP' &&
    currentScreen !== 'SET_PIN' &&
    currentScreen !== 'PERMISSIONS' &&
    currentScreen !== 'ONBOARDING_KYC' &&
    currentScreen !== 'ONBOARDING_BANK' &&
    currentScreen !== 'PAYMENT_SUCCESS' &&
    currentScreen !== 'TERMS' &&
    currentScreen !== 'PRIVACY_POLICY';

  return (
    <div className={`app-viewport ${isRtl ? 'rtl' : ''}`}>
      {/* Scrollable Main Screen Container */}
      <div
        ref={screenContentRef}
        key={currentScreen}
        className={`screen-content ${!showBottomNav ? 'no-bottom-nav' : ''}`}
      >
        {renderScreen()}
      </div>

      {/* Global Fixed Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}

      {/* Camera / QR Scanner Viewfinder Screen Overlay */}
      <ScanScreen />

      {/* Bottom Sheet Modals */}
      <PayBillPinModal />
      <LanguageModal />
      <LogoutModal />
      <AddBankModal />
      <EditProfileModal />
      <KycModal />
      <ReconsentModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
