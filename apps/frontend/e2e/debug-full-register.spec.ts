import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('debug full registration with phone', async ({ page }) => {
  test.setTimeout(120000);

  // Capture ALL API requests and responses
  page.on('request', req => {
    if (req.url().includes('/rest/')) {
      console.log('API Request:', req.method(), req.url().split('/rest/')[1]);
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/rest/')) {
      const body = await res.text().catch(() => '');
      console.log('API Response:', res.status(), res.url().split('/rest/')[1], '->', body.substring(0, 200));
    }
  });

  await page.goto(BASE_URL + '/register');
  await page.waitForSelector('#companyName', { timeout: 30000 });

  // Step 1
  console.log('Filling Step 1...');
  await page.locator('#companyName').fill('Full Test Company ' + Date.now());
  await page.locator('input[aria-label="Select company type"]').click();
  await page.waitForTimeout(300);
  await page.locator('div[class*="option"]').nth(1).click();
  await page.waitForTimeout(200);
  await page.locator('#companyAddress1').fill('123 Test Street');

  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);

  // Step 2
  console.log('Filling Step 2...');
  await page.locator('input[aria-label="Select emirate"]').click();
  await page.waitForTimeout(300);
  await page.locator('div[class*="option"]').nth(1).click();
  await page.waitForTimeout(200);

  // Fill phone number - UAE format: 12 digits (971 + 9 digit local)
  const phoneInput = page.locator('.react-tel-input input, input[type="tel"]').first();
  console.log('Phone input visible:', await phoneInput.isVisible());
  await phoneInput.clear();
  await phoneInput.fill('971501234567'); // Full 12 digit UAE number
  await phoneInput.blur();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'step2-with-phone.png', fullPage: true });

  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);

  // Step 3
  console.log('Filling Step 3...');
  await page.screenshot({ path: 'step3-before-fill.png', fullPage: true });

  // Check if firstName is visible (uses name attribute, not id)
  const firstNameVisible = await page.locator('input[name="firstName"]').isVisible().catch(() => false);
  console.log('firstName visible:', firstNameVisible);

  if (firstNameVisible) {
    const email = 'test-' + Date.now() + '@example.com';
    await page.locator('input[name="firstName"]').fill('Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill('TestPass123!');
    await page.locator('input[name="confirmPassword"]').fill('TestPass123!');

    await page.screenshot({ path: 'step3-filled.png', fullPage: true });

    // Click Create Account
    console.log('Clicking Create Account...');
    await page.locator('button:has-text("Create Account")').click();

    // Wait for registration to complete (up to 30 seconds)
    try {
      await page.waitForURL('**/login**', { timeout: 30000 });
      console.log('Redirected to login!');
    } catch {
      console.log('Did not redirect to login');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'after-register.png', fullPage: true });
    console.log('Final URL:', page.url());
  } else {
    console.log('firstName not visible - step transition failed');
  }
});
