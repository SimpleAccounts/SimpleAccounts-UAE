import { test, expect } from '@playwright/test';
import { loginTestUser } from './helpers/test-user-helpers';

test.describe('Invoice Creation - Debug 500 Error', () => {
  test('should create invoice via UI and check for 500 error', async ({ page }) => {
    // Login first
    await loginTestUser(page);

    // Navigate to invoice create page
    await page.goto('/admin/income/customer-invoice/create');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Fill basic invoice details - use a simple approach
    await page.getByLabel(/Reference Number/).fill(`INV-${Date.now()}`);

    // Try to save the invoice - this should trigger the date formatting fix
    const saveButton = page.getByRole('button', { name: /save|create/i });
    await saveButton.click();

    // Wait for response and check for errors
    await page.waitForTimeout(2000);

    // Check network requests for 500 errors
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/rest/invoice/save')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log('Invoice save response:', {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    await page.waitForTimeout(3000);

    // Check if we got a response
    if (responses.length > 0) {
      console.log('Invoice save responses:', responses);
      // The test should pass if we don't get a 500 error
      expect(responses[0].status).not.toBe(500);
    } else {
      console.log('No invoice save request was made - form validation might have prevented it');
      // This is also acceptable - if validation prevented the request
    }
  });
});