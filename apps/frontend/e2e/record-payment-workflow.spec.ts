import { test, expect } from '@playwright/test';
import {
  createInvoiceViaAPI,
  postInvoice,
  generateInvoiceNumber,
  InvoiceData,
} from './helpers/invoice-helpers';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { createTestContact } from './helpers/contact-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * Record Payment Workflow E2E Tests
 *
 * Tests the customer invoice record payment flow:
 * - Navigate from invoice list to record payment
 * - Fill form (Payment Mode, Received Through, etc.)
 * - Submit and verify payment is recorded
 */

const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const INVOICE_LIST_PATH = '/admin/income/customer-invoice';

test.describe('Record Payment Workflow', () => {
  const credentials = getTestUserCredentials();
  const username = credentials.username;
  const password = credentials.password;

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await loginTestUser(page, username, password);
  });

  test('should record payment from invoice list via UI', async ({ page, request }) => {
    test.skip(!username || !password, 'E2E credentials required');

    // Get auth token for API
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    test.skip(!token, 'Auth token required');

    // Create test customer
    const timestamp = Date.now();
    await createTestContact(
      page,
      `PayTestFirst${timestamp}`,
      `PayTestLast${timestamp}`,
      `paytest${timestamp}@example.com`,
      { contactType: 'CUSTOMER' }
    );
    await page.waitForTimeout(2000);

    const contactRes = await request.get(
      `${process.env.E2E_API_BASE_URL || 'http://localhost:8080'}/rest/contact/getContactList?paginationDisable=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const contacts = await contactRes.json();
    const contact = contacts.data?.find((c: any) =>
      c.email?.includes(`paytest${timestamp}@example.com`)
    );
    const contactId = contact?.contactId ?? contact?.id ?? 1;

    // Create and post invoice
    const invoiceData: InvoiceData = {
      contactId,
      referenceNumber: generateInvoiceNumber(),
      lineItems: [{ description: 'Record Payment Test', quantity: 1, unitPrice: 100 }],
    };

    const invoice = await createInvoiceViaAPI(request, token, invoiceData);
    test.skip(!invoice.invoiceId, 'Invoice must be created');

    await postInvoice(request, token, invoice.invoiceId);
    await page.waitForTimeout(2000);

    // Navigate to customer invoice list
    const baseUrl = getFrontendBaseUrl();
    await page.goto(`${baseUrl}${INVOICE_LIST_PATH}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Find the invoice row and click Record Payment
    const invoiceRow = page.getByRole('row', { name: new RegExp(invoiceData.referenceNumber!) });
    await expect(invoiceRow).toBeVisible({ timeout: 10000 });

    // Open actions dropdown (button with MoreHorizontal icon)
    const actionsBtn = invoiceRow.getByRole('button', { name: /open menu/i });
    await actionsBtn.click();
    await page.getByRole('menuitem', { name: /record payment/i }).click();

    // Wait for record payment page
    await expect(page).toHaveURL(/record-payment/, { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Verify form loaded
    await expect(page.getByText(/payment.*customer.*invoice|record payment/i)).toBeVisible({
      timeout: 5000,
    });

    // Payment Mode dropdown - select CASH or BANK if visible
    const payModeSelect = page.locator('[id="payMode"]').or(page.getByLabel(/payment mode/i));
    if (await payModeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payModeSelect.click();
      await page
        .getByRole('option', { name: /CASH|BANK/i })
        .first()
        .click();
    }

    // Received Through dropdown
    const depositSelect = page
      .locator('[id="depositeTo"]')
      .or(page.getByLabel(/received through/i));
    if (await depositSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await depositSelect.click();
      await page.getByRole('option').first().click();
    }

    // Click Record Payment button
    const submitBtn = page.getByRole('button', { name: /record payment|recording/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Wait for success - either redirect or success message
    await Promise.race([
      page.waitForURL(/customer-invoice(?!.*record-payment)/, { timeout: 15000 }),
      page.getByText(/payment recorded|success/i).waitFor({ timeout: 15000 }),
    ]).catch(() => {});

    // Verify we're back at invoice list or see success
    const success =
      page.url().includes(INVOICE_LIST_PATH) ||
      (await page
        .getByText(/success|recorded/i)
        .isVisible()
        .catch(() => false));
    expect(success).toBeTruthy();
  });

  test('should display Payment Mode and Received Through options', async ({ page }) => {
    // Go to invoice list first
    const baseUrl = getFrontendBaseUrl();
    await page.goto(`${baseUrl}${INVOICE_LIST_PATH}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Find any invoice with Record Payment - look for action button
    const firstRow = page.locator('table tbody tr').first();
    if (!(await firstRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'No invoices in list');
    }

    const actionsBtn = firstRow.locator('button').first();
    await actionsBtn.click();
    await page.waitForTimeout(500);

    const recordPaymentItem = page.getByRole('menuitem', { name: /record payment/i });
    if (!(await recordPaymentItem.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip(true, 'No Record Payment action - invoice may be paid or draft');
    }
    await recordPaymentItem.click();

    await page.waitForTimeout(2000);

    // Check Payment Mode has options (CASH, BANK)
    const payModeDropdown = page.locator('[id="payMode"]').or(
      page
        .getByText(/payment mode/i)
        .locator('..')
        .locator('[class*="control"]')
    );
    if (await payModeDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payModeDropdown.click();
      await page.waitForTimeout(500);
      const cashOption = page.getByRole('option', { name: /CASH/i });
      const bankOption = page.getByRole('option', { name: /BANK/i });
      await expect(cashOption.or(bankOption)).toBeVisible({ timeout: 2000 });
    }

    // Check Received Through has options
    const depositDropdown = page.locator('[id="depositeTo"]');
    if (await depositDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await depositDropdown.click();
      await page.waitForTimeout(500);
      const options = page.getByRole('option');
      await expect(options.first()).toBeVisible({ timeout: 2000 });
    }
  });
});
