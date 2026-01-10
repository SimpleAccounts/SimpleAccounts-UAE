import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug contact creation flow', async ({ page }) => {
  await login(page, username, password);

  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Fill basic fields
  console.log('Filling First Name...');
  await page.fill('input[placeholder*="First Name"]', 'John');

  console.log('Filling Last Name...');
  await page.fill('input[placeholder*="Last Name"]', 'Doe');

  console.log('Filling Email...');
  await page.fill('input[type="email"]', `test${Date.now()}@example.com`);

  // Try Contact Type dropdown
  console.log('\nTrying Contact Type dropdown...');
  const contactTypeTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Contact Type")'),
    })
    .first();

  const contactTypeTriggerExists = await contactTypeTrigger
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  console.log('Contact Type trigger visible:', contactTypeTriggerExists);

  if (contactTypeTriggerExists) {
    await contactTypeTrigger.click();
    await page.waitForTimeout(500);

    // Check for options
    const options = page.getByRole('option');
    const optionCount = await options.count();
    console.log('Number of options:', optionCount);

    if (optionCount > 0) {
      const firstOption = await options.first().textContent();
      console.log('First option text:', firstOption);
      await options.first().click();
      await page.waitForTimeout(300);
      console.log('Clicked first option');
    }
  }

  // Try Currency dropdown
  console.log('\nTrying Currency dropdown...');
  const currencyTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Currency")'),
    })
    .first();

  const currencyTriggerExists = await currencyTrigger
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  console.log('Currency trigger visible:', currencyTriggerExists);

  if (currencyTriggerExists) {
    await currencyTrigger.click();
    await page.waitForTimeout(500);

    const options = page.getByRole('option');
    const optionCount = await options.count();
    console.log('Number of currency options:', optionCount);

    if (optionCount > 0) {
      await options.first().click();
      await page.waitForTimeout(300);
      console.log('Clicked currency');
    }
  }

  // Try Tax Treatment dropdown
  console.log('\nTrying Tax Treatment dropdown...');
  const taxTreatmentTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Tax Treatment")'),
    })
    .first();

  const taxTreatmentTriggerExists = await taxTreatmentTrigger
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  console.log('Tax Treatment trigger visible:', taxTreatmentTriggerExists);

  if (taxTreatmentTriggerExists) {
    await taxTreatmentTrigger.click();
    await page.waitForTimeout(500);

    const options = page.getByRole('option');
    const optionCount = await options.count();
    console.log('Number of tax treatment options:', optionCount);

    if (optionCount > 0) {
      await options.first().click();
      await page.waitForTimeout(300);
      console.log('Clicked tax treatment');
    }
  }

  // Check for submit button
  console.log('\nLooking for submit button...');
  const saveButton = page.getByRole('button', { name: /save|create|submit/i }).first();
  const saveButtonVisible = await saveButton.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Save button visible:', saveButtonVisible);

  if (saveButtonVisible) {
    const saveButtonText = await saveButton.textContent();
    console.log('Save button text:', saveButtonText);

    const isDisabled = await saveButton.isDisabled().catch(() => false);
    console.log('Save button disabled:', isDisabled);

    // Take screenshot before clicking
    await page.screenshot({ path: 'e2e/before-submit.png', fullPage: true });
    console.log('Screenshot saved to e2e/before-submit.png');

    if (!isDisabled) {
      console.log('Clicking save button...');
      await saveButton.click();
      await page.waitForTimeout(2000);
      console.log('Clicked save button');
      console.log('Current URL:', page.url());
    }
  } else {
    // Take screenshot if button not found
    await page.screenshot({ path: 'e2e/no-submit-button.png', fullPage: true });
    console.log('Screenshot saved to e2e/no-submit-button.png');
  }
});
