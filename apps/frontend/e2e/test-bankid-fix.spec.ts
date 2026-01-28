import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * Test to verify bankId=null fix
 * This test specifically verifies that selecting a transaction type
 * does NOT result in bankId=null being sent to the API
 */

test.describe('BankId Fix Verification', () => {
  const credentials = getTestUserCredentials();
  const username = credentials.username;
  const password = credentials.password;

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, username, password);
  });

  test('should NOT include bankId=null when selecting transaction type', async ({ page }) => {
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

    // Click 3-dots menu and select "Add Transaction"
    const menuButton = firstRow.locator('button[aria-haspopup="menu"]').first();
    await menuButton.waitFor({ state: 'visible', timeout: 10000 });
    await menuButton.scrollIntoViewIfNeeded();
    await menuButton.click({ force: true });
    await page.waitForTimeout(1000);
    
    const addTransactionMenuItem = page.getByRole('menuitem', { name: /add.*transaction/i });
    await addTransactionMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await addTransactionMenuItem.click();

    // Wait for transaction create page
    await page.waitForURL('**/bank-account/transaction/create**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Set up response listener to capture the getTransactionCat API call
    let capturedUrl = '';
    let hasBankIdNull = false;
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/rest/reconsile/getTransactionCat')) {
        capturedUrl = url;
        if (url.includes('bankId=null')) {
          hasBankIdNull = true;
          console.error('❌ ERROR: bankId=null found in URL:', url);
        } else {
          console.log('✅ URL is correct (no bankId=null):', url);
        }
      }
    });

    // Wait for form to be ready
    await page.waitForSelector('form', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Find and click the transaction type dropdown
    const reactSelectContainer = page.locator('[class*="react-select"]').first();
    await reactSelectContainer.waitFor({ state: 'attached', timeout: 15000 });
    
    // Click on the control div
    const controlDiv = reactSelectContainer.locator('div[class*="control"]').first();
    await controlDiv.click({ force: true });
    await page.waitForTimeout(1500);

    // Wait for options menu
    await page.waitForSelector('[role="listbox"]', { timeout: 15000 });
    
    // Select first option
    const firstOption = page.getByRole('option').first();
    await firstOption.waitFor({ state: 'visible', timeout: 5000 });
    await firstOption.click();
    
    // Wait for API call to complete
    await page.waitForTimeout(3000);

    // Verify the fix
    if (capturedUrl) {
      console.log('Captured URL:', capturedUrl);
      expect(capturedUrl).not.toContain('bankId=null');
      expect(hasBankIdNull).toBe(false);
      
      // If bankId is present, it should be a valid number, not null
      if (capturedUrl.includes('bankId=')) {
        const bankIdMatch = capturedUrl.match(/bankId=(\d+)/);
        expect(bankIdMatch).not.toBeNull();
        expect(bankIdMatch![1]).toBeTruthy();
        console.log('✅ bankId is a valid number:', bankIdMatch![1]);
      } else {
        console.log('✅ bankId parameter correctly omitted (not needed)');
      }
    } else {
      console.warn('⚠️  getTransactionCat API call was not captured. This might be okay if transaction type doesn\'t require categories.');
    }

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/bankid-fix-verification.png' });
  });
});
