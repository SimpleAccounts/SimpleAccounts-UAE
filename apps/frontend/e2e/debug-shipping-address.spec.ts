import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug shipping address requirement', async ({ page }) => {
  // Intercept console.error to catch any JS errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await login(page, username, password);
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Fill all basic fields (reusing successful flow from previous test)
  await page.fill('input[placeholder*="First Name"]', 'ShipTest');
  await page.fill('input[placeholder*="Last Name"]', 'User');
  await page.fill('input[type="email"]', `shiptest${Date.now()}@example.com`);

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

  // Scroll to address
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  console.log('\n=== LOOKING FOR "SAME AS" CHECKBOX ===');

  // Look for checkbox with various possible labels
  const checkboxes = page.locator('input[type="checkbox"]');
  const checkboxCount = await checkboxes.count();
  console.log(`Found ${checkboxCount} checkboxes`);

  for (let i = 0; i < checkboxCount; i++) {
    const checkbox = checkboxes.nth(i);
    const visible = await checkbox.isVisible().catch(() => false);
    const checked = await checkbox.isChecked().catch(() => false);

    // Try to find associated label
    const labelText = await checkbox.evaluate(el => {
      // Check parent label
      const parentLabel = el.closest('label');
      if (parentLabel) return parentLabel.textContent;

      // Check label with for attribute
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label) return label.textContent;
      }

      // Check nearby text
      const parent = el.parentElement;
      return parent ? parent.textContent : '';
    });

    console.log(
      `  [${i}] Label: "${labelText?.substring(0, 80)}", Visible: ${visible}, Checked: ${checked}`
    );

    // If it looks like "same as billing", check it
    if (
      labelText &&
      (labelText.toLowerCase().includes('same') ||
        labelText.toLowerCase().includes('billing') ||
        labelText.toLowerCase().includes('shipping'))
    ) {
      console.log(`  → This looks like the "same as billing" checkbox!`);

      if (visible && !checked) {
        await checkbox.click();
        await page.waitForTimeout(500);
        console.log(`  ✓ Checked the checkbox`);

        const nowChecked = await checkbox.isChecked();
        console.log(`  → Checkbox is now ${nowChecked ? 'CHECKED' : 'UNCHECKED'}`);
      }
    }
  }

  // Fill billing address fields
  await page.locator('input[name="billingAddress.address"]').fill('Test Street 123');
  await page.locator('input[name="postZipCode"]').first().fill('12345');

  await page.getByRole('combobox').nth(3).click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(500);

  await page.getByRole('combobox').nth(4).click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(300);

  console.log('\n=== CHECKING FOR SHIPPING ADDRESS FIELDS ===');

  // Look for shipping address fields
  const shippingAddressInput = page.locator('input[name="shippingAddress.address"]');
  const shippingAddressVisible = await shippingAddressInput.isVisible().catch(() => false);
  console.log(`Shipping address input visible: ${shippingAddressVisible}`);

  if (shippingAddressVisible) {
    console.log('⚠️  Shipping address fields are visible - need to fill them!');
  } else {
    console.log('✓ Shipping address fields are hidden (probably using "same as billing")');
  }

  // Try to submit
  const submitButton = page.getByRole('button', { name: /save|create|submit/i }).first();
  await submitButton.click();
  await page.waitForTimeout(3000);

  console.log('\n=== RESULT ===');
  console.log(`URL after submit: ${page.url()}`);

  if (consoleErrors.length > 0) {
    console.log('\nConsole errors during submission:');
    consoleErrors.forEach(err => console.log(`  - ${err}`));
  }

  // Take screenshot
  await page.screenshot({ path: 'e2e/shipping-address-test.png', fullPage: true });
  console.log('\nScreenshot saved to e2e/shipping-address-test.png');
});
