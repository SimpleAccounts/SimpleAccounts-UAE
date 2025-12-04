import { test, expect } from '@playwright/test';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const INVOICE_PATH =
  process.env.E2E_INVOICE_PATH || '/admin/income/customer-invoice';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';

const describeSmoke = RUN_SMOKE ? test.describe : test.describe.skip;

describeSmoke('Auth & Invoice smoke journey', () => {
  test('logs in and opens the invoice workspace', async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run the auth smoke test',
    );

    await page.goto(LOGIN_PATH);
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();

    await page.fill('input#username', username!);
    await page.fill('input#password', password!);
    await page.getByRole('button', { name: /log in/i }).click();

    const normalizedPostLoginPath = POST_LOGIN_PATH.startsWith('/')
      ? POST_LOGIN_PATH
      : `/${POST_LOGIN_PATH}`;
    await page.waitForURL(`**${normalizedPostLoginPath}**`, {
      timeout: 60_000,
    });

    await page.goto(INVOICE_PATH);
    await page.waitForSelector('.customer-invoice-screen', {
      timeout: 60_000,
    });
    await expect(
      page.locator('.customer-invoice-screen .h4 span'),
    ).toContainText(/customer invoices/i);
  });
});


