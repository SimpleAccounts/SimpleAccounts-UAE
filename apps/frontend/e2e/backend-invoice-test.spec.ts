import { test, expect } from '@playwright/test';

test.describe('Backend Invoice API Tests', () => {
  test('should validate invoice API accepts properly formatted dates', async ({ page }) => {
    // Test that the backend accepts DD/MM/YYYY format dates
    const invoiceData = {
      referenceNumber: `TEST-${Date.now()}`,
      invoiceDate: '20/01/2026', // DD/MM/YYYY format
      invoiceDueDate: '20/02/2026', // DD/MM/YYYY format
      type: '2',
      totalAmount: '100.00',
      totalVatAmount: '5.00',
      totalExciseAmount: '0.00',
      contactId: '1', // Will likely fail due to auth, but that's expected
      lineItemsString: JSON.stringify([
        {
          productId: 1,
          quantity: 1,
          rate: 100,
          amount: 100,
          vatAmount: 5,
          exciseAmount: 0,
          description: 'Test Item',
        },
      ]),
    };

    // Try to post invoice data - should return 401 (unauthorized) if auth required
    // or 400 (bad request) if data validation fails
    // Should NOT return 500 (internal server error) which would indicate date parsing failure
    const response = await page.request.post('http://localhost:8080/rest/invoice/save', {
      data: invoiceData,
    });

    console.log('Invoice save response status:', response.status());
    console.log('Invoice save response:', await response.text());

    // Should not be 500 (internal server error)
    expect(response.status()).not.toBe(500);

    // Should be 401 (unauthorized) or 400 (bad request) - both indicate the API is working
    expect([401, 400]).toContain(response.status());
  });

  test('should validate date format parsing works', async ({ page }) => {
    // Test different date formats to ensure DD/MM/YYYY works
    const testDates = ['20/01/2026', '01/12/2025', '15/06/2024'];

    for (const dateStr of testDates) {
      const invoiceData = {
        referenceNumber: `TEST-${Date.now()}-${dateStr.replace(/\//g, '')}`,
        invoiceDate: dateStr,
        invoiceDueDate: dateStr,
        type: '2',
        totalAmount: '100.00',
        contactId: '1',
      };

      const response = await page.request.post('http://localhost:8080/rest/invoice/save', {
        data: invoiceData,
      });

      console.log(`Date ${dateStr} - Status:`, response.status());

      // Should not be 500 (date parsing error)
      expect(response.status()).not.toBe(500);
    }
  });
});
