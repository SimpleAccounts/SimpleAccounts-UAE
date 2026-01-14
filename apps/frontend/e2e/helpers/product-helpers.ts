import { Page } from '@playwright/test';

/**
 * Create a product via API (faster and more reliable than UI)
 * Returns the product ID if successful, null otherwise
 */
export async function createProductViaAPI(
  page: Page,
  productName: string,
  productCode: string,
  options?: {
    productType?: 'GOODS' | 'SERVICE';
    salesUnitPrice?: string;
    purchaseUnitPrice?: string;
    description?: string;
  }
): Promise<number | null> {
  const productType = options?.productType || 'GOODS';
  const salesUnitPrice = options?.salesUnitPrice || '100';

  // First, get required dropdown data
  const setupData = await page.evaluate(async () => {
    const baseUrl = window.location.origin.replace(':3000', ':8080');
    const token = localStorage.getItem('accessToken');

    // Get VAT categories - filter out IDs 4 and 10 as frontend does
    const vatRes = await fetch(`${baseUrl}/rest/datalist/vatCategory`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const vatData = await vatRes.json();
    const filteredVat = vatData?.filter((v: { id: number }) => v.id !== 4 && v.id !== 10) || [];

    // Get sales transaction categories
    const salesCatRes = await fetch(
      `${baseUrl}/rest/product/getTransactionCategoryListForSalesProduct`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const salesCatData = await salesCatRes.json();

    return {
      vatCategoryId: filteredVat?.[0]?.id || 1,
      salesCategoryId: salesCatData?.[0]?.id || 1,
    };
  });

  const createPayload = {
    productCode: productCode,
    productName: productName,
    productType: productType,
    productPriceType: 'SALES',
    vatCategoryId: setupData.vatCategoryId,
    exciseTaxId: '',
    vatIncluded: false,
    isInventoryEnabled: false,
    contactId: '',
    transactionCategoryId: 150,
    productCategoryId: null,
    isActive: true,
    exciseTaxCheck: false,
    unitTypeId: null,
    salesUnitPrice: salesUnitPrice,
    salesTransactionCategoryId: setupData.salesCategoryId,
  };

  const result = await page.evaluate(async payload => {
    const baseUrl = window.location.origin.replace(':3000', ':8080');
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${baseUrl}/rest/product/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const status = response.status;
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
      return { status, data, error: null };
    } catch (err: any) {
      return { status: 0, data: null, error: err.message };
    }
  }, createPayload);

  if (result.status === 200 && result.data) {
    const productId = result.data.id || result.data.productId;
    console.log(`✓ Product created via API: ${productName} (ID: ${productId})`);
    return productId;
  } else {
    console.log(
      `✗ Failed to create product via API: ${result.error || JSON.stringify(result.data).substring(0, 100)}`
    );
    return null;
  }
}

/**
 * Delete a product via API
 */
export async function deleteProductViaAPI(page: Page, productId: number): Promise<boolean> {
  const result = await page.evaluate(async id => {
    const baseUrl = window.location.origin.replace(':3000', ':8080');
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${baseUrl}/rest/product/delete?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return { status: response.status, error: null };
    } catch (err: any) {
      return { status: 0, error: err.message };
    }
  }, productId);

  if (result.status === 200) {
    console.log(`✓ Product deleted via API (ID: ${productId})`);
    return true;
  } else {
    console.log(`✗ Failed to delete product via API: ${result.error}`);
    return false;
  }
}

/**
 * Helper to login to the application
 */
export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('#email-input', { timeout: 15000 });
  await page.fill('#email-input', username);
  await page.fill('#password-input', password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
}

/**
 * Helper to navigate to product list
 */
export async function goToProductList(page: Page) {
  await page.goto('/admin/master/product', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 60000 });

  // Wait for table to be visible
  await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(1000);
}

/**
 * Helper to navigate to product create page
 */
