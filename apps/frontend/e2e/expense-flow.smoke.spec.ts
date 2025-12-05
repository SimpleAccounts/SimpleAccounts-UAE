import { test, expect } from '@playwright/test';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const EXPENSE_PATH =
  process.env.E2E_EXPENSE_PATH || '/admin/expense/supplier-invoice';

const describeSmoke = RUN_SMOKE ? test.describe : test.describe.skip;

describeSmoke('Expense workflow smoke journey', () => {
  test('logs in and navigates to expense/supplier invoice list', async ({
    page,
  }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run the expense smoke test',
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

    // Navigate to supplier invoices/expenses
    await page.goto(EXPENSE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.supplier-invoice-screen, .expense-screen', {
      timeout: 180_000,
    });

    // Verify the expense list is displayed
    const heading = page.locator('h4, .h4').first();
    await expect(heading).toBeVisible({ timeout: 60_000 });
  });

  test('can open new expense form', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run the expense form smoke test',
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

    // Navigate to expense creation
    const createExpensePath = `${EXPENSE_PATH}/create`;
    await page.goto(createExpensePath, { waitUntil: 'domcontentloaded' });

    // Verify form elements are present
    const formContainer = page.locator('form, .create-expense-screen, .supplier-invoice-create');
    await expect(formContainer.first()).toBeVisible({ timeout: 180_000 });
  });
});
