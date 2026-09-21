import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const E2E_INDEX_HTML = fs.existsSync(path.resolve(process.cwd(), 'dist-e2e/index.html'))
  ? path.resolve(process.cwd(), 'dist-e2e/index.html')
  : path.resolve(process.cwd(), 'dist/index.html');
const NORMAL_INDEX_HTML = path.resolve(process.cwd(), 'dist/index.html');

const getE2EAppUrl = (query = '') => `file://${E2E_INDEX_HTML}${query ? `?${query}` : ''}`;
const getNormalAppUrl = (query = '') => `file://${NORMAL_INDEX_HTML}${query ? `?${query}` : ''}`;

test.describe('Audit Item 2: Security & Authentication Hardening', () => {
  test('normal production build dist/index.html does not expose window.__qtpay', async ({ page }) => {
    await page.goto(getNormalAppUrl());
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(100);

    const qtpay = await page.evaluate(() => (window as any).__qtpay);
    expect(qtpay).toBeUndefined();
  });

  test('/?screen=HOME lands on SPLASH in normal production build (no URL screen bypass)', async ({ page }) => {
    await page.goto(getNormalAppUrl('screen=HOME'));
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(100);

    // Should NOT show HOME screen content
    const homeQuickActions = page.getByText('Quick Actions');
    await expect(homeQuickActions).not.toBeVisible();

    // Should land on SPLASH screen or onboarding flow, not HOME
    const homeNav = page.locator('nav[role="navigation"]');
    await expect(homeNav).not.toBeVisible();
  });

  test('PIN 1234 is rejected when the user set 4821', async ({ page }) => {
    await page.goto(getE2EAppUrl());
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof (window as any).__qtpay?.verifyUserPin === 'function');

    const result = await page.evaluate(() => {
      const qtpay = (window as any).__qtpay;
      qtpay.setUserPin('4821');
      const is1234Rejected = !qtpay.verifyUserPin('1234');
      const is0000Rejected = !qtpay.verifyUserPin('0000');
      const is1111Rejected = !qtpay.verifyUserPin('1111');
      const is9999Rejected = !qtpay.verifyUserPin('9999');
      const isCorrectPinAccepted = qtpay.verifyUserPin('4821');
      return is1234Rejected && is0000Rejected && is1111Rejected && is9999Rejected && isCorrectPinAccepted;
    });

    expect(result).toBe(true);
  });

  test('the OTP screen does not advance when /api/auth/otp/verify returns 500', async ({ page }) => {
    // Intercept /api/auth/otp/verify to return 500 Internal Server Error
    await page.route('**/api/auth/otp/verify', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'INTERNAL_SERVER_ERROR',
          error: 'Simulated backend failure',
        }),
      });
    });

    // Load app and navigate to SMS_OTP screen
    await page.goto(getE2EAppUrl());
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof (window as any).__qtpay?.navigateTo === 'function');
    await page.evaluate(() => {
      (window as any).__qtpay.navigateTo('SMS_OTP', {
        mobile: '+966501234567',
        nationalNumber: '501234567',
        callingCode: '+966',
        name: 'Fahad Al-Harbi',
      });
    });
    await page.waitForTimeout(150);

    // Fill OTP code
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).toBeVisible({ timeout: 5000 });
    const digits = ['5', '8', '2', '9', '0', '4'];
    for (let i = 0; i < 6; i++) {
      await inputs.nth(i).fill(digits[i]);
    }

    // Click Verify
    const verifyBtn = page.getByRole('button', { name: /Verify/i });
    await verifyBtn.click();
    await page.waitForTimeout(500);

    // Verify error alert is displayed and we remain on the verification screen
    await expect(page.getByText(/Simulated backend failure|Verification failed/i).first()).toBeVisible();
    await expect(page.getByText(/Enter 6-Digit Code|Change Mobile Number|Sent via SMS to/i).first()).toBeVisible();
  });

  test('COOLDOWN_ACTIVE response from /api/auth/otp/send navigates to OTP screen instead of showing error', async ({ page }) => {
    // Intercept /api/auth/otp/send to simulate cooldown already active
    await page.route('**/api/auth/otp/send', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'COOLDOWN_ACTIVE',
          error: 'Please wait 42 seconds before requesting a new code.',
          retryAfter: 42,
        }),
      });
    });

    // Use E2E build + navigateTo bridge to reach MOBILE_NUMBER
    await page.goto(getE2EAppUrl());
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof (window as any).__qtpay?.navigateTo === 'function');
    await page.evaluate(() => {
      (window as any).__qtpay.navigateTo('MOBILE_NUMBER');
    });
    await page.waitForTimeout(300);

    // Fill form using the known IDs
    await expect(page.locator('#fullname-input')).toBeVisible({ timeout: 5000 });
    await page.locator('#fullname-input').fill('Test User');
    await page.locator('#mobile-input').fill('501234567');

    // Submit
    const submitBtn = page.getByRole('button', { name: /Get OTP|Continue|متابعة|الحصول على رمز التحقق/i });
    await submitBtn.click();
    await page.waitForTimeout(1500);

    // Must land on OTP screen (COOLDOWN_ACTIVE should forward, not block)
    const otpScreen = page.getByText(/Enter 6-Digit Code|Sent via SMS|Change Mobile Number|Verification Code/i).first();
    await expect(otpScreen).toBeVisible({ timeout: 5000 });

    // Must NOT show the "Please wait 42 seconds" error on the phone screen
    const errorBanner = page.getByText(/Please wait 42 seconds/i);
    await expect(errorBanner).not.toBeVisible();
  });

  test('a failed send (500) does not block an immediate retry — no cooldown started', async ({ page }) => {
    let callCount = 0;
    await page.route('**/api/auth/otp/send', async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: 'Failed to complete OTP request. Please try again.',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'OTP sent successfully',
            phone: '+966501234567',
            resendCooldown: 60,
          }),
        });
      }
    });

    await page.goto(getE2EAppUrl());
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof (window as any).__qtpay?.navigateTo === 'function');
    await page.evaluate(() => {
      (window as any).__qtpay.navigateTo('MOBILE_NUMBER');
    });
    await page.waitForTimeout(300);

    await expect(page.locator('#fullname-input')).toBeVisible({ timeout: 5000 });
    await page.locator('#fullname-input').fill('Test User');
    await page.locator('#mobile-input').fill('501234567');

    const submitBtn = page.getByRole('button', { name: /Get OTP|Continue|متابعة|الحصول على رمز التحقق/i });

    // First tap — server returns 500, error shown
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Should see the error, not OTP screen
    const errorMsg = page.getByText(/Failed to complete|Failed to send|server error/i).first();
    await expect(errorMsg).toBeVisible({ timeout: 3000 });

    // Second tap — should succeed immediately (no cooldown was recorded)
    await submitBtn.click();
    await page.waitForTimeout(1500);

    // Must navigate to OTP screen, not show COOLDOWN_ACTIVE
    const cooldownMsg = page.getByText(/Please wait.*seconds/i);
    await expect(cooldownMsg).not.toBeVisible();

    expect(callCount).toBe(2);
  });
});
