import { test, expect, Page } from '@playwright/test';

// Test data for registration
const TEST_USER = {
  companyName: 'Test Company LLC',
  companyAddress: '123 Test Street, Business Bay',
  firstName: 'John',
  lastName: 'Doe',
  email: `test${Date.now()}@example.com`,
  password: 'TestPass123!',
  phoneNumber: '971501234567',
};

// Helper to navigate to register page (returns 'register' if on register page, 'login' if redirected)
async function navigateToRegister(page: Page): Promise<'register' | 'login'> {
  await page.goto('/register');
  // Wait for either register form or login form (if redirected because company exists)
  const result = await Promise.race([
    page.waitForSelector('#companyName', { timeout: 10000 }).then(() => 'register' as const),
    page.waitForSelector('#username', { timeout: 10000 }).then(() => 'login' as const),
  ]);
  return result;
}

// Helper to navigate to login (only works if company exists)
async function navigateToLogin(page: Page) {
  await page.goto('/login');
  // Wait for either login form or register form (if redirected)
  const result = await Promise.race([
    page.waitForSelector('#username', { timeout: 10000 }).then(() => 'login'),
    page.waitForSelector('#companyName', { timeout: 10000 }).then(() => 'register'),
  ]);
  return result;
}

test.describe('Registration and Login Flow', () => {
  test.setTimeout(120000); // 2 minute timeout for registration tests

  test('should display registration form with all required elements', async ({ page }) => {
    const pageType = await navigateToRegister(page);
    if (pageType === 'login') {
      test.skip(true, 'Company already exists - registration not available');
      return;
    }

    // Verify company details section
    await expect(page.locator('#companyName')).toBeVisible();
    await expect(page.locator('#companyAddress1')).toBeVisible();
    await expect(page.locator('#stateId')).toBeVisible();

    // Verify super admin section
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();

    // Verify register button
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    const pageType = await navigateToRegister(page);
    if (pageType === 'login') {
      test.skip(true, 'Company already exists - registration not available');
      return;
    }

    // Click register without filling any fields
    await page.getByRole('button', { name: /register/i }).click();

    // Wait a moment for validation to trigger
    await page.waitForTimeout(1000);

    // Should show validation errors (form should still be visible)
    await expect(page.locator('#companyName')).toBeVisible();

    // Check for invalid-feedback divs
    const errorMessages = page.locator('.invalid-feedback');
    const count = await errorMessages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should successfully complete registration', async ({ page }) => {
    const pageType = await navigateToRegister(page);
    if (pageType === 'login') {
      test.skip(true, 'Company already exists - registration not available');
      return;
    }
    await page.waitForTimeout(2000); // Wait for API calls to complete

    // Fill company details
    await page.fill('#companyName', TEST_USER.companyName);
    await page.fill('#companyAddress1', TEST_USER.companyAddress);

    // Select Company/Business Type (react-select)
    await page.click('#companyTypeCode');
    await page.waitForTimeout(500);
    // Select the first available option
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Select Emirate (react-select)
    await page.click('#stateId');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Fill phone number - the react-phone-input-2 defaults to UAE (+971)
    // We need to clear the input and type a valid UAE number
    const phoneInput = page.locator('.react-tel-input input');
    await phoneInput.click();
    // Clear existing value and type full number with country code
    await phoneInput.fill('');
    await page.waitForTimeout(200);
    // Type the UAE phone number (the input should auto-format with +971)
    await phoneInput.type('971501234567', { delay: 50 });

    // Fill super admin details
    await page.fill('#firstName', TEST_USER.firstName);
    await page.fill('#lastName', TEST_USER.lastName);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.fill('#confirmPassword', TEST_USER.password);

    // Wait a moment for form validation
    await page.waitForTimeout(1000);

    // Click register button
    await page.getByRole('button', { name: /register/i }).click();

    // Wait for registration to process
    // Either success toast and redirect to login, or stay on page with success message
    const result = await Promise.race([
      page.waitForURL('**/login**', { timeout: 60000 }).then(() => 'redirected'),
      page
        .waitForSelector('.Toastify__toast--success', { timeout: 60000 })
        .then(() => 'success-toast'),
      page.waitForTimeout(60000).then(() => 'timeout'),
    ]);

    // Registration should either redirect to login or show success
    expect(['redirected', 'success-toast']).toContain(result);
  });

  test('should display login form with all required elements', async ({ page }) => {
    const pageType = await navigateToLogin(page);

    // Skip if redirected to register (no company exists)
    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    // Verify form elements
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    const pageType = await navigateToLogin(page);

    // Skip if redirected to register (no company exists)
    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    // Fill invalid credentials
    await page.fill('#username', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');

    // Click login
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for error response
    await page.waitForTimeout(3000);

    // Should show error toast or remain on login page
    const onLoginPage = await page.locator('#username').isVisible();
    expect(onLoginPage).toBeTruthy();
  });

  test('should successfully login with valid credentials after registration', async ({ page }) => {
    // First check if we can register (no company exists)
    const pageType = await navigateToRegister(page);
    if (pageType === 'login') {
      test.skip(true, 'Company already exists - testing login instead');
      return;
    }

    // Register a new user
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    await page.waitForTimeout(2000);

    // Fill registration form
    await page.fill('#companyName', 'Login Test Company');
    await page.fill('#companyAddress1', '456 Test Ave');

    // Select Company Type
    await page.click('#companyTypeCode');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Select Emirate
    await page.click('#stateId');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Fill phone with UAE number
    const phoneInput = page.locator('.react-tel-input input');
    await phoneInput.click();
    await phoneInput.fill('');
    await page.waitForTimeout(200);
    await phoneInput.type('971501234568', { delay: 50 });

    // Fill admin details
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');

    await page.waitForTimeout(1000);

    // Register
    await page.getByRole('button', { name: /register/i }).click();

    // Wait for registration to complete
    await Promise.race([
      page.waitForURL('**/login**', { timeout: 60000 }),
      page.waitForSelector('.Toastify__toast--success', { timeout: 60000 }),
    ]);

    // Now test login
    await page.goto('/login');
    await page.waitForSelector('#username', { timeout: 30000 });

    // Fill login credentials
    await page.fill('#username', uniqueEmail);
    await page.fill('#password', 'TestPass123!');

    // Click login
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for successful login (should redirect to admin/dashboard)
    const loginResult = await Promise.race([
      page.waitForURL('**/admin**', { timeout: 30000 }).then(() => 'dashboard'),
      page.waitForSelector('.Toastify__toast--success', { timeout: 30000 }).then(() => 'success'),
      page.waitForTimeout(30000).then(() => 'timeout'),
    ]);

    // Should be logged in successfully
    expect(['dashboard', 'success']).toContain(loginResult);
  });
});

test.describe('Login Form Validation', () => {
  test('should not submit with empty username', async ({ page }) => {
    const pageType = await navigateToLogin(page);
    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    // Fill only password
    await page.fill('#password', 'somepassword');
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForTimeout(1000);

    // Should still be on login page
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should not submit with empty password', async ({ page }) => {
    const pageType = await navigateToLogin(page);
    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    // Fill only username
    await page.fill('#username', 'test@example.com');
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForTimeout(1000);

    // Should still be on login page
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should have password visibility toggle', async ({ page }) => {
    const pageType = await navigateToLogin(page);
    if (pageType === 'register') {
      test.skip(true, 'No company exists - redirected to register');
      return;
    }

    const passwordInput = page.locator('#password');

    // Initial type should be password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Look for eye icon to toggle
    const eyeIcon = page.locator('.fa-eye, .fa-eye-slash, [class*="eye"]').first();
    const iconExists = await eyeIcon.isVisible({ timeout: 3000 }).catch(() => false);

    if (iconExists) {
      await eyeIcon.click();
      // Password should now be visible (type=text)
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
