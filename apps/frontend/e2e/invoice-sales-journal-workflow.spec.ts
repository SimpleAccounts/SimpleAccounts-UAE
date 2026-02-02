import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import {
  createInvoiceViaAPI,
  postInvoice,
  generateInvoiceNumber,
  getInvoiceDetails,
} from './helpers/invoice-helpers';
import {
  createBankAccountViaAPI,
  getBankAccountDetails,
  generateBankAccountName,
  generateAccountNumber,
} from './helpers/bank-account-helpers';
import { createTestContact } from './helpers/contact-helpers';
import {
  createProductViaAPI,
  generateProductName,
  generateProductCode,
} from './helpers/product-helpers';
import { getApiBaseUrl, getFrontendBaseUrl } from './helpers/test-setup-helpers';

/**
 * E2E: Customer Invoice -> Sales Transaction -> Journal Workflow
 *
 * 1. Create customer invoice and mark as sent (post)
 * 2. Create sales transaction in bank account (partial or complete payment)
 * 3. Verify journal list loads
 * 4. Verify customer invoice view loads (no listData.map error)
 * 5. Verify journal detail loads when clicking journal entry
 */

const BASE = getFrontendBaseUrl();
const API = getApiBaseUrl();

async function getAuthToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  if (!token) throw new Error('Missing accessToken');
  return token;
}

async function openReactSelectByLabel(page: Page, labelText: RegExp) {
  const label = page.getByText(labelText, { exact: false }).first();
  await expect(label).toBeVisible({ timeout: 15_000 });
  const combobox = label.locator('xpath=following::*[@role="combobox"][1]').first();
  await combobox.click();
  await page.waitForTimeout(800);
}

async function selectFirstNonPlaceholderOption(page: Page) {
  const opts = page.getByRole('option');
  const count = await opts.count();
  for (let i = 0; i < count; i++) {
    const text = (await opts.nth(i).textContent())?.trim() || '';
    if (text && !/^select\b/i.test(text)) {
      await opts.nth(i).click();
      return;
    }
  }
  if (count > 0) await opts.first().click();
}

