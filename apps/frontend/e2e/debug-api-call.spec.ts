import { test } from '@playwright/test';
import { login, createTestContact } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug API call during contact creation', async ({ page }) => {
  // Capture all API requests and responses
  const apiCalls: any[] = [];

  page.on('request', request => {
    if (request.url().includes('/rest/contact/save') || request.url().includes('/api/')) {
      const postData = request.postData();
      apiCalls.push({
        type: 'REQUEST',
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: postData ? JSON.parse(postData) : null,
      });
    }
  });

  page.on('response', async response => {
    if (
      response.url().includes('/rest/contact/save') ||
      (response.url().includes('/rest/') && response.request().method() === 'POST')
    ) {
      try {
        const responseBody = await response.text();
        apiCalls.push({
          type: 'RESPONSE',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          body: responseBody,
        });
      } catch (e) {
        apiCalls.push({
          type: 'RESPONSE',
          url: response.url(),
          status: response.status(),
          error: 'Could not read response body',
        });
      }
    }
  });

  await login(page, username, password);

  // Use the helper to create a contact
  const timestamp = Date.now();
  await createTestContact(page, 'APITest', 'User', `apitest${timestamp}@example.com`);

  // Wait for any pending requests
  await page.waitForTimeout(3000);

  console.log('\n=== API CALLS ===');
  apiCalls.forEach((call, index) => {
    console.log(`\n[${index + 1}] ${call.type}: ${call.method || ''} ${call.url}`);
    if (call.type === 'REQUEST' && call.postData) {
      console.log('Request Data:', JSON.stringify(call.postData, null, 2));
    }
    if (call.type === 'RESPONSE') {
      console.log(`Status: ${call.status} ${call.statusText}`);
      if (call.body) {
        console.log('Response Body:', call.body.substring(0, 500));
      }
    }
  });

  if (apiCalls.length === 0) {
    console.log('\n⚠️  NO API CALLS CAPTURED! The form submission did not trigger an API call.');
  }

  console.log('\n=== CURRENT URL ===');
  console.log(page.url());
});
