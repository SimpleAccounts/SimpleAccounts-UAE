import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug address dropdown selections', async ({ page }) => {
  await login(page, username, password);
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Fill basic required fields first
  console.log('\n=== FILLING BASIC FIELDS ===');
  await page.fill('input[placeholder*="First Name"]', 'Test');
  await page.fill('input[placeholder*="Last Name"]', 'User');
  await page.fill('input[type="email"]', 'test@example.com');

  // Select Contact Type (1st combobox)
  console.log('Selecting Contact Type...');
  const contactTypeTrigger = page.getByRole('combobox').first();
  await contactTypeTrigger.click();
  await page.waitForTimeout(500);
  const customerOption = page.getByRole('option', { name: /customer/i });
  if (await customerOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    await customerOption.click();
    await page.waitForTimeout(300);
  }

  // Select Currency (2nd combobox)
  console.log('Selecting Currency...');
  const currencyTrigger = page.getByRole('combobox').nth(1);
  await currencyTrigger.click();
  await page.waitForTimeout(500);
  const firstCurrency = page.getByRole('option').first();
  if (await firstCurrency.isVisible({ timeout: 2000 }).catch(() => false)) {
    await firstCurrency.click();
    await page.waitForTimeout(300);
  }

  // Select Tax Treatment (3rd combobox) - CRITICAL: This populates country list
  console.log('Selecting Tax Treatment...');
  const taxTrigger = page.getByRole('combobox').nth(2);
  await taxTrigger.click();
  await page.waitForTimeout(500);
  // Try to find non-VAT option
  const unregisteredOption = page.getByRole('option', {
    name: /unregistered|out of scope|exempt/i,
  });
  if (await unregisteredOption.isVisible({ timeout: 1000 }).catch(() => false)) {
    await unregisteredOption.click();
    console.log('Selected non-VAT tax treatment');
  } else {
    const secondOption = page.getByRole('option').nth(1);
    await secondOption.click();
    console.log('Selected second tax treatment option');
  }
  await page.waitForTimeout(1500); // Wait for resetCountryList() to populate country options

  // Scroll to address section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  // Fill address and postal code
  await page.locator('input[name="billingAddress.address"]').fill('Test Street 456');
  await page.locator('input[name="postZipCode"]').first().fill('99999');

  console.log('\n=== BEFORE COUNTRY SELECTION ===');
  let formData = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return null;
    // Try to get react-hook-form values from the form's data
    return {
      note: 'Form state before country selection',
    };
  });
  console.log(formData);

  // Select country
  console.log('\n=== SELECTING COUNTRY ===');
  const allComboboxes = page.getByRole('combobox');
  const count = await allComboboxes.count();
  console.log(`Total comboboxes: ${count}`);

  if (count > 3) {
    const countryTrigger = allComboboxes.nth(3);
    console.log('Clicking country dropdown...');
    await countryTrigger.click();
    await page.waitForTimeout(500);

    const options = page.getByRole('option');
    const optionCount = await options.count();
    console.log(`Country options available: ${optionCount}`);

    if (optionCount > 0) {
      // Skip first option (placeholder), select second option (actual country)
      const countryOption = options.nth(1);
      const optionText = await countryOption.textContent();
      console.log(`Selecting option at index 1: "${optionText}"`);
      await countryOption.click();
      await page.waitForTimeout(1000);

      // Verify selection
      const selectedText = await countryTrigger.textContent();
      console.log(`Country dropdown now shows: "${selectedText}"`);
    }
  }

  console.log('\n=== AFTER COUNTRY SELECTION ===');
  await page.waitForTimeout(1000);

  // Check form values by inspecting inputs
  const billingAddressValue = await page
    .locator('input[name="billingAddress.address"]')
    .inputValue();
  const postalCodeValue = await page.locator('input[name="postZipCode"]').first().inputValue();

  console.log('Billing address input:', billingAddressValue);
  console.log('Postal code input:', postalCodeValue);

  // Try to find country and state values in hidden inputs or data attributes
  const hiddenInputs = await page.locator('input[type="hidden"]').count();
  console.log(`Hidden inputs found: ${hiddenInputs}`);

  if (hiddenInputs > 0) {
    for (let i = 0; i < Math.min(hiddenInputs, 5); i++) {
      const input = page.locator('input[type="hidden"]').nth(i);
      const name = await input.getAttribute('name');
      const value = await input.inputValue();
      console.log(`  Hidden[${i}] name="${name}" value="${value}"`);
    }
  }

  // Select state/emirate
  console.log('\n=== SELECTING STATE/EMIRATE ===');
  const updatedCount = await page.getByRole('combobox').count();
  console.log(`Total comboboxes after country: ${updatedCount}`);

  if (updatedCount > 4) {
    const stateTrigger = page.getByRole('combobox').nth(4);
    console.log('Clicking state dropdown...');
    await stateTrigger.click();
    await page.waitForTimeout(500);

    const stateOptions = page.getByRole('option');
    const stateOptionCount = await stateOptions.count();
    console.log(`State options available: ${stateOptionCount}`);

    if (stateOptionCount > 0) {
      // Skip first option (placeholder), select second option (actual state)
      const stateOption = stateOptions.nth(1);
      const stateText = await stateOption.textContent();
      console.log(`Selecting state option at index 1: "${stateText}"`);
      await stateOption.click();
      await page.waitForTimeout(500);

      // Verify selection
      const selectedStateText = await stateTrigger.textContent();
      console.log(`State dropdown now shows: "${selectedStateText}"`);
    }
  }

  console.log('\n=== AFTER STATE SELECTION ===');
  await page.waitForTimeout(1000);

  // Check final form values
  const finalBillingAddressValue = await page
    .locator('input[name="billingAddress.address"]')
    .inputValue();
  const finalPostalCodeValue = await page.locator('input[name="postZipCode"]').first().inputValue();

  console.log('Final billing address input:', finalBillingAddressValue);
  console.log('Final postal code input:', finalPostalCodeValue);

  // Check final hidden inputs
  const finalHiddenInputs = await page.locator('input[type="hidden"]').count();
  console.log(`Final hidden inputs found: ${finalHiddenInputs}`);

  for (let i = 0; i < Math.min(finalHiddenInputs, 10); i++) {
    const input = page.locator('input[type="hidden"]').nth(i);
    const name = await input.getAttribute('name');
    const value = await input.inputValue();
    if (name?.includes('country') || name?.includes('state') || name?.includes('State')) {
      console.log(`  Hidden[${i}] name="${name}" value="${value}"`);
    }
  }

  // Take screenshot
  await page.screenshot({ path: 'e2e/address-dropdown-debug.png', fullPage: true });
  console.log('\nScreenshot saved to e2e/address-dropdown-debug.png');
});
