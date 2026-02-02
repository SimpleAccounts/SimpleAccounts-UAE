import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * Transaction Type Scenarios - Tests all transaction types
 * Verifies which types succeed (200) vs require extra setup (400/500)
 */

const TARGET_BANK_ID = 13507;

async function navigateToTransactionCreate(page: Page, bankId: number) {
  await page.goto(
    `${getFrontendBaseUrl()}/admin/banking/bank-account/transaction/create?bankId=${bankId}`,
    {
      waitUntil: 'networkidle',
    }
  );
  await page.waitForSelector('form', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

async function selectTransactionType(page: Page, transactionTypeName: string) {
  const transactionTypeInput = page.locator('input[aria-autocomplete="list"]').first();
  await transactionTypeInput.waitFor({ state: 'visible', timeout: 10000 });
  await transactionTypeInput.click();
  await page.waitForTimeout(1000);

  const optionsMenu = page.locator('[role="listbox"]').first();
  await optionsMenu.waitFor({ state: 'visible', timeout: 10000 });

  const transactionTypeOption = page.getByRole('option', {
    name: new RegExp(transactionTypeName, 'i'),
  });
  const isVisible = await transactionTypeOption.isVisible({ timeout: 5000 }).catch(() => false);

  if (!isVisible) {
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
      throw new Error(`Transaction type "${transactionTypeName}" not found`);
    }
  } else {
    await transactionTypeOption.click();
  }

  await page.waitForTimeout(2000);
}

async function selectTransactionCategory(page: Page) {
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
  const dateInput = page
    .locator('input[type="date"], input[name*="date"], input[id*="date"]')
    .first();
  if (await dateInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    const today = new Date().toISOString().split('T')[0];
    await dateInput.fill(today);
    await page.waitForTimeout(500);
  }

  const amountInput = page
    .locator('input[name*="amount"], input[id*="amount"], input[type="number"]')
    .first();
  await amountInput.waitFor({ state: 'visible', timeout: 10000 });
  await amountInput.fill(amount);
  await page.waitForTimeout(500);

  const descriptionInput = page
    .locator('input[name*="description"], textarea[name*="description"], input[id*="description"]')
    .first();
  if (await descriptionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await descriptionInput.fill(description);
    await page.waitForTimeout(500);
  }
}

async function submitTransactionAndGetResponse(
  page: Page
): Promise<{ status: number; body: string }> {
  const saveResponsePromise = page
    .waitForResponse(response => response.url().includes('/rest/transaction/save'), {
      timeout: 30000,
    })
    .catch(() => null);

  const submitButton = page.getByRole('button', { name: /^create$/i }).first();
  await expect(submitButton).toBeVisible({ timeout: 5000 });
  await submitButton.click();

  const response = await saveResponsePromise;

  if (!response) {
    return { status: 0, body: 'No response (timeout)' };
  }

  const status = response.status();
  const body = await response.text().catch(() => '');
  return { status, body };
}

// Transaction types to test - basic types that work without invoice/vendor selection
const BASIC_TYPES = [
  'Money Received',
  'Money Spent',
  'Transfered From',
  'Transfered To',
  'Refund Received',
  'Money Spent Others',
];

test.describe('Transaction Type Scenarios', () => {
  const credentials = getTestUserCredentials();
  const username = credentials.username;
  const password = credentials.password;

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, username, password);
  });

  test('should create Money Spent transaction and verify in list', async ({ page }) => {
    const uniqueId = Date.now();
    const transactionDescription = `E2E Money Spent ${uniqueId}`;
    const transactionAmount = '150';

    await navigateToTransactionCreate(page, TARGET_BANK_ID);
    await selectTransactionType(page, 'Money Spent');
    await selectTransactionCategory(page); // Optional - may not have categories
    await fillTransactionForm(page, transactionAmount, transactionDescription);
    const { status, body } = await submitTransactionAndGetResponse(page);

    expect(status).toBe(200);
    expect(body).toContain('Saved successfull');

    // Verify navigation to transaction list
    await page.waitForURL('**/bank-account/transaction**', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify transaction appears in list
    const tableBody = page.locator('table tbody');
    await expect(tableBody.getByText(transactionDescription)).toBeVisible({ timeout: 10000 });
  });

  for (const txType of BASIC_TYPES) {
    test(`should attempt ${txType} - report status`, async ({ page }) => {
      const uniqueId = Date.now();
      const transactionDescription = `Test ${txType.replace(/\s/g, '')} ${uniqueId}`;
      const transactionAmount = '100';

      await navigateToTransactionCreate(page, TARGET_BANK_ID);
      await selectTransactionType(page, txType);
      await selectTransactionCategory(page);
      await fillTransactionForm(page, transactionAmount, transactionDescription);
      const { status, body } = await submitTransactionAndGetResponse(page);

      // Log result
      console.log(`${txType}: ${status} - ${body.substring(0, 80)}`);

      // Basic types should succeed (200); Sales/Expense/Invoice may need extra setup
      if (
        [
          'Money Received',
          'Money Spent',
          'Transfered From',
          'Transfered To',
          'Refund Received',
          'Money Spent Others',
        ].includes(txType)
      ) {
        expect(status).toBe(200);
        expect(body).toContain('Saved successfull');
      }
    });
  }
});
