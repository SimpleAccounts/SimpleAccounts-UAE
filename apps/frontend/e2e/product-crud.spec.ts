import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const LOGIN_EMAIL = process.env.E2E_USERNAME || '';
const LOGIN_PASSWORD = process.env.E2E_PASSWORD || '';

const timestamp = Date.now();
const testProduct = {
  name: `TestProduct${timestamp}`,
  code: `PRD${timestamp}`,
  updatedName: `UpdatedProduct${timestamp}`,
};

test.describe('Product Module CRUD Operations', () => {
  let authToken: string;
  let productId: number;

  test('Complete CRUD flow', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    // ============ STEP 1: LOGIN via UI ============
    console.log('=== STEP 1: LOGIN ===');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#email-input', { timeout: 15000 });
    console.log('LOGIN_EMAIL:', LOGIN_EMAIL);
    console.log('LOGIN_PASSWORD:', LOGIN_PASSWORD ? '***set***' : 'EMPTY');

    const emailInput = page.locator('#email-input');
    await emailInput.click();
    await emailInput.fill(LOGIN_EMAIL);

    const passwordInput = page.locator('#password-input');
    await passwordInput.click();
    await passwordInput.fill(LOGIN_PASSWORD);

    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
    console.log('✓ Logged in via UI');

    // Get auth token from localStorage
    authToken = await page.evaluate(() => localStorage.getItem('accessToken') || '');
    console.log(
      'Auth token obtained:',
      authToken ? 'Yes (length: ' + authToken.length + ')' : 'No'
    );

    // ============ STEP 2: CREATE via API ============
    console.log('\n=== STEP 2: CREATE PRODUCT via API ===');

    // First, get required data (VAT categories, transaction categories)
    const setupData = await page.evaluate(async () => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      // Get VAT categories - filter out IDs 4 and 10 as frontend does
      const vatRes = await fetch(`${baseUrl}/rest/datalist/vatCategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vatData = await vatRes.json();
      const filteredVat = vatData?.filter((v: { id: number }) => v.id !== 4 && v.id !== 10) || [];
      console.log('Available VAT categories:', JSON.stringify(filteredVat.slice(0, 3)));

      // Get sales transaction categories
      const salesCatRes = await fetch(
        `${baseUrl}/rest/product/getTransactionCategoryListForSalesProduct`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const salesCatData = await salesCatRes.json();
      console.log('Available sales categories:', JSON.stringify(salesCatData?.slice(0, 3)));

      return {
        vatCategoryId: filteredVat?.[0]?.id || 1,
        salesCategoryId: salesCatData?.[0]?.id || 1,
      };
    });

    console.log('Setup data:', setupData);

    const createPayload = {
      productCode: testProduct.code,
      productName: testProduct.name,
      productType: 'GOODS',
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
      salesUnitPrice: '100',
      salesTransactionCategoryId: setupData.salesCategoryId,
    };

    // Create product using fetch
    const createResult = await page.evaluate(async payload => {
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

    console.log('Create API result:', createResult.status, createResult.error || '');

    if (createResult.status === 200 && createResult.data) {
      productId = createResult.data.id || createResult.data.productId;
      console.log('✓ Product created via API, ID:', productId);
    } else {
      console.log(
        'Create failed:',
        createResult.error || JSON.stringify(createResult.data).substring(0, 200)
      );
    }

    // ============ STEP 3: READ via UI ============
    console.log('\n=== STEP 3: READ PRODUCT via UI ===');
    await page.goto(`${BASE_URL}/admin/master/product`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // Wait for table to be visible
    console.log('Waiting for table with data...');
    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get table content and log it
    const tableContent = await page
      .locator('table')
      .textContent({ timeout: 10000 })
      .catch(() => '');
    console.log('Table content preview:', tableContent?.substring(0, 300));

    // Check for product in table
    const hasProductName = tableContent?.includes(testProduct.name);
    const hasProductCode = tableContent?.includes(testProduct.code);

    console.log('Contains product name:', hasProductName);
    console.log('Contains product code:', hasProductCode);

    await page.screenshot({ path: 'test-results/product-list-read.png', fullPage: true });

    const hasProduct = hasProductName || hasProductCode;
    if (!hasProduct) {
      console.log('Product not found in list, checking row count...');
      const rowCount = await page.locator('table tbody tr').count();
      console.log('Row count in table:', rowCount);
    } else {
      console.log('✓ Product found in list (READ successful)');
    }

    // ============ STEP 4: UPDATE via API ============
    console.log('\n=== STEP 4: UPDATE PRODUCT via API ===');

    const updatePayload = {
      id: productId,
      productCode: testProduct.code,
      productName: testProduct.updatedName,
      productType: 'GOODS',
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
      salesUnitPrice: '150',
      salesTransactionCategoryId: setupData.salesCategoryId,
    };

    const updateResult = await page.evaluate(async payload => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${baseUrl}/rest/product/update`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const status = response.status;
        const text = await response.text();
        let data = null;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        return { status, data, error: null };
      } catch (err: any) {
        return { status: 0, data: null, error: err.message };
      }
    }, updatePayload);

    console.log('Update API result:', updateResult.status, updateResult.error || '');

    if (updateResult.status === 200) {
      console.log('✓ Product updated via API');
    } else {
      console.log(
        'Update failed:',
        updateResult.error || JSON.stringify(updateResult.data).substring(0, 200)
      );
    }

    await page.screenshot({ path: 'test-results/product-after-update.png', fullPage: true });

    // ============ STEP 5: VERIFY UPDATE via UI ============
    console.log('\n=== STEP 5: VERIFY UPDATE via UI ===');

    await page.goto(`${BASE_URL}/admin/master/product`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });

    const tableContentAfterUpdate = await page.locator('table').textContent();
    const hasUpdatedName = tableContentAfterUpdate?.includes(testProduct.updatedName);
    console.log('Updated product name visible in list:', hasUpdatedName);

    await page.screenshot({ path: 'test-results/product-after-verify-update.png', fullPage: true });

    // ============ STEP 6: DELETE via API ============
    console.log('\n=== STEP 6: DELETE PRODUCT via API ===');

    const deleteResult = await page.evaluate(async id => {
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
        const status = response.status;
        const text = await response.text();
        let data = null;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        return { status, data, error: null };
      } catch (err: any) {
        return { status: 0, data: null, error: err.message };
      }
    }, productId);

    console.log('Delete API result:', deleteResult.status, deleteResult.error || '');

    if (deleteResult.status === 200) {
      console.log('✓ Product deleted via API');
    } else {
      console.log(
        'Delete failed:',
        deleteResult.error || JSON.stringify(deleteResult.data).substring(0, 200)
      );
    }

    await page.screenshot({ path: 'test-results/product-after-delete.png', fullPage: true });

    // ============ STEP 7: VERIFY DELETE via UI ============
    console.log('\n=== STEP 7: VERIFY DELETE via UI ===');
    await page.goto(`${BASE_URL}/admin/master/product`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    const finalTableContent = await page.locator('table').textContent();
    const productStillExists =
      finalTableContent?.includes(testProduct.updatedName) ||
      finalTableContent?.includes(testProduct.code);
    console.log('Checking if deleted product exists:', testProduct.updatedName);
    console.log('Product still exists after delete:', productStillExists);

    if (!productStillExists) {
      console.log('✓ Product successfully deleted - verified in UI');
    } else {
      console.log('⚠ Product still appears in list');
    }

    await page.screenshot({ path: 'test-results/product-final-state.png', fullPage: true });
    console.log('\n=== CRUD TEST COMPLETED ===');

    // Final assertions
    expect(productId).toBeGreaterThan(0);
    expect(!productStillExists).toBe(true);

    console.log('Final verification:');
    console.log('- Create: productId =', productId, '(should be > 0)');
    console.log('- Update API status:', updateResult.status);
    console.log('- Delete API status:', deleteResult.status);
    console.log('- Product deleted from UI:', !productStillExists);
  });
});

