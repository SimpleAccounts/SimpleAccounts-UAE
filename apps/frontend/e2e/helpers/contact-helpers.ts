import { Page } from '@playwright/test';

/**
 * Create a contact via API (faster and more reliable than UI)
 * Returns the contact ID if successful, null otherwise
 */
export async function createContactViaAPI(
  page: Page,
  firstName: string,
  lastName: string,
  email: string,
  options?: {
    contactType?: number; // 1=Supplier, 2=Customer
    organization?: string;
  }
): Promise<number | null> {
  const contactType = options?.contactType || 2; // Default to Customer
  const organization = options?.organization || '';

  const createPayload = {
    firstName,
    lastName,
    email,
    middleName: '',
    mobileNumber: '',
    telephone: '',
    website: '',
    organization,
    contactType,
    currencyCode: 150, // AED
    taxTreatmentId: 7, // Out of Scope (no VAT number required)
    isActive: true,
    vatRegistrationNumber: '',
    billingAddress: {
      address: '',
      city: '',
      countryId: 229, // UAE
      stateId: null,
      postZipCode: '',
      telephone: '',
      fax: '',
      email: '',
    },
    shippingAddress: {
      address: '',
      city: '',
      countryId: 229,
      stateId: null,
      postZipCode: '',
      telephone: '',
      fax: '',
    },
    isBillingAndShippingAddressSame: true,
  };

  const result = await page.evaluate(async payload => {
    const baseUrl = window.location.origin.replace(':3000', ':8080');
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${baseUrl}/rest/contact/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const status = response.status;
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
      return { status, data, error: null };
    } catch (err: any) {
      return { status: 0, data: null, error: err.message };
    }
  }, createPayload);

  if (result.status === 200 && result.data) {
    const contactId = result.data.id || result.data.contactId;
    console.log(`✓ Contact created via API: ${firstName} ${lastName} (ID: ${contactId})`);
    return contactId;
  } else {
    console.log(
      `✗ Failed to create contact via API: ${result.error || JSON.stringify(result.data).substring(0, 100)}`
    );
    return null;
  }
}

/**
 * Delete a contact via API
 */
export async function deleteContactViaAPI(page: Page, contactId: number): Promise<boolean> {
  const result = await page.evaluate(async id => {
    const baseUrl = window.location.origin.replace(':3000', ':8080');
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${baseUrl}/rest/contact/delete?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return { status: response.status, error: null };
    } catch (err: any) {
      return { status: 0, error: err.message };
    }
  }, contactId);

  if (result.status === 200) {
    console.log(`✓ Contact deleted via API (ID: ${contactId})`);
    return true;
  } else {
    console.log(`✗ Failed to delete contact via API: ${result.error}`);
    return false;
  }
}

/**
 * Helper function to select an option from a shadcn/ui Select by label text
 */
