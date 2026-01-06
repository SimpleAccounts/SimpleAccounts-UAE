import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Login/Register Screen Accessibility', () => {
  test('should open login or register screen', async ({ page }) => {
    // Navigate to the root URL
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Wait for either login or register page to load
    const result = await Promise.race([
      page.waitForSelector('#email-input', { timeout: 10000 }).then(() => 'login' as const),
      page.waitForSelector('#companyName', { timeout: 10000 }).then(() => 'register' as const),
    ]).catch(() => null);

    // Verify that we landed on either login or register page
    expect(result).not.toBeNull();

    if (result === 'login') {
      console.log('✓ Login screen loaded successfully');
      // Verify key login elements
      await expect(page.locator('#email-input')).toBeVisible();
      await expect(page.locator('#password-input')).toBeVisible();
      await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    } else if (result === 'register') {
      console.log('✓ Register screen loaded successfully');
      // Verify key register elements
      await expect(page.locator('#companyName')).toBeVisible();
    }
  });

  test('should navigate to /login and show appropriate screen', async ({ page }) => {
    // Navigate directly to login path
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    // Should show either login or register (if no company exists)
    const result = await Promise.race([
      page.waitForSelector('#email-input', { timeout: 10000 }).then(() => 'login' as const),
      page.waitForSelector('#companyName', { timeout: 10000 }).then(() => 'register' as const),
    ]).catch(() => null);

    expect(result).not.toBeNull();

    if (result === 'login') {
      console.log('✓ /login shows login screen');
      await expect(page).toHaveURL(/.*login.*/);
    } else {
      console.log('✓ /login redirects to register (no company exists)');
      await expect(page).toHaveURL(/.*register.*/);
    }
  });

  test('should navigate to /register and show register screen', async ({ page }) => {
    // Navigate directly to register path
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

    // Should show register screen
    const companyNameField = await page
      .waitForSelector('#companyName', { timeout: 10000 })
      .catch(() => null);

    expect(companyNameField).not.toBeNull();
    console.log('✓ /register shows register screen');

    // Verify register form elements
    await expect(page.locator('#companyName')).toBeVisible();
    await expect(page).toHaveURL(/.*register.*/);
  });
});
