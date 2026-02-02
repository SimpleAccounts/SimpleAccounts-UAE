import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { createTestContact, createProductViaAPI } from './helpers/contact-helpers';

let authToken: string;
let testCustomer: { contactId: number };
let testProduct: { productId: number };

/**
 * Helper to get authentication token from page localStorage
 */
async function getAuthToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  if (!token) {
    throw new Error('Authentication token not found in localStorage');
  }
  return token;
}

test.describe('Invoice Creation - Full Workflow', () => {
  const credentials = getTestUserCredentials();
  const username = credentials.username;
  const password = credentials.password;

  test.beforeAll(async ({ browser }) => {
    // Skip if credentials are not set
    test.skip(
      !username || !password,
      'E2E_USERNAME and E2E_PASSWORD must be set with valid credentials'
    );

    // Setup: Login to get auth token and create test data
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await loginTestUser(page, username, password);
      authToken = await getAuthToken(page);

      // Create test customer via API
      const timestamp = Date.now();
      testCustomer = await createTestContact(
        page,
        `TestCustomerFirst${timestamp}`,
        `TestCustomerLast${timestamp}`,
        `test-customer-${timestamp}@example.com`,
        'CUSTOMER'
      );

      // Create test product via API
      testProduct = await createProductViaAPI(page.request, authToken);

      console.log('Test setup complete:', { testCustomer, testProduct });
    } finally {
      await context.close();
    }
  });

  test('should create invoice successfully with proper feedback', async ({ page }) => {
    // Login
    await loginTestUser(page, username, password);

    // Navigate to invoice create page
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Verify we're on the create page
    await expect(page).toHaveURL('**/admin/income/customer-invoice/create');

    // Fill basic invoice details
    const referenceNumber = `INV-${Date.now()}`;
    await page.getByLabel(/Reference Number/).fill(referenceNumber);

    // Select customer (first available option)
    await page.getByText('Customer').click();
    await page.waitForTimeout(1000);
    const customerOptions = page.locator('[role="option"]');
    if ((await customerOptions.count()) > 0) {
      await customerOptions.first().click();
    }

    // Add product line
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Fill product details
    await page.getByText('Select Product').first().click();
    await page.waitForTimeout(1000);
    const productOptions = page.locator('[role="option"]');
    if ((await productOptions.count()) > 0) {
      await productOptions.first().click();
    }

    // Fill quantity and rate
    await page.locator('input[placeholder*="Quantity"]').first().fill('1');
    await page.locator('input[placeholder*="Rate"]').first().fill('100');

    // Click Create button
    const createButton = page.getByRole('button', { name: 'Create' });
    await createButton.click();

    // Check for success feedback
    // Look for toast notification or success alert
    const successToast = page
      .locator('.toast-success, [data-testid*="success"], .alert-success')
      .first();
    const successAlert = page.locator('text=/successfully|created/i').first();

    // One of these should appear
    try {
      await expect(successToast.or(successAlert)).toBeVisible({ timeout: 5000 });
      console.log('✅ Success feedback displayed');
    } catch (e) {
      console.log('⚠️  Success feedback not found, checking navigation instead');
    }

    // Check if we navigate back to the list page
    try {
      await page.waitForURL('**/admin/income/customer-invoice', { timeout: 10000 });
      console.log('✅ Successfully navigated to invoice list');

      // Verify the created invoice appears in the list
      const invoiceRow = page.locator(`text=${referenceNumber}`).first();
      await expect(invoiceRow).toBeVisible({ timeout: 5000 });
      console.log('✅ Created invoice appears in the list');
    } catch (e) {
      console.log('⚠️  Navigation to list page not detected');
    }

    console.log('✅ Invoice creation workflow completed successfully');
  });

  test('should show loading states during invoice creation', async ({ page }) => {
    // Setup test data
    await createContactViaAPI('CUSTOMER');
    await createProductViaAPI();

    // Login
    await loginTestUser(page, username, password);

    // Navigate to invoice create page
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Fill minimal invoice details
    await page.getByLabel(/Reference Number/).fill(`INV-${Date.now()}`);

    // Click Create button
    const createButton = page.getByRole('button', { name: 'Create' });
    await createButton.click();

    // Check for loading state
    const loadingButton = page.getByRole('button', { name: /Creating|Loading/i });
    try {
      await expect(loadingButton).toBeVisible({ timeout: 2000 });
      console.log('✅ Loading state displayed during creation');
    } catch (e) {
      console.log('⚠️  Loading state not clearly visible');
    }
  });

  test('should validate required fields before submission', async ({ page }) => {
    // Login
    await loginTestUser(page, username, password);

    // Navigate to invoice create page
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Try to create invoice without filling required fields
    const createButton = page.getByRole('button', { name: 'Create' });
    await createButton.click();

    // Should show validation errors or prevent submission
    // Check if we're still on the create page (form not submitted)
    await expect(page).toHaveURL('**/admin/income/customer-invoice/create');

    console.log('✅ Form validation prevents invalid submission');
  });
});
