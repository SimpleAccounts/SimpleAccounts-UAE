import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * Quick Verification Test
 * Tests critical functionality that was previously broken
 */

test.describe('Quick Verification Tests', () => {
  const credentials = getTestUserCredentials();
  const username = credentials.username;
  const password = credentials.password;

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, username, password);
  });

  test('expense list page should load without reducer errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${getFrontendBaseUrl()}/admin/expense/expense`, {
      waitUntil: 'networkidle',
    });
    
    await page.waitForTimeout(3000);
    
    const criticalErrors = errors.filter(e => 
      e.includes('Cannot assign to read only property') || 
      e.includes('TypeError') ||
      e.includes('Uncaught')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('bank account transaction create page should load transaction types', async ({ page }) => {
    const errors: string[] = [];
    page.on('response', response => {
      if (response.url().includes('/rest/datalist/getBankTransactionTypes') && response.status() !== 200) {
        errors.push(`getBankTransactionTypes failed: ${response.status()}`);
      }
    });

    await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account/transaction/create?bankId=13507`, {
      waitUntil: 'networkidle',
    });
    
    await page.waitForTimeout(3000);
    
    // Check if transaction type dropdown is populated
    const transactionTypeInput = page.locator('input[aria-autocomplete="list"]').first();
    await transactionTypeInput.waitFor({ state: 'visible', timeout: 10000 });
    await transactionTypeInput.click();
    await page.waitForTimeout(1000);
    
    const optionsMenu = page.locator('[role="listbox"]').first();
    const isVisible = await optionsMenu.isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(isVisible).toBe(true);
    expect(errors.length).toBe(0);
  });

  test('should create Money Received transaction', async ({ page }) => {
    const transactionDescription = `Quick Test Money Received ${Date.now()}`;
    const transactionAmount = '250';

    await page.goto(`${getFrontendBaseUrl()}/admin/banking/bank-account/transaction/create?bankId=13507`, {
      waitUntil: 'networkidle',
    });
    
    await page.waitForTimeout(3000);

    // Fill amount
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

    // Select Transaction Type
    const transactionTypeInput = page.locator('input[aria-autocomplete="list"]').first();
    await transactionTypeInput.waitFor({ state: 'visible', timeout: 10000 });
    await transactionTypeInput.click();
    await page.waitForTimeout(1000);

    const optionsMenu = page.locator('[role="listbox"]').first();
    await optionsMenu.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for category API call
    const categoryResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/reconsile/getTransactionCat') && response.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);

    // Find and click Money Received option
    const moneyReceivedOption = page.getByRole('option', { name: /money received/i });
    const isVisible = await moneyReceivedOption.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isVisible) {
      // Try to find it in all options
      const allOptions = page.getByRole('option');
      const optionCount = await allOptions.count();
      let found = false;
      for (let i = 0; i < optionCount; i++) {
        const optionText = await allOptions.nth(i).textContent();
        if (optionText && /money received/i.test(optionText)) {
          await allOptions.nth(i).click();
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error('Money Received option not found');
      }
    } else {
      await moneyReceivedOption.click();
    }

    await categoryResponsePromise;
    await page.waitForTimeout(2000);

    // Select category if available
    const categorySelects = page.locator('input[aria-autocomplete="list"]');
    const categorySelectCount = await categorySelects.count();
    if (categorySelectCount > 1) {
      const categorySelect = categorySelects.nth(1);
      if (await categorySelect.isVisible({ timeout: 5000 }).catch(() => false)) {
        await categorySelect.click();
        await page.waitForTimeout(1000);
        const categoryOptions = page.getByRole('option');
        const optionCount = await categoryOptions.count();
        if (optionCount > 0) {
          await categoryOptions.first().click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Submit transaction
    const saveResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/rest/transaction/save') && response.status() === 200,
      { timeout: 60000 }
    ).catch(() => null);

    const submitButton = page.getByRole('button', { name: /^create$/i }).first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    const response = await saveResponsePromise;
    
    if (!response || response.status() !== 200) {
      await page.screenshot({ path: 'test-results/money-received-error.png' });
      throw new Error(`Transaction save failed with status ${response?.status() || 'timeout'}`);
    }

    expect(response.status()).toBe(200);
  });
});
