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

    // Screen must NOT advance to SET_PIN or PERMISSIONS or HOME
    const setPinHeading = page.getByText(/Set New Security PIN|Enter New PIN|Set PIN/i);
    await expect(setPinHeading).not.toBeVisible();

    // Verify error alert is displayed and we remain on the verification screen
    await expect(page.getByText(/Simulated backend failure|Verification failed/i).first()).toBeVisible();
    await expect(page.getByText(/Enter 6-Digit Code|Change Mobile Number|Sent via SMS to/i).first()).toBeVisible();
  });
});
