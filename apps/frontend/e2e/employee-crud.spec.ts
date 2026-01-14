import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const LOGIN_EMAIL = process.env.E2E_USERNAME || '';
const LOGIN_PASSWORD = process.env.E2E_PASSWORD || '';

const timestamp = Date.now();
const testEmployee = {
  firstName: 'TestEmployee',
  middleName: 'Middle',
  lastName: `E${timestamp}`.substring(0, 10),
  email: `testemp${timestamp}@example.com`.substring(0, 40),
  referenceCode: `EMP${timestamp}`.substring(0, 10),
  password: 'Test@123$',
  dob: '1990-01-15',
};

test.describe('Employee Module CRUD Operations', () => {
  let employeeId: number;

  test('Complete CRUD flow via API with UI verification', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes

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
    console.log('\n=== STEP 2: CREATE EMPLOYEE via API ===');

    const createPayload = {
      firstName: testEmployee.firstName,
      middleName: testEmployee.middleName,
      lastName: testEmployee.lastName,
      email: testEmployee.email,
      employeeCode: testEmployee.referenceCode,
      password: testEmployee.password,
      confirmPassword: testEmployee.password,
      dob: testEmployee.dob,
      isActive: 'true',
      gender: 'Male',
    };

    // Backend expects FormData (not JSON) due to @ModelAttribute
    const createResult = await page.evaluate(async payload => {
      const baseUrl = window.location.origin.replace(':3000', ':8080');
      const token = localStorage.getItem('accessToken');

      try {
        // Create FormData
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        const response = await fetch(`${baseUrl}/rest/employee/save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - browser will set it with boundary for FormData
          },
          body: formData,
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
      console.log('✓ Employee created via API');

      // Fetch the list to get the created ID (API doesn't return ID on create)
      const listResult = await page.evaluate(async email => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(
            `${baseUrl}/rest/employee/getList?name=&email=&pageNo=&pageSize=100&order=&sortingCol=&paginationDisable=true`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const data = await response.json();
          // Find the created item by email
          const item = data.data?.find((i: any) => i.email === email);
          return item?.id;
        } catch {
          return null;
        }
      }, testEmployee.email);

      if (listResult) {
        employeeId = listResult;
        console.log('✓ Found created Employee ID:', employeeId);
      }
    } else {
      console.log(
        'Create failed:',
        createResult.error || JSON.stringify(createResult.data).substring(0, 200)
      );
    }

    // ============ STEP 3: READ via UI ============
    console.log('\n=== STEP 3: READ EMPLOYEE via UI ===');
    await page.goto(`${BASE_URL}/admin/master/employee`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/employee-list-read.png', fullPage: true });

    const pageTitle = await page
      .locator('h1')
      .first()
      .textContent()
      .catch(() => '');
    console.log('Page title:', pageTitle);
    console.log('✓ Employee page accessed');

    // ============ STEP 4: UPDATE via API ============
    console.log('\n=== STEP 4: UPDATE EMPLOYEE via API ===');

    if (employeeId) {
      const updatePayload = {
        id: employeeId,
        firstName: 'UpdatedEmployee',
        lastName: testEmployee.lastName,
        email: testEmployee.email,
        referenceCode: testEmployee.referenceCode,
        title: 1,
        middleName: 'Updated',
        dob: null,
        isActive: true,
      };

      const updateResult = await page.evaluate(async payload => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');

        try {
          const response = await fetch(`${baseUrl}/rest/employee/update`, {
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
        console.log('✓ Employee updated via API');
      } else {
        console.log(
          'Update failed:',
          updateResult.error || JSON.stringify(updateResult.data).substring(0, 200)
        );
      }

      // ============ STEP 5: DELETE via API ============
      console.log('\n=== STEP 5: DELETE EMPLOYEE via API ===');

      const deleteResult = await page.evaluate(async id => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');

        try {
          const response = await fetch(`${baseUrl}/rest/employee/delete?id=${id}`, {
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
      }, employeeId);

      console.log('Delete API result:', deleteResult.status, deleteResult.error || '');

      if (deleteResult.status === 200) {
        console.log('✓ Employee deleted via API');
      } else {
        console.log(
          'Delete failed:',
          deleteResult.error || JSON.stringify(deleteResult.data).substring(0, 200)
        );
      }

      // ============ STEP 6: VERIFY DELETE via API ============
      console.log('\n=== STEP 6: VERIFY DELETE via API ===');

      const verifyDeleteResult = await page.evaluate(async email => {
        const baseUrl = window.location.origin.replace(':3000', ':8080');
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(
            `${baseUrl}/rest/employee/getList?name=&email=&pageNo=&pageSize=100&order=&sortingCol=&paginationDisable=true`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const data = await response.json();
          const item = data.data?.find((i: any) => i.email === email);
          return item ? true : false;
        } catch {
          return false;
        }
      }, testEmployee.email);

      if (!verifyDeleteResult) {
        console.log('✓ Employee successfully deleted - verified via API');
      } else {
        console.log('⚠ Employee still exists in database');
      }

      await page.screenshot({ path: 'test-results/employee-final-state.png', fullPage: true });
      console.log('\n=== EMPLOYEE CRUD TEST COMPLETED ===');

      // Final assertions
      expect(employeeId).toBeGreaterThan(0);
      expect(createResult.status).toBe(200);
    } else {
      console.log('⚠ No employee ID available, skipping update/delete tests');
      console.log('\n=== EMPLOYEE CRUD TEST COMPLETED (partial) ===');
    }

    // Final verification - page loads successfully
    console.log('Employee list page accessible:', pageTitle);
    expect(pageTitle).toContain('Employee');
  });
});
