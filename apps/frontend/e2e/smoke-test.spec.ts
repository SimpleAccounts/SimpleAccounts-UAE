import { test, expect } from '@playwright/test';
import { getTestUserCredentials } from './helpers/test-user-helpers';

test.describe('Smoke Tests', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/SimpleAccounts/);
  });

  test('should load dashboard after login', async ({ page }) => {
    const { username, password } = getTestUserCredentials();

    await page.goto('http://localhost:3000');

    // Fill login form
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    // Click login
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/admin/dashboard', { timeout: 30000 });

    // Check if dashboard loaded
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
  });
});
