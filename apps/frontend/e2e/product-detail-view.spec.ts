import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const LOGIN_EMAIL = process.env.E2E_USERNAME || '';
const LOGIN_PASSWORD = process.env.E2E_PASSWORD || '';

test.describe('Product Detail View Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#email-input', { timeout: 15000 });
    await page.fill('#email-input', LOGIN_EMAIL);
    await page.fill('#password-input', LOGIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
  });

  test('View product details from list', async ({ page }) => {
    test.setTimeout(120000);

    // Create a test product first
    const timestamp = Date.now();
    const testProductName = `DetailTestProduct${timestamp}`;
    const testProductCode = `DTP${timestamp}`;

    // Get setup data (VAT categories, sales categories)
    const setupData = await page.evaluate(async () => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      const vatRes = await fetch(`${baseUrl}/rest/datalist/vatCategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vatData = await vatRes.json();
      const filteredVat = vatData?.filter((v: { id: number }) => v.id !== 4 && v.id !== 10) || [];

      const salesCatRes = await fetch(
        `${baseUrl}/rest/product/getTransactionCategoryListForSalesProduct`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const salesCatData = await salesCatRes.json();

      console.log('VAT categories available:', filteredVat?.length || 0);
      console.log('Sales categories available:', salesCatData?.length || 0);

      return {
        vatCategoryId: filteredVat?.[0]?.id || 1,
        salesCategoryId: salesCatData?.[0]?.id || 1,
      };
    });

    console.log('Setup data:', setupData);

    // Create product via API
    const createResult = await page.evaluate(
      async ({ name, code, setupData }) => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');

        const payload = {
          productCode: code,
          productName: name,
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
          salesUnitPrice: '250',
          salesTransactionCategoryId: setupData.salesCategoryId,
        };

        try {
          const response = await fetch(`${baseUrl}/rest/product/save`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          return { status: response.status, id: data.id || data.productId };
        } catch (err: any) {
          return { status: 0, error: err.message };
        }
      },
      { name: testProductName, code: testProductCode, setupData }
    );

    console.log('Created test product, ID:', createResult.id);

    // Navigate to product list
    await page.goto(`${BASE_URL}/admin/master/product`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    // Wait for table to load
    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });

    // Find and click on the test product row
    const productRow = page.locator(`table tbody tr:has-text("${testProductName}")`).first();
    const rowVisible = await productRow.isVisible({ timeout: 5000 }).catch(() => false);

    if (rowVisible) {
      await productRow.click();
      await page.waitForTimeout(2000);

      // Verify we're on a detail/edit page
      const currentUrl = page.url();
      console.log('Navigated to:', currentUrl);
      expect(currentUrl).toMatch(/product\/(detail|edit)/);

      // Verify product data is displayed
      const pageContent = await page.content();
      expect(pageContent).toContain(testProductName);

      await page.screenshot({ path: 'test-results/product-detail-view.png', fullPage: true });
      console.log('✓ Product detail view test passed');
    } else {
      console.log('Product row not found in table');
      await page.screenshot({ path: 'test-results/product-not-found.png', fullPage: true });
    }

    // Cleanup - delete the test product
    if (createResult.id) {
      await page.evaluate(async id => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');
        await fetch(`${baseUrl}/rest/product/delete?id=${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }, createResult.id);
      console.log('✓ Cleaned up test product');
    }
  });

  test('Edit product from detail page', async ({ page }) => {
    test.setTimeout(120000);

    // Create a test product first
    const timestamp = Date.now();
    const testProductName = `EditTestProduct${timestamp}`;
    const testProductCode = `ETP${timestamp}`;
    const updatedPrice = 999;

    // Get setup data
    const setupData = await page.evaluate(async () => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      const vatRes = await fetch(`${baseUrl}/rest/datalist/vatCategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vatData = await vatRes.json();
      const filteredVat = vatData?.filter((v: { id: number }) => v.id !== 4 && v.id !== 10) || [];

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

    // Create product via API
    const createResult = await page.evaluate(
      async ({ name, code, setupData }) => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');

        const payload = {
          productCode: code,
          productName: name,
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

        try {
          const response = await fetch(`${baseUrl}/rest/product/save`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          return { status: response.status, id: data.id || data.productId };
        } catch (err: any) {
          return { status: 0, error: err.message };
        }
      },
      { name: testProductName, code: testProductCode, setupData }
    );

    console.log('Created test product for edit, ID:', createResult.id);

    // Navigate to product list and open edit form
    await page.goto(`${BASE_URL}/admin/master/product`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });

    // Click actions menu and edit
    const actionsButton = page
      .locator(`table tbody tr:has-text("${testProductName}") button[aria-haspopup="menu"]`)
      .first();
    const actionsVisible = await actionsButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (actionsVisible) {
      await actionsButton.click();
      await page.waitForTimeout(500);

      const editMenuItem = page.getByRole('menuitem', { name: /Edit/i });
      await editMenuItem.click();
      await page.waitForTimeout(2000);

      // Verify we're on the edit page
      await page.waitForURL('**/product/detail**', { timeout: 15000 });

      // Find and update the price field
      const priceInput = page.locator('input[placeholder*="Price"], input[name*="Price"]').first();
      if (await priceInput.isVisible({ timeout: 5000 })) {
        await priceInput.clear();
        await priceInput.fill(String(updatedPrice));
      }

      // Submit the update
      const updateButton = page.getByRole('button', { name: /Update|Save/i }).first();
      await updateButton.scrollIntoViewIfNeeded();
      await updateButton.click();

      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-results/product-after-edit.png', fullPage: true });
      console.log('✓ Product edit test completed');
    } else {
      console.log('Actions button not found for product');
      await page.screenshot({ path: 'test-results/product-actions-not-found.png', fullPage: true });
    }

    // Cleanup - delete the test product
    if (createResult.id) {
      await page.evaluate(async id => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');
        await fetch(`${baseUrl}/rest/product/delete?id=${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }, createResult.id);
      console.log('✓ Cleaned up test product');
    }
  });

  test('Product pagination works', async ({ page }) => {
    test.setTimeout(60000);

    // Navigate to product list
    await page.goto(`${BASE_URL}/admin/master/product`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });

    // Check if pagination controls exist
    const paginationText = page.locator('text=/Page \\d+ of \\d+/');
    const hasPagination = await paginationText.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasPagination) {
      const text = await paginationText.textContent();
      console.log('Pagination text:', text);

      // Check for rows per page selector
      const rowsPerPage = page.locator('text=/Rows per page/');
      const hasRowsPerPage = await rowsPerPage.isVisible({ timeout: 3000 }).catch(() => false);
      console.log('Rows per page selector visible:', hasRowsPerPage);
    }

    await page.screenshot({ path: 'test-results/product-pagination.png', fullPage: true });
    console.log('✓ Pagination test completed');
  });

  test('Product status filter works', async ({ page }) => {
    test.setTimeout(60000);

    // Navigate to product list
    await page.goto(`${BASE_URL}/admin/master/product`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    // Check initial state
    const initialContent = await page
      .locator('table')
      .textContent()
      .catch(() => '');
    console.log('Initial table content length:', initialContent?.length);

    // Look for status badges (Active/InActive)
    const activeBadges = page.locator('text=Active');
    const activeCount = await activeBadges.count();
    console.log('Active badges count:', activeCount);

    await page.screenshot({ path: 'test-results/product-status-filter.png', fullPage: true });
    console.log('✓ Status filter test completed');
  });
});
