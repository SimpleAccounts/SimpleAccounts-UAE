import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug form submission errors', async ({ page }) => {
  // Capture console errors and logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  // Capture network requests
  const apiRequests: any[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('/contact')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData(),
      });
    }
  });

  // Capture network responses
  const apiResponses: any[] = [];
  page.on('response', async response => {
    if (response.url().includes('/api/') || response.url().includes('/contact')) {
      try {
        const body = await response.text().catch(() => 'Could not read body');
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          body: body.substring(0, 500), // First 500 chars
        });
      } catch (e) {
        // Ignore
      }
    }
  });

  await login(page, username, password);
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Fill form
  await page.fill('input[placeholder*="First Name"]', 'DebugTest');
  await page.fill('input[placeholder*="Last Name"]', 'User');
  await page.fill('input[type="email"]', `debugtest${Date.now()}@example.com`);

  // Select Contact Type
  const contactTypeTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Contact Type")'),
    })
    .first();
  if (await contactTypeTrigger.isVisible().catch(() => false)) {
    await contactTypeTrigger.click();
    await page.waitForTimeout(300);
    await page.getByRole('option').first().click();
    await page.waitForTimeout(300);
  }

  // Select Currency
  const currencyTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Currency")'),
    })
    .first();
  if (await currencyTrigger.isVisible().catch(() => false)) {
    await currencyTrigger.click();
    await page.waitForTimeout(300);
    await page.getByRole('option').first().click();
    await page.waitForTimeout(300);
  }

  // Select Tax Treatment
  const taxTreatmentTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Tax Treatment")'),
    })
    .first();
  if (await taxTreatmentTrigger.isVisible().catch(() => false)) {
    await taxTreatmentTrigger.click();
    await page.waitForTimeout(300);
    await page.getByRole('option').first().click();
    await page.waitForTimeout(300);
  }

  // Click submit
  const saveButton = page.getByRole('button', { name: /save|create|submit/i }).first();
  await saveButton.click();
  await page.waitForTimeout(3000);

  // Check for validation errors
  const validationErrors = await page
    .locator('[class*="error"], [aria-invalid="true"], .text-red-500')
    .allTextContents();

  console.log('\n=== VALIDATION ERRORS ===');
  if (validationErrors.length > 0) {
    validationErrors.forEach(err => console.log(err));
  } else {
    console.log('No validation errors found');
  }

  console.log('\n=== API REQUESTS ===');
  apiRequests.forEach(req => {
    console.log(`${req.method} ${req.url}`);
    if (req.postData) {
      console.log('POST Data:', req.postData.substring(0, 300));
    }
  });

  console.log('\n=== API RESPONSES ===');
  apiResponses.forEach(res => {
    console.log(`${res.status} ${res.statusText} - ${res.url}`);
    console.log('Body:', res.body);
  });

  console.log('\n=== CONSOLE LOGS (LAST 20) ===');
  consoleLogs.slice(-20).forEach(log => console.log(log));

  console.log('\n=== FINAL URL ===');
  console.log(page.url());

  // Take screenshot
  await page.screenshot({ path: 'e2e/after-submit-debug.png', fullPage: true });
  console.log('\nScreenshot saved to e2e/after-submit-debug.png');
});
