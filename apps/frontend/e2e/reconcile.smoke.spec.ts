import { test, expect } from '@playwright/test';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const BANK_ACCOUNTS_PATH =
  process.env.E2E_BANK_ACCOUNTS_PATH || '/admin/banking/bank-account';
const TRANSACTION_PATH =
  process.env.E2E_TRANSACTION_PATH || '/admin/banking/bank-account/transaction';
const RECONCILE_PATH =
  process.env.E2E_RECONCILE_PATH ||
  '/admin/banking/bank-account/transaction/reconcile';

const describeSmoke = RUN_SMOKE ? test.describe : test.describe.skip;

describeSmoke('Bank reconciliation smoke journey', () => {
  test('navigates to reconciliation form and submits closing balance', async ({
    page,
  }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run the reconciliation smoke test',
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

    await page.waitForURL(`**${normalizePath(POST_LOGIN_PATH)}**`, {
      timeout: 180_000,
    });

    // Navigate to bank accounts
    await page.goto(BANK_ACCOUNTS_PATH, { waitUntil: 'domcontentloaded' });

    const accountLocator = page
      .locator('.bank-account-screen .label-bank')
      .first();
    const accountCount = await page
      .locator('.bank-account-screen .label-bank')
      .count();
    test.skip(accountCount === 0, 'No bank accounts available to reconcile');
    await expect(accountLocator).toBeVisible({ timeout: 180_000 });

    const accountNumber = (await accountLocator.textContent())?.trim();
    await accountLocator.click();

    // Bank transactions view
    await page.waitForURL(`**${normalizePath(TRANSACTION_PATH)}**`, {
      timeout: 180_000,
    });
    await page.waitForSelector('.bank-transaction-screen', {
      timeout: 180_000,
    });

    const balanceLocator = page
      .locator('.status-panel h5', { hasText: /Current Bank Balance/i })
      .locator('xpath=../h3');
    await expect(balanceLocator).toBeVisible({ timeout: 180_000 });
    const balanceText = (await balanceLocator.textContent()) ?? '';
    const closingBalance = normalizeCurrency(balanceText);

    const reconcileButton = page
      .getByRole('button', { name: /reconcile/i })
      .first();
    await expect(reconcileButton).toBeVisible({ timeout: 60_000 });
    await reconcileButton.click();

    // Reconciliation form
    await page.waitForURL(`**${normalizePath(RECONCILE_PATH)}**`, {
      timeout: 180_000,
    });
    await page.waitForSelector('.detail-bank-transaction-screen', {
      timeout: 180_000,
    });

    await page.fill('input#closingBalance', closingBalance);
    const today = formatDate(new Date());
    await page.fill('input#date', today);

    const submitButton = page
      .getByRole('button', { name: /reconcile/i })
      .first();
    await submitButton.click();

    const toast = page.locator('.Toastify__toast-body').first();
    await expect(toast).toBeVisible({ timeout: 120_000 });
    test.info().annotations.push({
      type: 'reconciled-account',
      description: accountNumber || 'unknown',
    });
  });
});

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function normalizeCurrency(value?: string | null): string {
  if (!value) {
    return '0';
  }
  const digitsOnly = value.replace(/[^\d.-]/g, '');
  return digitsOnly.length ? digitsOnly : '0';
}

function normalizePath(path: string): string {
  if (!path) {
    return '/';
  }
  if (path.startsWith('http')) {
    return path;
  }
  return path.startsWith('/') ? path : `/${path}`;
}








