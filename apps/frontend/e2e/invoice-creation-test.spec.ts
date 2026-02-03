import { test, expect } from '@playwright/test';

test.describe('Invoice Creation - Syntax Fix Verification', () => {
  test('should load invoice create page without 500 syntax errors', async ({ page }) => {
    // Navigate to invoice create page to check if the page loads without 500 errors
    await page.goto('http://localhost:3000/admin/income/customer-invoice/create');

    // Check if the page loads (should redirect to login if not authenticated)
    await expect(page).toHaveURL(/login|admin\/income\/customer-invoice\/create/);

    // The key test: verify NO 500 error occurred (which would indicate syntax error)
    // If we get a 500 error, the page would show an error instead of redirecting to login
    const has500Error = (await page.locator('text=/500|Internal Server Error/i').count()) > 0;
    expect(has500Error).toBe(false);

    // Also check that the page actually loaded (not completely broken)
    const pageLoaded = (await page.locator('body').count()) > 0;
    expect(pageLoaded).toBe(true);

    console.log('✅ Invoice create page loads without 500 syntax errors');
  });

  test('should load invoice list page without syntax errors', async ({ page }) => {
    // Navigate to invoice list page
    await page.goto('http://localhost:3000/admin/income/customer-invoice');

    // Check if the page loads (should redirect to login if not authenticated)
    await expect(page).toHaveURL(/login|admin\/income\/customer-invoice/);

    // Verify NO 500 error occurred
    const has500Error = (await page.locator('text=/500|Internal Server Error/i').count()) > 0;
    expect(has500Error).toBe(false);

    console.log('✅ Invoice list page loads without 500 syntax errors');
  });
});
