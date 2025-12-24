import { test } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('debug company type selection', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto(`${BASE_URL}/register`);
  await page.waitForSelector('#companyName', { timeout: 30000 });

  await page.locator('#companyName').fill('Debug Test Company');

  // Click to open dropdown
  await page.locator('input[aria-label="Select company type"]').click();
  await page.waitForTimeout(500);

  // List all options
  const options = await page.locator('div[class*="option"]').all();
  console.log('Options count:', options.length);
  for (let i = 0; i < Math.min(options.length, 5); i++) {
    const text = await options[i].textContent();
    console.log(`  Option ${i}:`, text);
  }

  // The first option might be disabled "Select Company Type"
  // Let's click the second option which should be a real type
  if (options.length > 1) {
    await options[1].click();
  } else if (options.length > 0) {
    await options[0].click();
  }

  await page.waitForTimeout(500);

  // Check what's selected now
  const selectedValue = await page
    .locator('div[class*="singleValue"]')
    .textContent()
    .catch(() => 'not found');
  console.log('Selected value:', selectedValue);

  await page.screenshot({ path: 'debug-after-select.png', fullPage: true });
});
