import { test, expect } from '@playwright/test';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const RECEIPT_PATH =
  process.env.E2E_RECEIPT_PATH || '/admin/income/customer-receipt';
const PAYMENT_PATH =
  process.env.E2E_PAYMENT_PATH || '/admin/expense/supplier-payment';

const describeSmoke = RUN_SMOKE ? test.describe : test.describe.skip;

describeSmoke('Receipt and Payment smoke journey', () => {
  test('logs in and navigates to customer receipts', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run the receipt smoke test',
    );

    // Login
    await page.goto(LOGIN_PATH);
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();

    await page.fill('input#username', username!);
    await page.fill('input#password', password!);

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
    await page.waitForURL(`**${normalizedPostLoginPath}**`, {
      timeout: 180_000,
    });

    // Navigate to customer receipts
    await page.goto(RECEIPT_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.receipt-screen, [class*="receipt"]', {
      timeout: 180_000,
    });

    // Verify the receipt list container is displayed
    const heading = page.locator('h4, .h4').first();
    await expect(heading).toBeVisible({ timeout: 60_000 });
  });

  test('logs in and navigates to supplier payments', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run the payment smoke test',
    );

    // Login
    await page.goto(LOGIN_PATH);
    await page.fill('input#username', username!);
    await page.fill('input#password', password!);

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
    await page.waitForURL(`**${normalizedPostLoginPath}**`, {
      timeout: 180_000,
    });

    // Navigate to supplier payments
    await page.goto(PAYMENT_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.payment-screen, [class*="payment"]', {
      timeout: 180_000,
    });

    // Verify the payment list container is displayed
    const heading = page.locator('h4, .h4').first();
    await expect(heading).toBeVisible({ timeout: 60_000 });
  });
});
