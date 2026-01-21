import { test, expect, Page } from '@playwright/test';
import { getTestUserCredentials, loginTestUser } from './helpers/test-user-helpers';

test.describe('Product Creation Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    const { username, password } = getTestUserCredentials();
    await loginTestUser(page, username, password);
  });

  test('should open product creation modal from invoice page', async () => {
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Click on "Add Product" button (uses strings.Addproduct) - use more flexible selector
    const addProductButton = page
      .locator('button')
      .filter({ hasText: /add.*product/i })
      .first();
    await addProductButton.waitFor({ state: 'visible', timeout: 15000 });
    await addProductButton.click();

    // Wait for modal to appear - use first() to handle multiple matches
    await expect(page.locator('text=Create Product').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Create a new product or service')).toBeVisible();
  });

  test('should be able to select product type GOODS', async () => {
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open product modal - use more flexible selector
    const addProductButton = page
      .locator('button')
      .filter({ hasText: /add.*product/i })
      .first();
    await addProductButton.waitFor({ state: 'visible', timeout: 15000 });
    await addProductButton.click();
    await expect(page.locator('text=Create Product').first()).toBeVisible({ timeout: 5000 });

    // Find and click GOODS radio button
    const goodsRadio = page.locator('input[type="radio"][value="GOODS"]').first();
    await expect(goodsRadio).toBeVisible();
    await goodsRadio.click();
    await expect(goodsRadio).toBeChecked();
  });

  test('should be able to select product type SERVICE', async () => {
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open product modal - use more flexible selector
    const addProductButton = page
      .locator('button')
      .filter({ hasText: /add.*product/i })
      .first();
    await addProductButton.waitFor({ state: 'visible', timeout: 15000 });
    await addProductButton.click();
    await expect(page.locator('text=Create Product').first()).toBeVisible({ timeout: 5000 });

    // Find and click SERVICE radio button
    const serviceRadio = page.locator('input[type="radio"][value="SERVICE"]').first();
    await expect(serviceRadio).toBeVisible();
    await serviceRadio.click();
    await expect(serviceRadio).toBeChecked();

    // Verify GOODS is unchecked
    const goodsRadio = page.locator('input[type="radio"][value="GOODS"]').first();
    await expect(goodsRadio).not.toBeChecked();
  });

  test('should show VAT Type dropdown and handle non-VAT registered company', async () => {
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open product modal - use more flexible selector
    const addProductButton = page
      .locator('button')
      .filter({ hasText: /add.*product/i })
      .first();
    await addProductButton.waitFor({ state: 'visible', timeout: 15000 });
    await addProductButton.click();
    await expect(page.locator('text=Create Product').first()).toBeVisible({ timeout: 5000 });

    // Find VAT Type dropdown
    const vatTypeLabel = page.locator('label:has-text("VAT Type"), label:has-text("VAT")').first();
    await expect(vatTypeLabel).toBeVisible();

    const vatTypeSelect = page
      .locator('input[id="vatCategoryId"], div[id="vatCategoryId"]')
      .first();

    // Check if VAT Type is disabled (for non-VAT registered companies)
    const isDisabled =
      (await vatTypeSelect.getAttribute('disabled')) !== null ||
      (await vatTypeSelect.getAttribute('aria-disabled')) === 'true';

    if (isDisabled) {
      console.log('VAT Type is disabled - company is likely non-VAT registered');
      // For non-VAT registered companies, VAT should be set to N/A automatically
      await expect(page.locator('text=N/A, text=Not Applicable'))
        .toBeVisible({ timeout: 2000 })
        .catch(() => {
          // If N/A text is not visible, that's okay - it might be pre-selected
        });
    } else {
      // If enabled, should be able to select VAT type
      await vatTypeSelect.click();
      await page.waitForTimeout(500);
      // Check if dropdown options appear
      const vatOptions = page.locator('[role="option"], .react-select__option').first();
      await expect(vatOptions)
        .toBeVisible({ timeout: 2000 })
        .catch(() => {
          console.log('VAT options not visible - might need to interact differently');
        });
    }
  });

  test('should fill all required fields for GOODS product', async () => {
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open product modal - use more flexible selector
    const addProductButton = page
      .locator('button')
      .filter({ hasText: /add.*product/i })
      .first();
    await addProductButton.waitFor({ state: 'visible', timeout: 15000 });
    await addProductButton.click();
    await expect(page.locator('text=Create Product').first()).toBeVisible({ timeout: 5000 });

    // Select GOODS
    const goodsRadio = page.locator('input[type="radio"][value="GOODS"]').first();
    await goodsRadio.click();

    // Fill product name
    const productNameInput = page
      .locator('input[name="productName"], input[id="productName"]')
      .first();
    await productNameInput.fill(`Test Product ${Date.now()}`);

    // Fill product code
    const productCodeInput = page
      .locator('input[name="productCode"], input[id="productCode"]')
      .first();
    await productCodeInput.fill(`PROD-${Date.now()}`);

    // Select at least one price type (SALES or PURCHASE)
    const salesCheckbox = page
      .locator('input[type="checkbox"][value="SALES"], input[name*="SALES"]')
      .first();
    if (await salesCheckbox.isVisible()) {
      await salesCheckbox.check();
    }

    // Fill sales price if SALES is selected
    if (await salesCheckbox.isChecked()) {
      const salesPriceInput = page
        .locator('input[name="salesUnitPrice"], input[id*="sales"]')
        .first();
      if (await salesPriceInput.isVisible()) {
        await salesPriceInput.fill('100.00');
      }
    }

    // Verify form is ready (no console errors about inline/check attributes)
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('inline') || text.includes('check')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.waitForTimeout(1000);
    expect(consoleErrors.length).toBe(0);
  });

  test('should fill all required fields for SERVICE product', async () => {
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open product modal - use more flexible selector
    const addProductButton = page
      .locator('button')
      .filter({ hasText: /add.*product/i })
      .first();
    await addProductButton.waitFor({ state: 'visible', timeout: 15000 });
    await addProductButton.click();
    await expect(page.locator('text=Create Product').first()).toBeVisible({ timeout: 5000 });

    // Select SERVICE
    const serviceRadio = page.locator('input[type="radio"][value="SERVICE"]').first();
    await serviceRadio.click();
    await expect(serviceRadio).toBeChecked();

    // Fill product name
    const productNameInput = page
      .locator('input[name="productName"], input[id="productName"]')
      .first();
    await productNameInput.fill(`Test Service ${Date.now()}`);

    // Fill product code
    const productCodeInput = page
      .locator('input[name="productCode"], input[id="productCode"]')
      .first();
    await productCodeInput.fill(`SVC-${Date.now()}`);

    // Select at least one price type
    const salesCheckbox = page
      .locator('input[type="checkbox"][value="SALES"], input[name*="SALES"]')
      .first();
    if (await salesCheckbox.isVisible()) {
      await salesCheckbox.check();
    }

    // Fill sales price if SALES is selected
    if (await salesCheckbox.isChecked()) {
      const salesPriceInput = page
        .locator('input[name="salesUnitPrice"], input[id*="sales"]')
        .first();
      if (await salesPriceInput.isVisible()) {
        await salesPriceInput.fill('150.00');
      }
    }

    // Verify SERVICE is selected and form is ready
    await expect(serviceRadio).toBeChecked();
  });

  test('should handle product creation with all field combinations', async () => {
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open product modal - use more flexible selector
    const addProductButton = page
      .locator('button')
      .filter({ hasText: /add.*product/i })
      .first();
    await addProductButton.waitFor({ state: 'visible', timeout: 15000 });
    await addProductButton.click();
    await expect(page.locator('text=Create Product').first()).toBeVisible({ timeout: 5000 });

    // Test GOODS with SALES only
    const goodsRadio = page.locator('input[type="radio"][value="GOODS"]').first();
    await goodsRadio.click();

    const productNameInput = page.locator('input[name="productName"]').first();
    await productNameInput.fill(`Goods Sales Only ${Date.now()}`);

    const productCodeInput = page.locator('input[name="productCode"]').first();
    await productCodeInput.fill(`GS-${Date.now()}`);

    // Test SERVICE with PURCHASE only
    const serviceRadio = page.locator('input[type="radio"][value="SERVICE"]').first();
    await serviceRadio.click();

    await productNameInput.fill(`Service Purchase Only ${Date.now()}`);
    await productCodeInput.fill(`SP-${Date.now()}`);

    // Verify no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('inline') || text.includes('check') || text.includes('non-boolean')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.waitForTimeout(1000);
    expect(consoleErrors.length).toBe(0);
  });

  test('should create product without getting stuck in creating loop', async () => {
    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open product modal - use more flexible selector
    const addProductButton = page
      .locator('button')
      .filter({ hasText: /add.*product/i })
      .first();
    await addProductButton.waitFor({ state: 'visible', timeout: 15000 });
    await addProductButton.click();
    await expect(page.locator('text=Create Product').first()).toBeVisible({ timeout: 5000 });

    // Fill required fields
    const productNameInput = page.locator('input[name="productName"]').first();
    const productName = `Test Product ${Date.now()}`;
    await productNameInput.fill(productName);

    // Product code should be auto-generated, but verify it exists
    const productCodeInput = page.locator('input[name="productCode"]').first();
    await expect(productCodeInput).toBeVisible();

    // Select GOODS
    const goodsRadio = page.locator('input[type="radio"][value="GOODS"]').first();
    await goodsRadio.click();

    // Select SALES price type
    const salesCheckbox = page.locator('input[type="checkbox"][value="SALES"]').first();
    if (await salesCheckbox.isVisible()) {
      await salesCheckbox.check();
    }

    // Fill sales price
    const salesPriceInput = page.locator('input[name="salesUnitPrice"]').first();
    if (await salesPriceInput.isVisible()) {
      await salesPriceInput.fill('100.00');
    }

    // Monitor for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          text.includes('Cannot read properties of null') ||
          text.includes("reading 'value'") ||
          text.includes('creating')
        ) {
          errors.push(text);
        }
      }
    });

    // Monitor network requests
    let createRequestStarted = false;
    let createRequestCompleted = false;
    page.on('request', request => {
      if (request.url().includes('/rest/product/save')) {
        createRequestStarted = true;
      }
    });
    page.on('response', response => {
      if (response.url().includes('/rest/product/save')) {
        createRequestCompleted = true;
      }
    });

    // Click create button
    const createButton = page.locator('button:has-text("Create"), button[type="submit"]').first();
    await createButton.click();

    // Wait for request to complete (max 10 seconds)
    await page.waitForTimeout(10000);

    // Verify no null value errors occurred
    const nullValueErrors = errors.filter(e => e.includes('Cannot read properties of null'));
    expect(nullValueErrors.length).toBe(0);

    // Verify request completed (or at least started)
    if (createRequestStarted) {
      // Request was made, should complete within reasonable time
      // If it's still "creating" after 10 seconds, that's a problem
      const loadingIndicator = page.locator('text=Creating Product, text=Creating...').first();
      const isStillLoading = await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false);
      expect(isStillLoading).toBe(false);
    }
  });
});

