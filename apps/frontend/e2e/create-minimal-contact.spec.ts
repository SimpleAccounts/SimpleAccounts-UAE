import { test, expect } from '@playwright/test';

const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const CONTACTS_PATH = process.env.E2E_CONTACTS_PATH || '/admin/master/contact';
const CREATE_CONTACT_PATH = `${CONTACTS_PATH}/create`;

// Helper function to perform login
async function login(page: any, username: string, password: string) {
  await page.goto(LOGIN_PATH);
  await page.fill('input#username', username);
  await page.fill('input#password', password);

  const loginButton = page.getByRole('button', { name: /log in/i });
  const buttonHandle = await loginButton.elementHandle();
  if (buttonHandle) {
    await loginButton.click({ timeout: 30_000 });
  } else {
    await page.keyboard.press('Enter', { delay: 200 });
  }

  const normalizedPostLoginPath = POST_LOGIN_PATH.startsWith('/')
    ? POST_LOGIN_PATH
    : `/${POST_LOGIN_PATH}`;
  await page.waitForURL(`**${normalizedPostLoginPath}**`, { timeout: 30_000 });
}

test.describe('Create Minimal Contact for Testing', () => {
  const username = process.env.E2E_USERNAME || 'test@example.com';
  const password = process.env.E2E_PASSWORD || 'Test@1234';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should create a minimal contact (customer) for API testing', async ({ page }) => {
    // Navigate to create contact page
    await page.goto(CREATE_CONTACT_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Fill in minimal required fields
    const timestamp = Date.now();
    const contactName = `Minimal Test Customer ${timestamp}`;

    // Contact Type: Customer (value 2)
    await page.selectOption('select[name="contactType"]', '2');

    // First Name
    await page.fill('input[name="firstName"]', `Minimal${timestamp}`);

    // Last Name
    await page.fill('input[name="lastName"]', 'Test');

    // Email (required)
    await page.fill('input[name="email"]', `minimal.test.${timestamp}@example.com`);

    // Mobile Number (required)
    await page.fill('input[name="mobileNumber"]', `+971501234${timestamp.toString().slice(-4)}`);

    // Wait for form to be ready
    await page.waitForTimeout(1000);

    // Submit the form
    const submitButton = page.getByRole('button', { name: /save|submit|create/i });
    await submitButton.click({ timeout: 10_000 });

    // Wait for navigation back to list or success message
    await page.waitForTimeout(3000);

    // Verify contact was created (check for success message or navigation)
    const currentUrl = page.url();
    console.log(`Contact creation completed. Current URL: ${currentUrl}`);

    // Check if we're back on the list page or see a success message
    if (currentUrl.includes('/contact') && !currentUrl.includes('/create')) {
      console.log('✅ Successfully navigated to contact list');
    } else {
      // Look for success toast/notification
      const successMessage = page.locator('text=/success|created|saved/i').first();
      if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✅ Success message displayed');
      }
    }

    // Navigate to contact list to verify
    await page.goto(CONTACTS_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify the contact appears in the list
    const contactInList = page
      .locator(`text=${contactName}`)
      .or(page.locator(`text=Minimal${timestamp}`));
    await expect(contactInList.first()).toBeVisible({ timeout: 10_000 });

    console.log(`✅ Minimal contact "${contactName}" created successfully`);
  });

  test('should create a minimal contact (supplier) for API testing', async ({ page }) => {
    // Navigate to create contact page
    await page.goto(CREATE_CONTACT_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Fill in minimal required fields
    const timestamp = Date.now();
    const contactName = `Minimal Test Supplier ${timestamp}`;

    // Contact Type: Supplier (value 1)
    await page.selectOption('select[name="contactType"]', '1');

    // First Name
    await page.fill('input[name="firstName"]', `Supplier${timestamp}`);

    // Last Name
    await page.fill('input[name="lastName"]', 'Test');

    // Email (required)
    await page.fill('input[name="email"]', `supplier.test.${timestamp}@example.com`);

    // Mobile Number (required)
    await page.fill('input[name="mobileNumber"]', `+971502345${timestamp.toString().slice(-4)}`);

    // Wait for form to be ready
    await page.waitForTimeout(1000);

    // Submit the form
    const submitButton = page.getByRole('button', { name: /save|submit|create/i });
    await submitButton.click({ timeout: 10_000 });

    // Wait for navigation back to list or success message
    await page.waitForTimeout(3000);

    // Navigate to contact list to verify
    await page.goto(CONTACTS_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify the contact appears in the list
    const contactInList = page.locator(`text=Supplier${timestamp}`).first();
    await expect(contactInList).toBeVisible({ timeout: 10_000 });

    console.log(`✅ Minimal supplier contact created successfully`);
  });
});
