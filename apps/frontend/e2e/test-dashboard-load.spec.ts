import { test, expect } from '@playwright/test';

test.describe('Dashboard Loading', () => {
  test('should load dashboard page after login', async ({ page }) => {
    const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
    
    // Navigate to login page
    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    // Login
    await page.fill('input[name="username"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to admin area (might be /admin or /admin/dashboard)
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    
    // Navigate to dashboard if not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard')) {
      await page.goto(`${baseUrl}/admin/dashboard`);
      await page.waitForLoadState('networkidle');
    }
    
    // Verify dashboard loads without errors
    await page.waitForLoadState('networkidle');
    
    // Check for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    // Filter out non-critical warnings (reactstrap defaultProps warnings)
    const criticalErrors = errors.filter(
      err => !err.includes('defaultProps') && !err.includes('findDOMNode')
    );
    
    expect(criticalErrors).toHaveLength(0);
    
    // Verify dashboard content is present
    const dashboardScreen = page.locator('.dashboard-screen');
    await expect(dashboardScreen).toBeVisible({ timeout: 10000 });
  });
});
