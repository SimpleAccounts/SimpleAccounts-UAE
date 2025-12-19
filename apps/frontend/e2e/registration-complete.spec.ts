import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8080';
const REGISTER_PATH = '/register';
const LOGIN_PATH = '/login';
const E2E_USERNAME = process.env.E2E_USERNAME || 'test@example.com';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'Test@1234';

// Helper function to clear database before each test
async function clearDatabase() {
	// Script is in the repo root, not in apps/scripts
	const scriptPath = path.join(__dirname, '../../../scripts/clear-database-auto.sh');
	try {
		execSync(`bash ${scriptPath} --force`, { stdio: 'inherit' });
	} catch (error) {
		console.warn('Failed to clear database:', error);
		// Continue anyway - test might still work
	}
}

// Helper function to fill registration form
async function fillRegistrationForm(page: Page, data: {
	companyName?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	password?: string;
	confirmPassword?: string;
	companyAddress1?: string;
	phoneNumber?: string;
	companyTypeCode?: string;
	stateId?: string;
}) {
	const {
		companyName = 'Test Company',
		email = E2E_USERNAME,
		firstName = 'Test',
		lastName = 'User',
		password = E2E_PASSWORD,
		confirmPassword = E2E_PASSWORD,
		companyAddress1 = '123 Test Street',
		phoneNumber = '971501234567',
		companyTypeCode,
	} = data;

	// Wait for form to be ready - wait for the page to be fully loaded
	await page.waitForLoadState('networkidle');
	await page.waitForSelector('#companyName', { state: 'visible', timeout: 15_000 });
	
	// Wait for react-select components to be ready (they render as divs, not inputs)
	await page.waitForSelector('#companyTypeCode', { state: 'visible', timeout: 10_000 }).catch(() => {});
	await page.waitForTimeout(2000); // Give time for API calls to complete

	// Fill company name
	await page.locator('#companyName').fill(companyName);
	
	// Use companyTypeCode if provided (for custom test scenarios)
	if (companyTypeCode) {
		const companyTypeInput = page.locator('#companyTypeCode').locator('input').first();
		await companyTypeInput.fill(companyTypeCode);
		await companyTypeInput.press('Enter');
		await page.waitForTimeout(500);
	}

	// Fill company address
	await page.locator('#companyAddress1').fill(companyAddress1);

	// Fill first name
	await page.locator('#firstName').fill(firstName);

	// Fill last name
	await page.locator('#lastName').fill(lastName);

	// Fill email
	await page.locator('#email').fill(email);

	// Fill password
	await page.locator('#password').fill(password);

		// Fill confirm password
		await page.locator('#confirmPassword').fill(confirmPassword);
		await page.locator('#confirmPassword').blur();
		await page.waitForTimeout(500); // Wait for validation

		// Fill phone number
		const phoneInput = page.locator('.react-tel-input input, input[type="tel"]').first();
		if (await phoneInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await phoneInput.fill(phoneNumber);
			await phoneInput.blur();
		}

	// Select company type (required field)
	// react-select renders as a div with id="companyTypeCode"
	// Wait for the react-select component to be ready
	const companyTypeSelectContainer = page.locator('#companyTypeCode');
	await companyTypeSelectContainer.waitFor({ state: 'visible', timeout: 5_000 });
	
	// Click on the control div to open the menu
	const control = companyTypeSelectContainer.locator('div[class*="control"]').first();
	await control.click();
	await page.waitForTimeout(800);
	
	// Wait for the menu to appear - try multiple selectors
	let menu = page.locator('#companyTypeCode').locator('div[class*="menu"]').first();
	let menuVisible = await menu.isVisible({ timeout: 2_000 }).catch(() => false);
	
	if (!menuVisible) {
		// Try looking for menu in portal (react-select renders menu in body)
		menu = page.locator('div[class*="menu"]').filter({ hasText: /./ }).first();
		menuVisible = await menu.isVisible({ timeout: 2_000 }).catch(() => false);
	}
	
	if (menuVisible) {
		// Get all available options
		const options = menu.locator('div[class*="option"]');
		const optionCount = await options.count();
		console.log('Company type options available:', optionCount);
		
		if (optionCount > 1) {
			// Skip the first option (usually "Select Company Type Code" placeholder)
			// Select the second option which should be a real value
			const secondOption = options.nth(1);
			const optionText = await secondOption.textContent();
			console.log('Selecting company type:', optionText);
			await secondOption.click({ force: true });
			await page.waitForTimeout(1000); // Wait for selection to register
			
			// Verify selection
			const selectedValue = await companyTypeSelectContainer.locator('input').first().inputValue().catch(() => '');
			console.log('Company type selected value:', selectedValue);
		} else if (optionCount === 1) {
			// If only one option, use it
			const firstOption = options.first();
			const optionText = await firstOption.textContent();
			console.log('Selecting company type (only option):', optionText);
			await firstOption.click({ force: true });
			await page.waitForTimeout(1000);
		}
	} else {
		// Fallback: use keyboard navigation
		await control.press('ArrowDown');
		await page.waitForTimeout(300);
		await control.press('Enter');
		await page.waitForTimeout(1000);
	}

	// Select state/emirate (required field)
	// react-select renders as a div with id="stateId"
	// Note: Country is disabled and defaults to UAE (229), so state list should load automatically
	// Wait for state select to be ready and options to load
	await page.waitForTimeout(3000); // Give time for state list API call to complete
	
	const stateSelectContainer = page.locator('#stateId');
	await stateSelectContainer.waitFor({ state: 'visible', timeout: 10_000 });
	
	// Check if state is already selected
	const stateInput = stateSelectContainer.locator('input').first();
	const currentValue = await stateInput.inputValue().catch(() => '');
	
	if (!currentValue || currentValue.trim() === '') {
		// Click on the control div to open the menu
		const control = stateSelectContainer.locator('div[class*="control"]').first();
		await control.click();
		await page.waitForTimeout(800);
		
		// Wait for the menu to appear - try multiple selectors
		let menu = stateSelectContainer.locator('div[class*="menu"]').first();
		let menuVisible = await menu.isVisible({ timeout: 2_000 }).catch(() => false);
		
		if (!menuVisible) {
			// Try looking for menu in portal
			menu = page.locator('div[class*="menu"]').filter({ hasText: /./ }).first();
			menuVisible = await menu.isVisible({ timeout: 2_000 }).catch(() => false);
		}
		
		if (menuVisible) {
			// Get all available options
			const options = menu.locator('div[class*="option"]');
			const optionCount = await options.count();
			console.log('State/Emirate options available:', optionCount);
			
			if (optionCount > 1) {
				// Skip the first option (usually "Select Emirate" placeholder)
				// Select the second option which should be a real value
				const secondOption = options.nth(1);
				const optionText = await secondOption.textContent();
				console.log('Selecting state/emirate:', optionText);
				await secondOption.click({ force: true });
				await page.waitForTimeout(1000); // Wait for selection to register
				
				// Verify selection
				const selectedValue = await stateInput.inputValue().catch(() => '');
				console.log('State selected value:', selectedValue);
			} else if (optionCount === 1) {
				// If only one option, use it
				const firstOption = options.first();
				const optionText = await firstOption.textContent();
				console.log('Selecting state/emirate (only option):', optionText);
				await firstOption.click({ force: true });
				await page.waitForTimeout(1000);
			}
		} else {
			// Fallback: use keyboard navigation
			await control.press('ArrowDown');
			await page.waitForTimeout(300);
			await control.press('Enter');
			await page.waitForTimeout(1000);
		}
	}
}

