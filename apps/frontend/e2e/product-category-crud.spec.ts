import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const LOGIN_EMAIL = process.env.E2E_USERNAME || '';
const LOGIN_PASSWORD = process.env.E2E_PASSWORD || '';

const timestamp = Date.now();
const testProductCategory = {
  productCategoryCode: `PC${timestamp}`.substring(0, 10),
  productCategoryName: `TestCategory${timestamp}`.substring(0, 25),
};

test.describe('Product Category Module CRUD Operations', () => {
  let productCategoryId: number;

  test('Complete CRUD flow', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    // ============ STEP 1: LOGIN via UI ============
    console.log('=== STEP 1: LOGIN ===');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#email-input', { timeout: 15000 });

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

    // ============ STEP 2: CREATE via API ============
    console.log('\n=== STEP 2: CREATE PRODUCT CATEGORY via API ===');

    const createPayload = {
      productCategoryCode: testProductCategory.productCategoryCode,
      productCategoryName: testProductCategory.productCategoryName,
    };

    const createResult = await page.evaluate(async payload => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${baseUrl}/rest/productcategory/save`, {
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

    if (createResult.status === 200) {
      console.log('✓ Product Category created via API');

      // Fetch the list to get the created ID (API doesn't return ID on create)
      const listResult = await page.evaluate(async code => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(`${baseUrl}/rest/productcategory/getList`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          // Find the created item by code
          const item = data.data?.find((i: any) => i.productCategoryCode === code);
          return item?.id;
        } catch {
          return null;
        }
      }, testProductCategory.productCategoryCode);

      if (listResult) {
        productCategoryId = listResult;
        console.log('✓ Found created Product Category ID:', productCategoryId);
      }
    } else {
      console.log(
        'Create failed:',
        createResult.error || JSON.stringify(createResult.data).substring(0, 200)
      );
    }

    // ============ STEP 3: READ via UI ============
    console.log('\n=== STEP 3: READ PRODUCT CATEGORY via UI ===');
    await page.goto(`${BASE_URL}/admin/master/product-category`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // Wait for table to be visible and have rows
    console.log('Waiting for table with data...');
    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get table content and verify
    const tableContent = await page
      .locator('table')
      .textContent({ timeout: 10000 })
      .catch(() => '');
    console.log('Table content preview:', tableContent?.substring(0, 300));

    const hasCode = tableContent?.includes(testProductCategory.productCategoryCode);
    const hasName = tableContent?.includes(testProductCategory.productCategoryName);

    console.log('Contains category code:', hasCode);
    console.log('Contains category name:', hasName);

    await page.screenshot({ path: 'test-results/product-category-list-read.png', fullPage: true });

    const hasCategory = hasCode || hasName;
    if (hasCategory) {
      console.log('✓ Product Category found in list (READ successful)');
    }

    // ============ STEP 4: UPDATE via API ============
    console.log('\n=== STEP 4: UPDATE PRODUCT CATEGORY via API ===');

    const updatePayload = {
      id: productCategoryId,
      productCategoryCode: testProductCategory.productCategoryCode,
      productCategoryName: `Updated${testProductCategory.productCategoryName}`.substring(0, 25),
    };

    const updateResult = await page.evaluate(async payload => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${baseUrl}/rest/productcategory/update`, {
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
      console.log('✓ Product Category updated via API');
    } else {
      console.log(
        'Update failed:',
        updateResult.error || JSON.stringify(updateResult.data).substring(0, 200)
      );
    }

    await page.screenshot({
      path: 'test-results/product-category-after-update.png',
      fullPage: true,
    });

    // ============ STEP 5: VERIFY UPDATE via UI ============
    console.log('\n=== STEP 5: VERIFY UPDATE via UI ===');

    await page.goto(`${BASE_URL}/admin/master/product-category`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    const tableContentAfterUpdate = await page.locator('table').textContent();
    const hasUpdatedName = tableContentAfterUpdate?.includes('Updated');
    console.log('Updated name visible in list:', hasUpdatedName);

    await page.screenshot({
      path: 'test-results/product-category-verify-update.png',
      fullPage: true,
    });

    // ============ STEP 6: DELETE via API ============
    console.log('\n=== STEP 6: DELETE PRODUCT CATEGORY via API ===');

    const deleteResult = await page.evaluate(async id => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${baseUrl}/rest/productcategory/delete?id=${id}`, {
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
    }, productCategoryId);

    console.log('Delete API result:', deleteResult.status, deleteResult.error || '');

    if (deleteResult.status === 200) {
      console.log('✓ Product Category deleted via API');
    } else {
      console.log(
        'Delete failed:',
        deleteResult.error || JSON.stringify(deleteResult.data).substring(0, 200)
      );
    }

    await page.screenshot({
      path: 'test-results/product-category-after-delete.png',
      fullPage: true,
    });

    // ============ STEP 7: VERIFY DELETE via UI ============
    console.log('\n=== STEP 7: VERIFY DELETE via UI ===');
    await page.goto(`${BASE_URL}/admin/master/product-category`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    const finalTableContent = await page.locator('table').textContent();
    const categoryStillExists = finalTableContent?.includes(
      testProductCategory.productCategoryCode
    );
    console.log('Category still exists after delete:', categoryStillExists);

    if (!categoryStillExists) {
      console.log('✓ Product Category successfully deleted - verified in UI');
    } else {
      console.log('⚠ Product Category still appears in list');
    }

    await page.screenshot({
      path: 'test-results/product-category-final-state.png',
      fullPage: true,
    });
    console.log('\n=== PRODUCT CATEGORY CRUD TEST COMPLETED ===');

    // Final assertions
    expect(productCategoryId).toBeGreaterThan(0);
    expect(!categoryStillExists).toBe(true);
  });
});
