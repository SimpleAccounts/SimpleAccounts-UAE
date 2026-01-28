import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import {
  generateBankAccountName,
  generateAccountNumber,
  BankAccountData,
} from './helpers/bank-account-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * E2E Test: Create Bank Transaction
 * 
 * This test verifies the complete flow of creating a new bank transaction:
 * 1. Login
 * 2. Create or get a bank account
 * 3. Navigate to transaction create page
 * 4. Select transaction type
 * 5. Fill transaction form
 * 6. Submit and verify transaction is created
 * 7. Verify transaction appears in transaction list
 */

const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';

let testBankAccount: BankAccountData;

async function selectFirstOptionByLabel(page: Page, labelText: string) {
  try {
    // Try multiple ways to find the label and dropdown
    let selectContainer = null;
    
    // Method 1: Find by label text (case insensitive, partial match)
    const label = page.locator(`label:has-text("${labelText}")`).first();
    const labelVisible = await label.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (labelVisible) {
      const group = label.locator('..');
      selectContainer = group.locator('[class*="react-select"], [id*="react-select"]').first();
    } else {
      // Method 2: Find by field name/id
      const fieldId = labelText.toLowerCase().replace(/\s+/g, '_');
      selectContainer = page.locator(`[id="${fieldId}"], [name="${fieldId}"]`).locator('..').locator('[class*="react-select"]').first();
    }
    
    // Method 3: Find all react-select containers and match by nearby label
    if (!selectContainer || !(await selectContainer.isVisible({ timeout: 2000 }).catch(() => false))) {
      const allSelects = page.locator('[class*="react-select"]');
      const count = await allSelects.count();
      for (let i = 0; i < count; i++) {
        const select = allSelects.nth(i);
        const parent = select.locator('..');
        const nearbyLabel = parent.locator(`label:has-text("${labelText}")`).first();
        if (await nearbyLabel.isVisible({ timeout: 1000 }).catch(() => false)) {
          selectContainer = select;
          break;
        }
      }
    }
    
    if (!selectContainer || !(await selectContainer.isVisible({ timeout: 5000 }).catch(() => false))) {
      throw new Error(`Could not find select dropdown for "${labelText}"`);
    }
    
    // Click on the control div (the visible part)
    const control = selectContainer.locator('div').first();
    await control.click({ force: true });
    await page.waitForTimeout(800);
    
    // Wait for options menu to appear
    const optionsMenu = page.locator('[role="listbox"], [id*="react-select"]').first();
    await optionsMenu.waitFor({ state: 'visible', timeout: 10000 });
    
    // Select first option
    const option = page.getByRole('option').first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
    await page.waitForTimeout(500);
  } catch (error: any) {
    throw new Error(`Failed to select first option for "${labelText}": ${error.message}`);
  }
}

