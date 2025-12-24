import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('capture JS error on company type click', async ({ page }) => {
  // Capture console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture page errors
  const pageErrors: string[] = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });
  
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Fill company name
  await page.locator('#companyName').fill('Test Company');
  await page.waitForTimeout(500);
  
  console.log('Console errors before click:', consoleErrors.length);
  console.log('Page errors before click:', pageErrors.length);
  
  // Click company type
  const selectInput = page.locator('input[aria-label="Select company type"]');
  await selectInput.first().click({ force: true });
  await page.waitForTimeout(2000);
  
  console.log('Console errors after click:', consoleErrors.length);
  for (const err of consoleErrors) {
    console.log('Console Error:', err.substring(0, 500));
  }
  
  console.log('Page errors after click:', pageErrors.length);
  for (const err of pageErrors) {
    console.log('Page Error:', err.substring(0, 500));
  }
  
  // Click on error details if visible
  const errorDetails = page.locator('text=Error Details');
  if (await errorDetails.isVisible().catch(() => false)) {
    await errorDetails.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'debug-error-details.png', fullPage: true });
    
    // Try to get error text
    const errorText = await page.locator('pre, code, .error-message').first().textContent().catch(() => null);
    if (errorText) {
      console.log('Error text:', errorText.substring(0, 1000));
    }
  }
  
  expect(true).toBe(true);
});
