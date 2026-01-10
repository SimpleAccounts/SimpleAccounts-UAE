import { test } from '@playwright/test';
import { login } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('debug form values after filling', async ({ page }) => {
  await login(page, username, password);
  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Fill basic fields
  console.log('Filling form fields...');
  await page.fill('input[placeholder*="First Name"]', 'TestFirst');
  await page.fill('input[placeholder*="Last Name"]', 'TestLast');
  await page.fill('input[type="email"]', `test${Date.now()}@example.com`);

  // Select Contact Type - CUSTOMER
  console.log('\nSelecting Contact Type...');
  const contactTypeTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Contact Type")'),
    })
    .first();
  await contactTypeTrigger.click();
  await page.waitForTimeout(300);

  // Look for CUSTOMER option specifically
  const customerOption = page.getByRole('option', { name: 'Customer', exact: false });
  const customerExists = await customerOption.isVisible().catch(() => false);
  console.log('CUSTOMER option visible:', customerExists);

  if (customerExists) {
    await customerOption.click();
    console.log('Clicked CUSTOMER option');
  } else {
    // Just click first option
    await page.getByRole('option').first().click();
    console.log('Clicked first option');
  }
  await page.waitForTimeout(300);

  // Select Currency
  console.log('\nSelecting Currency...');
  const currencyTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Currency")'),
    })
    .first();
  await currencyTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(300);

  // Select Tax Treatment
  console.log('\nSelecting Tax Treatment...');
  const taxTreatmentTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Tax Treatment")'),
    })
    .first();
  await taxTreatmentTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();
  await page.waitForTimeout(300);

  // Wait for any validation to complete
  await page.waitForTimeout(1000);

  // Get all form values using JavaScript
  const formData = await page.evaluate(() => {
    // Get all inputs
    const firstName = (
      document.querySelector('input[placeholder*="First Name"]') as HTMLInputElement
    )?.value;
    const lastName = (document.querySelector('input[placeholder*="Last Name"]') as HTMLInputElement)
      ?.value;
    const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;

    // Get all select values from hidden inputs or data attributes
    const selects = Array.from(document.querySelectorAll('[role="combobox"]'));
    const selectValues = selects.map((select, index) => {
      const valueSpan = select.querySelector('[data-value], span');
      return {
        index,
        text: select.textContent?.trim(),
        value: (select as any).getAttribute('data-state'),
        ariaExpanded: select.getAttribute('aria-expanded'),
      };
    });

    // Look for any form error messages
    const errors = Array.from(
      document.querySelectorAll('[class*="error"], [class*="Error"], [class*="invalid"]')
    )
      .map(el => ({
        class: el.className,
        text: el.textContent?.trim(),
      }))
      .filter(e => e.text && e.text.length > 0);

    return {
      firstName,
      lastName,
      email,
      selects: selectValues,
      errors,
    };
  });

  console.log('\n=== FORM VALUES ===');
  console.log(JSON.stringify(formData, null, 2));

  // Check if required fields are marked as invalid
  const invalidFields = await page.locator('[aria-invalid="true"]').count();
  console.log('\n=== INVALID FIELDS ===');
  console.log('Number of invalid fields:', invalidFields);

  if (invalidFields > 0) {
    const invalidFieldDetails = await page.locator('[aria-invalid="true"]').evaluateAll(els => {
      return els.map(el => ({
        tagName: el.tagName,
        type: (el as HTMLInputElement).type,
        name: (el as HTMLInputElement).name,
        placeholder: (el as HTMLInputElement).placeholder,
        value: (el as HTMLInputElement).value,
      }));
    });
    console.log('Invalid field details:', JSON.stringify(invalidFieldDetails, null, 2));
  }
});
