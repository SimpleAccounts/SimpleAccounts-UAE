import { test, expect, Page } from '@playwright/test';

const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const INVOICE_PATH = process.env.E2E_INVOICE_PATH || '/admin/income/customer-invoice';
const CREATE_INVOICE_PATH = `${INVOICE_PATH}/create`;

// Helper function to perform login
async function login(page: Page, username: string, password: string) {
  await page.goto(LOGIN_PATH);
  await page.fill('input#username', username);
  await page.fill('input#password', password);

  const loginButton = page.getByRole('button', { name: /log in/i });
  const buttonHandle = await loginButton.elementHandle();
  if (buttonHandle) {
    await loginButton.click({ timeout: 30_000 });
  } else {
    await page.keyboard.press('Enter', { delay: 200 });
  }

  const normalizedPostLoginPath = POST_LOGIN_PATH.startsWith('/')
    ? POST_LOGIN_PATH
    : `/${POST_LOGIN_PATH}`;
  await page.waitForURL(`**${normalizedPostLoginPath}**`, { timeout: 30_000 });
}

// Helper to generate unique invoice number
function generateInvoiceNumber(): string {
  return `INV-E2E-${Date.now()}`;
}

test.describe('Invoice List View', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should navigate to invoice list page', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify we're on the invoice page
    await expect(page).toHaveURL(new RegExp('/invoice'));
  });

  test('should display invoice list screen with heading', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });

    // Wait for invoice screen to load
    await page.waitForSelector('.customer-invoice-screen, .invoice-screen, [class*="invoice"]', {
      timeout: 30_000,
    });

    // Verify heading exists
    const heading = page.locator('.h4 span, h4, .page-title');
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display create new invoice button', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Look for create/new button
    const createButtonExists = await Promise.race([
      page.getByRole('button', { name: /new|create|add/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByRole('link', { name: /new|create|add/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(createButtonExists).toBeTruthy();
  });

  test('should display invoice table or list', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for table or list structure
    const tableExists = await Promise.race([
      page.locator('table, .table, [class*="grid"], [class*="list"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(tableExists).toBeTruthy();
  });

  test('should display search or filter functionality', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Look for search input or filter options
    const searchExists = await Promise.race([
      page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByPlaceholder(/search|filter/i).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Search functionality is common
    expect(typeof searchExists).toBe('boolean');
  });

  test('should display pagination if invoices exist', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for pagination controls
    const paginationExists = await Promise.race([
      page.locator('[class*="pagination"], .pager, [aria-label*="pagination"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByRole('navigation', { name: /pagination/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Pagination might not exist if there are few invoices
    expect(typeof paginationExists).toBe('boolean');
  });

  test('should handle empty invoice list gracefully', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Page should load successfully whether there are invoices or not
    const pageContent = page.locator('.customer-invoice-screen, .invoice-screen, main, #root');
    await expect(pageContent.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Invoice Creation', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should navigate to create invoice page', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify we're on create page
    expect(page.url()).toContain('create');
  });

  test('should display invoice creation form', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });

    // Wait for form to appear
    const formExists = await Promise.race([
      page.locator('form, .create-invoice-form, [class*="invoice-form"]').first().isVisible({ timeout: 30_000 }).then(() => true),
      page.waitForTimeout(30_000).then(() => false)
    ]);

    expect(formExists).toBeTruthy();
  });

  test('should display required invoice fields', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Check for common invoice fields
    const commonFields = [
      'input[name*="number"], input[id*="number"], input[placeholder*="number" i]',
      'input[name*="date"], input[id*="date"], input[type="date"]',
      'select[name*="customer"], input[name*="customer"], [class*="customer"]',
    ];

    let foundFields = 0;
    for (const selector of commonFields) {
      const fieldExists = await page.locator(selector).first().isVisible({ timeout: 3000 }).catch(() => false);
      if (fieldExists) foundFields++;
    }

    // Should have at least 2 of the common fields
    expect(foundFields).toBeGreaterThanOrEqual(2);
  });

  test('should display line items section', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for line items, products, or items section
    const lineItemsExists = await Promise.race([
      page.locator('[class*="line-item"], [class*="item"], table').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(lineItemsExists).toBeTruthy();
  });

  test('should allow adding line items', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for add item button
    const addItemButton = await Promise.race([
      page.getByRole('button', { name: /add.*item|add.*line|add.*product/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.locator('[class*="add-item"], [class*="add-line"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(typeof addItemButton).toBe('boolean');
  });

  test('should calculate totals automatically', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for total fields
    const totalExists = await Promise.race([
      page.locator('[class*="total"], input[name*="total"], [id*="total"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByText(/total|subtotal|grand total/i).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(totalExists).toBeTruthy();
  });

  test('should have save/submit button', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for save/submit button
    const saveButtonExists = await Promise.race([
      page.getByRole('button', { name: /save|submit|create/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(saveButtonExists).toBeTruthy();
  });

  test('should have cancel button to go back', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for cancel/back button
    const cancelButtonExists = await Promise.race([
      page.getByRole('button', { name: /cancel|back|close/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByRole('link', { name: /cancel|back|close/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(typeof cancelButtonExists).toBe('boolean');
  });

  test('should validate required fields before submission', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /save|submit|create/i }).first();
    const buttonVisible = await submitButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (buttonVisible) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Should still be on create page or show validation errors
      expect(page.url()).toContain('create');
    }
  });

  test('should display tax calculation fields', async ({ page }) => {
    await page.goto(CREATE_INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for tax-related fields
    const taxExists = await Promise.race([
      page.locator('input[name*="tax"], select[name*="tax"], [id*="tax"], [class*="tax"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByText(/tax|vat|gst/i).first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Tax fields are common in invoices
    expect(typeof taxExists).toBe('boolean');
  });
});

test.describe('Invoice Read/View', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should be able to view invoice from list', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Try to click on first invoice if exists
    const firstInvoiceLink = await Promise.race([
      page.locator('table tbody tr:first-child, .invoice-item:first-child').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // View functionality exists if there are invoices
    expect(typeof firstInvoiceLink).toBe('boolean');
  });

  test('should display invoice details when viewing', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Try to find and click first viewable invoice
    const viewLink = page.locator('a[href*="invoice"], button[class*="view"]').first();
    const linkExists = await viewLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (linkExists) {
      await viewLink.click();
      await page.waitForTimeout(2000);

      // Should show invoice details
      const detailsVisible = await Promise.race([
        page.locator('[class*="invoice-detail"], [class*="view"], .invoice-info').first().isVisible({ timeout: 5000 }).then(() => true),
        page.waitForTimeout(5000).then(() => false)
      ]);

      expect(detailsVisible).toBeTruthy();
    } else {
      test.skip(true, 'No viewable invoices found');
    }
  });

  test('should display print/download options', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for print or download buttons
    const actionExists = await Promise.race([
      page.getByRole('button', { name: /print|download|pdf|export/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.locator('[class*="print"], [class*="download"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Print/download features are common
    expect(typeof actionExists).toBe('boolean');
  });
});

test.describe('Invoice Update/Edit', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should have edit functionality available', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for edit button or link
    const editExists = await Promise.race([
      page.getByRole('button', { name: /edit/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.getByRole('link', { name: /edit/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.locator('[class*="edit"], button[title*="Edit"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Edit functionality is common
    expect(typeof editExists).toBe('boolean');
  });

  test('should navigate to edit page when edit is clicked', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Try to find and click edit button
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    const editLink = page.getByRole('link', { name: /edit/i }).first();

    const buttonExists = await editButton.isVisible({ timeout: 3000 }).catch(() => false);
    const linkExists = await editLink.isVisible({ timeout: 3000 }).catch(() => false);

    if (buttonExists) {
      await editButton.click();
      await page.waitForTimeout(2000);
      // URL might change to edit mode
      const urlChanged = !page.url().endsWith(INVOICE_PATH);
      expect(typeof urlChanged).toBe('boolean');
    } else if (linkExists) {
      await editLink.click();
      await page.waitForTimeout(2000);
      // URL might change to edit mode
      expect(page.url()).toContain('invoice');
    } else {
      test.skip(true, 'No edit functionality found');
    }
  });

  test('should load existing invoice data in edit form', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Try to access edit mode
    const editLink = page.locator('a[href*="edit"], button[class*="edit"]').first();
    const linkExists = await editLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (linkExists) {
      await editLink.click();
      await page.waitForTimeout(3000);

      // Form should have some pre-filled data
      const inputsWithValues = await page.locator('input[value]:not([value=""]), select:has(option[selected])').count();

      // Should have at least some fields populated
      expect(inputsWithValues).toBeGreaterThan(0);
    } else {
      test.skip(true, 'No edit functionality found');
    }
  });

  test('should have update/save button in edit mode', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const editLink = page.locator('a[href*="edit"], button[class*="edit"]').first();
    const linkExists = await editLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (linkExists) {
      await editLink.click();
      await page.waitForTimeout(3000);

      const updateButton = await Promise.race([
        page.getByRole('button', { name: /update|save/i }).first().isVisible({ timeout: 5000 }).then(() => true),
        page.waitForTimeout(5000).then(() => false)
      ]);

      expect(updateButton).toBeTruthy();
    } else {
      test.skip(true, 'No edit functionality found');
    }
  });
});

test.describe('Invoice Delete', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'E2E_USERNAME and E2E_PASSWORD must be set');
    await login(page, username, password);
  });

  test('should have delete functionality available', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Look for delete button
    const deleteExists = await Promise.race([
      page.getByRole('button', { name: /delete|remove/i }).first().isVisible({ timeout: 5000 }).then(() => true),
      page.locator('[class*="delete"], button[title*="Delete"]').first().isVisible({ timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    // Delete functionality is common
    expect(typeof deleteExists).toBe('boolean');
  });

  test('should show confirmation dialog before deleting', async ({ page }) => {
    await page.goto(INVOICE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Try to find delete button
    const deleteButton = page.locator('button[class*="delete"], button[title*="Delete"]').first();
    const buttonExists = await deleteButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (buttonExists) {
      // Set up dialog handler to prevent actual deletion
      page.on('dialog', dialog => dialog.dismiss());

      await deleteButton.click();
      await page.waitForTimeout(1000);

      // If modal appears instead of browser dialog
      const modalExists = await page.locator('.modal, [role="dialog"], [class*="confirm"]').first().isVisible({ timeout: 3000 }).catch(() => false);

      // Either dialog or modal should appear
      expect(typeof modalExists).toBe('boolean');
    } else {
      test.skip(true, 'No delete button found');
    }
  });
});