async function selectDropdownByLabel(
  page: Page,
  labelText: string,
  optionText: string | RegExp,
  useFirstOption: boolean = false
) {
  // Find the FormItem container that has the label
  const formItem = page
    .locator(`div:has(> label:text-is("${labelText}")), div:has(> label:has-text("${labelText}"))`)
    .first();

  // Find the combobox (Select trigger) within this form item
  const trigger = formItem.getByRole('combobox').first();

  const triggerExists = await trigger.isVisible({ timeout: 3000 }).catch(() => false);

  if (!triggerExists) {
    // Fallback: try to find by looking for the label and then the next combobox
    const label = page.locator(`label:has-text("${labelText}")`).first();
    const labelExists = await label.isVisible({ timeout: 2000 }).catch(() => false);
    if (labelExists) {
      // Find the nearest combobox
      const nearbyTrigger = page
        .locator(
          `label:has-text("${labelText}") ~ button[role="combobox"], label:has-text("${labelText}") + * button[role="combobox"]`
        )
        .first();
      const nearbyExists = await nearbyTrigger.isVisible({ timeout: 2000 }).catch(() => false);
      if (nearbyExists) {
        await nearbyTrigger.click();
        await page.waitForTimeout(500);
      }
    }
    return;
  }

  await trigger.click();
  await page.waitForTimeout(500);

  if (useFirstOption) {
    const firstOption = page.getByRole('option').first();
    const optionVisible = await firstOption.isVisible({ timeout: 2000 }).catch(() => false);
    if (optionVisible) {
      await firstOption.click();
      await page.waitForTimeout(300);
    }
  } else {
    const option =
      typeof optionText === 'string'
        ? page.getByRole('option', { name: optionText })
        : page.getByRole('option', { name: optionText });
    const optionVisible = await option.isVisible({ timeout: 2000 }).catch(() => false);
    if (optionVisible) {
      await option.click();
      await page.waitForTimeout(300);
    } else {
      // Close dropdown if option not found
      await page.keyboard.press('Escape');
    }
  }
}

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
  // Get all comboboxes and select by position - Contact Type is typically the first
  const allComboboxes = page.getByRole('combobox');
  const comboboxCount = await allComboboxes.count();

  if (comboboxCount >= 1) {
    const contactTypeTrigger = allComboboxes.nth(0);
    const triggerVisible = await contactTypeTrigger.isVisible({ timeout: 2000 }).catch(() => false);

    if (triggerVisible) {
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
      } else {
        // Try exact text match
        const exactOption = page.getByRole('option', { name: contactType });
        const exactVisible = await exactOption.isVisible({ timeout: 1000 }).catch(() => false);
        if (exactVisible) {
          await exactOption.click();
          await page.waitForTimeout(300);
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
  }

  // REQUIRED: Select Currency - Now using shadcn/ui Select (typically the second combobox)
  if (comboboxCount >= 2) {
    const currencyTrigger = allComboboxes.nth(1);
    const currencyVisible = await currencyTrigger.isVisible({ timeout: 2000 }).catch(() => false);

    if (currencyVisible) {
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
      } else {
        await page.keyboard.press('Escape');
      }
    }
  }

  // REQUIRED: Select Tax Treatment - Now using shadcn/ui Select (typically the third combobox)
  // Note: Tax treatments 1, 3, 5 require 15-digit VAT registration number
  // We'll select a non-VAT treatment to avoid that requirement
  if (comboboxCount >= 3) {
    const taxTreatmentTrigger = allComboboxes.nth(2);
    const taxVisible = await taxTreatmentTrigger.isVisible({ timeout: 2000 }).catch(() => false);

    if (taxVisible) {
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
        } else {
          await page.keyboard.press('Escape');
        }
      }

      // CRITICAL: Wait for tax treatment selection to trigger resetCountryList()
      // This function populates the country dropdown options which start as empty []
      // Wait longer to ensure country list is populated before proceeding to address section
      await page.waitForTimeout(1500);
    }
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
  const addressComboboxes = page.getByRole('combobox');
  const addressComboboxCount = await addressComboboxes.count();

  if (addressComboboxCount > 3) {
    const countryTrigger = addressComboboxes.nth(3);
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

  // CHECK "Shipping Address Is Same As Billing Address" to skip shipping validation
  // When checked (true), shipping address validation is skipped
  await page.waitForTimeout(500);

  // The checkbox has id="shipping-same-as-billing"
  const checkbox = page.locator('#shipping-same-as-billing');
  const isCheckboxVisible = await checkbox.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Same as Billing checkbox visible:', isCheckboxVisible);

  if (isCheckboxVisible) {
    // Check if checkbox is already checked
    const isChecked = await checkbox.getAttribute('data-state');
    console.log('Checkbox current state:', isChecked);

    // If not checked, click to check it
    if (isChecked !== 'checked') {
      console.log('Checking the "Same as Billing" checkbox...');
      await checkbox.click();
      await page.waitForTimeout(500);

      // Verify the checkbox was checked
      const newState = await checkbox.getAttribute('data-state');
      console.log('Checkbox state after click:', newState);
    }
  } else {
    // Fallback: click on the label
    console.log('Trying to click on checkbox label...');
    const label = page.locator('label[for="shipping-same-as-billing"]');
    if (await label.isVisible({ timeout: 1000 }).catch(() => false)) {
      await label.click();
      await page.waitForTimeout(500);
    }
  }

  // Submit form - click the exact "Create" button (not "Create and More")
  // Look for the button that has exactly "Create" text or use data-testid if available
  const createButton = page.getByRole('button', { name: /^Create$/i }).first();

  // Take screenshot before submission for debugging
  await page.screenshot({ path: 'test-results/contact-before-submit.png', fullPage: true });

  // Debug: List all buttons with "Create" in the name
  const buttons = await page.locator('button:has-text("Create")').all();
  console.log(`Found ${buttons.length} buttons with "Create" text`);
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    console.log(`  Button ${i}: "${text}"`);
  }

  console.log('Clicking Create button...');

  // Scroll the button into view first
  await createButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Setup network listener to detect API calls and responses
  const apiCalls: string[] = [];
  let saveResponse: { status: number; body: string } | null = null;

  page.on('request', request => {
    if (request.url().includes('/rest/') || request.url().includes('/api/')) {
      apiCalls.push(`${request.method()} ${request.url()}`);
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/rest/contact/save')) {
      try {
        const body = await response.text();
        saveResponse = { status: response.status(), body: body.substring(0, 500) };
        console.log(
          `Save API response: status=${response.status()}, body=${body.substring(0, 200)}`
        );
      } catch (e) {
        saveResponse = { status: response.status(), body: 'Could not read response' };
      }
    }
  });

  // Click with force to bypass any overlay issues
  console.log('About to click Create button...');
  await createButton.click({ force: true });
  console.log('Create button clicked');

  // Wait a bit for any form processing
  await page.waitForTimeout(3000);

  // Log any API calls that were made
  if (apiCalls.length > 0) {
    console.log('API calls made after click:', apiCalls);
  } else {
    console.log('No API calls detected after clicking Create');
  }

  // Take screenshot after click to see form state
  await page.screenshot({ path: 'test-results/contact-after-click.png', fullPage: true });

  // Check for ACTUAL validation errors (FormMessage components, not just asterisks)
  // FormMessage uses: p with text-[0.8rem] font-medium text-destructive
  const actualErrors = await page.locator('p.text-destructive').allTextContents();
  const filteredErrors = actualErrors.filter(
    e => e.trim() && e.trim() !== '*' && e.trim().length > 2
  );
  if (filteredErrors.length > 0) {
    console.log('Actual validation errors:', filteredErrors);
  } else {
    console.log('No validation errors found (only asterisks for required fields)');
  }

  // Check form state via JavaScript
  const formState = await page.evaluate(() => {
    // Try to access React form state (if exposed)
    const reactRoot = document.getElementById('root');
    if (reactRoot && (reactRoot as any).__reactFiber$) {
      // Form state may be accessible
    }
    return {
      url: window.location.href,
      hasErrorElements: document.querySelectorAll('.text-destructive, .text-red-500').length,
    };
  });
  console.log('Page state:', formState);

  // Wait for either navigation (success) or stay on page (error)
  const currentUrl = page.url();
  console.log('Current URL after click:', currentUrl);

  try {
    // Wait for either: redirect to list, or redirect to detail page, or URL change
    await Promise.race([
      page.waitForURL('**/contact', { timeout: 10000 }),
      page.waitForURL('**/contact/detail/**', { timeout: 10000 }),
      page.waitForURL(url => url.toString() !== currentUrl, { timeout: 10000 }),
    ]);
    console.log('✓ Contact form submitted successfully, new URL:', page.url());
  } catch {
    // Check if the API call was successful even if navigation didn't happen
    if (saveResponse && saveResponse.status === 200) {
      console.log('✓ Contact created via API (status 200), but page did not navigate');
      console.log('  Manually navigating to contact list...');
      // The contact was created successfully, just navigate to list
    } else {
      console.log('⚠️ Form submission might have failed - URL did not change');
      console.log('Current URL:', page.url());
      await page.screenshot({ path: 'test-results/contact-validation-error.png', fullPage: true });

      // Check for actual validation error messages (FormMessage components show errors)
      const errorMessages = await page
        .locator('[class*="FormMessage"], .text-destructive, [role="alert"]')
        .allTextContents();
      if (errorMessages.length > 0) {
        console.log('Form validation errors:', errorMessages);
      }
    }
  }

  await page.waitForTimeout(1000);
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

  // Wait for page to stabilize
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

  // Wait for table to be visible
  await page.locator('table').waitFor({ state: 'visible', timeout: 15000 });

  // Wait for table body to have content (might be empty or have data)
  await page.waitForTimeout(2000);

  // Wait for at least one row in the table body (meaning data is loaded)
  try {
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // No rows might be OK if the list is empty
    console.log('Note: Contact list table has no rows');
  }

  await page.waitForTimeout(1000);
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
  // First, wait for the table to be visible
  try {
    await page.locator('table').waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    return false;
  }

  // Check if the identifier appears anywhere in the table body
  const tableBody = page.locator('table tbody');
  const cellWithText = tableBody.getByText(identifier, { exact: false });

  return cellWithText.isVisible({ timeout: 5000 }).catch(() => false);
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
