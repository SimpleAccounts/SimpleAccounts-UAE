import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * Simple E2E Test: Create Transaction via UI
 * 
 * This test verifies transaction creation works end-to-end:
 * 1. Login
 * 2. Navigate to bank account list
 * 3. Open transaction create page for first bank account
 * 4. Fill required fields
 * 5. Submit and verify transaction is created
 */

test.describe('Create Transaction (Simple)', () => {
  const credentials = getTestUserCredentials();
  const username = credentials.username;
  const password = credentials.password;

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, username, password);
  });

  test('should create a transaction successfully via UI', async ({ page }) => {
    const transactionDescription = `E2E Test Transaction ${Date.now()}`;
    const transactionAmount = '1000';

    // Navigate to bank account list
    await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account`, {
      waitUntil: 'networkidle',
    });

    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Get first bank account row
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.waitFor({ state: 'visible', timeout: 10000 });
    
    // Get bank account name for later verification
    const bankAccountName = await firstRow.locator('td').first().textContent();
    expect(bankAccountName).toBeTruthy();

    // Extract bank account ID from the row (it might be in a data attribute or we can get it from API response)
    // For now, we'll rely on the navigation state being set correctly by the menu click

    // Click 3-dots menu and select "Add Transaction"
    const menuButton = firstRow.locator('button[aria-haspopup="menu"], button[aria-label*="menu"], button[aria-label*="actions"]').first();
    await menuButton.waitFor({ state: 'visible', timeout: 10000 });
    await menuButton.scrollIntoViewIfNeeded();
    await menuButton.click({ force: true });
    await page.waitForTimeout(1000);
    
    // Wait for menu to appear and click "Add Transaction"
    const addTransactionMenuItem = page.getByRole('menuitem', { name: /add.*transaction/i });
    await addTransactionMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await addTransactionMenuItem.click();

    // Wait for transaction create page to load
    await page.waitForURL('**/bank-account/transaction/create**', { timeout: 15000 });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for errors on the page
    const errorElements = page.locator('[class*="error"], [role="alert"]');
    const errorCount = await errorElements.count();
    if (errorCount > 0) {
      const errorText = await errorElements.first().textContent().catch(() => 'Unknown error');
      await page.screenshot({ path: 'test-results/transaction-page-error.png' });
      throw new Error(`Error on transaction create page: ${errorText}`);
    }

    // Wait for form to be ready
    await page.waitForSelector('form', { timeout: 15000 });
    
    // Wait for transaction types API to load (this populates the dropdown)
    // Try multiple possible API endpoints
    const transactionTypesResponse = await Promise.race([
      page.waitForResponse(
        (response) => response.url().includes('/rest/datalist/getTransactionTypes') && response.status() === 200,
        { timeout: 20000 }
      ).catch(() => null),
      page.waitForResponse(
        (response) => response.url().includes('/rest/datalist') && response.status() === 200,
        { timeout: 20000 }
      ).catch(() => null),
    ]).catch(() => null);
    
    // Don't fail if API doesn't load - just wait a bit for form to be ready
    await page.waitForTimeout(3000);
    
    // Verify form fields are present
    const formExists = await page.locator('form').isVisible({ timeout: 5000 }).catch(() => false);
    if (!formExists) {
      await page.screenshot({ path: 'test-results/form-not-visible.png' });
      throw new Error('Form is not visible on the page');
    }

    // Fill transaction date - use DatePicker input
    const dateInput = page.locator('input[placeholder*="Transaction Date"], input[id="transactionDate"]').first();
    if (await dateInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // DatePicker format is dd-MM-yyyy
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(
        today.getMonth() + 1
      ).padStart(2, '0')}-${today.getFullYear()}`;
      await dateInput.fill(formattedDate);
      await page.waitForTimeout(500);
    }

    // Fill amount - REQUIRED (field name is "transactionAmount")
    const amountInput = page.locator('input[name="transactionAmount"], input[type="number"]').first();
    await amountInput.waitFor({ state: 'visible', timeout: 15000 });
    await amountInput.fill(transactionAmount);
    await page.waitForTimeout(500);

    // Fill description (textarea)
    const descriptionInput = page.locator('textarea[name="description"], input[name="description"]').first();
    if (await descriptionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await descriptionInput.fill(transactionDescription);
      await page.waitForTimeout(500);
    }

    // Select Transaction Type - REQUIRED
    // Try multiple selectors to find the dropdown
    let transactionTypeOpened = false;
    
    // Method 1: Find react-select by looking for the label "Transaction Type"
    const transactionTypeLabel = page.locator('label:has-text("Transaction Type")').first();
    const hasLabel = await transactionTypeLabel.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasLabel) {
      const labelParent = transactionTypeLabel.locator('..');
      const reactSelect = labelParent.locator('[class*="react-select"]').first();
      if (await reactSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
        await reactSelect.scrollIntoViewIfNeeded();
        const control = reactSelect.locator('div').first();
        await control.click({ force: true });
        transactionTypeOpened = true;
      }
    }
    
    // Method 2: Find by input aria-autocomplete
    if (!transactionTypeOpened) {
      const transactionTypeInput = page.locator('input[aria-autocomplete="list"]').first();
      if (await transactionTypeInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Find parent react-select container
        const parent = transactionTypeInput.locator('..').locator('..');
        const reactSelect = parent.locator('[class*="react-select"]').first();
        if (await reactSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
          await reactSelect.scrollIntoViewIfNeeded();
          await reactSelect.locator('div').first().click({ force: true });
          transactionTypeOpened = true;
        } else {
          // Direct click on input
          await transactionTypeInput.evaluate((el: HTMLElement) => {
            const event = new MouseEvent('mousedown', { bubbles: true });
            el.dispatchEvent(event);
            const clickEvent = new MouseEvent('click', { bubbles: true });
            el.dispatchEvent(clickEvent);
          });
          transactionTypeOpened = true;
        }
      }
    }
    
    if (!transactionTypeOpened) {
      await page.screenshot({ path: 'test-results/transaction-type-dropdown-not-found.png' });
      throw new Error('Could not find or open transaction type dropdown');
    }
    
    await page.waitForTimeout(2000);

    // Wait for options menu to appear
    await page.waitForSelector('[role="listbox"], [id*="react-select"]', { timeout: 15000 });
    const optionsMenu = page.locator('[role="listbox"]').first();
    await optionsMenu.waitFor({ state: 'visible', timeout: 10000 });

    // Set up response listener for transaction category API - VERIFY NO bankId=null
    let categoryResponseUrl = '';
    const categoryResponsePromise = page.waitForResponse(
      (response) => {
        const url = response.url();
        if (url.includes('/rest/reconsile/getTransactionCat')) {
          categoryResponseUrl = url;
          // CRITICAL: Verify that bankId=null is NOT in the URL
          if (url.includes('bankId=null')) {
            console.error('ERROR: bankId=null found in URL:', url);
            throw new Error(`bankId=null found in URL: ${url}`);
          }
          return response.status() === 200;
        }
        return false;
      },
      { timeout: 15000 }
    ).catch((err) => {
      if (categoryResponseUrl && categoryResponseUrl.includes('bankId=null')) {
        throw new Error(`bankId=null error: ${err.message}`);
      }
      return null;
    });

    // Select first available transaction type
    const firstOption = page.getByRole('option').first();
    await firstOption.waitFor({ state: 'visible', timeout: 5000 });
    await firstOption.click();
    await page.waitForTimeout(2000);

    // Wait for category API call
    await categoryResponsePromise;

    // Select transaction category if available
    const allSelects = page.locator('input[aria-autocomplete="list"]');
    const selectCount = await allSelects.count();
    
    if (selectCount > 1) {
      const categorySelect = allSelects.nth(1);
      if (await categorySelect.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Use JavaScript click to avoid viewport issues
        await categorySelect.evaluate((el: HTMLElement) => {
          (el as any).click();
        });
        await page.waitForTimeout(1500);
        
        const categoryOptions = page.getByRole('option');
        const optionCount = await categoryOptions.count();
        if (optionCount > 0) {
          await categoryOptions.first().waitFor({ state: 'visible', timeout: 5000 });
          await categoryOptions.first().click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Set up response listener for transaction save
    const saveResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/transaction/save') && response.request().method() === 'POST',
      { timeout: 60000 }
    );

    // Submit form
    const submitButton = page.getByRole('button', { name: /^create$/i }).first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Wait for save response
    const saveResponse = await saveResponsePromise;
    
    // Verify success
    expect(saveResponse.status()).toBe(200);
    
    // Verify transaction was created by checking response or navigation
    await page.waitForTimeout(2000);
    
    // Check for success message or navigation
    const successMessage = page.getByText(/success|created|saved/i);
    const hasSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
    
    // If still on create page, check for error
    if (page.url().includes('/create')) {
      const errorMessage = page.locator('[class*="error"], [role="alert"]').first();
      const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasError) {
        const errorText = await errorMessage.textContent().catch(() => 'Unknown error');
        await page.screenshot({ path: 'test-results/transaction-create-failed.png' });
        throw new Error(`Transaction creation failed: ${errorText}`);
      }
    }

    // Verify transaction appears in list
    await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account`, {
      waitUntil: 'networkidle',
    });

    // Find the bank account and click to view transactions
    const bankAccountRow = page.locator('table tbody tr').filter({ hasText: bankAccountName }).first();
    await bankAccountRow.waitFor({ state: 'visible', timeout: 10000 });
    await bankAccountRow.locator('td').first().click();
    
    await page.waitForURL('**/bank-account/detail**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Verify transaction appears (by amount or description)
    const transactionFound = await page.getByText(transactionAmount).isVisible({ timeout: 10000 }).catch(() => false);
    expect(transactionFound).toBeTruthy();
  });
});
