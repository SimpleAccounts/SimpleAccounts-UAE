import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug onSubmit handler execution', async ({ page }) => {
  await login(page, username, password);
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Inject code to intercept form submission
  await page.evaluate(() => {
    (window as any).__submitDebug = [];

    // Override console methods to capture
    const originalLog = console.log;
    const originalError = console.error;

    console.log = function (...args) {
      (window as any).__submitDebug.push(['LOG', ...args]);
      originalLog.apply(console, args);
    };

    console.error = function (...args) {
      (window as any).__submitDebug.push(['ERROR', ...args]);
      originalError.apply(console, args);
    };

    // Try to find and wrap the form's onSubmit
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', e => {
        (window as any).__submitDebug.push(['FORM_SUBMIT_EVENT', 'Form submit event fired']);
      });
    }
  });

  // Use the helper to fill the form
  const timestamp = Date.now();
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Fill form manually with all required fields
  await page.fill('input[placeholder*="First Name"]', 'DebugSubmit');
  await page.fill('input[placeholder*="Last Name"]', 'Test');
  await page.fill('input[type="email"]', `debugsubmit${timestamp}@example.com`);

  // Select dropdowns
  await page.getByRole('combobox').nth(0).click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: /customer/i }).click();
  await page.waitForTimeout(300);

  await page.getByRole('combobox').nth(1).click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(300);

  await page.getByRole('combobox').nth(2).click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(500);

  // Scroll and fill address
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  // Check "same as billing" checkbox by clicking the label text
  const sameAsText = page.getByText('Shipping Address Is Same As Billing Address');
  if (await sameAsText.isVisible().catch(() => false)) {
    await sameAsText.click({ force: true });
    await page.waitForTimeout(500);
  }

  await page.locator('input[name="billingAddress.address"]').fill('Debug Street 456');
  await page.locator('input[name="postZipCode"]').first().fill('54321');

  await page.getByRole('combobox').nth(3).click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(500);

  await page.getByRole('combobox').nth(4).click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(300);

  console.log('\n=== CLICKING SUBMIT ===');
  const submitButton = page.getByRole('button', { name: /save|create|submit/i }).first();
  await submitButton.click();
  await page.waitForTimeout(3000);

  // Get debug info from window object
  const submitDebug = await page.evaluate(() => {
    return (window as any).__submitDebug || [];
  });

  console.log('\n=== SUBMIT DEBUG INFO ===');
  if (submitDebug.length > 0) {
    submitDebug.forEach((entry: any[]) => {
      console.log(entry.join(' '));
    });
  } else {
    console.log('No debug info captured');
  }

  console.log(`\nFinal URL: ${page.url()}`);

  // Take screenshot
  await page.screenshot({ path: 'e2e/onsubmit-debug.png', fullPage: true });
  console.log('Screenshot saved to e2e/onsubmit-debug.png');
});
