import { test, expect } from '@playwright/test';

test.describe('Simple Invoice Tests', () => {
  test('should load invoice create page (will redirect to login)', async ({ page }) => {
    // Try to access invoice create page directly
    await page.goto('http://localhost:3000/admin/income/customer-invoice/create');

    // Should redirect to login or show login page
    await page.waitForURL(/login/, { timeout: 10000 }).catch(() => {
      // If no redirect, check if we're on login page
      expect(page.url()).toMatch(/login/);
    });

    console.log('Current URL:', page.url());
  });

  test('should check backend health', async ({ page }) => {
    // Check if backend is responding
    const response = await page.request.get('http://localhost:8080/rest/health');
    expect(response.status()).toBe(200);
  });

  test('should check invoice API endpoint exists', async ({ page }) => {
    // Try to access invoice save endpoint (should return 401 unauthorized)
    const response = await page.request.post('http://localhost:8080/rest/invoice/save', {
      data: {},
    });

    // Should return 401 (unauthorized) or 400 (bad request), not 404
    expect([401, 400]).toContain(response.status());
  });
});
