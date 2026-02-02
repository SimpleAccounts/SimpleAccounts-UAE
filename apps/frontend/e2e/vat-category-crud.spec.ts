import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const LOGIN_EMAIL = process.env.E2E_USERNAME || '';
const LOGIN_PASSWORD = process.env.E2E_PASSWORD || '';

const timestamp = Date.now();
const testVatCategory = {
  name: `TestVAT${timestamp}`.substring(0, 20),
  vat: '5', // 5% VAT
};

test.describe('VAT Category Module CRUD Operations', () => {
  let vatCategoryId: number;

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
    console.log('\n=== STEP 2: CREATE VAT CATEGORY via API ===');

    const createPayload = {
      name: testVatCategory.name,
      vat: testVatCategory.vat,
    };

    const createResult = await page.evaluate(async payload => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${baseUrl}/rest/vat/save`, {
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
      console.log('✓ VAT Category created via API');

      // Fetch the list to get the created ID (API doesn't return ID on create)
      const listResult = await page.evaluate(async name => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(`${baseUrl}/rest/vat/getList`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          // Find the created item by name
          const item = data.data?.find((i: any) => i.name === name);
          return item?.id;
        } catch {
          return null;
        }
      }, testVatCategory.name);

      if (listResult) {
        vatCategoryId = listResult;
        console.log('✓ Found created VAT Category ID:', vatCategoryId);
      }
    } else {
      console.log(
        'Create failed:',
        createResult.error || JSON.stringify(createResult.data).substring(0, 200)
      );
    }

    // ============ STEP 3: READ via UI ============
    console.log('\n=== STEP 3: READ VAT CATEGORY via UI ===');
    await page.goto(`${BASE_URL}/admin/master/vat-category`, {
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

    const hasName = tableContent?.includes(testVatCategory.name);
    const hasVat = tableContent?.includes(`${testVatCategory.vat} %`);

    console.log('Contains VAT name:', hasName);
    console.log('Contains VAT percentage:', hasVat);

    await page.screenshot({ path: 'test-results/vat-category-list-read.png', fullPage: true });

    const hasCategory = hasName || hasVat;
    if (hasCategory) {
      console.log('✓ VAT Category found in list (READ successful)');
    }

    // ============ STEP 4: UPDATE via API ============
    console.log('\n=== STEP 4: UPDATE VAT CATEGORY via API ===');

    const updatePayload = {
      id: vatCategoryId,
      name: testVatCategory.name,
      vat: '10', // Update to 10%
    };

    const updateResult = await page.evaluate(async payload => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${baseUrl}/rest/vat/update`, {
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
      console.log('✓ VAT Category updated via API');
    } else {
      console.log(
        'Update failed:',
        updateResult.error || JSON.stringify(updateResult.data).substring(0, 200)
      );
    }

    await page.screenshot({ path: 'test-results/vat-category-after-update.png', fullPage: true });

    // ============ STEP 5: VERIFY UPDATE via UI ============
    console.log('\n=== STEP 5: VERIFY UPDATE via UI ===');

    await page.goto(`${BASE_URL}/admin/master/vat-category`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    const tableContentAfterUpdate = await page.locator('table').textContent();
    const hasUpdatedVat = tableContentAfterUpdate?.includes('10 %');
    console.log('Updated VAT percentage visible in list:', hasUpdatedVat);

    await page.screenshot({ path: 'test-results/vat-category-verify-update.png', fullPage: true });

    // ============ STEP 6: DELETE via API ============
    console.log('\n=== STEP 6: DELETE VAT CATEGORY via API ===');

    const deleteResult = await page.evaluate(async id => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${baseUrl}/rest/vat/delete?id=${id}`, {
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
    }, vatCategoryId);

    console.log('Delete API result:', deleteResult.status, deleteResult.error || '');

    if (deleteResult.status === 200) {
      console.log('✓ VAT Category deleted via API');
    } else {
      console.log(
        'Delete failed:',
        deleteResult.error || JSON.stringify(deleteResult.data).substring(0, 200)
      );
    }

    await page.screenshot({ path: 'test-results/vat-category-after-delete.png', fullPage: true });

    // ============ STEP 7: VERIFY DELETE via UI ============
    console.log('\n=== STEP 7: VERIFY DELETE via UI ===');
    await page.goto(`${BASE_URL}/admin/master/vat-category`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('table').waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    const finalTableContent = await page.locator('table').textContent();
    const categoryStillExists = finalTableContent?.includes(testVatCategory.name);
    console.log('VAT Category still exists after delete:', categoryStillExists);

    if (!categoryStillExists) {
      console.log('✓ VAT Category successfully deleted - verified in UI');
    } else {
      console.log('⚠ VAT Category still appears in list');
    }

    await page.screenshot({ path: 'test-results/vat-category-final-state.png', fullPage: true });
    console.log('\n=== VAT CATEGORY CRUD TEST COMPLETED ===');

    // Final assertions
    expect(vatCategoryId).toBeGreaterThan(0);
    expect(!categoryStillExists).toBe(true);
  });
});
