import { Page } from '@playwright/test';

/**
 * Helper to create a test contact with all required fields
 */
export async function createTestContact(
  page: Page,
  firstName: string,
  lastName: string,
  email: string,
  options?: {
    contactType?: 'CUSTOMER' | 'SUPPLIER';
    phone?: string;
    organization?: string;
  }
) {
  const contactType = options?.contactType || 'CUSTOMER';

  await page.goto('/admin/master/contact/create', { waitUntil: 'networkidle' });

  // Wait for page to be fully loaded - wait for Create Contact heading
  await page.waitForSelector('span:has-text("Create Contact")', { timeout: 10000 });
  await page.waitForTimeout(2000); // Additional wait for react-select components to initialize

  // Fill required fields - First Name, Last Name, Email
  await page.fill('input[placeholder*="First Name"]', firstName);
  await page.fill('input[placeholder*="Last Name"]', lastName);
  await page.fill('input[type="email"]', email);

  // REQUIRED: Select Contact Type (CUSTOMER/SUPPLIER) - Now using shadcn/ui Select
  // Click the select trigger to open dropdown
  const contactTypeTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Contact Type")'),
    })
    .first();

  const contactTypeTriggerExists = await contactTypeTrigger
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (contactTypeTriggerExists) {
    await contactTypeTrigger.click();
    await page.waitForTimeout(500);

    // Click the option from the dropdown - use case-insensitive matching
    const contactOption = page.getByRole('option', { name: new RegExp(`^${contactType}$`, 'i') });
    const contactOptionVisible = await contactOption
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (contactOptionVisible) {
      await contactOption.click();
      await page.waitForTimeout(300);
    }
  }

  // REQUIRED: Select Currency - Now using shadcn/ui Select
  const currencyTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Currency")'),
    })
    .first();

  const currencyTriggerExists = await currencyTrigger
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (currencyTriggerExists) {
    await currencyTrigger.click();
    await page.waitForTimeout(500);

    // Select first currency option (usually AED)
    const firstCurrencyOption = page.getByRole('option').first();
    const currencyOptionVisible = await firstCurrencyOption
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (currencyOptionVisible) {
      await firstCurrencyOption.click();
      await page.waitForTimeout(300);
    }
  }

  // REQUIRED: Select Tax Treatment - Now using shadcn/ui Select
  // Note: Tax treatments 1, 3, 5 require 15-digit VAT registration number
  // We'll select a non-VAT treatment to avoid that requirement
  const taxTreatmentTrigger = page
    .getByRole('combobox')
    .filter({
      has: page.locator('span:has-text("Select Tax Treatment")'),
    })
    .first();

  const taxTreatmentTriggerExists = await taxTreatmentTrigger
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (taxTreatmentTriggerExists) {
    await taxTreatmentTrigger.click();
    await page.waitForTimeout(500);

    // Try to find "Unregistered" or similar non-VAT option
    // Common options: "Unregistered", "Out of Scope", "Exempt"
    const unregisteredOption = page.getByRole('option', {
      name: /unregistered|out of scope|exempt|non-registered/i,
    });
    const unregisteredExists = await unregisteredOption
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (unregisteredExists) {
      await unregisteredOption.click();
      await page.waitForTimeout(300);
    } else {
      // Fallback: select second option (index 1) which is less likely to be VAT-registered
      const secondOption = page.getByRole('option').nth(1);
      const secondOptionVisible = await secondOption
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (secondOptionVisible) {
        await secondOption.click();
        await page.waitForTimeout(300);
      }
    }

    // CRITICAL: Wait for tax treatment selection to trigger resetCountryList()
    // This function populates the country dropdown options which start as empty []
    // Wait longer to ensure country list is populated before proceeding to address section
    await page.waitForTimeout(1500);
  }

  // Optional fields
  if (options?.phone) {
    const phoneInput = page.locator('input[type="tel"], input[name*="phone"]').first();
    const phoneVisible = await phoneInput.isVisible({ timeout: 2000 }).catch(() => false);
    if (phoneVisible) {
      await phoneInput.fill(options.phone);
    }
  }

  if (options?.organization) {
    const orgInput = page.locator('input[name*="organization"], input[name*="company"]').first();
    const orgVisible = await orgInput.isVisible({ timeout: 2000 }).catch(() => false);
    if (orgVisible) {
      await orgInput.fill(options.organization);
    }
  }

  // REQUIRED: Fill address fields (billing and shipping)
  // The form validates these fields, so we need to fill them with minimal data
  await page.waitForTimeout(500);

  // Scroll down to address section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  // Strategy: Fill billing address completely, then use the "Same as Billing" checkbox trick
  // Clicking the checkbox when it's unchecked (changing from false to true) will actually
  // trigger onCheckedChange with checked=false when we click it again to uncheck it,
  // which copies billing address to shipping address automatically

  // Fill billing address - use name attribute
  const billingAddressInput = page.locator('input[name="billingAddress.address"]');
  if (await billingAddressInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await billingAddressInput.fill('Test Address 123');
    await page.waitForTimeout(300);
  }

  // Fill postal code - ZipCodeInput uses name="postZipCode" without prefix
  // Use .first() to get billing postal code (shipping would be .last() or .nth(1))
  const postalCodeInput = page.locator('input[name="postZipCode"]').first();
  if (await postalCodeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await postalCodeInput.fill('12345');
    await page.waitForTimeout(300);
  }

  // Select country dropdown - 4th combobox (index 3) based on our findings
  // IMPORTANT: Country options are populated by resetCountryList() after tax treatment selection
  // Re-count comboboxes after previous selections to get accurate index
  await page.waitForTimeout(500);
  const allComboboxes = page.getByRole('combobox');
  const comboboxCount = await allComboboxes.count();

  if (comboboxCount > 3) {
    const countryTrigger = allComboboxes.nth(3);
    if (await countryTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countryTrigger.click();
      await page.waitForTimeout(800);

      // Wait for country options to appear (with retry logic)
      let countryOptionsAvailable = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const optionCount = await page.getByRole('option').count();
        if (optionCount > 0) {
          countryOptionsAvailable = true;
          break;
        }
        await page.waitForTimeout(500);
      }

      if (countryOptionsAvailable) {
        // Select second country option (first is usually "Select Country" placeholder)
        // nth(1) = second option, which is typically UAE
        const countryOption = page.getByRole('option').nth(1);
        if (await countryOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await countryOption.click();
          await page.waitForTimeout(1000); // Longer wait for state/emirate dropdown to populate
        }
      } else {
        console.warn('⚠️ Country dropdown options not available after waiting');
      }
    }
  }

  // Select state/emirate dropdown - 5th combobox (index 4)
  // Re-count after country selection as the page may have updated
  await page.waitForTimeout(500);
  const updatedComboboxCount = await page.getByRole('combobox').count();

  if (updatedComboboxCount > 4) {
    const stateTrigger = page.getByRole('combobox').nth(4);
    if (await stateTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stateTrigger.click();
      await page.waitForTimeout(800);

      // Wait for state options to appear (with retry logic)
      let stateOptionsAvailable = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const optionCount = await page.getByRole('option').count();
        if (optionCount > 0) {
          stateOptionsAvailable = true;
          break;
        }
        await page.waitForTimeout(500);
      }

      if (stateOptionsAvailable) {
        // Select second state/emirate option (first is usually placeholder)
        // nth(1) = second option, which is typically the first actual state/emirate
        const stateOption = page.getByRole('option').nth(1);
        if (await stateOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await stateOption.click();
          await page.waitForTimeout(500);
        }
      } else {
        console.warn('⚠️ State dropdown options not available after waiting');
      }
    }
  }

  // AUTO-COPY BILLING TO SHIPPING using checkbox trick
  // The form's checkbox logic: when unchecked (checked=false), it copies billing to shipping
  // So we'll check it first, then uncheck it to trigger the copy
  await page.waitForTimeout(500);

  const sameAsCheckbox = page.getByText('Shipping Address Is Same As Billing Address', {
    exact: false,
  });
  if (await sameAsCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Check the checkbox first (if not already checked)
    await sameAsCheckbox.click({ force: true });
    await page.waitForTimeout(300);

    // Then uncheck it - this triggers onCheckedChange with checked=false
    // which executes: setValue('shippingAddress', watchedValues.billingAddress)
    // This automatically copies all billing address fields to shipping
    await sameAsCheckbox.click({ force: true });
    await page.waitForTimeout(500);
  }

  // Submit form
  await page
    .getByRole('button', { name: /save|create|submit/i })
    .first()
    .click();
  await page.waitForTimeout(2000);
}

