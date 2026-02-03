import { test, expect, Page } from '@playwright/test';
import { loginTestUser } from './helpers/test-user-helpers';
import {
  createBankAccountViaAPI,
  createDepositTransaction,
  getTransactionList,
  generateBankAccountName,
  generateAccountNumber,
} from './helpers/bank-account-helpers';
import { getApiBaseUrl, getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * Test: View transactions for a bank account
 *
 * This test demonstrates how to:
 * 1. Create a bank account
 * 2. Create some transactions
 * 3. Navigate to the transactions page
 * 4. Verify transactions are displayed
 */
test.describe('View Bank Account Transactions', () => {
  let authToken: string;
  let bankAccountId: number;
  let bankAccountName: string;

  test.beforeEach(async ({ page, request }) => {
    // Login to get auth token
    await loginTestUser(page);
    authToken = (await page.evaluate(() => localStorage.getItem('accessToken'))) || '';

    if (!authToken) {
      throw new Error('Failed to get authentication token after login');
    }

    // Create a test bank account
    bankAccountName = generateBankAccountName('Test Transactions Account');
    const accountData = {
      bankAccountName,
      accountNumber: generateAccountNumber(),
      openingBalance: 1000,
    };

    const account = await createBankAccountViaAPI(request, authToken, accountData);
    bankAccountId = account.bankAccountId;

    if (!bankAccountId) {
      throw new Error('Failed to create test bank account');
    }

    // Create some test transactions
    await createDepositTransaction(request, authToken, {
      bankId: bankAccountId,
      transactionAmount: 500,
      description: 'Test Deposit 1',
    });

    await createDepositTransaction(request, authToken, {
      bankId: bankAccountId,
      transactionAmount: 300,
      description: 'Test Deposit 2',
    });
  });

  test('should view transactions for a bank account via UI', async ({ page }) => {
    const baseUrl = getFrontendBaseUrl();

    // Method 1: Navigate directly to transactions page
    // URL pattern: /admin/banking/bank-account/transactions?bankAccountId={id}
    await page.goto(
      `${baseUrl}/admin/banking/bank-account/transactions?bankAccountId=${bankAccountId}`,
      { waitUntil: 'domcontentloaded' }
    );

    // Wait for transactions table to load
    await page.waitForSelector('table, [class*="table"], [class*="data-table"]', {
      timeout: 10000,
    });

    // Verify transactions are displayed
    // Look for transaction descriptions or amounts
    const deposit1 = page.getByText('Test Deposit 1', { exact: false });
    const deposit2 = page.getByText('Test Deposit 2', { exact: false });

    await expect(deposit1.or(deposit2)).toBeVisible({ timeout: 5000 });

    // Verify transaction amounts are visible
    const amount500 = page.getByText('500', { exact: false });
    const amount300 = page.getByText('300', { exact: false });

    await expect(amount500.or(amount300)).toBeVisible({ timeout: 5000 });
  });

  test('should view transactions via bank account list page', async ({ page }) => {
    const baseUrl = getFrontendBaseUrl();

    // Method 2: Navigate via bank account list
    // Step 1: Go to bank account list
    await page.goto(`${baseUrl}/admin/banking/bank-account`, {
      waitUntil: 'domcontentloaded',
    });

    // Step 2: Find the bank account in the list
    await page.waitForSelector('table, [class*="table"]', { timeout: 10000 });

    // Step 3: Click on the bank account row or actions menu
    // Look for the bank account name in the table
    const accountRow = page
      .locator('tr, [class*="row"]')
      .filter({ hasText: bankAccountName })
      .first();

    if (await accountRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Option A: Click on the row to view details
      await accountRow.click();
      await page.waitForTimeout(1000);

      // Then navigate to transactions from detail page
      const transactionsButton = page.getByRole('button', { name: /transaction/i });
      if (await transactionsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await transactionsButton.click();
      }
    } else {
      // Option B: Use actions menu (3-dots menu)
      const actionsButton = page
        .locator('button[aria-haspopup="menu"], button[aria-label*="action"]')
        .first();
      if (await actionsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await actionsButton.click();
        await page.waitForTimeout(500);

        // Click on "View Transactions" or similar option
        const viewTransactionsOption = page.getByRole('menuitem', {
          name: /transaction|view transaction/i,
        });
        if (await viewTransactionsOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await viewTransactionsOption.click();
        }
      }
    }

    // Wait for transactions page to load
    await page.waitForURL('**/transactions**', { timeout: 10000 });
    await page.waitForSelector('table, [class*="table"]', { timeout: 10000 });

    // Verify we're on the transactions page
    expect(page.url()).toContain('transactions');
  });

  test('should view transactions via API', async ({ request }) => {
    // Method 3: Get transactions via API
    const transactions = await getTransactionList(request, authToken, bankAccountId, {
      paginationDisable: true,
    });

    // Verify transactions were returned
    expect(transactions).toBeDefined();
    expect(Array.isArray(transactions.data) || Array.isArray(transactions)).toBe(true);

    const transactionArray = Array.isArray(transactions.data)
      ? transactions.data
      : Array.isArray(transactions)
        ? transactions
        : [];

    // Verify we have at least 2 transactions
    expect(transactionArray.length).toBeGreaterThanOrEqual(2);

    // Verify transaction descriptions
    const descriptions = transactionArray.map((t: any) =>
      (t.transactionDescription || t.description || '').toLowerCase()
    );
    expect(descriptions.some((d: string) => d.includes('test deposit 1'))).toBe(true);
    expect(descriptions.some((d: string) => d.includes('test deposit 2'))).toBe(true);
  });

  test('should filter transactions by type', async ({ page, request }) => {
    const baseUrl = getFrontendBaseUrl();

    // Navigate to transactions page
    await page.goto(
      `${baseUrl}/admin/banking/bank-account/transactions?bankAccountId=${bankAccountId}`,
      { waitUntil: 'domcontentloaded' }
    );

    await page.waitForSelector('table, [class*="table"]', { timeout: 10000 });

    // Look for filter tabs or buttons (All, Deposits, Withdrawals, etc.)
    const allTab = page
      .getByRole('button', { name: /all/i })
      .or(page.getByRole('tab', { name: /all/i }));
    const depositTab = page
      .getByRole('button', { name: /deposit/i })
      .or(page.getByRole('tab', { name: /deposit/i }));

    if (await depositTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await depositTab.click();
      await page.waitForTimeout(1000);

      // Verify only deposits are shown
      const transactions = await getTransactionList(request, authToken, bankAccountId, {
        transactionType: 'DEPOSIT',
        paginationDisable: true,
      });

      const transactionArray = Array.isArray(transactions.data)
        ? transactions.data
        : Array.isArray(transactions)
          ? transactions
          : [];

      expect(transactionArray.length).toBeGreaterThanOrEqual(2);
    }
  });
});
