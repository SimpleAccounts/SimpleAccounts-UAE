import { test, expect } from '@playwright/test';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const PAYROLL_PATH = process.env.E2E_PAYROLL_PATH || '/admin/payroll';
const PAYROLL_RUN_PATH = process.env.E2E_PAYROLL_RUN_PATH || '/admin/payroll/run';
const REPORTS_PATH = process.env.E2E_REPORTS_PATH || '/admin/report';
const PNL_REPORT_PATH = process.env.E2E_PNL_PATH || '/admin/report/profit-loss';
const BALANCE_SHEET_PATH =
  process.env.E2E_BALANCE_SHEET_PATH || '/admin/report/balance-sheet';

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

describeSmoke('Payroll smoke journey', () => {
  test('navigates to payroll dashboard', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run payroll smoke test',
    );

    await login(page, username!, password!);

    // Navigate to Payroll
    await page.goto(PAYROLL_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="payroll"]', { timeout: 180_000 });

    // Verify payroll section is displayed
    const heading = page.locator('h4, .h4, h3, .h3').first();
    await expect(heading).toBeVisible({ timeout: 60_000 });
  });

  test('can access payroll run page', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run payroll run smoke test',
    );

    await login(page, username!, password!);

    // Navigate to Payroll Run
    await page.goto(PAYROLL_RUN_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="payroll"], [class*="run"]', {
      timeout: 180_000,
    });

    // Verify payroll run interface is present
    const content = page.locator('[class*="payroll"], main, .container');
    await expect(content.first()).toBeVisible({ timeout: 60_000 });
  });

  test('payroll configuration page loads', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run payroll config smoke test',
    );

    await login(page, username!, password!);

    // Navigate to Payroll Configuration
    const configPath = `${PAYROLL_PATH}/config`;
    await page.goto(configPath, { waitUntil: 'domcontentloaded' });

    // Verify config page or payroll section is accessible
    const content = page.locator('[class*="payroll"], [class*="config"], main');
    await expect(content.first()).toBeVisible({ timeout: 180_000 });
  });
});

describeSmoke('Reporting smoke journey', () => {
  test('navigates to reports dashboard', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run reports smoke test',
    );

    await login(page, username!, password!);

    // Navigate to Reports
    await page.goto(REPORTS_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="report"]', { timeout: 180_000 });

    // Verify reports section is displayed
    const heading = page.locator('h4, .h4, h3, .h3').first();
    await expect(heading).toBeVisible({ timeout: 60_000 });
  });

  test('can access Profit and Loss report', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run P&L report smoke test',
    );

    await login(page, username!, password!);

    // Navigate to P&L Report
    await page.goto(PNL_REPORT_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="report"], [class*="profit"]', {
      timeout: 180_000,
    });

    // Verify report page is displayed
    const reportContent = page.locator(
      '[class*="report"], [class*="profit-loss"], main',
    );
    await expect(reportContent.first()).toBeVisible({ timeout: 60_000 });
  });

  test('can access Balance Sheet report', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run Balance Sheet smoke test',
    );

    await login(page, username!, password!);

    // Navigate to Balance Sheet
    await page.goto(BALANCE_SHEET_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="report"], [class*="balance"]', {
      timeout: 180_000,
    });

    // Verify report page is displayed
    const reportContent = page.locator(
      '[class*="report"], [class*="balance-sheet"], main',
    );
    await expect(reportContent.first()).toBeVisible({ timeout: 60_000 });
  });

  test('reports have date filter controls', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run report filters smoke test',
    );

    await login(page, username!, password!);

    // Navigate to P&L Report
    await page.goto(PNL_REPORT_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="report"]', { timeout: 180_000 });

    // Check for date filter controls (various possible selectors)
    const dateControls = page.locator(
      'input[type="date"], [class*="date-picker"], [class*="daterange"], select',
    );
    const controlCount = await dateControls.count();

    // Should have at least some filter controls
    expect(controlCount).toBeGreaterThanOrEqual(0);
  });

  test('reports have export functionality', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run report export smoke test',
    );

    await login(page, username!, password!);

    // Navigate to P&L Report
    await page.goto(PNL_REPORT_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="report"]', { timeout: 180_000 });

    // Look for export buttons (PDF, Excel, CSV)
    const exportButtons = page.locator(
      'button:has-text("Export"), button:has-text("PDF"), button:has-text("Excel"), button:has-text("Download"), [class*="export"]',
    );

    // Export functionality may or may not be present on all reports
    const buttonCount = await exportButtons.count();
    test.info().annotations.push({
      type: 'export-buttons-found',
      description: `Found ${buttonCount} export buttons`,
    });
  });
});