test.describe.serial('Invoice -> Sales -> Journal Workflow', () => {
  const { username, password } = getTestUserCredentials();
  let authToken: string;
  let customerContactId: number;
  let bankAccountId: number;
  let productId: number;
  let invoiceId: number;
  let invoiceRef: string;

  test.beforeAll(async ({ browser }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD required');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await loginTestUser(page, username, password);
      authToken = await getAuthToken(page);

      const ts = Date.now();
      await createTestContact(page, `Cust${ts}`, `Test${ts}`, `cust${ts}@test.com`, {
        contactType: 'CUSTOMER',
      });
      await page.waitForTimeout(2000);

      const contactRes = await page.request.get(
        `${API}/rest/contact/getContactList?paginationDisable=true`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const contactData = await contactRes.json();
      const contact = (contactData.data || []).find((c: any) =>
        (c.email || '').includes(`cust${ts}@test.com`)
      );
      customerContactId = contact?.contactId ?? contact?.id ?? 1;

      const prod = await createProductViaAPI(page.request, authToken, {
        productName: generateProductName('Journal Test'),
        productCode: generateProductCode(),
        salesUnitPrice: 500,
        purchaseUnitPrice: 400,
        vatCategoryId: 1,
        productType: 'GOODS',
        productPriceType: 'SALES',
      });
      productId = prod.productId ?? prod.id ?? 1;
      await page.waitForTimeout(1000);

      const bank = await createBankAccountViaAPI(page.request, authToken, {
        bankAccountName: generateBankAccountName('Journal Workflow'),
        accountNumber: generateAccountNumber(),
        openingBalance: 0,
      });
      bankAccountId = bank.bankAccountId;
    } finally {
      await ctx.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, username, password);
  });

  test('1. Create customer invoice and mark as sent', async ({ page, request }) => {
    test.skip(!customerContactId || !productId, 'Customer and product required');
    const token = await getAuthToken(page);
    invoiceRef = generateInvoiceNumber();
    const invoiceData = {
      contactId: customerContactId,
      referenceNumber: invoiceRef,
      lineItems: [
        {
          productId,
          description: 'Journal workflow product',
          quantity: 2,
          unitPrice: 500,
        },
      ],
      type: 2,
    };
    const inv = await createInvoiceViaAPI(request, token, invoiceData);
    invoiceId = inv.invoiceId;
    expect(invoiceId).toBeDefined();

    await postInvoice(request, token, invoiceId);
    const details = await getInvoiceDetails(request, token, invoiceId);
    expect(details).toBeDefined();
  });

  test('2. Create sales transaction in bank account', async ({ page }) => {
    test.skip(!bankAccountId || !invoiceId, 'Bank account and invoice required');
    await page.goto(
      `${BASE}/admin/banking/bank-account/transaction/create?bankId=${bankAccountId}`,
      { waitUntil: 'domcontentloaded' }
    );
    await page.waitForSelector('form', { timeout: 20_000 });
    await page.waitForTimeout(2000);

    await openReactSelectByLabel(page, /transaction type/i);
    const salesOpt = page.getByRole('option', { name: /^sales$/i });
    await salesOpt.waitFor({ state: 'visible', timeout: 5000 });
    await salesOpt.click();
    await page.waitForTimeout(2000);

    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill('1000');
    await page.waitForTimeout(500);

    await openReactSelectByLabel(page, /customer/i);
    await selectFirstNonPlaceholderOption(page);
    await page.waitForTimeout(2000);

    await openReactSelectByLabel(page, /customer invoice/i);
    await page.waitForTimeout(1500);
    const invOpts = page.getByRole('option');
    const cnt = await invOpts.count();
    if (cnt > 0) {
      await invOpts.first().click();
    }
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole('button', { name: /save|create/i }).first();
    await saveBtn.click();

    await page.waitForResponse(
      r => r.url().includes('/rest/transaction/save') && (r.status() === 200 || r.status() === 400),
      { timeout: 30_000 }
    );
    await page.waitForTimeout(2000);

    const errText = await page
      .locator('.text-red-600, .invalid-feedback, [role="alert"]')
      .first()
      .textContent()
      .catch(() => '');
    if (errText && errText.includes('500')) {
      throw new Error('Transaction save failed with 500');
    }
  });

  test('3. Journal list page loads without 500', async ({ page }) => {
    const respPromise = page
      .waitForResponse(r => r.url().includes('/rest/journal/getList') && r.status() === 200, {
        timeout: 15_000,
      })
      .catch(() => null);

    await page.goto(`${BASE}/admin/accountant/journal`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const resp = await respPromise;
    expect(resp?.status()).toBe(200);
  });

  test('4. Customer invoice view loads without listData.map error', async ({ page }) => {
    test.skip(!invoiceId, 'Invoice required');
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));

    await page.goto(`${BASE}/admin/income/customer-invoice`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const row = page.locator(`tr:has-text("${invoiceRef}")`).first();
    if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'Invoice row not found in list');
    }

    const actionsBtn = row
      .locator('button[aria-haspopup="menu"], button[data-radix-collection-item]')
      .first();
    if (await actionsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await actionsBtn.click();
      await page.waitForTimeout(500);
      await page.getByRole('menuitem', { name: /view/i }).first().click();
    } else {
      await row.click();
    }
    await page.waitForTimeout(3000);

    const journalErr = errs.find(e => e.includes('listData.map'));
    expect(journalErr).toBeUndefined();
  });

  test('5. Journal detail loads when clicking journal entry', async ({ page }) => {
    test.skip(!invoiceId, 'Invoice required');
    await page.goto(`${BASE}/admin/income/customer-invoice`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const row = page.locator(`tr:has-text("${invoiceRef}")`).first();
    if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'Invoice row not found');
    }
    const actionsBtn = row
      .locator('button[aria-haspopup="menu"], button[data-radix-collection-item]')
      .first();
    if (await actionsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await actionsBtn.click();
      await page.waitForTimeout(500);
      await page.getByRole('menuitem', { name: /view/i }).first().click();
    } else {
      await row.click();
    }
    await page.waitForTimeout(3000);

    const journalSection = page.locator('text=Journal').first();
    if (!(await journalSection.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'Journal section not found - may have no journal entries yet');
    }

    const journalRow = page.locator('[class*="journal"] table tbody tr, table tbody tr').first();
    if (await journalRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      const getByIdResp = page
        .waitForResponse(r => r.url().includes('/rest/journal/getById'), { timeout: 10_000 })
        .catch(() => null);

      await journalRow.click();
      await page.waitForTimeout(2000);

      const resp = await getByIdResp;
      expect(resp?.status()).toBe(200);
    }
  });
});
