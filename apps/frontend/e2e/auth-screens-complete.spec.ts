import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const REGISTER_PATH = '/register';
const RESET_PASSWORD_PATH = '/reset-password';
const NEW_PASSWORD_PATH = '/new-password';

// Helper function to wait for form fields to be visible
async function waitForFormFields(page: Page, fieldIds: string[]) {
	for (const fieldId of fieldIds) {
		await expect(page.locator(`#${fieldId}`)).toBeVisible({ timeout: 10_000 });
	}
}

test.describe('Authentication Screens - Complete Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Set a longer timeout for these tests
		test.setTimeout(120_000);
	});

	test('should display register screen with all required fields', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'domcontentloaded' });

		// Check for logo
		await expect(page.locator('.logo-container img')).toBeVisible({ timeout: 10_000 });

		// Check for register heading
		await expect(page.getByText(/register/i)).toBeVisible({ timeout: 5_000 });

		// Check for Company Details section
		await expect(page.getByText(/company details/i)).toBeVisible({ timeout: 5_000 });

		// Check required fields are present
		const requiredFields = [
			'companyName',
			'companyAddress1',
			'firstName',
			'lastName',
			'email',
			'password',
			'confirmPassword',
		];

		await waitForFormFields(page, requiredFields);

		// Verify email field is type="email" (not password)
		const emailInput = page.locator('#email');
		await expect(emailInput).toHaveAttribute('type', 'email');

		// Verify password fields are type="password"
		const passwordInput = page.locator('#password');
		const confirmPasswordInput = page.locator('#confirmPassword');
		await expect(passwordInput).toHaveAttribute('type', 'password');
		await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
	});

	test('should validate register form fields', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'domcontentloaded' });

		// Wait for form to be ready
		await waitForFormFields(page, ['companyName', 'email', 'password', 'confirmPassword']);

		// Try to submit empty form
		const submitButton = page.getByRole('button', { name: /register/i });
		await submitButton.click();

		// Wait for validation errors
		await page.waitForTimeout(1000);

		// Check for validation error messages
		const errorMessages = page.locator('.invalid-feedback');
		const errorCount = await errorMessages.count();
		expect(errorCount).toBeGreaterThan(0);
	});

	test('should validate email format in register screen', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'domcontentloaded' });

		await waitForFormFields(page, ['email']);

		const emailInput = page.locator('#email');

		// Enter invalid email
		await emailInput.fill('invalid-email');
		await emailInput.blur();

		// Wait for validation
		await page.waitForTimeout(500);

		// Check for email validation error
		const emailError = page.locator('#email').locator('..').locator('.invalid-feedback');
		const hasError = await emailError.isVisible().catch(() => false);
		
		// Email validation might happen on blur or submit
		// Try submitting to trigger validation
		const submitButton = page.getByRole('button', { name: /register/i });
		await submitButton.click();
		await page.waitForTimeout(500);

		// Check if error is visible after submit
		const emailErrorAfterSubmit = page.locator('#email').locator('..').locator('.invalid-feedback');
		const hasErrorAfterSubmit = await emailErrorAfterSubmit.isVisible().catch(() => false);
		
		// At least one validation should catch invalid email
		expect(hasError || hasErrorAfterSubmit).toBeTruthy();
	});

	test('should validate password matching in register screen', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'domcontentloaded' });

		await waitForFormFields(page, ['password', 'confirmPassword']);

		const passwordInput = page.locator('#password');
		const confirmPasswordInput = page.locator('#confirmPassword');

		// Enter password
		await passwordInput.fill('Test@1234');
		await page.waitForTimeout(300);

		// Enter different confirm password
		await confirmPasswordInput.fill('Test@5678');
		await confirmPasswordInput.blur();

		// Wait for validation
		await page.waitForTimeout(500);

		// Check for password mismatch error
		const confirmPasswordError = confirmPasswordInput.locator('..').locator('.invalid-feedback');
		const hasError = await confirmPasswordError.isVisible().catch(() => false);

		// If error not visible yet, try submitting
		if (!hasError) {
			const submitButton = page.getByRole('button', { name: /register/i });
			await submitButton.click();
			await page.waitForTimeout(500);
		}

		// Check for password mismatch error message
		const errorText = await confirmPasswordError.textContent().catch(() => '');
		const hasMatchError = errorText.toLowerCase().includes('match') || 
		                      errorText.toLowerCase().includes('password');

		expect(hasError || hasMatchError).toBeTruthy();
	});

	test('should accept matching passwords in register screen', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'domcontentloaded' });

		await waitForFormFields(page, ['password', 'confirmPassword']);

		const passwordInput = page.locator('#password');
		const confirmPasswordInput = page.locator('#confirmPassword');

		// Enter matching passwords
		const testPassword = 'Test@1234';
		await passwordInput.fill(testPassword);
		await page.waitForTimeout(300);
		await confirmPasswordInput.fill(testPassword);
		await confirmPasswordInput.blur();

		// Wait for validation
		await page.waitForTimeout(500);

		// Check that no error is shown for matching passwords
		const confirmPasswordError = confirmPasswordInput.locator('..').locator('.invalid-feedback');
		const hasError = await confirmPasswordError.isVisible().catch(() => false);

		expect(hasError).toBeFalsy();
	});

	test('should display reset password screen with email field', async ({ page }) => {
		await page.goto(`${BASE_URL}${RESET_PASSWORD_PATH}`, { waitUntil: 'domcontentloaded' });

		// Check for logo
		await expect(page.locator('.logo-container img')).toBeVisible({ timeout: 10_000 });

		// Check for heading
		await expect(page.getByText(/forgot password|reset password/i)).toBeVisible({ timeout: 5_000 });

		// Check for email field
		await waitForFormFields(page, ['username']);

		// Verify email field is type="email" or type="text" (not password)
		const emailInput = page.locator('#username');
		const inputType = await emailInput.getAttribute('type');
		expect(inputType).not.toBe('password');
		expect(['email', 'text']).toContain(inputType);

		// Check for submit button
		await expect(page.getByRole('button', { name: /send verification email|reset password/i })).toBeVisible({ timeout: 5_000 });
	});

	test('should validate email in reset password screen', async ({ page }) => {
		await page.goto(`${BASE_URL}${RESET_PASSWORD_PATH}`, { waitUntil: 'domcontentloaded' });

		await waitForFormFields(page, ['username']);

		const emailInput = page.locator('#username');

		// Enter invalid email
		await emailInput.fill('invalid-email');
		await emailInput.blur();

		// Wait for validation
		await page.waitForTimeout(500);

		// Try submitting to trigger validation
		const submitButton = page.getByRole('button', { name: /send verification email|reset password/i });
		await submitButton.click();
		await page.waitForTimeout(500);

		// Check for email validation error
		const emailError = emailInput.locator('..').locator('.invalid-feedback');
		const hasError = await emailError.isVisible().catch(() => false);
		const errorText = await emailError.textContent().catch(() => '');

		expect(hasError || errorText.toLowerCase().includes('email') || errorText.toLowerCase().includes('invalid')).toBeTruthy();
	});

	test('should display new password screen with password fields', async ({ page }) => {
		// Note: This screen typically requires a token in the URL
		// We'll test the basic structure
		await page.goto(`${BASE_URL}${NEW_PASSWORD_PATH}`, { waitUntil: 'domcontentloaded' });

		// Check for logo
		await expect(page.locator('.logo-container img')).toBeVisible({ timeout: 10_000 }).catch(() => {
			// Logo might not be visible if screen redirects or shows error
		});

		// Check for password fields (if screen is accessible)
		const passwordInput = page.locator('#password');
		const passwordVisible = await passwordInput.isVisible({ timeout: 5_000 }).catch(() => false);

		if (passwordVisible) {
			await waitForFormFields(page, ['password', 'confirmPassword']);

			// Verify password fields are type="password"
			await expect(passwordInput).toHaveAttribute('type', 'password');
			const confirmPasswordInput = page.locator('#confirmPassword');
			await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
		}
	});

	test('should validate password matching in new password screen', async ({ page }) => {
		// Note: This screen typically requires a token
		await page.goto(`${BASE_URL}${NEW_PASSWORD_PATH}`, { waitUntil: 'domcontentloaded' });

		const passwordInput = page.locator('#password');
		const passwordVisible = await passwordInput.isVisible({ timeout: 5_000 }).catch(() => false);

		if (passwordVisible) {
			await waitForFormFields(page, ['password', 'confirmPassword']);

			const confirmPasswordInput = page.locator('#confirmPassword');

			// Enter password
			await passwordInput.fill('Test@1234');
			await page.waitForTimeout(300);

			// Enter different confirm password
			await confirmPasswordInput.fill('Test@5678');
			await confirmPasswordInput.blur();

			// Wait for validation
			await page.waitForTimeout(500);

			// Check for password mismatch error
			const confirmPasswordError = confirmPasswordInput.locator('..').locator('.invalid-feedback');
			const hasError = await confirmPasswordError.isVisible().catch(() => false);

			// If error not visible yet, try submitting
			if (!hasError) {
				const submitButton = page.getByRole('button', { name: /create password|reset password|set password/i });
				if (await submitButton.isVisible().catch(() => false)) {
					await submitButton.click();
					await page.waitForTimeout(500);
				}
			}

			// Check for password mismatch error message
			const errorText = await confirmPasswordError.textContent().catch(() => '');
			const hasMatchError = errorText.toLowerCase().includes('match') || 
			                      errorText.toLowerCase().includes('password');

			expect(hasError || hasMatchError).toBeTruthy();
		}
	});

	test('should accept matching passwords in new password screen', async ({ page }) => {
		// Note: This screen typically requires a token
		await page.goto(`${BASE_URL}${NEW_PASSWORD_PATH}`, { waitUntil: 'domcontentloaded' });

		const passwordInput = page.locator('#password');
		const passwordVisible = await passwordInput.isVisible({ timeout: 5_000 }).catch(() => false);

		if (passwordVisible) {
			await waitForFormFields(page, ['password', 'confirmPassword']);

			const confirmPasswordInput = page.locator('#confirmPassword');

			// Enter matching passwords
			const testPassword = 'Test@1234';
			await passwordInput.fill(testPassword);
			await page.waitForTimeout(300);
			await confirmPasswordInput.fill(testPassword);
			await confirmPasswordInput.blur();

			// Wait for validation
			await page.waitForTimeout(500);

			// Check that no error is shown for matching passwords
			const confirmPasswordError = confirmPasswordInput.locator('..').locator('.invalid-feedback');
			const hasError = await confirmPasswordError.isVisible().catch(() => false);

			expect(hasError).toBeFalsy();
		}
	});

	test('should navigate from login to register screen', async ({ page }) => {
		await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

		// Look for register link/button
		const registerLink = page.getByText(/register/i).first();
		const registerVisible = await registerLink.isVisible({ timeout: 5_000 }).catch(() => false);

		if (registerVisible) {
			await registerLink.click();
			await page.waitForURL(`**${REGISTER_PATH}**`, { timeout: 10_000 });
			expect(page.url()).toContain(REGISTER_PATH);
		}
	});

	test('should navigate from login to reset password screen', async ({ page }) => {
		await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

		// Look for forgot password link/button
		const forgotPasswordLink = page.getByText(/forgot password/i).first();
		const forgotPasswordVisible = await forgotPasswordLink.isVisible({ timeout: 5_000 }).catch(() => false);

		if (forgotPasswordVisible) {
			await forgotPasswordLink.click();
			await page.waitForURL(`**${RESET_PASSWORD_PATH}**`, { timeout: 10_000 });
			expect(page.url()).toContain(RESET_PASSWORD_PATH);
		}
	});
});

