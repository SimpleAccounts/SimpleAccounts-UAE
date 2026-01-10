import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug form validation on submit', async ({ page }) => {
  // Capture console logs including validation errors
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  await login(page, username, password);
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Inject code to log onSubmit behavior
  await page.evaluate(() => {
    // Override console methods to see validation
    const originalError = console.error;
    (window as any).__validationErrors = [];

    console.error = function (...args) {
      (window as any).__validationErrors.push(args);
      originalError.apply(console, args);
    };
  });

  // Fill form
  await page.fill('input[placeholder*="First Name"]', 'ValidationTest');
  await page.fill('input[placeholder*="Last Name"]', 'User');
  await page.fill('input[type="email"]', `validation${Date.now()}@example.com`);

  // Select Contact Type
  const contactTypeTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Contact Type")'),
    })
    .first();
  await contactTypeTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: /customer/i }).click();
  await page.waitForTimeout(300);

  // Select Currency
  const currencyTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Currency")'),
    })
    .first();
  await currencyTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(300);

  // Select Tax Treatment
  const taxTreatmentTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Tax Treatment")'),
    })
    .first();
  await taxTreatmentTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(300);

  // Wait a moment
  await page.waitForTimeout(1000);

  // Click submit and wait
  console.log('Clicking submit button...');
  const saveButton = page.getByRole('button', { name: /save|create|submit/i }).first();
  await saveButton.click();
  await page.waitForTimeout(3000);

  // Check for visible error messages
  const errorMessages = await page
    .locator('[class*="error"], .text-red-500, [role="alert"]')
    .allTextContents();

  console.log('\n=== VISIBLE ERROR MESSAGES ===');
  if (errorMessages.length > 0) {
    errorMessages.forEach((msg, i) => {
      if (msg.trim()) console.log(`${i + 1}. ${msg.trim()}`);
    });
  } else {
    console.log('No visible error messages found');
  }

  // Check for form field errors
  const fieldErrors = await page.evaluate(() => {
    const errors: any[] = [];
    // Look for fields with aria-invalid
    document.querySelectorAll('[aria-invalid="true"]').forEach(el => {
      const label = el.getAttribute('name') || el.getAttribute('placeholder') || 'unknown';
      errors.push({ field: label, element: el.tagName });
    });
    return errors;
  });

  console.log('\n=== INVALID FIELDS ===');
  if (fieldErrors.length > 0) {
    fieldErrors.forEach(err => console.log(`- ${err.field} (${err.element})`));
  } else {
    console.log('No invalid fields');
  }

  console.log('\n=== CURRENT URL ===');
  console.log(page.url());

  // Get validation errors from window object
  const validationErrors = await page.evaluate(() => {
    return (window as any).__validationErrors || [];
  });

  if (validationErrors.length > 0) {
    console.log('\n=== CAPTURED VALIDATION ERRORS ===');
    console.log(JSON.stringify(validationErrors, null, 2));
  }
});
