import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 *
 * Uses Playwright's screenshot comparison to detect visual changes.
 * Run with: npx playwright test visual-regression.spec.ts --update-snapshots
 */

test.describe('Visual Regression Tests', () => {
  test.describe('Login Page', () => {
    test('login page matches baseline @visual', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-page.png', {
        maxDiffPixels: 100,
        threshold: 0.2,
      });
    });

    test('login form validation errors @visual', async ({ page }) => {
      await page.goto('/login');
      await page.click('button[type="submit"]');
      await page.waitForSelector('.error-message');

      await expect(page.locator('form')).toHaveScreenshot('login-validation-errors.png');
    });
  });

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.route('**/api/authenticate', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'test-token', user: { name: 'Test User' } }),
        });
      });
    });

    test('dashboard layout matches baseline @visual', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Wait for charts to render
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('dashboard.png', {
        maxDiffPixels: 200,
        fullPage: true,
      });
    });

    test('dashboard KPI cards @visual', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="kpi-cards"]');

      await expect(page.locator('[data-testid="kpi-cards"]')).toHaveScreenshot('kpi-cards.png');
    });
  });

  test.describe('Invoice Pages', () => {
    test('invoice list page @visual', async ({ page }) => {
      await page.route('**/api/invoices*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, number: 'INV-001', customer: 'ABC Corp', amount: 1000, status: 'PAID' },
            { id: 2, number: 'INV-002', customer: 'XYZ Ltd', amount: 2500, status: 'PENDING' },
          ]),
        });
      });

      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('invoice-list.png');
    });

    test('invoice create form @visual', async ({ page }) => {
      await page.goto('/invoices/create');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('invoice-create-form.png', {
        fullPage: true,
      });
    });

    test('invoice PDF preview @visual', async ({ page }) => {
      await page.route('**/api/invoices/1/preview', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            number: 'INV-001',
            customer: 'ABC Corp',
            items: [{ description: 'Service', amount: 1000 }],
            total: 1050,
            vat: 50,
          }),
        });
      });

      await page.goto('/invoices/1/preview');
      await page.waitForSelector('.pdf-preview');

      await expect(page.locator('.pdf-preview')).toHaveScreenshot('invoice-pdf-preview.png');
    });
  });

  test.describe('Reports', () => {
    test('profit and loss report @visual', async ({ page }) => {
      await page.route('**/api/reports/profit-loss*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            revenue: 100000,
            expenses: 60000,
            netProfit: 40000,
            items: [
              { category: 'Sales', amount: 100000 },
              { category: 'Cost of Goods', amount: -40000 },
              { category: 'Operating Expenses', amount: -20000 },
            ],
          }),
        });
      });

      await page.goto('/reports/profit-loss');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('profit-loss-report.png', {
        fullPage: true,
      });
    });

    test('balance sheet report @visual', async ({ page }) => {
      await page.goto('/reports/balance-sheet');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('balance-sheet-report.png');
    });

    test('VAT report @visual', async ({ page }) => {
      await page.goto('/reports/vat');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('vat-report.png');
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile viewport - dashboard @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dashboard-mobile.png', {
        fullPage: true,
      });
    });

    test('tablet viewport - invoice list @visual', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('invoice-list-tablet.png');
    });

    test('navigation menu - mobile @visual', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-toggle"]');
      await page.waitForSelector('[data-testid="mobile-menu"]');

      await expect(page.locator('[data-testid="mobile-menu"]')).toHaveScreenshot('mobile-menu.png');
    });
  });

  test.describe('Dark Mode', () => {
    test('dashboard in dark mode @visual', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dashboard-dark.png');
    });

    test('invoice form in dark mode @visual', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/invoices/create');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('invoice-form-dark.png');
    });
  });

  test.describe('Component Screenshots', () => {
    test('data table component @visual', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForSelector('table');

      await expect(page.locator('table').first()).toHaveScreenshot('data-table.png');
    });

    test('form inputs @visual', async ({ page }) => {
      await page.goto('/invoices/create');

      const formSection = page.locator('form').first();
      await expect(formSection).toHaveScreenshot('form-inputs.png');
    });

    test('buttons and actions @visual', async ({ page }) => {
      await page.goto('/invoices');

      const actionBar = page.locator('[data-testid="action-bar"]');
      if (await actionBar.count() > 0) {
        await expect(actionBar).toHaveScreenshot('action-buttons.png');
      }
    });

    test('modal dialogs @visual', async ({ page }) => {
      await page.goto('/invoices');

      // Trigger a modal
      await page.click('[data-testid="delete-button"]');
      const modal = page.locator('[data-testid="confirmation-modal"]');

      if (await modal.count() > 0) {
        await expect(modal).toHaveScreenshot('confirmation-modal.png');
      }
    });
  });

  test.describe('Print Styles', () => {
    test('invoice print layout @visual', async ({ page }) => {
      await page.goto('/invoices/1/print');
      await page.emulateMedia({ media: 'print' });
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('invoice-print.png', {
        fullPage: true,
      });
    });

    test('report print layout @visual', async ({ page }) => {
      await page.goto('/reports/profit-loss?print=true');
      await page.emulateMedia({ media: 'print' });

      await expect(page).toHaveScreenshot('report-print.png', {
        fullPage: true,
      });
    });
  });
});

test.describe('Cross-Browser Visual Tests', () => {
  test('dashboard renders consistently @visual', async ({ page, browserName }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(`dashboard-${browserName}.png`, {
      maxDiffPixels: 150,
    });
  });
});
