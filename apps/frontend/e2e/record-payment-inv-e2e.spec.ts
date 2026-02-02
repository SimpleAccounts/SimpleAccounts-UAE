import { test, expect } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { getFrontendBaseUrl, getApiBaseUrl } from './helpers/test-setup-helpers';

/**
 * Records a payment of AED 200 on invoice INV-E2E-1769925291716 via CASH
 * Run with: npx playwright test record-payment-inv-e2e.spec.ts --project=chromium
 *
 * Uses API to record payment then verifies in UI.
 */
const INVOICE_REF = 'INV-E2E-1769925291716';
const PAYMENT_AMOUNT = 200;

test.describe('Record payment on INV-E2E', () => {
  const { username, password } = getTestUserCredentials();

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD required');
    await loginTestUser(page, username, password);
  });

  test('record AED 200 payment via CASH on INV-E2E-1769925291716', async ({ page, request }) => {
    const baseUrl = getFrontendBaseUrl();
    const apiUrl = getApiBaseUrl();

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    test.skip(!token, 'Auth token required');

    // 1. Get invoice by reference number
    const listRes = await request.get(
      `${apiUrl}/rest/invoice/getList?referenceNumber=${encodeURIComponent(INVOICE_REF)}&paginationDisable=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const listData = await listRes.json();
    const invoices = listData?.data ?? listData ?? [];
    const invoice = Array.isArray(invoices)
      ? invoices.find((inv: any) => (inv.referenceNumber || inv.invoiceNumber || '').includes(INVOICE_REF))
      : null;

    test.skip(!invoice, `Invoice ${INVOICE_REF} not found`);

    const invoiceId = invoice.id ?? invoice.invoiceId;
    const contactId = invoice.contactId ?? invoice.contact?.contactId;
    const dueAmount = parseFloat(invoice.dueAmount ?? invoice.remainingInvoiceAmount ?? 0) || PAYMENT_AMOUNT;

    // 2. Get deposit options to find Petty Cash transaction category ID
    const depRes = await request.get(`${apiUrl}/rest/datalist/receipt/tnxCat`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    let depositeToId = 47;
    if (depRes.ok()) {
      const depList = await depRes.json();
      for (const group of depList || []) {
        const opts = group?.options ?? [];
        const petty = opts.find(
          (o: any) =>
            String(o.label || o.name || '').toLowerCase().includes('petty') ||
            String(o.value || o.id).includes('47')
        );
        if (petty) {
          depositeToId = petty.value ?? petty.id ?? 47;
          break;
        }
      }
    }

    // 3. Get invoice details for paidInvoiceListStr
    const invDetailsRes = await request.get(`${apiUrl}/rest/invoice/getInvoiceById?id=${invoiceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const invDetails = invDetailsRes.ok() ? await invDetailsRes.json() : invoice;

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    const paidInvoiceListStr = JSON.stringify([
      {
        id: invoiceId,
        date: invDetails.invoiceDate || dateStr,
        dueDate: invDetails.invoiceDueDate || invDetails.dueDate || dateStr,
        referenceNo: invDetails.referenceNumber || invDetails.invoiceNumber || INVOICE_REF,
        totalAount: invDetails.totalAmount ?? invDetails.invoiceAmount ?? dueAmount,
        dueAmount: dueAmount,
        paidAmount: PAYMENT_AMOUNT,
      },
    ]);

    // 4. Record payment via API
    const formData = new URLSearchParams();
    formData.append('receiptNo', `RCP-${Date.now()}`);
    formData.append('receiptDate', dateStr);
    formData.append('paidInvoiceListStr', paidInvoiceListStr);
    formData.append('invoiceNumber', invDetails.referenceNumber || INVOICE_REF);
    formData.append('invoiceAmount', String(invDetails.totalAmount ?? invDetails.invoiceAmount ?? dueAmount));
    formData.append('amount', String(PAYMENT_AMOUNT));
    formData.append('contactId', String(contactId));
    formData.append('payMode', 'CASH');
    formData.append('depositeTo', String(depositeToId));
    formData.append('notes', '');
    formData.append('referenceCode', '');

    const saveRes = await request.post(`${apiUrl}/rest/receipt/save`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData.toString(),
    });

    if (!saveRes.ok()) {
      const errText = await saveRes.text();
      throw new Error(`Receipt save failed: ${saveRes.status()} ${errText}`);
    }

    const receiptData = await saveRes.json();
    const success =
      receiptData?.receiptId != null ||
      receiptData?.id != null ||
      (receiptData?.message && !receiptData?.error) ||
      receiptData?.code === '0049';
    expect(success).toBeTruthy();

    // 5. Verify in UI - go to invoice list and check
    await page.goto(`${baseUrl}/admin/income/customer-invoice`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const row = page.getByRole('row', { name: new RegExp(INVOICE_REF, 'i') });
    await expect(row).toBeVisible({ timeout: 10000 });
  });

  test('record payment via UI form', async ({ page }) => {
    const baseUrl = getFrontendBaseUrl();

    await page.goto(`${baseUrl}/admin/income/customer-invoice`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const invoiceRow = page.getByRole('row', { name: new RegExp(INVOICE_REF, 'i') });
    await expect(invoiceRow).toBeVisible({ timeout: 15000 });

    await invoiceRow.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('menuitem', { name: /record payment/i }).click();

    await expect(page).toHaveURL(/record-payment/, { timeout: 5000 });
    await page.waitForTimeout(3000);

    const amountField = page.locator('input#amount').or(page.locator('input[placeholder*="Amount"]').first());
    await amountField.waitFor({ state: 'visible', timeout: 5000 });
    await amountField.click();
    await amountField.fill('');
    await amountField.fill(PAYMENT_AMOUNT.toString());

    const payModeTrigger = page.locator('#payMode').first();
    await payModeTrigger.click();
    await page.waitForTimeout(400);
    await page.getByRole('option', { name: /CASH/i }).click();

    const depositTrigger = page.locator('#depositeTo').first();
    await depositTrigger.click();
    await page.waitForTimeout(400);
    await page.getByRole('option', { name: /petty cash/i }).click();

    await page.getByRole('button', { name: /record payment/i }).click();

    await page.waitForTimeout(5000);

    const errorToast = await page.locator('[class*="toast"], [class*="Toastify"]').filter({ hasText: /mandatory|required|fill/i }).textContent().catch(() => null);
    if (errorToast) {
      console.log('Validation error shown:', errorToast);
    }

    const redirected = page.url().includes('customer-invoice') && !page.url().includes('record-payment');
    const successToast = await page
      .getByText(/payment recorded|success|recorded successfully/i)
      .isVisible()
      .catch(() => false);
    expect(redirected || successToast, errorToast ? `Form validation failed: ${errorToast}` : 'Payment was not recorded').toBeTruthy();
  });
});
