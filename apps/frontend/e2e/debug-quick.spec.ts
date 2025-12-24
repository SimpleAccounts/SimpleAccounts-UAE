import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('quick check company type dropdown', async ({ page }) => {
  test.setTimeout(60000);

  // Capture errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(`${BASE_URL}/register`);
  await page.waitForSelector('#companyName', { timeout: 30000 });

  // Fill company name
  await page.locator('#companyName').fill('Test Company');

  // Click company type
  const selectInput = page.locator('input[aria-label="Select company type"]');
  await selectInput.waitFor({ timeout: 10000 });
  await selectInput.first().click({ force: true });
  await page.waitForTimeout(1000);

  // Check for menu
  const menu = page.locator('div[class*="menu"]');
  const menuVisible = await menu.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Menu visible:', menuVisible);

  // Check for errors
  console.log('Errors count:', errors.length);
  for (const err of errors.slice(0, 3)) {
    console.log('Error:', err.substring(0, 300));
  }

  // Take screenshot
  await page.screenshot({ path: 'quick-test.png', fullPage: true });

  expect(menuVisible).toBe(true);
});
