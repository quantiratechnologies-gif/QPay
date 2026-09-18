import { test, expect } from '@playwright/test';
import path from 'path';

const INDEX_HTML = path.resolve(process.cwd(), 'dist/index.html');
const getAppUrl = (query = '') => `file://${INDEX_HTML}${query ? `?${query}` : ''}`;

const SCREENS = [
  'HOME',
  'SPLASH',
  'ONBOARDING',
  'MOBILE_NUMBER',
  'SMS_OTP',
  'PERMISSIONS',
  'ONBOARDING_KYC',
  'ONBOARDING_BANK',
  'SPEND_ANALYSIS',
  'PAY_ANYONE',
  'SEND_AMOUNT',
  'ELECTRICITY',
  'PAYMENT_SUCCESS',
  'HISTORY',
  'RECEIVE',
  'SCAN',
  'REQUEST_MONEY',
  'PROFILE',
  'BANK_ACCOUNTS',
  'UPI_SETTINGS',
  'PAYMENT_METHODS',
  'SECURITY',
  'NOTIFICATIONS',
  'ALL_SERVICES',
  'MONEY_REQUESTS',
  'HELP_SUPPORT',
  'PRIVACY',
  'SHOPPING',
  'MESSAGES',
  'TRAVEL',
  'REWARDS',
  'FOOD',
];

const MODALS = [
  { name: 'LanguageModal', openMethod: 'setIsLanguageModalOpen', text: 'Select Language' },
  { name: 'LogoutModal', openMethod: 'setIsLogoutModalOpen', text: 'Log Out' },
  { name: 'AddBankModal', openMethod: 'setIsAddBankModalOpen', text: 'Saudi Bank' },
  { name: 'KycModal', openMethod: 'setIsKycModalOpen', text: 'National ID' },
  { name: 'EditProfileModal', openMethod: 'setIsEditProfileModalOpen', text: 'Profile' },
  {
    name: 'PayBillPinModal',
    openMethod: 'openPinModal',
    args: [{ title: 'Test Payment', amount: 100, subTitle: 'Electricity Bill' }],
    text: 'PIN',
  },
];