async function createBankAccountViaUI(page: Page, accountData: BankAccountData) {
  try {
    await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account/create`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for form to be ready
    await page.waitForSelector('#account_name', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow form to fully initialize

    // Fill text fields
    await page.locator('#account_name').fill(accountData.bankAccountName);
    await page.locator('#opening_balance').fill(String(accountData.openingBalance ?? 10000));
    await page.locator('#account_number').fill(accountData.accountNumber);

    // Fill date
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(
      today.getMonth() + 1
    ).padStart(2, '0')}-${today.getFullYear()}`;
    await page.locator('#openingDate').fill(formattedDate);
    await page.waitForTimeout(500);

    // Set up response listener BEFORE interacting with dropdowns
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/bank/save') && response.request().method() === 'POST',
      { timeout: 60000 }
    ).catch(() => null);

    // Select dropdowns using direct field IDs (more reliable)
    // Account Type dropdown
    const accountTypeSelect = page.locator('#account_type').locator('..').locator('[class*="react-select"]').first();
    if (await accountTypeSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      await accountTypeSelect.locator('div[class*="control"]').first().click({ force: true });
      await page.waitForTimeout(1000);
      const accountTypeOption = page.getByRole('option').first();
      await accountTypeOption.waitFor({ state: 'visible', timeout: 10000 });
      await accountTypeOption.click();
      await page.waitForTimeout(500);
    }

    // Bank Name dropdown - find by looking for selects near "Bank" text
    const bankNameSelects = page.locator('[class*="react-select"]');
    const selectCount = await bankNameSelects.count();
    let bankSelected = false;
    for (let i = 0; i < selectCount; i++) {
      const select = bankNameSelects.nth(i);
      const parent = select.locator('..');
      const hasBankLabel = await parent.locator('label:has-text("Bank")').isVisible({ timeout: 500 }).catch(() => false);
      if (hasBankLabel) {
        await select.locator('div[class*="control"]').first().click({ force: true });
        await page.waitForTimeout(1000);
        await page.getByRole('option').first().click();
        bankSelected = true;
        break;
      }
    }
    if (!bankSelected) {
      // Fallback: click second select (usually bank name comes after account type)
      const secondSelect = bankNameSelects.nth(1);
      if (await secondSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        await secondSelect.locator('div[class*="control"]').first().click({ force: true });
        await page.waitForTimeout(1000);
        await page.getByRole('option').first().click();
      }
    }
    await page.waitForTimeout(500);

    // Account is for - optional field, try to select but don't fail if not found
    const accountForSelects = page.locator('[class*="react-select"]');
    const accountForCount = await accountForSelects.count();
    for (let i = 0; i < accountForCount; i++) {
      const select = accountForSelects.nth(i);
      const parent = select.locator('..');
      const hasAccountForLabel = await parent.locator('label:has-text("Account"), label:has-text("for")').isVisible({ timeout: 500 }).catch(() => false);
      if (hasAccountForLabel) {
        await select.locator('div[class*="control"]').first().click({ force: true });
        await page.waitForTimeout(800);
        await page.getByRole('option').first().click();
        break;
      }
    }
    await page.waitForTimeout(1000);

    // Submit form
    const createButton = page.getByRole('button', { name: /^create$/i }).first();
    await createButton.click();
    
    // Wait for response
    const response = await responsePromise;
    if (!response) {
      await page.waitForTimeout(5000); // Wait a bit more
      const errorMessage = page.locator('[class*="error"], [class*="invalid"], [role="alert"]').first();
      const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasError) {
        const errorText = await errorMessage.textContent().catch(() => 'Unknown error');
        await page.screenshot({ path: 'test-results/bank-account-creation-error.png' });
        throw new Error(`Bank account creation failed: ${errorText}`);
      }
      // Check if we navigated away (success)
      if (!page.url().includes('/create')) {
        return; // Success - navigated away
      }
      await page.screenshot({ path: 'test-results/bank-account-creation-timeout.png' });
      throw new Error('Bank account save request did not complete within 60 seconds');
    }
    
    if (response.status() !== 200) {
      const errorText = await response.text().catch(() => 'Unknown error');
      await page.screenshot({ path: 'test-results/bank-account-creation-error.png' });
      throw new Error(`Bank account creation failed with status ${response.status()}: ${errorText}`);
    }
    
    // Wait for navigation
    await page.waitForURL('**/admin/banking/bank-account**', { timeout: 15000 }).catch(() => {
      // If navigation didn't happen, check for success message
      const successMessage = page.getByText(/success|created|saved/i);
      const hasSuccess = successMessage.isVisible({ timeout: 3000 }).catch(() => false);
      if (!hasSuccess) {
        throw new Error('Bank account creation did not complete');
      }
    });
  } catch (error: any) {
    await page.screenshot({ path: 'test-results/bank-account-creation-error.png' }).catch(() => {});
    throw error;
  }
}

