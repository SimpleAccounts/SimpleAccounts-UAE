import { test, expect } from '@playwright/test';
import { loginTestUser } from './helpers/test-user-helpers';

test.describe('Performance Tests', () => {
  test('should measure dashboard loading performance', async ({ page }) => {
    const startTime = Date.now();

    // Login first
    await loginTestUser(page);
    const loginTime = Date.now();

    console.log(`Login took: ${loginTime - startTime}ms`);

    // Navigate to dashboard
    const dashboardStart = Date.now();
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    const dashboardLoadTime = Date.now();

    console.log(`Dashboard load took: ${dashboardLoadTime - dashboardStart}ms`);
    console.log(`Total time: ${dashboardLoadTime - startTime}ms`);

    // Check if dashboard loaded
    await expect(page.locator('text=/dashboard/i')).toBeVisible();

    // Measure time for customer invoice page
    const invoiceStart = Date.now();
    await page.goto('/admin/income/customer-invoice');
    await page.waitForLoadState('networkidle');
    const invoiceLoadTime = Date.now();

    console.log(`Customer invoice page load took: ${invoiceLoadTime - invoiceStart}ms`);

    // Check if invoice page loaded
    await expect(page.locator('text=/customer invoice/i')).toBeVisible();

    // Performance expectations (these might need adjustment based on actual performance)
    expect(dashboardLoadTime - dashboardStart).toBeLessThan(10000); // Less than 10 seconds
    expect(invoiceLoadTime - invoiceStart).toBeLessThan(10000); // Less than 10 seconds
  });
});
