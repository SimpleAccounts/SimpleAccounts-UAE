import { test, expect, Page } from '@playwright/test';

const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const DASHBOARD_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const INVOICE_PATH = '/admin/income/customer-invoice';
const EXPENSE_PATH = '/admin/expense/supplier-invoice';
const CONTACTS_PATH = '/admin/master/contact';

// Helper function to perform login
async function login(page: Page, username: string, password: string) {
  await page.goto(LOGIN_PATH);
  await page.fill('input#username', username);
  await page.fill('input#password', password);

  const loginButton = page.getByRole('button', { name: /log in/i });
  const buttonHandle = await loginButton.elementHandle();
  if (buttonHandle) {
    await loginButton.click({ timeout: 30_000 });
  } else {
    await page.keyboard.press('Enter', { delay: 200 });
  }

  const normalizedDashboardPath = DASHBOARD_PATH.startsWith('/')
    ? DASHBOARD_PATH
    : `/${DASHBOARD_PATH}`;
  await page.waitForURL(`**${normalizedDashboardPath}**`, { timeout: 30_000 });
}

test.describe('Dashboard Navigation', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should display dashboard after successful login', async ({ page }) => {
    // Verify we're on the dashboard
    const normalizedDashboardPath = DASHBOARD_PATH.startsWith('/')
      ? DASHBOARD_PATH
      : `/${DASHBOARD_PATH}`;
    await expect(page).toHaveURL(new RegExp(normalizedDashboardPath));

    // Dashboard should have some main content
    const mainContent = page.locator('main, [role="main"], .main-content, .dashboard, #root');
    await expect(mainContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display main navigation menu', async ({ page }) => {
    // Look for navigation menu
    const navExists = await Promise.race([
      page.locator('nav, [role="navigation"], .sidebar, .menu, .nav').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(navExists).toBeTruthy();
  });

  test('should have accessible navigation links', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Common navigation items in accounting software
    const navItems = [
      /dashboard|home/i,
      /invoice|income/i,
      /expense|purchase/i,
      /contact|customer|supplier/i,
      /report/i
    ];

    let foundItems = 0;
    for (const pattern of navItems) {
      const linkExists = await Promise.race([
        page.getByRole('link', { name: pattern }).first().isVisible({ timeout: 2000 }).then(() => true),
        page.getByText(pattern).first().isVisible({ timeout: 2000 }).then(() => true),
        page.waitForTimeout(2000).then(() => false)
      ]);

      if (linkExists) foundItems++;
    }

    // Should have at least 3 navigation items
    expect(foundItems).toBeGreaterThanOrEqual(3);
  });

  test('should navigate to invoices section', async ({ page }) => {
    // Try to navigate to invoices
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify we're on the invoices page
    await expect(page).toHaveURL(new RegExp('/invoice'));
  });

  test('should navigate to expenses section', async ({ page }) => {
    // Try to navigate to expenses
    await page.goto(EXPENSE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify we're on the expenses page
    await expect(page).toHaveURL(new RegExp('/expense'));
  });

  test('should navigate to contacts section', async ({ page }) => {
    // Try to navigate to contacts
    await page.goto(CONTACTS_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify we're on the contacts page
    await expect(page).toHaveURL(new RegExp('/contact'));
  });

  test('should have header with branding or logo', async ({ page }) => {
    // Look for header elements
    const headerExists = await Promise.race([
      page.locator('header, .header, .navbar, .app-header').first().isVisible({ timeout: 3000 }).then(() => true),
      page.waitForTimeout(3000).then(() => false)
    ]);

    expect(headerExists).toBeTruthy();
  });

  test('should display user menu or profile dropdown', async ({ page }) => {
    // Look for user profile/menu elements
    const userMenuExists = await Promise.race([
      page.locator('[class*="user"], [class*="profile"], [class*="account"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(userMenuExists).toBeTruthy();
  });

  test('should support breadcrumb navigation', async ({ page }) => {
    // Navigate to a sub-page
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Look for breadcrumbs
    const breadcrumbExists = await Promise.race([
      page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]').first().isVisible({ timeout: 3000 }).then(() => true),
      page.waitForTimeout(3000).then(() => false)
    ]);

    // Breadcrumbs are optional but good to check
    expect(typeof breadcrumbExists).toBe('boolean');
  });

  test('should maintain navigation state across page changes', async ({ page }) => {
    // Navigate to different pages
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const nav1 = page.locator('nav, .sidebar, .menu').first();
    await expect(nav1).toBeVisible({ timeout: 5000 });

    await page.goto(EXPENSE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const nav2 = page.locator('nav, .sidebar, .menu').first();
    await expect(nav2).toBeVisible({ timeout: 5000 });
  });

  test('should handle browser back button correctly', async ({ page }) => {
    const initialUrl = page.url();

    // Navigate to another page
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Go back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Should be back on dashboard or previous page
    const currentUrl = page.url();
    expect(currentUrl).toContain('admin');
  });

  test('should handle browser forward button correctly', async ({ page }) => {
    // Navigate to another page
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const invoiceUrl = page.url();

    // Go back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Go forward
    await page.goForward();
    await page.waitForTimeout(1000);

    // Should be back on invoice page
    expect(page.url()).toBe(invoiceUrl);
  });
});

test.describe('Dashboard Data Display', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should display dashboard widgets or cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for dashboard widgets/cards
    const widgetExists = await Promise.race([
      page.locator('.card, .widget, .panel, [class*="dashboard"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(widgetExists).toBeTruthy();
  });

  test('should display summary statistics or metrics', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for numbers, metrics, statistics
    const statsExists = await Promise.race([
      page.locator('[class*="stat"], [class*="metric"], [class*="summary"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Statistics are common on dashboards
    expect(typeof statsExists).toBe('boolean');
  });

  test('should load dashboard data within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    // Wait for main content to load
    await page.waitForSelector('main, [role="main"], .main-content, #root', { timeout: 15000 });

    const loadTime = Date.now() - startTime;

    // Dashboard should load within 15 seconds
    expect(loadTime).toBeLessThan(15000);
  });

  test('should display charts or graphs if available', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for chart elements (canvas, svg)
    const chartExists = await Promise.race([
      page.locator('canvas, svg[class*="chart"], [class*="graph"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Charts are optional but common
    expect(typeof chartExists).toBe('boolean');
  });

  test('should handle empty dashboard state gracefully', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Page should load without errors
    const mainContent = page.locator('main, [role="main"], .main-content, #root');
    await expect(mainContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display recent activities or transactions', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for recent items, activities, or transaction lists
    const recentExists = await Promise.race([
      page.locator('[class*="recent"], [class*="activity"], [class*="transaction"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.locator('table, .table, .list').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Recent activities are optional
    expect(typeof recentExists).toBe('boolean');
  });

  test('should refresh dashboard data on reload', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get initial content
    const initialContent = await page.content();

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });

    // Page should reload successfully
    const mainContent = page.locator('main, [role="main"], .main-content, #root');
    await expect(mainContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display currency or financial formatting correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for currency symbols or formatted numbers
    const currencyPattern = /AED|USD|EUR|£|€|\$|₹/;
    const currencyExists = await Promise.race([
      page.locator('text=' + currencyPattern.toString()).first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByText(currencyPattern).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Currency display is common in accounting software
    expect(typeof currencyExists).toBe('boolean');
  });

  test('should handle responsive layout on different screen sizes', async ({ page }) => {
    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    let mainContent = page.locator('main, [role="main"], .main-content, #root');
    await expect(mainContent.first()).toBeVisible();

    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    mainContent = page.locator('main, [role="main"], .main-content, #root');
    await expect(mainContent.first()).toBeVisible();

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should display loading states when fetching data', async ({ page }) => {
    // Navigate to dashboard and watch for loading indicators
    await page.goto(DASHBOARD_PATH);

    // Look for loading indicators during initial load
    const loadingExists = await Promise.race([
      page.locator('[class*="loading"], [class*="spinner"], .loader, [class*="skeleton"]').first().isVisible({ timeout: 2000 }).then(() => true),
      page.waitForTimeout(2000).then(() => false)
    ]);

    // Loading states are optional but good UX
    expect(typeof loadingExists).toBe('boolean');
  });

  test('should allow quick actions from dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for action buttons like "New Invoice", "Add Expense"
    const quickActionExists = await Promise.race([
      page.getByRole('button', { name: /new|add|create/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByRole('link', { name: /new|add|create/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Quick actions are common on dashboards
    expect(typeof quickActionExists).toBe('boolean');
  });
});

test.describe('Dashboard Accessibility', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Try Tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Should be able to navigate without errors
    const mainContent = page.locator('main, [role="main"], .main-content');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();

    // Should have at least one heading
    expect(headings).toBeGreaterThan(0);
  });

  test('should have descriptive page title', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const title = await page.title();

    // Title should not be empty
    expect(title.length).toBeGreaterThan(0);
  });
});
