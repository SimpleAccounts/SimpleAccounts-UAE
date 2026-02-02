import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * E2E Test: Create Transactions on Specific Bank Account
 *
 * This test verifies transaction creation on bank account with account number 9049372202130484927050482 (bankId=13507)
 * and verifies transactions appear in the transaction list.
 */

const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const TARGET_BANK_ACCOUNT_NUMBER = '9049372202130484927050482';
const TARGET_BANK_ID = 13507;

async function navigateToTransactionCreate(page: Page, bankId: number) {
  await page.goto(
    `${getFrontendBaseUrl()}/admin/banking/bank-account/transaction/create?bankId=${bankId}`,
    {
      waitUntil: 'networkidle',
    }
  );

  // Wait for form to be fully loaded
  await page.waitForSelector('form', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

async function selectTransactionType(page: Page, transactionTypeName: string) {
  // Select Transaction Type dropdown
  const transactionTypeInput = page.locator('input[aria-autocomplete="list"]').first();
  await transactionTypeInput.waitFor({ state: 'visible', timeout: 10000 });
  await transactionTypeInput.click();
  await page.waitForTimeout(1000);

  // Wait for options menu to appear
  const optionsMenu = page.locator('[role="listbox"]').first();
  await optionsMenu.waitFor({ state: 'visible', timeout: 10000 });

  // Set up response listener for transaction category API call
  const categoryResponsePromise = page
    .waitForResponse(
      response =>
        response.url().includes('/rest/reconsile/getTransactionCat') && response.status() === 200,
      { timeout: 15000 }
    )
    .catch(() => null);

  // Select transaction type by name (case-insensitive partial match)
  const transactionTypeOption = page.getByRole('option', {
    name: new RegExp(transactionTypeName, 'i'),
  });
  const isVisible = await transactionTypeOption.isVisible({ timeout: 5000 }).catch(() => false);

  if (!isVisible) {
    // Try finding by text content
    const allOptions = page.getByRole('option');
    const optionCount = await allOptions.count();
    let found = false;
    for (let i = 0; i < optionCount; i++) {
      const optionText = await allOptions.nth(i).textContent();
      if (optionText && new RegExp(transactionTypeName, 'i').test(optionText)) {
        await allOptions.nth(i).click();
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(`Transaction type "${transactionTypeName}" not found in dropdown`);
    }
  } else {
    await transactionTypeOption.click();
  }

  // Wait for transaction category API call to complete
  await categoryResponsePromise;
  await page.waitForTimeout(2000);

  return categoryResponsePromise;
}

async function selectTransactionCategory(page: Page) {
  // Select transaction category if available
  const categorySelects = page.locator('input[aria-autocomplete="list"]');
  const categorySelectCount = await categorySelects.count();

  if (categorySelectCount > 1) {
    const categorySelect = categorySelects.nth(1);
    const categorySelectVisible = await categorySelect
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (categorySelectVisible) {
      await categorySelect.click();
      await page.waitForTimeout(1000);

      // Wait for options to appear
      const categoryOptions = page.getByRole('option');
      const optionCount = await categoryOptions.count();

      if (optionCount > 0) {
        await categoryOptions.first().waitFor({ state: 'visible', timeout: 5000 });
        await categoryOptions.first().click();
        await page.waitForTimeout(1000);
      }
    }
  }
}

async function fillTransactionForm(page: Page, amount: string, description: string) {
  // Fill transaction date (today)
  const dateInput = page
    .locator('input[type="date"], input[name*="date"], input[id*="date"]')
    .first();
  if (await dateInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    const today = new Date().toISOString().split('T')[0];
    await dateInput.fill(today);
    await page.waitForTimeout(500);
  }

  // Fill amount - this is required
  const amountInput = page
    .locator('input[name*="amount"], input[id*="amount"], input[type="number"]')
    .first();
  await amountInput.waitFor({ state: 'visible', timeout: 10000 });
  await amountInput.fill(amount);
  await page.waitForTimeout(500);

  // Fill description
  const descriptionInput = page
    .locator('input[name*="description"], textarea[name*="description"], input[id*="description"]')
    .first();
  if (await descriptionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await descriptionInput.fill(description);
    await page.waitForTimeout(500);
  }
}

async function submitTransaction(page: Page) {
  // Set up response listener for save
  const saveResponsePromise = page
    .waitForResponse(
      response => response.url().includes('/rest/transaction/save') && response.status() === 200,
      { timeout: 60000 }
    )
    .catch(() => null);

  // Submit the form
  const submitButton = page.getByRole('button', { name: /^create$/i }).first();
  await expect(submitButton).toBeVisible({ timeout: 5000 });
  await submitButton.click();

  // Wait for save response
  const response = await saveResponsePromise;

  if (!response) {
    // Check for error messages on page
    const errorMessage = page
      .locator('[class*="error"], [class*="invalid"], [role="alert"]')
      .first();
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasError) {
      const errorText = await errorMessage.textContent().catch(() => 'Unknown error');
      await page.screenshot({ path: 'test-results/transaction-create-error.png' });
      throw new Error(`Transaction save failed: ${errorText}`);
    }
    await page.screenshot({ path: 'test-results/transaction-create-timeout.png' });
    throw new Error('Transaction save request did not complete within 60 seconds');
  }

  // Verify response status
  if (response.status() !== 200) {
    const errorText = await response.text().catch(() => 'Unknown error');
    await page.screenshot({ path: 'test-results/transaction-save-error.png' });
    throw new Error(`Transaction save failed with status ${response.status()}: ${errorText}`);
  }

  expect(response.status()).toBe(200);
  await page.waitForTimeout(2000);
}

async function verifyTransactionInList(page: Page, description: string, bankAccountNumber: string) {
  // Navigate to bank account list
  await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account`, {
    waitUntil: 'networkidle',
  });

  // Find the bank account row by account number
  const bankAccountRow = page
    .locator('table tbody tr')
    .filter({ hasText: bankAccountNumber })
    .first();
  await bankAccountRow.waitFor({ state: 'visible', timeout: 10000 });

  // Click on the bank account name to view transactions
  await bankAccountRow.locator('td').first().click();
  await page.waitForURL('**/bank-account/detail**', { timeout: 15000 });
  await page.waitForTimeout(3000);

  // Click on "View Transactions" or navigate to transaction list
  const viewTransactionsButton = page.getByRole('button', { name: /view.*transaction/i });
  const viewTransactionsVisible = await viewTransactionsButton
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (viewTransactionsVisible) {
    await viewTransactionsButton.click();
    await page.waitForURL('**/bank-account/transaction**', { timeout: 15000 });
    await page.waitForTimeout(3000);
  } else {
    // Try navigating directly to transaction list
    await page.goto(
      `${getFrontendBaseUrl()}/admin/banking/bank-account/transaction?bankId=${TARGET_BANK_ID}`,
      {
        waitUntil: 'networkidle',
      }
    );
    await page.waitForTimeout(3000);
  }

  // Verify transaction appears in the list
  await expect(page.getByText(description)).toBeVisible({ timeout: 10000 });
}

test.describe('Bank Account Transactions - Specific Account', () => {
  const credentials = getTestUserCredentials();
  const username = credentials.username;
  const password = credentials.password;

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, username, password);
  });

  test('should create "Money Spent" transaction and verify in list', async ({ page }) => {
    const transactionDescription = `E2E Money Spent ${Date.now()}`;
    const transactionAmount = '500';

    await navigateToTransactionCreate(page, TARGET_BANK_ID);
    await selectTransactionType(page, 'Money Spent');
    await selectTransactionCategory(page);
    await fillTransactionForm(page, transactionAmount, transactionDescription);
    await submitTransaction(page);
    await verifyTransactionInList(page, transactionDescription, TARGET_BANK_ACCOUNT_NUMBER);
  });

  test('should create "Expense" transaction and verify in list', async ({ page }) => {
    const transactionDescription = `E2E Expense ${Date.now()}`;
    const transactionAmount = '750';

    await navigateToTransactionCreate(page, TARGET_BANK_ID);
    await selectTransactionType(page, 'Expense');
    await selectTransactionCategory(page);
    await fillTransactionForm(page, transactionAmount, transactionDescription);
    await submitTransaction(page);
    await verifyTransactionInList(page, transactionDescription, TARGET_BANK_ACCOUNT_NUMBER);
  });

  test('should create "Money Received" transaction and verify in list', async ({ page }) => {
    const transactionDescription = `E2E Money Received ${Date.now()}`;
    const transactionAmount = '1000';

    await navigateToTransactionCreate(page, TARGET_BANK_ID);
    await selectTransactionType(page, 'Money Received');
    await selectTransactionCategory(page);
    await fillTransactionForm(page, transactionAmount, transactionDescription);
    await submitTransaction(page);
    await verifyTransactionInList(page, transactionDescription, TARGET_BANK_ACCOUNT_NUMBER);
  });

  test('should create "Sales" transaction and verify in list', async ({ page }) => {
    const transactionDescription = `E2E Sales ${Date.now()}`;
    const transactionAmount = '1500';

    await navigateToTransactionCreate(page, TARGET_BANK_ID);
    await selectTransactionType(page, 'Sales');
    await selectTransactionCategory(page);
    await fillTransactionForm(page, transactionAmount, transactionDescription);
    await submitTransaction(page);
    await verifyTransactionInList(page, transactionDescription, TARGET_BANK_ACCOUNT_NUMBER);
  });
});
