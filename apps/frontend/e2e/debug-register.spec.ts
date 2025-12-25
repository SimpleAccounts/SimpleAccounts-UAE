import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('debug registration page DOM', async ({ page }) => {
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for data to load

  // Take screenshot
  await page.screenshot({ path: 'debug-register.png', fullPage: true });

  // Find all inputs with aria-label
  const ariaLabelInputs = await page.locator('input[aria-label]').all();
  console.log('Inputs with aria-label:', ariaLabelInputs.length);
  for (const input of ariaLabelInputs) {
    const label = await input.getAttribute('aria-label');
    console.log('  - aria-label:', label);
  }

  // Find all react-select controls
  const reactSelectControls = await page.locator('div[class*="control"]').all();
  console.log('React-select controls:', reactSelectControls.length);

  // Find all placeholders
  const placeholders = await page.locator('div[class*="placeholder"]').all();
  console.log('Placeholders:', placeholders.length);
  for (const p of placeholders) {
    const text = await p.textContent();
    console.log('  - placeholder:', text);
  }

  // Find company type select by label text
  const companyTypeLabel = page.locator('text=Company / Business Type');
  const hasLabel = await companyTypeLabel.isVisible().catch(() => false);
  console.log('Has Company/Business Type label:', hasLabel);

  // Try to find the select near this label
  if (hasLabel) {
    const formItem = companyTypeLabel
      .locator('xpath=ancestor::*[contains(@class, "FormItem") or contains(@class, "form-item")]')
      .first();
    const formItemVisible = await formItem.isVisible().catch(() => false);
    console.log('Form item visible:', formItemVisible);
  }

  expect(true).toBe(true);
});
