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

    // Verify all dashboard sections are present
    // Check for charts (canvas elements from Chart.js)
    const charts = page.locator('canvas');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);

    // Verify grid layout exists (Tailwind grid)
    const grid = page.locator('.grid.md\\:grid-cols-2, .grid');
    await expect(grid.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display all dashboard sections', async ({ page }) => {
    const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
    
    // Navigate to login page
    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    // Login
    await page.fill('input[name="username"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to admin area
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    
    // Navigate to dashboard if not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard')) {
      await page.goto(`${baseUrl}/admin/dashboard`);
      await page.waitForLoadState('networkidle');
    }
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify dashboard sections are present
    // Check for cards (shadcn/ui Card components)
    const cards = page.locator('[class*="card"], .card, [data-testid*="card"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Verify charts are rendered
    const charts = page.locator('canvas');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
    
    // Navigate to login page
    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    // Login
    await page.fill('input[name="username"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    
    // Navigate to dashboard
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard')) {
      await page.goto(`${baseUrl}/admin/dashboard`);
      await page.waitForLoadState('networkidle');
    }
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const dashboardScreenMobile = page.locator('.dashboard-screen');
    await expect(dashboardScreenMobile).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    const grid = page.locator('.grid');
    await expect(grid.first()).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(grid.first()).toBeVisible();
  });
});