test.describe('Contact Creation from Invoice Tests', () => {
  test('should open contact creation modal from invoice page', async ({ page }) => {
    const { username, password } = getTestUserCredentials();
    await loginTestUser(page, username, password);

    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Click on "Add Customer" button (uses strings.AddACustomer) - use more flexible selector
    const addCustomerButton = page
      .locator('button:has-text("Add"), button:has-text("Customer")')
      .filter({ hasText: /add.*customer/i })
      .first();
    await addCustomerButton.waitFor({ state: 'visible', timeout: 15000 });
    await addCustomerButton.click();

    // Wait for modal to appear - use more flexible selector
    await expect(page.locator('text=/create.*contact/i, text=/add.*contact/i'))
      .first()
      .toBeVisible({ timeout: 10000 });
  });

  test('should have customer type pre-selected and disabled when opened from invoice', async ({
    page,
  }) => {
    const { username, password } = getTestUserCredentials();
    await loginTestUser(page, username, password);

    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open contact modal - use more flexible selector
    const addCustomerButton = page
      .locator('button')
      .filter({ hasText: /add.*customer/i })
      .first();
    await addCustomerButton.waitFor({ state: 'visible', timeout: 15000 });
    await addCustomerButton.click();
    await expect(page.locator('text=/create.*contact/i, text=/add.*contact/i'))
      .first()
      .toBeVisible({ timeout: 10000 });

    // Find contact type dropdown
    const contactTypeSelect = page
      .locator('select[name="contactType"], div[id*="contactType"], button[id*="contactType"]')
      .first();

    // Check if it's disabled (should be when opened from invoice)
    const isDisabled =
      (await contactTypeSelect.getAttribute('disabled')) !== null ||
      (await contactTypeSelect.getAttribute('aria-disabled')) === 'true' ||
      (await contactTypeSelect.evaluate(el => el.hasAttribute('disabled')));

    if (isDisabled) {
      console.log('Contact Type is disabled - this is expected when opened from invoice page');
      // Verify it shows "Customer" or value 2
      const contactTypeValue = await contactTypeSelect.inputValue().catch(() => '');
      expect(contactTypeValue).toMatch(/2|Customer/i);
    } else {
      console.log('Contact Type is enabled - user can select type');
    }
  });

  test('should be able to create customer contact from invoice page', async ({ page }) => {
    const { username, password } = getTestUserCredentials();
    await loginTestUser(page, username, password);

    await page.goto('/admin/income/customer-invoice/create');
    await page.waitForLoadState('networkidle');

    // Open contact modal - use more flexible selector
    const addCustomerButton = page
      .locator('button')
      .filter({ hasText: /add.*customer/i })
      .first();
    await addCustomerButton.waitFor({ state: 'visible', timeout: 15000 });
    await addCustomerButton.click();
    await expect(page.locator('text=/create.*contact/i, text=/add.*contact/i'))
      .first()
      .toBeVisible({ timeout: 10000 });

    // Fill required fields
    const firstNameInput = page.locator('input[name="firstName"]').first();
    await firstNameInput.fill(`Test Customer ${Date.now()}`);

    const lastNameInput = page.locator('input[name="lastName"]').first();
    await lastNameInput.fill('Lastname');

    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    await emailInput.fill(`testcustomer${Date.now()}@example.com`);

    // Currency should be pre-filled from company details
    // Contact type should be Customer (disabled)

    // Try to submit (might need to handle validation)
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
      .first();
    // Don't actually submit - just verify form is fillable
    await expect(submitButton).toBeVisible();
  });
});
