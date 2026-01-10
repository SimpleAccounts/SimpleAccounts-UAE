import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug step-by-step form filling', async ({ page }) => {
  // Capture API calls
  const apiCalls: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/rest/contact/save')) {
      apiCalls.push(`POST ${request.url()}`);
    }
  });

  await login(page, username, password);
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('\n=== STEP 1: Fill basic fields ===');
  await page.fill('input[placeholder*="First Name"]', 'StepTest');
  await page.fill('input[placeholder*="Last Name"]', 'User');
  await page.fill('input[type="email"]', `steptest${Date.now()}@example.com`);
  console.log('✓ Filled first name, last name, email');

  console.log('\n=== STEP 2: Select Contact Type ===');
  const contactTypeTrigger = page.getByRole('combobox').nth(0);
  await contactTypeTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: /customer/i }).click();
  await page.waitForTimeout(300);
  console.log('✓ Selected contact type');

  console.log('\n=== STEP 3: Select Currency ===');
  const currencyTrigger = page.getByRole('combobox').nth(1);
  await currencyTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(300);
  console.log('✓ Selected currency');

  console.log('\n=== STEP 4: Select Tax Treatment ===');
  const taxTrigger = page.getByRole('combobox').nth(2);
  await taxTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(500);
  console.log('✓ Selected tax treatment');

  // Scroll to address section
  console.log('\n=== STEP 5: Scroll to address section ===');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  console.log('\n=== STEP 6: Fill billing address ===');
  const billingAddress = page.locator('input[name="billingAddress.address"]');
  const addressVisible = await billingAddress.isVisible().catch(() => false);
  console.log(`Billing address input visible: ${addressVisible}`);
  if (addressVisible) {
    await billingAddress.fill('Test Street 123');
    console.log('✓ Filled billing address');
  }

  console.log('\n=== STEP 7: Fill postal code ===');
  const postalCode = page.locator('input[name="postZipCode"]').first();
  const postalVisible = await postalCode.isVisible().catch(() => false);
  console.log(`Postal code input visible: ${postalVisible}`);
  if (postalVisible) {
    await postalCode.fill('12345');
    console.log('✓ Filled postal code');
  }

  console.log('\n=== STEP 8: Select country ===');
  const allComboboxes = page.getByRole('combobox');
  const comboboxCount = await allComboboxes.count();
  console.log(`Total comboboxes: ${comboboxCount}`);

  if (comboboxCount > 3) {
    const countryTrigger = allComboboxes.nth(3);
    const countryVisible = await countryTrigger.isVisible().catch(() => false);
    console.log(`Country dropdown visible: ${countryVisible}`);
    if (countryVisible) {
      await countryTrigger.click();
      await page.waitForTimeout(300);
      const optionsCount = await page.getByRole('option').count();
      console.log(`Country options available: ${optionsCount}`);
      if (optionsCount > 0) {
        await page.getByRole('option').first().click();
        await page.waitForTimeout(500);
        console.log('✓ Selected country');
      }
    }
  }

  console.log('\n=== STEP 9: Select state/emirate ===');
  if (comboboxCount > 4) {
    const stateTrigger = allComboboxes.nth(4);
    const stateVisible = await stateTrigger.isVisible().catch(() => false);
    console.log(`State dropdown visible: ${stateVisible}`);
    if (stateVisible) {
      await stateTrigger.click();
      await page.waitForTimeout(300);
      const optionsCount = await page.getByRole('option').count();
      console.log(`State options available: ${optionsCount}`);
      if (optionsCount > 0) {
        await page.getByRole('option').first().click();
        await page.waitForTimeout(300);
        console.log('✓ Selected state');
      }
    }
  }

  // Check form state before submit
  console.log('\n=== FORM STATE BEFORE SUBMIT ===');
  const invalidFieldCount = await page.locator('[aria-invalid="true"]').count();
  console.log(`Invalid fields: ${invalidFieldCount}`);

  const errorMessages = await page.locator('[class*="error"], .text-red-500').allTextContents();
  const nonEmptyErrors = errorMessages.filter(msg => msg.trim() && msg.trim() !== '*');
  if (nonEmptyErrors.length > 0) {
    console.log('Error messages:', nonEmptyErrors);
  } else {
    console.log('No visible error messages');
  }

  console.log('\n=== STEP 10: Click submit ===');
  const submitButton = page.getByRole('button', { name: /save|create|submit/i }).first();
  const submitVisible = await submitButton.isVisible().catch(() => false);
  const submitDisabled = await submitButton.isDisabled().catch(() => false);
  console.log(`Submit button - Visible: ${submitVisible}, Disabled: ${submitDisabled}`);

  if (submitVisible && !submitDisabled) {
    await submitButton.click();
    console.log('✓ Clicked submit button');
    await page.waitForTimeout(3000);

    console.log('\n=== AFTER SUBMIT ===');
    console.log(`Current URL: ${page.url()}`);
    console.log(`API calls made: ${apiCalls.length}`);
    if (apiCalls.length > 0) {
      apiCalls.forEach(call => console.log(`  - ${call}`));
    }

    // Check for error messages after submit
    const postSubmitErrors = await page
      .locator('[class*="error"], .text-red-500, [role="alert"]')
      .allTextContents();
    const nonEmptyPostErrors = postSubmitErrors.filter(msg => msg.trim() && msg.trim() !== '*');
    if (nonEmptyPostErrors.length > 0) {
      console.log('Post-submit error messages:');
      nonEmptyPostErrors.forEach(err => console.log(`  - ${err}`));
    }
  }

  // Take screenshot
  await page.screenshot({ path: 'e2e/step-by-step-final.png', fullPage: true });
  console.log('\nScreenshot saved to e2e/step-by-step-final.png');
});
