import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import {
  createProductViaAPI,
  generateProductCode,
  generateProductName,
} from './helpers/product-helpers';

const CREATE_PATH = '/admin/income/customer-invoice/create';
const LIST_PATH = '/admin/income/customer-invoice';

async function selectFirstNonPlaceholderOption(page: Page) {
  const options = page.locator('[role="option"]');
  await options.first().waitFor({ state: 'visible', timeout: 15_000 });
  const count = await options.count();
  for (let i = 0; i < count; i++) {
    const opt = options.nth(i);
    const text = (await opt.textContent().catch(() => ''))?.trim() || '';
    if (!text) continue;
    if (/^select\b/i.test(text)) continue;
    await opt.click();
    return;
  }
  // If everything looked like a placeholder, click the first option to fail fast downstream
  await options.first().click();
}

async function openReactSelectByLabel(page: Page, labelText: RegExp) {
  const label = page.getByText(labelText, { exact: false }).first();
  await expect(label).toBeVisible({ timeout: 30_000 });

  // react-select doesn't always wire <label for> to an input, so we click the nearest combobox.
  const formGroup = label.locator('xpath=ancestor::*[self::div or self::label][1]').first();
  const combobox = formGroup.locator('[role="combobox"]').first();

  if (await combobox.isVisible({ timeout: 2000 }).catch(() => false)) {
    await combobox.click();
    return;
  }

  // Fallback: click the next combobox after the label in DOM order.
  await label.locator('xpath=following::*[@role="combobox"][1]').click();
}

