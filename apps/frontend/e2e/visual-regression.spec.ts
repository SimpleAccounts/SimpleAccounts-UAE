import { test, expect } from '@playwright/test';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';

const describeSmoke = RUN_SMOKE ? test.describe : test.describe.skip;

async function login(page: any, username: string, password: string) {
  await page.goto(LOGIN_PATH);
  await page.fill('input#username', username);
  await page.fill('input#password', password);

  const loginButton = page.getByRole('button', { name: /log in/i });
  const buttonHandle = await loginButton.elementHandle();
  if (buttonHandle) {
    await loginButton.click({ timeout: 180_000 });
  } else {
    await page.keyboard.press('Enter', { delay: 200 });
  }

  const normalizedPostLoginPath = POST_LOGIN_PATH.startsWith('/')
    ? POST_LOGIN_PATH
    : `/${POST_LOGIN_PATH}`;
  await page.waitForURL(`**${normalizedPostLoginPath}**`, { timeout: 180_000 });
}

test.describe('Visual Regression - Login Page', () => {
  test('login page visual appearance', async ({ page }) => {
    await page.goto(LOGIN_PATH);
    await page.waitForSelector('input#username, input[name="username"]', {
      timeout: 30_000,
    });

    // Wait for any animations to complete
    await page.waitForTimeout(500);

    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixels: 500, // Allow some difference for anti-aliasing
      threshold: 0.3,
    });
  });

  test('login form visual appearance', async ({ page }) => {
    await page.goto(LOGIN_PATH);
    await page.waitForSelector('input#username, input[name="username"]', {
      timeout: 30_000,
    });

    const loginForm = page.locator('form, [class*="login-form"], [class*="auth"]');
    await expect(loginForm.first()).toHaveScreenshot('login-form.png', {
      maxDiffPixels: 200,
    });
  });
});

describeSmoke('Visual Regression - Dashboard', () => {
  test('dashboard visual appearance', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run dashboard visual test',
    );

    await login(page, username!, password!);

    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle', { timeout: 60_000 });
    await page.waitForTimeout(1000); // Wait for charts to render

    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
      maxDiffPixels: 1000, // Dashboards can have dynamic data
      threshold: 0.4,
    });
  });

  test('dashboard header visual appearance', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'Set credentials to run header visual test');

    await login(page, username!, password!);
    await page.waitForLoadState('networkidle', { timeout: 60_000 });

    const header = page.locator('header, [class*="header"], nav').first();
    await expect(header).toHaveScreenshot('dashboard-header.png', {
      maxDiffPixels: 300,
    });
  });

  test('dashboard sidebar visual appearance', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'Set credentials to run sidebar visual test');

    await login(page, username!, password!);
    await page.waitForLoadState('networkidle', { timeout: 60_000 });

    const sidebar = page.locator('[class*="sidebar"], aside, [class*="nav"]').first();
    const sidebarCount = await sidebar.count();

    if (sidebarCount > 0) {
      await expect(sidebar).toHaveScreenshot('dashboard-sidebar.png', {
        maxDiffPixels: 300,
      });
    }
  });
});

describeSmoke('Visual Regression - Invoice Page', () => {
  test('invoice list visual appearance', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    const invoicePath = '/admin/income/customer-invoice';

    test.skip(!username || !password, 'Set credentials to run invoice visual test');

    await login(page, username!, password!);

    await page.goto(invoicePath, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.customer-invoice-screen, [class*="invoice"]', {
      timeout: 180_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 });

    // Screenshot of invoice list
    await expect(page).toHaveScreenshot('invoice-list.png', {
      fullPage: true,
      maxDiffPixels: 1000,
      threshold: 0.4,
    });
  });

  test('invoice create form visual appearance', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    const createPath = '/admin/income/customer-invoice/create';

    test.skip(!username || !password, 'Set credentials to run invoice form visual test');

    await login(page, username!, password!);

    await page.goto(createPath, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('form, [class*="create"]', { timeout: 180_000 });
    await page.waitForLoadState('networkidle', { timeout: 30_000 });

    // Screenshot of invoice creation form
    await expect(page).toHaveScreenshot('invoice-create-form.png', {
      fullPage: true,
      maxDiffPixels: 800,
      threshold: 0.3,
    });
  });
});

describeSmoke('Visual Regression - Reports', () => {
  test('profit and loss report visual appearance', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    const pnlPath = '/admin/report/profit-loss';

    test.skip(!username || !password, 'Set credentials to run P&L visual test');

    await login(page, username!, password!);

    await page.goto(pnlPath, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="report"], [class*="profit"]', {
      timeout: 180_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 });
    await page.waitForTimeout(1000); // Wait for data to render

    await expect(page).toHaveScreenshot('profit-loss-report.png', {
      fullPage: true,
      maxDiffPixels: 1500, // Reports can have variable data
      threshold: 0.5,
    });
  });
});

describeSmoke('Visual Regression - Components', () => {
  test('button styles visual appearance', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'Set credentials to run button visual test');

    await login(page, username!, password!);

    // Navigate to a page with buttons
    const invoicePath = '/admin/income/customer-invoice';
    await page.goto(invoicePath, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button, .btn', { timeout: 180_000 });

    // Screenshot of primary action buttons
    const actionButtons = page.locator('.btn-primary, button[class*="primary"]').first();
    const buttonCount = await actionButtons.count();

    if (buttonCount > 0) {
      await expect(actionButtons).toHaveScreenshot('primary-button.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('table styles visual appearance', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'Set credentials to run table visual test');

    await login(page, username!, password!);

    // Navigate to a page with data table
    const invoicePath = '/admin/income/customer-invoice';
    await page.goto(invoicePath, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table, [class*="table"], [class*="grid"]', {
      timeout: 180_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 });

    // Screenshot of table
    const table = page.locator('table, [class*="table"], [class*="grid"]').first();
    const tableCount = await table.count();

    if (tableCount > 0) {
      await expect(table).toHaveScreenshot('data-table.png', {
        maxDiffPixels: 500,
        threshold: 0.4,
      });
    }
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test('login page on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto(LOGIN_PATH);
    await page.waitForSelector('input#username, input[name="username"]', {
      timeout: 30_000,
    });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('login-mobile.png', {
      maxDiffPixels: 300,
      threshold: 0.3,
    });
  });

  test('login page on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    await page.goto(LOGIN_PATH);
    await page.waitForSelector('input#username, input[name="username"]', {
      timeout: 30_000,
    });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('login-tablet.png', {
      maxDiffPixels: 400,
      threshold: 0.3,
    });
  });
});
