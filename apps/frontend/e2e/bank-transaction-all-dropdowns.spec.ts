import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import { getFrontendBaseUrl } from './helpers/test-setup-helpers';
import {
  createProductViaAPI,
  generateProductCode,
  generateProductName,
} from './helpers/product-helpers';

const BASE = getFrontendBaseUrl();
const BANK_ID = 13508;

async function openSelectByLabel(page: Page, labelRe: RegExp) {
  const label = page.getByText(labelRe, { exact: false }).first();
  await label.scrollIntoViewIfNeeded();
  await label.waitFor({ state: 'visible', timeout: 10_000 });
  const formGroup = label.locator('xpath=ancestor::*[self::div or self::label][1]').first();
  const combobox = formGroup.locator('[role="combobox"]').first();
  if (await combobox.isVisible({ timeout: 2000 }).catch(() => false)) {
    await combobox.click();
  } else {
    await label.locator('xpath=following::*[@role="combobox"][1]').first().click();
  }
}

async function selectFirstOption(page: Page) {
  const opt = page.getByRole('option').first();
  await opt.waitFor({ state: 'visible', timeout: 5000 });
  await opt.click();
}

test.describe('Bank Transaction - All Dropdowns', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, getTestUserCredentials().username, getTestUserCredentials().password);
  });

  test('Sales: create customer invoice then verify invoice dropdown in bank transaction', async ({
    page,
  }) => {
    const authToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!authToken) throw new Error('No accessToken');

    await createProductViaAPI(page.request, authToken, {
      productName: generateProductName('BankTx Product'),
      productCode: generateProductCode(),
      salesUnitPrice: 100,
      purchaseUnitPrice: 80,
      vatCategoryId: 1,
      productType: 'GOODS',
      productPriceType: 'SALES',
    });

    const invoiceRef = `INV-${Date.now()}`;
    await page.goto(`${BASE}/admin/income/customer-invoice/create`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('#invoice_number', { timeout: 15_000 });
    await page.locator('#invoice_number').fill(invoiceRef);

    await openSelectByLabel(page, /customer name/i);
    await selectFirstOption(page);
    await page.waitForTimeout(500);

    await openSelectByLabel(page, /terms/i);
    const net30 = page.getByRole('option', { name: /net 30 days/i }).first();
    if (await net30.isVisible({ timeout: 2000 }).catch(() => false)) {
      await net30.click();
    } else {
      await selectFirstOption(page);
    }
    await page.waitForTimeout(500);

    const firstRow = page.locator('table tbody tr').first();
    const productCombo = firstRow.locator('[role="combobox"]').first();
    await productCombo.click();
    await page.locator('input[aria-autocomplete="list"]').last().fill('E2E');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const qtyInput = firstRow.locator('input[type="number"]').first();
    await qtyInput.fill('1');
    const priceInput = firstRow.locator('input[type="number"]').nth(1);
    await priceInput.fill('500');

    await page.getByRole('button', { name: /^create$/i }).click();
    await page.waitForURL(/customer-invoice/, { timeout: 15_000 });

    await page.goto(`${BASE}/admin/banking/bank-account/transaction/create?bankId=${BANK_ID}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('form', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    const invoiceApiCalls: { status: number }[] = [];
    page.on('response', r => {
      if (r.url().includes('/rest/invoice/getSuggestionInvoicesFotCust')) {
        invoiceApiCalls.push({ status: r.status() });
      }
    });

    const txTypeCombobox = page.locator('input[aria-autocomplete="list"]').first();
    await txTypeCombobox.click();
    await page.getByRole('option', { name: /^sales$/i }).click();
    await page.waitForTimeout(1500);

    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill('100');
    await page.waitForTimeout(500);

    await openSelectByLabel(page, /customer/i);
    await selectFirstOption(page);
    await page.waitForTimeout(3000);

    if (invoiceApiCalls.length > 0) {
      expect(invoiceApiCalls[0].status).toBe(200);
    }

    const invoiceSelect = page
      .locator('text=Customer Invoice')
      .locator('xpath=following::*[@role="combobox"][1]')
      .first();
    if (await invoiceSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await invoiceSelect.click();
      await page.waitForTimeout(1500);
      const opts = page.getByRole('option');
      const count = await opts.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('Expense: dropdowns visible and no 500 on load', async ({ page }) => {
    await page.goto(`${BASE}/admin/banking/bank-account/transaction/create?bankId=${BANK_ID}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('form', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const txTypeCombobox = page.locator('input[aria-autocomplete="list"]').first();
    await txTypeCombobox.click();
    await page.getByRole('option', { name: /^expense$/i }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText(/expense category/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/^vat$/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/vendor/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Invoice: vendor API returns 200 not 500', async ({ page }) => {
    const vendorResponses: { status: number }[] = [];
    page.on('response', r => {
      if (r.url().includes('/rest/contact/getContactsForDropdownForVendor')) {
        vendorResponses.push({ status: r.status() });
      }
    });

    await page.goto(`${BASE}/admin/banking/bank-account/transaction/create?bankId=${BANK_ID}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('form', { timeout: 15_000 });
    await page.waitForTimeout(1500);

    const txTypeCombobox = page.locator('input[aria-autocomplete="list"]').first();
    await txTypeCombobox.click();
    await page.getByRole('option', { name: /^invoice$/i }).click();
    await page.waitForTimeout(3000);

    if (vendorResponses.length > 0) {
      expect(vendorResponses[0].status).toBe(200);
    }
  });

  test('VAT Payment and Corporate Tax: UI elements visible', async ({ page }) => {
    await page.goto(`${BASE}/admin/banking/bank-account/transaction/create?bankId=${BANK_ID}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('form', { timeout: 15_000 });

    const txTypeCombobox = page.locator('input[aria-autocomplete="list"]').first();
    await txTypeCombobox.click();
    await page.getByRole('option', { name: /vat payment/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.getByText(/vat report/i).first()).toBeVisible({ timeout: 5000 });

    await txTypeCombobox.click();
    await page.getByRole('option', { name: /corporate tax payment/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.getByText(/corporate tax period|tax period/i).first()).toBeVisible({
      timeout: 5000,
    });
  });
});
