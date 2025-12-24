import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('debug step 1 to step 2 transition', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto(`${BASE_URL}/register`);
  await page.waitForSelector('#companyName', { timeout: 30000 });

  // Step 1: Fill all required fields
  await page.locator('#companyName').fill('Debug Test Company');

  // Company type
  await page.locator('input[aria-label="Select company type"]').click();
  await page.waitForTimeout(500);
  await page.locator('div[class*="option"]').first().click();
  await page.waitForTimeout(300);

  // Address
  await page.locator('#companyAddress1').fill('123 Test Street');

  await page.screenshot({ path: 'debug-step1-filled.png', fullPage: true });

  // Check for validation errors
  const errors = await page.locator('.text-red-500, .error, [class*="error"]').all();
  console.log('Validation errors:', errors.length);

  // Click Next
  const nextButton = page.locator('button:has-text("Next")');
  console.log('Next button visible:', await nextButton.isVisible());
  console.log('Next button enabled:', await nextButton.isEnabled());

  await nextButton.click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'debug-after-next.png', fullPage: true });

  // Check what step we're on
  const step2Heading = page.locator('text=Location & VAT');
  const onStep2 = await step2Heading.isVisible().catch(() => false);
  console.log('On step 2:', onStep2);

  // Check for emirate select
  const emirateSelect = page.locator('input[aria-label="Select emirate"]');
  const emirateVisible = await emirateSelect.isVisible().catch(() => false);
  console.log('Emirate select visible:', emirateVisible);

  expect(onStep2).toBe(true);
});
