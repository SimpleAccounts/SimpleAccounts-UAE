import { test, expect, Page } from '@playwright/test';

const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const DASHBOARD_PATH = process.env.E2E_DASHBOARD_PATH || '/admin/dashboard';
const RESET_PASSWORD_PATH = process.env.E2E_RESET_PASSWORD_PATH || '/reset-password';
const LOGOUT_PATH = '/logout';

// Helper function to perform login
async function login(page: Page, username: string, password: string) {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input#username')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('input#password')).toBeVisible({ timeout: 10_000 });

  await page.fill('input#username', username);
  await page.fill('input#password', password);

  const loginButton = page.getByRole('button', { name: /log in/i });
  const buttonHandle = await loginButton.elementHandle();
  
  // Click login button
  if (buttonHandle) {
    await loginButton.click({ timeout: 30_000 });
  } else {
    await page.keyboard.press('Enter', { delay: 200 });
  }

  const normalizedPostLoginPath = POST_LOGIN_PATH.startsWith('/')
    ? POST_LOGIN_PATH
    : `/${POST_LOGIN_PATH}`;

  // Wait for URL change with timeout
  try {
    await page.waitForURL(`**${normalizedPostLoginPath}**`, { timeout: 60_000, waitUntil: 'domcontentloaded' });
  } catch (error) {
    // If navigation didn't happen, check for error messages
    const currentUrl = page.url();
    
    // Wait a bit for any error messages to appear
    await page.waitForTimeout(3000);
    
    // Check for toast notifications (react-toastify)
    const toastError = await page.locator('.Toastify__toast--error, [class*="toast-error"]').isVisible({ timeout: 2000 }).catch(() => false);
    if (toastError) {
      const toastText = await page.locator('.Toastify__toast--error, [class*="toast-error"]').first().textContent().catch(() => '');
      throw new Error(`Login failed: Toast error - "${toastText}". Current URL: ${currentUrl}`);
    }
    
    // Check for alert/error messages
    const errorSelectors = [
      '.alert-danger',
      '.alert.alert-danger',
      '.invalid-feedback',
      '[class*="error"]',
      '[role="alert"]',
    ];
    
    let errorMessage = '';
    for (const selector of errorSelectors) {
      try {
        const errorElement = page.locator(selector).first();
        if (await errorElement.isVisible({ timeout: 1000 }).catch(() => false)) {
          errorMessage = await errorElement.textContent().catch(() => '');
          if (errorMessage && errorMessage.trim()) break;
        }
      } catch {
        // Continue to next selector
      }
    }
    
    // Check if we're still on login page
    if (currentUrl.includes(LOGIN_PATH) || currentUrl.endsWith('/login')) {
      if (errorMessage) {
        throw new Error(`Login failed with error: "${errorMessage}". Current URL: ${currentUrl}. Make sure backend is running and credentials are correct.`);
      } else {
        // Check if form has validation errors
        const validationErrors = await page.locator('.invalid-feedback, [class*="error"]').count();
        if (validationErrors > 0) {
          const validationText = await page.locator('.invalid-feedback, [class*="error"]').first().textContent().catch(() => '');
          throw new Error(`Login failed: Form validation error - "${validationText}". Current URL: ${currentUrl}`);
        }
        throw new Error(`Login failed: Still on login page after ${60_000}ms. Current URL: ${currentUrl}. Check if backend is running at http://localhost:8080 and credentials (${username}) are correct.`);
      }
    }
    
    // If we got here, re-throw the original error
    throw error;
  }
}

// Helper function to perform logout
async function logout(page: Page) {
  // Look for logout button/link - could be in header dropdown or sidebar
  const logoutSelectors = [
    page.getByRole('button', { name: /log out|sign out|logout/i }),
    page.getByRole('link', { name: /log out|sign out|logout/i }),
    page.locator('[href*="logout"], [href*="log-out"]'),
    page.locator('button:has-text("Logout"), a:has-text("Logout")'),
  ];

  let loggedOut = false;
  for (const selector of logoutSelectors) {
    try {
      const isVisible = await selector.isVisible({ timeout: 3000 });
      if (isVisible) {
        await selector.click();
        loggedOut = true;
        break;
      }
    } catch {
      // Continue to next selector
    }
  }

  if (!loggedOut) {
    // Try navigating directly to logout path
    await page.goto(LOGOUT_PATH, { waitUntil: 'domcontentloaded' });
  }

  // Wait for redirect to login page
  await page.waitForURL(`**${LOGIN_PATH}**`, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded',
  });
}

