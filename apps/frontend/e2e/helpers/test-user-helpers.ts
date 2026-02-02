import { Page, expect } from '@playwright/test';
import { getLoginPath, getPostLoginPath, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Gets test user credentials from environment variables with fallback defaults
 * Follows the standard pattern: E2E_USERNAME and E2E_PASSWORD env vars
 *
 * @returns Object with username and password
 *
 * @example
 * ```typescript
 * const { username, password } = getTestUserCredentials();
 * ```
 */
export function getTestUserCredentials(): { username: string; password: string } {
  const username = process.env.E2E_USERNAME || 'test@example.com';
  const password = process.env.E2E_PASSWORD || 'Test@1234';

  return { username, password };
}

/**
 * Generates a unique test user email using the pattern: test-${workflow}-${Date.now()}@example.com
 *
 * @param workflow - The workflow name (e.g., 'invoice', 'payment', 'expense')
 * @returns A unique email address for test user
 *
 * @example
 * ```typescript
 * const email = generateTestUserEmail('invoice');
 * // Returns: test-invoice-1234567890@example.com
 * ```
 */
export function generateTestUserEmail(workflow: string): string {
  const timestamp = Date.now();
  return `test-${workflow}-${timestamp}@example.com`;
}

/**
 * Standardized login helper function for test users
 * Uses the credentials from environment variables or defaults
 * Follows the standard login pattern used across all E2E tests
 *
 * @param page - Playwright Page object
 * @param username - Optional username (defaults to E2E_USERNAME env var or 'test@example.com')
 * @param password - Optional password (defaults to E2E_PASSWORD env var or 'Test@1234')
 * @throws Error if login fails
 *
 * @example
 * ```typescript
 * await loginTestUser(page);
 * // Or with custom credentials:
 * await loginTestUser(page, 'custom@example.com', 'CustomPass123');
 * ```
 */
export async function loginTestUser(
  page: Page,
  username?: string,
  password?: string
): Promise<void> {
  const credentials = getTestUserCredentials();
  const loginUsername = username || credentials.username;
  const loginPassword = password || credentials.password;

  const loginPath = getLoginPath();
  const postLoginPath = getPostLoginPath();

  await page.goto(loginPath, { waitUntil: 'domcontentloaded' });

  // Wait for login form elements
  // Try both selectors: input#username and input#email-input (modern UI uses email-input)
  const usernameSelector = page.locator('input#username, input#email-input').first();
  const passwordSelector = page.locator('input#password, input#password-input').first();

  await expect(usernameSelector).toBeVisible({ timeout: 10_000 });
  await expect(passwordSelector).toBeVisible({ timeout: 10_000 });

  // Fill login form
  await usernameSelector.fill(loginUsername);
  await passwordSelector.fill(loginPassword);

  // Click login button
  const loginButton = page.getByRole('button', { name: /log in/i });
  const buttonHandle = await loginButton.elementHandle();

  if (buttonHandle) {
    await loginButton.click({ timeout: 30_000 });
  } else {
    await page.keyboard.press('Enter', { delay: 200 });
  }

  // Wait for successful navigation to post-login path
  const normalizedPostLoginPath = postLoginPath.startsWith('/')
    ? postLoginPath
    : `/${postLoginPath}`;

  try {
    await page.waitForURL(`**${normalizedPostLoginPath}**`, {
      timeout: 60_000,
      waitUntil: 'domcontentloaded',
    });
  } catch (error) {
    // Check for error messages if navigation didn't happen
    const currentUrl = page.url();

    await page.waitForTimeout(3000);

    // Check for toast notifications (react-toastify)
    const toastError = await page
      .locator('.Toastify__toast--error, [class*="toast-error"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (toastError) {
      const toastText = await page
        .locator('.Toastify__toast--error, [class*="toast-error"]')
        .first()
        .textContent()
        .catch(() => '');
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

    if (currentUrl.includes(loginPath) || currentUrl.endsWith('/login')) {
      if (errorMessage) {
        throw new Error(
          `Login failed with error: "${errorMessage}". Current URL: ${currentUrl}. Make sure backend is running and credentials are correct.`
        );
      }
      throw new Error(
        `Login failed: Still on login page after 60s. Current URL: ${currentUrl}. Check if backend is running and credentials (${loginUsername}) are correct.`
      );
    }

    throw error;
  }
}

/**
 * Creates a test user by registering a new user via the registration flow
 * This function navigates to the registration page and completes the registration form
 *
 * @param page - Playwright Page object
 * @param options - Registration options
 * @param options.workflow - Workflow name for email generation (default: 'workflow')
 * @param options.email - Optional custom email (overrides generated email)
 * @param options.password - Optional custom password (defaults to E2E_PASSWORD or 'Test@1234')
 * @param options.companyName - Optional company name (default: 'Test Company')
 * @param options.firstName - Optional first name (default: 'Test')
 * @param options.lastName - Optional last name (default: 'User')
 * @returns Object with created user's email and password
 *
 * @example
 * ```typescript
 * const user = await createTestUser(page, { workflow: 'invoice' });
 * // Returns: { email: 'test-invoice-1234567890@example.com', password: 'Test@1234' }
 * ```
 */
export async function createTestUser(
  page: Page,
  options: {
    workflow?: string;
    email?: string;
    password?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
  } = {}
): Promise<{ email: string; password: string }> {
  const {
    workflow = 'workflow',
    email: customEmail,
    password: customPassword,
    companyName = 'Test Company',
    firstName = 'Test',
    lastName = 'User',
  } = options;

  const credentials = getTestUserCredentials();
  const userEmail = customEmail || generateTestUserEmail(workflow);
  const userPassword = customPassword || credentials.password;

  const baseUrl = getFrontendBaseUrl();
  const registerPath = '/register';

  // Navigate to registration page
  await page.goto(`${baseUrl}${registerPath}`, { waitUntil: 'networkidle' });

  // Wait for registration form
  await page.waitForSelector('#companyName', { state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(2000);

  // Fill registration form
  await page.locator('#companyName').fill(companyName);
  await page.locator('#companyAddress1').fill('123 Test Street');
  await page.locator('#firstName').fill(firstName);
  await page.locator('#lastName').fill(lastName);
  await page.locator('#email').fill(userEmail);
  await page.locator('#password').fill(userPassword);
  await page.locator('#confirmPassword').fill(userPassword);

  // Blur confirm password to trigger validation
  await page.locator('#confirmPassword').blur();
  await page.waitForTimeout(500);

  // Fill phone number if field exists
  const phoneInput = page.locator('.react-tel-input input, input[type="tel"]').first();
  if (await phoneInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await phoneInput.fill('971501234567');
    await phoneInput.blur();
  }

  // Select company type if dropdown exists
  const companyTypeSelectContainer = page.locator('#companyTypeCode');
  if (await companyTypeSelectContainer.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await companyTypeSelectContainer.click();
    await page.locator('div[role="option"]:has-text("Individual")').click();
  }

  // Submit registration form
  await page.click('button[type="submit"]');

  // Wait for successful registration (should redirect to admin/dashboard)
  await page.waitForURL('**/admin**', { timeout: 30_000 });

  return { email: userEmail, password: userPassword };
}