/**
 * Helper to login to the application
 */
export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.fill('input#email-input', username);
  await page.fill('input#password-input', password);

  const loginButton = page.getByRole('button', { name: /log in/i });
  await loginButton.click({ timeout: 30_000 });

  await page.waitForURL('**/admin/**', { timeout: 30_000 });
}

/**
 * Helper to navigate to contact list
 */
export async function goToContactList(page: Page) {
  await page.goto('/admin/master/contact', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

/**
 * Helper to open edit form for first contact in list
 */
export async function openEditFormForFirstContact(page: Page) {
  const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
  await actionsButton.click();
  await page.waitForTimeout(500);

  const editMenuItem = page.getByRole('menuitem', { name: 'Edit' });
  await editMenuItem.waitFor({ state: 'visible', timeout: 10000 });
  await editMenuItem.click();
  await page.waitForTimeout(2000);
}

/**
 * Helper to check if contact exists in list
 */
export async function contactExistsInList(page: Page, identifier: string): Promise<boolean> {
  return page
    .getByText(identifier)
    .isVisible({ timeout: 5000 })
    .catch(() => false);
}

/**
 * Helper to get row count in contact table
 */
export async function getContactTableRowCount(page: Page): Promise<number> {
  const rows = page.locator('table tbody tr');
  return rows.count();
}

/**
 * Helper to check if table has "No results" message
 */
export async function hasNoResults(page: Page): Promise<boolean> {
  return page
    .getByText('No results')
    .isVisible({ timeout: 2000 })
    .catch(() => false);
}
