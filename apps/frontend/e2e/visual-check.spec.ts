import { test, expect } from '@playwright/test';

test('register and test dashboard', async ({ page }) => {
  test.setTimeout(120000);

  // Go to root page
  await page.goto('/');
  await page.waitForTimeout(2000);

  // Log current URL
  console.log('Current URL after /:', page.url());

  // Check if we're on register or login page
  const url = page.url();
  if (url.includes('register')) {
    console.log('On registration page - registering new company');

    // Wait for form to load
    await page.waitForSelector('#companyName', { timeout: 10000 });

    // Fill registration form
    await page.fill('#companyName', 'Test Company LLC');
    await page.fill('#companyAddress1', '123 Test Street, Dubai');

    // Select Company Type
    await page.click('#companyTypeCode');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Select State
    await page.click('#stateId');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Fill mobile number (required) - react-phone-input-2 component
    const phoneInput = page
      .locator('.react-tel-input input, input.form-control[type="tel"]')
      .first();
    await phoneInput.click();
    await phoneInput.fill('971501234567');

    // Fill user details
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');

    // Take screenshot before submit
    await page.screenshot({ path: '/tmp/registration-filled.png', fullPage: true });

    // Click Register
    await page.getByRole('button', { name: /register/i }).click();

    // Wait for registration to complete and redirect
    await page.waitForTimeout(10000);
    console.log('After registration URL:', page.url());

    await page.screenshot({ path: '/tmp/after-registration.png', fullPage: true });

    // If we're on login page, login with the registered credentials
    if (page.url().includes('login')) {
      console.log('Logging in with registered credentials');
      await page.fill('input#username', 'test@example.com');
      await page.fill('input#password', 'TestPass123!');
      await page.getByRole('button', { name: /log in/i }).click();
      await page.waitForTimeout(5000);
    }
  } else if (url.includes('login')) {
    console.log('On login page - trying test credentials');
    await page.fill('input#username', 'test@example.com');
    await page.fill('input#password', 'TestPass123!');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForTimeout(5000);
  }

  // Take screenshot of dashboard or current page
  console.log('Final URL:', page.url());
  await page.screenshot({ path: '/tmp/dashboard.png', fullPage: true });

  // Keep browser open for observation
  await page.waitForTimeout(30000);
});