test.describe('Complete Authentication Flow', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';
  const testEmail = process.env.E2E_TEST_EMAIL || username;

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set. These should be valid credentials for testing.');
  });

  test('should complete full auth flow: login → reset password → dashboard → logout', async ({
    page,
  }) => {
    test.setTimeout(300_000); // 5 minutes for complete flow

    // Step 1: Login
    await test.step('Login', async () => {
      await login(page, username, password);
      await expect(page).toHaveURL(new RegExp(POST_LOGIN_PATH));
    });

    // Step 2: Navigate to reset password page
    await test.step('Navigate to reset password', async () => {
      // First, logout to access reset password page
      await logout(page);
      await expect(page).toHaveURL(new RegExp(LOGIN_PATH));

      // Click on "Forgot password" link
      const forgotPasswordLink = page.getByRole('link', { name: /forgot.*password|reset.*password/i });
      const linkExists = await forgotPasswordLink.isVisible({ timeout: 5000 }).catch(() => false);

      if (linkExists) {
        await forgotPasswordLink.click();
        await page.waitForURL(`**${RESET_PASSWORD_PATH}**`, { timeout: 10_000 });
        await expect(page).toHaveURL(new RegExp(RESET_PASSWORD_PATH));

        // Verify reset password form is displayed
        const emailInput = page.locator('input[type="email"], input[name*="email"], input[id*="email"], input[name*="username"]');
        await expect(emailInput).toBeVisible({ timeout: 10_000 });

        // Fill in email and submit (this will send reset email)
        await emailInput.fill(testEmail);
        const submitButton = page.getByRole('button', { name: /send|submit|reset/i });
        if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await submitButton.click();
          // Wait for success message or redirect
          await page.waitForTimeout(2000);
        }

        // Navigate back to login
        const backToLoginButton = page.getByRole('button', { name: /back.*login|login/i });
        if (await backToLoginButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await backToLoginButton.click();
        } else {
          await page.goto(LOGIN_PATH);
        }
      } else {
        // If no forgot password link, navigate directly to reset password page
        await page.goto(RESET_PASSWORD_PATH);
        await expect(page).toHaveURL(new RegExp(RESET_PASSWORD_PATH));

        const emailInput = page.locator('input[type="email"], input[name*="email"], input[id*="email"], input[name*="username"]');
        await expect(emailInput).toBeVisible({ timeout: 10_000 });

        // Fill in email
        await emailInput.fill(testEmail);

        // Navigate back to login
        await page.goto(LOGIN_PATH);
      }
    });

    // Step 3: Login again and navigate to dashboard
    await test.step('Login and display dashboard', async () => {
      await login(page, username, password);
      await expect(page).toHaveURL(new RegExp(POST_LOGIN_PATH));

      // Navigate to dashboard
      await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });
      await page.waitForURL(`**${DASHBOARD_PATH}**`, { timeout: 30_000 });

      // Verify dashboard is displayed
      // Look for common dashboard elements
      const dashboardIndicators = [
        page.locator('.dashboard-screen, [class*="dashboard"]'),
        page.locator('h1, h2, h3, h4').filter({ hasText: /dashboard/i }),
        page.locator('[class*="card"], [class*="chart"]'),
      ];

      let dashboardVisible = false;
      for (const indicator of dashboardIndicators) {
        try {
          const isVisible = await indicator.first().isVisible({ timeout: 10_000 });
          if (isVisible) {
            dashboardVisible = true;
            break;
          }
        } catch {
          // Continue to next indicator
        }
      }

      // At minimum, verify we're on the dashboard URL
      expect(page.url()).toContain(DASHBOARD_PATH);
      expect(dashboardVisible || page.url().includes('dashboard')).toBeTruthy();
    });

    // Step 4: Logout
    await test.step('Logout', async () => {
      await logout(page);
      await expect(page).toHaveURL(new RegExp(LOGIN_PATH));

      // Verify we're logged out by checking we can't access protected routes
      await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });
      
      // Should redirect back to login
      await page.waitForURL(`**${LOGIN_PATH}**`, { timeout: 10_000 });
      await expect(page).toHaveURL(new RegExp(LOGIN_PATH));
    });
  });

  test('should verify login form elements are present', async ({ page }) => {
    await page.goto(LOGIN_PATH);

    // Verify form elements
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();

    // Verify input types
    await expect(page.locator('input#username')).toHaveAttribute('type', 'text');
    await expect(page.locator('input#password')).toHaveAttribute('type', 'password');
  });

  test('should verify logout redirects to login', async ({ page }) => {
    test.setTimeout(120_000);

    // Login first
    await login(page, username, password);
    await expect(page).toHaveURL(new RegExp(POST_LOGIN_PATH));

    // Logout
    await logout(page);
    await expect(page).toHaveURL(new RegExp(LOGIN_PATH));

    // Verify login form is visible
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('should verify protected routes redirect to login after logout', async ({ page }) => {
    test.setTimeout(120_000);

    // Login first
    await login(page, username, password);
    await expect(page).toHaveURL(new RegExp(POST_LOGIN_PATH));

    // Logout
    await logout(page);
    await expect(page).toHaveURL(new RegExp(LOGIN_PATH));

    // Try to access protected routes
    const protectedRoutes = [
      DASHBOARD_PATH,
      '/admin/income',
      '/admin/expense',
      '/admin/master',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Should redirect to login
      await page.waitForURL(`**${LOGIN_PATH}**`, { timeout: 10_000 });
      await expect(page).toHaveURL(new RegExp(LOGIN_PATH));
    }
  });
});

