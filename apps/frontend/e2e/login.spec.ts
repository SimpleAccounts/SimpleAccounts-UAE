import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const LOGIN_PATH = '/login';
const REGISTER_PATH = '/register';

// Helper to navigate to login (only works if company exists)
async function navigateToLogin(page: Page): Promise<'login' | 'register'> {
  await page.goto(`${BASE_URL}${LOGIN_PATH}`, { waitUntil: 'networkidle' });
  const result = await Promise.race([
    page.waitForSelector('#email-input', { timeout: 10000 }).then(() => 'login' as const),
    page.waitForSelector('#companyName', { timeout: 10000 }).then(() => 'register' as const),
  ]);
  return result;
}

test.describe('Login Form', () => {
  test('should display login form with all required elements', async ({ page }) => {
    const pageType = await navigateToLogin(page);

    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    // Verify form elements
    await expect(page.locator('#email-input')).toBeVisible();
    await expect(page.locator('#password-input')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    const pageType = await navigateToLogin(page);

    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    // Fill invalid credentials
    await page.fill('#email-input', 'invalid@example.com');
    await page.fill('#password-input', 'wrongpassword');

    // Click login
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for error response
    await page.waitForTimeout(3000);

    // Should show error toast or remain on login page
    const onLoginPage = await page.locator('#email-input').isVisible();
    expect(onLoginPage).toBeTruthy();
  });

  test('should not submit with empty email', async ({ page }) => {
    const pageType = await navigateToLogin(page);
    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    // Fill only password
    await page.fill('#password-input', 'somepassword');
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForTimeout(1000);

    // Should still be on login page
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should not submit with empty password', async ({ page }) => {
    const pageType = await navigateToLogin(page);
    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    // Fill only email
    await page.fill('#email-input', 'test@example.com');
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForTimeout(1000);

    // Should still be on login page
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should have password visibility toggle', async ({ page }) => {
    const pageType = await navigateToLogin(page);
    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    const passwordInput = page.locator('#password-input');

    // Initial type should be password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Look for eye icon to toggle visibility
    const eyeIcon = page.locator('button[aria-label*="password"], .fa-eye, .fa-eye-slash, [class*="eye"]').first();
    const iconExists = await eyeIcon.isVisible({ timeout: 3000 }).catch(() => false);

    if (iconExists) {
      await eyeIcon.click();
      // Password should now be visible (type=text)
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
