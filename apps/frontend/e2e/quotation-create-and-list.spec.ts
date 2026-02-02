import { test, expect, Page } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';
import {
  createProductViaAPI,
  generateProductCode,
  generateProductName,
} from './helpers/product-helpers';

const QUOTATION_CREATE_PATH = '/admin/income/quotation/create';
const QUOTATION_LIST_PATH = '/admin/income/quotation';

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
  await options.first().click();
}

async function openReactSelectByLabel(page: Page, labelText: RegExp) {
  const label = page.getByText(labelText, { exact: false }).first();
  await expect(label).toBeVisible({ timeout: 30_000 });
  const formGroup = label.locator('xpath=ancestor::*[self::div or self::label][1]').first();
  const combobox = formGroup.locator('[role="combobox"]').first();
  if (await combobox.isVisible({ timeout: 2000 }).catch(() => false)) {
    await combobox.click();
    return;
  }
  await label.locator('xpath=following::*[@role="combobox"][1]').click();
}

test.describe('Quotation - Create via UI and verify on list', () => {
  test('should create a quotation via UI and see it on the quotation list', async ({ page }) => {
    const { username, password } = getTestUserCredentials();
    const quotationSuffix = Date.now() % 1_000_000_000;
    const quotationNumber = `QTN-${quotationSuffix}`;

    await loginTestUser(page, username, password);

    const authToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!authToken) throw new Error('Missing accessToken after login');

    await createProductViaAPI(page.request, authToken, {
      productName: generateProductName('Quotation E2E'),
      productCode: generateProductCode(),
      salesUnitPrice: 100,
      purchaseUnitPrice: 80,
      vatCategoryId: 1,
      productType: 'GOODS',
      productPriceType: 'SALES',
    });

    const customerDropdownPromise = page.waitForResponse(
      (r) => r.url().includes('/rest/contact/getContactsForDropdown') && r.status() === 200,
      { timeout: 60_000 }
    );

    await page.goto(QUOTATION_CREATE_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#quotation_Number')).toBeVisible({ timeout: 30_000 });

    await page.locator('#quotation_Number').fill(quotationNumber);

    await openReactSelectByLabel(page, /customer name/i);
    await selectFirstNonPlaceholderOption(page);

    await customerDropdownPromise;

    await openReactSelectByLabel(page, /currency/i);
    await selectFirstNonPlaceholderOption(page);

    await page
      .waitForResponse(
        (r) =>
          r.url().includes('/rest/datalist/product') && r.status() === 200,
        { timeout: 60_000 }
      )
      .catch(() => {});

    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 30_000 });
    const firstRow = table.locator('tbody tr').first();
    const productCombo = firstRow.locator('[role="combobox"]').first();
    await productCombo.scrollIntoViewIfNeeded();
    await productCombo.click();
    const productInput = page.locator('input[aria-autocomplete="list"]').last();
    await expect(productInput).toBeVisible({ timeout: 15_000 });
    await productInput.fill('Quotation E2E');
    await page.keyboard.press('Enter');

    const qtyInput = firstRow.locator('input[type="number"]').first();
    await qtyInput.fill('1');
    const priceInput = firstRow.locator('input[type="number"]').nth(1);
    await priceInput.fill('100');

    const comboboxes = firstRow.locator('[role="combobox"]');
    const comboCount = await comboboxes.count();
    if (comboCount >= 2) {
      await comboboxes.nth(1).click();
      await selectFirstNonPlaceholderOption(page);
    }

    const saveReqPromise = page.waitForRequest(
      (r) => r.url().includes('/rest/poquatation/saveQuatation') && r.method() === 'POST',
      { timeout: 15_000 }
    );

    await page.getByRole('button', { name: /^create$/i }).first().click();

    let saveReq;
    try {
      saveReq = await saveReqPromise;
    } catch (e) {
      const invalidFeedback = await page
        .locator('.invalid-feedback')
        .allTextContents()
        .catch(() => []);
      const toastText = await page
        .locator('.Toastify__toast, [class*="toast"], [role="alert"]')
        .allTextContents()
        .catch(() => []);
      throw new Error(
        `Quotation form did not submit. invalidFeedback=${JSON.stringify(invalidFeedback)} toasts=${JSON.stringify(toastText)}`
      );
    }

    const saveResp = await saveReq.response();
    expect(saveResp).toBeTruthy();
    expect(saveResp!.status()).toBe(200);

    await page.goto(QUOTATION_LIST_PATH, { waitUntil: 'domcontentloaded' });
    const listResp = await page.waitForResponse(
      (r) => r.url().includes('/rest/poquatation/getListForQuatation') && r.status() === 200,
      { timeout: 60_000 }
    );

    const listJson = await listResp.json().catch(() => null);
    const listData =
      listJson && listJson.data && Array.isArray(listJson.data) ? listJson.data : [];
    const found = listData.some(
      (r: { quatationNumber?: string; quotationNumber?: string }) =>
        String(r.quatationNumber || r.quotationNumber || '') === quotationNumber
    );
    expect(found).toBeTruthy();

    await expect(page.locator('body')).toContainText(quotationNumber, { timeout: 60_000 });

    const row = page.locator(`tr:has-text("${quotationNumber}")`).first();
    await expect(row).toBeVisible({ timeout: 60_000 });
  });
});