export async function goToProductCreate(page: Page) {
  await page.goto('/admin/master/product/create', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  await page.waitForTimeout(2000);
}

/**
 * Helper to create a test product via UI with all required fields
 */
export async function createTestProductViaUI(
  page: Page,
  productName: string,
  productCode: string,
  options?: {
    productType?: 'GOODS' | 'SERVICE';
    sellingPrice?: string;
    description?: string;
  }
) {
  const productType = options?.productType || 'GOODS';
  const sellingPrice = options?.sellingPrice || '100';

  await goToProductCreate(page);

  // Wait for form to load - check for product name input
  await page.waitForSelector('input[placeholder*="Product Name"]', { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Fill Product Name
  await page.fill('input[placeholder*="Product Name"]', productName);

  // Fill Product Code - clear first in case it's pre-filled
  const productCodeInput = page.locator('input[placeholder*="Product Code"]');
  if (await productCodeInput.isVisible({ timeout: 2000 })) {
    await productCodeInput.clear();
    await productCodeInput.fill(productCode);
  }

  // Select Product Type (GOODS/SERVICE) - Radio buttons
  const productTypeRadio = page.locator(`input[type="radio"][value="${productType}"]`);
  if (await productTypeRadio.isVisible({ timeout: 2000 })) {
    await productTypeRadio.click();
  } else {
    // Try clicking on the label
    const typeLabel = page
      .locator(`label:has-text("${productType === 'GOODS' ? 'Goods' : 'Service'}")`)
      .first();
    if (await typeLabel.isVisible({ timeout: 2000 })) {
      await typeLabel.click();
    }
  }
  await page.waitForTimeout(500);

  // Select VAT Category (required) - react-select dropdown
  // Find all react-select dropdowns and select the VAT one
  const vatSelectContainer = page
    .locator('div')
    .filter({ hasText: /VAT Type/i })
    .locator('div[class*="react-select"]')
    .first();
  if (await vatSelectContainer.isVisible({ timeout: 3000 })) {
    await vatSelectContainer.click();
    await page.waitForTimeout(500);

    // Select first VAT option from dropdown
    const vatOption = page.locator('[class*="option"]').first();
    if (await vatOption.isVisible({ timeout: 2000 })) {
      await vatOption.click();
      await page.waitForTimeout(300);
    }
  } else {
    // Fallback: try finding any react-select that might be for VAT
    console.log('VAT select not found by label, trying fallback...');
    const allSelects = page.locator('div[class*="react-select"]');
    const selectCount = await allSelects.count();
    console.log(`Found ${selectCount} react-select dropdowns`);

    // VAT is usually one of the first dropdowns
    for (let i = 0; i < Math.min(selectCount, 3); i++) {
      const select = allSelects.nth(i);
      const selectText = await select.textContent().catch(() => '');
      console.log(`Select ${i}: ${selectText?.substring(0, 50)}`);

      if (selectText?.includes('VAT') || selectText?.includes('Select')) {
        await select.click();
        await page.waitForTimeout(500);

        const option = page.locator('[class*="option"]').first();
        if (await option.isVisible({ timeout: 2000 })) {
          await option.click();
          await page.waitForTimeout(300);
          break;
        }
      }
    }
  }

  // Check "I sell this product" checkbox if not already checked
  const sellCheckbox = page.locator('label:has-text("Sales Information")').first();
  if (await sellCheckbox.isVisible({ timeout: 2000 })) {
    const checkbox = sellCheckbox.locator('input[type="checkbox"]');
    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) {
      await sellCheckbox.click();
      await page.waitForTimeout(500);
    }
  }

  // Fill Selling Price
  const sellingPriceInput = page.locator('input[placeholder*="Selling Price"]').first();
  if (await sellingPriceInput.isVisible({ timeout: 2000 })) {
    await sellingPriceInput.fill(sellingPrice);
  }

  // Select Sales Account/Category dropdown
  await page.waitForTimeout(500);

  // The sales account dropdown should appear after checking the sales checkbox
  const salesAccountSelects = page.locator('div[class*="react-select"]');
  const selectCount = await salesAccountSelects.count();

  // Find and click the sales account dropdown (usually has "Sales" or "Account" text)
  for (let i = 0; i < selectCount; i++) {
    const select = salesAccountSelects.nth(i);
    const selectText = await select.textContent().catch(() => '');
    if (
      selectText?.includes('Sales') ||
      selectText?.includes('Account') ||
      selectText?.includes('Income')
    ) {
      // Check if this dropdown already has a value selected
      if (!selectText?.includes('Select')) {
        continue; // Already has a value
      }
      await select.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[class*="option"]').first();
      if (await firstOption.isVisible({ timeout: 2000 })) {
        await firstOption.click();
        await page.waitForTimeout(300);
        break;
      }
    }
  }

  // Fill description if provided
  if (options?.description) {
    const descInput = page.locator('textarea, input[placeholder*="Description"]').first();
    if (await descInput.isVisible({ timeout: 2000 })) {
      await descInput.fill(options.description);
    }
  }

  // Take screenshot before submission
  await page.screenshot({ path: 'test-results/product-before-submit.png', fullPage: true });

  // Submit form - click Create button
  const createButton = page.getByRole('button', { name: /^Create$/i }).first();
  await createButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await createButton.click();

  // Wait for navigation or error
  try {
    await Promise.race([
      page.waitForURL('**/product', { timeout: 15000 }),
      page.waitForURL('**/product/detail/**', { timeout: 15000 }),
    ]);
    console.log('✓ Product created successfully via UI');
  } catch {
    console.log('Form submission may have failed - taking screenshot');
    await page.screenshot({ path: 'test-results/product-submit-error.png', fullPage: true });
  }

  await page.waitForTimeout(1000);
}

/**
 * Helper to check if product exists in list
 */
export async function productExistsInList(page: Page, identifier: string): Promise<boolean> {
  await page.waitForTimeout(1000);
  const tableContent = await page
    .locator('table')
    .textContent()
    .catch(() => '');
  return tableContent?.includes(identifier) || false;
}

/**
 * Helper to get product row count in table
 */
export async function getProductTableRowCount(page: Page): Promise<number> {
  const rows = page.locator('table tbody tr');
  return rows.count();
}

/**
 * Helper to open edit form for first product in list
 */
export async function openEditFormForFirstProduct(page: Page) {
  // Wait for table to be visible
  await page.locator('table').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1000);

  // Click on actions menu for first row
  const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
  if (await actionsButton.isVisible({ timeout: 5000 })) {
    await actionsButton.click();
    await page.waitForTimeout(500);

    const editMenuItem = page.getByRole('menuitem', { name: /Edit/i });
    await editMenuItem.waitFor({ state: 'visible', timeout: 5000 });
    await editMenuItem.click();
    await page.waitForTimeout(2000);
  } else {
    // Fallback: click on the row itself
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    await page.waitForTimeout(2000);
  }
}

/**
 * Helper to search for a product
 */
export async function searchProduct(page: Page, searchTerm: string) {
  const searchInput = page.locator('input[placeholder*="Name"]').first();
  if (await searchInput.isVisible({ timeout: 3000 })) {
    await searchInput.fill(searchTerm);
    await page.waitForTimeout(500);

    // Click search button
    const searchButton = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-search') })
      .first();
    if (await searchButton.isVisible({ timeout: 2000 })) {
      await searchButton.click();
      await page.waitForTimeout(2000);
    }
  }
}

/**
 * Helper to clear search filters
 */
export async function clearProductFilters(page: Page) {
  const refreshButton = page
    .locator('button')
    .filter({ has: page.locator('svg.lucide-refresh-cw') })
    .first();
  if (await refreshButton.isVisible({ timeout: 2000 })) {
    await refreshButton.click();
    await page.waitForTimeout(2000);
  }
}