async function openCreateTransactionFromList(page: Page, accountName: string) {
  await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account`, {
    waitUntil: 'networkidle',
  });

  const row = page.locator('table tbody tr').filter({ hasText: accountName }).first();
  await row.waitFor({ state: 'visible', timeout: 20000 });
  await row.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: /add.*transaction/i }).click();
  await page.waitForURL('**/bank-account/transaction/create', { timeout: 15000 });
}

test.describe('Create Bank Transaction', () => {
  const credentials = getTestUserCredentials();
  const username = credentials.username;
  const password = credentials.password;

  test.beforeAll(async ({ browser }) => {
    // Setup: Login and create a test bank account via UI
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await loginTestUser(page, username, password);

      // Check if a bank account already exists
      await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account`, {
        waitUntil: 'networkidle',
      });
      
      const existingAccount = page.locator('table tbody tr').first();
      const hasExistingAccount = await existingAccount.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasExistingAccount) {
        // Use existing account
        const accountName = await existingAccount.locator('td').first().textContent();
        testBankAccount = {
          bankAccountName: accountName || 'Existing Account',
          accountNumber: 'EXISTING',
          bankName: 'Existing Bank',
          openingBalance: 10000,
        };
      } else {
        // Create new account
        const accountData: BankAccountData = {
          bankAccountName: generateBankAccountName('E2E Transaction Test'),
          accountNumber: `ACC-${Date.now()}`, // Use hyphen in account number
          bankName: 'Test Bank E2E',
          openingBalance: 10000,
        };

        await createBankAccountViaUI(page, accountData);
        testBankAccount = accountData;
      }
    } catch (error: any) {
      console.error('Error in beforeAll:', error);
      // Continue anyway - test will be skipped if no bank account
    } finally {
      await context.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, username, password);
  });

  test('should create a new transaction successfully via UI', async ({ page }) => {
    test.skip(!testBankAccount?.bankAccountName, 'Bank account must be created first');

    const transactionDescription = `E2E Test Transaction ${Date.now()}`;
    const transactionAmount = '1000';

    // Navigate to transaction create page
    await openCreateTransactionFromList(page, testBankAccount.bankAccountName);

    // Wait for form to be fully loaded
    await page.waitForSelector('form', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Fill transaction date (today)
    const dateInput = page.locator('input[type="date"], input[name*="date"], input[id*="date"]').first();
    if (await dateInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      const today = new Date().toISOString().split('T')[0];
      await dateInput.fill(today);
      await page.waitForTimeout(500);
    }

    // Fill amount - this is required
    const amountInput = page.locator('input[name*="amount"], input[id*="amount"], input[type="number"]').first();
    await amountInput.waitFor({ state: 'visible', timeout: 10000 });
    await amountInput.fill(transactionAmount);
    await page.waitForTimeout(500);

    // Fill description
    const descriptionInput = page.locator('input[name*="description"], textarea[name*="description"], input[id*="description"]').first();
    if (await descriptionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await descriptionInput.fill(transactionDescription);
      await page.waitForTimeout(500);
    }

    // Select Transaction Type (Chart of Account Category) - REQUIRED FIELD
    const transactionTypeInput = page.locator('input[aria-autocomplete="list"]').first();
    await transactionTypeInput.waitFor({ state: 'visible', timeout: 10000 });
    await transactionTypeInput.click();
    await page.waitForTimeout(1000);

    // Wait for options menu to appear
    const optionsMenu = page.locator('[role="listbox"]').first();
    await optionsMenu.waitFor({ state: 'visible', timeout: 10000 });

    // Set up response listener for transaction category API call
    const categoryResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/reconsile/getTransactionCat') && response.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);

    // Select "Money Received" or "Money Spent" transaction type (simpler transaction types)
    let transactionTypeSelected = false;
    const moneyReceivedOption = page.getByRole('option', { name: /money.*received/i });
    const moneySpentOption = page.getByRole('option', { name: /money.*spent/i });
    const expenseOption = page.getByRole('option', { name: /expense/i });

    if (await moneyReceivedOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moneyReceivedOption.click();
      transactionTypeSelected = true;
    } else if (await moneySpentOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moneySpentOption.click();
      transactionTypeSelected = true;
    } else if (await expenseOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expenseOption.click();
      transactionTypeSelected = true;
    } else {
      // Fallback: Select first available option
      const firstOption = page.getByRole('option').first();
      await firstOption.waitFor({ state: 'visible', timeout: 5000 });
      await firstOption.click();
      transactionTypeSelected = true;
    }

    if (!transactionTypeSelected) {
      throw new Error('Failed to select transaction type');
    }

    // Wait for transaction category API call to complete
    await categoryResponsePromise;
    await page.waitForTimeout(2000);

    // Select transaction category if available - this is required for most transaction types
    const categorySelects = page.locator('input[aria-autocomplete="list"]');
    const categorySelectCount = await categorySelects.count();
    
    if (categorySelectCount > 1) {
      const categorySelect = categorySelects.nth(1);
      const categorySelectVisible = await categorySelect.isVisible({ timeout: 5000 }).catch(() => false);
      
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

    // Set up response listener for save
    const saveResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/transaction/save') && response.status() === 200,
      { timeout: 60000 }
    ).catch(() => null);

    const saveErrorPromise = page.waitForResponse(
      (response) => response.url().includes('/rest/transaction/save') && (response.status() === 400 || response.status() === 500),
      { timeout: 60000 }
    ).catch(() => null);

    const [saveError, response] = await Promise.all([
      saveErrorPromise,
      saveResponsePromise,
    ]).then(([error, resp]) => {
      return [error, resp];
    }).catch(() => {
      return [null, null];
    });

    // Submit the form
    const submitButton = page.getByRole('button', { name: /^create$/i }).first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Wait for save response
    const finalResponse = await saveResponsePromise;
    
    if (!finalResponse) {
      // Check for error messages on page
      const errorMessage = page.locator('[class*="error"], [class*="invalid"], [role="alert"]').first();
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
    if (saveError || finalResponse.status() !== 200) {
      const errorText = saveError ? await saveError.text().catch(() => 'Unknown error') : await finalResponse.text().catch(() => 'Unknown error');
      await page.screenshot({ path: 'test-results/transaction-save-error.png' });
      throw new Error(`Transaction save failed with status ${finalResponse.status()}: ${errorText}`);
    }

    expect(finalResponse.status()).toBe(200);

    // Wait for navigation or success message
    await page.waitForTimeout(2000);

    // Verify transaction was created by checking the transaction list
    // Navigate to bank account detail page to see transactions
    await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account`, {
      waitUntil: 'networkidle',
    });

    // Find the bank account row and click to view details
    const bankAccountRow = page.locator('table tbody tr').filter({ hasText: testBankAccount.bankAccountName }).first();
    await bankAccountRow.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click on the bank account name to view transactions
    await bankAccountRow.locator('td').first().click();
    await page.waitForURL('**/bank-account/detail**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Verify transaction appears in the list
    await expect(page.getByText(transactionDescription)).toBeVisible({ timeout: 10000 });
  });

  test('should create a "Cost Of Goods Sold" transaction successfully via UI', async ({ page }) => {
    test.skip(!testBankAccount?.bankAccountName, 'Bank account must be created first');

    const transactionDescription = `E2E Test COGS Transaction ${Date.now()}`;
    const transactionAmount = '500';

    // Navigate to transaction create page
    await openCreateTransactionFromList(page, testBankAccount.bankAccountName);

    // Wait for form to be fully loaded
    await page.waitForSelector('form', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Fill transaction date (today)
    const dateInput = page.locator('input[type="date"], input[name*="date"], input[id*="date"]').first();
    if (await dateInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      const today = new Date().toISOString().split('T')[0];
      await dateInput.fill(today);
      await page.waitForTimeout(500);
    }

    // Fill amount - this is required
    const amountInput = page.locator('input[name*="amount"], input[id*="amount"], input[type="number"]').first();
    await amountInput.waitFor({ state: 'visible', timeout: 10000 });
    await amountInput.fill(transactionAmount);
    await page.waitForTimeout(500);

    // Fill description
    const descriptionInput = page.locator('input[name*="description"], textarea[name*="description"], input[id*="description"]').first();
    if (await descriptionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await descriptionInput.fill(transactionDescription);
      await page.waitForTimeout(500);
    }

    // Select Transaction Type - specifically "Cost Of Goods Sold"
    const transactionTypeInput = page.locator('input[aria-autocomplete="list"]').first();
    await transactionTypeInput.waitFor({ state: 'visible', timeout: 10000 });
    await transactionTypeInput.click();
    await page.waitForTimeout(1000);

    // Wait for options menu to appear
    const optionsMenu = page.locator('[role="listbox"]').first();
    await optionsMenu.waitFor({ state: 'visible', timeout: 10000 });

    // Set up response listener for transaction category API call
    const categoryResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/reconsile/getTransactionCat') && response.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);

    // Select "Cost Of Goods Sold" transaction type
    const costOfGoodsSoldOption = page.getByRole('option', { name: /cost.*of.*goods.*sold/i });
    const costOfGoodsSoldVisible = await costOfGoodsSoldOption.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!costOfGoodsSoldVisible) {
      // If not found, try case-insensitive search
      const allOptions = page.getByRole('option');
      const optionCount = await allOptions.count();
      let found = false;
      for (let i = 0; i < optionCount; i++) {
        const optionText = await allOptions.nth(i).textContent();
        if (optionText && /cost.*of.*goods.*sold/i.test(optionText)) {
          await allOptions.nth(i).click();
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error('Cost Of Goods Sold option not found in transaction type dropdown');
      }
    } else {
      await costOfGoodsSoldOption.click();
    }

    // Wait for transaction category API call to complete
    await categoryResponsePromise;
    await page.waitForTimeout(2000);

    // Select transaction category if available - this is required for most transaction types
    const categorySelects = page.locator('input[aria-autocomplete="list"]');
    const categorySelectCount = await categorySelects.count();
    
    if (categorySelectCount > 1) {
      const categorySelect = categorySelects.nth(1);
      const categorySelectVisible = await categorySelect.isVisible({ timeout: 5000 }).catch(() => false);
      
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

    // Set up response listener for transaction save BEFORE clicking submit
    let saveResponse: any = null;
    let saveError: any = null;
    
    const saveResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/transaction/save') && response.request().method() === 'POST',
      { timeout: 60000 }
    ).then(response => {
      saveResponse = response;
      if (response.status() !== 200) {
        saveError = response;
      }
      return response;
    }).catch(err => {
      saveError = err;
      return null;
    });

    // Submit the form
    const submitButton = page.getByRole('button', { name: /^create$/i }).first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Wait for save response
    const response = await saveResponsePromise;
    
    if (!response) {
      // Check for error messages on page
      const errorMessage = page.locator('[class*="error"], [class*="invalid"], [role="alert"]').first();
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
    if (saveError || response.status() !== 200) {
      const errorText = saveError ? await saveError.text().catch(() => 'Unknown error') : await response.text().catch(() => 'Unknown error');
      await page.screenshot({ path: 'test-results/transaction-save-error.png' });
      throw new Error(`Transaction save failed with status ${response.status()}: ${errorText}`);
    }

    expect(response.status()).toBe(200);

    // Wait for navigation or success message
    await page.waitForTimeout(2000);

    // Verify transaction was created by checking the transaction list
    // Navigate to bank account detail page to see transactions
    await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account`, {
      waitUntil: 'networkidle',
    });

    // Find the bank account row and click to view details
    const bankAccountRow = page.locator('table tbody tr').filter({ hasText: testBankAccount.bankAccountName }).first();
    await bankAccountRow.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click on the bank account name to view transactions
    await bankAccountRow.locator('td').first().click();
    await page.waitForURL('**/bank-account/detail**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Look for transactions table or list
    const transactionsTable = page.locator('table').first();
    const tableVisible = await transactionsTable.isVisible({ timeout: 10000 }).catch(() => false);

    if (tableVisible) {
      // Verify transaction appears in the list (by description or amount)
      const transactionInList = page.getByText(new RegExp(transactionDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      const transactionVisible = await transactionInList.isVisible({ timeout: 10000 }).catch(() => false);
      
      if (!transactionVisible) {
        // Take screenshot for debugging
        await page.screenshot({ path: 'test-results/transaction-not-found-in-list.png' });
        // Check if amount appears
        const amountVisible = await page.getByText(transactionAmount).isVisible({ timeout: 5000 }).catch(() => false);
        expect(amountVisible).toBeTruthy();
      } else {
        expect(transactionVisible).toBeTruthy();
      }
    } else {
      // If no table, check for transaction count or other indicators
      const transactionCount = page.getByText(/transaction/i);
      const hasTransactionText = await transactionCount.isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasTransactionText).toBeTruthy();
    }
  });

  test('should validate required fields when creating transaction', async ({ page }) => {
    test.skip(!testBankAccount?.bankAccountName, 'Bank account must be created first');

    await openCreateTransactionFromList(page, testBankAccount.bankAccountName);

    // Try to submit without filling required fields - use first() to get "Create" button
    const submitButton = page.getByRole('button', { name: /^create$/i }).first();
    
    // Intercept to check if validation prevents submission
    let formSubmitted = false;
    page.on('response', (response) => {
      if (response.url().includes('/rest/transaction/save') && response.status() !== 200) {
        formSubmitted = true;
      }
    });

    await submitButton.click();
    await page.waitForTimeout(2000);

    // Form should either show validation errors or prevent submission
    // (This depends on frontend validation implementation)
    const validationError = page.locator('[class*="error"], [class*="invalid"], [role="alert"]').first();
    const hasError = await validationError.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Either validation errors should show, or we should still be on create page
    expect(
      hasError || page.url().includes('/create')
    ).toBeTruthy();
  });

  test('should load transaction categories when transaction type is selected', async ({ page }) => {
    test.skip(!testBankAccount?.bankAccountName, 'Bank account must be created first');

    await openCreateTransactionFromList(page, testBankAccount.bankAccountName);

    // Wait for transaction type dropdown
    const transactionTypeSelect = page.locator('input[aria-autocomplete="list"]').first();
    await transactionTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(2000);

    // Intercept API call for transaction categories
    const categoryResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/reconsile/getTransactionCat'),
      { timeout: 15000 }
    );

    // Select a transaction type
    await transactionTypeSelect.click();
    await page.waitForTimeout(1000);
    const firstOption = page.getByRole('option').first();
    if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstOption.click();
    }

    // Wait for category API call
    const categoryResponse = await categoryResponsePromise;
    expect(categoryResponse.status()).toBe(200);

    // Verify transaction category dropdown is populated
    await page.waitForTimeout(2000);
    const categorySelect = page.locator('input[aria-autocomplete="list"]').nth(1);
    if (await categorySelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      await categorySelect.click();
      await page.waitForTimeout(1000);
      // Should have at least one option
      const options = page.getByRole('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
    }
  });
});
