import { test, expect } from '@playwright/test';
import { loginTestUser, getTestUserCredentials } from './helpers/test-user-helpers';

test.describe('Product Datalist Performance Test', () => {
  test('should measure product datalist API performance', async ({ page, request }) => {
    const credentials = getTestUserCredentials();
    const username = credentials.username;
    const password = credentials.password;

    // Login first to get auth token
    await loginTestUser(page, username, password);

    // Get auth token from localStorage
    const authToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(authToken).toBeTruthy();

    console.log('Testing product datalist API performance...');

    // Measure the time for the product datalist API call
    const startTime = Date.now();

    const response = await request.get(
      'http://localhost:8080/rest/datalist/product?priceType=SALES',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Product datalist API took: ${duration}ms`);

    // The response should be successful
    expect(response.status()).toBe(200);

    // Parse the response to check data
    const responseData = await response.json();
    expect(Array.isArray(responseData)).toBe(true);

    console.log(`Retrieved ${responseData.length} products`);
    console.log(`Performance: ${duration}ms (original issue was 4.31 seconds)`);

    // Assert that it's significantly improved from the original 4.31 seconds
    // With 2849 products, 3 seconds is reasonable for processing all the data
    expect(duration).toBeLessThan(3500);

    // And definitely better than the original 4.31 seconds
    expect(duration).toBeLessThan(4310);
  });
});
