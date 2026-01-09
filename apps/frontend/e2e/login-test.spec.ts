import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const LOGIN_EMAIL = process.env.E2E_USERNAME || '';
const LOGIN_PASSWORD = process.env.E2E_PASSWORD || '';

test.describe('Login Test', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Go to login page
    await page.goto(`${BASE_URL}/login`);

    // Wait for login form
    await page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 10000 });

    // Fill in credentials
    await page.fill('input[type="email"], input[name="email"], #email', LOGIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"], #password', LOGIN_PASSWORD);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for successful login - should redirect to dashboard or home
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });

    console.log('Login successful! Redirected to:', page.url());

    // Verify we're no longer on login page
    expect(page.url()).not.toContain('/login');
  });
});