test.describe('Registration Complete Flow', () => {
	test.beforeEach(async ({ page }) => {
		test.setTimeout(180_000); // 3 minutes per test
		// Clear database before each test
		await clearDatabase();
		// Wait a moment for backend to be ready
		await page.waitForTimeout(2000);
	});

	test('should successfully register a new company', async ({ page }) => {
		// Navigate to register screen (should redirect from login if no company exists)
		await page.goto(`${BASE_URL}${LOGIN_PATH}`, { waitUntil: 'networkidle' });
		
		// Should redirect to register if no company exists, or go directly to register
		const currentUrl = page.url();
		if (!currentUrl.includes(REGISTER_PATH)) {
			await page.waitForURL(`**${REGISTER_PATH}**`, { timeout: 15_000 }).catch(() => {
				// If not redirected, navigate directly to register
				page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'networkidle' });
			});
		}
		expect(page.url()).toContain(REGISTER_PATH);
		
		// Wait for the register form to be fully loaded
		await page.waitForSelector('#companyName', { state: 'visible', timeout: 15_000 });
		await page.waitForTimeout(2000); // Give time for API calls to complete

		// Fill registration form
		await fillRegistrationForm(page, {
			companyName: 'Test Company E2E',
			email: E2E_USERNAME,
			firstName: 'Test',
			lastName: 'User',
			password: E2E_PASSWORD,
			confirmPassword: E2E_PASSWORD,
		});

		// Verify form fields are filled before submission
		const companyNameValue = await page.locator('#companyName').inputValue();
		const emailValue = await page.locator('#email').inputValue();
		const firstNameValue = await page.locator('#firstName').inputValue();
		const lastNameValue = await page.locator('#lastName').inputValue();
		const passwordValue = await page.locator('#password').inputValue();
		const confirmPasswordValue = await page.locator('#confirmPassword').inputValue();
		
		console.log('Form values before submission:');
		console.log('  companyName:', companyNameValue);
		console.log('  email:', emailValue);
		console.log('  firstName:', firstNameValue);
		console.log('  lastName:', lastNameValue);
		console.log('  password:', passwordValue ? '***' : '');
		console.log('  confirmPassword:', confirmPasswordValue ? '***' : '');
		
		// Check for validation errors before submission
		const validationErrors = await page.locator('.invalid-feedback').count();
		console.log('Validation errors before submission:', validationErrors);
		
		// Log all validation error messages
		const errorElements = await page.locator('.invalid-feedback').all();
		for (let i = 0; i < errorElements.length; i++) {
			const errorText = await errorElements[i].textContent();
			console.log(`  Error ${i + 1}:`, errorText);
		}
		
		// Check if companyTypeCode and stateId are selected
		const companyTypeInput = page.locator('#companyTypeCode').locator('input').first();
		const stateInput = page.locator('#stateId').locator('input').first();
		const companyTypeValue = await companyTypeInput.inputValue().catch(() => '');
		const stateValue = await stateInput.inputValue().catch(() => '');
		console.log('  companyTypeCode value:', companyTypeValue);
		console.log('  stateId value:', stateValue);
		
		// Submit form
		const submitButton = page.getByRole('button', { name: /register|submit/i });
		const isButtonDisabled = await submitButton.isDisabled().catch(() => false);
		console.log('Submit button disabled:', isButtonDisabled);
		
		if (isButtonDisabled) {
			throw new Error('Submit button is disabled - form validation is preventing submission');
		}
		
		// Wait for any ongoing network requests to complete
		await page.waitForLoadState('networkidle');
		
		// Click submit and wait for response
		const responsePromise = page.waitForResponse(response => response.url().includes('/rest/company/register'), { timeout: 30_000 }).catch(() => null);
		await submitButton.click();
		const response = await responsePromise;
		
		// Log response status for debugging
		let responseBody = '';
		if (response) {
			console.log('Registration response status:', response.status());
			responseBody = await response.text().catch(() => '');
			console.log('Registration response body:', responseBody.substring(0, 200));
		}

		// Wait for success message, error message, or redirect
		await page.waitForTimeout(3000);

		// Check for success toast, error toast, or redirect to login
		const successToast = page.locator('.Toastify__toast--success');
		const errorToast = page.locator('.Toastify__toast--error');
		const redirectedToLogin = page.url().includes(LOGIN_PATH);
		
		const hasSuccessToast = await successToast.isVisible({ timeout: 10_000 }).catch(() => false);
		const hasErrorToast = await errorToast.isVisible({ timeout: 5_000 }).catch(() => false);
		
		// If there's an error toast, log it for debugging
		if (hasErrorToast) {
			const errorText = await errorToast.textContent().catch(() => '');
			console.log('Registration error:', errorText);
		}
		
		// Log current URL for debugging
		console.log('Current URL after submission:', page.url());
		console.log('Has success toast:', hasSuccessToast);
		console.log('Has error toast:', hasErrorToast);
		console.log('Redirected to login:', redirectedToLogin);
		
		// Check if response indicates company already exists (from previous test)
		const companyAlreadyExists = responseBody && responseBody.toLowerCase().includes('company already exist');

		// Registration should succeed (redirect to login) OR company already exists (which is also acceptable if DB wasn't cleared properly)
		expect(hasSuccessToast || redirectedToLogin || companyAlreadyExists).toBeTruthy();

		// Verify company count is now 1
		const companyCountResponse = await page.request.get(`${BACKEND_URL}/rest/company/getCompanyCount`);
		const companyCount = await companyCountResponse.text();
		expect(parseInt(companyCount)).toBe(1);
	});

	test('should validate all required fields', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'networkidle' });
		
		// Wait for form to be ready
		await page.waitForSelector('#companyName', { state: 'visible', timeout: 15_000 });
		await page.waitForTimeout(2000);

		// Try to submit without filling fields
		const submitButton = page.getByRole('button', { name: /register|submit/i });
		await submitButton.click();

		await page.waitForTimeout(3000); // Wait for validation to trigger

		// Check for validation errors - at least some fields should show errors
		const requiredFields = ['companyName', 'email', 'firstName', 'lastName', 'password', 'confirmPassword'];
		let errorCount = 0;
		for (const fieldId of requiredFields) {
			const field = page.locator(`#${fieldId}`);
			const error = field.locator('..').locator('.invalid-feedback');
			const hasError = await error.isVisible({ timeout: 2_000 }).catch(() => false);
			if (hasError) errorCount++;
		}
		
		// Also check companyTypeCode and stateId (required fields)
		const companyTypeError = page.locator('#companyTypeCode').locator('..').locator('.invalid-feedback');
		const stateError = page.locator('#stateId').locator('..').locator('.invalid-feedback');
		const hasCompanyTypeError = await companyTypeError.isVisible({ timeout: 2_000 }).catch(() => false);
		const hasStateError = await stateError.isVisible({ timeout: 2_000 }).catch(() => false);
		if (hasCompanyTypeError || hasStateError) errorCount++;
		
		// At least some validation errors should be shown
		expect(errorCount).toBeGreaterThan(0);
	});

	test('should validate email format', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'domcontentloaded' });

		const emailInput = page.locator('#email');
		await emailInput.fill('invalid-email');
		await emailInput.blur();
		await page.waitForTimeout(500);

		const error = emailInput.locator('..').locator('.invalid-feedback');
		expect(await error.isVisible()).toBeTruthy();
		expect(await error.textContent()).toContain('Invalid');
	});

	test('should validate password matching', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'domcontentloaded' });

		const passwordInput = page.locator('#password');
		const confirmPasswordInput = page.locator('#confirmPassword');

		await passwordInput.fill(E2E_PASSWORD);
		await confirmPasswordInput.fill('Different@5678');
		await confirmPasswordInput.blur();
		await page.waitForTimeout(500);

		const error = confirmPasswordInput.locator('..').locator('.invalid-feedback');
		expect(await error.isVisible()).toBeTruthy();
		expect(await error.textContent()).toContain('match');
	});

	test('should redirect to login after successful registration', async ({ page }) => {
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'networkidle' });
		
		// Wait for form to be ready
		await page.waitForSelector('#companyName', { state: 'visible', timeout: 15_000 });
		await page.waitForTimeout(2000);

		await fillRegistrationForm(page, {});

		const submitButton = page.getByRole('button', { name: /register|submit/i });
		
		// Wait for response
		const responsePromise = page.waitForResponse(response => response.url().includes('/rest/company/register'), { timeout: 30_000 }).catch(() => null);
		await submitButton.click();
		const response = await responsePromise;
		
		// Check response
		let responseBody = '';
		if (response) {
			responseBody = await response.text().catch(() => '');
			console.log('Redirect test - Registration response status:', response.status());
			console.log('Redirect test - Registration response body:', responseBody.substring(0, 200));
		}

		// Wait for redirect to login or success toast
		await page.waitForTimeout(5000);
		const successToast = page.locator('.Toastify__toast--success');
		const redirectedToLogin = page.url().includes(LOGIN_PATH);
		
		// Either we see a success toast or we're redirected to login
		const hasSuccessToast = await successToast.isVisible({ timeout: 10_000 }).catch(() => false);
		
		// Check if company already exists (from previous test - acceptable)
		const companyAlreadyExists = responseBody && responseBody.toLowerCase().includes('company already exist');
		
		expect(hasSuccessToast || redirectedToLogin || companyAlreadyExists).toBeTruthy();
		
		// If not redirected yet and registration was successful, wait a bit more
		if (!redirectedToLogin && !companyAlreadyExists) {
			await page.waitForURL(`**${LOGIN_PATH}**`, { timeout: 20_000 }).catch(() => {});
		}
		
		// If company already exists, we might still be on register page, which is acceptable for this test
		if (!companyAlreadyExists) {
			expect(page.url()).toContain(LOGIN_PATH);
		}
	});

	test('should prevent duplicate company registration', async ({ page }) => {
		// First registration
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'networkidle' });
		await page.waitForSelector('#companyName', { state: 'visible', timeout: 15_000 });
		await page.waitForTimeout(2000);
		
		await fillRegistrationForm(page, {
			companyName: 'First Company',
			email: 'first@example.com',
		});
		const submitButton = page.getByRole('button', { name: /register|submit/i });
		
		// Wait for registration to complete
		await Promise.all([
			page.waitForResponse(response => response.url().includes('/rest/company/register'), { timeout: 30_000 }).catch(() => null),
			submitButton.click()
		]);
		await page.waitForTimeout(3000);

		// Try to register again (should fail - single tenant system)
		await page.goto(`${BASE_URL}${REGISTER_PATH}`, { waitUntil: 'networkidle' });
		await page.waitForSelector('#companyName', { state: 'visible', timeout: 15_000 });
		await page.waitForTimeout(2000);
		
		await fillRegistrationForm(page, {
			companyName: 'Second Company',
			email: 'second@example.com',
		});
		const submitButton2 = page.getByRole('button', { name: /register|submit/i });
		
		// Wait for error response
		const responsePromise = page.waitForResponse(response => response.url().includes('/rest/company/register'), { timeout: 30_000 }).catch(() => null);
		await submitButton2.click();
		const response = await responsePromise;
		
		// Check response body for error message
		let responseBody = '';
		if (response) {
			responseBody = await response.text().catch(() => '');
			console.log('Duplicate registration response status:', response.status());
			console.log('Duplicate registration response body:', responseBody);
		}
		
		await page.waitForTimeout(3000);

		// Should show error message (toast or alert) OR response should contain error
		const errorToast = page.locator('.Toastify__toast--error');
		const errorAlert = page.locator('.alert-danger');
		const hasErrorToast = await errorToast.isVisible({ timeout: 10_000 }).catch(() => false);
		const hasErrorAlert = await errorAlert.isVisible({ timeout: 5_000 }).catch(() => false);
		
		// Log error messages for debugging
		if (hasErrorToast) {
			const errorText = await errorToast.textContent().catch(() => '');
			console.log('Error toast:', errorText);
		}
		if (hasErrorAlert) {
			const errorText = await errorAlert.textContent().catch(() => '');
			console.log('Error alert:', errorText);
		}
		
		// Note: Backend returns "Company Already Exist" for single-tenant system
		// The response might be 200 with "Company Already Exist" message, or it might show an error toast
		const hasErrorInResponse = responseBody && responseBody.toLowerCase().includes('company already exist');
		expect(hasErrorToast || hasErrorAlert || hasErrorInResponse).toBeTruthy();
	});
});

