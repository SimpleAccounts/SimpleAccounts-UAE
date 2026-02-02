import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8080';
const RESET_PASSWORD_PATH = '/reset-password';
const LOGIN_PATH = '/login';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = 'Test)(*098';

test.describe('Reset Password Flow (End-User Perspective)', () => {
  test('should request password reset and complete flow using token from API', async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000); // 3 minutes

    console.log(`Testing password reset for email: ${TEST_EMAIL}`);

    // Step 1: Request password reset with X-Return-Token header (for E2E testing only)
    // This simulates what a real user would do - request password reset
    // In production, the token would be sent via email only
    console.log('Requesting password reset token...');
    const forgotPasswordResponse = await request.post(`${API_URL}/public/forgotPassword`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Return-Token': 'true', // Test header - only present in E2E tests
      },
      data: {
        username: TEST_EMAIL,
        url: BASE_URL,
      },
    });

    if (forgotPasswordResponse.status() >= 500) {
      const body = await forgotPasswordResponse.text().catch(() => '');
      throw new Error(
        `Server error during password reset request: ${forgotPasswordResponse.status()} - ${body.substring(0, 500)}`
      );
    }

    if (forgotPasswordResponse.status() === 401) {
      console.warn(`User not found (401) for email: ${TEST_EMAIL}`);
      test.skip(); // Skip test if user doesn't exist
      return;
    }

    if (!forgotPasswordResponse.ok()) {
      const body = await forgotPasswordResponse.text().catch(() => '');
      throw new Error(
        `Failed to request password reset: ${forgotPasswordResponse.status()} - ${body.substring(0, 500)}`
      );
    }

    // Step 2: Extract token from API response (end-user perspective: token would come from email link)
    let token: string | null = null;
    try {
      const responseBody = await forgotPasswordResponse.json();
      if (responseBody && responseBody.token) {
        token = responseBody.token;
        console.log(`✅ Token extracted from API response (${token.length} characters)`);
      }
    } catch (e) {
      // Response might be empty (200 OK with no body in production mode)
      console.warn('Token not in response (production mode) - this is expected behavior');
    }

    if (!token || token.trim().length === 0) {
      throw new Error(
        'Token not returned in response. Ensure X-Return-Token header is sent and backend is configured for testing.'
      );
    }

    // Step 3: Navigate to reset password page with token (simulating user clicking email link)
    console.log('Navigating to reset password page with token...');
    await page.goto(`${BASE_URL}${RESET_PASSWORD_PATH}?token=${token}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(2000);

    // Step 4: Verify we're on the reset password form
    const passwordInput = page.locator('#password');
    const passwordVisible = await passwordInput.isVisible({ timeout: 10_000 }).catch(() => false);

    if (!passwordVisible) {
      throw new Error('Password input not visible - token might be invalid or expired');
    }

    // Step 5: Fill in new password
    console.log('Filling in new password...');
    await passwordInput.clear();
    await passwordInput.type(TEST_PASSWORD, { delay: 50 });
    await passwordInput.blur();
    await page.waitForTimeout(1000);

    const confirmPasswordInput = page.locator('#confirmPassword');
    await confirmPasswordInput.clear();
    await confirmPasswordInput.type(TEST_PASSWORD, { delay: 50 });
    await confirmPasswordInput.blur();
    await page.waitForTimeout(1000);

    // Step 6: Monitor reset password API call
    let resetPasswordResponse: any = null;
    const resetPasswordPromise = page
      .waitForResponse(
        response => response.url().includes('/public/resetPassword') && response.status() < 500,
        { timeout: 30_000 }
      )
      .catch(() => null);

    // Submit reset password form
    console.log('Submitting reset password form...');
    const resetSubmitButton = page.getByRole('button', { name: /reset password|create password/i });
    const isDisabled = await resetSubmitButton.isDisabled().catch(() => false);

    if (isDisabled) {
      throw new Error('Reset button is disabled - form validation might be preventing submission');
    }

    await resetSubmitButton.click();

    // Wait for API response
    resetPasswordResponse = await resetPasswordPromise;

    if (resetPasswordResponse) {
      const status = resetPasswordResponse.status();
      console.log(`Reset Password API Response Status: ${status}`);

      if (status >= 500) {
        const body = await resetPasswordResponse.text().catch(() => '');
        throw new Error(
          `Reset password failed with server error ${status}: ${body.substring(0, 500)}`
        );
      }

      if (status !== 200) {
        const body = await resetPasswordResponse.text().catch(() => '');
        console.warn(`Reset Password Response (${status}):`, body.substring(0, 500));
      }
    } else {
      console.warn(
        'No reset password response received - checking if form submission succeeded...'
      );
      await page.waitForTimeout(5000);
    }

    // Step 7: Verify password was changed by logging in with new password
    console.log('Verifying password reset by attempting to login...');
    await page.goto(`${BASE_URL}${LOGIN_PATH}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#email-input', { state: 'visible', timeout: 10_000 });

    await page.locator('#email-input').fill(TEST_EMAIL);
    await page.locator('#password-input').fill(TEST_PASSWORD);

    const loginButton = page.getByRole('button', { name: /log in|login/i });
    await loginButton.click();

    await page.waitForTimeout(5000);

    // Check if login was successful (should redirect to dashboard or show success toast)
    const currentUrl = page.url();
    const onDashboard = currentUrl.includes('/admin') || currentUrl.includes('/dashboard');
    const loginSuccessToast = await page
      .locator('.Toastify__toast--success')
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (onDashboard || loginSuccessToast) {
      console.log('✅ Password reset successful! Login with new password works.');
      expect(true).toBeTruthy();
    } else {
      throw new Error('Password reset may have failed - login with new password did not work');
    }
  });
});
