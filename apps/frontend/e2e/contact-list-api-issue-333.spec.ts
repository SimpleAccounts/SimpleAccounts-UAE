import { test, expect } from '@playwright/test';

/**
 * Temporary test for Issue #333: Backend 500 Error on Contact List API
 *
 * This test verifies that the GET /rest/contact/getContactList endpoint
 * returns 200 OK (not 500 Internal Server Error) and contains valid contact list data.
 *
 * Run with: npx playwright test e2e/contact-list-api-issue-333.spec.ts --project=chromium
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.E2E_API_URL || 'http://localhost:8080';
const E2E_USERNAME = process.env.E2E_USERNAME || 'test@example.com';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'Test@1234';

// Helper function to get JWT token from backend
async function getAuthToken(): Promise<string> {
  const response = await fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: E2E_USERNAME,
      password: E2E_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error('No token in authentication response');
  }

  return data.token;
}

// Helper function to call Contact List API
async function getContactList(
  token: string | null,
  pageNo = 0,
  pageSize = 10,
  paginationDisable = false
): Promise<Response> {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const params = new URLSearchParams({
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
    paginationDisable: paginationDisable.toString(),
  });

  const response = await fetch(`${API_URL}/rest/contact/getContactList?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response;
}

test.describe('Issue #333: Contact List API 500 Error Fix', () => {
  let authToken: string | null = null;

  test.beforeAll(async ({ browser }) => {
    // Try to get authentication token via API first
    try {
      authToken = await getAuthToken();
      console.log('✓ Authentication via API successful');
    } catch (apiError) {
      console.warn('⚠ API authentication failed, trying UI login...', apiError);

      // Fallback: Login via UI and get token from localStorage
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForSelector('input[type="email"], input[name="email"], #email-input', {
          timeout: 15000,
        });

        const emailInput = page
          .locator('input[type="email"], input[name="email"], #email-input')
          .first();
        const passwordInput = page
          .locator('input[type="password"], input[name="password"], #password-input')
          .first();

        await emailInput.fill(E2E_USERNAME);
        await passwordInput.fill(E2E_PASSWORD);

        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        // Wait for redirect away from login page
        await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30000 });

        // Get token from localStorage
        authToken = await page.evaluate(
          () => localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || ''
        );

        if (authToken) {
          console.log('✓ Authentication via UI successful');
        } else {
          console.error('✗ No token found in localStorage/sessionStorage after UI login');
        }
      } catch (uiError) {
        console.error('✗ UI authentication also failed:', uiError);
        throw new Error(
          `Both API and UI authentication failed. Backend may not be running. API error: ${apiError}, UI error: ${uiError}`
        );
      } finally {
        await context.close();
      }
    }

    if (!authToken) {
      throw new Error(
        'Could not obtain authentication token. Please ensure backend is running and credentials are correct.'
      );
    }
  });

  test('should return 200 OK (not 500) for GET /rest/contact/getContactList', async () => {
    test.setTimeout(30000); // 30 seconds timeout

    // Skip test if no auth token
    test.skip(!authToken, 'No authentication token available');

    console.log('\n=== Testing Contact List API ===');
    console.log(`API URL: ${API_URL}/rest/contact/getContactList`);
    console.log(
      `Auth token: ${authToken ? 'Present (' + authToken.substring(0, 20) + '...)' : 'Missing'}`
    );

    // Call the endpoint
    const response = await getContactList(authToken!, 0, 10, false);

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    // Verify status is 200 (not 500)
    expect(response.status).toBe(200);

    // Verify response has content
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('application/json');

    // Parse response body
    let responseBody: any;
    const responseText = await response.text();
    console.log(`Response body length: ${responseText.length} bytes`);

    try {
      responseBody = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
      console.error('Response text:', responseText.substring(0, 500));
      throw new Error(`Response is not valid JSON: ${error}`);
    }

    // Verify response structure matches PaginationResponseModel
    expect(responseBody).toBeDefined();
    expect(typeof responseBody).toBe('object');

    // Check for pagination fields
    if (responseBody.totalRecords !== undefined) {
      expect(typeof responseBody.totalRecords).toBe('number');
      console.log(`Total records: ${responseBody.totalRecords}`);
    }

    // Check for data array
    if (responseBody.data !== undefined) {
      expect(Array.isArray(responseBody.data)).toBe(true);
      console.log(`Data array length: ${responseBody.data.length}`);

      // If there are contacts, verify structure
      if (responseBody.data.length > 0) {
        const firstContact = responseBody.data[0];
        console.log('First contact:', JSON.stringify(firstContact, null, 2));

        // Verify ContactListModel structure
        expect(firstContact).toHaveProperty('id');
        expect(typeof firstContact.id).toBe('number');

        // Verify optional fields exist (may be null)
        const allowedFields = [
          'firstName',
          'middleName',
          'lastName',
          'organization',
          'email',
          'mobileNumber',
          'telephone',
          'currencySymbol',
          'currencyCode',
          'currencyName',
          'currencyIso',
          'taxTreatmentId',
          'taxTreatment',
          'contactType',
          'contactTypeString',
          'isActive',
          'nextDueDate',
          'dueAmount',
          'exchangeRate',
        ];

        // Check that at least some fields are present
        const presentFields = Object.keys(firstContact).filter(key => firstContact[key] !== null);
        console.log(`Present fields in contact: ${presentFields.join(', ')}`);
        expect(presentFields.length).toBeGreaterThan(0);
      }
    }

    console.log('✓ Contact List API test passed');
  });

  test('should handle pagination parameters correctly', async () => {
    test.setTimeout(30000);
    test.skip(!authToken, 'No authentication token available');

    console.log('\n=== Testing Pagination ===');

    // Test with pagination enabled
    const response1 = await getContactList(authToken!, 0, 5, false);
    expect(response1.status).toBe(200);
    const body1 = await response1.json();
    console.log(`Page 0, size 5: ${body1.data?.length || 0} items`);

    // Test with different page
    const response2 = await getContactList(authToken!, 1, 5, false);
    expect(response2.status).toBe(200);
    const body2 = await response2.json();
    console.log(`Page 1, size 5: ${body2.data?.length || 0} items`);

    console.log('✓ Pagination test passed');
  });

  test('should handle empty contact list gracefully', async () => {
    test.setTimeout(30000);
    test.skip(!authToken, 'No authentication token available');

    console.log('\n=== Testing Empty List Handling ===');

    const response = await getContactList(authToken!, 999, 10, false); // Page 999 should be empty

    // Should return 200 (not 500) even with empty results
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toBeDefined();

    // Should have data array (may be empty)
    if (body.data !== undefined) {
      expect(Array.isArray(body.data)).toBe(true);
    }

    console.log('✓ Empty list handling test passed');
  });

  test('should not have serialization errors (LazyInitializationException)', async () => {
    test.setTimeout(30000);
    test.skip(!authToken, 'No authentication token available');

    console.log('\n=== Testing for Serialization Errors ===');

    const response = await getContactList(authToken!, 0, 10, false);

    // Verify status is 200 (not 500 which would indicate serialization error)
    expect(response.status).toBe(200);

    const responseText = await response.text();

    // Verify response is not empty (empty body often indicates serialization failure)
    expect(responseText.length).toBeGreaterThan(0);

    // Verify response is valid JSON (not HTML error page or empty)
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Response is not valid JSON (possible serialization error): ${error}`);
    }

    // Verify no error messages in response
    expect(parsed.error).toBeUndefined();
    expect(parsed.message).not.toContain('LazyInitializationException');
    expect(parsed.message).not.toContain('could not initialize proxy');

    console.log('✓ No serialization errors detected');
  });
});
