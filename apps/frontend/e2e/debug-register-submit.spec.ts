import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('debug registration submission', async ({ page }) => {
  test.setTimeout(120000);

  // Capture register API response
  page.on('response', async res => {
    if (res.url().includes('/rest/company/register')) {
      const body = await res.text().catch(() => 'could not read');
      console.log('Register response:', res.status(), body);
    }
  });

  await page.goto(`${BASE_URL}/register`);
  await page.waitForSelector('#companyName', { timeout: 30000 });

  // Step 1: Company Details
  await page.locator('#companyName').fill('Debug Test Company');
  await page.locator('input[aria-label="Select company type"]').click();
  await page.waitForTimeout(500);
  await page.locator('div[class*="option"]').first().click();
  await page.waitForTimeout(300);

  await page.locator('#companyAddress1').fill('123 Test Street');

  // Click Next
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);

  // Step 2: Location & VAT
  await page.locator('input[aria-label="Select emirate"]').click();
  await page.waitForTimeout(500);
  await page.locator('div[class*="option"]').first().click();
  await page.waitForTimeout(300);

  // Click Next
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);

  // Step 3: Admin Account
  await page.locator('#firstName').fill('Debug');
  await page.locator('#lastName').fill('User');
  await page.locator('#email').fill('debug-test-' + Date.now() + '@example.com');
  await page.locator('#password').fill('TestPass123!');
  await page.locator('#confirmPassword').fill('TestPass123!');

  await page.screenshot({ path: 'debug-before-register.png', fullPage: true });

  // Click Register
  const registerButton = page.locator('button:has-text("Register")');
  console.log('Register button visible:', await registerButton.isVisible());
  await registerButton.click();

  // Wait for response
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'debug-after-register.png', fullPage: true });

  console.log('Current URL:', page.url());
});
