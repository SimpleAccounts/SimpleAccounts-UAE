import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Registration Redirect', () => {
  test('should redirect to login when company already exists', async ({ page }) => {
    // Go to register page
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });

    // Wait for redirect to login page
    await page.waitForURL('**/login', { timeout: 15000 });

    // Verify we are on login page
    expect(page.url()).toContain('/login');
  });
});