test.describe('Customer Invoice - UI create', () => {
  test('should create a customer invoice via UI', async ({ page }) => {
    const { username, password } = getTestUserCredentials();
    const invoiceSuffix = Date.now() % 1_000_000_000; // < 1e9
    const expectedRef = String(invoiceSuffix);

    // Login
    await loginTestUser(page, username, password);

    // Ensure at least one product exists for the product dropdown (fresh DBs can have zero products).
    const authToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!authToken) throw new Error('Missing accessToken after login');
    await createProductViaAPI(page.request, authToken, {
      productName: generateProductName('E2E Product'),
      productCode: generateProductCode(),
      salesUnitPrice: 100,
      purchaseUnitPrice: 80,
      vatCategoryId: 1,
      productType: 'GOODS',
      productPriceType: 'SALES',
    });

    // Navigate to create invoice page and wait for the customer dropdown call.
    // This request typically happens during initial page load.
    const customerDropdownResponsePromise = page.waitForResponse(
      r => r.url().includes('/rest/contact/getContactsForDropdown?contactType=2'),
      { timeout: 60_000 }
    );
    await page.goto(CREATE_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#invoice_number')).toBeVisible({ timeout: 30_000 });

    // Fill invoice number with an int-safe suffix (backend parses numeric suffix into Integer).
    await page.locator('#invoice_number').fill(expectedRef);

    // Select customer
    // The label text is localized but defaults to English in most dev setups.
    await openReactSelectByLabel(page, /customer name/i);
    await selectFirstNonPlaceholderOption(page);

    // Ensure dropdown request succeeded (no 500)
    const dropdownResp = await customerDropdownResponsePromise;
    expect(dropdownResp.status()).toBe(200);

    // Select Terms (required)
    await openReactSelectByLabel(page, /terms/i);
    // Prefer Net 30 Days if present
    const net30 = page.getByRole('option', { name: /net 30 days/i }).first();
    if (await net30.isVisible({ timeout: 2000 }).catch(() => false)) {
      await net30.click();
    } else {
      await selectFirstNonPlaceholderOption(page);
    }

    // Currency often auto-populates from customer; if not, select first currency.
    const currencyErrorVisible = await page
      .locator('.invalid-feedback:has-text("Currency")')
      .isVisible()
      .catch(() => false);
    if (currencyErrorVisible) {
      await openReactSelectByLabel(page, /currency/i);
      await selectFirstNonPlaceholderOption(page);
    }

    // Ensure product list has loaded (otherwise the react-select menu can be empty/not render).
    await page
      .waitForResponse(
        r => r.url().includes('/rest/datalist/product?priceType=SALES') && r.status() === 200,
        {
          timeout: 60_000,
        }
      )
      .catch(() => {
        // If already cached/loaded before we started waiting, continue.
      });

    // Fill first product line
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 30_000 });

    const firstRow = table.locator('tbody tr').first();
    // Product select is first combobox in row
    const productCombo = firstRow.locator('[role="combobox"]').first();
    await productCombo.scrollIntoViewIfNeeded();
    await productCombo.click();
    // Type into the react-select input (keyboard events can otherwise go to the wrong focused element).
    const productInput = page.locator('input[aria-autocomplete="list"]').last();
    await expect(productInput).toBeVisible({ timeout: 15_000 });
    await productInput.fill('E2E');
    await page.keyboard.press('Enter');
    // Ensure product selection changed from placeholder.
    const productCell = firstRow.locator('td').nth(1);
    await expect(productCell).not.toContainText(/Select\.\.\./i, { timeout: 15_000 });

    // Quantity (first numeric input in row)
    const qtyInput = firstRow.locator('input[type="number"]').first();
    await qtyInput.fill('1');

    // Unit price (second numeric input in row)
    const priceInput = firstRow.locator('input[type="number"]').nth(1);
    await priceInput.fill('1000');

    // VAT (another combobox in row, usually after product combobox)
    const comboboxes = firstRow.locator('[role="combobox"]');
    const comboCount = await comboboxes.count();
    if (comboCount >= 2) {
      await comboboxes.nth(1).click();
      await selectFirstNonPlaceholderOption(page);
    }

    // Submit and assert invoice save succeeds
    const saveReqPromise = page.waitForRequest(
      r => r.url().includes('/rest/invoice/save') && r.method() === 'POST',
      { timeout: 15_000 }
    );

    await page.getByRole('button', { name: /^create$/i }).click();

    let saveReq;
    try {
      saveReq = await saveReqPromise;
    } catch (e) {
      // Debug: surface visible validation/toast messages when the form doesn't submit.
      const invalidFeedback = await page
        .locator('.invalid-feedback')
        .allTextContents()
        .catch(() => []);
      const toastText = await page
        .locator('.Toastify__toast, [class*=\"toast\"], [role=\"alert\"]')
        .allTextContents()
        .catch(() => []);
      throw new Error(
        `Invoice form did not submit (/rest/invoice/save not requested). ` +
          `invalidFeedback=${JSON.stringify(invalidFeedback)} ` +
          `toasts=${JSON.stringify(toastText)}`
      );
    }

    const saveResp = await saveReq.response();
    expect(saveResp).toBeTruthy();
    expect(saveResp!.status()).toBe(200);

    // Some builds keep you on the create screen (or "Create and More" flow). To validate visibility,
    // explicitly go to the list page and assert our invoice exists there.
    await page.goto(LIST_PATH, { waitUntil: 'domcontentloaded' });
    const listResp = await page.waitForResponse(
      r => r.url().includes('/rest/invoice/getList?') && r.status() === 200,
      { timeout: 60_000 }
    );

    // Assert the backend response includes our invoice reference number
    const listJson = await listResp.json().catch(() => null);
    const listData = listJson && Array.isArray(listJson.data) ? listJson.data : [];
    expect(listData.some(r => String(r.referenceNumber) === expectedRef)).toBeTruthy();

    // Assert UI shows it as well
    await expect(page.locator('body')).toContainText(expectedRef, { timeout: 60_000 });

    // Click "View" from row actions to ensure view page renders (guards against undefined component crashes).
    const row = page.locator(`tr:has-text("${expectedRef}")`).first();
    await expect(row).toBeVisible({ timeout: 60_000 });
    await row.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('menuitem', { name: /^view$/i }).click();

    // If view screen renders correctly, it should include "Customer Invoice" text somewhere.
    await expect(page.locator('body')).toContainText(/customer invoice/i, { timeout: 60_000 });
  });
});
