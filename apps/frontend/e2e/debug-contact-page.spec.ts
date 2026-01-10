import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug contact create page', async ({ page }) => {
  // Capture console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });

  // Capture page errors
  const pageErrors: string[] = [];
  page.on('pageerror', err => {
    pageErrors.push(`PAGE ERROR: ${err.message}\n${err.stack}`);
  });

  // Login
  await login(page, username, password);

  // Navigate to create contact page
  console.log('Navigating to create contact page...');
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });

  // Wait a bit for page to load
  await page.waitForTimeout(5000);

  // Log errors
  console.log('\n=== CONSOLE ERRORS ===');
  consoleErrors.forEach(err => console.log(err));

  console.log('\n=== PAGE ERRORS ===');
  pageErrors.forEach(err => console.log(err));

  // Take screenshot
  await page.screenshot({ path: 'e2e/debug-contact-page.png', fullPage: true });
  console.log('\nScreenshot saved to e2e/debug-contact-page.png');

  // Check what elements are visible
  const firstNameInput = page.locator('input[placeholder*="First Name"]');
  const lastNameInput = page.locator('input[placeholder*="Last Name"]');
  const emailInput = page.locator('input[type="email"]');

  console.log('\n=== FORM ELEMENTS ===');
  console.log('First Name input visible:', await firstNameInput.isVisible().catch(() => false));
  console.log('Last Name input visible:', await lastNameInput.isVisible().catch(() => false));
  console.log('Email input visible:', await emailInput.isVisible().catch(() => false));

  // Check for any error messages on page
  const errorMessages = await page.locator('[class*="error"], [class*="Error"]').allTextContents();
  if (errorMessages.length > 0) {
    console.log('\n=== ERROR MESSAGES ON PAGE ===');
    errorMessages.forEach(msg => console.log(msg));
  }
});