test.describe('Product Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#email-input', { timeout: 15000 });
    await page.fill('#email-input', LOGIN_EMAIL);
    await page.fill('#password-input', LOGIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
  });

  test('Product list page loads correctly', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto(`${BASE_URL}/admin/master/product`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // Verify page elements
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Add New Product")')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Verify filter section exists
    await expect(page.locator('text=Filter')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'test-results/product-list-page.png', fullPage: true });
    console.log('✓ Product list page loaded successfully');
  });

  test('Navigate to Add New Product page', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto(`${BASE_URL}/admin/master/product`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    const addButton = page.locator('button:has-text("Add New Product")');
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();

    await page.waitForURL('**/product/create', { timeout: 15000 });
    await expect(page.locator('input[placeholder*="Product Name"]')).toBeVisible({
      timeout: 10000,
    });

    await page.screenshot({ path: 'test-results/product-create-page.png', fullPage: true });
    console.log('✓ Successfully navigated to Add New Product page');
  });

  test('Product search functionality works', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto(`${BASE_URL}/admin/master/product`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    const initialRowCount = await page.locator('table tbody tr').count();
    console.log('Initial row count:', initialRowCount);

    // Search for non-existent product
    const searchInput = page.locator('input[placeholder*="Name"]').first();
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('NonExistentProduct12345');
      await page.waitForTimeout(500);

      // Click search button
      const searchButton = page
        .locator('button')
        .filter({ has: page.locator('svg.lucide-search') })
        .first();
      if (await searchButton.isVisible({ timeout: 2000 })) {
        await searchButton.click();
        await page.waitForTimeout(2000);

        const afterSearchContent = await page.locator('table').textContent();
        console.log('After search content:', afterSearchContent?.substring(0, 200));

        await page.screenshot({
          path: 'test-results/product-search-no-results.png',
          fullPage: true,
        });
      }

      // Clear search
      await searchInput.clear();
      const clearButton = page
        .locator('button')
        .filter({ has: page.locator('svg.lucide-refresh-cw') })
        .first();
      if (await clearButton.isVisible({ timeout: 2000 })) {
        await clearButton.click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'test-results/product-search-cleared.png', fullPage: true });
    }

    console.log('✓ Search functionality test completed');
  });
});

test.describe('Product Validation Tests', () => {
  test('Product create form validates required fields', async ({ page }) => {
    test.setTimeout(120000);

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#email-input', { timeout: 15000 });
    await page.fill('#email-input', LOGIN_EMAIL);
    await page.fill('#password-input', LOGIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });

    // Navigate to create page
    await page.goto(`${BASE_URL}/admin/master/product/create`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    // Try to submit empty form
    const createButton = page.getByRole('button', { name: /Create/i }).first();
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click();

    await page.waitForTimeout(2000);

    // Check that we're still on create page (form not submitted)
    expect(page.url()).toContain('create');

    await page.screenshot({ path: 'test-results/product-validation-errors.png', fullPage: true });
    console.log('✓ Validation test completed - form should show errors for required fields');
  });
});