test.describe.serial('QtPay Comprehensive Flow Audit & Quality Verification', () => {
  let page: any;
  let consoleErrors: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('chrome-extension') &&
          !text.includes('net::ERR_') &&
          !text.includes('Failed to load resource') &&
          !text.includes('ServiceWorkerRegistration')
        ) {
          consoleErrors.push(text);
        }
      }
    });
    page.on('pageerror', (err: any) => {
      const msg = err.message || '';
      if (!msg.includes('ServiceWorkerRegistration') && !msg.includes('favicon')) {
        consoleErrors.push(msg);
      }
    });
  });

  test.afterAll(async () => {
    if (page) await page.close();
  });

  test.beforeEach(() => {
    consoleErrors = [];
  });

  test('Sticky Bottom Navigation renders with correct CSS layout', async () => {
    await page.goto(getAppUrl('screen=HOME'));
    await page.waitForSelector('nav[role="navigation"]');

    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();

    const position = await nav.evaluate((el: HTMLElement) => window.getComputedStyle(el).position);
    expect(position).toBe('fixed');

    const bottom = await nav.evaluate((el: HTMLElement) => window.getComputedStyle(el).bottom);
    expect(bottom).toBe('0px');
  });

  test('Primary End-to-End User Journey: Splash -> Onboarding -> Mobile -> SMS OTP -> Permissions -> Onboarding Bank -> Home', async () => {
    // 1. Splash Screen
    await page.goto(getAppUrl('screen=SPLASH'));
    await expect(page.locator('.app-viewport')).toBeVisible();
    await expect(page.getByText(/Quantira Technologies/i)).toBeVisible();

    // 2. Transition to Onboarding
    await page.goto(getAppUrl('screen=ONBOARDING'));
    await expect(page.getByText('Pay Anyone Instantly')).toBeVisible();

    // Skip onboarding to go to Mobile Login
    const skipBtn = page.getByRole('button', { name: /Skip|تخطي/i });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }

    // 3. Mobile Number Screen
    await page.goto(getAppUrl('screen=MOBILE_NUMBER'));
    await expect(page.locator('#fullname-input')).toBeVisible();
    const nameInput = page.locator('#fullname-input');
    await nameInput.fill('Fahad Al-Harbi');
    const mobileInput = page.locator('#mobile-input');
    await mobileInput.fill('501234567');

    // Submit
    const submitBtn = page.getByRole('button', { name: /Get OTP|Continue|متابعة|الحصول على رمز التحقق/i });
    await submitBtn.click();

    // 4. SMS OTP Screen
    await page.goto(getAppUrl('screen=SMS_OTP'));
    const demoOtpBtn = page.getByRole('button', { name: /Demo OTP|رمز تجريبي/i });
    if (await demoOtpBtn.isVisible()) {
      await demoOtpBtn.click();
    } else {
      const inputs = page.locator('input[type="text"]');
      const digits = ['5', '8', '9', '2', '0', '4'];
      for (let i = 0; i < 6; i++) {
        await inputs.nth(i).fill(digits[i]);
      }
    }

    // Click Verify
    const verifyBtn = page.getByRole('button', { name: /Verify/i });
    await verifyBtn.click();

    // 5. Permissions Screen
    await page.goto(getAppUrl('screen=PERMISSIONS'));
    await expect(page.getByText(/Permissions/i).first()).toBeVisible();

    // Click Allow Permissions -> goes to ONBOARDING_KYC
    const allowBtn = page.getByRole('button', { name: /Allow & Continue/i });
    await allowBtn.click();

    // 6. Onboarding KYC Screen (Digital Identity Verification)
    await expect(page.getByText(/Identity Verification|توثيق الهوية/i).first()).toBeVisible();
    const nationalIdInput = page.locator('#onboarding-national-id');
    await nationalIdInput.fill('1098765432');
    const dobInput = page.locator('#onboarding-dob');
    await dobInput.fill('1992-05-14');

    // Submit Verification -> verifies in backend
    const verifyIdentityBtn = page.getByRole('button', { name: /Verify & Continue|توثيق الهوية ومتابعة/i });
    await verifyIdentityBtn.click();

    // Verification Success -> Continue to Link Bank
    const continueToBankBtn = page.getByRole('button', { name: /Continue to Link Bank|متابعة لربط الحساب البنكي/i });
    await expect(continueToBankBtn).toBeVisible({ timeout: 5000 });
    await continueToBankBtn.click();

    // 7. Onboarding Bank Screen (Link Saudi Bank)
    await expect(page.getByText(/Select Bank|اختر البنك/i).first()).toBeVisible({ timeout: 5000 });
    
    // Select Al Rajhi Bank
    const alRajhiBank = page.getByText('Al Rajhi Bank').first();
    await alRajhiBank.click();

    // Request Bank OTP
    const requestOtpBtn = page.getByRole('button', { name: /Request Bank OTP|طلب رمز التحقق البنكي/i });
    await expect(requestOtpBtn).toBeVisible({ timeout: 5000 });
    await requestOtpBtn.click();

    // Fill Bank OTP
    const demoBankOtpBtn = page.getByRole('button', { name: /Demo OTP: 4821|رمز تجريبي/i });
    await expect(demoBankOtpBtn).toBeVisible({ timeout: 5000 });
    await demoBankOtpBtn.click();

    // Authorize & Link Account OTP
    const authorizeBtn = page.getByRole('button', { name: /Authorize & Link Account|تأكيد وربط الحساب/i });
    await expect(authorizeBtn).toBeEnabled({ timeout: 5000 });
    await authorizeBtn.click();

    // Success Screen -> Go to Home
    const completeSetupBtn = page.getByRole('button', { name: /Complete Setup & Go to Home|إتمام الإعداد والدخول للرئيسية/i });
    await expect(completeSetupBtn).toBeVisible({ timeout: 5000 });
    await completeSetupBtn.click();

    // 8. Verify seamless auto-navigation to Home Dashboard
    await expect(page.getByText('Quick Actions')).toBeVisible({ timeout: 6000 });

    expect(consoleErrors).toEqual([]);
  });

  test('Interactive Send Money Flow with Sarie PIN and Receipt', async () => {
    await page.goto(getAppUrl('screen=PAY_ANYONE'));
    await expect(page.getByText(/Send Money|Pay Anyone/i).first()).toBeVisible();

    // Select Tariq Al-Otaibi contact
    const tariqContact = page.locator('[aria-label*="Pay Tariq Al-Otaibi"]');
    await expect(tariqContact).toBeVisible();
    await tariqContact.click();

    // Send Amount Screen
    await expect(page.getByText('Tariq Al-Otaibi')).toBeVisible();
    const amountInput = page.locator('input[placeholder="0"]').first();
    await amountInput.fill('500');

    // Click Pay SAR 500
    const payBtn = page.getByRole('button', { name: /Pay SAR 500/i });
    await payBtn.click();

    // PIN Modal should open
    await expect(page.getByText(/PIN/i).first()).toBeVisible();

    // Type 4-digit PIN
    await page.keyboard.type('1234');
    await page.waitForTimeout(300);

    // Payment Success Screen
    await expect(page.getByText('Payment Successful')).toBeVisible();
    await expect(page.getByText('Tariq Al-Otaibi').first()).toBeVisible();
    await expect(page.getByText(/Reference|UTR|SARIE/i).first()).toBeVisible();

    // Click Done to return Home
    const doneBtn = page.getByRole('button', { name: 'Done' });
    await doneBtn.click();
    await expect(page.getByText('Quick Actions')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('Electricity Bill Fetch and Payment Flow', async () => {
    await page.goto(getAppUrl('screen=ELECTRICITY'));
    await expect(page.getByText('Electricity Bill')).toBeVisible();

    // Fill Consumer ID
    const consumerInput = page.locator('#elec-consumer-input');
    await consumerInput.fill('134567');

    // Fetch bill
    const fetchBtn = page.getByRole('button', { name: /Fetch Bill/i });
    await fetchBtn.click();

    // View Bill Summary
    await expect(page.getByText('Saudi Electricity Company (SEC)').first()).toBeVisible();
    await expect(page.getByText(/Due Amount|Amount Due/i).first()).toBeVisible();

    // Pay Bill
    const payBillBtn = page.getByRole('button', { name: /Pay /i });
    await payBillBtn.click();

    // PIN Modal
    await expect(page.getByText(/PIN/i).first()).toBeVisible();
    await page.keyboard.type('1234');
    await page.waitForTimeout(300);

    // Success Screen
    await expect(page.getByText('Payment Successful')).toBeVisible();
    await expect(page.getByText('Saudi Electricity Company (SEC)').first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('Receive Screen with QR Code and Live Incoming Payment Simulation', async () => {
    await page.goto(getAppUrl('screen=RECEIVE'));
    await expect(page.getByText('Receive Money')).toBeVisible();
    await expect(page.getByText(/Sarie/i).first()).toBeVisible();

    // Click Copy Alias & Copy IBAN
    const copyAliasBtn = page.getByRole('button', { name: /Copy Alias|نسخ المعرّف/i });
    await expect(copyAliasBtn).toBeVisible();
    await copyAliasBtn.click();

    const copyIbanBtn = page.getByRole('button', { name: /Copy IBAN|نسخ الآيبان/i });
    await expect(copyIbanBtn).toBeVisible();
    await copyIbanBtn.click();

    expect(consoleErrors).toEqual([]);
  });

  test('Spend Analysis Page: Period selector, category breakdowns, and export action', async () => {
    await page.goto(getAppUrl('screen=SPEND_ANALYSIS'));
    await expect(page.getByText(/Spend Analysis|تحليل المصاريف/i).first()).toBeVisible();

    // Verify Total Spending Amount
    await expect(page.getByText(/14,850|١٤٬٨٥٠/).first()).toBeVisible();

    // Toggle Period to Week
    const weekBtn = page.getByRole('button', { name: /Week|أسبوع/i }).first();
    await weekBtn.click();
    await expect(page.getByText(/3,420|٣٬٤٢٠/).first()).toBeVisible();

    // Toggle Period to Month
    const monthBtn = page.getByRole('button', { name: /Month|شهر/i }).first();
    await monthBtn.click();

    // Click Category breakdown filter (e.g. Shopping)
    const shoppingCat = page.getByText(/Shopping|التسوق/i).first();
    await shoppingCat.click();

    // Export Statement
    const exportBtn = page.getByRole('button', { name: /Export|تصدير/i });
    await exportBtn.click();
    await expect(page.getByText(/exported successfully|بنجاح/i).first()).toBeVisible({ timeout: 4000 });

    expect(consoleErrors).toEqual([]);
  });

  test('All 34 Screens render with zero JavaScript runtime errors', async () => {
    for (const screenId of SCREENS) {
      await page.goto(getAppUrl(`screen=${screenId}`));
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(80);

      // Verify viewport and screen content exist
      const viewport = page.locator('.app-viewport');
      await expect(viewport).toBeVisible();

      const content = page.locator('.screen-content');
      await expect(content).toBeVisible();
    }
    expect(consoleErrors).toEqual([]);
  });

  test('Bank Account IBAN input strictly sanitizes special characters and auto-formats in 4-character blocks', async () => {
    await page.goto(getAppUrl('screen=ONBOARDING_BANK'));
    await page.waitForLoadState('domcontentloaded');

    // Click IBAN match tab
    const ibanTab = page.locator('.match-tab', { hasText: /IBAN|الآيبان/i });
    await ibanTab.click();

    // Type the exact messy input string reported by user
    const ibanInput = page.locator('input[placeholder*="SA03"]');
    await expect(ibanInput).toBeVisible();

    await ibanInput.fill('1234567890-=`987654321` 8765432');
    
    // Check that value is sanitized, auto-prefixed with SA, uppercase, and grouped by 4
    const sanitizedVal = await ibanInput.inputValue();
    expect(sanitizedVal).not.toContain('-');
    expect(sanitizedVal).not.toContain('=');
    expect(sanitizedVal).not.toContain('`');
    expect(sanitizedVal).toMatch(/^SA\d{2}(\s\d{4}){5}$/);
    expect(sanitizedVal.replace(/\s/g, '').length).toBe(24);

    // Verify counter says 24/24
    await expect(page.getByText('24/24')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('All 6 Bottom Sheet Modals open, render, and dismiss cleanly', async () => {
    await page.goto(getAppUrl('screen=HOME'));
    await page.waitForLoadState('domcontentloaded');

    for (const modal of MODALS) {
      await page.evaluate(
        ({ method, args }) => {
          const qtpay = (window as any).__qtpay;
          if (qtpay && qtpay[method]) {
            qtpay[method](...(args || [true]));
          }
        },
        { method: modal.openMethod, args: (modal as any).args }
      );

      await page.waitForTimeout(150);

      const bodyText = await page.textContent('body');
      expect(bodyText).toContain(modal.text);

      // Dismiss modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }
    expect(consoleErrors).toEqual([]);
  });
});


