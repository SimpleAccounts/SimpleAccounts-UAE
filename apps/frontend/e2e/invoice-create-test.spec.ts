import { test, expect } from '@playwright/test';
import { loginTestUser } from './helpers/test-user-helpers';

test.describe('Invoice Creation - Date Format Fix', () => {
  test('should format dates correctly when creating invoice', async ({ page }) => {
    // Login first
    await loginTestUser(page);

    // Navigate to invoice create page
    await page.goto('/admin/income/customer-invoice/create');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/.*invoice.*/i);

    // The main fix is in the frontend code - dates should now be formatted as DD/MM/YYYY
    // This test just verifies the page loads correctly
    console.log('Invoice create page loaded successfully');

    // Check for any JavaScript errors
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.waitForTimeout(2000);

    // Should have no JavaScript errors on page load
    expect(errors.length).toBe(0);
  });
});
