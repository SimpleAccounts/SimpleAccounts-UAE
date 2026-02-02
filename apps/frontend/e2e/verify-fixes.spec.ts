/**
 * Verification: receipt list, product list, contact list, chart-account, quotation create customer.
 * Run with: npx playwright test e2e/verify-fixes.spec.ts --project=chromium
 */
import { test, expect } from '@playwright/test';
import { loginTestUser } from './helpers/test-user-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';

const credentials = {
  username: process.env.E2E_USERNAME || 'test@example.com',
  password: process.env.E2E_PASSWORD || 'Test@1234',
};

test.describe('Verify fixes', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !credentials.username || !credentials.password,
      'E2E_USERNAME and E2E_PASSWORD required'
    );
    await loginTestUser(page, credentials.username, credentials.password);
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test('receipt list loads without 500', async ({ page }) => {
    const baseUrl = getFrontendBaseUrl();
    const res = await page.goto(`${baseUrl}/admin/income/receipt`, { waitUntil: 'networkidle' });
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(4000);
    const receiptScreen = page.locator('.receipt-screen, [class*="receipt"]').first();
    await expect(receiptScreen).toBeVisible({ timeout: 10000 });
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });
    const hasError = await page
      .getByText(/500|Internal Server Error|Something Went Wrong/i)
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(false);
  });

  test('product list loads without infinite loop', async ({ page }) => {
    const baseUrl = getFrontendBaseUrl();
    await page.goto(`${baseUrl}/admin/master/product`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    const productScreen = page.locator('.product-screen, [class*="product"]').first();
    await expect(productScreen).toBeVisible({ timeout: 10000 });
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 15000 });
  });

  test('contact list shows table', async ({ page }) => {
    const baseUrl = getFrontendBaseUrl();
    await page.goto(`${baseUrl}/admin/master/contact`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const contactScreen = page.locator('.contact-screen, [class*="contact"]').first();
    await expect(contactScreen).toBeVisible({ timeout: 10000 });
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('chart-account list shows table', async ({ page }) => {
    const baseUrl = getFrontendBaseUrl();
    await page.goto(`${baseUrl}/admin/master/chart-account`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('quotation create customer select does not show expected string received number', async ({
    page,
  }) => {
    const baseUrl = getFrontendBaseUrl();
    await page.goto(`${baseUrl}/admin/income/quotation/create`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const customerSelect = page
      .locator('[id="customerId"], [name="customerId"], [placeholder*="Customer"]')
      .first();
    await expect(customerSelect).toBeVisible({ timeout: 10000 });
    const errBefore = await page
      .getByText(/Invalid input: expected string, received number/i)
      .isVisible()
      .catch(() => false);
    expect(errBefore).toBe(false);
  });
});
