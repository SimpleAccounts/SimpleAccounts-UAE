import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug address fields availability', async ({ page }) => {
  await login(page, username, password);
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll to bottom to see address section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  console.log('\n=== LOOKING FOR ADDRESS INPUTS ===');

  // Check for address input
  const addressInputs = await page
    .locator('input[placeholder*="Address"], input[name*="address"]')
    .count();
  console.log(`Found ${addressInputs} address inputs`);

  if (addressInputs > 0) {
    for (let i = 0; i < Math.min(addressInputs, 3); i++) {
      const input = page.locator('input[placeholder*="Address"], input[name*="address"]').nth(i);
      const placeholder = await input.getAttribute('placeholder').catch(() => 'N/A');
      const name = await input.getAttribute('name').catch(() => 'N/A');
      const visible = await input.isVisible().catch(() => false);
      console.log(`  [${i}] Placeholder: "${placeholder}", Name: "${name}", Visible: ${visible}`);
    }
  }

  console.log('\n=== LOOKING FOR POSTAL/ZIP INPUTS ===');
  const postalInputs = await page
    .locator(
      'input[placeholder*="Postal"], input[placeholder*="ZIP"], input[placeholder*="P.O"], input[name*="postZipCode"], input[name*="zipCode"]'
    )
    .count();
  console.log(`Found ${postalInputs} postal/zip inputs`);

  if (postalInputs > 0) {
    for (let i = 0; i < Math.min(postalInputs, 3); i++) {
      const input = page
        .locator(
          'input[placeholder*="Postal"], input[placeholder*="ZIP"], input[placeholder*="P.O"], input[name*="postZipCode"], input[name*="zipCode"]'
        )
        .nth(i);
      const placeholder = await input.getAttribute('placeholder').catch(() => 'N/A');
      const name = await input.getAttribute('name').catch(() => 'N/A');
      const visible = await input.isVisible().catch(() => false);
      console.log(`  [${i}] Placeholder: "${placeholder}", Name: "${name}", Visible: ${visible}`);
    }
  }

  console.log('\n=== LOOKING FOR COUNTRY DROPDOWNS ===');
  const countryDropdowns = await page.getByRole('combobox').count();
  console.log(`Found ${countryDropdowns} combobox elements total`);

  // List all comboboxes
  for (let i = 0; i < countryDropdowns; i++) {
    const dropdown = page.getByRole('combobox').nth(i);
    const text = await dropdown.textContent().catch(() => '');
    const visible = await dropdown.isVisible().catch(() => false);
    console.log(`  [${i}] Text: "${text.substring(0, 50)}", Visible: ${visible}`);
  }

  // Take screenshot
  await page.screenshot({ path: 'e2e/address-section.png', fullPage: true });
  console.log('\nScreenshot saved to e2e/address-section.png');

  // Check if there's a checkbox for "same as billing"
  const sameAsCheckbox = page.locator('input[type="checkbox"]');
  const checkboxCount = await sameAsCheckbox.count();
  console.log(`\n=== FOUND ${checkboxCount} CHECKBOXES ===`);

  if (checkboxCount > 0) {
    for (let i = 0; i < Math.min(checkboxCount, 5); i++) {
      const checkbox = sameAsCheckbox.nth(i);
      const label = await checkbox.evaluate(el => {
        const labelEl = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
        return labelEl ? labelEl.textContent : 'No label';
      });
      const checked = await checkbox.isChecked().catch(() => false);
      const visible = await checkbox.isVisible().catch(() => false);
      console.log(
        `  [${i}] Label: "${label?.substring(0, 60)}", Checked: ${checked}, Visible: ${visible}`
      );
    }
  }
});
